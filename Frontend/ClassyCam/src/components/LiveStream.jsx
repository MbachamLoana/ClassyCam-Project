import { useState, useEffect } from 'react';

const LiveStream = ({ classroom }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');

  useEffect(() => {
    if (classroom) {
      setIsLoading(true);
      // Simulate stream loading
      setTimeout(() => {
        // In real implementation, this would be the MJPEG endpoint from your backend
        // Example: `http://your-backend/stream/${classroom.id}/mjpeg`
        setStreamUrl('https://via.placeholder.com/800x450?text=Live+Stream+Placeholder');
        setIsLoading(false);
      }, 1000);
    }
  }, [classroom]);

  if (!classroom) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select or create a classroom to view the stream</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Live Stream: {classroom.name}</h2>
        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">LIVE</span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-md">
          <p>Loading stream...</p>
        </div>
      ) : (
        <div className="relative">
          {/* MJPEG stream via img tag */}
          <img 
            src={streamUrl} 
            alt={`Live stream of ${classroom.name}`}
            className="w-full h-auto rounded-md border"
          />
          
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            Classroom: {classroom.code} | Status: Active
          </div>
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Detection Status</p>
          <p className="font-bold">Active</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Objects Detected</p>
          <p className="font-bold">Students: 25</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-md">
          <p className="text-sm text-gray-500">Last Alert</p>
          <p className="font-bold">2 min ago</p>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;