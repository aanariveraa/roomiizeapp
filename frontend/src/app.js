import { Container, Row, Col } from "react-bootstrap";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./app.css";
import Home from "./pages/Home";
//rooms
import Rooms3d from './rooms/rooms3d';  // rooms
import RoomSelection from "./rooms/RoomSelection";  //room selection
import DefaultRooms from "./rooms/defaultRooms";    //og rooms 
import CreateRooms from "./Designs/createRooms";   //user creates rooms
import myDesigns from './Designs/MyDesigns';        //users saves rooms 
//
import Profile from './pages/Profile';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserAuthProvider } from "./context/UserAuthContext";
import LandingPage from "./pages/LandingPage";
import MyDesigns from "./Designs/MyDesigns";

function App() {
  return (
    <BrowserRouter>
    <Container style={{ width: "800px" }}>
      <Row>
        <Col>
          <UserAuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
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
                  path="/defaultRooms"
                  element={
                    <ProtectedRoute>
                      < DefaultRooms/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rooms3d"
                  element={
                    <ProtectedRoute>
                      < Rooms3d/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/createRooms"
                  element={
                    <ProtectedRoute>
                      <CreateRooms />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/design"
                  element={
                    <ProtectedRoute>
                      <RoomSelection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/myDesigns"
                  element={
                    <ProtectedRoute>
                      < MyDesigns/>
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
