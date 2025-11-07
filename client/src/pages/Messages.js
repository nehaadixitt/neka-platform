import React, { useState, useEffect } from 'react';
import axios from '../utils/auth';

const Messages = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.filter(u => u._id !== user.id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(`/api/messages/${userId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post('/api/messages', {
        receiverId: selectedConversation.partnerId,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedConversation.partnerId);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const startNewChat = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    try {
      await axios.post('/api/messages', {
        receiverId: selectedUser,
        content: newMessage
      });
      setNewMessage('');
      setSelectedUser('');
      setShowNewChat(false);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const containerStyle = {
    display: 'flex',
    height: '600px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  };

  const sidebarStyle = {
    width: '300px',
    borderRight: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column'
  };

  const chatStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  const messagesStyle = {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px'
  };

  return (
    <div style={{maxWidth: '1000px', margin: '0 auto'}}>
      <h2 style={{marginBottom: '1rem', color: '#2c3e50'}}>Messages</h2>
      
      <div style={containerStyle}>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <div style={{padding: '1rem', borderBottom: '1px solid #eee'}}>
            <button 
              onClick={() => setShowNewChat(!showNewChat)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              New Chat
            </button>
          </div>

          {showNewChat && (
            <div style={{padding: '1rem', borderBottom: '1px solid #eee'}}>
              <form onSubmit={startNewChat}>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  style={{...inputStyle, marginBottom: '0.5rem'}}
                  required
                >
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.artistType})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{...inputStyle, marginBottom: '0.5rem'}}
                  required
                />
                <button type="submit" style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Send
                </button>
              </form>
            </div>
          )}

          <div style={{flex: 1, overflowY: 'auto'}}>
            {conversations.length === 0 ? (
              <p style={{padding: '1rem', color: '#666'}}>No conversations yet</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.partnerId}
                  onClick={() => {
                    setSelectedConversation(conv);
                    fetchMessages(conv.partnerId);
                  }}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: selectedConversation?.partnerId === conv.partnerId ? '#ecf0f1' : 'white'
                  }}
                >
                  <h4 style={{marginBottom: '0.25rem'}}>{conv.partnerName}</h4>
                  <p style={{fontSize: '0.9rem', color: '#666'}}>
                    {conv.lastMessage.content.substring(0, 50)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={chatStyle}>
          {selectedConversation ? (
            <>
              <div style={{padding: '1rem', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa'}}>
                <h3>{selectedConversation.partnerName}</h3>
              </div>
              
              <div style={messagesStyle}>
                {messages.map(message => (
                  <div
                    key={message._id}
                    style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: message.senderId._id === user.id ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        backgroundColor: message.senderId._id === user.id ? '#3498db' : 'white',
                        color: message.senderId._id === user.id ? 'white' : 'black',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      <p>{message.content}</p>
                      <small style={{opacity: 0.7}}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} style={{padding: '1rem', borderTop: '1px solid #eee'}}>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{...inputStyle, flex: 1}}
                    required
                  />
                  <button type="submit" style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;