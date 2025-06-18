const express = require('express');
const cv = require('opencv4nodejs');
const app = express();
const cors = require('cors');
const port = 5000;

app.use(cors());
app.use(express.json());

let rtspUrl = '';
let capture = null;

// Endpoint to set RTSP URL
app.post('/set-rtsp', (req, res) => {
  try {
    rtspUrl = req.body.url;
    
    // Clean up previous stream if exists
    if (capture) {
      capture.release();
    }
    
    // Initialize video capture
    capture = new cv.VideoCapture(rtspUrl);
    res.status(200).send('RTSP URL set successfully');
  } catch (error) {
    console.error('Error setting RTSP URL:', error);
    res.status(500).send('Failed to connect to camera');
  }
});

// MJPEG stream endpoint
app.get('/video-stream', (req, res) => {
  if (!capture) {
    return res.status(400).send('RTSP URL not set');
  }

  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache'
  });

  const sendFrame = () => {
    try {
      const frame = capture.read();
      
      if (!frame.empty) {
        const jpg = cv.imencode('.jpg', frame).toString('base64');
        res.write(
          `--frame\r\n` +
          `Content-Type: image/jpeg\r\n` +
          `Content-Length: ${jpg.length}\r\n\r\n` +
          jpg + '\r\n'
        );
      }
    } catch (error) {
      console.error('Stream error:', error);
      res.end();
      return;
    }
    
    setTimeout(sendFrame, 33); // ~30 FPS
  };

  sendFrame();
});

app.listen(port, () => {
  console.log(`Streaming server running at http://localhost:${port}`);
});