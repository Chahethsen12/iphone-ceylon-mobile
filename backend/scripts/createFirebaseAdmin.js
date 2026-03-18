import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { rtdb } from '../config/firebase.js';

async function createAdmin() {
  const email = 'admin@iphonemobileceylon.com';
  const password = 'P@$$w0rd';
  const name = 'Admin';

  console.log(`Creating admin: ${email}`);

  try {
    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Generate a valid MongoDB-like ID if we want consistency, or just a random ID
    const newId = new mongoose.Types.ObjectId().toString();

    // 3. Save to Firebase RTDB
    await rtdb.ref('admins/' + newId).set({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });

    console.log('-----------------------------------');
    console.log('SUCCESS: Admin created in Firebase');
    console.log(`ID: ${newId}`);
    console.log(`Email: ${email}`);
    console.log('-----------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('FAILED to create admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
