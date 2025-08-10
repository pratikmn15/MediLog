import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();
// Prefer environment variable; fallback to localhost
const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token')); // lazy init
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false); // no flash phase if only reading localStorage

  // Supports two modes:
  // 1) login(email, password) -> performs API call, returns { success, message }
  // 2) login(token, null) -> direct token injection (e.g. SSO) maintaining backward compatibility
  const login = async (arg1, arg2) => {
    // Mode 1: credentials supplied
    if (arg2 !== null && typeof arg2 === 'string') {
      const email = arg1;
      const password = arg2;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        const newToken = res.data?.token;
        if (!newToken) {
          return { success: false, message: 'No token returned' };
        }
        localStorage.setItem('token', newToken);
        setToken(newToken);
        // Optionally store minimal user object if returned
        if (res.data?.user) setUser(res.data.user);
        return { success: true, message: 'Logged in' };
      } catch (err) {
        const msg = err.response?.data?.message || 'Login failed';
        return { success: false, message: msg };
      }
    }
    // Mode 2: direct token (legacy usage): login(token)
    const directToken = arg1;
    if (directToken) {
      localStorage.setItem('token', directToken);
      setToken(directToken);
      return { success: true, message: 'Token set' };
    }
    return { success: false, message: 'Invalid login invocation' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated,
      authLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
