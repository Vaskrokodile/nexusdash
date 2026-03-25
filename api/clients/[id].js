import jwt from 'jsonwebtoken';
import { supabase } from '../../supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus-dash-secret-key-change-in-production';

function authenticate(req, res, callback) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    callback();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Client ID required' });
  }

  if (req.method === 'GET') {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.json({ client });
  }

  if (req.method === 'PUT') {
    authenticate(req, res, async () => {
      const { name, company, email, accentColor, status, metrics } = req.body;

      const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const updates = {};
      if (name) updates.name = name;
      if (company) updates.company = company;
      if (email) updates.email = email;
      if (accentColor) updates.accent_color = accentColor;
      if (status) updates.status = status;
      if (metrics) {
        updates.metrics = metrics;
      }

      const { data: updatedClient, error: updateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      return res.json({ client: updatedClient });
    });
    return;
  }

  if (req.method === 'DELETE') {
    authenticate(req, res, async () => {
      const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      await supabase.from('users').delete().eq('client_id', id);
      await supabase.from('clients').delete().eq('id', id);

      return res.json({ success: true });
    });
    return;
  }

  return res.status(405).json({ error: 'Method not allowed' });
}