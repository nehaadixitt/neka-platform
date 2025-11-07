import React, { useState, useEffect } from 'react';
import axios from '../utils/auth';

const Projects = ({ user }) => {
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
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects/my');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
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

  const sendCollabRequest = async (projectId, receiverId) => {
    try {
      await axios.post('/api/collaborations/request', { projectId, receiverId });
      alert('Collaboration request sent!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error sending request');
    }
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    margin: '0.25rem 0',
    border: '1px solid #ddd',
    borderRadius: '4px'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    margin: '0.5rem 0.5rem 0.5rem 0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <div style={cardStyle}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h2 style={{color: '#2c3e50'}}>My Projects</h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            style={{...buttonStyle, backgroundColor: '#27ae60', color: 'white'}}
          >
            + New Project
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '4px'}}>
            <input
              type="text"
              name="title"
              placeholder="Project Title"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="ongoing">Ongoing</option>
              <option value="finished">Finished</option>
            </select>
            <textarea
              name="summary"
              placeholder="Project Summary"
              value={formData.summary}
              onChange={handleChange}
              style={{...inputStyle, height: '80px'}}
              required
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              style={inputStyle}
            />
            <button type="submit" style={{...buttonStyle, backgroundColor: '#3498db', color: 'white'}}>
              Create Project
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{...buttonStyle, backgroundColor: '#95a5a6', color: 'white'}}>
              Cancel
            </button>
          </form>
        )}

        {projects.length === 0 ? (
          <p style={{textAlign: 'center', color: '#666'}}>No projects yet. Create your first project!</p>
        ) : (
          projects.map(project => (
            <div key={project._id} style={{padding: '1rem', border: '1px solid #eee', marginBottom: '1rem', borderRadius: '4px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{flex: 1}}>
                  <h3 style={{marginBottom: '0.5rem'}}>{project.title}</h3>
                  <p style={{color: '#666', marginBottom: '0.5rem'}}>
                    Status: <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      backgroundColor: project.status === 'finished' ? '#27ae60' : '#f39c12',
                      color: 'white'
                    }}>
                      {project.status}
                    </span>
                  </p>
                  <p style={{marginBottom: '0.5rem'}}>{project.summary}</p>
                  {project.scriptPath && (
                    <p style={{fontSize: '0.9rem', color: '#666'}}>
                      Script: {project.scriptPath}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;