import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/Home.css"; 
import welcomeAnim from "../components/welcome.json"; 
import Lottie from "lottie-react";


const Home = () => {
  const { user, logOut } = useUserAuth();
  const navigate = useNavigate();

  // Handle Logoutf
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.log("Logout Error:", error.message);
    }
  };

  // sidebar for users to navigate between pages
  return (
    <div className="home-container">
      <div className="home-content-wrapper">
        <div className="left-content">
          <h2>Welcome, {user.displayName}!</h2>
        </div>
        <div className="right-lottie">
          <Lottie animationData={welcomeAnim} loop={true} autoplay={true} />
        </div>
      </div>
    </div>
  );
};

export default Home;