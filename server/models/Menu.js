// models/Menu.js
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Please provide menu item name'],
    trim: true,
    maxlength: [100, 'Menu item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide menu item description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Meal Details
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
    required: [true, 'Please specify meal type']
  },
  category: {
    type: String,
    enum: ['starter', 'main-course', 'dessert', 'beverage', 'combo'],
    required: [true, 'Please specify category']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  maxQuantity: {
    type: Number,
    default: 100
  },
  currentQuantity: {
    type: Number,
    default: 100
  },
  
  // Nutritional Information
  nutrition: {
    calories: {
      type: Number,
      default: 0
    },
    protein: {
      type: String,
      default: '0g'
    },
    carbs: {
      type: String,
      default: '0g'
    },
    fat: {
      type: String,
      default: '0g'
    },
    fiber: {
      type: String,
      default: '0g'
    }
  },
  
  // Dietary Information
  dietary: {
    isVegetarian: {
      type: Boolean,
      default: true
    },
    isVegan: {
      type: Boolean,
      default: false
    },
    isJain: {
      type: Boolean,
      default: false
    },
    isGlutenFree: {
      type: Boolean,
      default: false
    },
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'spicy', 'very-spicy'],
      default: 'medium'
    }
  },
  
  // Ingredients
  ingredients: [String],
  allergens: [String],
  
  // Media
  images: [{
    public_id: String,
    url: String
  }],
  
  // Ratings & Reviews
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Preparation Details
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  servingSize: {
    type: String,
    default: '1 plate'
  },
  
  // Chef Information
  chef: {
    name: String,
    speciality: String
  },
  
  // Statistics
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    popularityScore: {
      type: Number,
      default: 0
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
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

// Virtual for effective price after discount
menuSchema.virtual('effectivePrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual for availability status
menuSchema.virtual('isCurrentlyAvailable').get(function() {
  const now = new Date();
  return this.isAvailable && 
         this.currentQuantity > 0 && 
         this.availableFrom <= now && 
         this.availableUntil >= now;
});

// Indexes for better query performance
menuSchema.index({ mealType: 1, isAvailable: 1 });
menuSchema.index({ category: 1 });
menuSchema.index({ 'dietary.isVegetarian': 1 });
menuSchema.index({ 'ratings.average': -1 });
menuSchema.index({ price: 1 });
menuSchema.index({ availableFrom: 1, availableUntil: 1 });

// Pre-save middleware to calculate original price
menuSchema.pre('save', function(next) {
  if (this.isModified('price') && !this.originalPrice) {
    this.originalPrice = this.price;
  }
  next();
});

// Method to update ratings
menuSchema.methods.updateRatings = function(newRating) {
  const totalRating = (this.ratings.average * this.ratings.count) + newRating;
  this.ratings.count += 1;
  this.ratings.average = totalRating / this.ratings.count;
  return this.save();
};

// Method to reduce quantity
menuSchema.methods.reduceQuantity = function(quantity = 1) {
  if (this.currentQuantity < quantity) {
    throw new Error('Insufficient quantity available');
  }
  this.currentQuantity -= quantity;
  this.stats.totalOrders += quantity;
  this.stats.totalRevenue += (this.effectivePrice * quantity);
  return this.save();
};

// Method to check availability
menuSchema.methods.checkAvailability = function(quantity = 1) {
  const now = new Date();
  return this.isAvailable && 
         this.currentQuantity >= quantity && 
         this.availableFrom <= now && 
         this.availableUntil >= now;
};

module.exports = mongoose.model('Menu', menuSchema);
