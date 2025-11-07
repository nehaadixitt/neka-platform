import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from './utils/auth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Messages from './pages/Messages';
import Collaborations from './pages/Collaborations';

const API = process.env.REACT_APP_API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/api/auth/me`)
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  if (loading) return <div style={{padding: '20px'}}>Loading...</div>;

  return (
    <Router>
      <div style={{minHeight: '100vh', backgroundColor: '#f5f5f5'}}>
        <Navbar user={user} logout={logout} />
        <div style={{padding: '20px'}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/profile" />} />
            <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/profile" />} />
            <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
            <Route path="/projects" element={user ? <Projects user={user} /> : <Navigate to="/login" />} />
            <Route path="/messages" element={user ? <Messages user={user} /> : <Navigate to="/login" />} />
            <Route path="/collaborations" element={user ? <Collaborations user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;