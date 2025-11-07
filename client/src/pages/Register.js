import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios, { setAuthToken } from '../utils/auth';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    artistType: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', formData);
      setAuthToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  const formStyle = {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50'}}>Register</h2>
      
      {error && (
        <div style={{color: 'red', marginBottom: '1rem', textAlign: 'center'}}>
          {error}
        </div>
      )}
      
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        style={inputStyle}
        required
      />
      
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
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
        <option value="">Select Artist Type</option>
        <option value="Actor">Actor</option>
        <option value="Director">Director</option>
        <option value="Writer">Writer</option>
        <option value="Editor">Editor</option>
        <option value="Producer">Producer</option>
        <option value="Cinematographer">Cinematographer</option>
        <option value="Other">Other</option>
      </select>
      
      <input
        type="password"
        name="password"
        placeholder="Password (min 6 characters)"
        value={formData.password}
        onChange={handleChange}
        style={inputStyle}
        required
        minLength="6"
      />
      
      <button type="submit" style={buttonStyle}>Register</button>
      
      <p style={{textAlign: 'center', marginTop: '1rem'}}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </form>
  );
};

export default Register;