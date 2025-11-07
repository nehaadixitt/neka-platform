import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Send, ChevronDown, ChevronUp, Users } from 'lucide-react';
import axios from '../utils/auth';

const CollaborationRequestForm = ({ user }) => {
  const [profiles, setProfiles] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAllUsers();
    fetchMyProjects();
  }, []);

  // Fetch all users excluding current user
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/api/users/profiles');
      setProfiles(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user profiles');
    }
  };

  // Fetch logged-in user's projects
  const fetchMyProjects = async () => {
    try {
      const response = await axios.get('/api/projects/my');
      setMyProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load your projects');
    }
  };

  const handleProfileClick = (profile) => {
    if (selectedProfile?._id === profile._id) {
      setSelectedProfile(null);
    } else {
      setSelectedProfile(profile);
      setSelectedProject('');
      setMessage('');
      setError('');
      setSuccess('');
    }
  };

  const handleSendRequest = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }
    if (!message.trim()) {
      setError('Please write a message');
      return;
    }
    if (message.length > 500) {
      setError('Message must be less than 500 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/collaborations/request', {
        targetUserId: selectedProfile._id,
        targetProjectId: selectedProject,
        message: message.trim()
      });

      setSuccess('Collaboration request sent successfully!');
      setSelectedProfile(null);
      setSelectedProject('');
      setMessage('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send collaboration request');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-red-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold cinema-header">🎬 Send Collaboration Requests</h2>
            <p className="text-white/80">Connect with other filmmakers and invite them to collaborate</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6"
          >
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* User Profiles */}
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto mb-4 text-white/40" size={48} />
            <p className="text-white/60">No other users found</p>
            <p className="text-white/40 text-sm">Invite more filmmakers to join the platform!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-white/10 rounded-lg overflow-hidden hover:border-purple-400/30 transition-colors"
              >
                {/* Profile Header */}
                <div
                  onClick={() => handleProfileClick(profile)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Profile Picture */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg" style={{background: 'linear-gradient(135deg, #dc2626, #ef4444, #ffffff)'}}>
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Profile Info */}
                    <div>
                      <h3 className="font-bold text-lg text-white">{profile.name}</h3>
                      <p className="text-red-300 text-sm font-medium">{profile.artistType}</p>
                      {profile.bio && (
                        <p className="text-white/60 text-sm mt-1 max-w-md truncate">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Expand Icon */}
                  <motion.div
                    animate={{ rotate: selectedProfile?._id === profile._id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="text-white/60" size={20} />
                  </motion.div>
                </div>

                {/* Collaboration Form */}
                <AnimatePresence>
                  {selectedProfile?._id === profile._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10 bg-white/5"
                    >
                      <div className="p-6 space-y-4">
                        {/* Project Selection */}
                        <div>
                          <label className="block text-white/80 font-medium mb-2">
                            Select Your Project to Collaborate On:
                          </label>
                          {myProjects.length === 0 ? (
                            <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-lg">
                              <p className="text-sm">You don't have any projects yet.</p>
                              <p className="text-xs text-yellow-200 mt-1">Create a project first to send collaboration requests.</p>
                            </div>
                          ) : (
                            <select
                              value={selectedProject}
                              onChange={(e) => setSelectedProject(e.target.value)}
                              className="input dropdown-text"
                              disabled={loading}
                              style={{color: 'black'}}
                            >
                              <option value="">Choose a project...</option>
                              {myProjects.map(project => (
                                <option key={project._id} value={project._id}>
                                  {project.title} ({project.status})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Message Input */}
                        <div>
                          <label className="block text-white/80 font-medium mb-2">
                            Collaboration Message:
                          </label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={`Hi ${profile.name}, I'd love to collaborate with you on my project. Here's what I have in mind...`}
                            className="input h-24 resize-none"
                            maxLength={500}
                            disabled={loading}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-white/40 text-xs">
                              Be specific about the type of collaboration you're looking for
                            </p>
                            <p className="text-white/40 text-xs">
                              {message.length}/500 characters
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => setSelectedProfile(null)}
                            className="btn-secondary flex-1"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendRequest}
                            disabled={loading || !selectedProject || !message.trim() || myProjects.length === 0}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                          >
                            <Send size={16} />
                            {loading ? 'Sending...' : 'Send Request'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationRequestForm;