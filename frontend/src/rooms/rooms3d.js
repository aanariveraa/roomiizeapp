import React, { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
  useGLTF,
  Html,
  TransformControls
} from "@react-three/drei";
import "./rooms.css";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import "./rooms.css";

// Preload Room Models (Static Assets)
// These models are stored in your cloud storage (e.g., Firebase Cloud Storage)
// and only referenced via URLs in your code and metadata in Firestore.
useGLTF.preload("/models/suite1.glb");
useGLTF.preload("/models/suite2.glb");
useGLTF.preload("/models/suite3.glb");

// Preload Object Models (Static Assets)
useGLTF.preload("/objects/test.glb");

// Object Options (Static Data)
// Here you might store metadata (ID, name, path, preview image) for each object.
// In a real app, you could fetch these from Firestore.
const objectOptions = [
  { id: 1, name: "test", modelPath: "/objects/test.glb", image: "/images/test.png" }
];

// Room List (Static Data)
// These objects represent available rooms with their titles and 3D model paths.
// In production, you may store room metadata in Firestore and only the file URLs in Cloud Storage.
const roomsData = [
  { id: 1, title: "Suite 1", modelPath: "/models/suite1.glb" },
  { id: 2, title: "Suite 2", modelPath: "/models/suite2.glb" },
  { id: 3, title: "Suite 3", modelPath: "/models/suite3.glb" }
];

const RoomNav = ({ selectedRoom, onSelectRoom }) => (
  <div className="room-nav-container">
    {roomsData.map((room) => (
      <button
        key={room.id}
        className={`room-nav-item ${selectedRoom.id === room.id ? "active" : ""}`}
        onClick={() => {
          // When a room is selected, you can also save this selection to Firestore
          // under the user's profile to persist their choice.
          onSelectRoom(room);
        }}
      >
        {room.title}
      </button>
    ))}
  </div>
);

// Component for rendering the suite 3D model (room)
const SuiteModel = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={[2, 2, 2]} />;
};

// Component for rendering and controlling 3D objects in the room
const ObjectModel = ({
  object,
  isSelected,
  onSelect,
  onTransform,
  rotateObject,
  onDragStart,
  onDragEnd,
  onRemoveObject
}) => {
  const { scene } = useGLTF(object.modelPath);
  return (
    <>
      <TransformControls
        mode="translate"
        enabled={isSelected}
        onMouseDown={(e) => { if (e && e.stopPropagation) e.stopPropagation(); }}
        onDragStart={(e) => { if (onDragStart) onDragStart(); }}
        onDragEnd={(e) => {
          if (onDragEnd) onDragEnd();
          // Capture the object's current position and rotation after a drag ---------
          const pos = e.target.object.position;
          const rot = e.target.object.rotation;
          // Save transformation state (this data can be stored in Firestore as part of the user's room configuration)-----------
          onTransform(object, [pos.x, pos.y, pos.z], [rot.x, rot.y, rot.z]);
        }}
      >
        <primitive
          object={scene}
          scale={[1, 1, 1]}
          position={object.position}
          rotation={object.rotation}
          onPointerDown={(e) => {
            e.stopPropagation();
            // When an object is selected, store its reference (UID, position, rotation) in state. --------------------
            onSelect(object);
          }}
        />
      </TransformControls>
      {isSelected && (
        <Html position={[0, 1.5, 0]} style={{ pointerEvents: "auto" }}>
          <div className="object-popup">
            <button onClick={() => rotateObject(object, -15)}>
              <img src="/icons/rotate_left.svg" alt="Rotate Left" />
            </button>
            <button onClick={() => rotateObject(object, 15)}>
              <img src="/icons/rotate_right.svg" alt="Rotate Right" />
            </button>
            <button onClick={onRemoveObject}>
              <img src="/icons/remove.svg" alt="Remove" />
            </button>
          </div>
        </Html>
      )}
    </>
  );
};

