// ModelViewer.js
// component for room3d canvas 
// -->Renders the 3D scene using Three.js (via @react-three/fiber).
// Displays the base room model (using SuiteModel) and 
// all placed objects (using ObjectModel), sets up the camera, lights, and controls.

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { 
    OrbitControls, 
    PerspectiveCamera, 
    OrthographicCamera, 
    Html 
} from "@react-three/drei";
import SuiteModel from "./SuiteModel";
import ObjectModel from "./ObjectModel";
import ObjectSelectionPanel from "./ObjectSelection";


const ModelViewer = 
({ selectedRoom, 
    roomObjects, 
    selectedObject, 
    setSelectedObject, 
    transformObject,
    rotateObject,
    removeObject,
    cameraRef, 
    displayMode, 
    controlMode, 
    zoomFactor, 
    setIsDragging, 
    objectColors // Added here
  }) => {

  return (
    <div className="model-viewer">
      <Canvas onPointerMissed={() => { if (!selectedObject) setSelectedObject(null); }}>
        {displayMode === "3D" ? (
          <PerspectiveCamera
            makeDefault
            ref={cameraRef}
            position={controlMode === "person" ? [0, 1.6, 5 * zoomFactor] : [0, 0, 5 * zoomFactor]}
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
              color={objectColors[obj.uid] || obj.color || "#ffffff"}
              />
              
          ))}
        </Suspense>
        <OrbitControls enabled={!selectedObject} />
      </Canvas>
    </div>

  );
};

export default ModelViewer;
