import express from 'express';
import { createOrder, getOrders, updateOrderToDelivered, getOrderStats, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createOrder).get(protect, getOrders);
router.route('/stats').get(protect, getOrderStats);
router.route('/:id/status').put(protect, updateOrderStatus);
router.route('/:id/deliver').put(protect, updateOrderToDelivered);

export default router;
