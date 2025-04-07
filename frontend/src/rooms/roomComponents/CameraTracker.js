// CameraTracker.js
// Tracks the Camera of the room when the user moves
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { saveRoomMetadata} from "../../services/roomDataService"; // add this


const roundArray = (arr, precision = 2) =>
  arr.map((n) => (typeof n === "number" ? +n.toFixed(precision) : n));

const CameraTracker = ({ cameraRef, selectedRoom }) => {
  const lastCamState = useRef(null);
  const [canTrack, setCanTrack] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanTrack(true), 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, []);


  useFrame(() => {
    if (!cameraRef.current || !canTrack) return;

    const cam = cameraRef.current;
    const camData = {
      position: roundArray(cam.position.toArray(), 0),
      rotation: roundArray(cam.rotation.toArray(), 0),
      zoom: +cam.zoom.toFixed(1),
    };

    const hasChanged =
      JSON.stringify(camData) !== JSON.stringify(lastCamState.current);

    if (hasChanged) {
      //console.log("📸 Camera changed:", camData);
      lastCamState.current = camData;

      // Save camera to Firestore
      if (selectedRoom?.id) {
        saveRoomMetadata(selectedRoom.id, {
          lastCameraState: camData,
      });
    }
    }
  });

  return null;
};

export default CameraTracker;