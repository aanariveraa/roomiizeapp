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
      <div className="sidebar">
        <h3 className="sidebar-title">Menu</h3>
        <ul className="sidebar-links">
           {/* <li>
                <Link to="/defaultRooms"> OG </Link>
            </li>*/}
            <li>
                <Link to="/design"> Create New Design</Link>
            </li>
            <li>
                <Link to="/myDesigns">My Rooms</Link>
            </li>
            <li>
                <Link to="/chat-rooms">Chats</Link>
            </li>
            <li>
              <Link to="/profile">Profile Settings</Link>
            </li>
          
          <li>
            <Button variant="danger" className="button" onClick={handleLogout}>
              Sign Out
            </Button>
          </li>
        </ul>
      </div>

      <div className="content">
          <h2>Welcome, {user.displayName}!</h2>
      </div>
    </div>
  );
};

export default Home;
