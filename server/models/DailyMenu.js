// models/DailyMenu.js
const mongoose = require('mongoose');

const dailyMenuSchema = new mongoose.Schema({
  // Date and Meal Type
  date: {
    type: Date,
    required: [true, 'Please provide menu date'],
    index: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: [true, 'Please specify meal type']
  },
  
  // Menu Items Array
  items: [{
    name: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      default: '🍛'
    }
  }],
  
  // Pricing
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  
  // Description
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Template Information
  isTemplate: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['regular', 'premium', 'vegetarian', 'non-vegetarian'],
    default: 'regular'
  },
  estimatedPrice: {
    type: Number,
    min: [0, 'Estimated price cannot be negative']
  },
  
  // Admin Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Compound index for date and meal type to ensure uniqueness (only for non-templates)
dailyMenuSchema.index({ date: 1, mealType: 1 }, { 
  unique: true,
  partialFilterExpression: { isTemplate: { $ne: true } }
});

// Index for templates
dailyMenuSchema.index({ isTemplate: 1, name: 1 });

// Virtual for formatted date
dailyMenuSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Pre-save middleware to ensure date is set to start of day (only for non-templates)
dailyMenuSchema.pre('save', function(next) {
  if (this.date && !this.isTemplate) {
    const date = new Date(this.date);
    this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  next();
});

module.exports = mongoose.model('DailyMenu', dailyMenuSchema); 