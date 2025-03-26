import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import "../styles/ChatRoomsPage.css";


const ChatRoomsPage = () => {
  const { user } = useUserAuth();
  const [chatRooms, setChatRooms] = useState([]); // store fetched rooms
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log("User logged in:", user.uid);  // check if user data is available
      // fetch chat rooms from firestore
      const fetchChatRooms = () => {
        // query firestore to get chat rooms where the current user is a member
        const q = query(collection(db, 'Chats'), where('Users', 'array-contains', user.uid));
        
        // set up a real-time listener to update data in real-time
        const unsubscribe = onSnapshot(q, (snapshot) => {
          // map through snapshot documents to extract room data
          const rooms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(), // get the room data
          }));
          // set the chat rooms state with the fetched data
          setChatRooms(rooms);
        });
        return unsubscribe; // clean up listener 
      };
      // fetch chat rooms when user is logged in 
      fetchChatRooms();
    }
  }, [user]); 
  
  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="chat-page">
      <button className="back-button" onClick={goBack}>Back</button>
      <h2>Chat Rooms</h2> 
      <h3>Existing Chat Rooms:</h3>
      <ul>
        {chatRooms.length === 0 ? (
          <p>No chat rooms available</p>
        ) : (
          chatRooms.map((room) => (
            <li key={room.id}>
              <Link to={`/chat/${room.id}`}>{room.ChatName}</Link>
            </li>
          ))
        )}
      </ul>
      <div>
        <button className="create-chat-button">
          <Link to="/create-chat-room">Create a New Chat Room</Link>
        </button>
      </div>
    </div>

  );
};

export default ChatRoomsPage;
