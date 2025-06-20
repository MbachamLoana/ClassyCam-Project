// src/pages/MonitoringDashboard.jsx
import { useState, useEffect, useRef } from 'react'; // Import useRef for video stream img
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ImageStreamViewer from "../components/ImageStreamViewer"; // Keep this, it's good for displaying
import {
  FaVideo, FaVideoSlash, FaRecordVinyl, FaPlay, FaStop,
  FaBell, FaChartBar, FaUserGraduate, FaRunning, FaHistory,
  FaCog, FaRegClock, FaSignOutAlt, FaSearch, FaArrowLeft, 
  FaCircleNotch
} from 'react-icons/fa';
import { BsGraphUp, BsCameraVideoFill, BsActivity } from 'react-icons/bs';
import { IoMdAlert } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Logo from '../components/Logo';
// import { Loader2, XCircle } from "lucide-react"; // Import if you use lucide-react icons here

const MonitoringDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const classInfo = location.state?.classInfo || {
    id: 1,
    name: 'Mathematics 101',
    code: 'MATH101',
    students: 24
  };

  // --- STREAMING STATES (Refactored from Video.jsx) ---
  const videoFeedRef = useRef(null); // Ref for the actual <img> tag for the stream
  const [rtspInputUrl, setRtspInputUrl] = useState(''); // User's input for RTSP URL
  const [isConnected, setIsConnected] = useState(false); // Whether the backend stream is successfully started
  const [isLoading, setIsLoading] = useState(false); // For connecting/stopping loading state
  const [statusMessage, setStatusMessage] = useState({ text: 'Not Connected', type: 'info' }); // User feedback
  const BACKEND_BASE_URL = "http://localhost:8000"; // Ensure this matches your FastAPI port
  // --- END STREAMING STATES ---

  const [isRecording, setIsRecording] = useState(false); // For recording control

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

  // Function to update status message with type for dynamic styling
  const updateStatus = (text, type) => {
    setStatusMessage({ text, type });
  };

  // --- START: Corrected Streaming Logic (Connect/Stop) ---
  const handleConnectStream = async () => {
    const trimmedRtspUrl = rtspInputUrl.trim();
    if (!trimmedRtspUrl) {
      updateStatus("Please enter an RTSP URL or '0' for webcam.", 'error');
      return;
    }

    setIsLoading(true);
    updateStatus('Connecting to camera stream...', 'info');

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/start_stream`, { // Correct POST endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rtsp_url: trimmedRtspUrl }), // Send dynamic URL from input
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsConnected(true);
        updateStatus(data.message || 'Stream connected successfully!', 'success');
        // The ImageStreamViewer component will automatically update its src when isConnected is true
        // and its streamSrc is derived from BACKEND_BASE_URL + /video_feed
      } else {
        setIsConnected(false);
        updateStatus(data.message || 'Failed to connect to stream. Check backend logs.', 'error');
      }
    } catch (err) {
      console.error("Connection error:", err);
      setIsConnected(false);
      updateStatus(`Failed to connect to backend server: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = async () => { // Make async to call backend
    setIsLoading(true);
    updateStatus('Stopping stream...', 'info');

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/stop_stream`, { // Correct POST endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body as no data is needed for stopping
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsConnected(false);
        setIsRecording(false); // Stop recording when stream stops
        updateStatus(data.message || 'Stream stopped successfully!', 'success');
      } else {
        updateStatus(data.message || 'Failed to stop stream', 'error');
      }
    } catch (err) {
      console.error("Stop stream error:", err);
      updateStatus(`Failed to communicate with backend to stop stream: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  // --- END: Corrected Streaming Logic ---


  const toggleRecording = () => {
    if (isConnected) { // Can only record if a stream is active (use isConnected state)
      setIsRecording(!isRecording);
      // In a real application, you would send a command to your backend
      // to start/stop recording the proxied stream.
      if (!isRecording) {
        console.log('Recording started on backend (simulated)...');
      } else {
        console.log('Recording stopped on backend (simulated)...');
      }
    } else {
      console.warn('Cannot start recording: No active stream.');
      updateStatus('Please connect to a stream before recording.', 'error'); // Use updateStatus for user feedback
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

  // Styling classes for status messages (can be expanded with Tailwind)
  const getStatusClass = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border border-green-400';
      case 'error': return 'bg-red-100 text-red-800 border border-red-400';
      case 'info': return 'bg-blue-100 text-blue-800 border border-blue-400';
      default: return 'bg-gray-100 text-gray-800 border border-gray-400';
    }
  };


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
            className={`video-card ${isConnected ? 'active' : 'inactive'}`} // Use isConnected for active state
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-header">
              <h3><BsCameraVideoFill /> {classInfo.name} Live Feed</h3>
              <div className="card-actions">
                {/* RTSP Input Field and Connect/Stop Button */}
                <input
                  type="text"
                  placeholder="Enter RTSP URL (e.g., rtsp://IP:port/stream.sdp or 0 for webcam)"
                  value={rtspInputUrl}
                  onChange={(e) => setRtspInputUrl(e.target.value)}
                  className="rtsp-input"
                  disabled={isLoading || isConnected} // Disable input when connecting or connected
                  style={{ flexGrow: 1, marginRight: '10px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <motion.button
                  className={`control-btn ${isConnected ? 'streaming' : ''}`} // Use isConnected
                  onClick={isConnected ? handleStopStream : handleConnectStream} // Call correct handlers
                  disabled={!rtspInputUrl && !isConnected || isLoading} // Disable if no URL or loading
                  whileHover={{ scale: 1.05 }}
                >
                  {isLoading ? ( // Show loading spinner
                     <> { /* Removed lucide-react for common Fa/Bs icons */ }
                       <FaCircleNotch className="animate-spin mr-2" />
                       {isConnected ? 'Stopping...' : 'Connecting...'}
                     </>
                  ) : (
                    <>
                      {isConnected ? <FaVideoSlash /> : <FaVideo />}
                      {isConnected ? 'Stop Stream' : 'Connect Stream'}
                    </>
                  )}
                </motion.button>
                <motion.button
                  className={`control-btn ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  disabled={!isConnected} // Disable if not connected
                  whileHover={{ scale: 1.05 }}
                >
                  {isRecording ? <FaStop /> : <FaRecordVinyl />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </motion.button>
              </div>
            </div>
            {/* Display status messages */}
            {statusMessage.text && (
              <div className={`mt-2 p-2 rounded ${getStatusClass(statusMessage.type)}`}>
                {statusMessage.text}
              </div>
            )}
            
            {/* Use ImageStreamViewer to display the actual video feed */}
            {/* The streamSrc for ImageStreamViewer is always the backend's /video_feed endpoint */}
            <ImageStreamViewer 
                isStreaming={isConnected} // Pass true if connected, false otherwise
                streamSrc={`${BACKEND_BASE_URL}/video_feed`} // Always point to the actual video feed endpoint
            />
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