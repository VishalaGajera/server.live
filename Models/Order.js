const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for better performance
  },
  contact: {
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    }
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  shippingCost: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['creditcard', 'phonepe', 'googlepay', 'cod']
    },
    // Credit Card fields
    cardName: {
      type: String,
      trim: true
    },
    cardNumber: {
      type: String,
      trim: true
    },
    expiry: {
      type: String,
      trim: true
    },
    cvv: {
      type: String,
      trim: true
    },
    // PhonePe field
    phonepeNumber: {
      type: String,
      trim: true
    },
    // Google Pay field
    googlePayId: {
      type: String,
      trim: true
    }
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderNumber: {
    type: String,
    unique: true,
    sparse: true // Allow null values, but ensure uniqueness when present
  }
}, {
  timestamps: true
});

// Add indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });

// Generate order number ONLY if database is connected
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber && mongoose.connection.readyState === 1) {
    try {
      // Use a simpler approach to avoid countDocuments timeout
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.orderNumber = `ORD${timestamp}${random}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback to timestamp-based order number
      this.orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

