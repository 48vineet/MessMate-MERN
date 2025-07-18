// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // Basic Information
  feedbackId: {
    type: String,
    unique: true,
    default: function() {
      return 'FB' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Related Information
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  },
  
  // Feedback Type
  feedbackType: {
    type: String,
    enum: ['meal-review', 'service-feedback', 'app-feedback', 'complaint', 'suggestion'],
    required: [true, 'Feedback type is required']
  },
  
  // Rating
  rating: {
    overall: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Overall rating is required']
    },
    taste: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    },
    hygiene: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Review Content
  title: {
    type: String,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  // Categories
  category: {
    type: String,
    enum: ['food-quality', 'taste', 'service', 'hygiene', 'pricing', 'app-experience', 'other'],
    required: [true, 'Category is required']
  },
  
  // Sentiment Analysis
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },
  
  // Media
  images: [{
    public_id: String,
    url: String,
    description: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Helpful Votes
  helpfulVotes: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    },
    voters: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      vote: {
        type: String,
        enum: ['helpful', 'not-helpful']
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Admin Response
  adminResponse: {
    response: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'responded', 'escalated']
    }
  },
  
  // Follow-up
  followUp: {
    isRequired: {
      type: Boolean,
      default: false
    },
    scheduledAt: Date,
    completedAt: Date,
    notes: String
  },
  
  // Resolution
  resolution: {
    isResolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNotes: String,
    resolutionRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Escalation
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalationReason: String,
    escalationLevel: {
      type: String,
      enum: ['manager', 'senior-manager', 'director']
    }
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceType: String,
    location: String,
    source: String // web, mobile, app
  },
  
  // Tags
  tags: [String],
  
  // Internal Notes
  internalNotes: String

}, {
  timestamps: true
});

// Virtual for feedback age (in days)
feedbackSchema.virtual('feedbackAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for average rating
feedbackSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating.overall,
    this.rating.taste,
    this.rating.quality,
    this.rating.service,
    this.rating.hygiene,
    this.rating.value
  ].filter(r => r !== undefined);
  
  if (ratings.length === 0) return this.rating.overall;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Virtual for helpful percentage
feedbackSchema.virtual('helpfulPercentage').get(function() {
  const total = this.helpfulVotes.helpful + this.helpfulVotes.notHelpful;
  if (total === 0) return 0;
  return (this.helpfulVotes.helpful / total) * 100;
});

// Indexes for better query performance
feedbackSchema.index({ feedbackId: 1 });
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ booking: 1 });
feedbackSchema.index({ menuItem: 1 });
feedbackSchema.index({ feedbackType: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ 'rating.overall': -1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ createdAt: -1 });

// Pre-save middleware to analyze sentiment
feedbackSchema.pre('save', function(next) {
  if (this.isModified('comment')) {
    // Simple sentiment analysis (in production, use a proper sentiment analysis service)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'fantastic', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disgusting', 'horrible', 'poor'];
    
    const comment = this.comment.toLowerCase();
    const positiveCount = positiveWords.filter(word => comment.includes(word)).length;
    const negativeCount = negativeWords.filter(word => comment.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      this.sentiment.label = 'positive';
      this.sentiment.score = 0.5;
    } else if (negativeCount > positiveCount) {
      this.sentiment.label = 'negative';
      this.sentiment.score = -0.5;
    } else {
      this.sentiment.label = 'neutral';
      this.sentiment.score = 0;
    }
  }
  next();
});

// Method to acknowledge feedback
feedbackSchema.methods.acknowledge = function(acknowledgedBy) {
  this.status = 'acknowledged';
  this.adminResponse.status = 'pending';
  return this.save();
};

// Method to add admin response
feedbackSchema.methods.addAdminResponse = function(response, respondedBy) {
  this.adminResponse.response = response;
  this.adminResponse.respondedBy = respondedBy;
  this.adminResponse.respondedAt = new Date();
  this.adminResponse.status = 'responded';
  this.status = 'in-progress';
  return this.save();
};

// Method to mark as resolved
feedbackSchema.methods.markResolved = function(resolvedBy, notes) {
  this.resolution.isResolved = true;
  this.resolution.resolvedAt = new Date();
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolutionNotes = notes;
  this.status = 'resolved';
  return this.save();
};

// Method to escalate feedback
feedbackSchema.methods.escalate = function(escalatedBy, reason, level) {
  this.escalation.isEscalated = true;
  this.escalation.escalatedAt = new Date();
  this.escalation.escalatedBy = escalatedBy;
  this.escalation.escalationReason = reason;
  this.escalation.escalationLevel = level;
  this.priority = 'urgent';
  return this.save();
};

// Method to add helpful vote
feedbackSchema.methods.addHelpfulVote = function(userId, vote) {
  // Check if user has already voted
  const existingVote = this.helpfulVotes.voters.find(v => v.user.toString() === userId.toString());
  
  if (existingVote) {
    // Update existing vote
    if (existingVote.vote === 'helpful') {
      this.helpfulVotes.helpful -= 1;
    } else {
      this.helpfulVotes.notHelpful -= 1;
    }
    
    existingVote.vote = vote;
    existingVote.votedAt = new Date();
  } else {
    // Add new vote
    this.helpfulVotes.voters.push({
      user: userId,
      vote: vote
    });
  }
  
  // Update counts
  if (vote === 'helpful') {
    this.helpfulVotes.helpful += 1;
  } else {
    this.helpfulVotes.notHelpful += 1;
  }
  
  return this.save();
};

module.exports = mongoose.model('Feedback', feedbackSchema);
