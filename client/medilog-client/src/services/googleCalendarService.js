// src/services/googleCalendarService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const googleCalendarService = {
  // Check if user's Google Calendar is connected
  checkStatus: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/google-calendar/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Calendar status check failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check calendar status'
      };
    }
  },

  // Get Google OAuth authorization URL
  getAuthUrl: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/google-calendar/auth-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get authorization URL'
      };
    }
  },

  // Disconnect Google Calendar
  disconnect: async (token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/google-calendar/disconnect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to disconnect calendar'
      };
    }
  }
};

// Utility functions for handling calendar integration
export const calendarUtils = {
  // Parse URL parameters for OAuth callback
  parseCallbackParams: () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      calendarStatus: urlParams.get('calendar'),
      hasCallback: urlParams.has('calendar')
    };
  },

  // Clean URL after handling callback
  cleanCallbackUrl: () => {
    const url = new URL(window.location);
    url.searchParams.delete('calendar');
    window.history.replaceState({}, document.title, url.pathname);
  },

  // Format connection status for display
  formatConnectionStatus: (connected, connectedAt) => {
    if (!connected) {
      return {
        status: 'disconnected',
        text: 'Not Connected',
        color: 'text-gray-500',
        icon: '❌'
      };
    }

    const date = connectedAt ? new Date(connectedAt).toLocaleDateString() : '';
    return {
      status: 'connected',
      text: `Connected ${date ? `on ${date}` : ''}`,
      color: 'text-green-500',
      icon: '✅'
    };
  },

  // Format sync status for appointments
  formatSyncStatus: (googleCalendar) => {
    if (!googleCalendar || !googleCalendar.synced) {
      return {
        synced: false,
        text: 'Local only',
        color: 'text-gray-400',
        icon: '📅'
      };
    }

    const lastSynced = googleCalendar.lastSynced 
      ? new Date(googleCalendar.lastSynced).toLocaleString()
      : '';

    return {
      synced: true,
      text: `Synced to Google Calendar ${lastSynced ? `at ${lastSynced}` : ''}`,
      color: 'text-green-500',
      icon: '📅',
      eventId: googleCalendar.eventId
    };
  },

  // Validate calendar connection before operations
  validateConnection: async (token) => {
    const result = await googleCalendarService.checkStatus(token);
    return result.success && result.data.connected;
  }
};