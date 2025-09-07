import './App.css'
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserDetailsForm from './pages/UserDetailsForm';
import AppointmentForm from './pages/AppointmentForm';
import MedicineIntake from './pages/MedicineIntake';
import Settings from './pages/Settings';
import { Routes, Route, Navigate } from 'react-router-dom';
import RouteGuard from './components/RouteGuard';

function App() {
  return (
    <div className="w-full min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth pages - redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={
            <RouteGuard requireAuth={false}>
              <Login />
            </RouteGuard>
          } 
        />
        <Route 
          path="/register" 
          element={
            <RouteGuard requireAuth={false}>
              <Register />
            </RouteGuard>
          } 
        />
        
        {/* Protected pages - require authentication */}
        <Route
          path="/dashboard"
          element={
            <RouteGuard requireAuth={true}>
              <Dashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/user-details"
          element={
            <RouteGuard requireAuth={true}>
              <UserDetailsForm />
            </RouteGuard>
          }
        />
        <Route
          path="/appointments"
          element={
            <RouteGuard requireAuth={true}>
              <AppointmentForm />
            </RouteGuard>
          }
        />
        <Route 
          path="/medicines" 
          element={
            <RouteGuard>
              <MedicineIntake />
            </RouteGuard>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <RouteGuard>
              <Settings />
            </RouteGuard>
          } 
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
