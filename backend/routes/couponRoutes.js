import express from 'express';
import { 
  getCoupons, 
  createCoupon, 
  deleteCoupon, 
  toggleCoupon, 
  validateCoupon 
} from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for checkout validation
router.post('/validate', validateCoupon);

// Protected admin routes
router.route('/').get(protect, getCoupons).post(protect, createCoupon);
router.route('/:id').delete(protect, deleteCoupon);
router.route('/:id/toggle').put(protect, toggleCoupon);

export default router;
