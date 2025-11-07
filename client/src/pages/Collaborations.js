import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, Send, Star, User, UserPlus } from 'lucide-react';
import axios from '../utils/auth';
import CollaborationRequestForm from '../components/CollaborationRequestForm';
import CollaborationRequestManager from '../components/CollaborationRequestManager';

const Collaborations = ({ user }) => {
  const [activeTab, setActiveTab] = useState('send');
  const [finishedProjects, setFinishedProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);

  useEffect(() => {
    fetchFinishedProjects();
    fetchCollabProjects();
  }, []);



  const fetchFinishedProjects = async () => {
    try {
      const res = await axios.get('/api/projects/finished');
      setFinishedProjects(res.data.filter(p => p.userId._id !== user.id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCollabProjects = async () => {
    try {
      const res = await axios.get('/api/collaborations/projects');
      setCollabProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };





  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold cinema-header mb-2">🎬 Collaborations</h1>
        <p className="text-white/80 text-lg">Connect and collaborate with fellow filmmakers</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="backdrop-blur-lg rounded-lg p-1 flex border border-red-300/30" style={{background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(255, 255, 255, 0.1))'}}>
          <button
            onClick={() => setActiveTab('send')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'send'
                ? 'text-white'
                : 'text-white/70 hover:text-white'
            }`}
            style={activeTab === 'send' ? {background: 'linear-gradient(135deg, #dc2626, #ef4444)'} : {}}
          >
            <UserPlus className="inline mr-2" size={16} />
            Send Requests
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'manage'
                ? 'text-white'
                : 'text-white/70 hover:text-white'
            }`}
            style={activeTab === 'manage' ? {background: 'linear-gradient(135deg, #dc2626, #ef4444)'} : {}}
          >
            <Users className="inline mr-2" size={16} />
            Manage Requests
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'send' ? (
        <CollaborationRequestForm user={user} />
      ) : (
        <div className="space-y-8">
          {/* Incoming Requests */}
          <CollaborationRequestManager user={user} />

      {/* Available Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Star className="text-blue-400" size={24} />
          <h2 className="text-2xl font-semibold text-white">
            Available Projects ({finishedProjects.length})
          </h2>
        </div>

        {finishedProjects.length === 0 ? (
          <div className="text-center py-8">
            <Star className="mx-auto mb-3 text-white/40" size={48} />
            <p className="text-white/60">No projects available for collaboration</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finishedProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-white/70 mb-3 line-clamp-2">{project.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white/60">
                    <User size={16} />
                    <span className="text-sm">
                      {project.userId.name} ({project.userId.artistType})
                    </span>
                  </div>
                  <span className="text-white/40 text-sm">
                    Use "Send Requests" tab to collaborate
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* My Collaborative Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Users className="text-purple-400" size={24} />
          <h2 className="text-2xl font-semibold text-white">
            My Collaborative Projects ({collabProjects.length})
          </h2>
        </div>

        {collabProjects.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto mb-3 text-white/40" size={48} />
            <p className="text-white/60">No collaborative projects yet</p>
            <p className="text-white/40 text-sm">Start collaborating to see projects here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collabProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-white/70 mb-3">{project.summary}</p>
                    <div className="flex items-center space-x-2 text-blue-300">
                      <User size={16} />
                      <span className="text-sm">
                        Owner: {project.userId.name} ({project.userId.artistType})
                      </span>
                    </div>
                  </div>
                </div>

                {project.collaborators && project.collaborators.length > 0 && (
                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Collaborators:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.collaborators.map(collab => (
                        <span
                          key={collab._id}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          <User size={12} />
                          <span>{collab.name} ({collab.artistType})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Collaborations;