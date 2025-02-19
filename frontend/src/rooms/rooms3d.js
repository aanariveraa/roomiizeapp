import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
  useGLTF,
  Html
} from '@react-three/drei';
import './rooms.css';

// Preload all suite models so that switching back loads from cache.
useGLTF.preload('/models/suite1.glb');
useGLTF.preload('/models/suite2.glb');
useGLTF.preload('/models/suite3.glb');

// Room Navigation Component (using your original button style)
const RoomNav = ({ rooms, selectedRoom, onSelectRoom }) => {
  return (
    <div className="room-nav-container">
      {rooms.map((room) => (
        <button
          key={room.id}
          className={`room-nav-item ${selectedRoom.id === room.id ? 'active' : ''}`}
          onClick={() => onSelectRoom(room)}
        >
          <div className="room-title">{room.title}</div>
        </button>
      ))}
    </div>
  );
};

// Component to load and display the 3D model for the selected suite.
const SuiteModel = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} />;
};

// Control Panel for zoom controls, display mode tabs, and person view toggle.
const ControlPanel = ({
  onZoomIn,
  onZoomOut,
  displayMode,
  setDisplayMode,
  controlMode,
  toggleControlMode
}) => {
  return (
    <div className="control-panel">
      <button onClick={onZoomIn} className="zoom-button">
        <img src="/icons/zoom_in.svg" alt="Zoom In" />
      </button>
      <button onClick={onZoomOut} className="zoom-button">
        <img src="/icons/zoom_out.svg" alt="Zoom Out" />
      </button>
      <div className="display-toggle-tabs">
        <button
          className={`display-tab ${displayMode === '3D' ? 'active' : ''}`}
          onClick={() => setDisplayMode('3D')}
        >
          3D
        </button>
        <button
          className={`display-tab ${displayMode === '2D' ? 'active' : ''}`}
          onClick={() => setDisplayMode('2D')}
        >
          2D
        </button>
      </div>
      <button
        onClick={toggleControlMode}
        className={`control-button ${controlMode === 'person' ? 'active' : ''}`}
      >
        <img src="/icons/person_view.svg" alt="Person View" className="person-view-icon" />
        Person View
      </button>
    </div>
  );
};

const Rooms3d = () => {
  // Room (suite) data.
  const roomsData = [
    { id: 1, title: 'Suite 1', modelPath: '/models/suite1.glb' },
    { id: 2, title: 'Suite 2', modelPath: '/models/suite2.glb' },
    { id: 3, title: 'Suite 3', modelPath: '/models/suite3.glb' },
  ];

  // State for selected room, display mode (3D/2D), control mode, and zoom factor.
  const [selectedRoom, setSelectedRoom] = useState(roomsData[0]);
  const [displayMode, setDisplayMode] = useState("3D"); // "3D" uses Perspective, "2D" uses Orthographic.
  const [controlMode, setControlMode] = useState("orbit"); // "orbit" (default) or "person"
  const [zoomFactor, setZoomFactor] = useState(1);

  // Refs for the camera and OrbitControls.
  const cameraRef = useRef();
  const controlsRef = useRef();

  // When switching rooms or control mode, reset zoom and update camera position.
  useEffect(() => {
    setZoomFactor(1);
    if (controlsRef.current) {
      // Reset the OrbitControls target.
      if (controlMode === "person") {
        controlsRef.current.target.set(0, 1.6, 0);
      } else {
        controlsRef.current.target.set(0, 0, 0);
      }
      controlsRef.current.reset();
    }
    if (cameraRef.current && displayMode === "3D") {
      if (controlMode === "person") {
        cameraRef.current.position.set(0, 1.6, 5);
      } else {
        cameraRef.current.position.set(0, 0, 5);
      }
    }
  }, [selectedRoom, controlMode, displayMode]);

  // Update camera position when zoom changes (for 3D mode).
  useEffect(() => {
    if (cameraRef.current && displayMode === "3D") {
      if (controlMode === "orbit") {
        cameraRef.current.position.z = 5 * zoomFactor;
      } else if (controlMode === "person") {
        cameraRef.current.position.z = 5 * zoomFactor;
        cameraRef.current.position.y = 1.6;
      }
    }
  }, [zoomFactor, displayMode, controlMode]);

  const zoomIn = () => setZoomFactor((prev) => Math.max(prev * 0.9, 0.5));
  const zoomOut = () => setZoomFactor((prev) => prev / 0.9);
  const toggleControlMode = () => {
    setControlMode((prev) => (prev === "orbit" ? "person" : "orbit"));
  };

  return (
    <div className="App">
      {/* Room Navigation */}
      <RoomNav rooms={roomsData} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />

      {/* 3D Model Viewer Container */}
      <div className="model-viewer">
        <Canvas>
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
            <SuiteModel modelPath={selectedRoom.modelPath} />
          </Suspense>
          <OrbitControls ref={controlsRef} />
        </Canvas>
      </div>

      {/* Control Panel for Zoom, Display Mode Tabs, and Person View Toggle */}
      <ControlPanel
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        controlMode={controlMode}
        toggleControlMode={toggleControlMode}
      />
    </div>
  );
};

export default Rooms3d;
