import { connectDB } from '../../db.js';
import User from '../../models/User.js';
import Client from '../../models/Client.js';
import { authenticate } from '../../authMiddleware.js';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'User ID required' });
  }

  if (req.method === 'PUT') {
    return authenticate(req, res, async () => {
      try {
        const { email, name, clientId, password } = req.body;

        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        if (email && email !== user.email) {
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          user.email = email;
        }

        if (name) user.name = name;

        if (clientId !== undefined) {
          if (clientId) {
            const client = await Client.findById(clientId);
            if (!client) {
              return res.status(400).json({ error: 'Client not found' });
            }
          }
          user.clientId = clientId || null;
        }

        if (password) {
          user.password = password;
        }

        await user.save();

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        return res.json(userWithoutPassword);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  }

  if (req.method === 'DELETE') {
    return authenticate(req, res, async () => {
      try {
        if (id === req.userId) {
          return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}