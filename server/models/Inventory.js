// models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  // Basic Information
  itemName: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  itemCode: {
    type: String,
    unique: true,
    required: [true, 'Please provide item code'],
    uppercase: true,
    trim: true
  },
  
  // Category
  category: {
    type: String,
    enum: ['grains', 'pulses', 'vegetables', 'fruits', 'dairy', 'meat', 'spices', 'oils', 'beverages', 'others'],
    required: [true, 'Please specify category']
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Quantity Management
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Stock cannot be negative']
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock cannot be negative']
  },
  maximumStock: {
    type: Number,
    required: [true, 'Maximum stock level is required'],
    min: [0, 'Maximum stock cannot be negative']
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level is required'],
    min: [0, 'Reorder level cannot be negative']
  },
  
  // Units
  unit: {
    type: String,
    enum: ['kg', 'grams', 'liters', 'ml', 'pieces', 'packets', 'boxes', 'bags'],
    required: [true, 'Please specify unit']
  },
  
  // Pricing
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalValue: {
    type: Number,
    default: 0
  },
  
  // Supplier Information
  supplier: {
    name: {
      type: String,
      required: [true, 'Supplier name is required']
    },
    contactPerson: String,
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    address: String,
    gstNumber: String
  },
  
  // Storage Information
  storage: {
    location: {
      type: String,
      required: [true, 'Storage location is required']
    },
    temperature: {
      type: String,
      enum: ['frozen', 'refrigerated', 'cool', 'room-temperature'],
      default: 'room-temperature'
    },
    humidity: String,
    specialInstructions: String
  },
  
  // Expiry & Quality
  expiryDate: Date,
  manufacturingDate: Date,
  batchNumber: String,
  quality: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    default: 'good'
  },
  
  // Stock Movements
  stockMovements: [{
    type: {
      type: String,
      enum: ['purchase', 'usage', 'waste', 'adjustment', 'return'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: {
      type: Number,
      required: true
    },
    newStock: {
      type: Number,
      required: true
    },
    reason: String,
    reference: String, // Purchase order, booking ID, etc.
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Alerts
  alerts: [{
    type: {
      type: String,
      enum: ['low-stock', 'out-of-stock', 'expiry-warning', 'quality-issue', 'overstock'],
      required: true
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Usage Statistics
  usage: {
    dailyAverage: {
      type: Number,
      default: 0
    },
    weeklyAverage: {
      type: Number,
      default: 0
    },
    monthlyAverage: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    peakUsagePeriod: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
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

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'out-of-stock';
  if (this.currentStock <= this.reorderLevel) return 'critical';
  if (this.currentStock <= this.minimumStock) return 'low';
  if (this.currentStock >= this.maximumStock) return 'overstock';
  return 'normal';
});

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  return Math.ceil((this.expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for stock percentage
inventorySchema.virtual('stockPercentage').get(function() {
  return Math.round((this.currentStock / this.maximumStock) * 100);
});

// Indexes for better query performance
inventorySchema.index({ itemCode: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ 'supplier.name': 1 });

// Pre-save middleware to calculate total value
inventorySchema.pre('save', function(next) {
  this.totalValue = this.currentStock * this.unitPrice;
  next();
});

// Method to add stock
inventorySchema.methods.addStock = function(quantity, reason, handledBy, reference) {
  const previousStock = this.currentStock;
  this.currentStock += quantity;
  
  this.stockMovements.push({
    type: 'purchase',
    quantity: quantity,
    previousStock: previousStock,
    newStock: this.currentStock,
    reason: reason,
    reference: reference,
    handledBy: handledBy
  });
  
  return this.save();
};

// Method to consume stock
inventorySchema.methods.consumeStock = function(quantity, reason, handledBy, reference) {
  if (this.currentStock < quantity) {
    throw new Error('Insufficient stock available');
  }
  
  const previousStock = this.currentStock;
  this.currentStock -= quantity;
  
  this.stockMovements.push({
    type: 'usage',
    quantity: quantity,
    previousStock: previousStock,
    newStock: this.currentStock,
    reason: reason,
    reference: reference,
    handledBy: handledBy
  });
  
  this.usage.lastUsed = new Date();
  return this.save();
};

// Method to check and create alerts
inventorySchema.methods.checkAndCreateAlerts = function() {
  const alerts = [];
  
  // Low stock alert
  if (this.currentStock <= this.reorderLevel) {
    alerts.push({
      type: 'low-stock',
      message: `${this.itemName} is running low. Current stock: ${this.currentStock} ${this.unit}`,
      severity: 'high'
    });
  }
  
  // Out of stock alert
  if (this.currentStock <= 0) {
    alerts.push({
      type: 'out-of-stock',
      message: `${this.itemName} is out of stock`,
      severity: 'critical'
    });
  }
  
  // Expiry warning alert
  if (this.expiryDate && this.daysUntilExpiry <= 7) {
    alerts.push({
      type: 'expiry-warning',
      message: `${this.itemName} will expire in ${this.daysUntilExpiry} days`,
      severity: this.daysUntilExpiry <= 3 ? 'high' : 'medium'
    });
  }
  
  this.alerts.push(...alerts);
  return this.save();
};

module.exports = mongoose.model('Inventory', inventorySchema);
