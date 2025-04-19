import React, { useState } from 'react';
import { signInWithGoogle } from './googleServices';

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to Digi 2025 Recruitment</h1>
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="google-signin-button"
        >
          {loading ? 'Loading...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

export default Login;