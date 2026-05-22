import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Simple guest/JWT middleware — attaches req.user or req.guestId
export const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).lean();
    } catch {
      // Invalid token — treat as guest
    }
  }
  next();
};

export const requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).lean();
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
