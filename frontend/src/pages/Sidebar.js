import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const Sidebar = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logOut } = useUserAuth();
  const [onlineUsers, setOnlineUsers] = useState([]); //presence active or not
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

  // Fetch online users
  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("isOnline", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const online = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOnlineUsers(online);
    });

    return () => unsubscribe();
  }, []);


  return (
    <div className="app-layout" style={{ display: "flex", height: "100vh" }}>
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "☰ Menu" : "✖ Close Menu"}
        </button>
  
        {!collapsed && (
          <>
            <ul className="sidebar-links">
              <li><NavLink to="/home" className={({ isActive }) => (isActive ? "active-link" : "")}>Home</NavLink></li>
              <li><NavLink to="/design" className={({ isActive }) => (isActive ? "active-link" : "")}>Create New Design</NavLink></li>
              <li><NavLink to="/myDesigns" className={({ isActive }) => (isActive ? "active-link" : "")}>My Designs</NavLink></li>
              <li><NavLink to="/chat-rooms" className={({ isActive }) => (isActive ? "active-link" : "")}>Chat Rooms</NavLink></li>
              <li><NavLink to="/profile" className={({ isActive }) => (isActive ? "active-link" : "")}>Profile Settings</NavLink></li>
              <li>
                <Button variant="danger" className="button" onClick={handleLogout}>
                  Sign Out
                </Button>
              </li>
            </ul>
  
            <div className="online-users">
              <h5>Active Now</h5>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {onlineUsers.map((u) => (
                  <li key={u.id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ position: "relative", marginRight: "10px" }}>
                      <img 
                        src={(u.photoURL && u.photoURL.trim() !== "") 
                          ? u.photoURL 
                          : "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg"}                  
                        alt="Profile"
                        title="Online now"
                        style={{ width: "35px", height: "35px", borderRadius: "50%" }}
                      />
                      <span 
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: "10px",
                          height: "10px",
                          backgroundColor: "#4CAF50",
                          borderRadius: "50%",
                          border: "2px solid white",
                        }}
                      />
                    </div>
                    <span>{u.displayName || "Unnamed"}</span>
                  </li>
                ))}
              </ul>
            </div>
  
          </>
        )}
      </div>
  
      <div className="main-content" style={{ marginLeft: collapsed ? "80px" : "250px" }}>
        {React.cloneElement(children, { sidebarCollapsed: collapsed })}
      </div>
    </div>
  );
} 

export default Sidebar;
