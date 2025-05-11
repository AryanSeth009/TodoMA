import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth error: No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.log('Auth error: Invalid token', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!decoded || !decoded.id) {
      console.log('Auth error: Invalid token payload');
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('Auth error: User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export { auth };
