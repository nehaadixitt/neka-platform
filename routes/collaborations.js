const express = require('express');
const CollabRequest = require('../models/CollabRequest');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create collaboration request
router.post('/request', auth, async (req, res) => {
  const { targetUserId, targetProjectId, message } = req.body;

  // Validation
  if (!targetUserId || !targetProjectId || !message) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  if (message.length > 500) {
    return res.status(400).json({ msg: 'Message must be less than 500 characters' });
  }

  try {
    // Verify project belongs to requester
    const project = await Project.findOne({ _id: targetProjectId, userId: req.user.id });
    if (!project) {
      return res.status(404).json({ msg: 'Project not found or not owned by you' });
    }

    // Verify target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ msg: 'Target user not found' });
    }

    // Check if request already exists
    const existingRequest = await CollabRequest.findOne({
      senderId: req.user.id,
      receiverId: targetUserId,
      projectId: targetProjectId
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'Collaboration request already sent' });
    }

    // Create collaboration request
    const collabRequest = new CollabRequest({
      senderId: req.user.id,
      receiverId: targetUserId,
      projectId: targetProjectId,
      message: message.trim(),
      status: 'pending'
    });

    await collabRequest.save();

    // Create notification
    const Notification = require('../models/Notification');
    const sender = await User.findById(req.user.id);
    
    const notification = new Notification({
      userId: targetUserId,
      type: 'collaboration_request',
      message: `${sender.name} wants to collaborate on "${project.title}"`,
      relatedId: collabRequest._id
    });
    
    await notification.save();

    res.status(201).json({ 
      msg: 'Collaboration request sent successfully',
      request: collabRequest 
    });
  } catch (err) {
    console.error('Error creating collaboration request:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get incoming requests
router.get('/incoming', auth, async (req, res) => {
  try {
    const requests = await CollabRequest.find({ 
      receiverId: req.user.id, 
      status: 'pending' 
    })
    .populate('senderId', 'name artistType')
    .populate('projectId', 'title summary');
    
    res.json(requests);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Accept collaboration request
router.put('/request/:id/accept', auth, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('senderId', 'name');
    
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    if (request.receiverId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ msg: 'Request already processed' });
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Add collaborator to project (the person accepting becomes the collaborator)
    const project = await Project.findByIdAndUpdate(
      request.projectId,
      { $addToSet: { collaborators: req.user.id } },
      { new: true }
    ).populate('collaborators', 'name artistType');

    // Create notification for sender
    const Notification = require('../models/Notification');
    const receiver = await User.findById(req.user.id);
    
    const notification = new Notification({
      userId: request.senderId,
      type: 'collaboration_accepted',
      message: `${receiver.name} accepted your collaboration request for "${request.projectId.title}"`,
      relatedId: request.projectId._id
    });
    
    await notification.save();

    res.json({ 
      msg: 'Collaboration request accepted successfully',
      request,
      project 
    });
  } catch (err) {
    console.error('Error accepting collaboration request:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reject collaboration request
router.put('/request/:id/reject', auth, async (req, res) => {
  try {
    const request = await CollabRequest.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('senderId', 'name');
    
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    if (request.receiverId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ msg: 'Request already processed' });
    }

    // Update request status
    request.status = 'denied';
    await request.save();

    // Create notification for sender
    const Notification = require('../models/Notification');
    const receiver = await User.findById(req.user.id);
    
    const notification = new Notification({
      userId: request.senderId,
      type: 'collaboration_denied',
      message: `${receiver.name} declined your collaboration request for "${request.projectId.title}"`,
      relatedId: request.projectId._id
    });
    
    await notification.save();

    res.json({ 
      msg: 'Collaboration request rejected',
      request 
    });
  } catch (err) {
    console.error('Error rejecting collaboration request:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get collaborative projects
router.get('/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ 
      collaborators: req.user.id 
    })
    .populate('userId', 'name artistType')
    .populate('collaborators', 'name artistType');
    
    res.json(projects);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;