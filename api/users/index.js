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
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, name, role, client_id, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(users);
    });
    return;
  }

  if (req.method === 'POST') {
    authenticate(req, res, async () => {
      const { email, password, name, clientId } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      if (clientId) {
        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (!client) {
          return res.status(400).json({ error: 'Client not found' });
        }
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ email, password, name, role: 'client', client_id: clientId || null }])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    });
    return;
  }

  return res.status(405).json({ error: 'Method not allowed' });
}