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
import { Navbar, Container, Nav, Button} from "react-bootstrap";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate} from "react-router-dom";
import { HexColorPicker } from "react-colorful";
import "../styles/rooms.css";

// Preload Room Models
useGLTF.preload("/models/suite1.glb");
useGLTF.preload("/models/suite2.glb");
useGLTF.preload("/models/suite3.glb");

// Preload Object Models
useGLTF.preload("/objects/mini_fridge.glb");

// Object Options
const objectOptions = [
  { id: 1, name: "mini fridge", modelPath: "/objects/mini_fridge.glb", image: "/images/mini_fridge.png" }
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
  onRemoveObject,
  color // 🔹 New prop to update color
}) => {
  const { scene } = useGLTF(object.modelPath);

  // 🔹 Apply color dynamically when it changes
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.set(color);
        }
      });
    }
  }, [color, scene]); // Runs whenever `color` changes

  return (
    <>
      <TransformControls
        mode="translate"
        enabled={isSelected}
        onMouseDown={(e) => e.stopPropagation && e.stopPropagation()}
        onDragStart={() => onDragStart && onDragStart()}
        onDragEnd={(e) => {
          onDragEnd && onDragEnd();
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
function TopNavbar() {
  const { logOut } = useUserAuth();
  
  const handleLogout = async () => {
    try {
      await logOut();
      // Optionally navigate("/login")
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
  const { logOut} = useUserAuth(); //logout
  const [selectedRoom, setSelectedRoom] = useState(roomsData[0]);
  const [roomObjects, setRoomObjects] = useState({});
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectColors, setObjectColors] = useState({});
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

  const applyColor = (object, newColor) => {
    if (!object || !object.uid) return; // Prevent errors
  
    setObjectColors((prev) => ({
      ...prev,
      [object.uid]: newColor
    }));
  
    setRoomObjects((prev) => {
      const updatedObjects = { ...prev };
      if (updatedObjects[selectedRoom.id]) {
        updatedObjects[selectedRoom.id] = updatedObjects[selectedRoom.id].map((obj) => {
          if (obj.uid === object.uid) {
            return { ...obj, color: newColor }; // Save color to object
          }
          return obj;
        });
      }
      return updatedObjects;
    });
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
    
  const handleLogout = async () => {
    try {
      await logOut();
      //this is optional
    } catch (error){
      console.error("logout error:", error);
    }
  };

  const navigate = useNavigate();

  const goBack = () => {
    //goes back one page 
    navigate(-1);
  }


  return (
    <div className="App">
      
    <button className="back-button" onClick={goBack}>
     Back
   </button>

   <button className="logout-button" onClick={handleLogout}>
   Logout
   </button>
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
             color={objectColors[obj.uid] || "#ffffff"} // ✅ Pass stored color
           />
         ))}
       </Suspense>
       <OrbitControls enabled={!selectedObject} />
     </Canvas>
   </div>

   {/* ✅ Floating Color Wheel (Top-Right) */}
   {selectedObject && (
     <div className="color-picker-panel">
       <h3>Color Picker</h3>
       <HexColorPicker
         color={objectColors[selectedObject.uid] || "#ffffff"}
         onChange={(color) => applyColor(selectedObject, color)}
       />
     </div>
   )}

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