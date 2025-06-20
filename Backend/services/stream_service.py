import cv2
from core.object_detector import ObjectDetector

detector = ObjectDetector()

async def generate_frames(rtsp_url: str):
    cap = cv2.VideoCapture(0)  # Connect to the camera

    if not cap.isOpened():
        raise Exception(f"Could not open camera stream")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process frame with object detector
            processed_frame = detector.detect_objects(frame)
            
            _, buffer = cv2.imencode('.jpg', processed_frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                  b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    finally:
        cap.release()