import React, { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { loadRooms } from "../services/roomDataService";
import { getRoomPreviewURL } from "../services/firebaseService"; // adjust the path
import "../styles/myDesigns.css";

function MyDesigns() {
  const { user } = useUserAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  useEffect(() => {
    if (!user) return;
    
    const fetchDesigns = async () => {
      try {
        console.log("Fetching designs for user:", user.uid);
        const userDesigns = await loadRooms(user.uid);
        // For each design, fetch the preview image URL based on the room type.
        const designsWithPreview = await Promise.all(
          userDesigns.map(async (design) => {
            try {
              // Here, design.roomType should be the room type identifier.
              const previewURL = await getRoomPreviewURL(design.roomType);
              return { ...design, previewImage: previewURL };
            } catch (error) {
              console.error("Error fetching preview for room:", design.id, error);
              return { ...design, previewImage: "/defaultRoomImage.png" };
            }
          })
        );
        console.log("Fetched designs with previews:", designsWithPreview);
        setDesigns(designsWithPreview);
      } catch (error) {
        console.error("Error fetching user designs:", error);
        setDesigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, [user, navigate]);

  const handleDesignClick = (design) => {
    console.log("Selected design:", design);
    navigate("/rooms3d", { state: { selectedRoom: design } });
  };

  return (
    <div className="my-designs-container">
      <button className="back-button" onClick={goBack}>Back</button>
      <h2>My Designs</h2>
      {loading ? (
        <div>Loading designs...</div>
      ) : (
        <div className="designs-grid">
          {designs.map((design) => (
            <div 
              key={design.id} 
              className="design-card" 
              onClick={() => handleDesignClick(design)}
            >
              <img
                src={design.previewImage || "/defaultRoomImage.png"}
                alt={design.roomName}
                className="design-image"
              />
              <div className="design-title">{design.roomName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDesigns;