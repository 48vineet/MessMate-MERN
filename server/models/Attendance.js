// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Basic Information
  attendanceId: {
    type: String,
    unique: true,
    default: function() {
      return 'ATT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Date Information
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: function() {
      // Set to today's date with time set to 00:00:00
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
  },
  
  // Meal Attendance
  meals: {
    breakfast: {
      isPresent: {
        type: Boolean,
        default: false
      },
      markedAt: Date,
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      method: {
        type: String,
        enum: ['manual', 'qr-code', 'booking', 'auto'],
        default: 'manual'
      },
      booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      },
      notes: String
    },
    lunch: {
      isPresent: {
        type: Boolean,
        default: false
      },
      markedAt: Date,
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      method: {
        type: String,
        enum: ['manual', 'qr-code', 'booking', 'auto'],
        default: 'manual'
      },
      booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      },
      notes: String
    },
    dinner: {
      isPresent: {
        type: Boolean,
        default: false
      },
      markedAt: Date,
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      method: {
        type: String,
        enum: ['manual', 'qr-code', 'booking', 'auto'],
        default: 'manual'
      },
      booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      },
      notes: String
    }
  },
  
  // Summary
  summary: {
    totalMeals: {
      type: Number,
      default: 0
    },
    attendedMeals: {
      type: Number,
      default: 0
    },
    attendancePercentage: {
      type: Number,
      default: 0
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'holiday', 'leave', 'sick', 'absent'],
    default: 'active'
  },
  
  // Leave Information
  leaveDetails: {
    isOnLeave: {
      type: Boolean,
      default: false
    },
    leaveType: {
      type: String,
      enum: ['sick', 'personal', 'emergency', 'vacation']
    },
    leaveReason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date
  },
  
  // Location Information
  location: {
    checkInLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    isWithinPremises: {
      type: Boolean,
      default: true
    }
  },
  
  // Device Information
  deviceInfo: {
    deviceType: String,
    userAgent: String,
    ipAddress: String,
    appVersion: String
  },
  
  // Streak Information
  streak: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastAttendanceDate: Date
  },
  
  // Notifications
  notifications: {
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderSentAt: Date,
    absentNotificationSent: {
      type: Boolean,
      default: false
    },
    absentNotificationSentAt: Date
  },
  
  // Admin Information
  adminNotes: String,
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Compound index for unique user-date combination
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Other indexes for better query performance
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ 'summary.attendancePercentage': -1 });
attendanceSchema.index({ 'streak.currentStreak': -1 });

// Pre-save middleware to calculate summary
attendanceSchema.pre('save', function(next) {
  const meals = this.meals;
  let attendedMeals = 0;
  let totalMeals = 3; // breakfast, lunch, dinner
  
  if (meals.breakfast.isPresent) attendedMeals++;
  if (meals.lunch.isPresent) attendedMeals++;
  if (meals.dinner.isPresent) attendedMeals++;
  
  this.summary.totalMeals = totalMeals;
  this.summary.attendedMeals = attendedMeals;
  this.summary.attendancePercentage = Math.round((attendedMeals / totalMeals) * 100);
  
  next();
});

// Method to mark meal attendance
attendanceSchema.methods.markMealAttendance = function(mealType, markedBy, method, booking, notes) {
  if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
    throw new Error('Invalid meal type');
  }
  
  this.meals[mealType].isPresent = true;
  this.meals[mealType].markedAt = new Date();
  this.meals[mealType].markedBy = markedBy;
  this.meals[mealType].method = method || 'manual';
  
  if (booking) {
    this.meals[mealType].booking = booking;
  }
  
  if (notes) {
    this.meals[mealType].notes = notes;
  }
  
  return this.save();
};

// Method to mark leave
attendanceSchema.methods.markLeave = function(leaveType, reason, approvedBy) {
  this.status = 'leave';
  this.leaveDetails.isOnLeave = true;
  this.leaveDetails.leaveType = leaveType;
  this.leaveDetails.leaveReason = reason;
  this.leaveDetails.approvedBy = approvedBy;
  this.leaveDetails.approvedAt = new Date();
  
  return this.save();
};

// Method to update streak
attendanceSchema.methods.updateStreak = function(previousAttendance) {
  const yesterday = new Date(this.date);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (this.summary.attendedMeals > 0) {
    // User attended at least one meal today
    if (previousAttendance && 
        previousAttendance.date.toDateString() === yesterday.toDateString() &&
        previousAttendance.summary.attendedMeals > 0) {
      // Continue streak
      this.streak.currentStreak = (previousAttendance.streak.currentStreak || 0) + 1;
    } else {
      // Start new streak
      this.streak.currentStreak = 1;
    }
    
    // Update longest streak
    if (this.streak.currentStreak > this.streak.longestStreak) {
      this.streak.longestStreak = this.streak.currentStreak;
    }
    
    this.streak.lastAttendanceDate = this.date;
  } else {
    // User didn't attend any meal today
    this.streak.currentStreak = 0;
  }
  
  return this.save();
};

// Method to get attendance statistics
attendanceSchema.methods.getAttendanceStats = function() {
  const stats = {
    date: this.date,
    attendancePercentage: this.summary.attendancePercentage,
    attendedMeals: this.summary.attendedMeals,
    totalMeals: this.summary.totalMeals,
    currentStreak: this.streak.currentStreak,
    longestStreak: this.streak.longestStreak,
    meals: {
      breakfast: this.meals.breakfast.isPresent,
      lunch: this.meals.lunch.isPresent,
      dinner: this.meals.dinner.isPresent
    }
  };
  
  return stats;
};

// Static method to get user attendance summary
attendanceSchema.statics.getUserAttendanceSummary = async function(userId, startDate, endDate) {
  const attendance = await this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
  
  if (attendance.length === 0) {
    return {
      totalDays: 0,
      attendedDays: 0,
      attendancePercentage: 0,
      totalMeals: 0,
      attendedMeals: 0,
      currentStreak: 0,
      longestStreak: 0
    };
  }
  
  const totalDays = attendance.length;
  const attendedDays = attendance.filter(a => a.summary.attendedMeals > 0).length;
  const totalMeals = attendance.reduce((sum, a) => sum + a.summary.totalMeals, 0);
  const attendedMeals = attendance.reduce((sum, a) => sum + a.summary.attendedMeals, 0);
  const currentStreak = attendance[0].streak.currentStreak;
  const longestStreak = Math.max(...attendance.map(a => a.streak.longestStreak));
  
  return {
    totalDays,
    attendedDays,
    attendancePercentage: Math.round((attendedDays / totalDays) * 100),
    totalMeals,
    attendedMeals,
    mealAttendancePercentage: Math.round((attendedMeals / totalMeals) * 100),
    currentStreak,
    longestStreak
  };
};

module.exports = mongoose.model('Attendance', attendanceSchema);
