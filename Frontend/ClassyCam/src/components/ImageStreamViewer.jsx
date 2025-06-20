// src/components/ImageStreamViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaVideoSlash, FaCircleNotch } from 'react-icons/fa'; // Added FaCircleNotch for loading spinner

const ImageStreamViewer = ({ isStreaming, streamSrc }) => { // streamSrc will now always be "/video_feed"
  const [imageLoaded, setImageLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [backendAlive, setBackendAlive] = useState(false);
  const [streamConnecting, setStreamConnecting] = useState(false); 
  const MAX_ERROR_COUNT = 5; 
  const HEARTBEAT_INTERVAL = 3000; 
  const heartbeatTimerRef = useRef(null); 
  const imageRef = useRef(null); // Ref for the actual <img> tag

  useEffect(() => {
    // Reset status states when streaming intent changes
    setImageLoaded(false);
    setErrorCount(0);
    setBackendAlive(false); // Assume backend might not be alive until heartbeat confirms
    setStreamConnecting(false); 

    // Clear previous heartbeat interval
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    // If streaming is intended, start connecting and checking backend
    if (isStreaming) {
      setStreamConnecting(true); // Indicate we're actively trying to get the stream
      checkBackendHeartbeat(); // Check immediately
      heartbeatTimerRef.current = setInterval(checkBackendHeartbeat, HEARTBEAT_INTERVAL);
    } else {
        // When stopping, clear the image src to stop requests
        if (imageRef.current) {
            imageRef.current.src = "";
        }
    }

    // Cleanup function: Clear the heartbeat interval when the component unmounts or streaming stops
    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [isStreaming]); // Depend only on isStreaming, streamSrc is now constant

  // Use a separate effect to update the image src when streamSrc changes (which it now won't during a session)
  // or when isStreaming becomes true to kick off the image loading
  useEffect(() => {
    if (isStreaming && imageRef.current) {
        imageRef.current.src = streamSrc;
    }
  }, [isStreaming, streamSrc]);


  // Function to ping the backend heartbeat endpoint
  const checkBackendHeartbeat = async () => {
    try {
      const response = await fetch('http://localhost:8000/heartbeat'); // Ensure this URL matches
      if (response.ok) {
        const data = await response.json();
        setBackendAlive(data.stream_active); // Use stream_active from backend heartbeat
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
    if (streamConnecting) { // Only log "initial loaded" once
      console.log("MJPEG stream initially loaded and active in frontend.");
    }
    setImageLoaded(true);
    setStreamConnecting(false); // If image loaded, we're past the "connecting" phase
    setErrorCount(0); // Reset error count on any successful frame load
  };

  // Handler for image frame load errors
  const handleImageError = () => {
    console.error("Error loading image stream frame. (This might indicate stream issues or network problems).");
    setErrorCount(prev => prev + 1); // Increment consecutive error count
    setImageLoaded(false); // Assume the image is no longer loading successfully

    if (errorCount + 1 >= MAX_ERROR_COUNT) {
      console.error("MJPEG stream appears to be disconnected or broken after multiple errors.");
      // You might want to signal the parent component (MonitoringDashboard) here
      // if the stream fundamentally dies. For now, rely on `isStreaming` from parent.
    }
  };

  // Determine what content to show based on stream status
  const showPlaceholder = !isStreaming || !backendAlive || errorCount >= MAX_ERROR_COUNT;

  return (
    <div className="image-stream-viewer-container w-full h-full bg-gray-900 flex items-center justify-center rounded-lg relative overflow-hidden">
      {showPlaceholder ? (
        <div className="stream-placeholder flex flex-col items-center justify-center text-gray-400 p-4 text-center">
          <FaVideoSlash className="text-gray-500 text-6xl mb-4" />
          {isStreaming && streamConnecting && backendAlive ? (
            // State: isStreaming is true, we're trying to connect, backend is alive, but no image yet
            <>
              <FaCircleNotch className="animate-spin text-indigo-500 text-4xl mb-2" />
              <p className="text-indigo-500 text-lg font-semibold">Connecting to stream...</p>
              <p className="text-indigo-500 text-sm mt-1">(Ensure RTSP URL is correct and camera is running)</p>
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
          ref={imageRef} // Assign the ref to the img element
          src={streamSrc} // This will be `http://localhost:8000/video_feed`
          alt="Live Camera Feed"
          className="w-full h-full object-contain bg-black"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default ImageStreamViewer;