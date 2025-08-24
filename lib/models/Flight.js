import mongoose from 'mongoose';

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
  origin: {
    type: String,
    required: true
  },
  destination: {
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
  aircraftType: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  availableSpace: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'CANCELLED'],
    default: 'SCHEDULED'
  }
}, {
  timestamps: true
});

// Indexes for performance
flightSchema.index({ flightId: 1 });
flightSchema.index({ origin: 1, destination: 1 });
flightSchema.index({ departureDateTime: 1 });
flightSchema.index({ status: 1 });

export default mongoose.models.Flight || mongoose.model('Flight', flightSchema);
