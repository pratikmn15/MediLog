import UserDetails from '../models/UserDetails.js';
// changed file name
// Create or update user details
export const createOrUpdateDetails = async (req, res) => {
  try {
    // Remove email from req.body if it exists (prevent email updates)
    const { email, ...updateData } = req.body;
    
    const existing = await UserDetails.findOne({ user: req.user.id });

    if (existing) {
      const updated = await UserDetails.findOneAndUpdate(
        { user: req.user.id },
        updateData,
        { new: true }
      ).populate('user', 'name email'); // Populate user info including email
      
      return res.status(200).json(updated);
    }

    const newDetails = new UserDetails({ 
      ...updateData, 
      user: req.user.id 
    });
    await newDetails.save();
    
    // Populate user info after saving
    await newDetails.populate('user', 'name email');
    
    res.status(201).json(newDetails);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user details
export const getUserDetails = async (req, res) => {
  try {
    const details = await UserDetails.findOne({ user: req.user.id })
      .populate('user', 'name email'); // Populate user info including email
    
    if (!details) {
      // If no details exist, return user info with empty details structure
      return res.json({
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        },
        // Return empty structure for frontend
        fullName: '',
        dateOfBirth: null,
        gender: '',
        bloodGroup: '',
        phone: '',
        address: {},
        allergies: [],
        chronicDiseases: [],
        currentMedications: [],
        surgeries: [],
        emergencyContact: {},
        insuranceProvider: '',
        policyNumber: '',
        validTill: null,
        notes: ''
      });
    }
    
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
