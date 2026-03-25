export default function handler(req, res) {
  return res.status(400).json({ error: 'Use /api/auth/login or /api/auth/me' });
}