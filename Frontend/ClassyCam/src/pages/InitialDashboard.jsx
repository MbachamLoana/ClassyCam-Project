import React, { useState, useEffect } from 'react';
import { 
  FaVideo, 
  FaUserShield, 
  FaChartLine,
  FaBell,
  FaCog,
  FaUserCircle,
  FaSearch,
  FaPlus,
  FaPlay,
  FaChevronRight,
  FaUsers,
  FaChalkboardTeacher,
  FaEye
} from 'react-icons/fa';
import { RiMenuFill } from 'react-icons/ri';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import './InitialDashboard.css';
import { useNavigate } from 'react-router-dom';

const InitialDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [classes, setClasses] = useState([
    { id: 1, name: 'Advanced Calculus', code: 'MATH101', students: 32, active: true, alerts: 2 },
    { id: 2, name: 'Organic Chemistry', code: 'CHEM205', students: 28, active: false, alerts: 0 },
    { id: 3, name: 'World History', code: 'HIST312', students: 35, active: true, alerts: 1 },
    { id: 4, name: 'English Literature', code: 'ENG108', students: 30, active: true, alerts: 0 },
    { id: 5, name: 'Computer Science', code: 'CS215', students: 40, active: false, alerts: 0 },
    { id: 6, name: 'Physics Lab', code: 'PHY305', students: 22, active: true, alerts: 3 }
  ]);
  
  const [notifications] = useState([
    { id: 1, type: 'critical', message: 'Unauthorized person detected', location: 'Room 101', time: '10:24 AM', read: false },
    { id: 2, type: 'warning', message: 'Multiple students distracted', location: 'Room 205', time: '9:47 AM', read: false },
    { id: 3, type: 'info', message: 'Attendance below threshold', location: 'Room 312', time: '9:15 AM', read: true }
  ]);
  
  const stats = [
    { id: 1, title: 'Active Classes', value: classes.filter(c => c.active).length, change: '+2 this week', icon: <FaChalkboardTeacher />, color: '#4361ee' },
    { id: 2, title: "Today's Alerts", value: 8, change: '-3 from yesterday', icon: <FaUserShield />, color: '#e63946' },
    { id: 3, title: 'Avg. Engagement', value: '82%', change: '+5% this month', icon: <FaChartLine />, color: '#4cc9f0' }
  ];
  
  const navItems = [
    { id: 'classes', icon: <FaUsers />, label: 'Classes' },
    { id: 'monitor', icon: <FaEye />, label: 'Monitor' }
  ];
  
  const handleCreateClass = () => {
    if (newClassName && newClassCode) {
      const newClass = {
        id: classes.length + 1,
        name: newClassName,
        code: newClassCode,
        students: 0,
        active: true,
        alerts: 0
      };
      
      setClasses([...classes, newClass]);
      setNewClassName('');
      setNewClassCode('');
    }
  };
  
  const toggleActiveStatus = (classId) => {
    setClasses(classes.map(cls => 
      cls.id === classId ? { ...cls, active: !cls.active } : cls
    ));
  };

  // Function to navigate to MonitoringDashboard
  const navigateToMonitoring = (classItem) => {
    navigate('/monitor', { 
      state: { 
        classInfo: {
          id: classItem.id,
          name: classItem.name,
          code: classItem.code,
          students: classItem.students
        }
      } 
    });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <motion.aside 
        className="dashboard-sidebar"
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="sidebar-header">
          <Logo size="medium" />
          <h2>ClassyCam</h2>
        </div>
        
        {/* Navigation */}
        <div className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li 
                key={item.id} 
                className={activeTab === item.id ? 'active' : ''}
              >
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                }}>
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Recent Alerts */}
        <div className="recent-alerts">
          <h4>Recent Alerts</h4>
          <ul>
            {notifications.slice(0, 3).map(alert => (
              <li key={alert.id} className={`alert ${alert.type}`}>
                <div className="alert-content">
                  <p>{alert.message}</p>
                  <small>{alert.location} • {alert.time}</small>
                </div>
                <FaChevronRight />
              </li>
            ))}
          </ul>
        </div>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <FaUserCircle className="user-avatar" />
            <div className="user-info">
              <p className="user-name">Admin User</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <RiMenuFill />
            </button>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search classes, students, reports..." 
              />
            </div>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-info">
              <FaUserCircle className="user-avatar" />
              <span>Admin User</span>
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <section className="stats-section">
          {stats.map((stat) => (
            <motion.div 
              key={stat.id}
              className="stats-card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="stats-content">
                <h3>{stat.title}</h3>
                <p className="stats-value">{stat.value}</p>
                <p className="stats-change">{stat.change}</p>
              </div>
              <div 
                className="stats-icon"
                style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
              >
                {stat.icon}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Dashboard Content */}
        {activeTab === 'classes' ? (
          <div className="class-management">
            <div className="management-header">
              <h2>Class Management</h2>
            </div>
            
            <div className="class-management-grid">
              <div className="create-class-container">
                <div className="create-class-form">
                  <div className="form-header">
                    <h3>Create New Class</h3>
                    <div className="form-icon">
                      <FaChalkboardTeacher />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Class Name</label>
                    <input 
                      type="text" 
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="e.g. Advanced Calculus"
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Code</label>
                    <input 
                      type="text" 
                      value={newClassCode}
                      onChange={(e) => setNewClassCode(e.target.value)}
                      placeholder="e.g. MATH101"
                    />
                  </div>
                  <button 
                    className="create-btn"
                    onClick={handleCreateClass}
                  >
                    <FaPlus /> Create Class
                  </button>
                </div>
              </div>
              
              <div className="class-grid-container">
                <div className="class-grid-header">
                  <h3>Your Classes ({classes.length})</h3>
                  <div className="search-classes">
                    <FaSearch />
                    <input type="text" placeholder="Search classes..." />
                  </div>
                </div>
                <div className="class-grid">
                  {classes.map((classItem) => (
                    <motion.div 
                      key={classItem.id}
                      className="class-card"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="class-header">
                        <div className="class-icon">
                          <FaChalkboardTeacher />
                        </div>
                        <div className="class-info">
                          <h3>{classItem.name}</h3>
                          <div className="class-code">{classItem.code}</div>
                        </div>
                        <div className={`status-indicator ${classItem.active ? 'active' : 'inactive'}`}>
                          {classItem.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="class-stats">
                        <div className="stat-item">
                          <span>Students</span>
                          <strong>{classItem.students}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Status</span>
                          <strong className={classItem.active ? 'active' : 'inactive'}>
                            {classItem.active ? 'Monitoring' : 'Paused'}
                          </strong>
                        </div>
                      </div>
                      <div className="class-actions">
                        <button 
                          className={`monitor-btn ${classItem.active ? 'active' : ''}`}
                          onClick={() => navigateToMonitoring(classItem)}
                        >
                          <FaEye /> Monitor
                        </button>
                        <button 
                          className="status-btn"
                          onClick={() => toggleActiveStatus(classItem.id)}
                        >
                          {classItem.active ? <FaCog /> : <FaPlay />}
                          {classItem.active ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="monitor-dashboard">
            <div className="monitor-header">
              <h2>Class Monitoring Dashboard</h2>
              <p>Select a class to start monitoring</p>
            </div>
            
            <div className="monitor-grid">
              {classes.map((classItem) => (
                <motion.div 
                  key={classItem.id}
                  className={`monitor-card ${classItem.active ? 'active' : 'inactive'}`}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigateToMonitoring(classItem)}
                >
                  <div className="card-header">
                    <div className="class-icon">
                      <FaChalkboardTeacher />
                    </div>
                    <div className="class-info">
                      <h3>{classItem.name}</h3>
                      <div className="class-code">{classItem.code}</div>
                    </div>
                    <div className={`status-indicator ${classItem.active ? 'active' : 'inactive'}`}>
                      {classItem.active ? 'LIVE' : 'OFFLINE'}
                    </div>
                  </div>
                  
                  <div className="monitor-preview">
                    <div className="preview-placeholder">
                      <div className="preview-overlay">
                        {classItem.active ? (
                          <>
                            <div className="live-indicator">
                              <span className="pulse"></span>
                              LIVE
                            </div>
                            <div className="engagement-meter">
                              <div className="meter-bar" style={{ width: '84%' }}>
                                <span>84% Engagement</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="offline-message">
                            <FaCog className="offline-icon" />
                            <p>Monitoring Paused</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-stats">
                    <div className="stat-item">
                      <span>Students</span>
                      <strong>{classItem.students}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Alerts</span>
                      <strong className="alert-count">{classItem.alerts}</strong>
                    </div>
                    <div className="stat-item">
                      <span>Status</span>
                      <strong className={classItem.active ? 'active' : 'inactive'}>
                        {classItem.active ? 'Active' : 'Paused'}
                      </strong>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className={`monitor-btn ${classItem.active ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToMonitoring(classItem);
                      }}
                    >
                      <FaEye /> Monitor
                    </button>
                    <button 
                      className="status-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActiveStatus(classItem.id);
                      }}
                    >
                      {classItem.active ? <FaCog /> : <FaPlay />}
                      {classItem.active ? 'Pause' : 'Resume'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InitialDashboard;