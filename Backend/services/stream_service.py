import cv2
from core.object_detector import ObjectDetector

class StreamManager:
    def __init__(self):
        self.detector = ObjectDetector()
        self.active_connections = {}
        self.should_stop = False

    async def generate_frames(self, rtsp_url: str, client_id: str):
        pass
        self.should_stop = False
        cap = cv2.VideoCapture(rtsp_url)
        self.active_connections[client_id] = cap

        if not cap.isOpened():
            raise Exception(f"Could not open camera stream")

        try:
            while not self.should_stop:
                ret, frame = cap.read()
                if not ret:
                    break
                
                processed_frame = self.detector.detect_objects(frame)
                _, buffer = cv2.imencode('.jpg', processed_frame)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                      b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        finally:
            self.cleanup(client_id)

    def stop_stream(self, client_id: str):
        self.should_stop = True
        self.cleanup(client_id)

    def cleanup(self, client_id: str):
        if client_id in self.active_connections:
            cap = self.active_connections[client_id]
            cap.release()
            del self.active_connections[client_id]

stream_manager = StreamManager()