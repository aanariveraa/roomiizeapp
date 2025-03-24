import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const DormRoomModel = () => {
  const { scene } = useGLTF("/models/suite1.glb"); // path to your model
  return <primitive object={scene} scale={1.5} />;
};

const Landing3DModel = () => {
  return (
    <div className="landing-3d-model">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <DormRoomModel />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
};

export default Landing3DModel;
