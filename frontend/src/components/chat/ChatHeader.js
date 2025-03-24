'use client';

import styles from '@/styles/Messages.module.css';

export default function ChatHeader({ contact }) {
  if (!contact) return null;
  
  return (
    <div className={styles.chatHeader}>
      <div className={styles.chatUserInfo}>
        <img 
          src={contact.avatar} 
          alt={contact.name} 
          className={styles.avatar}
        />
        <div>
          <h2>{contact.name}</h2>
          <span className={`${styles.statusIndicator} ${contact.online ? styles.online : styles.offline}`}>
            {contact.online ? 'Online' : 'Offline'}
          </span>
        </div>
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
  );
} 