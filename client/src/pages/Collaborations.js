import React, { useState, useEffect } from 'react';
import axios from '../utils/auth';

const Collaborations = ({ user }) => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [finishedProjects, setFinishedProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);

  useEffect(() => {
    fetchIncomingRequests();
    fetchFinishedProjects();
    fetchCollabProjects();
  }, []);

  const fetchIncomingRequests = async () => {
    try {
      const res = await axios.get('/api/collaborations/incoming');
      setIncomingRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleRequest = async (requestId, status) => {
    try {
      await axios.put(`/api/collaborations/request/${requestId}`, { status });
      fetchIncomingRequests();
      if (status === 'accepted') {
        fetchCollabProjects();
      }
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

  const buttonStyle = {
    padding: '0.5rem 1rem',
    margin: '0.25rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <h2 style={{marginBottom: '2rem', color: '#2c3e50'}}>Collaborations</h2>

      {/* Incoming Requests */}
      <div style={cardStyle}>
        <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>
          Incoming Requests ({incomingRequests.length})
        </h3>
        {incomingRequests.length === 0 ? (
          <p style={{color: '#666'}}>No pending requests.</p>
        ) : (
          incomingRequests.map(request => (
            <div key={request._id} style={{padding: '1rem', border: '1px solid #eee', marginBottom: '1rem', borderRadius: '4px'}}>
              <h4>{request.projectId.title}</h4>
              <p>{request.projectId.summary}</p>
              <p style={{color: '#666', marginBottom: '1rem'}}>
                Request from: {request.senderId.name} ({request.senderId.artistType})
              </p>
              <button 
                onClick={() => handleRequest(request._id, 'accepted')}
                style={{...buttonStyle, backgroundColor: '#27ae60', color: 'white'}}
              >
                Accept
              </button>
              <button 
                onClick={() => handleRequest(request._id, 'denied')}
                style={{...buttonStyle, backgroundColor: '#e74c3c', color: 'white'}}
              >
                Deny
              </button>
            </div>
          ))
        )}
      </div>

      {/* Available Projects */}
      <div style={cardStyle}>
        <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>
          Available Projects ({finishedProjects.length})
        </h3>
        {finishedProjects.length === 0 ? (
          <p style={{color: '#666'}}>No projects available for collaboration.</p>
        ) : (
          finishedProjects.map(project => (
            <div key={project._id} style={{padding: '1rem', border: '1px solid #eee', marginBottom: '1rem', borderRadius: '4px'}}>
              <h4>{project.title}</h4>
              <p>{project.summary}</p>
              <p style={{color: '#666', marginBottom: '1rem'}}>
                by {project.userId.name} ({project.userId.artistType})
              </p>
              <button 
                onClick={() => sendCollabRequest(project._id, project.userId._id)}
                style={{...buttonStyle, backgroundColor: '#3498db', color: 'white'}}
              >
                Request Collaboration
              </button>
            </div>
          ))
        )}
      </div>

      {/* Collaborative Projects */}
      <div style={cardStyle}>
        <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>
          My Collaborative Projects ({collabProjects.length})
        </h3>
        {collabProjects.length === 0 ? (
          <p style={{color: '#666'}}>No collaborative projects yet.</p>
        ) : (
          collabProjects.map(project => (
            <div key={project._id} style={{padding: '1rem', border: '1px solid #eee', marginBottom: '1rem', borderRadius: '4px'}}>
              <h4>{project.title}</h4>
              <p>{project.summary}</p>
              <p style={{color: '#666'}}>
                Owner: {project.userId.name} ({project.userId.artistType})
              </p>
              <div style={{marginTop: '0.5rem'}}>
                <strong>Collaborators:</strong>
                {project.collaborators.map(collab => (
                  <span key={collab._id} style={{
                    display: 'inline-block',
                    margin: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#ecf0f1',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    {collab.name} ({collab.artistType})
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Collaborations;