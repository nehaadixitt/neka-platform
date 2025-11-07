const express = require('express');
const multer = require('multer');
const path = require('path');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Scripts only (PDF, DOC, DOCX, TXT)');
    }
  }
});

// Create project
router.post('/', auth, upload.single('script'), async (req, res) => {
  const { title, status, summary } = req.body;

  try {
    const project = new Project({
      userId: req.user.id,
      title,
      status,
      summary,
      scriptPath: req.file ? req.file.filename : ''
    });

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get user's projects (owned + collaborative)
router.get('/my', auth, async (req, res) => {
  try {
    // Get owned projects
    const ownedProjects = await Project.find({ userId: req.user.id })
      .populate('collaborators', 'name artistType')
      .sort({ createdAt: -1 });
    
    // Get collaborative projects
    const collaborativeProjects = await Project.find({ 
      collaborators: req.user.id 
    })
      .populate('userId', 'name artistType')
      .populate('collaborators', 'name artistType')
      .sort({ createdAt: -1 });
    
    // Mark projects as owned or collaborative
    const markedOwnedProjects = ownedProjects.map(project => ({
      ...project.toObject(),
      isOwner: true,
      isCollaborative: project.collaborators.length > 0
    }));
    
    const markedCollaborativeProjects = collaborativeProjects.map(project => ({
      ...project.toObject(),
      isOwner: false,
      isCollaborative: true
    }));
    
    // Combine and sort by creation date
    const allProjects = [...markedOwnedProjects, ...markedCollaborativeProjects]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(allProjects);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get all finished projects
router.get('/finished', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'finished' })
      .populate('userId', 'name artistType')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('userId', 'name artistType')
      .populate('collaborators', 'name artistType');
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedProject);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;