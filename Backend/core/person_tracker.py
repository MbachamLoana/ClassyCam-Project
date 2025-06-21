# src/core/person_tracker.py
import math
import logging

logger = logging.getLogger(__name__)

class PersonTracker:
    def __init__(self, max_disappeared=50):
        """
        Initializes the PersonTracker.
        Args:
            max_disappeared (int): The maximum number of consecutive frames a person can be
                                   "disappeared" for before their ID is deregistered.
        """
        self.next_object_id = 0
        self.objects = {}  # Stores {object_id: centroid (x, y)}
        self.disappeared = {}  # Stores {object_id: num_disappeared_frames}
        self.max_disappeared = max_disappeared
        self.tracked_persons_data = {} # Stores {object_id: {'bbox': [x1,y1,x2,y2], 'class': 'person', 'confidence': 0.9}}
        logger.info("PersonTracker initialized.")

    def _register(self, centroid, bbox_info):
        """Registers a new object."""
        self.objects[self.next_object_id] = centroid
        self.disappeared[self.next_object_id] = 0
        self.tracked_persons_data[self.next_object_id] = bbox_info # Store initial bbox info
        new_id = self.next_object_id
        self.next_object_id += 1
        logger.debug(f"Registered new object ID: {new_id}")
        return new_id

    def _deregister(self, object_id):
        """Deregisters a disappeared object."""
        logger.debug(f"Deregistering object ID: {object_id}")
        del self.objects[object_id]
        del self.disappeared[object_id]
        del self.tracked_persons_data[object_id]

    def update(self, detected_persons_info):
        """
        Updates the tracker with new detections.
        Args:
            detected_persons_info (list): List of detected person objects from ObjectDetector.
                                          Each item: {'class': 'person', 'confidence': ..., 'bbox': [x1, y1, x2, y2]}
        Returns:
            dict: Current state of tracked persons {object_id: {'centroid': (x,y), 'bbox': [x1,y1,x2,y2], 'class': 'person', 'confidence': 0.9}}
        """
        if len(detected_persons_info) == 0:
            # No objects detected, mark all existing objects as disappeared
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self._deregister(object_id)
            return {id: {**self.tracked_persons_data[id], 'centroid': self.objects[id]} for id in self.objects}

        # Compute centroids for current detections
        input_centroids = []
        for p_info in detected_persons_info:
            x1, y1, x2, y2 = p_info['bbox']
            cX = int((x1 + x2) / 2.0)
            cY = int((y1 + y2) / 2.0)
            input_centroids.append((cX, cY))

        # If no objects currently being tracked, register all new detections
        if len(self.objects) == 0:
            for i, centroid in enumerate(input_centroids):
                self._register(centroid, detected_persons_info[i])
        else:
            # Match new detections to existing objects
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())

            # Calculate Euclidean distances between existing object centroids and new detection centroids
            # This is a simple approach, more robust methods use Hungarian algorithm or IOU for matching
            D = []
            for i in range(len(object_centroids)):
                row = []
                for j in range(len(input_centroids)):
                    dist = math.dist(object_centroids[i], input_centroids[j])
                    row.append(dist)
                D.append(row)

            # Simple greedy matching (could be improved with Hungarian algorithm for optimal matching)
            # Find the smallest distance matches
            used_rows = set() # Existing object IDs used
            used_cols = set() # New detection IDs used

            for _ in range(min(len(D), len(D[0]) if D else 0)): # Iterate up to the number of possible matches
                min_dist = float('inf')
                min_row, min_col = -1, -1
                for r in range(len(D)):
                    if r in used_rows:
                        continue
                    for c in range(len(D[r])):
                        if c in used_cols:
                            continue
                        if D[r][c] < min_dist:
                            min_dist = D[r][c]
                            min_row, min_col = r, c
                
                if min_row != -1: # If a match was found
                    object_id = object_ids[min_row]
                    self.objects[object_id] = input_centroids[min_col]
                    self.disappeared[object_id] = 0 # Reset disappeared count
                    self.tracked_persons_data[object_id] = detected_persons_info[min_col] # Update bbox info
                    used_rows.add(min_row)
                    used_cols.add(min_col)
                else:
                    break # No more good matches

            # Mark disappeared existing objects
            for r in range(len(D)):
                if r not in used_rows:
                    object_id = object_ids[r]
                    self.disappeared[object_id] += 1
                    if self.disappeared[object_id] > self.max_disappeared:
                        self._deregister(object_id)

            # Register any new detections that weren't matched
            for c in range(len(input_centroids)):
                if c not in used_cols:
                    self._register(input_centroids[c], detected_persons_info[c])
        
        # Prepare the output with all tracked persons' updated data
        current_tracked_persons = {}
        for object_id, centroid in self.objects.items():
            current_tracked_persons[object_id] = {
                'centroid': centroid,
                'bbox': self.tracked_persons_data[object_id]['bbox'],
                'class': self.tracked_persons_data[object_id]['class'],
                'confidence': self.tracked_persons_data[object_id]['confidence']
            }
        
        return current_tracked_persons