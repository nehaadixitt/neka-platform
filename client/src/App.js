import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from './utils/auth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Messages from './pages/Messages';
import Collaborations from './pages/Collaborations';
import ProjectDetail from './pages/ProjectDetail';
import TestCollab from './pages/TestCollab';
import PapuMaster from './pages/PapuMaster';


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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar user={user} logout={logout} />
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/profile" />} />
              <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/profile" />} />
              <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
              <Route path="/projects" element={user ? <Projects user={user} /> : <Navigate to="/login" />} />
              <Route path="/project/:id" element={user ? <ProjectDetail user={user} /> : <Navigate to="/login" />} />

              <Route path="/messages" element={user ? <Messages user={user} /> : <Navigate to="/login" />} />
              <Route path="/collaborations" element={user ? <Collaborations user={user} /> : <Navigate to="/login" />} />
              <Route path="/papu-master" element={user ? <PapuMaster user={user} /> : <Navigate to="/login" />} />
              <Route path="/test-collab" element={user ? <TestCollab user={user} /> : <Navigate to="/login" />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;