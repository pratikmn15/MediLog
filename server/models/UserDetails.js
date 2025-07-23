import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Basic Info
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String }, // e.g., A+, O-, etc.

  // Contact Info
  phone: { type: String },
  // Remove email field from here since it will come from User model
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },

  // Medical Info
  allergies: [String],
  chronicDiseases: [String],
  currentMedications: [String],
  surgeries: [{
    name: String,
    date: Date,
    notes: String
  }],

  // Emergency Contact
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },

  // Insurance
  insuranceProvider: String,
  policyNumber: String,
  validTill: Date,

  // Misc
  notes: String
}, { timestamps: true });

export default mongoose.model('UserDetails', userDetailsSchema);
