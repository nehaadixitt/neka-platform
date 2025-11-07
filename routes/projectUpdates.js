const express = require('express');
const ProjectUpdate = require('../models/ProjectUpdate');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Create project update
router.post('/', auth, async (req, res) => {
  const { projectId, title, content } = req.body;

  try {
    // Check if user is owner or collaborator
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const isAuthorized = project.userId.toString() === req.user.id || 
                        project.collaborators.includes(req.user.id);
    
    if (!isAuthorized) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const update = new ProjectUpdate({
      projectId,
      userId: req.user.id,
      title,
      content
    });

    await update.save();
    
    const populatedUpdate = await ProjectUpdate.findById(update._id)
      .populate('userId', 'name artistType');
    
    res.json(populatedUpdate);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get project updates
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    // Check if user has access to project
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const isAuthorized = project.userId.toString() === req.user.id || 
                        project.collaborators.includes(req.user.id);
    
    if (!isAuthorized) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updates = await ProjectUpdate.find({ projectId: req.params.projectId })
      .populate('userId', 'name artistType')
      .populate('comments.userId', 'name artistType')
      .sort({ createdAt: -1 });
    
    res.json(updates);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add comment to update
router.post('/:updateId/comment', auth, async (req, res) => {
  const { content } = req.body;

  try {
    const update = await ProjectUpdate.findById(req.params.updateId);
    if (!update) {
      return res.status(404).json({ msg: 'Update not found' });
    }

    // Check if user has access to project
    const project = await Project.findById(update.projectId);
    const isAuthorized = project.userId.toString() === req.user.id || 
                        project.collaborators.includes(req.user.id);
    
    if (!isAuthorized) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    update.comments.push({
      userId: req.user.id,
      content
    });

    await update.save();
    
    const populatedUpdate = await ProjectUpdate.findById(update._id)
      .populate('userId', 'name artistType')
      .populate('comments.userId', 'name artistType');
    
    res.json(populatedUpdate);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;