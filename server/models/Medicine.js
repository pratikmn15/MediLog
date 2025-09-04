import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic Info (matching frontend)
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  dosage: { 
    type: String, 
    required: true 
  },
  
  // Frequency and Times
  frequency: {
    type: String,
    required: true,
    enum: ['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'custom']
  },
  times: [{
    type: String, // HH:MM format
    required: true
  }],
  
  // Duration
  duration: { type: String }, // Text field like "7 days, 2 weeks"
  startDate: { type: Date },
  endDate: { type: Date },
  
  // Instructions
  instructions: { type: String },
  
  // Meal Instructions (matching frontend checkboxes)
  beforeMeal: { type: Boolean, default: false },
  afterMeal: { type: Boolean, default: false },
  withFood: { type: Boolean, default: false },
  
  // Reminder
  reminderEnabled: { type: Boolean, default: true },
  
  // Status
  isActive: { type: Boolean, default: true }
  
}, { timestamps: true });

// Index for efficient queries
medicineSchema.index({ user: 1, isActive: 1 });

export default mongoose.model('Medicine', medicineSchema);