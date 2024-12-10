const mongoose = require('mongoose');

const pathologyLabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Laboratory name is required'],
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
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  tests: [{
    name: String,
    description: String,
    price: Number,
    turnaroundTime: String,
    requirements: [String]
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date
  }],
  sampleCollection: {
    homeCollection: Boolean,
    charges: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PathologyLab', pathologyLabSchema);