import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useUserAuth } from '../context/UserAuthContext';
import { db } from '../firebase/firebaseConfig';
import { addDoc, arrayUnion, collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CreateChatRoom = () => {
  const { user } = useUserAuth();
  const [chatName, setChatName] = useState('');
  const [emails, setEmails] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  // Fetch users in real-time based on email input
  useEffect(() => {
    const fetchUsers = async () => {
      if (emails.trim()) {
        const q = query(collection(db, 'users'), where('email', '>=', emails.trim()));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => doc.data());
        setUsersList(users);
      }
    };

    fetchUsers();
  }, [emails]);

  // Handle user selection for invitations
  const handleUserSelection = (uid) => {
    setSelectedUsers((prev) => {
      if (prev.includes(uid)) {
        return prev.filter(userUid => userUid !== uid);
      } else {
        return [...prev, uid];
      }
    });
  };

  // Create the chat room and add a default message
  const handleCreateChatRoom = async (event) => {
    event.preventDefault();

    try {
      const invitedUsers = [user.uid, ...selectedUsers];

      // Create new chat room in the 'Chats' collection
      const newChatRoom = {
        ChatName: chatName,
        Users: invitedUsers,
      };

      const chatRoomRef = await addDoc(collection(db, 'Chats'), newChatRoom);
      const chatRoomId = chatRoomRef.id;

      // Create a default welcome message in the 'Messages' subcollection
      await addDoc(collection(db, 'Chats', chatRoomId, 'Messages'), {
        Sender: 'System',
        Content: 'Welcome to the chat room!',
        Date: serverTimestamp(), // Automatically timestamp the message
      });

      // Update the user's document with the new chat room ID
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        chatRooms: arrayUnion(chatRoomId),
      });

      alert('Chat room created successfully!');
      navigate(`/chat/${chatRoomId}`); // Navigate to the newly created chat room
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('There was an error creating the chat room.');
    }
  };

  const goBack = () => {
    navigate('/chat-rooms');
  };

  return (
    <div className="create-chat-room">
       <button className="back-button" onClick={goBack}>Back</button>
      <h3>Create a New Chat Room</h3>
      <Form onSubmit={handleCreateChatRoom}>
        <Form.Group controlId="chatName">
          <Form.Label>Chat Room Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter chat room name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="emails">
          <Form.Label>Invite Users by Email</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search for users by email"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />
        </Form.Group>
        <div>
          {usersList.map((user, idx) => (
            <div key={idx}>
              <input
                type="checkbox"
                id={`user-${user.uid}`}
                checked={selectedUsers.includes(user.uid)}
                onChange={() => handleUserSelection(user.uid)}
              />
              <label htmlFor={`user-${user.uid}`}>{user.email}</label>
            </div>
          ))}
        </div>
        <Button type="submit">Create Chat Room</Button>
      </Form>
    </div>
  );
};

export default CreateChatRoom;
