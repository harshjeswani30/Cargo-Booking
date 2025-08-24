const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const timelineEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['BOOKED', 'DEPARTED', 'ARRIVED', 'DELIVERED', 'CANCELLED'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  flightInfo: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
});

const bookingSchema = new mongoose.Schema({
  refId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `CRG${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  pieces: {
    type: Number,
    required: true,
    min: 1
  },
  weightKg: {
    type: Number,
    required: true,
    min: 0.1
  },
  status: {
    type: String,
    enum: ['BOOKED', 'DEPARTED', 'ARRIVED', 'DELIVERED', 'CANCELLED'],
    default: 'BOOKED'
  },
  flightIds: [{
    type: String,
    default: []
  }],
  timeline: [timelineEventSchema]
}, {
  timestamps: true
});

// Indexes for performance
bookingSchema.index({ refId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ origin: 1, destination: 1 });

// Pre-save middleware to add initial timeline event
bookingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      eventType: 'BOOKED',
      location: this.origin,
      notes: 'Booking created'
    });
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
