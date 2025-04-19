import { supabaseClient } from './supabaseClient';

// File upload functions using Supabase Storage
export const uploadFile = async (file, bucketName) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: urlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error uploading file to ${bucketName}:`, error);
    throw error;
  }
};

export const uploadCV = async (file) => {
  return uploadFile(file, 'cv-files');
};

export const uploadPhoto = async (file) => {
  return uploadFile(file, 'profile-photos');
};

// Application submission function
export const submitApplication = async (formData) => {
  try {
    const { data, error } = await supabaseClient
      .from('applicants')
      .insert([formData])
      .select();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

// Check if application already exists
export const checkExistingApplication = async (email) => {
  try {
    const { data, error } = await supabaseClient
      .from('applicants')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error checking existing application:', error);
    throw error;
  }
};

// Function to save form progress
export const saveFormProgress = async (email, stepNumber, formData) => {
  try {
    // First check if a draft already exists for this email
    const { data: existingData, error: fetchError } = await supabaseClient
      .from('form_drafts')
      .select('*')
      .eq('email', email)
      .single();
    
    // Set the completion status for the current step
    const completionStatus = {};
    completionStatus[`step${stepNumber}_completed`] = true;
    
    // Combine form data with completion status
    const combinedData = {
      ...formData,
      ...completionStatus,
      email,
      last_updated: new Date(),
      is_draft: true
    };
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // No existing draft, create new entry
      const { data, error } = await supabaseClient
        .from('form_drafts')
        .insert([combinedData])
        .select();
      
      if (error) throw error;
      return data;
    } else {
      // Update existing draft
      const { data, error } = await supabaseClient
        .from('form_drafts')
        .update(combinedData)
        .eq('email', email)
        .select();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving form progress:', error);
    throw error;
  }
};

// Function to retrieve saved form progress
export const getFormProgress = async (email) => {
  try {
    const { data, error } = await supabaseClient
      .from('form_drafts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error retrieving form progress:', error);
    throw error;
  }
};

// Function to validate form steps
export const validateFormStep = (stepNumber, formData) => {
  let requiredFields = [];
  
  // Define required fields for each step
  switch (stepNumber) {
    case 1:
      requiredFields = ['nama', 'email', 'npm', 'angkatan'];
      break;
    case 2:
      requiredFields = ['cv_url', 'foto_url', 'ig_username', 'line_username', 'discord_username'];
      break;
    case 3:
      requiredFields = ['question_1', 'question_2', 'question_3'];
      break;
    default:
      return { valid: false, message: 'Invalid step number' };
  }
  
  // Check each required field
  const missingFields = requiredFields.filter(field => 
    !formData[field] || formData[field].trim() === ''
  );
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields
    };
  }
  
  return { valid: true };
};

// Function to finalize application from draft
export const finalizeApplication = async (email) => {
  try {
    // Get the draft
    const { data: draftData, error: draftError } = await supabaseClient
      .from('form_drafts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (draftError) {
      if (draftError.code === 'PGRST116') {
        throw new Error('No draft found. Please save your progress first.');
      }
      throw draftError;
    }
    
    // Check if all steps are completed
    if (!draftData.step1_completed || !draftData.step2_completed || !draftData.step3_completed) {
      throw new Error('Please complete all steps before finalizing your application.');
    }
    
    // Remove the draft-specific fields
    const { is_draft, step1_completed, step2_completed, step3_completed, last_updated, ...applicationData } = draftData;
    
    // Insert into final applications table
    const { data, error } = await supabaseClient
      .from('applicants')
      .insert([applicationData])
      .select();
    
    if (error) throw error;
    
    // Delete the draft
    await supabaseClient
      .from('form_drafts')
      .delete()
      .eq('email', email);
    
    return data;
  } catch (error) {
    console.error('Error finalizing application:', error);
    throw error;
  }
};