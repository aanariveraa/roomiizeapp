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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // fetch users based on email input
  useEffect(() => {
    const fetchUsers = async () => {
      if (emails.trim()) {
        const q = query(collection(db, 'users'), where('email', '==', emails.trim()));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => doc.data());
        setUsersList(users);
      } else {
        setUsersList([]); // 
      }
    };

    fetchUsers();
  }, [emails]);

  // handle user selection for invitations
  const handleUserSelection = (uid) => {
    setSelectedUsers((prev) => {
      if (prev.includes(uid)) {
        return prev.filter(userUid => userUid !== uid);
      } else {
        return [...prev, uid];
      }
    });
  };

  //
  const handleSearchChange = (e) => {
    setEmails(e.target.value);
  };

  const handleCreateChatRoom = async (event) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      const creatorId = user.uid;
      console.log("Creating chat room...");
  
      const newChatRoom = {
        ChatName: chatName,
        Users: [creatorId], // Only creator for now
      };
  
      // Create chat room
      const chatRoomRef = await addDoc(collection(db, 'Chats'), newChatRoom);
      const chatRoomId = chatRoomRef.id;
      console.log("Chat room created:", chatRoomId);
  
      // Add welcome message
      await addDoc(collection(db, 'Chats', chatRoomId, 'Messages'), {
        Sender: 'System',
        Content: 'Welcome to the chat room!',
        Date: serverTimestamp(),
      });
      console.log("Welcome message added");
  
      // Update creator's user document
      const userRef = doc(db, 'users', creatorId);
      await updateDoc(userRef, {
        chatRooms: arrayUnion(chatRoomId),
      });
      console.log("User chatRooms updated");
  
      // Send invites
      console.log("Selected users:", selectedUsers);
      for (const invitedUserId of selectedUsers) {
        console.log("Sending invite to:", invitedUserId);
        await addDoc(collection(db, 'Invites'), {
          chatRoomId,
          from: creatorId,
          to: invitedUserId,
          chatRoomName: chatName,
          status: 'pending',
          timestamp: serverTimestamp(),
        });
      }
      console.log("Invites sent");
  
      alert('Chat room created and invites sent!');
      navigate(`/chat/${chatRoomId}`);
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('There was an error creating the chat room.');
    }
  };
  

  return (
    <div className="create-chat-room">
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
            onChange={handleSearchChange}
          />
        </Form.Group>
        <div>
          {usersList.length > 0 && (
            <div className='search-results'>
              {usersList.map((user, idx) => (
                <div key={idx} className='search-result-item'>
                  <span>{user.email}</span>
                  <button 
                    type="button" className='Add-button'
                    onClick={() => handleUserSelection(user.uid)}
                    >
                      {selectedUsers.includes(user.uid) ? 'Remove' : 'Add'}
                    </button>
                    </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" className='create-chat-room-button'>Create Chat Room</Button>
      </Form>
    </div>
  );
};

export default CreateChatRoom;

