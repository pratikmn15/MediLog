import './App.css'
import Login from './Pages/Login';
import Register from './pages/Register';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="w-full min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Add other routes as needed */}
      </Routes>
    </div>
  )
}

export default App
