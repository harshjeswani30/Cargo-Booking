import mongoose from 'mongoose';

const airportSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
airportSchema.index({ code: 1 });
airportSchema.index({ city: 1 });
airportSchema.index({ country: 1 });
airportSchema.index({ isActive: 1 });

export default mongoose.models.Airport || mongoose.model('Airport', airportSchema);
