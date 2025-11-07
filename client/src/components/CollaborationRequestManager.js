import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import axios from '../utils/auth';

const CollaborationRequestManager = ({ user }) => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const fetchIncomingRequests = async () => {
    try {
      const res = await axios.get('/api/collaborations/incoming');
      setIncomingRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setLoading(true);
    try {
      await axios.put(`/api/collaborations/request/${requestId}/accept`);
      setMessage('Collaboration request accepted successfully!');
      fetchIncomingRequests();
      
      // Trigger projects refresh by dispatching custom event
      window.dispatchEvent(new CustomEvent('projectsUpdated'));
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error accepting request');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await axios.put(`/api/collaborations/request/${requestId}/reject`);
      setMessage('Collaboration request rejected');
      fetchIncomingRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error rejecting request');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-red-400" size={24} />
        <h2 className="text-2xl font-bold cinema-header">🎬 Incoming Collaboration Requests</h2>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded-lg mb-6 backdrop-blur-lg ${
            message.includes('successfully') || message.includes('accepted')
              ? 'border border-green-400/50 text-green-300'
              : 'border border-red-400/50 text-red-300'
          }`}
          style={{
            background: message.includes('successfully') || message.includes('accepted')
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(255, 255, 255, 0.1))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(255, 255, 255, 0.1))'
          }}
        >
          {message}
        </motion.div>
      )}

      {incomingRequests.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto mb-4 text-white/40" size={48} />
          <p className="text-white/60">No pending collaboration requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incomingRequests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg p-6 border border-red-300/30 backdrop-blur-lg"
              style={{background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(255, 255, 255, 0.05))'}}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {request.projectId.title}
                  </h3>
                  <p className="text-white/70 mb-3">{request.projectId.summary}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>From: {request.senderId.name} ({request.senderId.artistType})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <p className="text-white/80 italic">"{request.message}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAcceptRequest(request._id)}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 flex-1"
                >
                  <CheckCircle size={16} />
                  {loading ? 'Processing...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleRejectRequest(request._id)}
                  disabled={loading}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-lg transition-colors flex items-center gap-2 flex-1"
                >
                  <XCircle size={16} />
                  {loading ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollaborationRequestManager;