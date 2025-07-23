import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userDetailsRoutes from './routes/userDetailsRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import './jobs/reminderScheduler.js';
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user-details', userDetailsRoutes);
app.use('/api/appointments', appointmentRoutes);

// MongoDB Connect
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.log(err));
 
// app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));