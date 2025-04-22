// RoomPanel.js
import React from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import "../../styles/rooms.css";

const RoomPanel = ({ selectedRoom, onClose, currentUser }) => {


  const handleRenameRoom = async () => {
    const newName = prompt("Enter new room name:");
    if (newName) {
      try {
        const roomRef = doc(db, 'rooms', selectedRoom.id);
        await updateDoc(roomRef, { title: newName });
        alert("Room renamed successfully.");
      } catch (error) {
        console.error("Error renaming room:", error);
      }
    }
  };

  const handleAddMember = async () => {
    const newMember = prompt("Enter new member email:");
    if (newMember) {
      try {
        const roomRef = doc(db, 'rooms', selectedRoom.id);
        await updateDoc(roomRef, { members: arrayUnion(newMember) });
        alert("Member added successfully.");
      } catch (error) {
        console.error("Error adding member:", error);
      }
    }
  };

  const handleRemoveMember = async () => {
    const toRemove = prompt("Enter email to remove:");
    if (toRemove) {
      try {
        const roomRef = doc(db, 'rooms', selectedRoom.id);
        await updateDoc(roomRef, { members: arrayRemove(toRemove) });
        alert("Member removed successfully.");
      } catch (error) {
        console.error("Error removing member:", error);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{selectedRoom?.roomName} Management</h2>
        <button /*onClick={handleRenameRoom}*/>Rename Room</button>
        <button /*onClick={handleAddMember}*/>Add Member</button>
        <button /*onClick={handleRemoveMember}*/>Remove Member</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default RoomPanel;
