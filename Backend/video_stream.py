import cv2
import threading
import time
from typing import Optional, Callable, Any, List, Dict
import logging
import numpy as np
import os

from fastapi import FastAPI, Request, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware
from uvicorn import run as uvicorn_run

# --- Your existing VideoStream and ObjectDetector classes (copy them directly here) ---
# Ensure these are the exact classes you have working.

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Set environment variable for RTSP transport to TCP
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)


class ObjectDetector:
    def __init__(self, model_path: Optional[str] = None):
        logger.info(f"ObjectDetector initialized (model: {model_path or 'default'})")
        self.frame_counter = 0

    def detect_and_track(self, frame):
        """Placeholder detection logic"""
        h, w = frame.shape[:2]
        if h > 100 and w > 100:
            cv2.rectangle(frame, (50, 50), (w-50, h-50), (0, 255, 0), 2)
            cv2.putText(frame, "Object", (50, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        else:
            logger.debug("Frame too small for drawing detections.")
        self.frame_counter += 1
        return frame, [{"class": "object", "confidence": 0.9, "bbox": [50, 50, w-100, h-100]}]

    def get_performance_stats(self):
        return {"frames_processed": self.frame_counter}

class VideoStream:
    def __init__(self, model_path: Optional[str] = None):
        self.rtsp_url = None
        self.cap = None
        self.lock = threading.Lock()
        self.running = False
        self.detector = ObjectDetector(model_path=model_path)
        self.detection_callback: Optional[Callable[[Dict[str, Any]], None]] = None
        self.frame_counter = 0
        self.stream_thread: Optional[threading.Thread] = None # To manage the stream in a separate thread

    def register_callback(self, callback: Callable[[Dict[str, Any]], None]):
        self.detection_callback = callback
        logger.info("Detection callback registered.")

    def update_stream(self, stream_source: Any) -> bool:
        """Initialize or update the video stream source. Accepts int (webcam index) or str (RTSP URL)."""
        # Ensure we're not trying to update while a stream is already running
        if self.running:
            logger.warning("Stream is already running. Please stop it first before updating.")
            return False

        with self.lock:
            self._release_resources() # Always release existing resources first
            self.rtsp_url = stream_source # Store the source, could be int or str
            logger.info(f"Attempting to connect to stream: {stream_source}")

            backends_to_try = [cv2.CAP_FFMPEG, cv2.CAP_ANY] # Prioritize FFMPEG for RTSP

            self.cap = None
            for backend in backends_to_try:
                try:
                    logger.info(f"Trying to open stream with backend: {backend} ({self._get_backend_name(backend)})")
                    self.cap = cv2.VideoCapture(stream_source, backend)
                    
                    time.sleep(0.5) 
                    
                    if self.cap.isOpened():
                        ret, test_frame = self.cap.read()
                        if ret:
                            logger.info(f"Stream opened successfully with backend {self._get_backend_name(backend)}.")
                            self.running = True
                            return True
                        else:
                            logger.warning(f"Backend {self._get_backend_name(backend)} opened but failed to read first frame.")
                            self.cap.release()
                except Exception as e:
                    logger.error(f"Error trying backend {self._get_backend_name(backend)}: {e}")
                    if self.cap:
                        self.cap.release()

            logger.error(f"Failed to open stream: {stream_source} after trying all backends.")
            return False

    def _get_backend_name(self, backend_code: int) -> str:
        if backend_code == cv2.CAP_ANY: return "CAP_ANY (Default)"
        if backend_code == cv2.CAP_FFMPEG: return "CAP_FFMPEG"
        if backend_code == cv2.CAP_GSTREAMER: return "CAP_GSTREAMER"
        if backend_code == cv2.CAP_V4L2: return "CAP_V4L2 (Linux)"
        if backend_code == cv2.CAP_MSMF: return "CAP_MSMF (Windows)"
        if backend_code == cv2.CAP_AVFOUNDATION: return "CAP_AVFOUNDATION (macOS)"
        return f"Unknown Backend ({backend_code})"

    def generate_frames(self):
        """Generator function to yield processed video frames."""
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                logger.warning(f"Frame read failed for {self.rtsp_url}. Stream might have ended or lost connection.")
                self.running = False # Signal to stop
                break

            processed_frame, detections = self.detector.detect_and_track(frame)

            if self.detection_callback:
                self.detection_callback({
                    "objects": detections,
                    "timestamp": time.time(),
                    "frame_id": self.frame_counter
                })

            _, buffer = cv2.imencode('.jpg', processed_frame)
            self.frame_counter += 1
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.01)

        logger.info("Exiting generate_frames loop. Releasing resources.")
        self._release_resources()

    def _release_resources(self):
        """Internal method to release video capture resources."""
        if self.cap and self.cap.isOpened():
            self.cap.release()
            logger.info("VideoStream resources released.")
        self.cap = None
        self.running = False
        self.frame_counter = 0 # Reset frame counter on release

# --- FastAPI Application ---
app = FastAPI()

# IMPORTANT: Configure CORS for your React app
# Replace "http://localhost:5173" with the actual URL of your React development server
# For production, it should be your deployed frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust this to your React dev server port
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Global instance of VideoStream
global_video_stream = VideoStream()

@app.post("/start_stream")
async def start_stream(stream_type: str = Form(...), stream_value: Optional[str] = Form(None)):
    """Endpoint to start the video stream."""
    global global_video_stream

    # Stop any existing stream first
    if global_video_stream.running:
        global_video_stream._release_resources()
        time.sleep(0.5)

    source = None
    message = ""
    status = "error"

    if stream_type == "webcam":
        try:
            source = int(stream_value) if stream_value else 0
            logger.info(f"Attempting to start local webcam stream (index: {source})")
        except ValueError:
            logger.error(f"Invalid webcam index: {stream_value}. Using default 0.")
            source = 0
    elif stream_type == "ip_webcam":
        source = stream_value
        if not source:
            message = "Error: IP Webcam URL not provided."
            logger.error(message)
            return JSONResponse(content={"status": status, "message": message}, status_code=400)
        logger.info(f"Attempting to start IP webcam stream (URL: {source})")
    else:
        message = f"Error: Unknown stream type '{stream_type}'."
        logger.error(message)
        return JSONResponse(content={"status": status, "message": message}, status_code=400)

    if global_video_stream.update_stream(source):
        message = f"Stream connected: {source}"
        status = "success"
        logger.info(message)
        return JSONResponse(content={"status": status, "message": message, "stream_url": "/video_feed"})
    else:
        message = f"Failed to connect to stream: {source}"
        logger.error(message)
        return JSONResponse(content={"status": status, "message": message}, status_code=500)

@app.get("/video_feed")
async def video_feed():
    """Endpoint that serves the video stream as multipart/x-mixed-replace."""
    if not global_video_stream.running:
        logger.warning("Attempted to access video_feed but no stream is running.")
        # Return a blank image
        blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        _, buffer = cv2.imencode('.jpg', blank_frame)
        return StreamingResponse(
            (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n'),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )
    
    return StreamingResponse(global_video_stream.generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.post("/stop_stream")
async def stop_stream():
    """Endpoint to stop the video stream."""
    global global_video_stream
    message = ""
    status = "info"

    if global_video_stream.running:
        global_video_stream._release_resources()
        message = "Stream stopped successfully."
        logger.info(message)
        status = "success"
    else:
        message = "No active stream to stop."
        logger.info(message)
        status = "info"
    
    return JSONResponse(content={"status": status, "message": message})

# Callback for detection events (example - could be extended with WebSockets)
def my_detection_callback(data):
    # This would typically send data back to the frontend via WebSockets or another API
    # For now, just logging:
    logger.debug(f"Callback - Detected: {len(data['objects'])} objects at frame {data['frame_id']}")

global_video_stream.register_callback(my_detection_callback)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    uvicorn_run(app, host="0.0.0.0", port=8000)