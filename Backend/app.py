# /Users/loanas/Desktop/ClassyCam Project/Backend/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.stream_routes import router as stream_router
import logging
import uvicorn # Ensure uvicorn is imported if used directly here
from core.video_stream_manager import get_video_stream_manager # Import the manager helper

# --- Logging Configuration (Good to have this near the top) ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- FastAPI App Instance (MUST be defined before decorators or middleware) ---
app = FastAPI()

# --- Get the Singleton VideoStreamManager Instance ---
stream_manager = get_video_stream_manager()

# --- CORS Middleware ---
# Place this directly after the app instance is created
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # WARNING: Use specific origins in production, e.g., ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"], # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- Include Routers ---
# Place this after middleware setup
app.include_router(stream_router)


# --- API Endpoints (Define your routes here) ---

# This endpoint now correctly uses the stream_manager instance
@app.get("/api/detected_objects")
async def get_detected_objects():
    if stream_manager.is_running():
        # Using get_detected_objects for raw detections, or get_tracked_persons for tracked data
        objects = stream_manager.get_tracked_persons() # Changed to get_tracked_persons
        return {"status": "success", "objects": objects}
    return {"status": "error", "message": "Stream not active. Start stream first via /stream/start."}

# --- Main execution block ---
if __name__ == "__main__":
    logger.info("Starting FastAPI application...")
    # This will run your FastAPI app. Ensure your venv is activated before running this script.
    uvicorn.run(app, host="0.0.0.0", port=8000)