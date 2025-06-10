import { useState } from 'react';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportGenerator = ({ alerts }) => {
  const [reportCriteria, setReportCriteria] = useState({
    startDate: '',
    endDate: '',
    classroom: 'all',
    alertType: 'all'
  });
  
  const filteredAlerts = alerts.filter(alert => {
    const alertDate = new Date(alert.timestamp);
    const startDate = reportCriteria.startDate ? new Date(reportCriteria.startDate) : null;
    const endDate = reportCriteria.endDate ? new Date(reportCriteria.endDate) : null;
    
    return (
      (reportCriteria.classroom === 'all' || alert.classroom === reportCriteria.classroom) &&
      (reportCriteria.alertType === 'all' || alert.type === reportCriteria.alertType) &&
      (!startDate || alertDate >= startDate) &&
      (!endDate || alertDate <= endDate)
    );
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Classroom Surveillance Report', 14, 22);
    
    // Report criteria
    doc.setFontSize(10);
    doc.text(`Date Range: ${reportCriteria.startDate || 'N/A'} to ${reportCriteria.endDate || 'N/A'}`, 14, 32);
    doc.text(`Classroom: ${reportCriteria.classroom === 'all' ? 'All' : reportCriteria.classroom}`, 14, 38);
    doc.text(`Alert Type: ${reportCriteria.alertType === 'all' ? 'All' : reportCriteria.alertType}`, 14, 44);
    
    // Table data
    const tableData = filteredAlerts.map(alert => [
      alert.timestamp,
      alert.classroom,
      alert.type.toUpperCase(),
      `${alert.confidence}%`,
      alert.location || 'N/A'
    ]);
    
    // Table
    doc.autoTable({
      startY: 50,
      head: [['Timestamp', 'Classroom', 'Type', 'Confidence', 'Location']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] } // indigo-600
    });
    
    // Save PDF
    doc.save(`surveillance-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Generate Reports</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="font-medium mb-4">Report Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={reportCriteria.startDate}
              onChange={(e) => setReportCriteria({...reportCriteria, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              value={reportCriteria.endDate}
              onChange={(e) => setReportCriteria({...reportCriteria, endDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Classroom</label>
            <select
              className="w-full p-2 border rounded-md"
              value={reportCriteria.classroom}
              onChange={(e) => setReportCriteria({...reportCriteria, classroom: e.target.value})}
            >
              <option value="all">All Classrooms</option>
              <option value="Room A">Room A</option>
              <option value="Room B">Room B</option>
              <option value="Lab 1">Lab 1</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alert Type</label>
            <select
              className="w-full p-2 border rounded-md"
              value={reportCriteria.alertType}
              onChange={(e) => setReportCriteria({...reportCriteria, alertType: e.target.value})}
            >
              <option value="all">All Types</option>
              <option value="weapon">Weapon</option>
              <option value="fire">Fire/Smoke</option>
              <option value="motion">Motion</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Report Summary</h3>
          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
            {filteredAlerts.length} alerts found
          </span>
        </div>
        
        {filteredAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classroom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts.slice(0, 5).map(alert => (
                  <tr key={alert.id}>
                    <td className="px-4 py-3 text-sm">{alert.timestamp}</td>
                    <td className="px-4 py-3 text-sm">{alert.classroom}</td>
                    <td className="px-4 py-3 text-sm capitalize">{alert.type}</td>
                    <td className="px-4 py-3 text-sm">{alert.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No alerts match the selected criteria</p>
        )}
        
        <div className="mt-6 flex space-x-4">
          <button
            onClick={generatePDF}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
          >
            <span className="mr-2">📄</span> Generate PDF
          </button>
          
          <CSVLink 
            data={filteredAlerts}
            filename={`surveillance-report-${new Date().toISOString().slice(0,10)}.csv`}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
          >
            <span className="mr-2">📊</span> Export CSV
          </CSVLink>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;