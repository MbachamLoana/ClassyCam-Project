import React, { useState } from "react";
import { Camera, SatelliteDish, PlaySquare, Info, VideoOff, Loader2, ScanEye } from "lucide-react";
import "./Video.css";

const Video = () => {
  const [rtspUrl, setRtspUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/set_rtsp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rtsp_url: rtspUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setError(data.message || 'Failed to connect to stream');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!rtspUrl) return;
    
    setAnalysisLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/start_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rtsp_url: rtspUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAnalyzing(true);
        setError(null);
      } else {
        setIsAnalyzing(false);
        setError(data.message || 'Failed to start analysis');
      }
    } catch (err) {
      setIsAnalyzing(false);
      setError('Failed to start analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

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
                onClick={handleConnect}
                disabled={!rtspUrl || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <PlaySquare size={18} />
                    Connect Stream
                  </>
                )}
              </button>   
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* {isConnected && (
          <div className="analysis-controls">
            <button
              className={analysis-button ${isAnalyzing ? 'active' : ''}}
              onClick={handleStartAnalysis}
              disabled={!isConnected || analysisLoading || isAnalyzing}
            >
              {analysisLoading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Starting...
                </>
              ) : (
                <>
                  <ScanEye size={18} />
                  {isAnalyzing ? 'Analysis Running' : 'Start Analysis'}
                </>
              )}
            </button>
            {isAnalyzing && (
              <div className="analysis-note">
                Analysis window opened - check your desktop for the OpenCV window
              </div>
            )}
          </div>
        )} */}

        {isConnected ? (
          <div className="video-preview">
            <img 
              src="http://localhost:5000/video_feed" 
              alt="Live Stream" 
              onError={(e) => {
                setIsConnected(false);
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