import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Brain, FileText, Star } from 'lucide-react';
import axios from '../utils/auth';

const PapuMaster = ({ projectId, onClose }) => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const analyzeScript = async () => {
    if (!file) {
      setError('Please select a script file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('script', file);

    try {
      const res = await axios.post('/api/ai/analyze-script', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAnalysis(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.msg || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'RECOMMEND') return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (rec === 'CONSIDER') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Papu Master</h2>
              <p className="text-white/60">AI Script Analyzer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {!analysis ? (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-4 text-white/40" size={48} />
              <h3 className="text-lg font-semibold text-white mb-2">Upload Your Script</h3>
              <p className="text-white/60 mb-4">Upload your screenplay (.txt, .pdf, .doc, .docx) for analysis</p>
              
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="script-upload"
              />
              <label
                htmlFor="script-upload"
                className="btn-primary cursor-pointer inline-flex items-center space-x-2"
              >
                <FileText size={18} />
                <span>Choose Script File</span>
              </label>
              
              {file && (
                <p className="mt-3 text-white/80">Selected: {file.name}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={analyzeScript}
              disabled={!file || loading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Analyzing Script...</span>
                </>
              ) : (
                <>
                  <Brain size={18} />
                  <span>Analyze with Papu Master</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.finalScore)} mb-2`}>
                {analysis.finalScore}/100
              </div>
              <div className={`inline-block px-4 py-2 rounded-lg border ${getRecommendationColor(analysis.recommendation)}`}>
                {analysis.recommendation}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-1">Page Count</h4>
                <p className="text-white/80">{analysis.metrics.pageCount.toFixed(1)} pages</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-1">Scene Count</h4>
                <p className="text-white/80">{analysis.metrics.sceneCount} scenes</p>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <Star className="text-yellow-400" size={18} />
                <span>Papu Master's Analysis</span>
              </h4>
              <div className="text-white/80 whitespace-pre-wrap text-sm">
                {analysis.aiAnalysis}
              </div>
            </div>

            <button
              onClick={() => setAnalysis(null)}
              className="w-full btn-secondary py-3"
            >
              Analyze Another Script
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PapuMaster;