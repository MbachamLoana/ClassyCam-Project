// Simulated API service
export const fetchClassrooms = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'Room A', code: 'C101', rtspUrl: 'rtsp://room-a.example.com' },
          { id: '2', name: 'Room B', code: 'C102', rtspUrl: 'rtsp://room-b.example.com' },
          { id: '3', name: 'Lab 1', code: 'L101', rtspUrl: 'rtsp://lab-1.example.com' }
        ]);
      }, 800);
    });
  };
  
  export const createClassroom = async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          ...data
        });
      }, 500);
    });
  };
  
  export const fetchAlerts = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'weapon',
            confidence: 92,
            timestamp: '2023-11-15 10:30:15',
            classroom: 'Room A',
            location: 'Near back entrance',
            snapshot: 'https://via.placeholder.com/300x150?text=Weapon+Detected'
          },
          {
            id: '2',
            type: 'motion',
            confidence: 85,
            timestamp: '2023-11-15 09:15:22',
            classroom: 'Lab 1',
            location: 'Teacher desk area',
            snapshot: 'https://via.placeholder.com/300x150?text=Motion+Detected'
          },
          {
            id: '3',
            type: 'fire',
            confidence: 78,
            timestamp: '2023-11-14 14:45:33',
            classroom: 'Room B',
            location: 'Chemistry station',
            snapshot: 'https://via.placeholder.com/300x150?text=Fire+Detected'
          }
        ]);
      }, 1000);
    });
  };