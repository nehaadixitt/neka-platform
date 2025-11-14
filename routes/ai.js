const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for script uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .pdf, .doc, and .docx files are allowed'));
    }
  }
});

// Papu Master AI Analysis endpoint
router.post('/analyze-script', auth, upload.single('script'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No script file uploaded' });
    }

    const scriptPath = path.resolve(req.file.path);
    const scriptTitle = req.body.title || 'Untitled Script';
    const aiServicePath = path.join(__dirname, '..', 'ADVIKA AI');
    
    // Check if ADVIKA AI folder exists
    if (!fs.existsSync(aiServicePath)) {
      return res.status(500).json({ msg: 'AI service not found. Please ensure ADVIKA AI folder is present.' });
    }

    // Run the web interface wrapper with UTF-8 encoding
    const pythonProcess = spawn('python', ['web_interface.py', scriptPath, scriptTitle], {
      cwd: aiServicePath,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      // Clean up uploaded file
      fs.unlinkSync(scriptPath);

      if (code !== 0) {
        console.error('AI Analysis Error:', error);
        return res.status(500).json({ msg: 'Analysis failed', error: error });
      }

      try {
        const result = JSON.parse(output);
        
        if (result.error) {
          return res.status(400).json({ msg: result.error });
        }
        
        res.json({
          success: true,
          analysis: {
            overallScore: `${result.finalScore.toFixed(1)}/100`,
            tier1Results: `Format: ${result.metrics.format.toFixed(1)}/100\nGrammar: ${result.metrics.grammar.toFixed(1)}/100\nDialogue: ${result.metrics.dialogue.toFixed(1)}/100\nScenes: ${result.metrics.scenes.toFixed(1)}/100\nReadability: ${result.metrics.whitespace.toFixed(1)}/100`,
            summary: result.aiAnalysis,
            downloadMessage: 'Complete evaluation document has been downloaded to your computer.',
            pageCount: result.pageCount,
            sceneCount: result.sceneCount
          }
        });
        
      } catch (parseError) {
        console.error('Parse Error:', parseError);
        res.status(500).json({ msg: 'Failed to parse analysis results' });
      }
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ msg: 'Analysis failed', error: error.message });
  }
});

module.exports = router;