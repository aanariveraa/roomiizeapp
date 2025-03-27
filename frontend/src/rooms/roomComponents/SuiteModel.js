// SuiteModel.js
// Loads and displays the base room model (GLB file).
// Uses the useGLTF hook to load the model and renders it scaled 
// appropriately.

import React from "react";
import { useGLTF } from "@react-three/drei";

const SuiteModel = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} scale={[2, 2, 2]} />;
};

export default SuiteModel;
