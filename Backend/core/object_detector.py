# src/core/object_detector.py
from ultralytics import YOLO
import cv2
import logging
import threading

logger = logging.getLogger(__name__)

class ObjectDetector:
    _instance = None
    _lock = threading.Lock() # Ensure thread safety for singleton

    def __new__(cls, model_path='yolov8n.pt'):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ObjectDetector, cls).__new__(cls)
                    cls._instance._initialized = False # Use an internal flag for initialization
        return cls._instance

    def __init__(self, model_path='yolov8n.pt'):
        if not self._initialized: # Only initialize once
            self.model_path = model_path
            self.model = None
            self.class_names = [] # To store names of detected classes
            self._initialized = True
            logger.info(f"ObjectDetector initialized with model path: {model_path}")

    def load_model(self):
        """Loads the YOLOv8 model."""
        if self.model is None:
            try:
                # Load a pre-trained YOLOv8 model
                self.model = YOLO(self.model_path)
                self.class_names = self.model.names # Get class names from the model
                logger.info(f"YOLOv8 model '{self.model_path}' loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load YOLOv8 model from {self.model_path}: {e}")
                self.model = None # Ensure model is None on failure
                raise

    def detect(self, frame):
        """
        Performs object detection on a single frame.
        Args:
            frame (np.array): The input image frame (OpenCV format).
        Returns:
            np.array: The frame with bounding boxes and labels drawn.
            list: A list of detected objects (e.g., [{'class': 'person', 'confidence': 0.95, 'bbox': [x1, y1, x2, y2]}, ...])
        """
        if self.model is None:
            logger.warning("YOLOv8 model not loaded. Skipping detection.")
            return frame, []

        results = self.model(frame, verbose=False) # Run inference, suppress verbose output

        detected_objects_info = []
        annotated_frame = frame.copy() # Make a copy to draw on

        # Process results and draw bounding boxes
        for r in results:
            boxes = r.boxes # Bounding boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0]) # Get coordinates
                confidence = round(float(box.conf[0]), 2) # Confidence score
                class_id = int(box.cls[0]) # Class ID
                class_name = self.class_names[class_id] # Class name

                detected_objects_info.append({
                    'class': class_name,
                    'confidence': confidence,
                    'bbox': [x1, y1, x2, y2]
                })

                # Only draw for 'person' class for now, or if you want to see all
                if class_name == 'person':
                    # Draw bounding box
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2) # Green box
                    # Put label
                    label = f"{class_name} {confidence:.2f}"
                    cv2.putText(annotated_frame, label, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        return annotated_frame, detected_objects_info

# Helper function to get the singleton instance
def get_object_detector(model_path='yolov8n.pt'):
    detector = ObjectDetector(model_path)
    if detector.model is None: # Load model only if not already loaded
        detector.load_model()
    return detector