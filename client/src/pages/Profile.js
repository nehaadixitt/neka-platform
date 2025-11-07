import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X, User, Mail, Briefcase, MessageSquare, Users, FolderOpen } from 'lucide-react';
import axios from '../utils/auth';

const Profile = ({ user, setUser }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    artistType: user?.artistType || '',
    bio: user?.bio || '',
    contactInfo: user?.contactInfo || ''
  });
  const [projects, setProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchCollabProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects/my');
      setProjects(res.data);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/users/profile', formData);
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const finishedProjects = projects.filter(p => p.status === 'finished');

  const ProjectCard = ({ project, showCollabButton = false }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-all duration-300"
    >
      <h4 className="font-semibold text-white mb-2">{project.title}</h4>
      <p className="text-white/70 text-sm mb-3 line-clamp-2">{project.summary}</p>
      {showCollabButton && (
        <button className="btn-primary text-xs">
          Request Collaboration
        </button>
      )}
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
              <p className="text-purple-300">{user?.artistType}</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing(!editing)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit3 size={16} />
            <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
          </motion.button>
        </div>

        {editing ? (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-white/80 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/80 mb-2">Artist Type</label>
              <select
                name="artistType"
                value={formData.artistType}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                required
              >
                <option value="Actor">Actor</option>
                <option value="Director">Director</option>
                <option value="Writer">Writer</option>
                <option value="Editor">Editor</option>
                <option value="Producer">Producer</option>
                <option value="Cinematographer">Cinematographer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white/80 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div>
              <label className="block text-white/80 mb-2">Contact Info</label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                placeholder="Email, phone, or social media"
              />
            </div>
            
            <div className="flex space-x-4">
              <button type="submit" className="btn-primary flex items-center space-x-2">
                <Save size={16} />
                <span>Save Changes</span>
              </button>
              <button 
                type="button" 
                onClick={() => setEditing(false)}
                className="btn-secondary flex items-center space-x-2"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          </motion.form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-purple-400" />
              <span className="text-white/80">{user?.email}</span>
            </div>
            
            {user?.bio && (
              <div className="flex items-start space-x-3">
                <MessageSquare size={16} className="text-purple-400 mt-1" />
                <p className="text-white/80">{user.bio}</p>
              </div>
            )}
            
            {user?.contactInfo && (
              <div className="flex items-center space-x-3">
                <Briefcase size={16} className="text-purple-400" />
                <span className="text-white/80">{user.contactInfo}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ongoing Projects */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-4">
            <FolderOpen className="text-yellow-400" size={20} />
            <h3 className="text-xl font-semibold text-white">
              Ongoing Projects ({ongoingProjects.length})
            </h3>
          </div>
          <div className="space-y-3">
            {ongoingProjects.length === 0 ? (
              <p className="text-white/60 text-center py-8">No ongoing projects</p>
            ) : (
              ongoingProjects.slice(0, 3).map(project => (
                <ProjectCard key={project._id} project={project} />
              ))
            )}
          </div>
        </motion.div>

        {/* Finished Projects */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-4">
            <FolderOpen className="text-green-400" size={20} />
            <h3 className="text-xl font-semibold text-white">
              Completed Projects ({finishedProjects.length})
            </h3>
          </div>
          <div className="space-y-3">
            {finishedProjects.length === 0 ? (
              <p className="text-white/60 text-center py-8">No completed projects</p>
            ) : (
              finishedProjects.slice(0, 3).map(project => (
                <ProjectCard key={project._id} project={project} showCollabButton />
              ))
            )}
          </div>
        </motion.div>

        {/* Collaborative Projects */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Users className="text-purple-400" size={20} />
            <h3 className="text-xl font-semibold text-white">
              Collaborations ({collabProjects.length})
            </h3>
          </div>
          <div className="space-y-3">
            {collabProjects.length === 0 ? (
              <p className="text-white/60 text-center py-8">No collaborations yet</p>
            ) : (
              collabProjects.slice(0, 3).map(project => (
                <ProjectCard key={project._id} project={project} />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;