// Script to create a new admin user
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Admin user details
    const adminUser = {
      name: "Admin Vineet",
      email: "7038vineet@gmail.com",
      password: "test@123",
      role: "admin",
      phone: "7038738012",
      isVerified: true,
      isActive: true,
    };
    

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      return;
    }

    // Create admin user
    const user = await User.create(adminUser);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();
