import React from "react";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom"; 
import "../app.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar expand="lg" bg="light" variant="light" fixed="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">ROOMIIZE</Navbar.Brand>
          <Nav className="ms-auto">
            <Link to="/login">
              <Button className="log-in-button"variant="primary">Log In</Button>
            </Link>
          </Nav>
        </Container>
      </Navbar>

      <div className="landing-page-content">
        <h1>Welcome to ROOMIIZE</h1>
      </div>
    </div>
  );
};

export default LandingPage;
