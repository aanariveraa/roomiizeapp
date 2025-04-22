import React from "react";
import Lottie from "lottie-react";
import "./StepSection.css";

// Import your Lottie animations from the components folder
import anim1 from "../components/anim1.json";
import anim2 from "../components/anim2.json";
import anim3 from "../components/anim3.json";
import anim4 from "../components/anim4.json";

const steps = [
  { title: "Step 1", description: "Sign up and create your account.", animation: anim1 },
  { title: "Step 2", description: "Choose your dorm layout.", animation: anim3 },
  { title: "Step 3", description: "Customize with furniture & style.", animation: anim2 },
  { title: "Step 4", description: "Collaborate with your roommate!", animation: anim4 } 
];

const StepSection = () => {
  return (
    <div className="step-container">
      {steps.map((step, index) => (
        <div key={index} className="step-card" data-aos="fade-up" data-aos-delay={index * 100}>
          <div className="step-animation">
            <Lottie animationData={step.animation} loop={true} />
          </div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      ))}
    </div>
  );
};

export default StepSection;
