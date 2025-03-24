import { useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Form, Alert, InputGroup } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons"; // Import Eye icons
import "../styles/SignUp.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); 

  const [error, setError] = useState("");
  const { signUp } = useUserAuth(); 
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  //Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signUp(email, password, name);

      // Redirect to homepage after successful signup
      navigate("/home");

    } catch (err) {
      setError(err.message);
    }
  };

  return (

    <div className="SignUp-Page">
      <div className="SignUp-box">
        <h2 className="mb-3"> ROOMIIZE</h2>
        <h2 className="mb-3">Sign Up</h2> 
        
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Control
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              required
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
              Sign up
            </Button>
          </div>
        </Form>

        <div className="mt-3">
        Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;