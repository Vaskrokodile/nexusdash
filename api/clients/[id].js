import { connectDB } from '../../db.js';
import Client from '../../models/Client.js';
import User from '../../models/User.js';
import { authenticate } from '../../authMiddleware.js';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Client ID required' });
  }

  if (req.method === 'GET') {
    try {
      const client = await Client.findById(id);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      return res.json({ client });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    return authenticate(req, res, async () => {
      try {
        const client = await Client.findById(id);
        
        if (!client) {
          return res.status(404).json({ error: 'Client not found' });
        }

        const { name, company, email, accentColor, status, metrics } = req.body;

        if (email && email !== client.email) {
          const existingClient = await Client.findOne({ email, _id: { $ne: client._id } });
          if (existingClient) {
            return res.status(400).json({ error: 'Client with this email already exists' });
          }
        }

        client.name = name || client.name;
        client.company = company || client.company;
        client.email = email || client.email;
        client.accentColor = accentColor || client.accentColor;
        client.status = status || client.status;
        if (metrics) {
          client.metrics = { ...client.metrics.toObject(), ...metrics };
        }

        await client.save();
        return res.json({ client: client.toObject() });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  }

  if (req.method === 'DELETE') {
    return authenticate(req, res, async () => {
      try {
        const client = await Client.findById(id);
        
        if (!client) {
          return res.status(404).json({ error: 'Client not found' });
        }

        await User.deleteMany({ clientId: client._id });
        await Client.findByIdAndDelete(id);
        return res.json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}