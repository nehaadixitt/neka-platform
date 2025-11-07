import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Send } from 'lucide-react';
import axios from '../utils/auth';
import CollaborationRequest from '../components/CollaborationRequest';

const TestCollab = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [showCollabRequest, setShowCollabRequest] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects/finished');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleCollabRequest = (project) => {
    setSelectedProject(project);
    setShowCollabRequest(true);
  };

  const handleSuccess = (message) => {
    alert(message);
    setShowCollabRequest(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Collaboration Features</h1>
      
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Available Projects</h2>
        {projects.length === 0 ? (
          <p className="text-white/60">No projects available. Create some projects first!</p>
        ) : (
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project._id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{project.title}</h3>
                  <p className="text-white/70 text-sm">by {project.userId.name}</p>
                  <p className="text-white/60 text-sm">{project.summary}</p>
                </div>
                {user && project.userId._id !== user.id && (
                  <button
                    onClick={() => handleCollabRequest(project)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send size={16} />
                    Collaborate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCollabRequest && selectedProject && (
        <CollaborationRequest
          project={selectedProject}
          onClose={() => setShowCollabRequest(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default TestCollab;