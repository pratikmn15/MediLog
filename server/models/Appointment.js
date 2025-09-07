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

  // Google Calendar Integration
  googleCalendar: {
    eventId: { type: String }, // Google Calendar event ID
    synced: { type: Boolean, default: false },
    lastSynced: { type: Date }
  },

  // Reminder Feature (keep existing for fallback)
  reminder: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['one-time', 'daily', 'weekly', 'monthly'], default: 'one-time' },
    timeBefore: { type: Number, default: 60 }, // in minutes
    startFrom: { type: Date },
    lastSent: { type: Date } // Track when reminder was last sent
  }

}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
