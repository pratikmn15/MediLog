import Medicine from '../models/Medicine.js';

// Add new medicine
export const addMedicine = async (req, res) => {
  try {
    const medicineData = {
      ...req.body,
      user: req.user.id
    };
    
    const medicine = new Medicine(medicineData);
    await medicine.save();
    
    res.status(201).json({
      message: 'Medicine added successfully',
      data: medicine
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's medicines
export const getUserMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ 
      user: req.user.id,
      isActive: true
    }).sort({ createdAt: -1 });
    
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update medicine
export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medicine = await Medicine.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json({
      message: 'Medicine updated successfully',
      data: medicine
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete medicine (soft delete)
export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medicine = await Medicine.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { isActive: false },
      { new: true }
    );
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};