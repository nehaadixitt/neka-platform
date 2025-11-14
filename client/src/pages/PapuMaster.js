import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Download, Star, Award, Brain } from 'lucide-react';
import axios from '../utils/auth';

const PapuMaster = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid script file (.txt, .pdf, .doc, .docx)');
        setSelectedFile(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a script file first');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('script', selectedFile);

    try {
      const response = await axios.post('/api/ai/analyze-script', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold cinema-header mb-2">
          🧠 Papu Master AI
        </h1>
        <p className="text-white/80 text-lg">
          Advanced Script Analysis powered by Llama 4 Scout
        </p>
      </motion.div>

      {!analysis ? (
        /* Upload Section */
        <div className="card">
          <div className="text-center mb-6">
            <Brain className="mx-auto mb-4 text-red-400" size={48} />
            <h2 className="text-2xl font-bold cinema-header mb-2">Upload Your Script</h2>
            <p className="text-white/70">
              Get comprehensive AI-powered analysis of your screenplay
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label htmlFor="script-upload" className="block text-white/80 font-medium mb-3">
              Select Script File:
            </label>
            <div className="relative">
              <input
                type="file"
                id="script-upload"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="script-upload"
                className="flex items-center justify-center w-full border-2 border-dashed border-red-300/50 rounded-lg px-6 py-12 cursor-pointer transition-colors hover:border-red-400/70"
                style={{background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(255, 255, 255, 0.05))'}}
              >
                <div className="text-center">
                  <Upload className="mx-auto mb-4 text-red-400" size={32} />
                  {selectedFile ? (
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-white/60 text-sm mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white/80 mb-2">Click to upload your script</p>
                      <p className="text-white/60 text-sm">
                        Supports .txt, .pdf, .doc, .docx files
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 rounded-lg border border-red-400/50 text-red-300 backdrop-blur-lg"
              style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(255, 255, 255, 0.1))'}}
            >
              {error}
            </motion.div>
          )}

          {/* Analyze Button */}
          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="btn-primary flex items-center gap-2 mx-auto px-8 py-3 text-lg"
            >
              <Brain size={20} />
              {loading ? 'Analyzing Script...' : 'Analyze with Papu Master'}
            </button>
          </div>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center gap-3 text-white/70">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-400"></div>
                <span>AI is analyzing your script...</span>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center"
          >
            <Award className="mx-auto mb-4 text-yellow-400" size={48} />
            <h2 className="text-2xl font-bold cinema-header mb-2">Analysis Complete!</h2>
            <p className="text-white/80 mb-4">{analysis.downloadMessage}</p>
            <div className="flex items-center justify-center gap-2 text-green-300">
              <Download size={16} />
              <span className="text-sm">Full report downloaded to your computer</span>
            </div>
          </motion.div>

          {/* Analysis Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-xl font-bold cinema-header mb-4">📊 Analysis Summary</h3>
            
            {/* Overall Score */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border border-red-300/50"
                   style={{background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(255, 255, 255, 0.1))'}}
              >
                <Star className="text-yellow-400" size={24} />
                <div>
                  <p className="text-white/70 text-sm">Overall Score</p>
                  <p className="text-2xl font-bold text-white">{analysis.overallScore}</p>
                </div>
              </div>
            </div>

            {/* Tier 1 Results */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">🎯 Key Metrics</h4>
              <div className="bg-white/5 rounded-lg p-4">
                <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono">
                  {typeof analysis.tier1Results === 'object' 
                    ? JSON.stringify(analysis.tier1Results, null, 2)
                    : analysis.tier1Results
                  }
                </pre>
              </div>
            </div>

            {/* AI Summary */}
            {analysis.summary && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">🤖 AI Analysis</h4>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/80 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <button
              onClick={resetAnalysis}
              className="btn-secondary px-6 py-3"
            >
              <FileText className="inline mr-2" size={16} />
              Analyze Another Script
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PapuMaster;