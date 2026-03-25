import jwt from 'jsonwebtoken';
import { connectDB } from '../db.js';
import User from '../models/User.js';
import { JWT_SECRET } from '../authMiddleware.js';

export default async function handler(req, res) {
  await connectDB();

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.json({ user: user.toObject() });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}