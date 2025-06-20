import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import Onboarding from './pages/Onboarding';
import Signup from './pages/Signup';
import Login from './pages/Login';
import InitialDashboard from './pages/InitialDashboard';
import MonitoringDashboard from './pages/MonitoringDashboard';
import ForgotPassword from './pages/ForgotPassword';
import Video from './pages/Video';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/video" element={<Video />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<InitialDashboard />} />
        <Route path="/monitor" element={<MonitoringDashboard />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;