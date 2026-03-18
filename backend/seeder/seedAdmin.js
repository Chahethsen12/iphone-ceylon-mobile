// backend/seeder/seedAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AdminUser from '../models/AdminUser.js';

// Setup to get the correct directory path in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point dotenv directly to the backend/.env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    // Check if the MONGO_URI actually loaded
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Please check your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    
    const existingAdmin = await AdminUser.findOne({ email: 'admin@iphoneceylon.com' });
    if (existingAdmin) {
      console.log('Admin already exists in the database.');
      process.exit();
    }

    const admin = new AdminUser({
      name: 'Admin',
      email: 'admin@iphoneceylon.com',
      password: 'P@$$w0rd'
    });

    await admin.save();
    console.log('Admin user successfully created!');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
