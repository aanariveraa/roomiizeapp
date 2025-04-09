import React, { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { loadRooms, deleteRoom } from "../services/roomDataService";
import { getUserById } from "../services/userService";
import { getRoomPreviewURL } from "../services/firebaseService"; // adjust the path
import "../styles/myDesigns.css";

function MyDesigns() {
  const { user } = useUserAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomToDelete, setRoomToDelete] = useState(null);

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
              //return { ...design, previewImage: previewURL };

              //get user name
              const members = await Promise.all(
                (design.membersId || []).map(async (uid) => {
                  const user = await getUserById(uid);
                  return user?.displayName || user?.email || uid;
                })
              );

              return {
                ...design,
                previewImage: previewURL,
                memberNames: members,
              };

            } catch (error) {
              console.error("Error fetching preview for room:", design.id, error);
              return { 
                ...design, 
                previewImage: "/defaultRoomImage.png",
                memberNames: [],
              };
            }
          })
        );
        console.log("Fetched designs with previews:", designsWithPreview);
        //setDesigns(designsWithPreview);
        //most recent room updated at the top
        const sorted = designsWithPreview.sort((a, b) => {
          const aTime = a.updatedAt?.seconds || 0;
          const bTime = b.updatedAt?.seconds || 0;
          return bTime - aTime; // Most recent first
        });
        setDesigns(sorted);


      } catch (error) {
        console.error("Error fetching user designs:", error);
        setDesigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, [user]);

  const handleDesignClick = (design) => {
    console.log("Selected design:", design);
    navigate("/rooms3d", { state: { selectedRoom: design } });
  };

  const handleDeleteClick = (design) => {
    setRoomToDelete(design); // triggers confirmation popup
  };
  
  const confirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      // 🔥 Your delete logic here (Firestore + subcollections)
      await deleteRoom(roomToDelete.id);
      console.log(`Deleted room: ${roomToDelete.roomName}`);
      setDesigns((prev) => prev.filter((d) => d.id !== roomToDelete.id));
    } catch (error) {
      console.error("Failed to delete room:", error);
    } finally {
      setRoomToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setRoomToDelete(null);
  };
  

  return (
    <div className="my-designs-container">
      <button className="back-button" onClick={goBack}>Back</button>
      <h2>{user.displayName} Room Designs</h2>
      {user && (
        <p className="user-greeting">
          Welcome Back, {user.displayName ? user.displayName : user.email}!
        </p>
      )}
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
              
              <div className="design-members">
                👥 Members: {design.memberNames?.join(", ") || "No members"}
              </div>

                {/*  Show delete button only for creator */}
                {design.creator === user.uid && (
                  <button
                    className="delete-button"
                    /*onClick={(e) => {
                      e.stopPropagation(); // prevent room click
                      console.log("🗑️ Delete clicked for:", design.roomName); // 👈
                      handleDeleteClick(design);
                    }}*/
                  >
                    🗑
                  </button>
                )}


            </div>
          ))}
        </div>
      )}

      {roomToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure?</h3>
            <p>Do you really want to delete <strong>{roomToDelete.roomName}</strong>?</p>
            <div className="modal-buttons">
              <button onClick={confirmDelete} className="confirm">Yes, delete</button>
              <button onClick={cancelDelete} className="cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyDesigns;