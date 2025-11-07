import React, { useState, useEffect } from 'react';
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

  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const finishedProjects = projects.filter(p => p.status === 'finished');

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <div style={cardStyle}>
        <h2 style={{marginBottom: '1rem', color: '#2c3e50'}}>My Profile</h2>
        
        {editing ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <select
              name="artistType"
              value={formData.artistType}
              onChange={handleChange}
              style={inputStyle}
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
            <textarea
              name="bio"
              placeholder="Bio"
              value={formData.bio}
              onChange={handleChange}
              style={{...inputStyle, height: '80px'}}
            />
            <input
              type="text"
              name="contactInfo"
              placeholder="Contact Info"
              value={formData.contactInfo}
              onChange={handleChange}
              style={inputStyle}
            />
            <button type="submit" style={{...buttonStyle, backgroundColor: '#27ae60', color: 'white'}}>
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} style={{...buttonStyle, backgroundColor: '#95a5a6', color: 'white'}}>
              Cancel
            </button>
          </form>
        ) : (
          <div>
            <h3>{user?.name}</h3>
            <p><strong>Type:</strong> {user?.artistType}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            {user?.bio && <p><strong>Bio:</strong> {user.bio}</p>}
            {user?.contactInfo && <p><strong>Contact:</strong> {user.contactInfo}</p>}
            <button onClick={() => setEditing(true)} style={{...buttonStyle, backgroundColor: '#3498db', color: 'white'}}>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>Ongoing Projects ({ongoingProjects.length})</h3>
        {ongoingProjects.map(project => (
          <div key={project._id} style={{padding: '1rem', border: '1px solid #eee', marginBottom: '0.5rem', borderRadius: '4px'}}>
            <h4>{project.title}</h4>
            <p>{project.summary}</p>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>Finished Projects ({finishedProjects.length})</h3>
        {finishedProjects.map(project => (
          <div key={project._id} style={{padding: '1rem', border: '1px solid #eee', marginBottom: '0.5rem', borderRadius: '4px'}}>
            <h4>{project.title}</h4>
            <p>{project.summary}</p>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>Collaborative Projects ({collabProjects.length})</h3>
        {collabProjects.map(project => (
          <div key={project._id} style={{padding: '1rem', border: '1px solid #eee', marginBottom: '0.5rem', borderRadius: '4px'}}>
            <h4>{project.title}</h4>
            <p>{project.summary}</p>
            <p><small>Owner: {project.userId.name}</small></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;