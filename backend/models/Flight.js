const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightId: {
    type: String,
    required: true,
    unique: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  airlineName: {
    type: String,
    required: true
  },
  departureDateTime: {
    type: Date,
    required: true
  },
  arrivalDateTime: {
    type: Date,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
flightSchema.index({ origin: 1, destination: 1, departureDateTime: 1 });
flightSchema.index({ flightId: 1 });

module.exports = mongoose.model('Flight', flightSchema);
