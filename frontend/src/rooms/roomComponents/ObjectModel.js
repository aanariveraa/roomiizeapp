// ObjectModel.js
// ->>>Renders individual 3D objects (GLB files) that users add to the room
// Provides interactive controls (drag, rotate, remove) via TransformControls 
// and displays the object in the scene.

import React, { useEffect, useRef, useState } from "react";
import { useGLTF, TransformControls, Html } from "@react-three/drei";
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

  const [prevPos, setPrevPos] = useState(null);
  const [prevRot, setPrevRot] = useState(null);

  //Set initial position ONCE when object is mounted
  useEffect(() => {
    if (groupRef.current) {
      const pos = object.position || [0, 0, 0];
      const rot = object.rotation || [0, 0, 0];
      groupRef.current.position.set(...pos);
      groupRef.current.rotation.set(...rot);

    }
  }, [object]); 
  

  /*useEffect(() => {
    if (isSelected && transformRef.current && groupRef.current) {
      transformRef.current.attach(groupRef.current);
    }
  }, [isSelected]);

  useEffect(() => {
    if (isSelected) {
      console.log("👆 TransformControls attached to:", groupRef.current?.name || object.name);
    }
  }, [isSelected]);*/
  

  // Update material color
  useEffect(() => {
    if (scene) {
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

  return (
    <TransformControls
      ref={transformRef}
      mode="translate"
      enabled={isSelected}
      //onMouseDown={(e) => e.stopPropagation()}
      //onPointerDown={(e) => e.stopPropagation()}
      onDragStart={() => onDragStart?.()}
      //&& onDragStart()}
      //onDragEnd={() => onDragEnd && onDragEnd()}
      onDragEnd={() => {
        const obj = transformRef.current?.object;
        if (obj) {
          const pos = obj.position.toArray();
          const rot = obj.rotation.toArray().slice(0, 3);
          console.log("🎯 Drag ended at", pos);
          
          onTransform(object, pos, rot); // Save the updated state
          onDragEnd?.(); // Clean up if needed

          transformRef.current.detach(); ///deattcach manually ? 
          console.log("🔍 transformRef.current.object:", transformRef.current?.object);

        }
      }}
    >
      <group
        ref={(el) => {
          groupRef.current = el;
          if (transformRef.current) {
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

        {/*isSelected && (
          <Html position={[0, 1.5, 0]} transform occlude>
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
        )*/}
      </group>
    </TransformControls>
  );
};

export default ObjectModel;
//export default React.memo(ObjectModel);
