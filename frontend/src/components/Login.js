import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Alert } from "react-bootstrap";
import { Button } from "react-bootstrap";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../context/UserAuthContext";
import Rooms3d from '../rooms/rooms3d';
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { logIn, googleSignIn } = useUserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await logIn(email, password);
      navigate("/home"); // Redirect to homepage after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  //GOOGLE SIGN UP 
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      navigate("/home");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
    <div id="main-wrapper">
    <div className="p-4 box">
      <h2 className="mb-3">Roomiize</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control
            type="email"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button variant="primary" type="Submit">
            Log In
          </Button>
        </div>
      </Form>
      <hr />
      <div>
        <GoogleButton
          className="g-btn"
          type="dark"
          onClick={handleGoogleSignIn}
        />
      </div>
      <div>
      Don't have an account? <Link to="/signup">Sign up</Link>
    </div>
    </div>

    <div className="rs">
      {/* <img src= {'https://blenderartists.org/uploads/default/original/4X/a/6/1/a61d064bb4948be440e86580f3d659f77a37989b.jpeg'%7D/> */}

      <img src= {'https://www.blendernation.com/wp-content/uploads/2023/03/gtddddddddddddhssssuddmfm.png'}/>
      </div>
    </div>
  </>
  );
};
export default Login;