// Script to create a new admin user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 MongoDB Connected');

    // Admin user details
const adminUser = {
      name: 'Admin User',
      email: 'admin@messmate.com',
      password: 'admin123456',
      role: 'admin',
      phone: '1234567890',
      isVerified: true,
      isActive: true
    };
    

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('❌ Admin user already exists with this email');
      return;
    }

    // Create admin user
    const user = await User.create(adminUser);

    console.log('✅ Admin user created successfully!');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password: ${adminUser.password}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminUser.password}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 MongoDB Disconnected');
  }
};

createAdminUser(); 