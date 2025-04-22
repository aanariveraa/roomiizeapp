import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, doc, getDoc, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useUserAuth } from '../context/UserAuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "../styles/ChatRoomsPage.css";

const ChatRoom = ({sidebarCollapsed}) => {
  const { user } = useUserAuth();
  const { chatId } = useParams();
  const [chatRoomName, setChatRoomName] = useState('');
  const [messages, setMessages] = useState([]); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]); 
  const navigate = useNavigate();
  const messageEndRef = useRef(null);
  

  // fetch chat room details
  useEffect(() => {
    const fetchChatRoom = async () => {
      try {
        const chatRoomDoc = await getDoc(doc(db, 'Chats', chatId)); 
        if (chatRoomDoc.exists()) {
          setChatRoomName(chatRoomDoc.data().ChatName); 
        } else {
          console.error('Chat room does not exist');
        }
      } catch (error) {
        console.error('Error fetching chat room:', error);
      }
    };
    fetchChatRoom();
  }, [chatId]);

  // fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const chatRoomDoc = await getDoc(doc(db, 'Chats', chatId));
        if(chatRoomDoc.exists()) {
          const participantsData = chatRoomDoc.data().Users || [];
          const participantDetails = await Promise.all(participantsData.map(async (uid) => {
            const userDoc = await getDoc(doc(db, 'users', uid));
            return userDoc.exists() ? userDoc.data().displayName || userDoc.data().email : null;
          }));
          setParticipants(participantDetails);
        }
      } catch(error) {
        console.error("Error fetching participants:", error);
      }
    };
    fetchParticipants();
  }, [chatId]);

  // fetch messages and listen for real-time updates
  useEffect(() => {
    const q = query(
      collection(db, 'Chats', chatId, 'Messages'),
      orderBy('Date', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => doc.data()); 
      setMessages(messagesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // scroll to bottom when a new message arrives
  useEffect(() => {
    if(messageEndRef.current) {
      messageEndRef.current.scrollIntoView({behavior: "smooth"});
    }
  }, [messages]); 

  // send a new message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
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

  return (
    <div className={`chat-room ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
    <div className="chat-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginLeft: '0px', marginTop: '0px'}}>
        <h2 style={{ left: sidebarCollapsed ? "70px" : "150px", width: sidebarCollapsed ? "100%" : "calc(100% - 200px)",}} >
          {chatRoomName}
        </h2>
        <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: '10px', }}>
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
          <div ref={messageEndRef} />
        </div>

        <div className='chat-sidebar'>
        <h3>Members</h3>
        <ul>
        {participants.map((participant, idx) => (
              <li key={idx}>{participant}</li>
            ))}
        </ul>
      </div>

        <Form onSubmit={sendMessage} className="message-input" style={{ padding: '10px', backgroundColor: '#fbf9eb ', borderTop: '1px solid #ddd', marginLeft: sidebarCollapsed ? "0px" : "5px",}}>
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
    </div>
  );
};

export default ChatRoom;

