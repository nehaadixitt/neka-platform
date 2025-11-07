import React, { useState, useEffect } from 'react';
import axios from '../utils/auth';

const Home = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('/api/projects/finished')
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  }, []);

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <h1 style={{textAlign: 'center', marginBottom: '2rem', color: '#2c3e50'}}>
        NEKA - All Things Filmmaking
      </h1>
      
      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <p style={{fontSize: '1.2rem', color: '#666', marginBottom: '1rem'}}>
          Connect with scriptwriters, directors, actors, and other film artists
        </p>
        <p style={{color: '#888'}}>
          Discover finished projects and collaborate with talented filmmakers
        </p>
      </div>

      <h2 style={{marginBottom: '1.5rem', color: '#2c3e50'}}>Featured Finished Projects</h2>
      
      {projects.length === 0 ? (
        <p style={{textAlign: 'center', color: '#666'}}>No projects available yet.</p>
      ) : (
        projects.map(project => (
          <div key={project._id} style={cardStyle}>
            <h3 style={{marginBottom: '0.5rem', color: '#2c3e50'}}>{project.title}</h3>
            <p style={{color: '#666', marginBottom: '0.5rem'}}>
              by {project.userId.name} ({project.userId.artistType})
            </p>
            <p style={{color: '#888'}}>{project.summary}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;