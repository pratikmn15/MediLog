import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      user: req.user.id
    });
    
    await appointment.save();

    // Check if user has Google Calendar connected
    const user = await User.findById(req.user.id);

    if (user.googleCalendar?.connected && user.googleCalendar?.accessToken) {
      try {
        // Set up Google Calendar auth
        const { google } = await import('googleapis');
        
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
          access_token: user.googleCalendar.accessToken,
          refresh_token: user.googleCalendar.refreshToken,
        });

        // Create calendar event
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const appointmentStart = new Date(appointment.appointmentDate);
        const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

        const event = {
          summary: `Appointment with ${appointment.doctorName}`,
          description: `Reason: ${appointment.reason || 'Not specified'}\n\nCreated via MediTracker`,
          start: {
            dateTime: appointmentStart.toISOString(),
            timeZone: 'Asia/Kolkata',
          },
          end: {
            dateTime: appointmentEnd.toISOString(),
            timeZone: 'Asia/Kolkata',
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 60 },
              { method: 'popup', minutes: 60 },
            ],
          },
        };

        const calendarEvent = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        });
        
        // Update appointment with Google Calendar event ID
        appointment.googleCalendar = {
          eventId: calendarEvent.data.id,
          synced: true,
          lastSynced: new Date()
        };
        await appointment.save();

      } catch (calendarError) {
        console.error('Calendar sync failed:', calendarError.message);
        // Don't fail the appointment creation if calendar sync fails
      }
    }
    
    res.status(201).json({
      message: 'Appointment created successfully',
      data: appointment
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update Google Calendar event if synced
    if (appointment.googleCalendar?.synced && appointment.googleCalendar?.eventId) {
      const user = await User.findById(req.user.id);
      if (user.googleCalendar?.connected && user.googleCalendar?.accessToken) {
        try {
          const { google } = await import('googleapis');
          
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );

          oauth2Client.setCredentials({
            access_token: user.googleCalendar.accessToken,
            refresh_token: user.googleCalendar.refreshToken,
          });

          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
          
          const appointmentStart = new Date(appointment.appointmentDate);
          const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);

          const event = {
            summary: `Appointment with ${appointment.doctorName}`,
            description: `Reason: ${appointment.reason || 'Not specified'}\n\nUpdated via MediTracker`,
            start: {
              dateTime: appointmentStart.toISOString(),
              timeZone: 'Asia/Kolkata',
            },
            end: {
              dateTime: appointmentEnd.toISOString(),
              timeZone: 'Asia/Kolkata',
            },
          };

          await calendar.events.update({
            calendarId: 'primary',
            eventId: appointment.googleCalendar.eventId,
            resource: event,
          });

          appointment.googleCalendar.lastSynced = new Date();
          await appointment.save();

        } catch (calendarError) {
          console.error('Failed to update calendar event:', calendarError.message);
        }
      }
    }
    
    res.json({
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findOne({ _id: id, user: req.user.id });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Delete from Google Calendar if synced
    if (appointment.googleCalendar?.synced && appointment.googleCalendar?.eventId) {
      const user = await User.findById(req.user.id);
      if (user.googleCalendar?.connected && user.googleCalendar?.accessToken) {
        try {
          const { google } = await import('googleapis');
          
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );

          oauth2Client.setCredentials({
            access_token: user.googleCalendar.accessToken,
            refresh_token: user.googleCalendar.refreshToken,
          });

          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

          await calendar.events.delete({
            calendarId: 'primary',
            eventId: appointment.googleCalendar.eventId,
          });

        } catch (calendarError) {
          console.error('Failed to delete calendar event:', calendarError.message);
        }
      }
    }

    await Appointment.findByIdAndDelete(id);
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};