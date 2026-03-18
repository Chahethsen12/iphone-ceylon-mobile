import AdminUser from '../models/AdminUser.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { rtdb } from '../config/firebase.js';

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const authAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let admin = null;
    let mongoSuccess = false;

    // 1. Try MongoDB Login (Only if connected)
    if (mongoose.connection.readyState === 1) {
      try {
        // Set a local timeout for this specific operation to avoid long hangs
        admin = await AdminUser.findOne({ email }); 
        
        if (admin && (await admin.matchPassword(password))) {
          mongoSuccess = true;
          // Mirror to Firebase asynchronously (don't block the response)
          rtdb.ref('admins/' + admin._id.toString()).set({
            name: admin.name,
            email: admin.email,
            password: admin.password
          }).catch(err => console.error('Firebase mirroring failed during login:', err.message));
        }
      } catch (mongoErr) {
        console.error('MongoDB Primary Login attempt failed:', mongoErr.message);
        // We don't return here, we fall through to Firebase
      }
    }

    // 2. Fallback to Firebase if Mongo failed, is down, or timed out
    if (!mongoSuccess) {
       try {
         console.log('Using Firebase Auth Fallback for:', email);
         const snapshot = await rtdb.ref('admins').orderByChild('email').equalTo(email).once('value');
         const data = snapshot.val();
         
         if (data) {
            const id = Object.keys(data)[0];
            const adminData = data[id];
            const isMatch = await bcrypt.compare(password, adminData.password);
            
            if (isMatch) {
               return res.json({
                  _id: id,
                  name: adminData.name,
                  email: adminData.email,
                  token: generateToken(id),
                  fallbackMode: true
               });
            }
         }
       } catch (fbError) {
         console.error('Firebase Auth Fallback also failed:', fbError.message);
         // If both fail, we'll return the 401 below
       }
       
       return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Standard Mongo Success path
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });

  } catch (error) {
    console.error('CRITICAL LOGIN ERROR:', error);
    res.status(500).json({ message: 'Internal Server Error during login', error: error.message });
  }
};
