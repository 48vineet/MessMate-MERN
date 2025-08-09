// createSampleData.js
const mongoose = require('mongoose');
const DailyMenu = require('./models/DailyMenu');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
const Notification = require('./models/Notification');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    // Find a student user
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log('No student user found. Please create a student user first.');
      return;
    }

    // Create today's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create sample daily menus
    const sampleMenus = [
      {
        date: today,
        mealType: 'breakfast',
        items: [
          { name: 'Idli Sambar', icon: '🍛', description: 'Soft idlis with hot sambar' },
          { name: 'Dosa', icon: '🥞', description: 'Crispy dosa with chutney' },
          { name: 'Tea', icon: '☕', description: 'Hot masala tea' }
        ],
        price: 80,
        description: 'Traditional South Indian Breakfast',
        isAvailable: true,
        createdBy: student._id
      },
      {
        date: today,
        mealType: 'lunch',
        items: [
          { name: 'Rice', icon: '🍚', description: 'Steamed basmati rice' },
          { name: 'Dal Fry', icon: '🥘', description: 'Spicy dal with tempering' },
          { name: 'Chicken Curry', icon: '🍗', description: 'Spicy chicken curry' },
          { name: 'Raita', icon: '🥒', description: 'Cool cucumber raita' }
        ],
        price: 120,
        description: 'Complete Indian Lunch Thali',
        isAvailable: true,
        createdBy: student._id
      },
      {
        date: today,
        mealType: 'dinner',
        items: [
          { name: 'Roti', icon: '🫓', description: 'Soft wheat rotis' },
          { name: 'Paneer Butter Masala', icon: '🧀', description: 'Creamy paneer curry' },
          { name: 'Mixed Vegetables', icon: '🥬', description: 'Fresh seasonal vegetables' },
          { name: 'Dal', icon: '🥘', description: 'Simple dal' }
        ],
        price: 100,
        description: 'Light and Healthy Dinner',
        isAvailable: true,
        createdBy: student._id
      }
    ];

    // Clear existing menus for today
    await DailyMenu.deleteMany({
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    // Insert sample menus
    const createdMenus = await DailyMenu.insertMany(sampleMenus);
    console.log(`Created ${createdMenus.length} daily menus`);

    // Create sample bookings
    const sampleBookings = [
      {
        user: student._id,
        mealType: 'breakfast',
        bookingDate: today,
        mealTime: 'breakfast time',
        status: 'confirmed',
        totalAmount: 80,
        paymentMethod: 'wallet',
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        user: student._id,
        mealType: 'lunch',
        bookingDate: today,
        mealTime: 'lunch time',
        status: 'confirmed',
        totalAmount: 120,
        paymentMethod: 'wallet',
        createdAt: new Date(today.getTime() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        user: student._id,
        mealType: 'dinner',
        bookingDate: tomorrow,
        mealTime: 'dinner time',
        status: 'pending',
        totalAmount: 100,
        paymentMethod: 'wallet',
        createdAt: new Date()
      }
    ];

    // Clear existing bookings for this user
    await Booking.deleteMany({ user: student._id });

    // Insert sample bookings
    const createdBookings = await Booking.insertMany(sampleBookings);
    console.log(`Created ${createdBookings.length} bookings`);

    // Create or update wallet
    let wallet = await Wallet.findOne({ user: student._id });
    if (!wallet) {
      wallet = new Wallet({
        user: student._id,
        balance: 1300,
        transactions: [
          {
            type: 'credit',
            amount: 1500,
            description: 'Initial wallet recharge',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          },
          {
            type: 'debit',
            amount: 80,
            description: 'Breakfast booking',
            date: new Date(today.getTime() - 2 * 60 * 60 * 1000)
          },
          {
            type: 'debit',
            amount: 120,
            description: 'Lunch booking',
            date: new Date(today.getTime() - 1 * 60 * 60 * 1000)
          }
        ]
      });
    } else {
      wallet.balance = 1300;
      wallet.transactions = [
        {
          type: 'credit',
          amount: 1500,
          description: 'Initial wallet recharge',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'debit',
          amount: 80,
          description: 'Breakfast booking',
          date: new Date(today.getTime() - 2 * 60 * 60 * 1000)
        },
        {
          type: 'debit',
          amount: 120,
          description: 'Lunch booking',
          date: new Date(today.getTime() - 1 * 60 * 60 * 1000)
        }
      ];
    }
    await wallet.save();
    console.log('Updated wallet with sample data');

    // Create sample notifications
    const sampleNotifications = [
      {
        user: student._id,
        title: 'Booking Confirmed',
        message: 'Your breakfast booking for today has been confirmed!',
        type: 'booking',
        isRead: false,
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        user: student._id,
        title: 'Payment Successful',
        message: 'Payment of ₹80 for breakfast has been deducted from your wallet.',
        type: 'payment',
        isRead: false,
        createdAt: new Date(today.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        user: student._id,
        title: 'New Menu Available',
        message: 'Today\'s dinner menu is now available for booking!',
        type: 'menu',
        isRead: true,
        createdAt: new Date(today.getTime() - 4 * 60 * 60 * 1000)
      }
    ];

    // Clear existing notifications for this user
    await Notification.deleteMany({ user: student._id });

    // Insert sample notifications
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(`Created ${createdNotifications.length} notifications`);

    console.log('✅ Sample data created successfully!');
    console.log(`Student: ${student.name} (${student.email})`);
    console.log(`Wallet Balance: ₹${wallet.balance}`);
    console.log(`Bookings: ${createdBookings.length}`);
    console.log(`Menus: ${createdMenus.length}`);
    console.log(`Notifications: ${createdNotifications.length}`);

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  createSampleData();
}); 