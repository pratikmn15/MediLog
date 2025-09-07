import React, { useState, useEffect } from 'react'; // Add useEffect
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
// Add these imports
import { googleCalendarService } from '../services/googleCalendarService';
import { FiCalendar } from 'react-icons/fi';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Add calendar state
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [checkingCalendar, setCheckingCalendar] = useState(true);
  
  const [formData, setFormData] = useState({
    doctorName: '',
    appointmentDate: '',
    reason: '',
    syncWithGoogleCalendar: false, // Add this field
    reminder: {
      enabled: false,
      type: 'one-time',
      timeBefore: 60,
      startFrom: ''
    }
  });

  // Check calendar status when component loads
  useEffect(() => {
    const checkCalendarStatus = async () => {
      if (token) {
        try {
          const result = await googleCalendarService.checkStatus(token);
          if (result.success) {
            setCalendarConnected(result.data.connected);
            // Auto-enable if connected
            if (result.data.connected) {
              setFormData(prev => ({ ...prev, syncWithGoogleCalendar: true }));
            }
          }
        } catch (error) {
          console.error('Error checking calendar status:', error);
        } finally {
          setCheckingCalendar(false);
        }
      }
    };

    if (isAuthenticated) {
      checkCalendarStatus();
    }
  }, [token, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('reminder.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        reminder: {
          ...prev.reminder,
          [key]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentData = {
        ...formData,
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        reminder: {
          ...formData.reminder,
          timeBefore: parseInt(formData.reminder.timeBefore),
          startFrom: formData.reminder.startFrom ? new Date(formData.reminder.startFrom).toISOString() : null
        }
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/appointments`,
        appointmentData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      alert('Appointment scheduled successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="py-8 px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-200">
              Schedule Appointment
            </h2>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/40 border border-slate-700/60 rounded-lg p-6">
            {/* Basic Appointment Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-300">Appointment Details</h3>
              
              <div>
                <label htmlFor="doctorName" className="block text-sm font-medium text-slate-300 mb-2">
                  Doctor Name *
                </label>
                <input 
                  id="doctorName"
                  name="doctorName" 
                  placeholder="Enter doctor's name" 
                  value={formData.doctorName} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                  required
                />
              </div>

              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-slate-300 mb-2">
                  Appointment Date & Time *
                </label>
                <input 
                  id="appointmentDate"
                  type="datetime-local" 
                  name="appointmentDate" 
                  value={formData.appointmentDate} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-300 mb-2">
                  Reason for Visit
                </label>
                <textarea 
                  id="reason"
                  name="reason" 
                  placeholder="Enter reason for the appointment" 
                  value={formData.reason} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                  rows="3"
                />
              </div>
            </div>

            {/* Google Calendar Toggle */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-300">Calendar Integration</h3>
              
              {checkingCalendar ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                  <span className="text-sm">Checking Google Calendar connection...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-blue-400" />
                    <div>
                      <label htmlFor="syncWithGoogleCalendar" className="text-sm font-medium text-slate-300">
                        Sync with Google Calendar
                      </label>
                      <p className="text-xs text-slate-400">
                        {calendarConnected 
                          ? 'Add this appointment to your Google Calendar with reminders'
                          : 'Google Calendar not connected - only email reminders will be sent'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!calendarConnected && (
                      <button
                        type="button"
                        onClick={() => navigate('/settings')}
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        Connect
                      </button>
                    )}
                    <input 
                      type="checkbox" 
                      id="syncWithGoogleCalendar"
                      name="syncWithGoogleCalendar" 
                      checked={formData.syncWithGoogleCalendar} 
                      onChange={handleChange}
                      disabled={!calendarConnected}
                      className="rounded border-slate-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Reminder Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-300">Email Reminder Settings</h3>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="reminderEnabled"
                  name="reminder.enabled" 
                  checked={formData.reminder.enabled} 
                  onChange={handleChange} 
                  className="mr-3 rounded border-slate-600 focus:ring-blue-500"
                />
                <label htmlFor="reminderEnabled" className="text-sm text-slate-300">
                  Enable email reminder for this appointment
                </label>
              </div>

              {formData.reminder.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reminderType" className="block text-sm font-medium text-slate-300 mb-2">
                        Reminder Type
                      </label>
                      <select 
                        id="reminderType"
                        name="reminder.type" 
                        value={formData.reminder.type} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                      >
                        <option value="one-time">One-time</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="timeBefore" className="block text-sm font-medium text-slate-300 mb-2">
                        Remind me (minutes before)
                      </label>
                      <select 
                        id="timeBefore"
                        name="reminder.timeBefore" 
                        value={formData.reminder.timeBefore} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="360">6 hours</option>
                        <option value="720">12 hours</option>
                        <option value="1440">1 day</option>
                      </select>
                    </div>
                  </div>

                  {formData.reminder.type !== 'one-time' && (
                    <div>
                      <label htmlFor="startFrom" className="block text-sm font-medium text-slate-300 mb-2">
                        Start reminders from
                      </label>
                      <input 
                        id="startFrom"
                        type="datetime-local" 
                        name="reminder.startFrom" 
                        value={formData.reminder.startFrom} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentForm;