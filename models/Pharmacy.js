const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
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
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String,
    close: String
  }],
  is24x7: {
    type: Boolean,
    default: false
  },
  // inventory: [{
  //   medicine: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Medicine'
  //   },
  //   quantity: Number,
  //   price: Number
  // }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);