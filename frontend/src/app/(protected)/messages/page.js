'use client';

import Header from '@/components/header/Header';
import styles from '@/styles/Messages.module.css';
import { useState } from 'react';
import NewMessageModal from './NewMessageModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  // Temporary mock data
  const conversations = [
    {
      id: 1,
      name: 'John Doe',
      avatar: '/avatar.png',
      lastMessage: "Hey, how's it going?",
      timestamp: '2m',
      unread: 2,
    },
    {
      id: 2,
      name: 'Sarah Smith',
      avatar: '/avatar2.png',
      lastMessage: 'The project looks great!',
      timestamp: '1h',
      unread: 0,
    },
    // Add more conversations as needed
  ];

  return (
    <ProtectedRoute>
      <Header />
      <div className={styles.messagesContainer}>
        <aside className={styles.conversationsList}>
          <div className={styles.conversationsHeader}>
            <h2>Messages</h2>
            <button 
              className={styles.newMessageButton}
              onClick={() => setShowNewMessageModal(true)}
            >
              <i className="fas fa-edit"></i>
              <span>New Message</span>
            </button>
          </div>
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Search messages..." 
              className={styles.searchInput}
            />
          </div>
          <div className={styles.conversations}>
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                className={`${styles.conversationItem} ${
                  selectedChat?.id === conv.id ? styles.selected : ''
                }`}
                onClick={() => setSelectedChat(conv)}
              >
                <img 
                  src={conv.avatar} 
                  alt={conv.name} 
                  className={styles.avatar}
                />
                <div className={styles.previewContent}>
                  <h4>{conv.name}</h4>
                  <p>{conv.lastMessage}</p>
                </div>
                <div className={styles.conversationMeta}>
                  <span className={styles.timestamp}>{conv.timestamp}</span>
                  {conv.unread > 0 && (
                    <span className={styles.unreadBadge}>{conv.unread}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
        
        <main className={styles.chatArea}>
          {selectedChat ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatUserInfo}>
                  <img 
                    src={selectedChat.avatar} 
                    alt={selectedChat.name} 
                    className={styles.avatar}
                  />
                  <h2>{selectedChat.name}</h2>
                </div>
                <div className={styles.chatActions}>
                  <button className={styles.actionButton}>
                    <i className="fas fa-phone"></i>
                  </button>
                  <button className={styles.actionButton}>
                    <i className="fas fa-video"></i>
                  </button>
                  <button className={styles.actionButton}>
                    <i className="fas fa-info-circle"></i>
                  </button>
                </div>
              </div>
              
              <div className={styles.messagesList}>
                {/* Messages will go here */}
              </div>
              
              <div className={styles.messageInputContainer}>
                <button className={styles.attachButton}>
                  <i className="fas fa-paperclip"></i>
                </button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className={styles.messageInput}
                />
                <button className={styles.sendButton}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noChat}>
              <h2>Select a conversation to start messaging</h2>
            </div>
          )}
        </main>
      </div>
      {showNewMessageModal && (
        <NewMessageModal onClose={() => setShowNewMessageModal(false)} />
      )}
    </ProtectedRoute>
  );
}
