import jwt from 'jsonwebtoken';
import { connectDB } from './db.js';
import User from './models/User.js';
import { JWT_SECRET } from './authMiddleware.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

  const { password: _, ...userWithoutPassword } = user.toObject();
  return res.json({ token, user: userWithoutPassword });
}