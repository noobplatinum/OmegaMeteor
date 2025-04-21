import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from './googleServices';

// Harus deploy dulu

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordStrength.valid) {
      setError('Please use a stronger password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      
      await updatePassword(newPassword);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Set New Password</h1>
        
        {error && <div className="auth-error">{error}</div>}
        
        {success ? (
          <div className="auth-message">
            <p>Your password has been successfully reset!</p>
            <p>You will be redirected to the login page in a few seconds...</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  checkPasswordStrength(e.target.value);
                }}
                required
                minLength={8}
              />
              {newPassword && (
                <p className={`password-strength ${passwordStrength.valid ? 'valid' : 'invalid'}`}>
                  {passwordStrength.message}
                </p>
              )}
            </div>
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
              {newPassword && confirmPassword && (
                <p className={`password-match ${newPassword === confirmPassword ? 'valid' : 'invalid'}`}>
                  {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading || !passwordStrength.valid || newPassword !== confirmPassword}
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
            <div className="auth-links">
              <button type="button" className="link-button" onClick={() => navigate('/')}>
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;