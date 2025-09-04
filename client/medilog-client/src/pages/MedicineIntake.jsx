import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  FiPlus, FiEdit2, FiTrash2, FiClock, FiPackage,
  FiCalendar, FiAlertCircle, FiCheck, FiX, FiDownload
} from 'react-icons/fi';
import { downloadHealthRecordPDF } from '../utils/pdfGenerator';

const MedicineIntake = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once-daily',
    times: ['08:00'],
    duration: '',
    startDate: '',
    endDate: '',
    instructions: '',
    reminderEnabled: true,
    beforeMeal: false,
    afterMeal: false,
    withFood: false
  });
  const [userDetailsForPdf, setUserDetailsForPdf] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMedicines();
  }, [isAuthenticated, navigate]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/medicines`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMedicines(response.data || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      if (err.response?.status !== 404) {
        alert('Failed to load medicines');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetailsForPdf = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user-details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserDetailsForPdf(response.data);
    } catch (err) {
      console.error('Error fetching user details for PDF:', err);
    }
  };

  const handleFrequencyChange = (frequency) => {
    let defaultTimes = [];
    switch (frequency) {
      case 'once-daily':
        defaultTimes = ['08:00'];
        break;
      case 'twice-daily':
        defaultTimes = ['08:00', '20:00'];
        break;
      case 'thrice-daily':
        defaultTimes = ['08:00', '14:00', '20:00'];
        break;
      case 'four-times-daily':
        defaultTimes = ['08:00', '12:00', '16:00', '20:00'];
        break;
      case 'custom':
        defaultTimes = ['08:00'];
        break;
      default:
        defaultTimes = ['08:00'];
    }
    setFormData(prev => ({ ...prev, frequency, times: defaultTimes }));
  };

  const handleTimeChange = (index, time) => {
    const newTimes = [...formData.times];
    newTimes[index] = time;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '08:00']
    }));
  };

  const removeTimeSlot = (index) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, times: newTimes }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const medicineData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };

      if (editingMedicine) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/medicines/${editingMedicine._id}`,
          medicineData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        alert('Medicine updated successfully!');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/medicines`,
          medicineData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        alert('Medicine added successfully!');
      }

      resetForm();
      fetchMedicines();
    } catch (err) {
      console.error('Error saving medicine:', err);
      alert(err.response?.data?.message || 'Error saving medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name || '',
      dosage: medicine.dosage || '',
      frequency: medicine.frequency || 'once-daily',
      times: medicine.times || ['08:00'],
      duration: medicine.duration || '',
      startDate: medicine.startDate ? medicine.startDate.split('T')[0] : '',
      endDate: medicine.endDate ? medicine.endDate.split('T')[0] : '',
      instructions: medicine.instructions || '',
      reminderEnabled: medicine.reminderEnabled !== false,
      beforeMeal: medicine.beforeMeal || false,
      afterMeal: medicine.afterMeal || false,
      withFood: medicine.withFood || false
    });
    setShowAddForm(true);
  };

  const handleDelete = async (medicineId) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/medicines/${medicineId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Medicine deleted successfully!');
      fetchMedicines();
    } catch (err) {
      console.error('Error deleting medicine:', err);
      alert('Error deleting medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      await fetchUserDetailsForPdf();
      
      // Give a small delay to ensure state is updated
      setTimeout(async () => {
        try {
          await downloadHealthRecordPDF(userDetailsForPdf, medicines);
        } catch (error) {
          console.error('PDF generation error:', error);
          alert('Error generating PDF. Please try again.');
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching data for PDF:', error);
      alert('Error preparing PDF data. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'once-daily',
      times: ['08:00'],
      duration: '',
      startDate: '',
      endDate: '',
      instructions: '',
      reminderEnabled: true,
      beforeMeal: false,
      afterMeal: false,
      withFood: false
    });
    setEditingMedicine(null);
    setShowAddForm(false);
  };

  const getMealInstructions = (medicine) => {
    const instructions = [];
    if (medicine.beforeMeal) instructions.push('Before meal');
    if (medicine.afterMeal) instructions.push('After meal');
    if (medicine.withFood) instructions.push('With food');
    return instructions.join(', ') || 'No meal instructions';
  };

  return (
    <Layout>
      <div className="py-8 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-200">
                Medicine Intake
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Manage your medication schedule and track intake times
              </p>
            </div>
            <div className="flex gap-2">
              {medicines.length > 0 && (
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  <FiDownload /> Download PDF
                </button>
              )}
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                <FiPlus /> Add Medicine
              </button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-8 bg-slate-800/40 border border-slate-700/60 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-300">
                  {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                      placeholder="e.g., Paracetamol"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                      className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                      placeholder="e.g., 500mg, 1 tablet"
                      required
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleFrequencyChange(e.target.value)}
                    className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                    required
                  >
                    <option value="once-daily">Once Daily</option>
                    <option value="twice-daily">Twice Daily</option>
                    <option value="thrice-daily">Thrice Daily</option>
                    <option value="four-times-daily">Four Times Daily</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Times */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Intake Times *
                  </label>
                  <div className="space-y-2">
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                          required
                        />
                        {formData.frequency === 'custom' && formData.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.frequency === 'custom' && (
                      <button
                        type="button"
                        onClick={addTimeSlot}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:text-green-300"
                      >
                        <FiPlus size={16} /> Add Time Slot
                      </button>
                    )}
                  </div>
                </div>

                {/* Duration & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                      placeholder="e.g., 7 days, 2 weeks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                {/* Meal Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Meal Instructions
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.beforeMeal}
                        onChange={(e) => setFormData(prev => ({ ...prev, beforeMeal: e.target.checked }))}
                        className="rounded border-slate-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-300">Before meal</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.afterMeal}
                        onChange={(e) => setFormData(prev => ({ ...prev, afterMeal: e.target.checked }))}
                        className="rounded border-slate-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-300">After meal</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.withFood}
                        onChange={(e) => setFormData(prev => ({ ...prev, withFood: e.target.checked }))}
                        className="rounded border-slate-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-300">With food</span>
                    </label>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Additional Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100"
                    rows="3"
                    placeholder="Any special instructions..."
                  />
                </div>

                {/* Reminder */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.reminderEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                      className="rounded border-slate-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-slate-300">Enable reminders</span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Saving...' : editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Medicines List */}
          <div className="space-y-4">
            {loading && medicines.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                <FiPackage className="mx-auto text-4xl text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No medicines added yet</h3>
                <p className="text-slate-400 mb-4">Start by adding your first medicine to track intake times.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                >
                  Add Your First Medicine
                </button>
              </div>
            ) : (
              medicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-6 hover:border-slate-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <FiPackage className="text-green-400" />
                        {medicine.name}
                      </h3>
                      <p className="text-slate-400">{medicine.dosage}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(medicine._id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Frequency:</span>
                      <p className="text-slate-300 capitalize">{medicine.frequency.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Times:</span>
                      <div className="flex flex-wrap gap-1">
                        {medicine.times?.map((time, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
                          >
                            <FiClock size={12} />
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Duration:</span>
                      <p className="text-slate-300">{medicine.duration || '—'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Meal Instructions:</span>
                      <p className="text-slate-300">{getMealInstructions(medicine)}</p>
                    </div>
                  </div>

                  {medicine.instructions && (
                    <div className="mt-4 p-3 bg-slate-700/50 rounded border-l-4 border-blue-500">
                      <p className="text-sm text-slate-300">{medicine.instructions}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {medicine.startDate && (
                        <span className="flex items-center gap-1">
                          <FiCalendar />
                          {new Date(medicine.startDate).toLocaleDateString()}
                        </span>
                      )}
                      {medicine.endDate && (
                        <span>to {new Date(medicine.endDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {medicine.reminderEnabled ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <FiCheck size={12} />
                          Reminders enabled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <FiX size={12} />
                          No reminders
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MedicineIntake;