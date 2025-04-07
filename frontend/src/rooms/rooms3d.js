import React, { useState, useRef, useEffect } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { loadRoomData, saveRoomMetadata, saveRoomItems, deleteRoomItem } from "../services/roomDataService";
import { HexColorPicker } from "react-colorful";
import ModelViewer from "./roomComponents/ModelViewer";
import ControlPanel from "./roomComponents/ControlPanel";
import SuiteModel from "./roomComponents/SuiteModel";
import ObjectModel from "./roomComponents/ObjectModel";
import ObjectSelectionPanel from "./roomComponents/ObjectSelection";
import "../styles/rooms.css";

const Rooms3d = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve initial room from router state fall back
  const initialRoom = location.state?.selectedRoom || roomsData[0];
  const [initialCameraState, setInitialCameraState] = useState(null);

  const [selectedRoom, setSelectedRoom] = useState(initialRoom);
  const [roomObjects, setRoomObjects] = useState({});
  const [selectedObject, setSelectedObject] = useState(null);
  const [objectColors, setObjectColors] = useState({});
  const [displayMode, setDisplayMode] = useState("3D");
  const [controlMode, setControlMode] = useState("orbit");
  const [zoomFactor, setZoomFactor] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  // New state for the color picker open/close toggle:
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  //
  const cameraRef = useRef();
  const autoSaveTimeoutRef = useRef(null);
  // New state for the color picker open/close toggle:

  // Toggle function for the color picker
  const toggleColorPicker = () => {
    setIsColorPickerOpen((prev) => !prev);
  };

  useEffect(() => {
    if (initialCameraState) {
      const timeout = setTimeout(() => {
        if (cameraRef.current) {
          const { position, rotation, zoom } = initialCameraState;
          cameraRef.current.position.set(...position);
          const [x, y, z] = rotation.length === 4 ? rotation.slice(0, 3) : rotation;
          cameraRef.current.rotation.set(x, y, z);
          cameraRef.current.zoom = zoom;
          cameraRef.current.updateProjectionMatrix();
          console.log(" Camera restored:", initialCameraState);
        }
      }, 100); // short delay to let the camera initialize
      return () => clearTimeout(timeout);
    }
  }, [initialCameraState]);
  

  // Load saved room state from Firestore (if any)
  useEffect(() => {
    const loadRoomState = async () => {
      
      try {

        const savedData = await loadRoomData(selectedRoom.id);

        if (savedData.lastCameraState) {
          setInitialCameraState(savedData.lastCameraState);
        }

        if (savedData) {
          console.log("Loaded room state:", savedData);
          //
          if (savedData.lastPositionofRoom && cameraRef.current) {
            const { x, y, z } = savedData.lastPositionofRoom;
            cameraRef.current.position.set(x, y, z);
          }
          if (savedData.items) {
            setRoomObjects((prev) => ({
              ...prev,
              [selectedRoom.id]: savedData.items
            }));
          }

          //CAMERA 
          if (savedData.lastCameraState && cameraRef.current) {
            const { position, rotation, zoom } = savedData.lastCameraState;
          
            cameraRef.current.position.set(...position);
            
            //  convert to Euler safely
            const [x, y, z] = rotation.length === 4 ? rotation.slice(0, 3) : rotation;
            cameraRef.current.rotation.set(x, y, z);
          
            cameraRef.current.zoom = zoom;
            cameraRef.current.updateProjectionMatrix();
          }
          
        }
      } catch (error) {
        console.error("Error loading room state:", error);
      }
    };
    loadRoomState();
  }, [selectedRoom]);

  // Save initial room metadata when the room is selected.
  // (Now only saving lastPositionofRoom, not roomName or membersId.)
  useEffect(() => {
    const saveInitialRoom = async () => {
      if (!roomObjects[selectedRoom.id] || roomObjects[selectedRoom.id].length === 0) return; 
      try {
        await saveRoomMetadata(selectedRoom.id, {
          lastPositionofRoom: cameraRef.current && cameraRef.current.position
            ? {
                x: cameraRef.current.position.x,
                y: cameraRef.current.position.y,
                z: cameraRef.current.position.z
              }
            : null,
        });
        console.log("Room Initial metadata saved .");

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
  // (Saves only lastPositionofRoom and room items.)
  const saveCurrentRoomState = async () => {
    try {
      await saveRoomMetadata(selectedRoom.id, {
        lastPositionofRoom: cameraRef.current && cameraRef.current.position
          ? {
              x: cameraRef.current.position.x,
              y: cameraRef.current.position.y,
              z: cameraRef.current.position.z
            }
          : null,
      });
      if (roomObjects[selectedRoom.id] && roomObjects[selectedRoom.id].length > 0) {
        await saveRoomItems(selectedRoom.id, roomObjects[selectedRoom.id]);
      }
      console.log("Room state saved");
    } catch (error) {
      console.error("Error saving room state:", error);
    }
  };

  // Auto-save: debounce changes in roomObjects and save after 2 seconds of inactivity.
  useEffect(() => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCurrentRoomState();
      console.log("Auto-saved room state after inactivity.");
    }, 2000);
    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [roomObjects]);

  const addObject = (object) => {
    const newObject = {
      ...object,
      uid: Date.now() + Math.random(),
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      color: "#ffffff"
    };
    setRoomObjects((prev) => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] || []), newObject]
    }));
    console.log("Adding object:", object.name, "to room:", selectedRoom.title);
    saveCurrentRoomState();
  };

  //////OBJECT MOVEMENT ---------------------------------------------
  const transformObject = (object, position, rotation) => {
    const updated = {
      ...object,
      position: [...position],
      rotation: [...rotation]
    };
  
    setRoomObjects((prev) => {
      const updatedRoomObjects = {
        ...prev,
        [selectedRoom.id]: prev[selectedRoom.id].map((obj) =>
          obj.uid === object.uid ? updated : obj
        )
      };
  
      // 💾 Save directly here with the correct, fresh object data
      saveRoomItems(selectedRoom.id, updatedRoomObjects[selectedRoom.id]);
  
      return updatedRoomObjects;
    });
  
    // Update selected object if it was the one moved
    if (selectedObject && selectedObject.uid === object.uid) {
      setSelectedObject(updated);
    }
  };
  

  //rotate
  const rotateObject = (object, angle) => {
    const currentRotation = object.rotation || [0, 0, 0];
    const newY = currentRotation[1] + (angle * Math.PI) / 180;
    transformObject(object, object.position, [currentRotation[0], newY, currentRotation[2]]);
    console.log("Rotated object:", object.name, "by angle:", angle);
    saveCurrentRoomState(); //<----saves instantly
  };

  /////////--------------------------------------------------------
  const removeObject = async () => {
    if (!selectedObject) return;
  
    const roomId = selectedRoom.id;  
    const objectUid = selectedObject.uid;

    setRoomObjects((prev) => ({
      ...prev,
      [roomId]: (prev[roomId] || []).filter((obj) => obj.uid !== objectUid)
    }));

    console.log("Selected object:", selectedObject);
    //Delete from Firestore
    await deleteRoomItem(roomId, objectUid);
  
    console.log("Removing object:", selectedObject.name);
    
    //saveCurrentRoomState(); --this still saved the delteed object 
    setSelectedObject(null);
  };

  const applyColor = (object, newColor) => {
    if (!object || !object.uid) return;
    setObjectColors((prev) => ({
      ...prev,
      [object.uid]: newColor
    }));
    setRoomObjects((prev) => {
      const updatedObjects = { ...prev };
      if (updatedObjects[selectedRoom.id]) {
        updatedObjects[selectedRoom.id] = updatedObjects[selectedRoom.id].map((obj) => {
          if (obj.uid === object.uid) {
            return { ...obj, color: newColor };
          }
          return obj;
        });
      }
      return updatedObjects;
    });
  };

  const goBack = () => navigate(-1);
  const goHome = () => {
    navigate("/home");
  };


  return (
    <div className="App">
      <button className="back-button" onClick={goBack}>Back</button>
      <button className="back-button" onClick={goHome}>Home</button>
      <ObjectSelectionPanel onAddObject={addObject} />

      {/* Pass state down to ModelViewer */}
      <ModelViewer 
        selectedRoom={selectedRoom}
        initialCameraState={initialCameraState} //
        roomObjects={roomObjects}
        setRoomObjects={setRoomObjects}
        selectedObject={selectedObject}
        setSelectedObject={setSelectedObject}
        onTransform={transformObject}
        rotateObject={rotateObject}
        onRemoveObject={removeObject}
        cameraRef={cameraRef}
        displayMode={displayMode}
        controlMode={controlMode}
        zoomFactor={zoomFactor}
        setIsDragging={setIsDragging}
        objectColors={objectColors}
      />

      {selectedObject && isColorPickerOpen && (
        <div className="color-picker-panel">
          <h3>Color Picker</h3>
          <HexColorPicker
            color={objectColors[selectedObject.uid] || selectedObject.color || "#ffffff"}
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
        toggleControlMode={() => setControlMode(controlMode === "orbit" ? "person" : "orbit")}
        onSave={saveCurrentRoomState}
        toggleColorPicker={toggleColorPicker} // pass the toggle function
        selectedObject={selectedObject}              
        rotateObject={rotateObject}                   
        onRemoveObject={removeObject} 
      />
    </div>
  );
};

export default Rooms3d;

