# routes/stream_routes.py - This needs to be the content from my last answer!
from fastapi import APIRouter, Query, Body
from fastapi.responses import StreamingResponse, JSONResponse
from core.video_stream_manager import get_video_stream_manager # Import the manager

router = APIRouter()

# Get the singleton manager instance
stream_manager = get_video_stream_manager()

# This endpoint STARTS the stream on the backend
@router.post("/start_stream")
async def start_stream(
    rtsp_url: str = Body(..., embed=True, description="RTSP URL or webcam index (e.g., '0' for built-in webcam)")
):
    success = stream_manager.start_stream(rtsp_url)
    if success:
        return JSONResponse(content={"success": True, "message": "Stream started successfully!"})
    else:
        return JSONResponse(content={"success": False, "message": "Failed to start stream. Check logs."}, status_code=500)

# This endpoint STOPS the stream on the backend
@router.post("/stop_stream")
async def stop_stream():
    success = stream_manager.stop_stream()
    if success:
        return JSONResponse(content={"success": True, "message": "Stream stopped successfully!"})
    else:
        return JSONResponse(content={"success": False, "message": "No active stream to stop."})

# This endpoint SERVES the frames from the already running stream
@router.get("/video_feed") # Changed from /stream
async def video_feed():
    return StreamingResponse(
        stream_manager.generate_frames(), # Calls the manager's generator
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.get("/heartbeat")
async def heartbeat():
    return {"status": "alive", "stream_active": stream_manager.is_running()}