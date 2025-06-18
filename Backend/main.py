# main.py
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import asyncio
from datetime import datetime # Import datetime for the heartbeat timestamp

app = FastAPI()

# --- CORS Configuration ---
# This is CRITICAL for your frontend (React) to be able to talk to this backend
# Replace "http://localhost:5173" and "http://127.0.0.1:5173" with your actual
# React app's URLs if they differ (e.g., if Vite runs on a different port).
origins = [
    "http://localhost:5173",  # Default Vite development server URL
    "http://127.0.0.1:5173",  # Alternative local host for Vite
    # Add any other origins where your frontend might be hosted (e.g., your IP if testing on another device)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],    # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],    # Allow all headers
)

# --- Global State for Active Streams ---
# This dictionary stores active OpenCV VideoCapture objects.
# Note: For production and multiple concurrent users on the SAME RTSP URL,
# a more sophisticated stream management (e.g., a shared producer-consumer pattern)
# would be needed to avoid opening multiple identical RTSP connections.
active_streams = {}

# --- Frame Generation Function ---
async def generate_frames(rtsp_url: str):
    """
    Generator function to open an RTSP stream using OpenCV,
    read frames, encode them as JPEG, and yield them for MJPEG streaming.
    """
    cap = cv2.VideoCapture(rtsp_url) # Attempt to open the RTSP stream

    # Check if the video capture object was successfully opened
    if not cap.isOpened():
        print(f"Error: Could not open RTSP stream: {rtsp_url}. Check URL, network, or camera.")
        # Attempt to log more details about why it failed if possible (OpenCV often provides limited info here)
        return

    # Add the capture object to our active_streams dictionary
    # This helps in managing its lifecycle (e.g., releasing resources)
    active_streams[rtsp_url] = cap
    print(f"RTSP stream opened successfully for: {rtsp_url}")

    try:
        while True:
            ret, frame = cap.read() # Read a frame from the video stream

            # If frame reading fails (e.g., stream ends, camera disconnects)
            if not ret:
                print(f"Error: Failed to read frame from {rtsp_url}. Stream likely ended or disconnected.")
                break # Exit the loop, which will trigger the finally block

            # Encode the frame as a JPEG image in memory
            # This is crucial for MJPEG streaming
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                print(f"Error: Could not encode frame to JPEG for {rtsp_url}.")
                break # Exit the loop if encoding fails

            frame_bytes = buffer.tobytes() # Convert the buffer to bytes

            # Yield the frame in the MJPEG multipart format
            # Each frame is prefixed with a boundary and Content-Type header
            yield (
                b'--frame\r\n'                 # MJPEG boundary
                b'Content-Type: image/jpeg\r\n' # Content type of the frame
                b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n' + # Content length header
                b'\r\n' + frame_bytes + b'\r\n' # Actual JPEG image bytes
            )
            # Add a small asynchronous delay to manage CPU usage and network traffic.
            # Adjust this value based on desired frame rate and performance.
            await asyncio.sleep(0.01) # Approximately 100 frames per second (1/0.01 = 100)

    except asyncio.CancelledError:
        # This exception is raised if the client disconnects or the generator is explicitly stopped
        print(f"Stream generation for {rtsp_url} cancelled by client disconnection.")
    except Exception as e:
        # Catch any other unexpected errors during stream processing
        print(f"An unexpected error occurred during frame generation for {rtsp_url}: {e}")
    finally:
        # Ensure the OpenCV VideoCapture object is released to free up camera resources.
        # This is called when the generator finishes (normally or due to error/cancellation).
        if rtsp_url in active_streams and active_streams[rtsp_url] == cap:
            cap.release()
            del active_streams[rtsp_url] # Remove from our active streams list
        print(f"Released RTSP stream resources for: {rtsp_url}")

# --- API Endpoints ---

@app.get("/")
async def read_root():
    """
    Basic root endpoint for testing if the FastAPI server is running.
    """
    return {"message": "Welcome to the ClassyCam Backend Stream Server"}

@app.get("/stream")
async def video_feed(rtsp_url: str):
    """
    Main endpoint to proxy the RTSP stream.
    Takes an RTSP URL as a query parameter and streams frames as MJPEG.
    """
    if not rtsp_url:
        return HTMLResponse(status_code=400, content="RTSP URL query parameter is required.")

    print(f"Received request to stream RTSP from: {rtsp_url}")
    # Return a StreamingResponse that continuously yields frames from the generator
    return StreamingResponse(generate_frames(rtsp_url), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/heartbeat")
async def heartbeat():
    """
    Simple endpoint for the frontend to check if the backend server is alive.
    Returns status, timestamp, and count of currently active proxied streams.
    """
    return {"status": "ok", "timestamp": datetime.now().isoformat(), "active_streams_count": len(active_streams)}