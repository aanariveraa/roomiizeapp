import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/Home.css"; 

const Home = () => {
  const { user, logOut } = useUserAuth();
  const navigate = useNavigate();

  // Handle Logout
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
      <div className="content">
          <h2>Welcome, {user.displayName}!</h2>
      </div>
    </div>
  );
};

export default Home;