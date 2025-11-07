import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Send, ChevronDown, ChevronUp } from 'lucide-react';
import axios from '../utils/auth';

const CollaborationProfiles = ({ user }) => {
  const [profiles, setProfiles] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchMyProjects();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await axios.get('/api/users/profiles');
      setProfiles(res.data);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  const fetchMyProjects = async () => {
    try {
      const res = await axios.get('/api/projects/my');
      setMyProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(selectedProfile?._id === profile._id ? null : profile);
    setSelectedProject('');
    setMessage('');
  };

  const handleSendRequest = async () => {
    if (!selectedProject || !message.trim()) {
      alert('Please select a project and write a message');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/collaborations/request', {
        targetProjectId: selectedProject,
        targetUserId: selectedProfile._id,
        message: message.trim()
      });
      
      alert('Collaboration request sent successfully!');
      setSelectedProfile(null);
      setSelectedProject('');
      setMessage('');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error sending request');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Send Collaboration Requests</h2>
        
        {profiles.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto mb-4 text-white/40" size={48} />
            <p className="text-white/60">No other users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-white/10 rounded-lg overflow-hidden"
              >
                {/* Profile Header */}
                <div
                  onClick={() => handleProfileClick(profile)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center font-bold text-lg">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{profile.name}</h3>
                      <p className="text-purple-300 text-sm">{profile.artistType}</p>
                      {profile.bio && (
                        <p className="text-white/60 text-sm mt-1">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                  {selectedProfile?._id === profile._id ? (
                    <ChevronUp className="text-white/60" size={20} />
                  ) : (
                    <ChevronDown className="text-white/60" size={20} />
                  )}
                </div>

                {/* Collaboration Form */}
                <AnimatePresence>
                  {selectedProfile?._id === profile._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 p-4 bg-white/5"
                    >
                      <div className="space-y-4">
                        {/* Project Selection */}
                        <div>
                          <label className="block text-white/80 mb-2">Select Your Project:</label>
                          {myProjects.length === 0 ? (
                            <p className="text-white/60 text-sm">You don't have any projects yet. Create a project first.</p>
                          ) : (
                            <select
                              value={selectedProject}
                              onChange={(e) => setSelectedProject(e.target.value)}
                              className="input"
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

                        {/* Message */}
                        <div>
                          <label className="block text-white/80 mb-2">Collaboration Message:</label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Explain how you'd like to collaborate..."
                            className="input h-24 resize-none"
                            maxLength={500}
                          />
                          <p className="text-white/40 text-xs mt-1">{message.length}/500 characters</p>
                        </div>

                        {/* Send Button */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedProfile(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSendRequest}
                            disabled={loading || !selectedProject || !message.trim() || myProjects.length === 0}
                            className="btn-primary flex items-center gap-2"
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

export default CollaborationProfiles;