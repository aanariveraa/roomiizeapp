import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveRoomMetadata } from "../services/roomDataService";
import { searchUsersByEmail } from "../services/userService";
import { useUserAuth } from "../context/UserAuthContext";
import "../styles/createRooms.css";

function CreateRooms() {
  const { user } = useUserAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRoom = location.state?.selectedRoom;

  // Redirect if no room was selected
  useEffect(() => {
    if (!selectedRoom) {
      console.log("No room selected. Redirecting to room selection.");
      navigate("/roomSelection");
    } else {
      console.log("Selected room:", selectedRoom);
    }
  }, [selectedRoom, navigate]);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      console.log("User not authenticated. Redirecting to login.");
      navigate("/login");
    } else {
      console.log("Authenticated user:", user.email);
    }
  }, [user, navigate]);

  // Local state for room customization
  const [roomName, setRoomName] = useState(selectedRoom?.title || "");
  const [collaborators, setCollaborators] = useState([]); // collaborator objects { id, email, username }
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle searching for collaborators by email.
  const handleSearchCollaborator = async () => {
    console.log("Searching for collaborator with input:", collaboratorInput);
    if (collaboratorInput.trim() !== "" && user) {
      try {
        const results = await searchUsersByEmail(collaboratorInput.trim());
        console.log("Search results:", results);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching collaborator:", error);
      }
    } else if (!user) {
      console.warn("User is not logged in. Cannot search collaborators.");
    }
  };

  // Add collaborator from search results
  const handleAddCollaborator = (userObj) => {
    console.log("Adding collaborator:", userObj);
    if (!collaborators.some((collab) => collab.id === userObj.id)) {
      setCollaborators([...collaborators, userObj]);
      console.log("Collaborators list updated:", [...collaborators, userObj]);
    } else {
      console.log("Collaborator already added:", userObj.email);
    }
    setSearchResults([]);
    setCollaboratorInput("");
  };

  // Remove an invited collaborator.
  const handleRemoveCollaborator = (userId) => {
    console.log("Removing collaborator with ID:", userId);
    const updatedCollaborators = collaborators.filter((user) => user.id !== userId);
    console.log("Updated collaborators list:", updatedCollaborators);
    setCollaborators(updatedCollaborators);
  };

  // Create Room: save metadata then redirect.
  const handleCreateRoom = async () => {
    console.log("Creating room with roomName:", roomName, "and collaborators:", collaborators);
    setLoading(true);
    try {
      const memberIds = collaborators.map((user) => user.id);
      console.log("Member IDs to save:", memberIds);
      await saveRoomMetadata(selectedRoom.id, {
        roomName: roomName,
        membersId: memberIds,
      });
      console.log("Room metadata saved successfully.");
    } catch (error) {
      console.error("Error saving room metadata:", error);
    }
    setTimeout(() => {
      setLoading(false);
      console.log("Navigating to 3D room view with updated room info.");
      navigate("/rooms3d", {
        state: { selectedRoom: { ...selectedRoom, title: roomName, collaborators } },
      });
    }, 2000);
  };

  return (
    <div className="create-room-container">
      <button className="back-button" onClick={() => {
        console.log("Navigating back.");
        navigate(-1);
      }}>
        Back
      </button>
      <div className="room-preview">
        <img
          src={selectedRoom.image}
          alt={selectedRoom.title}
          className="room-preview-image"
        />
      </div>
      <div className="room-customization-form">
        <h2>Customize Your Room</h2>
        <div className="form-group">
          <label htmlFor="roomName">Room Name</label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => {
              console.log("Room name changed to:", e.target.value);
              setRoomName(e.target.value);
            }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="collaboratorInput">Invite Collaborators (by Email)</label>
          <div className="collaborator-input-group">
            <input
              type="email"
              id="collaboratorInput"
              placeholder="Enter collaborator email"
              value={collaboratorInput}
              onChange={(e) => {
                console.log("Collaborator input changed to:", e.target.value);
                setCollaboratorInput(e.target.value);
              }}
            />
            <button type="button" onClick={handleSearchCollaborator}>
              Search
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((userObj) => (
                <div key={userObj.id} className="search-result-item">
                  <span>
                    {userObj.email} {userObj.username && `(${userObj.username})`}
                  </span>
                  <button type="button" onClick={() => handleAddCollaborator(userObj)}> Add</button>
                </div>
              ))}
            </div>
          )}
          <div className="collaborators-list">
            {collaborators.map((userObj) => (
              <div key={userObj.id} className="collaborator-item">
                {userObj.email} {userObj.username && `(${userObj.username})`}{" "}
                <button type="button" onClick={() => handleRemoveCollaborator(userObj.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        <button
          className="create-room-button"
          onClick={handleCreateRoom}
          disabled={loading}
        >
          {loading ? "Setting Up..." : "Create Room"}
        </button>
      </div>
    </div>
  );
}

export default CreateRooms;