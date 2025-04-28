//
import { useEffect } from "react";
//import { setupAppCheck } from "./firebase/firebaseAppCheck";
//
import { Container, Row, Col } from "react-bootstrap";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./app.css";
import Home from "./pages/Home";

//rooms
import Rooms3d from './rooms/rooms3d';  // rooms
import RoomSelection from "./rooms/RoomSelection";  //room selection
import DefaultRooms from "./rooms/defaultRooms";
import CreateRooms from "./Designs/createRooms";   //user creates rooms
import MyDesigns from './Designs/MyDesigns';        //users saves rooms 

import Profile from './pages/Profile';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserAuthProvider } from "./context/UserAuthContext";
import LandingPage from "./pages/LandingPage";
import ChatRoom from "./chats/ChatRoom";
import CreateChatRoom from "./chats/CreateChatRoom";
import ChatRoomsPage from "./chats/ChatRoomsPage";
import Sidebar from "./pages/Sidebar";

function App() {
  /*useEffect(() => {
    setupAppCheck(); //  Calling AppCheck initialization in a safe place
  }, []);*/

  return (
    <BrowserRouter>
      <UserAuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Sidebar><Home /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/defaultRooms"
            element={
              <ProtectedRoute>
                <Sidebar><DefaultRooms /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms3d"
            element={
              <ProtectedRoute>
                <Sidebar><Rooms3d /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/createRooms"
            element={
              <ProtectedRoute>
                <Sidebar><CreateRooms /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/design"
            element={
              <ProtectedRoute>
                <Sidebar><RoomSelection /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/myDesigns"
            element={
              <ProtectedRoute>
                <Sidebar><MyDesigns /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Sidebar><Profile /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-rooms"
            element={
              <ProtectedRoute>
                <Sidebar><ChatRoomsPage /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-chat-room"
            element={
              <ProtectedRoute>
                <Sidebar><CreateChatRoom /></Sidebar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute>
                <Sidebar><ChatRoom /></Sidebar>
              </ProtectedRoute>
            }
          />
        </Routes>
      </UserAuthProvider>
    </BrowserRouter>
  );
}

export default App;

