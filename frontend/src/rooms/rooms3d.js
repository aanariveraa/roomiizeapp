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

// Preload Room Models
useGLTF.preload("/models/suite1.glb");
useGLTF.preload("/models/suite2.glb");
useGLTF.preload("/models/suite3.glb");

// Preload Object Models
useGLTF.preload("/objects/test.glb");

// Object List
const objectOptions = [
  { id: 1, name: "test", modelPath: "/objects/test.glb", image: "/images/test.png" }
];

// Room List
const roomsData = [
  { id: 1, title: "Suite 1", modelPath: "/models/suite1.glb" },
  { id: 2, title: "Suite 2", modelPath: "/models/suite2.glb" },
  { id: 3, title: "Suite 3", modelPath: "/models/suite3.glb" }
];

// Room Navigation
const RoomNav = ({ selectedRoom, onSelectRoom }) => (
  <div className="room-nav-container">
    {roomsData.map((room) => (
      <button
        key={room.id}
        className={`room-nav-item ${selectedRoom.id === room.id ? "active" : ""}`}
        onClick={() => onSelectRoom(room)}
      >
        {room.title}
      </button>
    ))}
  </div>
);

// Load a Room Model
const SuiteModel = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={[2, 2, 2]} />;
};

// Load an Object Model
const ObjectModel = ({ object, isSelected, onSelect, onTransform }) => {
  const { scene } = useGLTF(object.modelPath);
  return (
    <TransformControls
      position={object.position}
      rotation={object.rotation}
      enabled={isSelected}
      onObjectChange={(e) => {
        const { position, rotation } = e.target;
        onTransform(object, [position.x, position.y, position.z], [rotation.x, rotation.y, rotation.z]);
      }}
    >
      <primitive object={scene} scale={[1, 1, 1]} onClick={() => onSelect(object)} />
    </TransformControls>
  );
};

// Object Selection Panel
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
              <button onClick={() => onAddObject(object)}>Place Item</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Control Panel
const ControlPanel = ({ onZoomIn, onZoomOut, displayMode, setDisplayMode, controlMode, toggleControlMode }) => (
  <div className="control-panel">
    <button onClick={onZoomIn} className="zoom-button">
      <img src="/icons/zoom_in.svg" alt="Zoom In" />
    </button>
    <button onClick={onZoomOut} className="zoom-button">
      <img src="/icons/zoom_out.svg" alt="Zoom Out" />
    </button>
    <div className="display-toggle-tabs">
      <button className={`display-tab ${displayMode === "3D" ? "active" : ""}`} onClick={() => setDisplayMode("3D")}>
        3D
      </button>
      <button className={`display-tab ${displayMode === "2D" ? "active" : ""}`} onClick={() => setDisplayMode("2D")}>
        2D
      </button>
    </div>
    <button onClick={toggleControlMode} className={`control-button ${controlMode === "person" ? "active" : ""}`}>
      <img src="/icons/person_view.svg" alt="Person View" className="person-view-icon" />
      Person View
    </button>
  </div>
);

// Main Component
const Rooms3d = () => {
  const [selectedRoom, setSelectedRoom] = useState(roomsData[0]);
  const [roomObjects, setRoomObjects] = useState({});
  const [selectedObject, setSelectedObject] = useState(null);
  const [displayMode, setDisplayMode] = useState("3D");
  const [controlMode, setControlMode] = useState("orbit"); // Default to OrbitControls
  const [zoomFactor, setZoomFactor] = useState(1);

  const cameraRef = useRef();

  // Add Object
  const addObject = (object) => {
    setRoomObjects((prevObjects) => ({
      ...prevObjects,
      [selectedRoom.id]: [...(prevObjects[selectedRoom.id] || []), { ...object, position: [0, 0, 0], rotation: [0, 0, 0] }]
    }));
  };

  // Transform Object (Move & Rotate) - FIXED
  const transformObject = (object, position, rotation) => {
    setRoomObjects((prevObjects) => ({
      ...prevObjects,
      [selectedRoom.id]: prevObjects[selectedRoom.id].map((obj) =>
        obj === object ? { ...object, position, rotation } : obj
      )
    }));
  };

  // Toggle Control Mode (Orbit or Person View)
  const toggleControlMode = () => {
    setControlMode((prevMode) => (prevMode === "orbit" ? "person" : "orbit"));
  };

  return (
    <div className="App">
      <RoomNav selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />
      <ObjectSelectionPanel onAddObject={addObject} />

      <div className="model-viewer">
        <Canvas>
          {displayMode === "3D" ? (
            <PerspectiveCamera makeDefault ref={cameraRef} position={
                controlMode === "person"
                  ? [0, 1.6, 5 * zoomFactor]
                  : [0, 0, 5 * zoomFactor]
              } fov={75} />
          ) : (
            <OrthographicCamera makeDefault
            ref={cameraRef}
            position={[0, 50, 0]}
            zoom={50 * zoomFactor}
            near={0.1}
            far={1000} />
          )}

          <ambientLight intensity={1.0} />
          <pointLight position={[10, 10, 10]} />
          <Suspense fallback={<Html center><div>Loading 3D Model...</div></Html>}>
            <SuiteModel modelPath={selectedRoom.modelPath} />
            {(roomObjects[selectedRoom.id] || []).map((obj, index) => (
              <ObjectModel key={index} object={obj} isSelected={obj === selectedObject} onSelect={setSelectedObject} onTransform={transformObject} />
            ))}
          </Suspense>

          {/* Allow Orbit Controls in both modes */}
          <OrbitControls enablePan={true} enableRotate={true} />

        </Canvas>
      </div>

      <ControlPanel
        onZoomIn={() => setZoomFactor((prev) => Math.max(prev * 0.9, 0.5))}
        onZoomOut={() => setZoomFactor((prev) => prev / 0.9)}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        controlMode={controlMode}
        toggleControlMode={toggleControlMode}
      />
    </div>
  );
};

export default Rooms3d;
