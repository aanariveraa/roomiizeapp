import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Alert, Button, InputGroup} from "react-bootstrap";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../context/UserAuthContext";
import "../styles/Login.css";
import { Eye, EyeSlash } from "react-bootstrap-icons"; // Import icons

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password visibility
  const [error, setError] = useState("");
  const { logIn, googleSignIn } = useUserAuth();
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  //
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

  //GOOGLE SIGN IN
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
    <div className="login-page"> 
      <div className="login-box">
        <h2 className="mb-3">ROOMIIZE</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          {/* Password Field with Eye Icon */}
              <Form.Group className="mb-3" controlId="formBasicPassword">
                  <InputGroup>
                      <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      <InputGroup.Text onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
                          {showPassword ? <EyeSlash /> : <Eye />}
                      </InputGroup.Text>
                </InputGroup>
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
              className="g-btn" type="dark" 
              onClick={handleGoogleSignIn} 
          />
        </div>

        <div>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
