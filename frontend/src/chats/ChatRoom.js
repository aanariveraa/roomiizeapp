import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, doc, getDoc, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useUserAuth } from '../context/UserAuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles/ChatRoomsPage.css"

const ChatRoom = () => {
  const { user } = useUserAuth();
  const { chatId } = useParams();
  const [chatRoomName, setChatRoomName] = useState('');
  const [messages, setMessages] = useState([]); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetch chat room details when chatID changes
  useEffect(() => {
    const fetchChatRoom = async () => {
      try {
        const chatRoomDoc = await getDoc(doc(db, 'Chats', chatId)); // fetch chat room data from database 
        if (chatRoomDoc.exists()) {
          setChatRoomName(chatRoomDoc.data().ChatName); // set chat room name 
        } else {
          console.error('Chat room does not exist');
        }
      } catch (error) {
        console.error('Error fetching chat room:', error);
      }
    };
    fetchChatRoom();
  }, [chatId]); 

  // fetch paricipants from Firestore
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const chatRoomDoc = await getDoc(doc(db, 'Chats', chatId));
        if(chatRoomDoc.exists()) {
          // extract participants list from chat room document 
          const paricipantsData = chatRoomDoc.data().Paricipants || [];
          setParticipants(paricipantsData);
        }
      } catch(error) {
        console.error("Error fetching participants:", error);
      }
    };
    fetchParticipants();
  }, [chatId]);

  // fetch messages from Firestore and listen for real-time updates 
  useEffect(() => {
    // query to fetch messages from Messages subcollection
    const q = query(
      collection(db, 'Chats', chatId, 'Messages'), // reference to Messages subcollection
      orderBy('Date', 'asc')
    );
    // real-time listener for messages
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => doc.data()); // extract message data 
      setMessages(messagesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // function to send a new message 
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      // add a new message to the Messages subcollection 
      await addDoc(collection(db, 'Chats', chatId, 'Messages'), {
        Sender: user.displayName,
        Content: message,
        Date: Timestamp.now(),
      });

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // navigate back to chat rooms
  const goBack = () => {
    navigate('/chat-rooms');
  }

  return (
    <div className="chat-room">
      <h2>{chatRoomName}</h2>
      <button className="back-button" onClick={goBack}>Back</button> 

      <div className="messages-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.Sender === user.displayName ? 'outgoing' : 'incoming'}`}>
              <strong>{msg.Sender}:</strong> {msg.Content}
              <br />
              <small>{new Date(msg.Date.seconds * 1000).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>

      <Form onSubmit={sendMessage} className="message-input"> 
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="message-input-field"
          />
          <Button type="submit" variant="primary">Send</Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default ChatRoom;





