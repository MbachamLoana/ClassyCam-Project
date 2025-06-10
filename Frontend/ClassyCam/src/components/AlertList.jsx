import { useState } from 'react';

const AlertList = ({ alerts, isLoading }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  const getAlertColor = (type) => {
    switch (type) {
      case 'weapon': return 'bg-red-100 border-red-500';
      case 'fire': return 'bg-orange-100 border-orange-500';
      case 'motion': return 'bg-yellow-100 border-yellow-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'weapon': return '🔫';
      case 'fire': return '🔥';
      case 'motion': return '🚶';
      default: return '⚠️';
    }
  };

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  if (filteredAlerts.length === 0) {
    return <div className="text-center py-8 text-gray-500">No alerts found</div>;
  }

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button 
          className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm ${filter === 'weapon' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('weapon')}
        >
          Weapons
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm ${filter === 'fire' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('fire')}
        >
          Fire
        </button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}
          >
            <div className="flex justify-between">
              <div className="flex items-start">
                <span className="text-2xl mr-3">{getAlertIcon(alert.type)}</span>
                <div>
                  <h3 className="font-bold capitalize">{alert.type} detected</h3>
                  <p className="text-sm text-gray-600">{alert.timestamp}</p>
                </div>
              </div>
              <span className="text-sm font-bold">{alert.confidence}%</span>
            </div>
            
            {alert.snapshot && (
              <div className="mt-3">
                <img 
                  src={alert.snapshot} 
                  alt="Alert snapshot" 
                  className="w-full rounded-md border"
                />
              </div>
            )}
            
            <div className="mt-2 text-sm">
              <p>Classroom: {alert.classroom}</p>
              <p>Location: {alert.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertList;