import React from 'react';

const Step1PersonalInfo = ({ formData, handleChange }) => {
  return (
    <div className="form-step">
      <h3>Step 1: Personal Information</h3>
      
      <div className="form-group">
        <label htmlFor="nama">Full Name</label>
        <input
          type="text"
          id="nama"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          readOnly
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="npm">NPM (Student ID)</label>
        <input
          type="text"
          id="npm"
          name="npm"
          value={formData.npm}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="angkatan">Angkatan (Year)</label>
        <select
          id="angkatan"
          name="angkatan"
          value={formData.angkatan}
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
        </select>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;