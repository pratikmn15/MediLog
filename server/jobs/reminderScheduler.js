import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// Schedule runs every 15 minutes (more efficient)
cron.schedule('*/15 * * * *', async () => {
  try {
    // Check if reminders are enabled
    if (process.env.REMINDERS_ENABLED !== 'true') {
      console.log('📧 Email reminders are DISABLED in environment variables');
      return;
    }

    console.log('🔍 Checking for appointment reminders...');
    const now = new Date();
    
    // Find appointments that need reminders AND haven't been sent yet
    const appointments = await Appointment.find({
      'reminder.enabled': true,
      appointmentDate: { $gte: now }, // Only future appointments
      'reminder.lastSent': { $exists: false }, // Haven't sent reminder yet
      // Check if reminder should be sent based on timeBefore setting
      $expr: {
        $lte: [
          { $subtract: ['$appointmentDate', { $multiply: ['$reminder.timeBefore', 60000] }] },
          now
        ]
      }
    }).populate('user');

    console.log(`📧 Found ${appointments.length} appointments needing reminders`);

    for (const appointment of appointments) {
      try {
        // Check if user has Google Calendar connected
        const user = await User.findById(appointment.user._id);
        
        // Only send email if user is NOT connected to Google Calendar
        if (!user.googleCalendar?.connected) {
          await sendEmail(
            appointment.user.email, 
            'Appointment Reminder - MediTracker', 
            `Hello,\n\nThis is a reminder that you have an appointment with ${appointment.doctorName} scheduled for ${appointment.appointmentDate.toLocaleString()}.\n\nReason: ${appointment.reason || 'Not specified'}\n\nPlease make sure to attend your appointment on time.\n\nBest regards,\nMediTracker Team`
          );
          
          console.log(`✅ Email reminder sent to ${appointment.user.email} for appointment with ${appointment.doctorName}`);
        } else {
          console.log(`⏭️ Skipping email for ${appointment.user.email} - Google Calendar connected (they get Google reminders)`);
        }
        
        // Mark reminder as sent
        await Appointment.findByIdAndUpdate(appointment._id, {
          'reminder.lastSent': new Date()
        });
        
      } catch (emailError) {
        console.error('❌ Failed to send email reminder:', emailError);
      }
    }
  } catch (error) {
    console.error('❌ Error in reminder scheduler:', error);
  }
});

console.log('📧 Email reminder scheduler started (runs every 15 minutes)');
console.log('📧 Email reminders enabled:', process.env.REMINDERS_ENABLED === 'true');
