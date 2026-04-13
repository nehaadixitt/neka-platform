const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Groq = require('groq-sdk');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- MULTER SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only .txt, .pdf, .doc, .docx files are supported'));
  }
});

// --- FILE PARSER ---
async function extractText(filePath, ext) {
  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf8');
  }
  if (ext === '.pdf') {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (ext === '.doc' || ext === '.docx') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  throw new Error('Unsupported file type');
}

// --- DETERMINISTIC ANALYSIS ---
function runDeterministicAnalysis(content) {
  const lines = content.split('\n');
  const totalWords = content.split(/\s+/).filter(w => w.length > 0).length;
  const pageCount = Math.max(1, lines.length / 55);

  // Sluglines / scene headings
  const sluglineRegex = /^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)/i;
  const properSluglines = lines.filter(l => /^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)/.test(l.trim()));
  const improperSluglines = lines.filter(l => sluglineRegex.test(l.trim()) && !/^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)/.test(l.trim()));
  const sceneCount = properSluglines.length;

  // Unique locations
  const locationSet = new Set();
  properSluglines.forEach(line => {
    const match = line.trim().match(/^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)\s+([^-\n]+)/i);
    if (match) locationSet.add(match[2].trim().toUpperCase());
  });
  const uniqueLocations = locationSet.size;

  // Scene lengths (in pages)
  const sceneLengths = [];
  const sceneIndices = [];
  lines.forEach((line, i) => {
    if (/^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.)/.test(line.trim())) sceneIndices.push(i);
  });
  for (let i = 0; i < sceneIndices.length; i++) {
    const start = sceneIndices[i];
    const end = sceneIndices[i + 1] || lines.length;
    const sceneLines = end - start;
    sceneLengths.push({
      scene: i + 1,
      slug: lines[start].trim().substring(0, 50),
      pages: parseFloat((sceneLines / 55).toFixed(2))
    });
  }
  const pacingRisks = sceneLengths.filter(s => s.pages > 3.5);

  // Dialogue vs action
  let dialogueWords = 0;
  let readingDialogue = false;
  lines.forEach(line => {
    const isCharName = /^\s{10,30}[A-Z][A-Z\s]+$/.test(line);
    const isSlug = /^(INT\.|EXT\.)/.test(line.trim());
    if (isCharName) { readingDialogue = true; return; }
    if (readingDialogue) {
      if (line.trim() === '' || isSlug) { readingDialogue = false; }
      else { dialogueWords += line.split(/\s+/).filter(w => w.length > 0).length; }
    }
  });
  const dialoguePct = totalWords > 0 ? parseFloat(((dialogueWords / totalWords) * 100).toFixed(1)) : 0;
  const actionPct = parseFloat((100 - dialoguePct).toFixed(1));
  const dialogueFlag = dialoguePct > 60 ? 'HIGH' : dialoguePct < 40 ? 'LOW' : 'OK';

  // Cast tracker
  const characterMap = {};
  lines.forEach(line => {
    const match = line.match(/^\s{10,30}([A-Z][A-Z\s]+)$/);
    if (match) {
      const name = match[1].trim();
      if (name.length > 1 && name.length < 30) {
        characterMap[name] = (characterMap[name] || 0) + 1;
      }
    }
  });
  const majorRoles = Object.entries(characterMap).filter(([, count]) => count > 10).map(([name]) => name);
  const minorRoles = Object.entries(characterMap).filter(([, count]) => count <= 5 && count > 0).map(([name]) => name);

  // Formatting checks
  const formattingFlags = [];
  if (improperSluglines.length > 0) formattingFlags.push(`${improperSluglines.length} improperly formatted sluglines`);
  const doubleSpaces = (content.match(/  +/g) || []).length;
  if (doubleSpaces > 5) formattingFlags.push(`${doubleSpaces} instances of double spacing`);
  const pastTense = (content.match(/\b(walked|talked|ran|said|went|came|saw|looked|turned|moved)\b/gi) || []).length;
  if (pastTense > 15) formattingFlags.push(`${pastTense} past-tense verbs found (scripts use present tense)`);
  const commonMisspellings = ['teh', 'recieve', 'occured', 'seperate', 'definately', 'wierd', 'untill'];
  commonMisspellings.forEach(w => {
    const count = (content.match(new RegExp(`\\b${w}\\b`, 'gi')) || []).length;
    if (count > 0) formattingFlags.push(`Misspelling: '${w}' found ${count} time(s)`);
  });

  // Professionalism score (25%)
  // Minimum threshold checks — a proper feature script must have these
  const formatPenalty = Math.min(100,
    improperSluglines.length * 5 +
    (doubleSpaces > 20 ? (doubleSpaces - 20) * 0.2 : 0) +
    (pastTense > 30 ? (pastTense - 30) * 0.1 : 0)
  );
  let professionalismScore = Math.max(0, 100 - formatPenalty);
  if (sceneCount < 5)  professionalismScore = Math.min(professionalismScore, 40);
  else if (sceneCount < 10) professionalismScore = Math.min(professionalismScore, 55);
  const charCueCount = Object.values(characterMap).reduce((a, b) => a + b, 0);
  if (charCueCount < 10) professionalismScore = Math.min(professionalismScore, 50);
  if (dialoguePct === 0) professionalismScore = Math.min(professionalismScore, 30);

  // Production feasibility score (20%)
  const locationScore = uniqueLocations <= 10 ? 100 : uniqueLocations <= 20 ? 75 : uniqueLocations <= 35 ? 50 : 25;
  const castScore = majorRoles.length <= 5 ? 100 : majorRoles.length <= 10 ? 75 : majorRoles.length <= 15 ? 50 : 25;
  const dialogueScore = dialogueFlag === 'OK' ? 100 : 60;
  const productionScore = (locationScore + castScore + dialogueScore) / 3;

  // Indie scale (0 = cheap indie, 100 = blockbuster)
  const indieScale = Math.min(100, Math.round((uniqueLocations * 2) + (majorRoles.length * 3)));

  return {
    pageCount: Math.round(pageCount),
    totalWords,
    sceneCount,
    uniqueLocations,
    sceneLengths,
    pacingRisks,
    dialoguePct,
    actionPct,
    dialogueFlag,
    majorRoles,
    minorRoles,
    formattingFlags,
    professionalismScore: parseFloat(professionalismScore.toFixed(1)),
    productionScore: parseFloat(productionScore.toFixed(1)),
    indieScale,
    characterMap
  };
}

