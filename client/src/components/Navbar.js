import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, User, FolderOpen, MessageCircle, Users, LogOut, Brain } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = ({ user, logout }) => {
  const location = useLocation();

  const NavLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            isActive 
              ? 'bg-white/20 text-white' 
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          {Icon && <Icon size={18} />}
          <span>{children}</span>
        </motion.div>
      </Link>
    );
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Film className="text-red-500" size={28} />
              <span className="text-2xl font-bold bg-gradient-to-r from-black via-red-600 to-red-400 bg-clip-text text-transparent">
                NEKA
              </span>
            </motion.div>
          </Link>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <span className="text-white/80 mr-4 hidden md:block">
                  Welcome, {user.name}
                </span>
                <NavLink to="/profile" icon={User}>Profile</NavLink>
                <NavLink to="/projects" icon={FolderOpen}>Projects</NavLink>
                <NavLink to="/papu-master" icon={Brain}>Papu Master</NavLink>
                <NavLink to="/collaborations" icon={Users}>Collaborations</NavLink>
                <NavLink to="/messages" icon={MessageCircle}>Messages</NavLink>
                <NotificationBell />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-red-500/20 transition-all duration-300"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;