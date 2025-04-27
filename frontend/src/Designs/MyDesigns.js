import React, { useEffect, useState} from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { loadRooms, deleteRoom } from "../services/roomDataService";
import { getUserById } from "../services/userService";
import { getRoomPreviewURL } from "../services/firebaseService"; // adjust the path
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore"; 
import { db } from "../firebase/firebaseConfig"; // Make sure the path matches your project
import "../styles/myDesigns.css";
import "../styles/ChatRoomsPage.css";
import { Button } from 'react-bootstrap';

function MyDesigns() {
  const { user } = useUserAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const navigate = useNavigate();
  //Room Invitations
  const [roominvites, setroomInvites] = useState([]);
  const [showroomInvites, setroomShowInvites] = useState(false);

  // FETCH ROOM INVITES
  useEffect(() => {
    if (!user) return;

    const fetchRoomInvites = async () => {
      try {
        const q = query(
          collection(db, "RoomInvites"),
          where("to", "==", user.uid),
          where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
    
        const invites = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const inviteData = { id: docSnap.id, ...docSnap.data() };
    
            // Fetch the inviter's user info
            let fromName = "Unknown";
            try {
              const inviterData = await getUserById(inviteData.from);
              fromName = inviterData?.displayName || inviterData?.email || "Unknown";
            } catch (error) {
              console.error("Error fetching inviter info:", error);
            }
    
            return { ...inviteData, fromName };
          })
        );
    
        setroomInvites(invites);
      } catch (error) {
        console.error("Error fetching room invites:", error);
      }
    };

    fetchRoomInvites();
  }, [user]);
  
  // 💬 HANDLE ROOM INVITE RESPONSE
  const handleRoomInviteResponse = async (invite, accepted) => {
    const inviteRef = doc(db, "RoomInvites", invite.id);
    const roomRef = doc(db, "rooms", invite.roomId);

    try {
      // 1. Update invite status
      await updateDoc(inviteRef, {
        status: accepted ? "accepted" : "declined",
      });

      // 2. If accepted, add user to room membersId array
      if (accepted) {
        await updateDoc(roomRef, {
          membersId: arrayUnion(user.uid),
        });
      }

      // 3. Remove from invites list locally
      setroomInvites(prev => prev.filter(i => i.id !== invite.id));
      
    } catch (error) {
      console.error("Error responding to room invite:", error);
    }
  };

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

  //not comp x
  const handleDeleteClick = (design) => {
    setRoomToDelete(design); // triggers confirmation popup
  };
  //not comp x
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
  //not comp x
  const cancelDelete = () => {
    setRoomToDelete(null);
  };
  

  return (
    <div className="my-designs-container">
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
                    C
                  </button>
                )}


            </div>
          ))}
        </div>
      )}

      {/*ROOM INVITATIONS */}
      <div>
        <Button className='invite-button' onClick={() => setroomShowInvites(prev => !prev)}>
          {showroomInvites ? 'Hide Invites' : 'Show Invites'}
        </Button>

        {showroomInvites && (
            <div className="invites-container">
              <h3>Your Room Invites</h3>
              {roominvites.length === 0 ? (
                <p>No room invites pending</p>
              ) : (
                <ul>
                  {roominvites.map((invite) => (
                    <li className="room-invite-item" key={invite.id}>
                      <p>Room Name: {invite.roomName}</p>
                      <p>Invited by: {invite.fromName}</p>
                      <div className="invite-button-accept">
                        <Button className="accept" onClick={() => handleRoomInviteResponse(invite, true)}>Accept</Button>{' '}
                        <Button className="decline" variant="secondary" onClick={() => handleRoomInviteResponse(invite, false)}>Decline</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
      </div>




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