// Panel for selecting and adding new objects to the room
const ObjectSelectionPanel = ({ onAddObject }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`object-selection-panel ${isOpen ? "open" : ""}`}>
      <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close" : "Objects"}
      </button>
      {isOpen && (
        <div className="object-grid">
          {objectOptions.map((object) => (
            <div key={object.id} className="object-item">
              <img src={object.image} alt={object.name} className="object-preview-image" />
              <button onClick={() => {
                // Add object to the room; you can later save this state to Firestore as a JSON object. ------------
                onAddObject(object);
              }}>
                Place Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function TopNavbar() {
  const { logOut } = useUserAuth();
  
  const handleLogout = async () => {
    try {
      await logOut();
      // Optionally, navigate("/login") after logout
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Navbar bg="light" expand="md" className="mb-2">
      <Container fluid>
        <Navbar.Brand>My 3D Rooms</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-collapse" />
        <Navbar.Collapse id="navbar-collapse">
          <Nav className="ms-auto">
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// Control Panel for zoom, display, and control mode toggling
const ControlPanel = ({
  onZoomIn,
  onZoomOut,
  displayMode,
  setDisplayMode,
  controlMode,
  toggleControlMode
}) => (
  <div className="control-panel">
    <button onClick={onZoomIn} className="zoom-button">
      <img src="/icons/zoom_in.svg" alt="Zoom In" />
    </button>
    <button onClick={onZoomOut} className="zoom-button">
      <img src="/icons/zoom_out.svg" alt="Zoom Out" />
    </button>
    <div className="display-toggle-tabs">
      <button className={`display-tab ${displayMode === "3D" ? "active" : ""}`}
              onClick={() => setDisplayMode("3D")}>
        3D
      </button>
      <button className={`display-tab ${displayMode === "2D" ? "active" : ""}`}
              onClick={() => setDisplayMode("2D")}>
        2D
      </button>
    </div>
    <button onClick={toggleControlMode}
            className={`control-button ${controlMode === "person" ? "active" : ""}`}>
      <img src="/icons/person_view.svg" alt="Person View" className="person-view-icon" />
      Person View
    </button>
  </div>
);

const DefaultRooms = () => {
  const { logOut } = useUserAuth();
  // selectedRoom holds the static data for the chosen room (its id and model path).
  // You can persist this choice in Firestore under the user's settings.
  const [selectedRoom, setSelectedRoom] = useState(roomsData[0]);
  
  // roomObjects is a dictionary keyed by room id. Each value is an array of objects (user edits).
  // This is where you store user modifications like object positions, rotations, etc.
  // Later, you could serialize this state as JSON and save it in Firestore.
  const [roomObjects, setRoomObjects] = useState({});
  
  // selectedObject holds the currently selected object for editing.
  // This could be saved as part of the temporary session state.
  const [selectedObject, setSelectedObject] = useState(null);
  
  // displayMode and controlMode manage how the room is viewed.
  const [displayMode, setDisplayMode] = useState("3D");
  const [controlMode, setControlMode] = useState("orbit");
  
  // zoomFactor allows scaling of the view and can be saved in user preferences if needed.
  const [zoomFactor, setZoomFactor] = useState(1);
  
  // isDragging manages the state during object drag operations.
  const [isDragging, setIsDragging] = useState(false);

  // Reference for the camera. You could also save camera settings per room if desired.
  const cameraRef = useRef();

  // addObject creates a new object instance with default position and rotation.
  // Consider saving the UID, position, and rotation in Firestore as part of the user's room config.
  const addObject = (object) => {
    const newObject = {
      ...object,
      uid: Date.now() + Math.random(), // Unique identifier for each instance
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    };
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newObject]
    }));
  };

  // transformObject updates the object's transformation (position & rotation)
  // Each transformation change can be saved immediately or batched and then saved to Firestore.
  const transformObject = (object, position, rotation) => {
    const updated = { ...object, position, rotation };
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: prev[selectedRoom.id].map((obj) =>
        obj.uid === object.uid ? updated : obj
      )
    }));
    // Update selectedObject state if it matches the transformed object.
    if (selectedObject && selectedObject.uid === object.uid) {
      setSelectedObject(updated);
    }
  };

  // rotateObject handles incremental rotation adjustments.
  // The new rotation data should be saved along with other transformation data.
  const rotateObject = (object, angle) => {
    const currentRotation = object.rotation || [0, 0, 0];
    const newY = currentRotation[1] + (angle * Math.PI) / 180;
    transformObject(object, object.position, [currentRotation[0], newY, currentRotation[2]]);
  };

  // removeObject deletes the currently selected object.
  // This change can be immediately reflected in your stored JSON configuration.
  const removeObject = () => {
    if (!selectedObject) return;
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: (prev[selectedRoom.id] || []).filter(
        (obj) => obj.uid !== selectedObject.uid
      )
    }));
    setSelectedObject(null);
  };
    
  // Log out the user and optionally clear local session data.
  const handleLogout = async () => {
    try {
      await logOut();
      // Optionally, navigate to login page or clear local room state.
    } catch (error) {
      console.error("logout error:", error);
    }
  };

  const navigate = useNavigate();

  // Function to navigate back to the previous page.
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="App">
      <button className="back-button" onClick={goBack}>
        Back
      </button>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <RoomNav
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom} // When a new room is selected, you might also want to load its configuration from Firestore.
      />
      <ObjectSelectionPanel onAddObject={addObject} />
      <div className="model-viewer">
        <Canvas onPointerMissed={() => { if (!isDragging) setSelectedObject(null); }}>
          {displayMode === "3D" ? (
            <PerspectiveCamera
              makeDefault
              ref={cameraRef}
              position={
                controlMode === "person"
                  ? [0, 1.6, 5 * zoomFactor]
                  : [0, 0, 5 * zoomFactor]
              }
              fov={75}
            />
          ) : (
            <OrthographicCamera
              makeDefault
              ref={cameraRef}
              position={[0, 50, 0]}
              zoom={50 * zoomFactor}
              near={0.1}
              far={1000}
            />
          )}
          <ambientLight intensity={1.0} />
          <pointLight position={[10, 10, 10]} />
          <Suspense fallback={<Html center><div>Loading 3D Model...</div></Html>}>
            {/* Render the room's 3D model */}
            <SuiteModel modelPath={selectedRoom.modelPath} />
            {/* Render all objects for the current room */}
            {(roomObjects[selectedRoom.id] || []).map((obj) => (
              <ObjectModel
                key={obj.uid}
                object={obj}
                isSelected={selectedObject && selectedObject.uid === obj.uid}
                onSelect={setSelectedObject}
                onTransform={transformObject}
                rotateObject={rotateObject}
                onRemoveObject={removeObject}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              />
            ))}
          </Suspense>
          <OrbitControls enabled={!selectedObject} />
        </Canvas>
      </div>
      <ControlPanel
        onZoomIn={() => setZoomFactor((prev) => Math.max(prev * 0.9, 0.5))}
        onZoomOut={() => setZoomFactor((prev) => prev / 0.9)}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        controlMode={controlMode}
        toggleControlMode={() =>
          setControlMode(controlMode === "orbit" ? "person" : "orbit")
        }
      />
    </div>
  );
};

export default DefaultRooms;