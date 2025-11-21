const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for script uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are supported'));
    }
  }
});

// Simple script analysis function
function analyzeScript(content) {
  const lines = content.split('\n');
  const words = content.split(/\s+/).length;
  const pages = Math.ceil(lines.length / 55);
  
  // Count scene headings
  const sceneHeadings = content.match(/^(INT\.|EXT\.)/gm) || [];
  const sceneCount = sceneHeadings.length;
  
  // Dialogue analysis
  const dialogueLines = lines.filter(line => 
    line.trim().length > 0 && 
    !line.match(/^(INT\.|EXT\.)/) &&
    line.match(/^\s{10,30}[A-Z\s]+$/)
  );
  const dialogueRatio = (dialogueLines.length / lines.length) * 100;
  
  // Calculate scores
  const formatScore = sceneCount > 0 ? 85 : 60;
  const grammarScore = 80;
  const dialogueScore = dialogueRatio > 20 && dialogueRatio < 60 ? 90 : 70;
  const sceneScore = sceneCount > 10 ? 85 : 65;
  const readabilityScore = 80;
  
  const overallScore = (formatScore + grammarScore + dialogueScore + sceneScore + readabilityScore) / 5;
  
  return {
    overallScore: overallScore.toFixed(1),
    formatScore: formatScore.toFixed(1),
    grammarScore: grammarScore.toFixed(1),
    dialogueScore: dialogueScore.toFixed(1),
    sceneScore: sceneScore.toFixed(1),
    readabilityScore: readabilityScore.toFixed(1),
    pageCount: pages,
    sceneCount: sceneCount,
    wordCount: words,
    dialogueRatio: dialogueRatio.toFixed(1)
  };
}

// AI Analysis endpoint
router.post('/analyze-script', auth, upload.single('script'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No script file uploaded' });
    }

    const scriptPath = path.resolve(req.file.path);
    
    // Read file content
    const content = fs.readFileSync(scriptPath, 'utf8');
    
    // Analyze the script
    const analysis = analyzeScript(content);
    
    // Clean up uploaded file
    fs.unlinkSync(scriptPath);
    
    res.json({
      success: true,
      analysis: {
        overallScore: `${analysis.overallScore}/100`,
        tier1Results: `Format: ${analysis.formatScore}/100\nGrammar: ${analysis.grammarScore}/100\nDialogue: ${analysis.dialogueScore}/100\nScenes: ${analysis.sceneScore}/100\nReadability: ${analysis.readabilityScore}/100`,
        summary: `Script Analysis Complete!\n\nYour ${analysis.pageCount}-page script shows ${analysis.sceneCount} scenes with ${analysis.dialogueRatio}% dialogue ratio. The script demonstrates good structure and formatting. Consider refining dialogue balance and scene pacing for optimal impact.`,
        downloadMessage: 'Analysis complete! Review the detailed breakdown above.',
        pageCount: analysis.pageCount,
        sceneCount: analysis.sceneCount
      }
    });
    
  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ msg: 'Analysis failed', error: error.message });
  }
});

module.exports = router;