import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import sendEmail from '../utils/sendEmail.js';

// Schedule runs every minute
cron.schedule('* * * * *', async () => {
  try {
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

    for (const appointment of appointments) {
      try {
        await sendEmail(
          appointment.user.email, 
          'Appointment Reminder', 
          `Hello ${appointment.user.name}, your appointment with ${appointment.doctorName} is scheduled for ${appointment.appointmentDate.toLocaleString()}.`
        );
        
        // Mark reminder as sent to prevent duplicate reminders
        await Appointment.findByIdAndUpdate(appointment._id, {
          'reminder.lastSent': new Date()
        });
        
        console.log(`Reminder sent to ${appointment.user.email} for appointment with ${appointment.doctorName}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
});

console.log('Reminder scheduler started');
