const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all user profiles for collaboration (must be before /:id route)
router.get('/profiles', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name profilePic bio artistType')
      .sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users (excluding current user for messaging)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  const { name, artistType, bio, contactInfo } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, artistType, bio, contactInfo },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get user profile (must be last to avoid catching other routes)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;