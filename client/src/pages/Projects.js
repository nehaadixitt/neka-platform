import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, FileText, Calendar, Users, X, Upload, ArrowRight, Crown, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/auth';

const Projects = ({ user }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    status: 'ongoing',
    summary: ''
  });
  const [scriptFile, setScriptFile] = useState(null);

  useEffect(() => {
    fetchProjects();
    
    // Listen for project updates from collaboration acceptance
    const handleProjectsUpdate = () => {
      fetchProjects();
    };
    
    window.addEventListener('projectsUpdated', handleProjectsUpdate);
    
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdate);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects/my');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setScriptFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('status', formData.status);
    data.append('summary', formData.summary);
    if (scriptFile) {
      data.append('script', scriptFile);
    }

    try {
      await axios.post('/api/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ title: '', status: 'ongoing', summary: '' });
      setScriptFile(null);
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const finishedProjects = projects.filter(p => p.status === 'finished');

  const ProjectCard = ({ project, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="card group cursor-pointer"
      onClick={() => navigate(`/project/${project._id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            project.status === 'finished' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <FolderOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                {project.title}
              </h3>
              {project.isOwner ? (
                <Crown className="text-yellow-400" size={16} title="Owner" />
              ) : project.isCollaborative ? (
                <UserCheck className="text-blue-400" size={16} title="Collaborator" />
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'finished'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {project.status}
              </span>
              {project.isCollaborative && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                  Collaborative
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-white/60">
          <Calendar size={16} />
          <span className="text-sm">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <p className="text-white/70 mb-4 line-clamp-3">{project.summary}</p>
      
      {!project.isOwner && project.userId && (
        <div className="flex items-center space-x-2 text-blue-300 mb-3">
          <Crown size={14} />
          <span className="text-sm">Owner: {project.userId.name}</span>
        </div>
      )}

      {project.scriptPath && (
        <div className="flex items-center space-x-2 text-purple-300 mb-4">
          <FileText size={16} />
          <span className="text-sm">Script attached</span>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        {project.collaborators && project.collaborators.length > 0 && (
          <div className="flex items-center space-x-2 text-blue-300">
            <Users size={16} />
            <span className="text-sm">{project.collaborators.length} collaborators</span>
          </div>
        )}
        <ArrowRight className="text-white/40 group-hover:text-purple-400 transition-colors" size={20} />
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.h1 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="text-4xl font-bold cinema-header"
        >
          🎬 My Projects
        </motion.h1>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Project</span>
        </motion.button>
      </div>

      {/* Create Project Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Project</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Project Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter project title..."
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input dropdown-text"
                  style={{color: 'black'}}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="finished">Finished</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Project Summary</label>
                <textarea
                  name="summary"
                  placeholder="Describe your project..."
                  value={formData.summary}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Script Upload (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="script-upload"
                  />
                  <label
                    htmlFor="script-upload"
                    className="flex items-center justify-center w-full bg-white/10 border border-white/20 border-dashed rounded-lg px-4 py-8 text-white/60 hover:text-white hover:border-purple-400 cursor-pointer transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto mb-2" size={24} />
                      <p>{scriptFile ? scriptFile.name : 'Click to upload script'}</p>
                      <p className="text-sm text-white/40">PDF, DOC, DOCX, TXT</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <FolderOpen className="mx-auto mb-4 text-white/40" size={64} />
          <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
          <p className="text-white/60 mb-6">Create your first project to get started!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Plus size={20} />
            <span>Create Project</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Ongoing Projects */}
          {ongoingProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Ongoing Projects ({ongoingProjects.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingProjects.map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Finished Projects */}
          {finishedProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Completed Projects ({finishedProjects.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finishedProjects.map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Projects;