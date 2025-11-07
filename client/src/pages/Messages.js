import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Users, Search, User, Plus, X } from 'lucide-react';
import axios from '../utils/auth';

const Messages = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const startChatWithUser = async (selectedUser) => {
    try {
      // Check if conversation already exists
      const existingConv = conversations.find(conv => conv.partnerId === selectedUser._id);
      if (existingConv) {
        setSelectedConversation(existingConv);
        fetchMessages(selectedUser._id);
        setShowUserList(false);
        return;
      }

      // Create new conversation by setting up the conversation object
      const newConv = {
        partnerId: selectedUser._id,
        partnerName: selectedUser.name,
        messages: []
      };
      setSelectedConversation(newConv);
      setMessages([]);
      setShowUserList(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.artistType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto h-[80vh]"
    >
      <div className="flex h-full bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <MessageCircle size={24} />
                <span>Messages</span>
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowUserList(!showUserList)}
                className="p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
              >
                {showUserList ? <X size={20} /> : <Plus size={20} />}
              </motion.button>
            </div>

            {/* Search */}
            {showUserList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                />
              </motion.div>
            )}
          </div>

          {/* User List or Conversations */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {showUserList ? (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-2"
                >
                  <h3 className="text-white/80 text-sm font-medium mb-3 px-2 flex items-center space-x-2">
                    <Users size={16} />
                    <span>All Users ({filteredUsers.length})</span>
                  </h3>
                  {filteredUsers.map(u => (
                    <motion.div
                      key={u._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => startChatWithUser(u)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors mb-2"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{u.name}</p>
                        <p className="text-purple-300 text-sm">{u.artistType}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="conversations"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-2"
                >
                  <h3 className="text-white/80 text-sm font-medium mb-3 px-2">
                    Conversations ({conversations.length})
                  </h3>
                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="mx-auto mb-3 text-white/40" size={32} />
                      <p className="text-white/60">No conversations yet</p>
                      <p className="text-white/40 text-sm">Start chatting with other artists!</p>
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <motion.div
                        key={conv.partnerId}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setSelectedConversation(conv);
                          fetchMessages(conv.partnerId);
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                          selectedConversation?.partnerId === conv.partnerId 
                            ? 'bg-purple-500/20 border border-purple-400/50' 
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{conv.partnerName}</p>
                          <p className="text-white/60 text-sm truncate">
                            {conv.lastMessage?.content || 'Start a conversation'}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedConversation.partnerName}</h3>
                    <p className="text-white/60 text-sm">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.senderId._id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderId._id === user.id
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'bg-white/10 text-white border border-white/20'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId._id === user.id ? 'text-white/70' : 'text-white/50'
                        }`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span className="hidden sm:inline">Send</span>
                  </motion.button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-4 text-white/40" size={64} />
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to Messages</h3>
                <p className="text-white/60 mb-4">Select a conversation or start a new chat</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowUserList(true)}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Users size={16} />
                  <span>Browse Users</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Messages;