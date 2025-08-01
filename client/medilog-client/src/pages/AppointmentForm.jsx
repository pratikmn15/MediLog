import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    appointmentDate: '',
    reason: '',
    reminder: {
      enabled: false,
      type: 'one-time',
      timeBefore: 60,
      startFrom: ''
    }
  });

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
      // Format the data before sending
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Schedule Appointment
          </h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Appointment Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Appointment Details</h3>
            
            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Doctor Name *
              </label>
              <input 
                id="doctorName"
                name="doctorName" 
                placeholder="Enter doctor's name" 
                value={formData.doctorName} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Appointment Date & Time *
              </label>
              <input 
                id="appointmentDate"
                type="datetime-local" 
                name="appointmentDate" 
                value={formData.appointmentDate} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Reason for Visit
              </label>
              <textarea 
                id="reason"
                name="reason" 
                placeholder="Enter reason for the appointment" 
                value={formData.reason} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                rows="3"
              />
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Reminder Settings</h3>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="reminderEnabled"
                name="reminder.enabled" 
                checked={formData.reminder.enabled} 
                onChange={handleChange} 
                className="mr-3 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
              />
              <label htmlFor="reminderEnabled" className="text-sm text-slate-700 dark:text-slate-300">
                Enable reminder for this appointment
              </label>
            </div>

            {formData.reminder.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reminderType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Reminder Type
                    </label>
                    <select 
                      id="reminderType"
                      name="reminder.type" 
                      value={formData.reminder.type} 
                      onChange={handleChange} 
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="one-time">One-time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="timeBefore" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Remind me (minutes before)
                    </label>
                    <select 
                      id="timeBefore"
                      name="reminder.timeBefore" 
                      value={formData.reminder.timeBefore} 
                      onChange={handleChange} 
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
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
                    <label htmlFor="startFrom" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start reminders from
                    </label>
                    <input 
                      id="startFrom"
                      type="datetime-local" 
                      name="reminder.startFrom" 
                      value={formData.reminder.startFrom} 
                      onChange={handleChange} 
                      className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
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
  );
};

export default AppointmentForm;