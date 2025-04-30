import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/Home.css"; 
import welcomeAnim from "../components/welcome.json";      // Sloth
import welcomeTextAnim from "../components/welcomeText.json";  // New text animation
import Lottie from "lottie-react";

const Home = () => {
  const { logOut } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.log("Logout Error:", error.message);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content-wrapper">
        <div className="left-content">
          <Lottie animationData={welcomeTextAnim} loop={true} autoplay={true} className="welcome-lottie" />
          <p className="welcome-subtext">Let's get started.</p>
        </div>
        <div className="right-lottie">
          <Lottie animationData={welcomeAnim} loop={true} autoplay={true} />
        </div>
      </div>
    </div>
  );
};

export default Home;
