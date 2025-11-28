// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Basic Information
    bookingId: {
      type: String,
      unique: true,
      default: function () {
        return (
          "BK" +
          Date.now() +
          Math.random().toString(36).substr(2, 5).toUpperCase()
        );
      },
    },

    // User Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // Meal Information
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyMenu",
      required: [true, "Menu item is required"],
    },
    selectedItemIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    itemName: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [10, "Maximum 10 items per booking"],
    },

    // Booking Details
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks"],
      required: [true, "Meal type is required"],
    },
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    mealTime: {
      type: String,
      required: [true, "Meal time is required"],
    },

    // Pricing
    itemPrice: {
      type: Number,
      required: [true, "Item price is required"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: [true, "Final amount is required"],
    },

    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "prepared",
        "served",
        "completed",
        "cancelled",
        "no-show",
      ],
      default: "pending",
    },

    // Payment Information
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["wallet", "upi", "cash"],
      default: "wallet",
    },
    transactionId: String,

    // Special Requests
    specialRequests: {
      type: String,
      maxlength: [200, "Special requests cannot exceed 200 characters"],
    },
    dietaryPreferences: [String],

    // QR Code for Check-in
    qrCode: {
      data: String,
      url: String,
      expiresAt: Date,
    },

    // Timing
    estimatedPickupTime: Date,
    actualPickupTime: Date,
    preparationStartTime: Date,
    preparationEndTime: Date,

    // Feedback
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: [500, "Feedback cannot exceed 500 characters"],
      },
      submittedAt: Date,
    },

    // Cancellation
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Admin Notes
    adminNotes: String,
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for booking age (in minutes)
bookingSchema.virtual("bookingAge").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60));
});

// Virtual for preparation duration
bookingSchema.virtual("preparationDuration").get(function () {
  if (this.preparationStartTime && this.preparationEndTime) {
    return Math.floor(
      (this.preparationEndTime - this.preparationStartTime) / (1000 * 60)
    );
  }
  return null;
});

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ menuItem: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ mealType: 1 });
bookingSchema.index({ bookingId: 1 });

// Pre-save middleware to calculate final amount
bookingSchema.pre("save", function (next) {
  // Ensure finalAmount is calculated if totalAmount or discount changes
  if (this.isModified("totalAmount") || this.isModified("discount")) {
    this.finalAmount = this.totalAmount - (this.discount || 0);
  }

  // Ensure finalAmount exists even if not explicitly set
  if (!this.finalAmount && this.totalAmount) {
    this.finalAmount = this.totalAmount - (this.discount || 0);
  }

  next();
});

// Method to confirm booking
bookingSchema.methods.confirm = async function () {
  this.status = "confirmed";
  this.estimatedPickupTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
  return await this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = async function (reason, cancelledBy) {
  this.status = "cancelled";
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  if (cancelledBy) {
    this.cancelledBy = cancelledBy;
  }

  // Mark payment as refunded if it was paid
  if (this.paymentStatus === "paid") {
    this.paymentStatus = "refunded";
  }

  return await this.save();
};

// Method to mark as prepared
bookingSchema.methods.markPrepared = async function () {
  this.status = "prepared";
  this.preparationEndTime = new Date();
  return await this.save();
};

// Method to mark as served
bookingSchema.methods.markServed = async function () {
  this.status = "served";
  this.actualPickupTime = new Date();
  return await this.save();
};

// Method to add feedback
bookingSchema.methods.addFeedback = function (rating, comment) {
  this.feedback = {
    rating: rating,
    comment: comment,
    submittedAt: new Date(),
  };
  return this.save();
};

// Method to generate QR code
bookingSchema.methods.generateQRCode = async function () {
  const QRCode = require("qrcode");
  const qrData = {
    bookingId: this.bookingId,
    userId: this.user,
    mealType: this.mealType,
    timestamp: Date.now(),
  };

  const qrString = JSON.stringify(qrData);
  const qrUrl = await QRCode.toDataURL(qrString);

  this.qrCode = {
    data: qrString,
    url: qrUrl,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  return this.save();
};

module.exports = mongoose.model("Booking", bookingSchema);
