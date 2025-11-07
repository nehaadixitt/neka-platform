import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, logout }) => {
  const navStyle = {
    backgroundColor: '#2c3e50',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 1rem',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  };

  const buttonStyle = {
    ...linkStyle,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={{...linkStyle, fontSize: '1.5rem', fontWeight: 'bold'}}>
          NEKA
        </Link>
      </div>
      
      <div style={{display: 'flex', alignItems: 'center'}}>
        {user ? (
          <>
            <span style={{marginRight: '1rem'}}>Welcome, {user.name}</span>
            <Link to="/profile" style={linkStyle}>My Profile</Link>
            <Link to="/projects" style={linkStyle}>Projects</Link>
            <Link to="/collaborations" style={linkStyle}>Collaborations</Link>
            <Link to="/messages" style={linkStyle}>Messages</Link>
            <button onClick={logout} style={buttonStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;