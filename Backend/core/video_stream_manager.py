import cv2
import threading
import time
import logging
import numpy as np

logger = logging.getLogger(__name__)

# To ensure only one stream runs at a time globally
# This is a simple global lock; for more complex apps, use dependency injection
stream_lock = threading.Lock()
_current_video_stream_instance = None # To hold the singleton instance

class VideoStreamManager:
    def __init__(self):
        self.cap = None
        self.rtsp_url = None # To store current source
        self._running = False
        self._generator_active = False # Flag to indicate if generate_frames loop is running
        self.frame_counter = 0
        self.detector = None # Will be set later, or pass in constructor

    # Method to set the detector after instantiation if needed
    def set_detector(self, detector_instance):
        self.detector = detector_instance

    def start_stream(self, stream_source: str):
        """Attempts to open a video stream."""
        with stream_lock: # Ensure only one stream operation happens at a time
            if self._running:
                logger.warning("Stream is already running. Please stop it first.")
                return False

            self._release_resources() # Release any lingering resources

            self.rtsp_url = stream_source
            logger.info(f"Attempting to connect to stream: {stream_source}")

            # Try common backends, preferring FFMPEG for RTSP
            backends_to_try = [cv2.CAP_FFMPEG, cv2.CAP_ANY] 
            
            self.cap = None
            for backend in backends_to_try:
                try:
                    logger.info(f"Trying to open stream with backend: {backend}")
                    # Convert to int if it's a webcam index, otherwise keep as string
                    source_for_cv = int(stream_source) if stream_source.isdigit() else stream_source
                    self.cap = cv2.VideoCapture(source_for_cv, backend)
                    
                    # Give it a moment to establish connection
                    time.sleep(0.5) 
                    
                    if self.cap.isOpened():
                        ret, test_frame = self.cap.read()
                        if ret:
                            self._running = True
                            logger.info(f"Stream opened successfully with backend {backend}.")
                            return True
                        else:
                            logger.warning(f"Backend {backend} opened but failed to read first frame.")
                            self.cap.release() # Release if first frame fails
                except Exception as e:
                    logger.error(f"Error trying backend {backend} with source {stream_source}: {e}")
                    if self.cap:
                        self.cap.release()

            logger.error(f"Failed to open stream: {stream_source} after trying all backends.")
            return False

    def stop_stream(self):
        """Signals the stream to stop and releases resources."""
        with stream_lock:
            if self._running:
                self._running = False # Signal the generator loop to exit
                logger.info("Signaled stream to stop. Waiting for generator to finish...")
                # Give the generator a moment to truly stop and release cap
                time.sleep(1) # Adjust based on how quickly your loop exits
                self._release_resources()
                logger.info("Stream stopped and resources released.")
                return True
            else:
                logger.info("No active stream to stop.")
                return False

    def _release_resources(self):
        """Internal method to release video capture resources."""
        if self.cap and self.cap.isOpened():
            self.cap.release()
            logger.info("VideoCapture resources released.")
        self.cap = None
        self._running = False
        self._generator_active = False # Reset this flag
        self.frame_counter = 0

    def is_running(self):
        """Check if the stream is currently active."""
        return self._running and self.cap and self.cap.isOpened()

    async def generate_frames(self):
        """Generator function to yield processed video frames."""
        if not self.is_running():
            logger.warning("Attempted to generate frames but stream is not open or running.")
            # Return a blank frame if no stream is active, or stop the loop immediately
            blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            _, buffer = cv2.imencode('.jpg', blank_frame)
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            return

        # Ensure only one generator loop is active per VideoStreamManager instance
        # This prevents multiple /video_feed requests from trying to read from the same cap simultaneously
        if self._generator_active:
            logger.warning("Another generator is already active. Only one video feed client supported per stream.")
            return # Prevent multiple generators from running concurrently on the same manager

        self._generator_active = True
        logger.info(f"Starting frame generation loop for {self.rtsp_url}")

        try:
            while self._running and self.cap.isOpened():
                ret, frame = self.cap.read()
                if not ret:
                    logger.warning(f"Frame read failed for {self.rtsp_url}. Stream might have ended or lost connection.")
                    self._running = False # Signal to stop
                    break
                    
                # Process frame with object detector (ensure detector is set)
                if self.detector:
                    processed_frame = self.detector.detect_objects(frame)
                else:
                    processed_frame = frame # If no detector, just use original frame
                
                _, buffer = cv2.imencode('.jpg', processed_frame)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                      b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                self.frame_counter += 1
                await asyncio.sleep(0.01) # Use asyncio.sleep for non-blocking delay

        except Exception as e:
            logger.error(f"Error during frame generation: {e}")
        finally:
            logger.info("Frame generation loop exiting.")
            self._generator_active = False # Mark generator as inactive
            # Do NOT release cap here, as stop_stream handles it globally.
            # Only release if self._running is False and this is the last client.
            # For simplicity, stick to central control via stop_stream.

# Helper to get the singleton instance
def get_video_stream_manager():
    global _current_video_stream_instance
    if _current_video_stream_instance is None:
        _current_video_stream_instance = VideoStreamManager()
        # Ensure detector is set if needed
        from core.object_detector import ObjectDetector # Import locally to avoid circular deps if ObjectDetector also imports this
        _current_video_stream_instance.set_detector(ObjectDetector())
    return _current_video_stream_instance

# Add asyncio import for sleep
import asyncio