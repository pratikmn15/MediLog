// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleCalendarService, calendarUtils } from '../services/googleCalendarService';
import Layout from '../components/Layout';
import {
  FiSettings, FiCalendar, FiExternalLink, FiRefreshCw,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiUser
} from 'react-icons/fi';

const Settings = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState({
    connected: false,
    connectedAt: null
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check for OAuth callback
    const { calendarStatus: callbackStatus, hasCallback } = calendarUtils.parseCallbackParams();
    if (hasCallback) {
      handleOAuthCallback(callbackStatus);
      calendarUtils.cleanCallbackUrl();
    }

    fetchCalendarStatus();
  }, [isAuthenticated, navigate]);

  const fetchCalendarStatus = async () => {
    try {
      setLoading(true);
      const result = await googleCalendarService.checkStatus(token);
      
      if (result.success) {
        setCalendarStatus(result.data);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check calendar status' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = (status) => {
    if (status === 'connected') {
      setMessage({ 
        type: 'success', 
        text: 'Google Calendar connected successfully!' 
      });
    } else if (status === 'error') {
      setMessage({ 
        type: 'error', 
        text: 'Failed to connect Google Calendar. Please try again.' 
      });
    }
  };

  const handleConnectCalendar = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });

      const result = await googleCalendarService.getAuthUrl(token);
      
      if (result.success) {
        // Redirect to Google OAuth
        window.location.href = result.data.authUrl;
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to initiate calendar connection' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? Future appointments will not be synced.')) {
      return;
    }

    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });

      const result = await googleCalendarService.disconnect(token);
      
      if (result.success) {
        setCalendarStatus({ connected: false, connectedAt: null });
        setMessage({ 
          type: 'success', 
          text: 'Google Calendar disconnected successfully' 
        });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect calendar' });
    } finally {
      setActionLoading(false);
    }
  };

  const connectionStatus = calendarUtils.formatConnectionStatus(
    calendarStatus.connected, 
    calendarStatus.connectedAt
  );

  if (loading) {
    return (
      <Layout>
        <div className="py-8 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <FiSettings className="text-2xl text-green-400" />
              <h2 className="text-2xl font-bold text-slate-200">Settings</h2>
            </div>
            <p className="text-sm text-slate-400">
              Manage your account preferences and integrations
            </p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 flex items-center gap-3 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-900/40 border-green-800 text-green-300' 
                : 'bg-red-900/40 border-red-800 text-red-300'
            }`}>
              {message.type === 'success' ? (
                <FiCheckCircle className="text-lg shrink-0" />
              ) : (
                <FiAlertCircle className="text-lg shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {/* Settings Sections */}
          <div className="space-y-6">
            
            {/* Profile Section */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiUser className="text-lg text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-200">Profile Settings</h3>
              </div>
              <div className="text-sm text-slate-400 mb-4">
                Manage your personal information and medical details
              </div>
              <button
                onClick={() => navigate('/user-details')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Edit Profile
              </button>
            </div>

            {/* Google Calendar Integration */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiCalendar className="text-lg text-green-400" />
                <h3 className="text-lg font-semibold text-slate-200">Google Calendar Integration</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{connectionStatus.icon}</span>
                  <span className={`text-sm font-medium ${connectionStatus.color}`}>
                    {connectionStatus.text}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {calendarStatus.connected
                    ? 'Your appointments will automatically sync to Google Calendar when created.'
                    : 'Connect your Google Calendar to automatically sync appointments and receive reminders.'
                  }
                </p>
              </div>

              <div className="flex gap-3">
                {!calendarStatus.connected ? (
                  <button
                    onClick={handleConnectCalendar}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {actionLoading ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <FiExternalLink />
                    )}
                    {actionLoading ? 'Connecting...' : 'Connect Google Calendar'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={fetchCalendarStatus}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <FiRefreshCw className={actionLoading ? 'animate-spin' : ''} />
                      Refresh Status
                    </button>
                    <button
                      onClick={handleDisconnectCalendar}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <FiXCircle />
                      Disconnect
                    </button>
                  </>
                )}
              </div>

              {calendarStatus.connected && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-800/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FiCheckCircle className="text-green-400 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="text-green-300 font-medium mb-1">Calendar Integration Active</p>
                      <p className="text-green-200/80">
                        New appointments will automatically appear in your Google Calendar with reminders.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Future Settings Sections */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiSettings className="text-lg text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-200">Notifications</h3>
              </div>
              <div className="text-sm text-slate-400 mb-4">
                Configure email and reminder preferences
              </div>
              <div className="text-sm text-slate-500">
                Coming soon - Email notification preferences, reminder timing, etc.
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;