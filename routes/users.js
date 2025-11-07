const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
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

// Search users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;