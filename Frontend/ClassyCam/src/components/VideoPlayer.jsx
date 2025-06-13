// src/components/VideoPlayer.jsx
import { FaVideoSlash } from 'react-icons/fa';

const VideoPlayer = ({ isStreaming }) => {
  return (
    <div className="video-player">
      {isStreaming ? (
        <div className="live-feed">
          <div className="camera-view"></div>
          <div className="live-badge">LIVE</div>
          <div className="video-controls">
            <button className="control-btn">
              <FaVideoSlash />
            </button>
          </div>
        </div>
      ) : (
        <div className="offline-message">
          <FaVideoSlash />
          <p>Stream is currently offline</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;