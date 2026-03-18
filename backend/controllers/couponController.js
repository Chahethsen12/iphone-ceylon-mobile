import Coupon from '../models/CouponModel.js';
import mongoose from 'mongoose';
import { rtdb } from '../config/firebase.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    // 1. Try fetching from MongoDB first
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return res.status(200).json(coupons);
  } catch (error) {
    console.error('MongoDB failed to fetch coupons, falling back to Firebase...', error.message);
    
    // 2. Read Fallback: If Mongo fails, fetch from Firebase Realtime Database
    try {
      const snapshot = await rtdb.ref('coupons').once('value');
      const data = snapshot.val();
      const backupCoupons = data ? Object.keys(data).map(key => ({ _id: key, ...data[key] })) : [];
      backupCoupons.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      res.setHeader('X-Fallback-Mode', 'true');
      return res.status(200).json(backupCoupons);
    } catch (fbError) {
      console.error('Firebase fallback also failed', fbError);
      return res.status(500).json({ message: 'Failed to fetch coupons from both databases' });
    }
  }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, minPurchase } = req.body;
    
    // Use the normalized code
    const normalizedCode = code.toUpperCase();
    
    const couponData = {
      code: normalizedCode,
      discountType,
      discountValue,
      expiryDate,
      minPurchase: minPurchase || 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    let createdCoupon = couponData;
    let mongoSuccess = false;

    // 1. Try Primary MongoDB Save
    if (mongoose.connection.readyState === 1) {
      try {
        const couponExists = await Coupon.findOne({ code: normalizedCode });
        if (couponExists) {
          return res.status(400).json({ message: 'Coupon code already exists' });
        }
        
        const coupon = new Coupon(couponData);
        const savedCoupon = await coupon.save();
        createdCoupon = savedCoupon.toObject();
        mongoSuccess = true;
      } catch (mongoErr) {
        console.error('MongoDB failed to create coupon:', mongoErr.message);
      }
    } else {
      // Generate ID for fallback write
      createdCoupon._id = new mongoose.Types.ObjectId().toString();
    }

    // 2. Dual Write: Replicate to Firebase
    try {
      const docId = createdCoupon._id.toString();
      await rtdb.ref('coupons/' + docId).set({
        code: createdCoupon.code,
        discountType: createdCoupon.discountType,
        discountValue: createdCoupon.discountValue,
        expiryDate: createdCoupon.expiryDate,
        minPurchase: createdCoupon.minPurchase,
        isActive: createdCoupon.isActive,
        createdAt: createdCoupon.createdAt
      });
      console.log('Firebase mirrored coupon creation successfully');
    } catch (fbError) {
      console.error('Firebase mirroring failed:', fbError.message);
      if (!mongoSuccess) throw new Error(`Total database failure: ${fbError.message}`);
    }

    res.status(201).json(createdCoupon);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create coupon', error: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    let mongoSuccess = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
          await coupon.deleteOne();
          mongoSuccess = true;
        }
      } catch (err) {
        console.error("MongoDB delete failed", err);
      }
    }

    // Dual Write: Remove from Firebase
    try {
      await rtdb.ref('coupons/' + req.params.id).remove();
      console.log('Firebase mirrored coupon deletion successfully');
      res.json({ message: 'Coupon removed' });
    } catch (fbError) {
      if (mongoSuccess) {
        res.json({ message: 'Coupon removed from Mongo, but Firebase mirror failed' });
      } else {
        res.status(404).json({ message: 'Coupon not found in either databases' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon' });
  }
};

// @desc    Toggle coupon status
// @route   PUT /api/coupons/:id/toggle
// @access  Private/Admin
export const toggleCoupon = async (req, res) => {
  try {
    let updatedCoupon = null;
    let newStatus = null;
    let mongoSuccess = false;

    if (mongoose.connection.readyState === 1) {
      try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
          coupon.isActive = !coupon.isActive;
          updatedCoupon = await coupon.save();
          newStatus = updatedCoupon.isActive;
          mongoSuccess = true;
        }
      } catch (err) {
         console.error("MongoDB toggle failed", err);
      }
    }

    if (!mongoSuccess) {
      // Need to fetch current from firebase to toggle
      try {
        const snapshot = await rtdb.ref('coupons/' + req.params.id).once('value');
        const data = snapshot.val();
        if (data) {
           newStatus = !data.isActive;
           updatedCoupon = { _id: req.params.id, ...data, isActive: newStatus };
        } else {
           return res.status(404).json({ message: 'Coupon not found' });
        }
      } catch (fbErr) {
        return res.status(500).json({ message: 'Failed to toggle coupon' });
      }
    }

    // Apply the active state to Firebase
    if (updatedCoupon) {
       try {
          await rtdb.ref('coupons/' + req.params.id).update({ isActive: newStatus });
          console.log('Firebase mirrored coupon toggle successfully');
       } catch (err) {
          console.error("Firebase update failed", err);
       }
       return res.json(updatedCoupon);
    }
    
    res.status(404).json({ message: 'Coupon not found' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle coupon' });
  }
};

// @desc    Validate a coupon code (Public for checkout)
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const normalizedCode = code.toUpperCase();
    
    let coupon = null;

    if (mongoose.connection.readyState === 1) {
      try {
        coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });
      } catch (err) {
        console.error("MongoDB validation failed, checking Firebase:", err.message);
      }
    }

    // Fallback to Firebase if coupon not found in Mongo or Mongo is down
    if (!coupon) {
      try {
        const snapshot = await rtdb.ref('coupons').orderByChild('code').equalTo(normalizedCode).once('value');
        const data = snapshot.val();
        if (data) {
           const id = Object.keys(data)[0];
           if (data[id].isActive) {
              coupon = { _id: id, ...data[id] };
           }
        }
      } catch (fbErr) {
        console.error("Firebase fallback validation failed", fbErr.message);
      }
    }

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ message: `Minimum purchase of Rs. ${coupon.minPurchase} required` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during validation' });
  }
};
