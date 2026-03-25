import { connectDB } from '../db.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import { authenticate } from '../authMiddleware.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    return authenticate(req, res, async () => {
      try {
        const clients = await Client.find().sort({ createdAt: -1 });
        return res.json({ clients });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  }

  if (req.method === 'POST') {
    return authenticate(req, res, async () => {
      try {
        const { name, company, email, password, accentColor } = req.body;

        if (!name || !company || !email) {
          return res.status(400).json({ error: 'Name, company, and email are required' });
        }

        if (!password) {
          return res.status(400).json({ error: 'Password is required for client login' });
        }

        const existingClient = await Client.findOne({ email });
        if (existingClient) {
          return res.status(400).json({ error: 'Client with this email already exists' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'A user with this email already exists' });
        }

        const client = new Client({
          name,
          company,
          email,
          accentColor: accentColor || '#3b82f6'
        });

        await client.save();

        const user = new User({
          email,
          password,
          name,
          role: 'client',
          clientId: client._id
        });

        await user.save();

        return res.json({ client: client.toObject() });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}