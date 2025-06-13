// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaVideo, FaChartLine, FaBell, FaCog, FaSignOutAlt 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
// src/components/Sidebar.jsx
import Logo from './Logo';

// Inside Sidebar component
<div className="sidebar-header">
  <Logo size="medium" />
</div>

const Sidebar = () => {
  return (
    <motion.div 
      className="sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="sidebar-header">
        <h1>Classy<span>Cam</span></h1>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          <FaHome />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/live" className="nav-item">
          <FaVideo />
          <span>Live Feed</span>
        </NavLink>
        <NavLink to="/analytics" className="nav-item">
          <FaChartLine />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/alerts" className="nav-item">
          <FaBell />
          <span>Alerts</span>
        </NavLink>
        <NavLink to="/settings" className="nav-item">
          <FaCog />
          <span>Settings</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;