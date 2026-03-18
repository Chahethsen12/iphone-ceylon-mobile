import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/ProductModel.js';
import Order from '../models/OrderModel.js';
import AdminUser from '../models/AdminUser.js';
import { rtdb } from '../config/firebase.js';

dotenv.config();

const syncMongoToFirebase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Sync Products
    console.log('Fetching products from MongoDB...');
    const products = await Product.find({});
    
    console.log(`Found ${products.length} products. Syncing to Firebase RTDB...`);
    let productCount = 0;
    for (const product of products) {
      await rtdb.ref('products/' + product._id.toString()).set({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        variants: product.variants || [],
        isFeatured: product.isFeatured || false,
        createdAt: product.createdAt ? product.createdAt.toISOString() : new Date().toISOString()
      });
      productCount++;
    }
    console.log(`Successfully synced ${productCount} products.`);

    // 2. Sync Orders
    console.log('Fetching orders from MongoDB...');
    const orders = await Order.find({});
    
    console.log(`Found ${orders.length} orders. Syncing to Firebase RTDB...`);
    let orderCount = 0;
    for (const order of orders) {
      await rtdb.ref('orders/' + order._id.toString()).set({
        customerInfo: order.customerInfo,
        orderItems: order.orderItems,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString()
      });
      orderCount++;
    }
    console.log(`Successfully synced ${orderCount} orders.`);

    // 3. Sync Admins (for Auth Fallback)
    console.log('Fetching admins from MongoDB...');
    const admins = await AdminUser.find({});
    console.log(`Found ${admins.length} admins. Syncing to Firebase RTDB...`);
    for (const admin of admins) {
      await rtdb.ref('admins/' + admin._id.toString()).set({
        name: admin.name,
        email: admin.email,
        password: admin.password // Mirror hashed password
      });
    }
    console.log(`Successfully synced ${admins.length} admins.`);

    console.log('Initial Sync Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing data:', error);
    process.exit(1);
  }
};

syncMongoToFirebase();
