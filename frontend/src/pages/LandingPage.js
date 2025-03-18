import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* ✅ Hero Section */}
      <div className="hero-section">
        <h1 className="hero-text">Welcome to ROOMIIZE</h1>
        <p className="hero-subtext">
          The easiest way to design your dream dorm space.
        </p>
        <Link to="/signup">
          <button className="get-started-btn">Get Started</button>
        </Link>
      </div>

      {/* ✅ Scrollable Sections Below */}
      <div className="section">
        <h2>Customize Your Room</h2>
        <p>Drag & drop furniture, personalize layouts, and optimize space.</p>
      </div>

      <div className="section">
        <h2>Collaborate With Roommates</h2>
        <p>Plan together in real-time with shared whiteboards & voting.</p>
      </div>

      <div className="section">
        <h2>Find The Best Deals</h2>
        <p>Get AI-powered furniture recommendations within your budget.</p>
      </div>
    </div>
  );
};

export default LandingPage;
