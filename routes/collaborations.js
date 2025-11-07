const express = require('express');
const CollabRequest = require('../models/CollabRequest');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Send collaboration request
router.post('/request', auth, async (req, res) => {
  const { projectId, receiverId } = req.body;

  try {
    // Check if request already exists
    const existingRequest = await CollabRequest.findOne({
      senderId: req.user.id,
      projectId,
      receiverId
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'Request already sent' });
    }

    const collabRequest = new CollabRequest({
      senderId: req.user.id,
      receiverId,
      projectId
    });

    await collabRequest.save();
    res.json(collabRequest);
  } catch (err) {
    res.status(500).send('Server error');
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

// Accept/Deny collaboration request
router.put('/request/:id', auth, async (req, res) => {
  const { status } = req.body; // 'accepted' or 'denied'

  try {
    const request = await CollabRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }
    
    if (request.receiverId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    // If accepted, add collaborator to project
    if (status === 'accepted') {
      await Project.findByIdAndUpdate(
        request.projectId,
        { $addToSet: { collaborators: request.senderId } }
      );
    }

    res.json(request);
  } catch (err) {
    res.status(500).send('Server error');
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