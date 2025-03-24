import React from 'react';
import './StepSection.css';

const StepsSection = () => {
  return (
    <div className="steps-container">
      <div className="step">
        <h2>Step 1</h2>
        <p>Choose your room layout.</p>
      </div>
      <div className="step">
        <h2>Step 2</h2>
        <p>Select furniture and decor.</p>
      </div>
      <div className="step">
        <h2>Step 3</h2>
        <p>Finalize and share your design.</p>
      </div>
    </div>
  );
};

export default StepsSection;
