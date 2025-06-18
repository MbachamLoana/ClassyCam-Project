// src/components/ImageStreamViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaVideoSlash, FaCircleNotch } from 'react-icons/fa'; // Added FaCircleNotch for loading spinner

const ImageStreamViewer = ({ isStreaming, streamSrc }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [backendAlive, setBackendAlive] = useState(false); // State for backend liveness
  const [streamConnecting, setStreamConnecting] = useState(false); // To show a loading state
  const MAX_ERROR_COUNT = 5; // How many consecutive image load errors before considering stream dead
  const HEARTBEAT_INTERVAL = 3000; // Check backend every 3 seconds
  const heartbeatTimerRef = useRef(null); // Ref to store the interval ID for heartbeat

  useEffect(() => {
    // Reset status states when streaming intent or source changes
    setImageLoaded(false);
    setErrorCount(0);
    setBackendAlive(false);
    setStreamConnecting(false); // Reset connecting state

    // Manage the backend heartbeat interval
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    if (isStreaming && streamSrc) {
      setStreamConnecting(true); // Indicate that we're actively trying to connect

      // Start periodically checking the backend's heartbeat
      heartbeatTimerRef.current = setInterval(checkBackendHeartbeat, HEARTBEAT_INTERVAL);
    }

    // Cleanup function: Clear the heartbeat interval when the component unmounts
    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [isStreaming, streamSrc]); // Re-run effect if these props change

  // Function to ping the backend heartbeat endpoint
  const checkBackendHeartbeat = async () => {
    try {
      // Ensure this URL matches your FastAPI backend's heartbeat endpoint
      const response = await fetch('http://localhost:8000/heartbeat');
      if (response.ok) {
        setBackendAlive(true);
      } else {
        setBackendAlive(false);
        console.error("Backend heartbeat failed with status:", response.status);
      }
    } catch (err) {
      setBackendAlive(false);
      console.error("Could not reach backend heartbeat endpoint:", err);
    }
  };

  // Handler for successful image frame load
  const handleImageLoad = () => {
    if (!imageLoaded) {
      setImageLoaded(true); // Mark that the first frame has successfully loaded
      setStreamConnecting(false); // If it loaded, we're no longer just "connecting"
      console.log("MJPEG stream initially loaded and active in frontend.");
    }
    setErrorCount(0); // Reset error count on any successful frame load (important for ongoing stream health)
  };

  // Handler for image frame load errors
  const handleImageError = () => {
    console.error("Error loading image stream frame. (This might indicate stream issues or network problems).");
    setErrorCount(prev => prev + 1); // Increment consecutive error count
    setImageLoaded(false); // Assume the image is no longer loading successfully

    // If too many consecutive errors, consider the stream disconnected
    if (errorCount + 1 >= MAX_ERROR_COUNT) { // +1 because state update is async
      console.error("MJPEG stream appears to be disconnected or broken after multiple errors.");
      // At this point, you could optionally trigger a full disconnection
      // in the parent component via a callback prop (e.g., props.onStreamDisconnected())
    }
  };

  // Determine what content to show based on stream status
  const showPlaceholder = !isStreaming || !streamSrc || !backendAlive || errorCount >= MAX_ERROR_COUNT;

  return (
    <div className="image-stream-viewer-container w-full h-full bg-gray-900 flex items-center justify-center rounded-lg relative overflow-hidden">
      {showPlaceholder ? (
        <div className="stream-placeholder flex flex-col items-center justify-center text-gray-400 p-4 text-center">
          <FaVideoSlash className="text-gray-500 text-6xl mb-4" />
          {streamConnecting && !imageLoaded && backendAlive ? (
            // State: Trying to connect, backend is alive, but no image loaded yet
            <>
              <FaCircleNotch className="animate-spin text-indigo-500 text-4xl mb-2" />
              <p className="text-indigo-500 text-lg font-semibold">Connecting to stream...</p>
              <p className="text-indigo-500 text-sm mt-1">(Ensure RTSP URL is correct and IP Webcam is running)</p>
            </>
          ) : isStreaming && !backendAlive ? (
            // State: Streaming intent active, but backend not reachable
            <p className="text-red-500 text-lg font-semibold">Backend connection lost or stream unavailable.</p>
          ) : isStreaming && errorCount >= MAX_ERROR_COUNT ? (
            // State: Streaming intent active, but too many image errors
            <p className="text-red-500 text-lg font-semibold">Stream disconnected due to repeated errors.</p>
          ) : (
            // Default state: Not actively streaming
            <>
              <p className="text-gray-500 text-lg">Stream is currently inactive.</p>
              <p className="text-gray-500 text-sm mt-1">Enter an RTSP URL and click 'Connect Stream'.</p>
            </>
          )}
        </div>
      ) : (
        // Render the image tag when actively streaming and no major errors
        <img
          src={streamSrc}
          alt="Live Camera Feed"
          className="w-full h-full object-contain bg-black" // Added bg-black for better contrast
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default ImageStreamViewer;