import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `CLT${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  businessType: {
    type: String,
    enum: ['IMPORTER', 'EXPORTER', 'FREIGHT_FORWARDER', 'LOGISTICS_PROVIDER', 'MANUFACTURER', 'RETAILER', 'OTHER'],
    default: 'OTHER'
  },
  industry: {
    type: String,
    trim: true
  },
  accountType: {
    type: String,
    enum: ['STANDARD', 'PREMIUM', 'ENTERPRISE'],
    default: 'STANDARD'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentTerms: {
    type: String,
    enum: ['NET_30', 'NET_60', 'NET_90', 'IMMEDIATE'],
    default: 'NET_30'
  },
  notes: {
    type: String,
    trim: true
  },
  documents: [{
    type: {
      type: String,
      enum: ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'INSURANCE_CERTIFICATE', 'OTHER']
    },
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    preferredAirports: [String],
    cargoTypes: [String],
    specialRequirements: [String],
    communicationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      phone: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
clientSchema.index({ clientId: 1 });
clientSchema.index({ companyName: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ businessType: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ 'contactPerson.firstName': 1, 'contactPerson.lastName': 1 });

// Virtual for full name
clientSchema.virtual('contactPerson.fullName').get(function() {
  return `${this.contactPerson.firstName} ${this.contactPerson.lastName}`;
});

// Virtual for full address
clientSchema.virtual('address.fullAddress').get(function() {
  const parts = [this.address.street, this.address.city, this.address.state, this.address.country, this.address.postalCode];
  return parts.filter(Boolean).join(', ');
});

export default mongoose.models.Client || mongoose.model('Client', clientSchema);
