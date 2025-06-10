import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-indigo-700">Classroom Surveillance</h1>
      </div>
      
      <nav className="mt-6">
        <button
          className={`w-full text-left px-6 py-3 flex items-center ${
            activeTab === 'monitor' 
              ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('monitor')}
        >
          <span className="mr-3">📹</span>
          Classroom Monitoring
        </button>
        
        <button
          className={`w-full text-left px-6 py-3 flex items-center ${
            activeTab === 'reports' 
              ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('reports')}
        >
          <span className="mr-3">📊</span>
          Reports
        </button>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t">
        <button
          className="w-full flex items-center text-gray-600 hover:text-red-500"
          onClick={onLogout}
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;