const mongoose = require('mongoose');

const pharmacyInventorySchema = new mongoose.Schema({
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  reorderLevel: {
    type: Number,
    default: 10
  },
  location: {
    rack: String,
    shelf: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
pharmacyInventorySchema.index({ pharmacy: 1, medicine: 1, batchNumber: 1 });

module.exports = mongoose.model('PharmacyInventory', pharmacyInventorySchema);