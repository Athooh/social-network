'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/NotificationDropdown.module.css';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationService } from '@/services/notificationService'; // Adjust the path based on your project structure

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    isLoadingNotifications,
    fetchNotifications,
    handleFriendRequest,
  } = useNotificationService();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle friend request response (accept/decline)
  const handleNotificationResponse = async (notificationId, action) => {
    await handleFriendRequest(notificationId, action);
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'message':
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img src={notification.avatar} alt={notification.sender} className={styles.avatar} />
            </div>
            <span className={styles.text}>
              You have a new message from <strong>{notification.sender}</strong>
            </span>
          </div>
        );
      case 'reaction':
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img src={notification.avatar} alt={notification.sender} className={styles.avatar} />
            </div>
            <span className={styles.text}>
              <strong>{notification.sender}</strong> {notification.action} your {notification.contentType}
            </span>
          </div>
        );
      case 'comment':
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img src={notification.avatar} alt={notification.sender} className={styles.avatar} />
            </div>
            <span className={styles.text}>
              <strong>{notification.sender}</strong> commented on your {notification.contentType}
            </span>
          </div>
        );
      case 'friendRequest':
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img src={notification.avatar} alt={notification.sender} className={styles.avatar} />
            </div>
            <div className={styles.textBox}>
              <span className={styles.text}>
                Friend request from <strong>{notification.sender}</strong>
              </span>
              <div className={styles.actions}>
                <button
                  onClick={() => handleNotificationResponse(notification.id, 'accept')}
                  className={styles.acceptButton}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleNotificationResponse(notification.id, 'decline')}
                  className={styles.declineButton}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        );
      case 'invitation':
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img src={notification.avatar} alt={notification.sender} className={styles.avatar} />
            </div>
            <span className={styles.text}>
              You have been invited to {notification.contentType} by <strong>{notification.sender}</strong>
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={`${styles.iconButton} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bell"></i>
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <h3 className={styles.title}>Notifications</h3>
          <div className={styles.notificationList}>
            {isLoadingNotifications ? (
              <div className={styles.loadingState}>Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className={styles.notificationItem}>
                  {renderNotificationContent(notification)}
                  <span className={styles.time}>
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No new notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}