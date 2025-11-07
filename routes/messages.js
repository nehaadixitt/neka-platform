const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  const { receiverId, content } = req.body;

  try {
    const message = new Message({
      senderId: req.user.id,
      receiverId,
      content
    });

    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name')
      .populate('receiverId', 'name');
    
    res.json(populatedMessage);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    })
    .populate('senderId', 'name')
    .populate('receiverId', 'name')
    .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversations = {};
    messages.forEach(message => {
      const partnerId = message.senderId._id.toString() === req.user.id 
        ? message.receiverId._id.toString() 
        : message.senderId._id.toString();
      
      const partnerName = message.senderId._id.toString() === req.user.id 
        ? message.receiverId.name 
        : message.senderId.name;

      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partnerId,
          partnerName,
          messages: [],
          lastMessage: message
        };
      }
      conversations[partnerId].messages.push(message);
    });

    res.json(Object.values(conversations));
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get messages with specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.id }
      ]
    })
    .populate('senderId', 'name')
    .populate('receiverId', 'name')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;