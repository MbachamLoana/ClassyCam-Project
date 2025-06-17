// src/components/AuthProvider.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate, location]);

  return children;
};

export default AuthProvider;