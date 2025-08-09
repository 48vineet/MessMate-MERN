// Script to update user role to admin
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateUserToAdmin = async (email) => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 MongoDB Connected');

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`✅ User ${email} updated to admin role successfully!`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
    } else {
      console.log(`❌ User with email ${email} not found`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 MongoDB Disconnected');
  }
};

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node updateUserRole.js your-email@example.com');
  process.exit(1);
}

updateUserToAdmin(email); 