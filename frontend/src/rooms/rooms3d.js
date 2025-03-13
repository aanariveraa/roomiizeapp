import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
  useGLTF,
  Html,
  TransformControls
} from "@react-three/drei";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import "./rooms.css";
// Import the updated service functions
import { saveRoomMetadata, saveRoomItems, loadRoomData } from "../components/roomDataService";

// Preload models...
useGLTF.preload("/models/suite1.glb");
useGLTF.preload("/models/suite2.glb");
useGLTF.preload("/models/suite3.glb");
useGLTF.preload("/objects/test.glb");

// Static room data for fallback (if needed)
const roomsData = [
  { id: 1, title: "Suite 1", modelPath: "/models/suite1.glb", roomtype: 1 },
  { id: 2, title: "Suite 2", modelPath: "/models/suite2.glb", roomtype: 2 },
  { id: 3, title: "Suite 3", modelPath: "/models/suite3.glb", roomtype: 3 }
];

// Object options for the selection panel
const objectOptions = [
  { id: 1, name: "test", modelPath: "/objects/test.glb", image: "/images/test.png" }
];

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
  onRemoveObject,
  onDragStart,
  onDragEnd,
}) => {
  const { scene } = useGLTF(object.modelPath);
  return (
    <TransformControls
      mode="translate"
      enabled={isSelected}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
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
      {isSelected && (
        <Html position={[0, 1.5, 0]}>
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
    </TransformControls>
  );
};

const ObjectSelectionPanel = ({ onAddObject }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`object-selection-panel ${isOpen ? "open" : ""}`}>
      <button
        className="toggle-button"
        onClick={() => {
          console.log("Toggled object selection panel. Now open:", !isOpen);
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? "Close" : "Objects"}
      </button>
      {isOpen && (
        <div className="object-grid">
          {objectOptions.map((object) => (
            <div key={object.id} className="object-item">
              <img
                src={object.image}
                alt={object.name}
                className="object-preview-image"
              />
              <button
                onClick={() => {
                  console.log("Placing object:", object.name);
                  onAddObject(object);
                }}
              >
                Place Item
              </button>
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
  toggleControlMode,
  onSave,
}) => (
  <div className="control-panel">
    <button onClick={onZoomIn} className="zoom-button">
      <img src="/icons/zoom_in.svg" alt="Zoom In" />
    </button>
    <button onClick={onZoomOut} className="zoom-button">
      <img src="/icons/zoom_out.svg" alt="Zoom Out" />
    </button>
    <div className="display-toggle-tabs">
      <button
        className={`display-tab ${displayMode === "3D" ? "active" : ""}`}
        onClick={() => setDisplayMode("3D")}
      >
        3D
      </button>
      <button
        className={`display-tab ${displayMode === "2D" ? "active" : ""}`}
        onClick={() => setDisplayMode("2D")}
      >
        2D
      </button>
    </div>
    <button
      onClick={toggleControlMode}
      className={`control-button ${controlMode === "person" ? "active" : ""}`}
    >
      <img src="/icons/person_view.svg" alt="Person View" className="person-view-icon" />
      Person View
    </button>
    <button onClick={onSave} className="save-button">
      Save
    </button>
  </div>
);

const Rooms3d = () => {
  const { user, logOut } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve selected room from router state or fallback to Suite 1.
  const initialRoom = location.state?.selectedRoom || roomsData[0];
  const [selectedRoom, setSelectedRoom] = useState(initialRoom);
  // We store room objects keyed by room id.
  const [roomObjects, setRoomObjects] = useState({});
  const [selectedObject, setSelectedObject] = useState(null);
  const [displayMode, setDisplayMode] = useState("3D");
  const [controlMode, setControlMode] = useState("orbit");
  const [zoomFactor, setZoomFactor] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const cameraRef = useRef();
  const autoSaveTimeoutRef = useRef(null);

  // Load saved room state from Firestore (if exists)
  useEffect(() => {
    const loadRoomState = async () => {
      try {
        const savedData = await loadRoomData(selectedRoom.id);
        if (savedData) {
          console.log("Loaded room state:", savedData);
          if (savedData.lastPositionofRoom && cameraRef.current) {
            const { x, y, z } = savedData.lastPositionofRoom;
            cameraRef.current.position.set(x, y, z);
          }
          if (savedData.items) {
            setRoomObjects({ [selectedRoom.id]: savedData.items });
          }
        }
      } catch (error) {
        console.error("Error loading room state:", error);
      }
    };
    loadRoomState();
  }, [selectedRoom]);  

  // Save initial room metadata when the room is selected.
  useEffect(() => {
    const saveInitialRoom = async () => {
      try {
        await saveRoomMetadata(selectedRoom.id, {
          roomName: selectedRoom.title,
          membersId: [user.uid],
          lastPositionofRoom: cameraRef.current && cameraRef.current.position ? {
            x: cameraRef.current.position.x,
            y: cameraRef.current.position.y,
            z: cameraRef.current.position.z, } : null,
        });
        console.log("Room metadata saved successfully.");
        // Optionally, save items if any exist.
        if (roomObjects[selectedRoom.id] && roomObjects[selectedRoom.id].length > 0) {
          await saveRoomItems(selectedRoom.id, roomObjects[selectedRoom.id]);
          console.log("Room items saved successfully.");
        }
      } catch (error) {
        console.error("Error saving initial room:", error);
      }
    };
    saveInitialRoom();
  }, [selectedRoom, user.uid]);

  // Function to manually save the current room state.
  const saveCurrentRoomState = async () => {
    try {
      await saveRoomMetadata(selectedRoom.id, {
        roomName: selectedRoom.title,
        //roomtype: selectedRoom.roomtype,
        membersId: [user.uid],
        lastPositionofRoom: cameraRef.current && cameraRef.current.position ? {
          x: cameraRef.current.position.x,
          y: cameraRef.current.position.y,
          z: cameraRef.current.position.z, } : null,
      });
      if (roomObjects[selectedRoom.id] && roomObjects[selectedRoom.id].length > 0) {
        await saveRoomItems(selectedRoom.id, roomObjects[selectedRoom.id]);
      }
      console.log("Room state saved");
    } catch (error) {
      console.error("Error saving room state:", error);
    }
  };

  // Auto-save: Debounce changes to roomObjects and save after 2 seconds of inactivity.
  useEffect(() => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCurrentRoomState();
      console.log("Auto-saved room state after inactivity.");
    }, 2000);
    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [roomObjects]);

  // Object manipulation functions remain similar.
  const addObject = (object) => {
    const newObject = {
      ...object,
      uid: Date.now() + Math.random(),
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    };
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newObject],
    }));
    console.log("Adding object:", object.name, "to room:", selectedRoom.title);
    // Optionally, call saveCurrentRoomState() or a helper here.
    saveCurrentRoomState();
  };

  const transformObject = (object, position, rotation) => {
    const updated = { ...object, position, rotation };
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: prev[selectedRoom.id].map((obj) =>
        obj.uid === object.uid ? updated : obj
      ),
    }));
    if (selectedObject && selectedObject.uid === object.uid) {
      setSelectedObject(updated);
    }
    console.log(
      "Transforming object:",
      object.name,
      "to position:",
      position,
      "and rotation:",
      rotation
    );
    saveCurrentRoomState();
  };

  const rotateObject = (object, angle) => {
    const currentRotation = object.rotation || [0, 0, 0];
    const newY = currentRotation[1] + (angle * Math.PI) / 180;
    transformObject(object, object.position, [
      currentRotation[0],
      newY,
      currentRotation[2],
    ]);
    console.log("Rotated object:", object.name, "by angle:", angle);
    saveCurrentRoomState();
  };

  const removeObject = () => {
    if (!selectedObject) return;
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: (prev[selectedRoom.id] || []).filter(
        (obj) => obj.uid !== selectedObject.uid
      ),
    }));
    console.log("Removing object:", selectedObject.name);
    saveCurrentRoomState();
    setSelectedObject(null);
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const goBack = () => navigate(-1);

  return (
    <div className="App">
      <button className="back-button" onClick={goBack}>
        Back
      </button>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

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
        onSave={saveCurrentRoomState}
      />
    </div>
  );
};

export default Rooms3d;