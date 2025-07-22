import UserDetails from '../models/UserDetails.js';

// Create or update user details
export const createOrUpdateDetails = async (req, res) => {
  try {
    const existing = await UserDetails.findOne({ user: req.user.id });

    if (existing) {
      const updated = await UserDetails.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true }
      );
      return res.status(200).json(updated);
    }

    const newDetails = new UserDetails({ ...req.body, user: req.user.id });
    await newDetails.save();
    res.status(201).json(newDetails);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user details
export const getUserDetails = async (req, res) => {
  try {
    const details = await UserDetails.findOne({ user: req.user.id });
    if (!details) return res.status(404).json({ message: 'No details found' });
    res.status(200).json(details);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
