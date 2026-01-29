import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Users, Star, ArrowRight } from 'lucide-react';
import axios from '../utils/auth';

const Home = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('/api/projects/finished')
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto"
    >
      {/* Hero Section */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
          NEKA
        </h1>
        <p className="text-xl text-white/80 mb-4 max-w-2xl mx-auto">
          Connect with scriptwriters, directors, actors, and other film artists
        </p>
        <p className="text-white/60 max-w-xl mx-auto">
          Discover finished projects and collaborate with talented filmmakers in the ultimate creative community
        </p>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
      >
        <div className="card text-center">
          <Film className="mx-auto mb-4 text-red-400" size={32} />
          <h3 className="text-2xl font-bold mb-2">{projects.length}</h3>
          <p className="text-white/70">Featured Projects</p>
        </div>
        <div className="card text-center">
          <Users className="mx-auto mb-4 text-red-500" size={32} />
          <h3 className="text-2xl font-bold mb-2">500+</h3>
          <p className="text-white/70">Active Artists</p>
        </div>
        <div className="card text-center">
          <Star className="mx-auto mb-4 text-red-600" size={32} />
          <h3 className="text-2xl font-bold mb-2">1000+</h3>
          <p className="text-white/70">Collaborations</p>
        </div>
      </motion.div>

      {/* Featured Projects */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Finished Projects
        </h2>
        
        {projects.length === 0 ? (
          <div className="card text-center py-12">
            <Film className="mx-auto mb-4 text-white/40" size={48} />
            <p className="text-white/60 text-lg">No projects available yet.</p>
            <p className="text-white/40">Be the first to showcase your work!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="card group"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                    {project.title}
                  </h3>
                  <ArrowRight className="text-white/40 group-hover:text-red-400 transition-colors" size={20} />
                </div>
                <p className="text-white/70 mb-3">
                  by {project.userId.name}
                </p>
                <span className="inline-block px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm mb-3">
                  {project.userId.artistType}
                </span>
                <p className="text-white/60 line-clamp-3 mb-4">{project.summary}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.href = `/project/${project._id}`}
                    className="btn-secondary text-sm flex-1"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Home;