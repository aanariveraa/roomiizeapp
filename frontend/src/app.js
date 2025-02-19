import { Container, Row, Col } from "react-bootstrap";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./app.css";
import Home from "./components/Home";
import Rooms3d from './rooms/rooms3d';
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserAuthProvider } from "./context/UserAuthContext";

function App() {
  return (
    <BrowserRouter>
    <Container style={{ width: "500px" }}>
      <Row>
        <Col>
          <UserAuthProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                    path="/home" 
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    } 
                />
                <Route
                  path="/rooms3d"
                  element={
                    <ProtectedRoute>
                      <Rooms3d />
                    </ProtectedRoute>
                  }
                />
            </Routes>
          </UserAuthProvider>
        </Col>
      </Row>
    </Container>
    </BrowserRouter>
  );
}

export default App;
