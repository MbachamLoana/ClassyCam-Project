from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from services.stream_service import generate_frames

router = APIRouter()

@router.get("/stream")
async def stream_video(rtsp_url: str = Query(..., description="RTSP URL of the camera")):
    return StreamingResponse(
        generate_frames(rtsp_url), 
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.get("/heartbeat")
async def heartbeat():
    return {"status": "alive"}