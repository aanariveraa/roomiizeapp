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
import { doc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import RoomPanel from "./roomComponents/roomPanel";

const Rooms3d = ({sidebarCollapsed}) => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve initial room from router state fall back
  const initialRoom = location.state?.selectedRoom || roomsData[0];
  const [initialCameraState, setInitialCameraState] = useState(null);

  //room management 
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  
  //
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
  const [isSaving, setIsSaving] = useState(false);   ///saving/syncing 
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
    setIsSaving(true); // show syncing icon
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
    }finally {
      setIsSaving(false); // back to normal icon
    }
  };

  // Auto-save: debounce changes in roomObjects and save after 20 seconds of inactivity?
  useEffect(() => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCurrentRoomState();
      console.log("Auto-saved room state after inactivity.");
    }, 2000);
    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [roomObjects]);

  const addObject = (object) => {
    //const newUid = doc(collection(db, "temp")).id;  //gen a uid 
    const newObject = {
      ...object,
      uid: Date.now() + Math.random(),
      //uid:  newUid,
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
  /*const transformObject = (object, position, rotation) => {
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
      //saveRoomItems(selectedRoom.id, updatedRoomObjects[selectedRoom.id]);
  
      // Delay save until after state is updated
        setTimeout(() => {
          saveRoomItems(selectedRoom.id, updatedRoomObjects[selectedRoom.id]);
          console.log("✅ Saved to ITEMS tras Firestore:", updated);
        }, 0);
            return updatedRoomObjects;
          });
  
    // Update selected object if it was the one moved
    if (selectedObject && selectedObject.uid === object.uid) {
      setSelectedObject(updated);
    }
  };*/
  const transformObject = (object, position, rotation) => {
    const updated = {
      ...object,
      position: [...position],
      rotation: [...rotation]
    };
  
    setRoomObjects((prev) => {
      const updatedObjects = (prev[selectedRoom.id] || []).map((obj) =>
        obj.uid === object.uid ? updated : obj
      );

      // debug log
      console.log("🛠 Updated object before saving:", updated)
  
      // Save only the updated object for now, or the full updated list if you prefer
      saveRoomItems(selectedRoom.id, updatedObjects);
  
      return {
        ...prev,
        [selectedRoom.id]: updatedObjects
      };
    });
  
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

  return (
    <div
    className="App"
    style={{
      margin: 0,
      marginLeft: sidebarCollapsed ? "5px" : "5px",
      transition: "margin-left 0.3s ease",
      position: "relative",
      height: "100%",
      overflow: "hidden"
    }}
  >
  
  <ObjectSelectionPanel onAddObject={addObject} sidebarCollapsed={sidebarCollapsed} />

     {/*</div><div className="App">*/}
      <div className="top-nav-bar">
        <button onClick={() => setShowInstructions(true)}>Instructions</button>
        {/*<button onClick={() => setShowRoomSettings(true)}>Room Settings</button>*/}
      </div>

      {showInstructions && (
        <div className="modal-overlay">
        <div className="modal-content">
          <h2> How to Design Your Room</h2>
          <ul>
            <li><strong>Click an object</strong> from the selection panel to add it to your room.</li>
            <li> <strong>Click an object in the room</strong> to select it.</li>
            <li> When selected, a 3D control box with colored arrows will appear:</li>
            <ul style={{ paddingLeft: "20px" }}>
              <li>🟥 <strong>Red (X)</strong> — move left/right</li>
              <li>🟩 <strong>Green (Y)</strong> — move up/down</li>
              <li>🟦 <strong>Blue (Z)</strong> — move forward/back</li>
              <li>Drag an arrow to move the object along that axis with precision</li>
            </ul>
            <li> The Control Panel (bottom right) appears when an object is selected:</li>
            <ul style={{ paddingLeft: "20px" }}>
              <li> Change the object's color</li>
              <li> Rotate the object</li>
              <li> Delete the object</li>
            </ul>
            <li> <strong>Click outside the room</strong> to deselect an object and resume camera movement.</li>
            <li> Use the view mode buttons to switch perspectives:</li>
            <ul style={{ paddingLeft: "20px" }}>
              <li><strong>3D View</strong> — orbit around the room</li>
              <li><strong>2D View</strong> — top-down floor plan</li>
              <li><strong>Person View</strong> — walkthrough from eye-level</li>
            </ul>
            <li>💾 <strong>Changes auto-save</strong> every 30 seconds, or click the Save button to sync instantly.</li>
            <li>⚙️ Use the <strong>Room Settings</strong> button to rename the room or manage collaborators.</li>
          </ul>
          <button onClick={() => setShowInstructions(false)}>Close</button>
        </div>
      </div>      
      )}

      {showRoomSettings && (
        <RoomPanel 
          selectedRoom={selectedRoom}
          onClose={() => setShowRoomSettings(false)}
          currentUser={user}
        />
      )}

      {/*<ObjectSelectionPanel onAddObject={addObject} />*/}


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
        onSave={saveCurrentRoomState}
        isSaving={isSaving}
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
        toggleColorPicker={toggleColorPicker} // pass the toggle function
        selectedObject={selectedObject}              
        rotateObject={rotateObject}                   
        onRemoveObject={removeObject} 
        onSave={saveCurrentRoomState}  //sa
      />
    </div>
  );
};

export default Rooms3d;


