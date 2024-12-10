const mongoose = require('mongoose');

const diagnosticSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Diagnostic center name is required'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    website: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    turnaroundTime: String
  }],
  equipment: [{
    name: String,
    model: String,
    manufacturer: String,
    lastMaintenance: Date,
    nextMaintenance: Date
  }],
  accreditations: [{
    name: String,
    issuedBy: String,
    validUntil: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Diagnostic', diagnosticSchema);