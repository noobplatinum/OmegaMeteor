import React, { useState } from 'react';
import { uploadCV, uploadPhoto } from '../formServices';

const Step2ContactInfo = ({ formData, handleChange }) => {
  const [cvFile, setCvFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState({
    cv: false,
    photo: false
  });
  const [uploadError, setUploadError] = useState({
    cv: '',
    photo: ''
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'cv') {
      if (file.type !== 'application/pdf') {
        setUploadError({...uploadError, cv: 'Please upload a PDF file'});
        return;
      }
      setCvFile(file);
      setUploadError({...uploadError, cv: ''});
    } else {
      if (!file.type.startsWith('image/')) {
        setUploadError({...uploadError, photo: 'Please upload an image file'});
        return;
      }
      setPhotoFile(file);
      setUploadError({...uploadError, photo: ''});
    }
  };

  const handleUpload = async (type) => {
    if (type === 'cv' && !cvFile) {
      setUploadError({...uploadError, cv: 'Please select a file first'});
      return;
    }
    if (type === 'photo' && !photoFile) {
      setUploadError({...uploadError, photo: 'Please select a file first'});
      return;
    }

    setUploading({...uploading, [type]: true});
    setUploadError({...uploadError, [type]: ''});

    try {
      let url;
      if (type === 'cv') {
        url = await uploadCV(cvFile);
        handleChange({ target: { name: 'cv_url', value: url } });
        setCvFile(null);
      } else {
        url = await uploadPhoto(photoFile);
        handleChange({ target: { name: 'foto_url', value: url } });
        setPhotoFile(null);
      }
    } catch (error) {
      setUploadError({
        ...uploadError, 
        [type]: error.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading({...uploading, [type]: false});
    }
  };

  return (
    <div className="form-step">
      <h3>Contact Information</h3>
      
      <div className="form-group file-upload">
        <label htmlFor="cv">CV (PDF only) *</label>
        <div className="file-upload-container">
          <input
            type="file"
            id="cv"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, 'cv')}
            className="file-input"
          />
          <div className="file-upload-box">
            {cvFile ? (
              <>
                <p>{cvFile.name}</p>
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => handleUpload('cv')}
                  disabled={uploading.cv}
                >
                  {uploading.cv ? 'Uploading...' : 'Upload'}
                </button>
              </>
            ) : (
              <>
                <p>{formData.cv_url ? 'CV uploaded' : 'Drag & drop or click to select a PDF'}</p>
                {!formData.cv_url && <span className="upload-icon">📄</span>}
              </>
            )}
          </div>
          {uploadError.cv && <p className="upload-error">{uploadError.cv}</p>}
          {formData.cv_url && (
            <div className="file-preview">
              <p>CV uploaded successfully ✓</p>
              <a href={formData.cv_url} target="_blank" rel="noopener noreferrer">View CV</a>
              <button
                type="button"
                className="remove-file"
                onClick={() => handleChange({ target: { name: 'cv_url', value: '' } })}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="form-group file-upload">
        <label htmlFor="photo">Profile Photo *</label>
        <div className="file-upload-container">
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'photo')}
            className="file-input"
          />
          <div className="file-upload-box">
            {photoFile ? (
              <>
                <p>{photoFile.name}</p>
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => handleUpload('photo')}
                  disabled={uploading.photo}
                >
                  {uploading.photo ? 'Uploading...' : 'Upload'}
                </button>
              </>
            ) : (
              <>
                <p>{formData.foto_url ? 'Photo uploaded' : 'Drag & drop or click to select an image'}</p>
                {!formData.foto_url && <span className="upload-icon">🖼️</span>}
              </>
            )}
          </div>
          {uploadError.photo && <p className="upload-error">{uploadError.photo}</p>}
          {formData.foto_url && (
            <div className="file-preview">
              <img src={formData.foto_url} alt="Profile preview" className="photo-preview" />
              <button
                type="button"
                className="remove-file"
                onClick={() => handleChange({ target: { name: 'foto_url', value: '' } })}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="ig_username">Instagram Username *</label>
        <input
          type="text"
          id="ig_username"
          name="ig_username"
          value={formData.ig_username}
          onChange={handleChange}
          placeholder="@username"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="line_username">LINE ID *</label>
        <input
          type="text"
          id="line_username"
          name="line_username"
          value={formData.line_username}
          onChange={handleChange}
          placeholder="LINE ID"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="discord_username">Discord Username *</label>
        <input
          type="text"
          id="discord_username"
          name="discord_username"
          value={formData.discord_username}
          onChange={handleChange}
          placeholder="username#0000"
          required
        />
      </div>
    </div>
  );
};

export default Step2ContactInfo;