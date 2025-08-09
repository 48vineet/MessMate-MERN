const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/messmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSampleAttendance = async () => {
  try {
    // Get a user to associate attendance with
    const user = await User.findOne({ role: 'student' });
    if (!user) {
      console.log('No student user found. Please create a user first.');
      return;
    }

    console.log('Creating sample attendance data for user:', user.name);

    // Create attendance records for the last 30 days
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Randomly decide if user attended (80% attendance rate)
      const attended = Math.random() > 0.2;
      
      const attendanceRecord = {
        user: user._id,
        date: date,
        summary: {
          totalMeals: 3, // Breakfast, Lunch, Dinner
          attendedMeals: attended ? Math.floor(Math.random() * 3) + 1 : 0,
          missedMeals: attended ? 3 - (Math.floor(Math.random() * 3) + 1) : 3
        },
        streak: {
          currentStreak: attended ? Math.floor(Math.random() * 10) + 1 : 0,
          longestStreak: Math.floor(Math.random() * 20) + 5
        },
        details: {
          breakfast: { attended: attended && Math.random() > 0.3, time: '08:00' },
          lunch: { attended: attended && Math.random() > 0.3, time: '13:00' },
          dinner: { attended: attended && Math.random() > 0.3, time: '19:00' }
        }
      };
      
      attendanceRecords.push(attendanceRecord);
    }

    // Clear existing attendance records for this user
    await Attendance.deleteMany({ user: user._id });
    
    // Insert new attendance records
    await Attendance.insertMany(attendanceRecords);
    
    console.log(`Created ${attendanceRecords.length} attendance records for ${user.name}`);
    console.log('Sample attendance data created successfully!');
    
  } catch (error) {
    console.error('Error creating sample attendance data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleAttendance(); 