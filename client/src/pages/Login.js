import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios, { setAuthToken } from '../utils/auth';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', formData);
      setAuthToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
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
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={{textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50'}}>Login</h2>
      
      {error && (
        <div style={{color: 'red', marginBottom: '1rem', textAlign: 'center'}}>
          {error}
        </div>
      )}
      
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        style={inputStyle}
        required
      />
      
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        style={inputStyle}
        required
      />
      
      <button type="submit" style={buttonStyle}>Login</button>
      
      <p style={{textAlign: 'center', marginTop: '1rem'}}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </form>
  );
};

export default Login;