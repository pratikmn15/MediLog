import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  reason: { type: String },

  // Reminder Feature
  reminder: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['one-time', 'daily', 'weekly', 'monthly'], default: 'one-time' },
    timeBefore: { type: Number, default: 60 }, // in minutes
    startFrom: { type: Date },
    lastSent: { type: Date } // Track when reminder was last sent
  }

}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