// --- GROQ NARRATIVE ANALYSIS ---
async function runGroqAnalysis(content, deterministicData) {
  const { pageCount, sceneCount, majorRoles } = deterministicData;

  // Only send first 10 pages, middle 5 pages, last 10 pages to save tokens
  const lines = content.split('\n');
  const totalLines = lines.length;
  const firstChunk = lines.slice(0, Math.min(550, totalLines)).join('\n');
  const midStart = Math.floor(totalLines / 2) - 137;
  const midChunk = lines.slice(Math.max(0, midStart), midStart + 275).join('\n');
  const lastChunk = lines.slice(Math.max(0, totalLines - 550)).join('\n');

  const top3Characters = Object.entries(deterministicData.characterMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const prompt = `You are a professional Hollywood script analyst. Analyze this screenplay and return ONLY a valid JSON object with no extra text, no markdown, no code blocks.

Script stats: ${pageCount} pages, ${sceneCount} scenes, major characters: ${top3Characters.join(', ')}.

FIRST 10 PAGES:
${firstChunk}

MIDPOINT PAGES:
${midChunk}

LAST 10 PAGES:
${lastChunk}

Return this exact JSON structure:
{
  "structuralBeats": {
    "incitingIncident": { "page": <number or null>, "description": "<one sentence>", "onTarget": <true/false> },
    "midpoint": { "page": <number or null>, "description": "<one sentence>", "onTarget": <true/false> },
    "climax": { "page": <number or null>, "description": "<one sentence>", "onTarget": <true/false> }
  },
  "characterVoices": [
    { "name": "<character name>", "score": <0-100>, "traits": "<2-3 word description>" }
  ],
  "emotionalArc": {
    "openingSentiment": <-100 to 100>,
    "closingSentiment": <-100 to 100>,
    "arcShift": "<one sentence describing the change>"
  },
  "narrativeScore": <0-100>,
  "characterDialogueScore": <0-100>,
  "narrativeFeedback": "<2-3 sentences of overall feedback>"
}

Rules:
- incitingIncident onTarget = true if page is between 10-15
- midpoint onTarget = true if page is between 55-65
- climax onTarget = true if page is between 85-105
- characterVoices: include top 3 characters only
- sentiment: negative = dark/sad, positive = hopeful/triumphant`;

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1000
  });

  const raw = response.choices[0].message.content.trim();

  // Strip markdown code blocks and XML-like wrapper tags if present
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .replace(/^<[^>]+>\s*/i, '')
    .replace(/\s*<\/[^>]+>$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

// --- MAIN ENDPOINT ---
router.post('/analyze-script', auth, upload.single('script'), async (req, res) => {
  console.log('Analysis started');
  const scriptPath = req.file ? path.resolve(req.file.path) : null;

  try {
    if (!req.file) return res.status(400).json({ msg: 'No script file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    console.log('Parsing file:', req.file.originalname);

    let content = '';
    try {
      content = await extractText(scriptPath, ext);
    } catch (parseErr) {
      console.error('File parse error:', parseErr.message);
      return res.status(400).json({ msg: `Could not read file: ${parseErr.message}` });
    }

    if (!content || content.trim().length < 100) {
      return res.status(400).json({ msg: 'File appears empty or too short to analyze' });
    }

    console.log('Running deterministic analysis...');
    const det = runDeterministicAnalysis(content);

    console.log('Running Groq narrative analysis...');
    let groqData = null;
    try {
      groqData = await runGroqAnalysis(content, det);
    } catch (groqErr) {
      console.error('Groq error:', groqErr.message);
      // Fallback if Groq fails
      groqData = {
        structuralBeats: {
          incitingIncident: { page: null, description: 'Could not determine', onTarget: false },
          midpoint: { page: null, description: 'Could not determine', onTarget: false },
          climax: { page: null, description: 'Could not determine', onTarget: false }
        },
        characterVoices: det.majorRoles.slice(0, 3).map(name => ({ name, score: 50, traits: 'Not analyzed' })),
        emotionalArc: { openingSentiment: 0, closingSentiment: 0, arcShift: 'Could not determine' },
        narrativeScore: 50,
        characterDialogueScore: 50,
        narrativeFeedback: 'AI narrative analysis unavailable. Deterministic metrics are accurate.'
      };
    }

    // --- FINAL WEIGHTED SCORE ---
    // PDF loses formatting so we trust Groq more, deterministic less
    const isPdf = ext === '.pdf';
    const weights = isPdf
      ? { professionalism: 0.10, narrative: 0.45, character: 0.20, production: 0.25 }
      : { professionalism: 0.25, narrative: 0.35, character: 0.20, production: 0.20 };

    const professionalismScore = det.professionalismScore;
    const narrativeScore = groqData.narrativeScore;
    const characterScore = groqData.characterDialogueScore;
    const productionScore = det.productionScore;

    let scriptHealthScore = parseFloat((
      professionalismScore * weights.professionalism +
      narrativeScore * weights.narrative +
      characterScore * weights.character +
      productionScore * weights.production
    ).toFixed(1));

    // Completeness cap — incomplete scripts cannot score above a ceiling
    const pageCount = det.pageCount;
    if (pageCount < 30)       scriptHealthScore = Math.min(scriptHealthScore, 50);
    else if (pageCount < 60)  scriptHealthScore = Math.min(scriptHealthScore, 65);
    else if (pageCount < 90)  scriptHealthScore = Math.min(scriptHealthScore, 80);
    // 90+ pages: no cap
    scriptHealthScore = parseFloat(scriptHealthScore.toFixed(1));

    // --- STRUCTURED JSON RESPONSE ---
    const result = {
      success: true,
      scriptHealthScore,
      scoreBreakdown: {
        professionalism: { score: professionalismScore, weight: weights.professionalism * 100 },
        narrativeStructure: { score: narrativeScore, weight: weights.narrative * 100 },
        characterDialogue: { score: characterScore, weight: weights.character * 100 },
        productionFeasibility: { score: productionScore, weight: weights.production * 100 }
      },
      structuralBeats: groqData.structuralBeats,
      characterVoices: groqData.characterVoices,
      emotionalArc: groqData.emotionalArc,
      pacingData: {
        sceneLengths: det.sceneLengths,
        pacingRisks: det.pacingRisks
      },
      production: {
        uniqueLocations: det.uniqueLocations,
        majorRoles: det.majorRoles,
        minorRoles: det.minorRoles,
        majorRoleCount: det.majorRoles.length,
        minorRoleCount: det.minorRoles.length,
        dialoguePct: det.dialoguePct,
        actionPct: det.actionPct,
        dialogueFlag: det.dialogueFlag,
        indieScale: det.indieScale
      },
      technicalFlags: det.formattingFlags,
      meta: {
        pageCount: det.pageCount,
        wordCount: det.totalWords,
        sceneCount: det.sceneCount,
        fileName: req.file.originalname,
        completenessCap: pageCount < 30 ? 50 : pageCount < 60 ? 65 : pageCount < 90 ? 80 : null
      },
      narrativeFeedback: groqData.narrativeFeedback
    };

    // Cleanup
    if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);

    console.log('Analysis complete. Score:', scriptHealthScore);
    res.json(result);

  } catch (error) {
    console.error('Analysis error:', error.message);
    if (scriptPath && fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
    res.status(500).json({ msg: 'Analysis failed', error: error.message });
  }
});

module.exports = router;
