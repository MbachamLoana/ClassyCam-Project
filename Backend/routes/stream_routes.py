from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from services.stream_service import stream_manager  # Use the correct filename
import uuid

router = APIRouter()

@router.get("/stream")
async def stream_video(rtsp_url: str = Query(...)):
    client_id = str(uuid.uuid4())  # Generate unique client ID
    return StreamingResponse(
        stream_manager.generate_frames(rtsp_url, client_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
         headers={"X-Client-ID": client_id}
    )

@router.get("/heartbeat")  # Make sure this route exists
async def heartbeat():
    return {"status": "alive", "message": "API is working"}

@router.get("/stream/start")
async def start_stream(rtsp_url: str = Query(...)):
    client_id = str(uuid.uuid4())
    return StreamingResponse(
        stream_manager.generate_frames(rtsp_url, client_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"X-Client-ID": client_id}
    )

@router.get("/stream/stop")
async def stop_stream(client_id: str = Query(...)):
    stream_manager.stop_stream(client_id)
    return {"status": "stopped"}

