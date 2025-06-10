import { useState, useEffect } from 'react';
import { fetchClassrooms, createClassroom } from '../services/api';

const ClassroomForm = ({ selectedClassroom, setSelectedClassroom }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    rtspUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const data = await fetchClassrooms();
        setClassrooms(data);
        if (data.length > 0 && !selectedClassroom) {
          setSelectedClassroom(data[0]);
        }
      } catch (error) {
        console.error('Error loading classrooms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClassrooms();
  }, [setSelectedClassroom, selectedClassroom]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newClassroom = await createClassroom(formData);
      setClassrooms([...classrooms, newClassroom]);
      setSelectedClassroom(newClassroom);
      setFormData({ name: '', code: '', rtspUrl: '' });
    } catch (error) {
      console.error('Error creating classroom:', error);
    }
  };

  if (isLoading) return <div>Loading classrooms...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Classroom Management</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Existing Classrooms</h3>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedClassroom?.id || ''}
            onChange={(e) => {
              const classroom = classrooms.find(c => c.id === e.target.value);
              setSelectedClassroom(classroom);
            }}
          >
            {classrooms.map(classroom => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} ({classroom.code})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Add New Classroom</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              id="clasroom-name"
              type="text"
              placeholder="Classroom Name"
              className="w-full p-2 border rounded-md"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Classroom Code"
              className="w-full p-2 border rounded-md"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="RTSP URL"
              className="w-full p-2 border rounded-md"
              value={formData.rtspUrl}
              onChange={(e) => setFormData({...formData, rtspUrl: e.target.value})}
              required
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Classroom
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassroomForm;