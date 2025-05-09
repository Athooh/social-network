import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/GroupChat.module.css';
import { useAuth } from '@/context/authcontext';

const GroupChat = ({ groupId, groupName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Dummy data for testing
  useEffect(() => {
    setMessages([
      {
        id: 1,
        content: "Hello everyone!",
        sender: {
          id: 1,
          name: "John Doe",
          avatar: "/avatar1.png"
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        reactions: []
      },
      {
        id: 2,
        content: "Welcome to the group chat!",
        sender: {
          id: 2,
          name: "Jane Smith",
          avatar: "/avatar2.png"
        },
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        reactions: []
      }
    ]);

    setActiveUsers([
      { id: 1, name: "John Doe", avatar: "/avatar1.png", isOnline: true },
      { id: 2, name: "Jane Smith", avatar: "/avatar2.png", isOnline: true },
    ]);

    setIsLoading(false);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      sender: {
        id: user.id || 'temp-id', // Fallback ID if user.id is not available
        name: user.name || 'Anonymous',
        avatar: user.avatar || '/default-avatar.png'
      },
      timestamp: new Date().toISOString(),
      reactions: []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleReaction = (messageId, emoji) => {
    if (!user) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = [...msg.reactions];
        const existingReaction = reactions.findIndex(r => r.userId === user.id);
        
        if (existingReaction >= 0) {
          reactions[existingReaction].emoji = emoji;
        } else {
          reactions.push({ userId: user.id, emoji });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading chat...</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>{groupName} Chat</h2>
        <div className={styles.activeUsers}>
          <div className={styles.avatarStack}>
            {activeUsers.slice(0, 3).map(user => (
              <img 
                key={user.id}
                src={user.avatar}
                alt={user.name}
                className={styles.activeUserAvatar}
              />
            ))}
            {activeUsers.length > 3 && (
              <span className={styles.moreUsers}>+{activeUsers.length - 3}</span>
            )}
          </div>
          <span>{activeUsers.length} active</span>
        </div>
      </div>

      <div className={styles.chatMessages}>
        {messages.map(message => (
          <div 
            key={message.id}
            className={`${styles.messageWrapper} ${
              user && message.sender.id === user.id ? styles.ownMessage : ''
            }`}
          >
            <div className={styles.message}>
              <img 
                src={message.sender.avatar}
                alt={message.sender.name}
                className={styles.senderAvatar}
              />
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span className={styles.senderName}>{message.sender.name}</span>
                  <span className={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p>{message.content}</p>
                {message.reactions.length > 0 && (
                  <div className={styles.reactions}>
                    {message.reactions.map((reaction, index) => (
                      <span key={index} className={styles.reaction}>
                        {reaction.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button 
                className={styles.reactionButton}
                onClick={() => setSelectedEmoji(message.id)}
              >
                😊
              </button>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.chatInput}>
        <button 
          type="button" 
          className={styles.emojiButton}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          😊
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className={styles.sendButton}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default GroupChat;