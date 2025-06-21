# src/core/video_stream_manager.py
import cv2
import threading
import time
import logging
from core.object_detector import get_object_detector # New import
from core.person_tracker import PersonTracker # New import for tracking
import numpy as np
import asyncio # Keep for the async generator, but use time.sleep for the grabber thread
from core.person_tracker import PersonTracker # New import

logger = logging.getLogger(__name__)

# To ensure only one stream runs at a time globally (for the entire application)
stream_lock = threading.Lock()
_current_video_stream_instance = None # To hold the singleton instance

class VideoStreamManager:
    _instance = None
    _lock = threading.Lock() # Lock for the singleton instance creation itself

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(VideoStreamManager, cls).__new__(cls)
                    cls._instance._initialized = False # Flag to ensure _initialize runs only once
        return cls._instance

    # Primary initialization method for the singleton instance
    def _initialize(self):
        if self._initialized:
            return

        self._cap = None  # OpenCV VideoCapture object
        self._running = False # Flag to control frame grabbing thread
        self._frame_lock = threading.Lock() # Lock for safely accessing _current_frame
        self._current_frame = None # Stores the latest processed frame
        self._frame_grabber_thread = None # Thread that grabs frames
        self._detected_objects_info = [] # Store detection results from ObjectDetector
        self._tracked_persons_data = {} # Store tracking results from PersonTracker

        # For zone monitoring
        self._prev_person_centroids = {} # To store centroids from the previous frame for tracking movement
        self._person_in_room_status = {} # {person_id: True/False} status for zone logic

        # Initialize ObjectDetector
        # IMPORTANT: Use your specific model_path here if you placed it locally, e.g., 'models/yolov8.pt'
        # If 'yolov8n.pt' is not in 'models/' folder, this will try to download it.
        self._object_detector = get_object_detector(model_path='models/yolov8n.pt')
        
        # Initialize PersonTracker
        self._person_tracker = PersonTracker(max_disappeared=50) # Adjust max_disappeared as needed

        logger.info("VideoStreamManager initialized.")
        self._initialized = True

    # The __init__ method for singletons should typically just call _initialize if not already
    def __init__(self):
        if not hasattr(self, '_initialized') or not self._initialized:
            self._initialize()

    def start_stream(self, stream_source: str):
        """Attempts to open a video stream."""
        with stream_lock: # Ensure only one stream operation happens at a time globally
            if self._running:
                logger.warning("Stream is already running. Please stop it first.")
                return False

            self._release_resources() # Release any lingering resources before starting a new one

            logger.info(f"Attempting to connect to stream: {stream_source}")

            # Try common backends, preferring FFMPEG for RTSP
            # We already tried CAP_PROP_OPEN_TIMEOUT_MSEC in previous iterations, keep it here.
            backends_to_try = [cv2.CAP_FFMPEG, cv2.CAP_ANY] 
            
            self._cap = None # Ensure we work with _cap consistently
            for backend in backends_to_try:
                try:
                    logger.info(f"Trying to open stream with backend: {backend}")
                    # Convert to int if it's a webcam index, otherwise keep as string
                    source_for_cv = int(stream_source) if stream_source.isdigit() else stream_source
                    self._cap = cv2.VideoCapture(source_for_cv, backend)
                    
                    # Set properties for network streams, these should be set before checking isOpened
                    # Set a longer timeout for opening the stream (e.g., 5 seconds)
                    self._cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 5000) 
                    self._cap.set(cv2.CAP_PROP_BUFFERSIZE, 1) # Reduce buffer for real-time

                    # Give it a moment to establish connection if it's a network stream
                    # Although CAP_PROP_OPEN_TIMEOUT_MSEC should handle this, a small sleep might help
                    time.sleep(0.5) 
                    
                    if self._cap.isOpened():
                        # Try to read the first frame to confirm it's truly open and receiving data
                        ret, test_frame = self._cap.read()
                        if ret:
                            self._running = True
                            # Start the frame grabbing thread
                            self._frame_grabber_thread = threading.Thread(target=self._grab_frames, daemon=True)
                            self._frame_grabber_thread.start()
                            logger.info(f"Stream opened successfully with backend {backend} and frame grabber started.")
                            return True
                        else:
                            logger.warning(f"Backend {backend} opened but failed to read first frame from {stream_source}.")
                            self._cap.release() # Release if first frame fails
                    else:
                        logger.warning(f"Backend {backend} failed to open stream for {stream_source}.")

                except Exception as e:
                    logger.error(f"Error trying backend {backend} with source {stream_source}: {e}")
                    if self._cap:
                        self._cap.release()
                    self._cap = None # Reset _cap on error
                    
            logger.error(f"Failed to open stream: {stream_source} after trying all backends.")
            return False

    def stop_stream(self):
        """Signals the stream to stop and releases resources."""
        with stream_lock: # Ensure only one stream operation happens at a time globally
            if self._running:
                self._running = False # Signal the frame grabbing loop to exit
                logger.info("Signaled stream to stop. Waiting for frame grabber to finish...")
                if self._frame_grabber_thread and self._frame_grabber_thread.is_alive():
                    self._frame_grabber_thread.join(timeout=5) # Wait for thread to finish
                    if self._frame_grabber_thread.is_alive():
                        logger.warning("Frame grabber thread did not terminate gracefully.")
                self._release_resources()
                logger.info("Stream stopped and resources released.")
                return True
            else:
                logger.info("No active stream to stop.")
                return False

    def _release_resources(self):
        """Internal method to release video capture resources."""
        if self._cap and self._cap.isOpened():
            self._cap.release()
            logger.info("VideoCapture resources released.")
        self._cap = None
        self._running = False
        self._current_frame = None # Clear the last frame
        self._detected_objects_info = [] # Clear detections
        self._tracked_persons_data = {} # Clear tracked data
        self._prev_person_centroids = {} # Clear zone tracking data
        self._person_in_room_status = {} # Clear zone status

    def _grab_frames(self):
        """Thread target: grabs frames, performs detection/tracking, and updates _current_frame."""
        logger.info("Frame grabbing thread started.")
        time.sleep(0.1) # Small delay to ensure stream is fully ready
        while self._running and self._cap and self._cap.isOpened():
            ret, frame = self._cap.read()
            if not ret:
                logger.warning("Failed to grab frame. Stream might be disconnected or ended. Attempting to re-read...")
                time.sleep(0.05) # Small delay before retrying
                continue

            # Perform object detection
            annotated_frame = frame.copy() # Start with a copy to draw on
            detected_objects = []

            if self._object_detector.model is not None:
                # The detect method in ObjectDetector already draws on the frame and returns it
                annotated_frame, detected_objects = self._object_detector.detect(frame)
            
            # Filter for persons and update tracker
            person_detections = [obj for obj in detected_objects if obj['class'] == 'person']
            self._tracked_persons_data = self._person_tracker.update(person_detections)

            # Draw tracked IDs and centroids on the frame
            for object_id, p_data in self._tracked_persons_data.items():
                x1, y1, x2, y2 = p_data['bbox']
                cX, cY = p_data['centroid']
                # Draw ID near the centroid
                cv2.putText(annotated_frame, f"ID: {object_id}", (cX - 20, cY - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 255), 2) # Magenta color
                cv2.circle(annotated_frame, (cX, cY), 4, (0, 0, 255), -1) # Red dot for centroid

            # Check for zone-based events and draw zones
            frame_height, frame_width = frame.shape[:2] # Use original frame dimensions for zones
            current_events, doorway_line, classroom_zone = self._check_zones_and_events(frame_width, frame_height)

            # Draw the doorway line
            cv2.line(annotated_frame, doorway_line[0], doorway_line[1], (255, 0, 0), 2) # Blue line
            cv2.putText(annotated_frame, "Doorway", (doorway_line[0][0] + 10, doorway_line[0][1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

            # Draw the classroom zone rectangle
            cv2.rectangle(annotated_frame, (classroom_zone[0], classroom_zone[1]),
                          (classroom_zone[2], classroom_zone[3]), (0, 255, 255), 2) # Yellow rectangle
            cv2.putText(annotated_frame, "Classroom Zone", (classroom_zone[0] + 10, classroom_zone[1] + 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

            # For now, print events to console. Later we'll send to frontend/log file.
            if current_events:
                for event in current_events:
                    logger.info(f"Event detected: {event}")

            with self._frame_lock:
                self._current_frame = annotated_frame # Store the annotated frame
                self._detected_objects_info = detected_objects # Store detection results
                # You might also want to store current_events if the frontend needs them specifically
            time.sleep(0.03) # Adjust based on desired FPS (e.g., 0.03 for ~30 FPS)
        logger.info("Frame grabbing thread stopped.")
        # The _release_resources is handled by stop_stream or if the loop exits naturally due to _cap failure
        # Do not call _cap.release() directly here as it can lead to race conditions if stop_stream is also called.

    def _check_zones_and_events(self, frame_width, frame_height):
        """
        Defines zones and checks for entry/exit events.
        (This is a placeholder; you'd define actual coordinates based on your classroom view)
        """
        # Example Zone 1: A "doorway" line
        # This is just a horizontal line for simplicity. Adjust coordinates based on your camera view.
        doorway_y = int(frame_height * 0.75) # 75% down the frame
        doorway_line = [(0, doorway_y), (frame_width, doorway_y)]

        # Example Zone 2: A "classroom" bounding box
        # A rectangular area representing the main classroom space
        classroom_zone = (int(frame_width * 0.1), int(frame_height * 0.1),
                          int(frame_width * 0.9), int(frame_height * 0.9)) # x1, y1, x2, y2

        events = []

        # Store previous centroids for entry/exit logic
        # These are now initialized in _initialize, so we don't need 'if not hasattr' checks here
        current_centroids = {id: p_data['centroid'] for id, p_data in self._tracked_persons_data.items()}

        # Handle deregistered persons if they were in the room
        for prev_id in list(self._person_in_room_status.keys()):
            if prev_id not in current_centroids and self._person_in_room_status[prev_id]: # Person no longer tracked, was in room
                 events.append({"type": "Person Disappeared (Assumed Left)", "person_id": prev_id, "timestamp": time.time()})
                 logger.info(f"Person ID {prev_id} disappeared from view (assumed left).")
                 del self._person_in_room_status[prev_id]


        for person_id, current_centroid in current_centroids.items():
            prev_centroid = self._prev_person_centroids.get(person_id)
            
            x, y = current_centroid
            # Check if person is inside the main classroom zone
            is_in_classroom_now = (classroom_zone[0] < x < classroom_zone[2] and
                                   classroom_zone[1] < y < classroom_zone[3])

            # Logic for "Unauthorized Entry"
            # If a person appears who wasn't in the "room" before and is now, or if they enter a specific restricted zone
            # For simplicity, let's say "unauthorized entry" is a new person appearing in the classroom zone
            if person_id not in self._person_in_room_status and is_in_classroom_now:
                events.append({"type": "Unauthorized Entry", "person_id": person_id, "timestamp": time.time()})
                logger.warning(f"ALERT: Unauthorized Entry detected for Person ID {person_id}!")
                self._person_in_room_status[person_id] = True # Mark as in room

            # Logic for "Leaving the Room"
            # If person was in room and now is outside room and crossed doorway line
            if prev_centroid and self._person_in_room_status.get(person_id, False):
                prev_x, prev_y = prev_centroid
                
                # Check if crossed doorway line (from above to below, or vice-versa)
                # This assumes doorway_line is horizontal
                crossed_doorway = False
                if prev_y <= doorway_y and y > doorway_y: # Crossed from top to bottom
                    crossed_doorway = True
                elif prev_y >= doorway_y and y < doorway_y: # Crossed from bottom to top
                    crossed_doorway = True
                
                if crossed_doorway and not is_in_classroom_now: # If crossed doorway and now outside room
                    events.append({"type": "Leaving Room", "person_id": person_id, "timestamp": time.time()})
                    logger.warning(f"ALERT: Person ID {person_id} is leaving the room!")
                    self._person_in_room_status[person_id] = False # Mark as left room


        self._prev_person_centroids = current_centroids.copy() # Update previous centroids for next frame

        return events, doorway_line, classroom_zone # Return events and zone info for drawing

    def is_running(self):
        """Check if the stream is currently active."""
        return self._running and self._cap and self._cap.isOpened()

    def get_detected_objects(self):
        """Returns the raw object detection results for the current frame."""
        with self._frame_lock:
            return self._detected_objects_info.copy()

    def get_tracked_persons(self):
        """Returns the data for currently tracked persons (with IDs, centroids, etc.)."""
        with self._frame_lock:
            return self._tracked_persons_data.copy()

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
        # This prevents multiple /video_feed requests from trying to read from the same manager simultaneously
        if hasattr(self, '_generator_active') and self._generator_active:
            logger.warning("Another generator is already active. Only one video feed client supported per stream manager.")
            return # Prevent multiple generators from running concurrently on the same manager

        # Using a distinct flag for generator activity, initialized in _initialize
        self._generator_active = True
        logger.info(f"Starting frame generation loop.") # Removed self.rtsp_url as it's not always rtsp

        try:
            while self._running: # Use _running flag to control the loop
                # Acquire lock to safely read the current frame
                with self._frame_lock:
                    frame = self._current_frame

                if frame is None:
                    await asyncio.sleep(0.05) # Wait if no frame is available yet
                    continue

                _, buffer = cv2.imencode('.jpg', frame) # Encode the annotated frame
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                      b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                await asyncio.sleep(0.01) # Use asyncio.sleep for non-blocking delay

        except Exception as e:
            logger.error(f"Error during frame generation: {e}")
        finally:
            logger.info("Frame generation loop exiting.")
            self._generator_active = False # Mark generator as inactive


# Helper to get the singleton instance
def get_video_stream_manager():
    global _current_video_stream_instance
    if _current_video_stream_instance is None:
        _current_video_stream_instance = VideoStreamManager()
        # _initialize is now called from __init__ which is called when VideoStreamManager() is created
        # No need to call set_detector here, as ObjectDetector is initialized directly in _initialize
    return _current_video_stream_instance