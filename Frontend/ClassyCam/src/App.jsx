// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import Onboarding from './pages/Onboarding';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route 
        path="/dashboard" 
        element={
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        } 
      />
    </Routes>
  );
};

export default App;