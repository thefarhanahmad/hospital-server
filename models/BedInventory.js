const mongoose = require('mongoose');

const bedInventorySchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  ward: {
    type: String,
    required: true,
    enum: ['general', 'private', 'semi-private', 'icu', 'nicu', 'emergency']
  },
  totalBeds: {
    type: Number,
    required: true,
    min: 0
  },
  occupiedBeds: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.totalBeds;
      },
      message: 'Occupied beds cannot exceed total beds'
    }
  },
  charges: {
    base: {
      type: Number,
      required: true,
      min: 0
    },
    nursing: Number,
    oxygen: Number,
    ventilator: Number
  },
  facilities: [{
    name: String,
    available: Boolean,
    additionalCharge: Number
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bedInventorySchema.virtual('availableBeds').get(function() {
  return this.totalBeds - this.occupiedBeds;
});

module.exports = mongoose.model('BedInventory', bedInventorySchema);