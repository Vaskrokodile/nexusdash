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
    return res.status(400).json({ error: 'User ID required' });
  }

  if (req.method === 'PUT') {
    authenticate(req, res, async () => {
      const { email, name, clientId, password } = req.body;

      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (email && email !== user.email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (existingUser) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }

      const updates = {};
      if (email) updates.email = email;
      if (name) updates.name = name;
      if (clientId !== undefined) updates.client_id = clientId || null;
      if (password) updates.password = password;

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.json(userWithoutPassword);
    });
    return;
  }

  if (req.method === 'DELETE') {
    authenticate(req, res, async () => {
      if (id === req.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return res.status(500).json({ error: deleteError.message });
      }

      return res.json({ success: true });
    });
    return;
  }

  return res.status(405).json({ error: 'Method not allowed' });
}