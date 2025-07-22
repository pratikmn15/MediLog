import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const { logout } = useAuth();
  const { token, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      // const token = localStorage.getItem('token');
      
      if (!isAuthenticated || !token) {
        navigate('/login');
        return;
      }

      // try {
      //   const response = await axios.get(
      //     `${import.meta.env.VITE_API_BASE_URL}/user/profile`,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${token}`
      //       }
      //     }
      //   );
      //   setUser(response.data);
      // } catch (err) {
      //   console.error('Dashboard error:', err);
      //   if (err.response?.status === 401) {
      //     localStorage.removeItem('token');
      //     navigate('/login');
      //   }
      //   setError(err.response?.data?.message || 'Failed to fetch user data');
      // } finally {
      //   setLoading(false);
      // }
    };

    fetchUserData();
  }, [navigate, token, isAuthenticated, logout]);

  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   navigate('/login');
  // };



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
        <div className="p-4 text-red-500 bg-red-100 dark:bg-red-900/50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {user?.name}!
            </h1>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/user-details')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                Update Profile
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Your Profile
          </h2>
          <div className="space-y-2">
            {user?.email && (
              <p className="text-slate-600 dark:text-slate-300">
                Email: {user.email}
              </p>
            )}
            {user?.createdAt && (
              <p className="text-slate-600 dark:text-slate-300">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

