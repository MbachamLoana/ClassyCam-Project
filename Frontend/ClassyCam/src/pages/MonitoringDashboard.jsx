// src/pages/MonitoringDashboard.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import { 
  FaVideo, FaVideoSlash, FaRecordVinyl, FaPlay, FaStop,
  FaBell, FaChartBar, FaUserGraduate, FaRunning, FaHistory,
  FaCog, FaRegClock, FaSignOutAlt, FaSearch, FaArrowLeft
} from 'react-icons/fa';
import { BsGraphUp, BsCameraVideoFill, BsActivity } from 'react-icons/bs';
import { IoMdAlert } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Logo from '../components/Logo';
import { useParams } from 'react-router-dom';


const MonitoringDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const classInfo = location.state?.classInfo || { 
    id: 1, 
    name: 'Mathematics 101', 
    code: 'MATH101', 
    students: 24 
  };

  const fullClassInfo = {
    students: 0,
    alerts: 0,
    ...classInfo
  };
  
  
  const [isStreaming, setIsStreaming] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [alerts] = useState([
    { id: 1, type: 'movement', message: 'Unusual movement detected in back row', time: '2 mins ago', severity: 'medium' },
    { id: 2, type: 'behavior', message: 'Potential distraction detected', time: '5 mins ago', severity: 'low' },
    { id: 3, type: 'alert', message: 'Student raised hand for question', time: '8 mins ago', severity: 'info' }
  ]);
  
  const [behaviorStats, setBehaviorStats] = useState({
    attentive: 82,
    distracted: 12,
    active: 6
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (isRecording && !isStreaming) {
      setTimeout(() => setIsRecording(false), 300);
    }
  };

  const toggleRecording = () => {
    if (isStreaming) {
      setIsRecording(!isRecording);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBehaviorStats(prev => ({
        attentive: Math.max(70, Math.min(95, prev.attentive + (Math.random() * 4 - 2))),
        distracted: Math.max(5, Math.min(20, prev.distracted + (Math.random() * 2 - 1))),
        active: Math.max(0, Math.min(10, prev.active + (Math.random() * 2 - 1)))
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      
      <Sidebar />
      
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <Logo size="medium" />
            <div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-indigo-600 mb-1"
              >
                <FaArrowLeft className="mr-2" /> Back to Classes
              </button>
              <h1 className="text-xl font-bold">
                Monitoring: <span className="text-indigo-600">{classInfo.name}</span>
              </h1>
            </div>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search students..." 
                autoComplete="off"
              />
            </div>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              <FaBell />
              <span className="badge">3</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          <motion.div 
            className={`video-card ${isStreaming ? 'active' : 'inactive'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-header">
              <h3><BsCameraVideoFill /> {classInfo.name} Live Feed</h3>
              <div className="card-actions">
                <motion.button
                  className={`control-btn ${isStreaming ? 'streaming' : ''}`}
                  onClick={toggleStreaming}
                  whileHover={{ scale: 1.05 }}
                >
                  {isStreaming ? <FaVideoSlash /> : <FaVideo />}
                  {isStreaming ? 'Stop Stream' : 'Start Stream'}
                </motion.button>
                <motion.button
                  className={`control-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  disabled={!isStreaming}
                  whileHover={{ scale: 1.05 }}
                >
                  {isRecording ? <FaStop /> : <FaRecordVinyl />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </motion.button>
              </div>
            </div>
            <VideoPlayer isStreaming={isStreaming} />
          </motion.div>

          <motion.div 
            className="analytics-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card-header">
              <h3><BsActivity /> Behavior Analytics</h3>
              <div className="time-filter">
                <FaRegClock />
                <select>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>
            <div className="behavior-metrics">
              {[
                { label: 'Attentive', value: behaviorStats.attentive, icon: <FaUserGraduate />, color: '#4ade80' },
                { label: 'Distracted', value: behaviorStats.distracted, icon: <FaChartBar />, color: '#fbbf24' },
                { label: 'Active', value: behaviorStats.active, icon: <FaRunning />, color: '#60a5fa' }
              ].map((metric, index) => (
                <div key={index} className="metric">
                  <div className="metric-label">
                    {metric.icon}
                    <span>{metric.label}</span>
                  </div>
                  <div className="metric-value">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={metric.value}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {Math.round(metric.value)}%
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="metric-bar">
                    <motion.div 
                      className="bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, type: 'spring' }}
                      style={{ backgroundColor: metric.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="alerts-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="card-header">
              <h3><IoMdAlert /> Recent Alerts</h3>
              <span className="badge">{alerts.length} new</span>
            </div>
            <div className="alerts-list">
              <AnimatePresence>
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    className={`alert-item ${alert.severity}`}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="alert-icon">
                      {alert.type === 'movement' ? <FaRunning /> : 
                       alert.type === 'behavior' ? <FaUserGraduate /> : 
                       <IoMdAlert />}
                    </div>
                    <div className="alert-content">
                      <p className="alert-message">{alert.message}</p>
                      <span className="alert-time">{alert.time}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            className="recordings-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="card-header">
              <h3><FaHistory /> Recent Recordings</h3>
              <button className="view-all">View All</button>
            </div>
            <div className="recordings-list">
              {[1, 2, 3].map((item) => (
                <motion.div 
                  className="recording-item"
                  key={item}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="recording-thumbnail">
                    <FaPlay />
                  </div>
                  <div className="recording-details">
                    <h4>Recording {item}</h4>
                    <p>Today at {['10:30', '11:45', '14:20'][item-1]} AM</p>
                    <span className="duration">24 mins</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;