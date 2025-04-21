import { supabaseClient } from './supabaseClient';
import bcryptjs from 'bcryptjs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

export const signInWithGoogle = async () => {
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password) => {
  try {
    if (!EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!PASSWORD_REGEX.test(password)) {
      throw new Error('Password must be at least 8 characters and include a letter and a number');
    }
    
    try {
      const { data: signInData } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInData?.user) {
        return signInData;
      }
    } catch (signInError) {
      if (!signInError.message.includes('Invalid login credentials') && 
          !signInError.message.includes('Email not confirmed')) {
        throw signInError;
      }
    }
    
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          email_confirmed: true
        }
      }
    });
    
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return await signInWithEmail(email, password);
      }
      throw error;
    }
    
    if (data?.user && !data.user.email_confirmed_at) {
      try {
        return await signInWithEmail(email, password);
      } catch (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Account created! Check your email for a confirmation link. You will be automatically signed in after confirming.');
        }
        throw signInError;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email for a confirmation link. You must confirm your email before signing in.');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

export const updatePassword = async (newPassword) => {
  try {
    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new Error('Password must be at least 8 characters and include a letter and a number');
    }
    
    const { data: authData, error: authError } = await supabaseClient.auth.updateUser({
      password: newPassword
    });
    
    if (authError) {
      throw authError;
    }
    
    if (authData.user) {
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      
      const userId = authData.user.id;
      
      try {
        const { error: dbError } = await supabaseClient
          .from('email_users')
          .update({ password_hash: hashedPassword })
          .eq('id', userId);
        
        if (dbError) {
          console.error('Error updating password hash:', dbError);
        }
      } catch (dbError) {
        console.warn('Could not update password hash in custom table:', dbError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};