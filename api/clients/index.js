import jwt from 'jsonwebtoken';
import { supabase } from '../supabase.js';

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
  if (req.method === 'GET') {
    authenticate(req, res, async () => {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ clients });
    });
    return;
  }

  if (req.method === 'POST') {
    authenticate(req, res, async () => {
      const { name, company, email, password, accentColor } = req.body;

      if (!name || !company || !email) {
        return res.status(400).json({ error: 'Name, company, and email are required' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Password is required for client login' });
      }

      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .single();

      if (existingClient) {
        return res.status(400).json({ error: 'Client with this email already exists' });
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email already exists' });
      }

      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([{ name, company, email, accent_color: accentColor || '#3b82f6' }])
        .select()
        .single();

      if (clientError) {
        return res.status(500).json({ error: clientError.message });
      }

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{ email, password, name, role: 'client', client_id: newClient.id }])
        .select()
        .single();

      if (userError) {
        await supabase.from('clients').delete().eq('id', newClient.id);
        return res.status(500).json({ error: userError.message });
      }

      return res.json({ client: newClient });
    });
    return;
  }

  return res.status(405).json({ error: 'Method not allowed' });
}