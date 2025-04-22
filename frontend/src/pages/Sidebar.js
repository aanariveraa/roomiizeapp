import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";


const Sidebar = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <div className="app-layout" style={{ display: "flex", height: "100vh" }}>
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "Open Menu" : "Close Menu"}
        </button>
        {!collapsed && (
          <ul className="sidebar-links">
            <li><NavLink to="/home" className={({ isActive }) => (isActive ? "active-link" : "")}>Home</NavLink></li>
            <li><NavLink to="/design"  className={({ isActive }) => (isActive ? "active-link" : "")}>Create New Design</NavLink></li>
            <li><NavLink to="/myDesigns"  className={({ isActive }) => (isActive ? "active-link" : "")}>My Designs</NavLink></li>
            <li><NavLink to="/chat-rooms"  className={({ isActive }) => (isActive ? "active-link" : "")}>Chat Rooms</NavLink></li>
            <li><NavLink to="/profile"  className={({ isActive }) => (isActive ? "active-link" : "")}>Profile Settings</NavLink></li>
                    
          <li>
            <Button variant="danger" className="button" onClick={handleLogout}>
              Sign Out
            </Button>
          </li>
          </ul>
          
        )}
      </div>
      <div className="main-content" style={{ marginLeft: collapsed ? "80px" : "250px" }}>
        {React.cloneElement(children, { sidebarCollapsed: collapsed })}
      </div>
    </div>
  );
};

export default Sidebar;

