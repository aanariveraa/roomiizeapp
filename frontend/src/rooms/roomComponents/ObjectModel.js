// ObjectModel.js
// ->>>Renders individual 3D objects (GLB files) that users add to the room
// Provides interactive controls (drag, rotate, remove) via TransformControls 
// and displays the object in the scene.

import React, { useEffect, useRef, useState } from "react";
import { useGLTF, TransformControls, Center, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const ObjectModel = ({
  object,
  isSelected,
  onSelect,
  onTransform,
  rotateObject,
  onDragStart,
  onDragEnd,
  onRemoveObject,
  color,
  selectedRoom,      //
  currentUser        //
}) => {
  const { scene } = useGLTF(object.modelPath);
  const groupRef = useRef();
  const transformRef = useRef();

  //const [prevPos, setPrevPos] = useState(null);
  //const [prevRot, setPrevRot] = useState(null);

  //wait for scene to load before applying position
  useEffect(() => {
    if (!scene || !groupRef.current) return;
  
    const pos = object.position || [0, 0, 0];
    const rot = object.rotation || [0, 0, 0];
  
    // Apply position & rotation to the group after model loads
    groupRef.current.position.set(...pos);
    groupRef.current.rotation.set(...rot);
  
    console.log("📍 Object loaded and positioned:", object.name, pos);
    
    // 🛠 IF SELECTED, re-attach after the position is set
    /*if (isSelected && transformRef.current) {
      transformRef.current.attach(groupRef.current);
      console.log("✅ Attaching to:", groupRef.current.name || object.name);
    }*/

  }, [scene, object /*, isSelected*/]); 
  
  /////console lOG MOVEMENT OF OBJECT 
  useFrame(() => {
    if (isSelected && transformRef.current?.object) {
      const obj = transformRef.current.object;
      const { x, y, z } = obj.position;
  
      /*console.log(`📦 Moving object (${object.name || object.uid}):`, {
        x: x.toFixed(2),
        y: y.toFixed(2),
        z: z.toFixed(2)
      });*/
    }
  });  

  //deattach and reattach transform controls cleanly 
  useEffect(() => {
    if (isSelected && transformRef.current && groupRef.current) {
      transformRef.current.attach(groupRef.current);
    } else {
      transformRef.current?.detach();
    }
  }, [isSelected]);  


  // Update material color
  useEffect(() => {
    if (scene) {
      scene.position.set(0, 0, 0); // Important!
      scene.rotation.set(0, 0, 0); 

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.set(color);
        }
      });
    }
  }, [color, scene]);

  //Track actual movement by TransformControls
  /*useFrame(() => {
    if (!isSelected || !transformRef.current?.object) return;
    const obj = transformRef.current.object;
    const position = [obj.position.x, obj.position.y, obj.position.z];
    const rotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z];
  
    console.log("📦 Live position of object:", position);
  
    const hasMoved = !prevPos || position.some((v, i) => v !== prevPos[i]);
    if (hasMoved) {
      setPrevPos(position);
      setPrevRot(rotation);
      onTransform(object, position, rotation);
    }
  });*/

  useEffect(() => {
    const controls = transformRef.current;
    if (!controls) return;
  
    const callback = (event) => {
      if (!event.value) {
        console.log("🧪 TransformControls finished dragging!");
  
        const obj = controls.object;
        if (obj) {
          obj.updateMatrixWorld(true);
  
          const pos = [
            Number(obj.position.x),
            Number(obj.position.y),
            Number(obj.position.z),
          ];
          const rot = [
            Number(obj.rotation.x),
            Number(obj.rotation.y),
            Number(obj.rotation.z),
          ];
  
          console.log("✅ Final position:", pos, "rotation:", rot);
  
          onTransform(
            {
              ...object,
              position: pos,
              rotation: rot,
            },
            pos,
            rot
          );
  
          controls.detach();
        }
      }
    };
  
    controls.addEventListener("dragging-changed", callback);
  
    return () => controls.removeEventListener("dragging-changed", callback);
  }, [object, onTransform]);
  

  return (
    <TransformControls
      ref={transformRef}
      mode="translate"
      enabled={isSelected}
      showX={true}
      showY={true}
      showZ={true}
      onDragStart={() => onDragStart?.()}
      onDragEnd={async () => {
        //console.log("🧪 onDragEnd triggered!", transformRef.current?.object);

        const obj = transformRef.current?.object;
        if (obj) {
          // Force the object's matrix to update before reading values
          obj.updateMatrixWorld(true);
      
          const pos = [obj.position.x, obj.position.y, obj.position.z];
          const rot = [obj.rotation.x, obj.rotation.y, obj.rotation.z];
      
          console.log("✅ Drag finished. Saving position:", pos, "rotation:", rot);
      
          //onTransform(object, pos, rot); // Call with live values
          onTransform(
            {
              ...object,
              position: pos,
              rotation: rot
            },
            pos,
            rot
          );

          // Unlock the object after moving
            const objectRef = doc(db, "rooms", selectedRoom.id, "Items", String(object.uid));
            await updateDoc(objectRef, {
              lockedBy: null,
              lockedByName: null
            });

          onDragEnd?.();
          transformRef.current.detach();
        }
      }}
      onMouseUp={() => console.log("🖱️ Mouse up on TransformControls")}
      
    >
      <group
        ref={(el) => {
          groupRef.current = el;
          if (isSelected && transformRef.current) {
            transformRef.current.attach(el);
          }
        }}
        onPointerDown={ async (e) => {
          e.stopPropagation();

          // If someone else is editing this object
          if (object.lockedBy && object.lockedBy !== currentUser.uid) {
            alert(`${object.lockedByName || "Someone"} is editing this object.`);
            return;
          }

          //  Lock object
          const objectRef = doc(db, "rooms", selectedRoom.id, "Items", String(object.uid)); 
          try {
            await updateDoc(objectRef, {
              lockedBy: currentUser.uid,
              lockedByName: currentUser.displayName || currentUser.email || "User"
            });
            console.log(" Lock acquired, selecting:", object.name);
            onSelect(object);
          } catch (error) {
            console.error(" Error locking object:", error);
            alert("Failed to lock the object. Try again.");
          }
        }}
      >
        <primitive object={scene} scale={[1, 1, 1]} />

        {/* ✍️ Floating label if locked */}
        {object.lockedBy && (
              <Html center distanceFactor={10}>
              <div style={{
                background: "rgba(255, 255, 255, 0.85)",
                padding: "6px 12px",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#333",
                border: "1px solid #ddd",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.3s ease"
              }}>
                <span style={{ fontSize: "16px" }}>✍️</span> 
                <span>{object.lockedByName || "Someone"}</span>
              </div>
            </Html>
         )}

      </group>
    </TransformControls>
  );
};

export default ObjectModel;
