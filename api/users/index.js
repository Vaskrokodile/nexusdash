import { connectDB } from '../db.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import { authenticate } from './authMiddleware.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    return authenticate(req, res, async () => {
      try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        return res.json(users);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  }

  if (req.method === 'POST') {
    return authenticate(req, res, async () => {
      try {
        const { email, password, name, clientId } = req.body;

        if (!email || !password || !name) {
          return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        if (clientId) {
          const client = await Client.findById(clientId);
          if (!client) {
            return res.status(400).json({ error: 'Client not found' });
          }
        }

        const user = new User({
          email,
          password,
          name,
          role: 'client',
          clientId: clientId || null
        });

        await user.save();

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        return res.status(201).json(userWithoutPassword);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}