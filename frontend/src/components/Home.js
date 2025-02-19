import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";


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

  return (
    <Container className="text-center mt-5">
      <h2>Welcome, {user?.email}!</h2>

      <div className="mt-4">
        <Link to="/rooms3d">
          <Button variant="primary" className="m-2">
            Go to 3D Rooms
          </Button>
        </Link>

        <Button variant="danger" className="m-2" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </Container>
  );
};

export default Home;
