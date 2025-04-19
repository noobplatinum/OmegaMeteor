import { supabaseClient } from './supabaseClient';

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