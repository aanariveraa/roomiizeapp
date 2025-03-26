import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { Navbar, Container, Nav, Button} from "react-bootstrap";
import "../styles/roomSelection.css";
import { getFileURL } from "../services/firebaseService"; //

const RoomSelection = () => {
  const navigate = useNavigate();
  const [roomsData, setRoomsData] = useState([]);   // roomdata

  useEffect(() => {
    //fetching from STORAGE API using function from firebaseService 
    async function fetchSuiteURLs() {
      try {
        const suite1Url = await getFileURL("Suites", "suite1");
        const suite2Url = await getFileURL("Suites", "suite2");
        const suite3Url = await getFileURL("Suites", "suite3");
        setRoomsData([
          { type: 1, title: "Suite 1", modelPath: suite1Url, image: "/images/suite1.png" },
          { type: 2, title: "Suite 2", modelPath: suite2Url, image: "/images/suite2.png" },
          { type: 3, title: "Suite 3", modelPath: suite3Url, image: "/images/suite3.png" },
        ]);

      } catch (error) {
        console.error("Error fetching suite URLs:", error);
      }
    }
    fetchSuiteURLs();
  }, []);


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
          <div  key={room.type} className="room-card" onClick={() => handleRoomSelect(room)}>
            <img src={room.image} alt={room.title} className="room-image" />
            <div className="room-title">{room.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSelection;