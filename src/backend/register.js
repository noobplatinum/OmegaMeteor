import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from './googleServices';
import { 
  submitApplication, 
  checkExistingApplication, 
  saveFormProgress, 
  getFormProgress,
  finalizeApplication,
  validateFormStep 
} from './formServices';

import Step1PersonalInfo from './steps/formStep1';
import Step2ContactInfo from './steps/formStep2';
import Step3Essays from './steps/formStep3';

const Register = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    nama: '',
    npm: '',
    angkatan: '',
    cv_url: '',
    question_1: '',
    question_2: '',
    question_3: '',
    question_4: '',
    ig_username: '',
    line_username: '',
    discord_username: '',
    foto_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [existingApplication, setExistingApplication] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const [stepsValid, setStepsValid] = useState({
    step1: false,
    step2: false,
    step3: false
  });

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        navigate('/');
        return;
      }
      
      setUser(currentUser);
      
      if (currentUser.email) {
        const existing = await checkExistingApplication(currentUser.email);
        if (existing) {
          setExistingApplication(true);
          setLoading(false);
          return;
        }
        
        const savedProgress = await getFormProgress(currentUser.email);
        if (savedProgress) {
          setFormData({
            ...formData,
            ...savedProgress,
            email: currentUser.email,
            nama: savedProgress.nama || currentUser.user_metadata?.full_name || '',
          });
          
          setStepsValid({
            step1: !!savedProgress.step1_completed,
            step2: !!savedProgress.step2_completed,
            step3: !!savedProgress.step3_completed
          });
          
          if (savedProgress.step3_completed) {
            setCurrentStep(3);
          } else if (savedProgress.step2_completed) {
            setCurrentStep(3); 
          } else if (savedProgress.step1_completed) {
            setCurrentStep(2); 
          }
          
          setLastSaved(savedProgress.last_updated);
        } else {
          setFormData(prev => ({
            ...prev,
            nama: currentUser.user_metadata?.full_name || '',
            email: currentUser.email || '',
          }));
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user?.email || !formData.email) return;
    
    const saveTimeout = setTimeout(() => {
      const autoSaveProgress = async () => {
        try {
          setIsSaving(true);
          await saveFormProgress(formData.email, currentStep, formData);
          setLastSaved(new Date());
        } catch (err) {
          console.error('Failed to auto-save progress:', err);
        } finally {
          setIsSaving(false);
        }
      };
      
      autoSaveProgress();
    }, 2000); 
    
    return () => clearTimeout(saveTimeout);
  }, [formData, currentStep, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateCurrentStep = () => {
    const validationResult = validateFormStep(currentStep, formData);
    
    if (!validationResult.valid) {
      setError(validationResult.message);
      return false;
    }
    
    setStepsValid({
      ...stepsValid,
      [`step${currentStep}`]: true
    });
    
    setError('');
    return true;
  };

  const nextStep = async () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    try {
      setIsSaving(true);
      await saveFormProgress(formData.email, currentStep, formData);
      setLastSaved(new Date());
      setCurrentStep(currentStep + 1);
    } catch (err) {
      setError('Failed to save progress. Please try again.');
      console.error('Error saving progress:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // First save progress for the final step
      await saveFormProgress(formData.email, currentStep, formData);
      
      // Then finalize the application from draft to submitted
      await finalizeApplication(formData.email);
      
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading && !lastSaved) {
    return (
      <div className="register-container">
        <div className="loading-indicator">Loading your application...</div>
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="register-container">
        <div className="register-form">
          <h2>Application Already Submitted</h2>
          <p>You have already submitted an application with this email address.</p>
          <button onClick={handleSignOut} className="submit-button">Sign Out</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="register-container">
        <div className="register-form">
          <h2>Application Submitted Successfully!</h2>
          <p>Thank you for your application. We will contact you shortly.</p>
          <button onClick={handleSignOut} className="submit-button">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Digi 2025 Registration Form</h2>
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${stepsValid.step1 ? 'completed' : ''}`}>1. Personal Info</div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${stepsValid.step2 ? 'completed' : ''}`}>2. Contact Info</div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${stepsValid.step3 ? 'completed' : ''}`}>3. Essays</div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {isSaving && <div className="save-indicator">Saving...</div>}
        {lastSaved && <div className="last-saved">Last saved: {new Date(lastSaved).toLocaleTimeString()}</div>}
        
        <form onSubmit={(e) => e.preventDefault()}>
          {currentStep === 1 && (
            <Step1PersonalInfo 
              formData={formData} 
              handleChange={handleChange} 
            />
          )}
          
          {currentStep === 2 && (
            <Step2ContactInfo 
              formData={formData} 
              handleChange={handleChange} 
            />
          )}
          
          {currentStep === 3 && (
            <Step3Essays 
              formData={formData} 
              handleChange={handleChange} 
            />
          )}
          
          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="nav-button prev-button" 
                onClick={prevStep}
              >
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button" 
                className="nav-button next-button" 
                onClick={nextStep}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Next'}
              </button>
            ) : (
              <button 
                type="button" 
                className="submit-button" 
                onClick={handleSubmit}
                disabled={loading || isSaving}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
          
          <div className="sign-out-container">
            <button type="button" onClick={handleSignOut} className="cancel-button">
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;