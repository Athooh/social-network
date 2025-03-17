"use client";

import { useState, useEffect } from 'react';
import styles from '@/styles/ChatSidebarFloat.module.css';
import ChatWindow from './ChatWindow';

const ChatSidebarFloat = ({ contacts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatPosition, setChatPosition] = useState('default'); // 'default' or 'shifted'

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedContact = contacts.find(contact => contact.id === selectedChat);

  // Update chat position when sidebar state changes
  useEffect(() => {
    setChatPosition(isOpen ? 'shifted' : 'default');
  }, [isOpen]);

  const handleContactClick = (contactId) => {
    setSelectedChat(contactId);
    setIsMinimized(false);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setIsMinimized(false);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating Message Icon */}
      <button 
        className={`${styles.floatingButton} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-comments"></i>
        {contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0) > 0 && (
          <span className={styles.totalUnread}>
            {contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0)}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.chatSidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>Messages</h3>
          <button 
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.contactsList}>
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              className={`${styles.contactItem} ${selectedChat === contact.id ? styles.selected : ''}`}
              onClick={() => handleContactClick(contact.id)}
            >
              <div className={styles.contactAvatar}>
                <img src={contact.avatar} alt={contact.name} />
                <span className={`${styles.status} ${contact.online ? styles.online : styles.offline}`} />
              </div>
              <div className={styles.contactInfo}>
                <div className={styles.contactHeader}>
                  <span className={styles.contactName}>{contact.name}</span>
                  <span className={styles.timestamp}>
                    {contact.lastMessageTime || 'Recently'}
                  </span>
                </div>
                <div className={styles.messagePreview}>
                  {contact.messages?.length > 0 
                    ? contact.messages[contact.messages.length - 1].content
                    : 'No messages yet'}
                </div>
              </div>
              {contact.unreadCount > 0 && (
                <span className={styles.unreadBadge}>
                  {contact.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Windows Container - Moved outside the sidebar */}
      <div className={`${styles.chatWindowsContainer} ${styles[chatPosition]}`}>
        {selectedContact && (
          <ChatWindow
            contact={selectedContact}
            onClose={handleCloseChat}
            onMinimize={handleMinimizeChat}
            isMinimized={isMinimized}
          />
        )}
      </div>
    </>
  );
};

export default ChatSidebarFloat; 