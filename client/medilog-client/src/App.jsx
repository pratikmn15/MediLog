import './App.css'
import Login from './Pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserDetailsForm from './pages/UserDetailsForm';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';

function App() {
  return (
    <div className="w-full min-h-screen">
      <Routes>
        {/* Redirect root to login or dashboard based on auth status */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route 
          path="/login" 
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          } 
        />
        <Route 
          path="/register" 
          element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-details"
          element={
            <ProtectedRoute>
              <UserDetailsForm />
            </ProtectedRoute>
          }
        />
        {/* Add a catch-all route for 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
