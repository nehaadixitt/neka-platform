import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, FileText, UserPlus, Settings } from 'lucide-react';
import axios from '../utils/auth';
import CollaborationRequest from '../components/CollaborationRequest';
import ProjectDashboard from '../components/ProjectDashboard';

const ProjectDetail = ({ user }) => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCollabRequest, setShowCollabRequest] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data);
      
      // Check if user is owner or collaborator to show dashboard
      const isOwner = res.data.userId._id === user?.id;
      const isCollaborator = res.data.collaborators.some(c => c._id === user?.id);
      setShowDashboard(isOwner || isCollaborator);
    } catch (err) {
      console.error('Error fetching project:', err);
    }
    setLoading(false);
  };

  const handleCollabSuccess = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
        <p className="text-white/60">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isOwner = project.userId._id === user?.id;
  const isCollaborator = project.collaborators.some(c => c._id === user?.id);
  const canRequestCollab = user && !isOwner && !isCollaborator;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      {/* Success Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6"
        >
          {message}
        </motion.div>
      )}

      {showDashboard ? (
        <ProjectDashboard project={project} />
      ) : (
        <div className="space-y-6">
          {/* Project Header */}
          <div className="card">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
                <div className="flex items-center gap-4 mb-4 text-white/60">
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    Owner: {project.userId.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    project.status === 'finished'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {canRequestCollab && (
                <button
                  onClick={() => setShowCollabRequest(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Request Collaboration
                </button>
              )}

              {isOwner && (
                <button className="btn-secondary flex items-center gap-2">
                  <Settings size={16} />
                  Manage Project
                </button>
              )}
            </div>

            <p className="text-white/80 text-lg mb-6">{project.summary}</p>

            {/* Script Download */}
            {project.scriptPath && (
              <div className="flex items-center gap-2 text-purple-300 mb-6">
                <FileText size={16} />
                <a
                  href={`/uploads/${project.scriptPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-200 transition-colors"
                >
                  Download Script
                </a>
              </div>
            )}

            {/* Collaborators */}
            {project.collaborators.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Collaborators</h3>
                <div className="flex flex-wrap gap-3">
                  {project.collaborators.map(collaborator => (
                    <div
                      key={collaborator._id}
                      className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2"
                    >
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {collaborator.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{collaborator.name}</p>
                        <p className="text-xs text-white/60">{collaborator.artistType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">About This Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white/80 mb-2">Project Owner</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">
                    {project.userId.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{project.userId.name}</p>
                    <p className="text-sm text-white/60">{project.userId.artistType}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white/80 mb-2">Team Size</h4>
                <p className="text-2xl font-bold text-purple-400">
                  {project.collaborators.length + 1}
                </p>
                <p className="text-sm text-white/60">
                  {project.collaborators.length} collaborators + owner
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Request Modal */}
      {showCollabRequest && (
        <CollaborationRequest
          project={project}
          onClose={() => setShowCollabRequest(false)}
          onSuccess={handleCollabSuccess}
        />
      )}
    </motion.div>
  );
};

export default ProjectDetail;