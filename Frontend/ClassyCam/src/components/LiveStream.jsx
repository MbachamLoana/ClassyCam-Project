import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const LiveStream = () => {
  const [rtspUrl, setRtspUrl] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const handleConnect = async () => {
    if (!rtspUrl) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Send RTSP URL to backend
      const response = await fetch('http://localhost:5000/set-rtsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rtspUrl })
      });
      
      if (!response.ok) throw new Error('Failed to connect to camera');
      
      setIsStreaming(true);
      
      // Start displaying the MJPEG stream
      if (videoRef.current) {
        videoRef.current.src = 'http://localhost:5000/video-stream';
      }
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="live-stream-container">
      <div className="stream-controls">
        <input
          type="text"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
          placeholder="rtsp://username:password@ip:port/stream"
          className="rtsp-input"
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConnect}
          disabled={isLoading || !rtspUrl}
          className="connect-btn"
        >
          {isLoading ? (
            <span>Connecting...</span>
          ) : isStreaming ? (
            <span>Streaming</span>
          ) : (
            <span>Connect to Video Stream</span>
          )}
        </motion.button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="video-container">
        {isStreaming ? (
          <img 
            ref={videoRef} 
            alt="Live Stream" 
            className="video-feed"
          />
        ) : (
          <div className="stream-placeholder">
            <div className="placeholder-content">
              <div className="camera-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                  <path d="M20 4h-3.17l-1.24-1.35A1.99 1.99 0 0 0 14.12 2H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                </svg>
              </div>
              <p>Enter RTSP URL and click "Connect to Video Stream"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStream;