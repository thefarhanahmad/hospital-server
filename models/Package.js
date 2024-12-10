const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['user', 'vendor'],
    required: true
  },
  vendorType: {
    type: String,
    enum: ['doctor', 'hospital', 'pharmacy', 'diagnostic', 'pathlab', 'bloodbank'],
    required: function() {
      return this.type === 'vendor';
    }
  },
  description: {
    type: String,
    required: [true, 'Package description is required']
  },
  price: {
    monthly: {
      type: Number,
      required: true,
      min: 0
    },
    yearly: {
      type: Number,
      required: true,
      min: 0
    }
  },
  features: [{
    name: String,
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  limits: {
    appointments: Number,
    orders: Number,
    reports: Number,
    storage: Number // in GB
  },
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);