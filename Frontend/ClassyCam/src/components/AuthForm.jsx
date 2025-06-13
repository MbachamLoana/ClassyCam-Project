// src/components/AuthForm.jsx
import { motion } from 'framer-motion';

const AuthForm = ({ 
  type, 
  onSubmit, 
  error, 
  loading,
  email,
  setEmail,
  rememberMe,
  setRememberMe
}) => {
  return (
    <motion.div 
      className="auth-form-container"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="auth-logo">
        <div className="logo-icon">📷</div>
        <h1>Classy<span>Cam</span></h1>
      </div>
      
      <h2>{type === 'signup' ? 'Create Admin Account' : 'Admin Login'}</h2>
      
      <form onSubmit={onSubmit} className="auth-form">
        {type === 'signup' && (
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Enter your full name" 
              required 
              disabled={loading}
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="Enter your email" 
            required 
            disabled={loading}
            value={email || ''}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder="Enter your password" 
            required 
            minLength={6}
            disabled={loading}
          />
        </div>
        
        {type === 'login' && (
          <div className="form-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                name="remember" 
                checked={rememberMe || false}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              /> 
              Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
        )}
        
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
          ) : type === 'signup' ? (
            'Create Account'
          ) : (
            'Login to Dashboard'
          )}
        </button>
        
        <p className="auth-switch">
          {type === 'signup' 
            ? 'Already have an account? ' 
            : "Don't have an account? "}
          <a href={type === 'signup' ? '/login' : '/signup'}>
            {type === 'signup' ? 'Login' : 'Sign Up'}
          </a>
        </p>
      </form>
    </motion.div>
  );
};

export default AuthForm;