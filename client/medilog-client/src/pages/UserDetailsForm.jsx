import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDetailsForm = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
    surgeries: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
    },
    insuranceProvider: '',
    policyNumber: '',
    validTill: '',
    notes: '',
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isAuthenticated || !token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user-details`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data) {
          setFormData(prevData => ({
            ...prevData,
            ...response.data,
            address: { ...prevData.address, ...(response.data.address || {}) },
            emergencyContact: { ...prevData.emergencyContact, ...(response.data.emergencyContact || {}) }
          }));
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load user details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [token, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('address.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else if (name.includes('emergencyContact.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [key]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user-details`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      alert('Details saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving details');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.fullName) {
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
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Patient Information
          </h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="fullName" 
                placeholder="Full Name" 
                value={formData.fullName} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                required
              />
              <input 
                type="date" 
                name="dateOfBirth" 
                value={formData.dateOfBirth?.split('T')[0] || ''} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input 
                name="bloodGroup" 
                placeholder="Blood Group (e.g. A+)" 
                value={formData.bloodGroup} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="phone" 
                placeholder="Phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="email" 
                placeholder="Email" 
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="address.line1" 
                placeholder="Line 1" 
                value={formData.address.line1} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="address.line2" 
                placeholder="Line 2" 
                value={formData.address.line2} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="address.city" 
                placeholder="City" 
                value={formData.address.city} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="address.state" 
                placeholder="State" 
                value={formData.address.state} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="address.zip" 
                placeholder="ZIP Code" 
                value={formData.address.zip} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="address.country" 
                placeholder="Country" 
                value={formData.address.country} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Medical Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Medical History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="allergies" 
                placeholder="Allergies (comma-separated)" 
                value={formData.allergies} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="chronicDiseases" 
                placeholder="Chronic Diseases (comma-separated)" 
                value={formData.chronicDiseases} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="currentMedications" 
                placeholder="Current Medications (comma-separated)" 
                value={formData.currentMedications} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="surgeries" 
                placeholder="Past Surgeries (comma-separated names)" 
                value={formData.surgeries} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="emergencyContact.name" 
                placeholder="Name" 
                value={formData.emergencyContact.name} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="emergencyContact.relation" 
                placeholder="Relation" 
                value={formData.emergencyContact.relation} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="emergencyContact.phone" 
                placeholder="Phone" 
                value={formData.emergencyContact.phone} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Insurance Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Insurance Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="insuranceProvider" 
                placeholder="Insurance Provider" 
                value={formData.insuranceProvider} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                name="policyNumber" 
                placeholder="Policy Number" 
                value={formData.policyNumber} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <input 
                type="date" 
                name="validTill" 
                placeholder="Valid Till" 
                value={formData.validTill?.split('T')[0] || ''} 
                onChange={handleChange} 
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Additional Notes</h3>
            <textarea 
              name="notes" 
              placeholder="Any additional information or notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              rows="4"
            ></textarea>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save Details'}
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

export default UserDetailsForm;
