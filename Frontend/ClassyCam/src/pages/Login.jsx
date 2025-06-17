// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import AuthForm from '../components/AuthForm';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('classycam_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.target);
    const emailValue = formData.get('email');
    const password = formData.get('password');

    try {
      // Sign in user with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, emailValue, password);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('classycam_remembered_email', emailValue);
      } else {
        localStorage.removeItem('classycam_remembered_email');
      }

      console.log("User logged in:", userCredential.user);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      <AuthForm 
        type="login" 
        onSubmit={handleSubmit}
        email={email}
        setEmail={setEmail}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default Login;