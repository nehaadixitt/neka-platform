import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageCircle, Users, Calendar } from 'lucide-react';
import axios from '../utils/auth';

const ProjectDashboard = ({ project }) => {
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  const [showNewUpdate, setShowNewUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, [project._id]);

  const fetchUpdates = async () => {
    try {
      const res = await axios.get(`/api/project-updates/project/${project._id}`);
      setUpdates(res.data);
    } catch (err) {
      console.error('Error fetching updates:', err);
    }
  };

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.title.trim() || !newUpdate.content.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/project-updates', {
        projectId: project._id,
        title: newUpdate.title.trim(),
        content: newUpdate.content.trim()
      });
      
      setNewUpdate({ title: '', content: '' });
      setShowNewUpdate(false);
      fetchUpdates();
    } catch (err) {
      alert('Error creating update');
    }
    setLoading(false);
  };

  const handleAddComment = async (updateId, content) => {
    if (!content.trim()) return;

    try {
      await axios.post(`/api/project-updates/${updateId}/comment`, {
        content: content.trim()
      });
      fetchUpdates();
    } catch (err) {
      alert('Error adding comment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
            <p className="text-white/70 mb-3">{project.summary}</p>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <Users size={16} />
                Owner: {project.userId.name}
              </span>
              <span className="flex items-center gap-1">
                <Users size={16} />
                {project.collaborators.length} Collaborators
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowNewUpdate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Update
          </button>
        </div>

        {/* Collaborators */}
        <div className="flex flex-wrap gap-2">
          {project.collaborators.map(collaborator => (
            <span
              key={collaborator._id}
              className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
            >
              {collaborator.name}
            </span>
          ))}
        </div>
      </div>

      {/* New Update Form */}
      {showNewUpdate && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-bold mb-4">Create Project Update</h3>
          <form onSubmit={handleCreateUpdate}>
            <div className="mb-4">
              <input
                type="text"
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                placeholder="Update title..."
                className="input"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                value={newUpdate.content}
                onChange={(e) => setNewUpdate({...newUpdate, content: e.target.value})}
                placeholder="What's new with the project?"
                className="input h-24 resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNewUpdate(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Create Update'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Updates */}
      <div className="space-y-4">
        {updates.map((update, index) => (
          <UpdateCard
            key={update._id}
            update={update}
            onAddComment={handleAddComment}
            index={index}
          />
        ))}
        
        {updates.length === 0 && (
          <div className="card text-center py-8">
            <Calendar className="mx-auto mb-4 text-white/40" size={48} />
            <p className="text-white/60">No updates yet. Create the first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const UpdateCard = ({ update, onAddComment, index }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    onAddComment(update._id, newComment);
    setNewComment('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-lg">{update.title}</h4>
          <p className="text-white/60 text-sm">
            by {update.userId.name} • {new Date(update.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-white/60 hover:text-white text-sm"
        >
          <MessageCircle size={16} />
          {update.comments.length}
        </button>
      </div>
      
      <p className="text-white/80 mb-4">{update.content}</p>

      {showComments && (
        <div className="border-t border-white/10 pt-4">
          {/* Comments */}
          <div className="space-y-3 mb-4">
            {update.comments.map((comment, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">{comment.userId.name}</span>
                  <span className="text-white/40 text-xs">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white/80 text-sm">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="input flex-1 text-sm"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="btn-primary text-sm px-4"
            >
              Comment
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectDashboard;