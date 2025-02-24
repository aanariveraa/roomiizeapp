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

// Object Options
const objectOptions = [
  { id: 1, name: "test", modelPath: "/objects/test.glb", image: "/images/test.png" }
];

// Room List
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
        onClick={() => onSelectRoom(room)}
      >
        {room.title}
      </button>
    ))}
  </div>
);

const SuiteModel = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={[2, 2, 2]} />;
};

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
          const pos = e.target.object.position;
          const rot = e.target.object.rotation;
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

const Rooms3d = () => {
  const [selectedRoom, setSelectedRoom] = useState(roomsData[0]);
  const [roomObjects, setRoomObjects] = useState({});
  const [selectedObject, setSelectedObject] = useState(null);
  const [displayMode, setDisplayMode] = useState("3D");
  const [controlMode, setControlMode] = useState("orbit");
  const [zoomFactor, setZoomFactor] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const cameraRef = useRef();

  const addObject = (object) => {
    const newObject = {
      ...object,
      uid: Date.now() + Math.random(),
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    };
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newObject]
    }));
  };

  const transformObject = (object, position, rotation) => {
    const updated = { ...object, position, rotation };
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: prev[selectedRoom.id].map((obj) =>
        obj.uid === object.uid ? updated : obj
      )
    }));
    if (selectedObject && selectedObject.uid === object.uid) {
      setSelectedObject(updated);
    }
  };

  const rotateObject = (object, angle) => {
    const currentRotation = object.rotation || [0, 0, 0];
    const newY = currentRotation[1] + (angle * Math.PI) / 180;
    transformObject(object, object.position, [currentRotation[0], newY, currentRotation[2]]);
  };

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

  return (
    <div className="App">
      <RoomNav selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />
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
            <SuiteModel modelPath={selectedRoom.modelPath} />
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

export default Rooms3d;
