import { Container, Row, Col } from "react-bootstrap";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./app.css";
import Home from "./pages/Home";
import Rooms3d from './rooms/rooms3d';
import Profile from './pages/Profile';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserAuthProvider } from "./context/UserAuthContext";
import LandingPage from "./pages/LandingPage";
import ChatRoom from "./chats/ChatRoom";
import CreateChatRoom from "./chats/CreateChatRoom";
import ChatRoomsPage from "./chats/ChatRoomsPage";

function App() {
  return (
    <BrowserRouter>
    <Container style={{ width: "500px" }}>
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
                  path="/rooms3d"
                  element={
                    <ProtectedRoute>
                      <Rooms3d />
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
                  path="/create-chat-room"
                  element={
                    <ProtectedRoute>
                      <CreateChatRoom/>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/chat-rooms"
                  element={
                    <ProtectedRoute>
                      <ChatRoomsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:chatId"  
                  element={
                    <ProtectedRoute>
                      <ChatRoom />
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
