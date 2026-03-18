import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';
import mongoose from 'mongoose';
import { rtdb } from '../config/firebase.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if the token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. Fetch admin user with Fallback Logic
      if (mongoose.connection.readyState === 1) {
        try {
          req.admin = await AdminUser.findById(decoded.id).select('-password');
          if (req.admin) return next();
        } catch (mongoErr) {
          console.error('Mongo user lookup failed, trying Firebase...', mongoErr.message);
        }
      }

      // 3. Fallback: Lookup in Firebase RTDB
      const snapshot = await rtdb.ref('admins/' + decoded.id).once('value');
      const adminData = snapshot.val();

      if (adminData) {
        req.admin = {
          _id: decoded.id,
          name: adminData.name,
          email: adminData.email,
          fallbackMode: true
        };
        return next();
      }

      throw new Error('User not found in any database');

    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
