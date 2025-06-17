import React from 'react';
import { 
  FaVideo, 
  FaUserShield, 
  FaChartLine,
  FaCog,
  FaUserCircle,
  FaSignOutAlt
} from 'react-icons/fa';
import Logo from './Logo';

const Sidebar = () => {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <Logo size="medium" />
        <h2>ClassyCam</h2>
      </div>
      
      <div className="sidebar-nav">
        <ul>
          <li className="active">
            <a href="#">
              <span className="nav-icon"><FaVideo /></span>
              <span>Live Monitoring</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="nav-icon"><FaUserShield /></span>
              <span>Security Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="nav-icon"><FaChartLine /></span>
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="nav-icon"><FaCog /></span>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </div>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <FaUserCircle className="user-avatar" />
          <div className="user-info">
            <p className="user-name">Admin User</p>
            <p className="user-role">Administrator</p>
          </div>
          <button className="logout-btn">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;