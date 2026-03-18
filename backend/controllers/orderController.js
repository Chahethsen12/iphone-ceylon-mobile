import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';
import { rtdb } from '../config/firebase.js';

// @desc    Create new order (Used by Frontend Store)
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { customerInfo, orderItems, deliveryFee, totalAmount, paymentMethod } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    let createdOrder = {
      customerInfo,
      orderItems,
      deliveryFee,
      totalAmount,
      paymentMethod,
      orderStatus: 'Processing',
      createdAt: new Date().toISOString()
    };
    
    let mongoSuccess = false;

    // 1. Try Primary MongoDB Save
    if (mongoose.connection.readyState === 1) { // 1 = connected
      try {
        const order = new Order(createdOrder);
        const savedOrder = await order.save();
        createdOrder = savedOrder.toObject(); // Convert document to plain object
        mongoSuccess = true;
      } catch (mongoErr) {
        console.error('MongoDB failed to save order:', mongoErr.message);
      }
    } else {
      console.warn('MongoDB disconnected. Proceeding straight to Firebase Fallback Write.');
      // Generate a distinct Mongo ID for the backup even if mongo is down
      createdOrder._id = new mongoose.Types.ObjectId().toString(); 
    }

    // 2. Dual Write: Replicate to Firebase Realtime Database
    try {
      const docId = createdOrder._id.toString();
      createdOrder._id = docId;

      await rtdb.ref('orders/' + docId).set({
        customerInfo: createdOrder.customerInfo,
        orderItems: createdOrder.orderItems,
        deliveryFee: createdOrder.deliveryFee,
        totalAmount: createdOrder.totalAmount,
        paymentMethod: createdOrder.paymentMethod,
        orderStatus: createdOrder.orderStatus || 'Processing',
        createdAt: createdOrder.createdAt
      });
      console.log('Firebase mirrored order creation successfully');
    } catch (fbError) {
      console.error('Firebase Error Details:', {
        message: fbError.message,
        stack: fbError.stack
      });
      if (!mongoSuccess) {
         // Both DBs failed, this is a true failure
         throw new Error(`Total database failure: ${fbError.message}`);
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// @desc    Get all orders (Used by Admin Dashboard)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    // 1. Fetch from MongoDB first
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    console.error('MongoDB failed to fetch orders, falling back to Firebase...', error.message);
    
    // 2. Read Fallback: Fetch from Firebase RTDB
    try {
      const snapshot = await rtdb.ref('orders').once('value');
      const data = snapshot.val();
      const backupOrders = data ? Object.keys(data).map(key => ({ _id: key, ...data[key] })) : [];
      
      // Sort by createdAt descending
      backupOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      res.setHeader('X-Fallback-Mode', 'true');
      return res.status(200).json(backupOrders);
    } catch (fbError) {
      console.error('Firebase fallback also failed', fbError);
      return res.status(500).json({ message: 'Failed to fetch orders from both databases' });
    }
  }
};

// @desc    Update order status to Delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = 'Delivered';
      const updatedOrder = await order.save();

      // Dual Write: Update in Firebase
      try {
        await rtdb.ref('orders/' + updatedOrder._id.toString()).update({
          orderStatus: 'Delivered'
        });
        console.log('Firebase mirrored order status update successfully');
      } catch (fbError) {
        console.error('Firebase failed to mirror order status update:', fbError.message);
      }

      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = status;
      const updatedOrder = await order.save();

      // Dual Write: Update in Firebase
      try {
        await rtdb.ref('orders/' + req.params.id).update({
          orderStatus: status
        });
        console.log('Firebase mirrored order status update successfully');
      } catch (fbError) {
        console.error('Firebase failed to mirror order status update:', fbError.message);
      }

      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// @desc    Get dashboard analytics stats
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    // 1. Try Primary MongoDB Aggregation
    if (mongoose.connection.readyState === 1) {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Revenue & Total Orders
        const generalStats = await Order.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
              totalOrders: { $count: {} }
            }
          }
        ]);

        // Low Stock Count
        const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });

        // Daily Sales (Last 30 Days)
        const dailySales = await Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              revenue: { $sum: "$totalAmount" },
              orders: { $count: {} }
            }
          },
          { $sort: { _id: 1 } }
        ]);

        // Payment Method Mix
        const paymentMix = await Order.aggregate([
          {
            $group: {
              _id: "$paymentMethod",
              count: { $count: {} }
            }
          }
        ]);

        return res.status(200).json({
          totalRevenue: generalStats[0]?.totalRevenue || 0,
          totalOrders: generalStats[0]?.totalOrders || 0,
          lowStockCount,
          dailySales: dailySales.map(d => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
          paymentMethodDistribution: paymentMix.map(p => ({ method: p._id, count: p.count }))
        });
      } catch (mongoErr) {
        console.error('MongoDB analytics failed, falling back to Firebase...', mongoErr.message);
      }
    }

    // 2. Fallback: Aggregate from Firebase RTDB in-memory
    const orderSnapshot = await rtdb.ref('orders').once('value');
    const productSnapshot = await rtdb.ref('products').once('value');
    
    const ordersData = orderSnapshot.val() || {};
    const productsData = productSnapshot.val() || {};

    const orders = Object.values(ordersData);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Filter low stock from products
    const lowStockCount = Object.values(productsData).filter(p => p.stock < 5).length;

    // Daily Sales (Process last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesMap = {};
    const paymentMap = {};

    orders.forEach(o => {
      // Payment Mix
      paymentMap[o.paymentMethod] = (paymentMap[o.paymentMethod] || 0) + 1;

      // Daily Trends
      if (o.createdAt) {
          const dateKey = o.createdAt.split('T')[0];
          const orderDate = new Date(o.createdAt);
          if (orderDate >= thirtyDaysAgo) {
            if (!salesMap[dateKey]) salesMap[dateKey] = { revenue: 0, orders: 0 };
            salesMap[dateKey].revenue += (o.totalAmount || 0);
            salesMap[dateKey].orders += 1;
          }
      }
    });

    const dailySales = Object.entries(salesMap)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const paymentMethodDistribution = Object.entries(paymentMap).map(([method, count]) => ({ method, count }));

    res.setHeader('X-Fallback-Mode', 'true');
    return res.status(200).json({
      totalRevenue,
      totalOrders,
      lowStockCount,
      dailySales,
      paymentMethodDistribution
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to generate analytics', error: error.message });
  }
};
