import React, { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/myDesigns.css"; // Styling for designs grid

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
        const designsRef = collection(db, "rooms");
        const q = query(designsRef, where("membersId", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);
        const userDesigns = [];
        querySnapshot.forEach((doc) => {
          userDesigns.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched designs:", userDesigns);
        setDesigns(userDesigns);
      } catch (error) {
        console.error("Error fetching user designs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, [user]);

  const handleDesignClick = (design) => {
    console.log("Selected design:", design);
    // Navigate to the 3D room editor with the selected design
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
                src={design.image || "/defaultRoomImage.png"}
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
