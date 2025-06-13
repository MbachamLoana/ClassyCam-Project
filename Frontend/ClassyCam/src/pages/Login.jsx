// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import AuthForm from '../components/AuthForm';
// src/pages/Login.jsx
import { useState, useEffect } from 'react';
// ... other imports ...


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
    // ... existing login logic ...

    if (rememberMe) {
      localStorage.setItem('classycam_remembered_email', email);
    } else {
      localStorage.removeItem('classycam_remembered_email');
    }
  };

  return (
    <div className="auth-page">
      {/* ... */}
      <AuthForm 
        type="login" 
        onSubmit={handleSubmit}
        email={email}
        setEmail={setEmail}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        // ... other props ...
      />
    </div>
  );

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      // Sign in user with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
        error={error}
        loading={loading}
      />
    </div>
  );
};

export default Login;