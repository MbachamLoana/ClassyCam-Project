// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import Logo from '../components/Logo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
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
      <div className="auth-form-container">
        <div className="auth-logo">
          <Logo size="medium" />
        </div>
        
        <h2>Reset Your Password</h2>
        
        {success ? (
          <div className="auth-success">
            <p>Password reset email sent to <strong>{email}</strong></p>
            <p>Check your inbox for instructions to reset your password.</p>
            <button 
              className="auth-submit-btn"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : 'Send Reset Link'}
            </button>
            
            <p className="auth-switch">
              Remember your password? <a href="/login">Login</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;