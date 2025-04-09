// ObjectModel.js
// ->>>Renders individual 3D objects (GLB files) that users add to the room
// Provides interactive controls (drag, rotate, remove) via TransformControls 
// and displays the object in the scene.

import React, { useEffect, useRef, useState } from "react";
import { useGLTF, TransformControls, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const ObjectModel = ({
  object,
  isSelected,
  onSelect,
  onTransform,
  rotateObject,
  onDragStart,
  onDragEnd,
  onRemoveObject,
  color
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
  }, [scene, object]); 
  
  /////console lOG MOVEMENT OF OBJECT 
  useFrame(() => {
    if (isSelected && transformRef.current?.object) {
      const obj = transformRef.current.object;
      const { x, y, z } = obj.position;
  
      console.log(`📦 Moving object (${object.name || object.uid}):`, {
        x: x.toFixed(2),
        y: y.toFixed(2),
        z: z.toFixed(2)
      });
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
      //onMouseDown={(e) => e.stopPropagation()}
      //onPointerDown={(e) => e.stopPropagation()}
      onDragStart={() => onDragStart?.()}
      //&& onDragStart()}
      //onDragEnd={() => onDragEnd && onDragEnd()}
      onDragEnd={() => {
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
        //ref={groupRef}
        //position={object.position || [0, 0, 0]}
        //rotation={object.rotation || [0, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          console.log("✅ Object clicked:", object.name);
          onSelect(object);
        }}
      >
          <primitive object={scene} scale={[1, 1, 1]} />
      </group>
    </TransformControls>
  );
};

export default ObjectModel;
//export default React.memo(ObjectModel);
