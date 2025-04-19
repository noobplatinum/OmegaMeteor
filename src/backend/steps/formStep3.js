import React from 'react';

const Step3Essays = ({ formData, handleChange }) => {
  return (
    <div className="form-step">
      <h3>Step 3: Essays</h3>
      
      <div className="form-group">
        <label htmlFor="question_1">What interests you most about joining Digi?</label>
        <textarea
          id="question_1"
          name="question_1"
          value={formData.question_1}
          onChange={handleChange}
          rows="3"
          placeholder="Share your interests and motivations"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="question_2">What skills can you bring to the team?</label>
        <textarea
          id="question_2"
          name="question_2"
          value={formData.question_2}
          onChange={handleChange}
          rows="3"
          placeholder="Describe your relevant skills and experiences"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="question_3">What are your expectations from this program?</label>
        <textarea
          id="question_3"
          name="question_3"
          value={formData.question_3}
          onChange={handleChange}
          rows="3"
          placeholder="Share what you hope to achieve or learn"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="question_4">Any additional information you'd like to share?</label>
        <textarea
          id="question_4"
          name="question_4"
          value={formData.question_4}
          onChange={handleChange}
          rows="3"
          placeholder="Anything else you think would be relevant to your application"
        />
      </div>
    </div>
  );
};

export default Step3Essays;