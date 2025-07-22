import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // refers to the User model
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    default: Date.now
  },
  fileUrl: String // optional: store PDF/report/image link here
});

export default mongoose.model('HealthRecord', healthRecordSchema);
