import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user details (for medical and personal info)
        const detailsResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user-details`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setUserDetails(detailsResponse.data);
        
      } catch (detailsErr) {
        console.error('Error fetching user details:', detailsErr);
        
        // If it's not a 404 (user details don't exist yet), handle the error
        if (detailsErr.response?.status === 401) {
          logout();
          navigate('/login');
        } else if (detailsErr.response?.status !== 404) {
          setError('Failed to load user data');
        }
        // 404 is okay - just means user hasn't filled out details yet
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token, isAuthenticated, logout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="p-4 text-red-500 bg-red-100 dark:bg-red-900/50 rounded-lg mb-4">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayName = userDetails?.fullName || 'User';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {displayName}!
            </h1>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/user-details')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                {userDetails ? 'Update Profile' : 'Complete Profile'}
              </button>
              <button 
                onClick={() => navigate('/appointments')}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
              >
                Schedule Appointment
              </button>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Overview */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Profile Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Full Name:</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {userDetails?.fullName || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Phone:</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {userDetails?.phone || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Date of Birth:</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {userDetails?.dateOfBirth 
                    ? new Date(userDetails.dateOfBirth).toLocaleDateString()
                    : 'Not provided'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Gender:</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {userDetails?.gender || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Blood Group:</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {userDetails?.bloodGroup || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Overview */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Medical Overview
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-600 dark:text-slate-400 block mb-1">Allergies:</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {userDetails?.allergies || 'None specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block mb-1">Chronic Diseases:</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {userDetails?.chronicDiseases || 'None specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block mb-1">Current Medications:</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {userDetails?.currentMedications || 'None specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 block mb-1">Insurance Provider:</span>
                <span className="text-slate-900 dark:text-slate-100">
                  {userDetails?.insuranceProvider || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {userDetails?.emergencyContact?.name && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Emergency Contact
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Name:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                    {userDetails.emergencyContact.name}
                  </span>  
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Relation:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                    {userDetails.emergencyContact.relation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Phone:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">
                    {userDetails.emergencyContact.phone}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Account Info */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Profile Status:</span>
                <span className={`font-medium ${userDetails ? 'text-green-600' : 'text-yellow-600'}`}>
                  {userDetails ? 'Complete' : 'Incomplete'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Address:</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {userDetails?.address?.city ? 
                    `${userDetails.address.city}, ${userDetails.address.state}` : 
                    'Not provided'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action for Incomplete Profile */}
        {!userDetails && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Complete your profile</strong> to get the most out of MediTracker. 
                  Add your medical history, emergency contacts, and other important information.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => navigate('/user-details')}
                  className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded text-sm font-medium"
                >
                  Complete Now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

