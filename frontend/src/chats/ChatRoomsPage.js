import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import "../styles/ChatRoomsPage.css";

const ChatRoomsPage = () => {
  const { user } = useUserAuth();
  const [chatRooms, setChatRooms] = useState([]);  // store fetched rooms
  const [invites, setInvites] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const navigate = useNavigate();

  // fetch chat rooms 
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'Chats'), where('Users', 'array-contains', user.uid));  // query for the users chats
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatRooms(rooms);
      });
      return unsubscribe;
    }
  }, [user]);

  // fetch invites for the user 
  useEffect(() => {
    const fetchInvites = async () => {
      if (!user) return;
      const q = query(collection(db, 'Invites'), where('to', '==', user.uid), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const invitesList = await Promise.all(snapshot.docs.map(async (inviteDoc) => {
        const inviteData = inviteDoc.data();
        const inviterRef = doc(db, 'users', inviteData.from);
        const inviterSnap = await getDoc(inviterRef);
        const inviterName = inviterSnap.exists() ? inviterSnap.data().displayName || 'Unknown' : 'Unknown';
        return { id: inviteDoc.id, ...inviteData, fromName: inviterName };
      }));
      setInvites(invitesList);
    };
    fetchInvites();
  }, [user]);

  // handle accept or decline 
  const handleResponse = async (invite, accepted) => {
    const inviteRef = doc(db, 'Invites', invite.id);
    const chatRoomRef = doc(db, 'Chats', invite.chatRoomId);
    const userRef = doc(db, 'users', user.uid);

    try {
      // update invite status
      await updateDoc(inviteRef, {
        status: accepted ? 'accepted' : 'declined',
      });
      if (accepted) {
        await updateDoc(chatRoomRef, {
          Users: arrayUnion(user.uid),
        });
        await updateDoc(userRef, {
          chatRooms: arrayUnion(invite.chatRoomId),
        });
      }

      await addDoc(collection(chatRoomRef, 'Messages'), {
        Sender: 'system',
        Content: `${user.displayName || 'A user'} has joined the chat.`,
        Date: serverTimestamp(),
      });
      
      // clear invites 
      setInvites(prev => prev.filter(i => i.id !== invite.id));
    } catch (err) {
      console.error('Error handling invite response:', err);
    }
  };

  return (
    <div className="chat-page">
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

      <div>
        <Button className='invite-button' onClick={() => setShowInvites(prev => !prev)}>
          {showInvites ? 'Hide Invites' : 'Show Invites'}
        </Button>

        {showInvites && (
          <div className="invites-container">
            <h3>Your Invites</h3>
            {invites.length === 0 ? (
              <p>No invites</p>
            ) : (
              <ul>
                {invites.map((invite) => (
                  <li className="invite-item" key={invite.id}>
                    <p>Chat Room: {invite.chatRoomName}</p>
                    <p>Invited by: {invite.fromName}</p>
                    <div className="invite-button-accept">
                      <Button className='accept' onClick={() => handleResponse(invite, true)}>Accept</Button>{' '}
                      <Button className='decline' variant="secondary" onClick={() => handleResponse(invite, false)}>Decline</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoomsPage;
