import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const checkRole = (role) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role !== role) {
        return res.status(403).json({ message: `Access denied. You are not a ${role}.` });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Error in role middleware:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};