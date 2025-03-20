import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { Navbar, Container, Nav, Button} from "react-bootstrap";
import "../styles/roomSelection.css";

const roomsData = [
  { id: 1, title: "Suite 1", modelPath: "/models/suite1.glb", image: "/images/suite1.png" },
  { id: 2, title: "Suite 2", modelPath: "/models/suite2.glb", image: "/images/suite2.png" },
  { id: 3, title: "Suite 3", modelPath: "/models/suite3.glb", image: "/images/suite3.png" }
];

const RoomSelection = () => {
  const navigate = useNavigate();

  const handleRoomSelect = (room) => {
    // Redirect to the room editing page, passing the selected room info in state.
    navigate("/createRooms", { state: { selectedRoom: room } });
  };

  
  return (
    <div className="room-selection-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h2>Select a Room to Design</h2>
      <div className="room-grid">
        {roomsData.map((room) => (
          <div key={room.id} className="room-card" onClick={() => handleRoomSelect(room)}>
            <img src={room.image} alt={room.title} className="room-image" />
            <div className="room-title">{room.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSelection;