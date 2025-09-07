import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  // Google Calendar Integration
  googleCalendar: {
    connected: { type: Boolean, default: false },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiry: { type: Date },
  },
  
  profileCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
