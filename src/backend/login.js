import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from './googleServices';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('signin'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    valid: false,
    message: ''
  });

  const checkPasswordStrength = (pass) => {
    if (!pass) {
      setPasswordStrength({ valid: false, message: '' });
      return;
    }
    
    const hasLetter = /[A-Za-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasMinLength = pass.length >= 8;
    
    if (!hasMinLength) {
      setPasswordStrength({ valid: false, message: 'Password must be at least 8 characters' });
    } else if (!hasLetter) {
      setPasswordStrength({ valid: false, message: 'Password must include at least one letter' });
    } else if (!hasNumber) {
      setPasswordStrength({ valid: false, message: 'Password must include at least one number' });
    } else {
      setPasswordStrength({ valid: true, message: 'Password strength: Good' });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (error) {
      setError(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if ((mode === 'signin' || mode === 'signup') && !password) {
      setError('Password is required');
      return;
    }
    
    if (mode === 'signup') {
      if (!passwordStrength.valid) {
        setError('Please use a stronger password');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    try {
      setLoading(true);

      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password);
        setMessage('Sign up successful!');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMessage('Password reset email sent. Please check your inbox.');
        setMode('signin');
      }
    } catch (error) {
      if (error.message.includes('User already registered')) {
        setError('This email is already registered. Please sign in.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (mode === 'reset') {
      return (
        <form onSubmit={handleEmailAuth} className="auth-form">
          <h2>Reset Password</h2>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div className="auth-links">
            <button type="button" className="link-button" onClick={() => setMode('signin')}>
              Back to Sign In
            </button>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={handleEmailAuth} className="auth-form">
        <h2>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (mode === 'signup') {
                checkPasswordStrength(e.target.value);
              }
            }}
            required
            minLength={8}
          />
          {mode === 'signup' && password && (
            <p className={`password-strength ${passwordStrength.valid ? 'valid' : 'invalid'}`}>
              {passwordStrength.message}
            </p>
          )}
        </div>
        {mode === 'signup' && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
            {password && confirmPassword && (
              <p className={`password-match ${password === confirmPassword ? 'valid' : 'invalid'}`}>
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>
        )}
        <button 
          type="submit" 
          className="auth-button" 
          disabled={loading || (mode === 'signup' && (!passwordStrength.valid || password !== confirmPassword))}
        >
          {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
        <div className="auth-links">
          {mode === 'signin' ? (
            <>
              <button type="button" className="link-button" onClick={() => setMode('signup')}>
                Create an account
              </button>
              <button type="button" className="link-button" onClick={() => setMode('reset')}>
                Forgot password?
              </button>
            </>
          ) : (
            <button type="button" className="link-button" onClick={() => setMode('signin')}>
              Already have an account? Sign in
            </button>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to Digi 2025 Recruitment</h1>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}
        
        {renderForm()}
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="google-signin-button"
        >
          {loading ? 'Loading...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
};

export default Login;