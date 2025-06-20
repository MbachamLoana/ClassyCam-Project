import React, { useState, useEffect } from "react";
import { Camera, SatelliteDish, PlaySquare, VideoOff, Loader2 } from "lucide-react";
import "./Video.css";

const Video = () => {
  const [rtspUrl, setRtspUrl] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [error, setError] = useState(null);
  const [videoSrc, setVideoSrc] = useState("");

  const handleConnect = async () => {
    if (!rtspUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Start the stream
      const response = await fetch(
        `http://localhost:8000/api/v1/stream/start?rtsp_url=${encodeURIComponent(rtspUrl)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      const clientId = response.headers.get('X-Client-ID');
      setClientId(clientId);
      setIsStreaming(true);
      setVideoSrc(`http://localhost:8000/api/v1/stream/start?rtsp_url=${encodeURIComponent(rtspUrl)}&client_id=${clientId}`);
    } catch (err) {
      setIsStreaming(false);
      setError(err.message || 'Failed to connect to stream');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!clientId) return;
    
    try {
      await fetch(`http://localhost:8000/api/v1/stream/stop?client_id=${clientId}`);
    } catch (err) {
      console.error('Error stopping stream:', err);
    } finally {
      setIsStreaming(false);
      setClientId(null);
      setVideoSrc("");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (clientId) {
        handleDisconnect();
      }
    };
  }, [clientId]);

  return (
    <div className="video-container">
      <div className="video-header">
        <Camera size={28} className="header-icon" />
        <div>Exam Monitoring Setup</div>
      </div>

      <div className="connection-card">
        <div className="connection-controls">
          <div className="group">
            <div className="input-label">
              <SatelliteDish size={20} className="label-icon" /> 
              <span>RTSP Camera Link</span>
            </div>
            <div className="input-wrapper">
              <input
                className="rtsp-input"
                type="text"
                placeholder="e.g., rtsp://yourcamera.stream/live"
                value={rtspUrl}
                onChange={(e) => setRtspUrl(e.target.value)}
              />
              <button 
                className="connect-button"
                onClick={isStreaming ? handleDisconnect : handleConnect}
                disabled={!rtspUrl || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    {isStreaming ? "Disconnecting..." : "Connecting..."}
                  </>
                ) : (
                  <>
                    <PlaySquare size={18} />
                    {isStreaming ? "Disconnect Stream" : "Connect Stream"}
                  </>
                )}
              </button>   
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {isStreaming ? (
          <div className="video-preview">
            <img 
              src={videoSrc}
              alt="Live Stream" 
              onError={(e) => {
                setIsStreaming(false);
                setError('Stream connection lost');
              }}
            />
          </div>
        ) : (
          <div className="no-surveillance">
            <VideoOff size={48} className="no-surveillance-icon" />
            <p>No surveillance feed yet</p>
            <p className="no-surveillance-subtext">
              Connect to an RTSP stream to begin monitoring
            </p>
          </div>
        )}

        <div className="connection-tips">
          <h4>Connection Tips:</h4>
          <ul>
            <li>Ensure your camera supports RTSP protocol</li>
            <li>Test the stream in VLC before connecting</li>
            <li>Make sure the backend service is running</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Video;