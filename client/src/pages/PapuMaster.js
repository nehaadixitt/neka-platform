import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Brain, FileText, MapPin, Users, MessageSquare, AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
  LineChart, Line, Legend
} from 'recharts';
import axios from '../utils/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- HELPERS ---
const scoreColor = (score) => {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const scoreLabel = (score) => {
  if (score >= 70) return 'STRONG';
  if (score >= 40) return 'NEEDS WORK';
  return 'WEAK';
};

// --- SCORE GAUGE ---
const ScoreGauge = ({ score }) => {
  const color = scoreColor(score);
  const data = [{ name: 'score', value: score, fill: color }, { name: 'bg', value: 100 - score, fill: '#1f2937' }];
  return (
    <div className="flex flex-col items-center">
      <div style={{ width: 200, height: 200, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={data} barSize={18}>
            <RadialBar dataKey="value" cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 'bold', color }}>{score}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>/ 100</div>
        </div>
      </div>
      <div style={{ color, fontWeight: 'bold', fontSize: 14, marginTop: 4 }}>{scoreLabel(score)}</div>
    </div>
  );
};

// --- STRUCTURAL TIMELINE ---
const StructuralTimeline = ({ beats, pageCount }) => {
  const items = [
    { key: 'incitingIncident', label: 'Inciting Incident', expected: '10–15' },
    { key: 'midpoint', label: 'Midpoint', expected: '55–65' },
    { key: 'climax', label: 'Climax', expected: '85–105' }
  ];
  return (
    <div className="space-y-4">
      {items.map(({ key, label, expected }) => {
        const beat = beats[key];
        const on = beat?.onTarget;
        return (
          <div key={key} className="flex items-center gap-4">
            <div style={{ width: 28 }}>
              {on ? <CheckCircle size={22} color="#22c55e" /> : <XCircle size={22} color="#ef4444" />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between mb-1">
                <span className="text-white font-medium text-sm">{label}</span>
                <span style={{ color: on ? '#22c55e' : '#ef4444', fontSize: 13 }}>
                  Page {beat?.page ?? '?'} <span className="text-white/40">(expected {expected})</span>
                </span>
              </div>
              <div style={{ background: '#1f2937', borderRadius: 4, height: 6, position: 'relative' }}>
                {beat?.page && (
                  <div style={{
                    position: 'absolute', left: `${Math.min(99, (beat.page / pageCount) * 100)}%`,
                    top: -3, width: 12, height: 12, borderRadius: '50%',
                    background: on ? '#22c55e' : '#ef4444', transform: 'translateX(-50%)'
                  }} />
                )}
              </div>
              <p className="text-white/50 text-xs mt-1">{beat?.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- CHARACTER VOICE BAR CHART ---
const CharacterVoiceChart = ({ voices }) => {
  const data = voices.map(v => ({ name: v.name, score: v.score, traits: v.traits }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
          formatter={(val, name, props) => [`${val}/100 — ${props.payload.traits}`, 'Voice Score']}
        />
        <Bar dataKey="score" fill="#dc2626" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- EMOTIONAL ARC METER ---
const EmotionalArcMeter = ({ arc }) => {
  const { openingSentiment, closingSentiment, arcShift } = arc;
  const toPercent = (val) => ((val + 100) / 200) * 100;
  return (
    <div className="space-y-3">
      {[{ label: 'Opening Sentiment', val: openingSentiment }, { label: 'Closing Sentiment', val: closingSentiment }].map(({ label, val }) => (
        <div key={label}>
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>{label}</span>
            <span style={{ color: val >= 0 ? '#22c55e' : '#ef4444' }}>{val > 0 ? `+${val}` : val}</span>
          </div>
          <div style={{ background: '#1f2937', borderRadius: 4, height: 8, position: 'relative' }}>
            <div style={{
              position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: '#4b5563'
            }} />
            <div style={{
              position: 'absolute',
              left: val >= 0 ? '50%' : `${toPercent(val)}%`,
              width: `${Math.abs(toPercent(val) - 50)}%`,
              height: '100%', borderRadius: 4,
              background: val >= 0 ? '#22c55e' : '#ef4444'
            }} />
          </div>
        </div>
      ))}
      <p className="text-white/50 text-xs mt-2">{arcShift}</p>
    </div>
  );
};

// --- PACING LINE CHART ---
const PacingChart = ({ sceneLengths, pacingRisks }) => {
  const riskScenes = new Set(pacingRisks.map(r => r.scene));
  const data = sceneLengths.map(s => ({ ...s, risk: riskScenes.has(s.scene) ? s.pages : null }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="scene" tick={{ fill: '#9ca3af', fontSize: 10 }} label={{ value: 'Scene #', position: 'insideBottom', fill: '#6b7280', fontSize: 11 }} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} label={{ value: 'Pages', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
          formatter={(val, name) => [`${val} pages`, name === 'pages' ? 'Scene Length' : '⚠ Pacing Risk']}
        />
        <ReferenceLine y={3.5} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '3.5p limit', fill: '#f59e0b', fontSize: 10 }} />
        <Line type="monotone" dataKey="pages" stroke="#dc2626" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="risk" stroke="#f59e0b" dot={{ fill: '#f59e0b', r: 5 }} strokeWidth={0} name="Pacing Risk" />
      </LineChart>
    </ResponsiveContainer>
  );
};

// --- INDIE SCALE METER ---
const IndieScaleMeter = ({ scale }) => {
  const clamped = Math.min(100, Math.max(0, scale));
  return (
    <div>
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>🎬 Indie / Cheap</span>
        <span>💰 Blockbuster</span>
      </div>
      <div style={{ background: '#1f2937', borderRadius: 8, height: 12, position: 'relative' }}>
        <div style={{
          width: `${clamped}%`, height: '100%', borderRadius: 8,
          background: `linear-gradient(to right, #22c55e, #f59e0b, #ef4444)`
        }} />
        <div style={{
          position: 'absolute', left: `${clamped}%`, top: -4,
          transform: 'translateX(-50%)', width: 20, height: 20,
          borderRadius: '50%', background: '#fff', border: '2px solid #dc2626'
        }} />
      </div>
      <p className="text-center text-xs text-white/50 mt-2">
        {clamped < 33 ? 'Low budget — indie friendly' : clamped < 66 ? 'Mid-range production' : 'High budget — major studio scale'}
      </p>
    </div>
  );
};

// --- PDF GENERATOR ---
const generatePDF = (data, fileName) => {
  const doc = new jsPDF();
  const { scriptHealthScore, scoreBreakdown, structuralBeats, characterVoices, emotionalArc, pacingData, production, technicalFlags, meta, narrativeFeedback } = data;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38);
  doc.text('NEKA Script Analysis Report', 105, 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`File: ${meta.fileName}  |  Pages: ${meta.pageCount}  |  Words: ${meta.wordCount}  |  Scenes: ${meta.sceneCount}`, 105, 26, { align: 'center' });

  // Health Score
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Script Health Score: ${scriptHealthScore}/100`, 14, 38);

  // Score Breakdown
  autoTable(doc, {
    startY: 44,
    head: [['Category', 'Weight', 'Score']],
    body: [
      ['Professionalism', '25%', `${scoreBreakdown.professionalism.score}/100`],
      ['Narrative Structure', '35%', `${scoreBreakdown.narrativeStructure.score}/100`],
      ['Character & Dialogue', '20%', `${scoreBreakdown.characterDialogue.score}/100`],
      ['Production Feasibility', '20%', `${scoreBreakdown.productionFeasibility.score}/100`]
    ],
    headStyles: { fillColor: [220, 38, 38] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  let y = doc.lastAutoTable.finalY + 10;

  // Structural Beats
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Structural Beats', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Beat', 'Page', 'On Target', 'Description']],
    body: [
      ['Inciting Incident', structuralBeats.incitingIncident.page ?? '?', structuralBeats.incitingIncident.onTarget ? '✓' : '✗', structuralBeats.incitingIncident.description],
      ['Midpoint', structuralBeats.midpoint.page ?? '?', structuralBeats.midpoint.onTarget ? '✓' : '✗', structuralBeats.midpoint.description],
      ['Climax', structuralBeats.climax.page ?? '?', structuralBeats.climax.onTarget ? '✓' : '✗', structuralBeats.climax.description]
    ],
    headStyles: { fillColor: [220, 38, 38] }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Character Voices
  doc.text('Character Voice Scores', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Character', 'Voice Score', 'Traits']],
    body: characterVoices.map(v => [v.name, `${v.score}/100`, v.traits]),
    headStyles: { fillColor: [220, 38, 38] }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Emotional Arc
  doc.text('Emotional Arc', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Opening Sentiment', 'Closing Sentiment', 'Arc Shift']],
    body: [[emotionalArc.openingSentiment, emotionalArc.closingSentiment, emotionalArc.arcShift]],
    headStyles: { fillColor: [220, 38, 38] }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Production
  doc.text('Production & Scale', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Metric', 'Value']],
    body: [
      ['Unique Locations', production.uniqueLocations],
      ['Major Roles (>10 lines)', production.majorRoleCount],
      ['Minor Roles (≤5 lines)', production.minorRoleCount],
      ['Dialogue %', `${production.dialoguePct}%`],
      ['Action %', `${production.actionPct}%`],
      ['Dialogue Balance', production.dialogueFlag],
      ['Indie Scale', `${production.indieScale}/100`]
    ],
    headStyles: { fillColor: [220, 38, 38] }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Pacing Risks
  if (pacingData.pacingRisks.length > 0) {
    doc.text('Pacing Risks (Scenes > 3.5 pages)', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Scene #', 'Pages', 'Slugline']],
      body: pacingData.pacingRisks.map(r => [r.scene, r.pages, r.slug]),
      headStyles: { fillColor: [245, 158, 11] }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Technical Flags
  if (technicalFlags.length > 0) {
    doc.text('Technical Flags', 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Issue']],
      body: technicalFlags.map(f => [f]),
      headStyles: { fillColor: [239, 68, 68] }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // AI Feedback
  if (y > 250) doc.addPage();
  doc.setFontSize(12);
  doc.text('AI Narrative Feedback', 14, y);
  doc.setFontSize(10);
  doc.setTextColor(60);
  const splitFeedback = doc.splitTextToSize(narrativeFeedback, 180);
  doc.text(splitFeedback, 14, y + 8);

  doc.save(`${fileName.replace(/\.[^.]+$/, '')}_NEKA_Analysis.pdf`);
};

// --- MAIN COMPONENT ---
const PapuMaster = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['.txt', '.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (allowed.includes(ext)) { setSelectedFile(file); setError(''); }
    else { setError('Please select a .txt, .pdf, .doc, or .docx file'); setSelectedFile(null); }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return setError('Please select a script file first');
    setLoading(true); setError(''); setResult(null);
    const formData = new FormData();
    formData.append('script', selectedFile);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/ai/analyze-script', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const Card = ({ title, children }) => (
    <div className="card mb-6">
      <h3 className="text-lg font-bold cinema-header mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold cinema-header mb-2">🧠 Papu Master AI</h1>
        <p className="text-white/70">Advanced Script Analysis — Powered by Llama 4 Scout</p>
      </div>

      {/* Upload */}
      {!result && (
        <div className="card">
          <div className="text-center mb-6">
            <Brain className="mx-auto mb-3 text-red-400" size={44} />
            <h2 className="text-2xl font-bold cinema-header mb-1">Upload Your Script</h2>
            <p className="text-white/60 text-sm">Supports .txt, .pdf, .doc, .docx — max 10MB — 90 to 120 page feature scripts</p>
          </div>
          <div className="mb-6">
            <input type="file" id="script-upload" accept=".txt,.pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
            <label htmlFor="script-upload" className="flex items-center justify-center w-full border-2 border-dashed border-red-300/40 rounded-lg px-6 py-12 cursor-pointer hover:border-red-400/70 transition-colors"
              style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(255,255,255,0.03))' }}>
              <div className="text-center">
                <Upload className="mx-auto mb-3 text-red-400" size={28} />
                {selectedFile ? (
                  <div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-white/50 text-sm mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <p className="text-white/60">Click to upload your script</p>
                )}
              </div>
            </label>
          </div>
          {error && <div className="mb-4 px-4 py-3 rounded-lg border border-red-400/50 text-red-300 text-sm">{error}</div>}
          <div className="text-center">
            <button onClick={handleAnalyze} disabled={!selectedFile || loading} className="btn-primary flex items-center gap-2 mx-auto px-8 py-3 text-lg">
              <Brain size={20} />
              {loading ? 'Analyzing...' : 'Analyze with Papu Master'}
            </button>
          </div>
          {loading && (
            <div className="mt-6 text-center text-white/60 text-sm">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400" />
                Running deterministic checks + AI narrative analysis... this may take 20–40 seconds
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Score + Breakdown */}
          <Card title="📊 Script Health Score">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ScoreGauge score={result.scriptHealthScore} />
              <div className="flex-1 w-full space-y-3">
                {Object.entries(result.scoreBreakdown).map(([key, val]) => {
                  const labels = { professionalism: 'Professionalism', narrativeStructure: 'Narrative Structure', characterDialogue: 'Character & Dialogue', productionFeasibility: 'Production Feasibility' };
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">{labels[key]} <span className="text-white/30">({val.weight}%)</span></span>
                        <span style={{ color: scoreColor(val.score) }}>{val.score}/100</span>
                      </div>
                      <div style={{ background: '#1f2937', borderRadius: 4, height: 6 }}>
                        <div style={{ width: `${val.score}%`, height: '100%', borderRadius: 4, background: scoreColor(val.score) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Structural Beats */}
          <Card title="🎬 Structural Benchmarking">
            <StructuralTimeline beats={result.structuralBeats} pageCount={result.meta.pageCount} />
          </Card>

          {/* Character Voice + Emotional Arc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-lg font-bold cinema-header mb-4">🎭 Character Voice Scores</h3>
              <CharacterVoiceChart voices={result.characterVoices} />
            </div>
            <div className="card">
              <h3 className="text-lg font-bold cinema-header mb-4">💫 Emotional Arc</h3>
              <EmotionalArcMeter arc={result.emotionalArc} />
            </div>
          </div>

          {/* Pacing */}
          <Card title="📈 Scene Pacing & Density">
            <PacingChart sceneLengths={result.pacingData.sceneLengths} pacingRisks={result.pacingData.pacingRisks} />
            {result.pacingData.pacingRisks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.pacingData.pacingRisks.map(r => (
                  <span key={r.scene} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <AlertTriangle size={11} /> Scene {r.scene} — {r.pages}p
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Production */}
          <Card title="🎥 Production & Scale">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <MapPin className="mx-auto mb-2 text-red-400" size={24} />
                <div className="text-2xl font-bold text-white">{result.production.uniqueLocations}</div>
                <div className="text-white/50 text-xs">Unique Locations</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Users className="mx-auto mb-2 text-red-400" size={24} />
                <div className="text-2xl font-bold text-white">{result.production.majorRoleCount} / {result.production.minorRoleCount}</div>
                <div className="text-white/50 text-xs">Major / Minor Roles</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <MessageSquare className="mx-auto mb-2 text-red-400" size={24} />
                <div className="text-2xl font-bold text-white">{result.production.dialoguePct}%</div>
                <div className="text-white/50 text-xs">Dialogue vs {result.production.actionPct}% Action</div>
                {result.production.dialogueFlag !== 'OK' && (
                  <span className="text-xs text-yellow-400">⚠ {result.production.dialogueFlag === 'HIGH' ? 'Too much dialogue' : 'Too little dialogue'}</span>
                )}
              </div>
            </div>
            <IndieScaleMeter scale={result.production.indieScale} />
          </Card>

          {/* Technical Flags */}
          {result.technicalFlags.length > 0 && (
            <Card title="🚩 Technical Flags">
              <ul className="space-y-2">
                {result.technicalFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* AI Feedback */}
          <Card title="🤖 AI Narrative Feedback">
            <p className="text-white/70 leading-relaxed">{result.narrativeFeedback}</p>
          </Card>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-white/40 mb-6">
            <span>📄 {result.meta.pageCount} pages</span>
            <span>📝 {result.meta.wordCount.toLocaleString()} words</span>
            <span>🎬 {result.meta.sceneCount} scenes</span>
            <span>📁 {result.meta.fileName}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center mb-8">
            <button onClick={() => generatePDF(result, result.meta.fileName)} className="btn-primary flex items-center gap-2 px-6 py-3">
              <Download size={18} /> Download PDF Report
            </button>
            <button onClick={() => { setResult(null); setSelectedFile(null); }} className="btn-secondary flex items-center gap-2 px-6 py-3">
              <FileText size={18} /> Analyze Another Script
            </button>
          </div>

        </motion.div>
      )}
    </motion.div>
  );
};

export default PapuMaster;
