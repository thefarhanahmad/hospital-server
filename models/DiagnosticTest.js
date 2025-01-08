const mongoose = require('mongoose');

const diagnosticTestSchema = new mongoose.Schema({
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['radiology', 'imaging', 'cardiology', 'neurology', 'other']
  },
  description: String,
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  preparationInstructions: [String],
  turnaroundTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days'],
      default: 'hours'
    }
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DiagnosticTest', diagnosticTestSchema);