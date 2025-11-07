import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import axios from '../utils/auth';

const CollaborationRequest = ({ project, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/collaborations/request', {
        projectId: project._id,
        receiverId: project.userId._id,
        message: message.trim()
      });
      
      onSuccess('Collaboration request sent successfully!');
      onClose();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error sending request');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Collaboration Request</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-white/80 mb-2">Project: <span className="font-semibold">{project.title}</span></p>
          <p className="text-white/60">Owner: {project.userId.name}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white/80 mb-2">Your collaboration proposal:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain how you'd like to collaborate on this project..."
              className="input h-24 resize-none"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CollaborationRequest;