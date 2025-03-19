const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subscription name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  billingCycle: {
    type: String,
    required: [true, 'Billing cycle is required'],
    enum: {
      values: ['monthly', 'yearly', 'weekly', 'quarterly'],
      message: 'Billing cycle must be monthly, yearly, weekly, or quarterly'
    }
  },
  nextBillingDate: {
    type: Date,
    required: [true, 'Next billing date is required']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // URL is optional
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid HTTP or HTTPS URL'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for monthly cost
subscriptionSchema.virtual('monthlyCost').get(function() {
  switch (this.billingCycle) {
    case 'monthly':
      return this.cost;
    case 'yearly':
      return this.cost / 12;
    case 'weekly':
      return this.cost * 4.33; // Average weeks per month
    case 'quarterly':
      return this.cost / 3;
    default:
      return this.cost;
  }
});

// Virtual for days until next billing
subscriptionSchema.virtual('daysUntilBilling').get(function() {
  const today = new Date();
  const nextBilling = new Date(this.nextBillingDate);
  const diffTime = nextBilling - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index for better query performance
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ category: 1 });
subscriptionSchema.index({ isActive: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema); 