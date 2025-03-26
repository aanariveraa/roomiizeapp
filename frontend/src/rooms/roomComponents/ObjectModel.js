// ObjectModel.js
// ->>>Renders individual 3D objects (GLB files) that users add to the room
// Provides interactive controls (drag, rotate, remove) via TransformControls 
// and displays the object in the scene.

import React, { useEffect } from "react";
import { useGLTF, TransformControls, Html } from "@react-three/drei";


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

  // Update object material color when color prop changes
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.set(color);
        }
      });
    }
  }, [color, scene]);

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

export default ObjectModel;