'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/NotificationDropdown.module.css';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'message',
      sender: 'John Doe',
      avatar: '/avatar1.png',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      read: false
    },
    {
      id: '2',
      type: 'reaction',
      sender: 'Jane Smith',
      avatar: '/avatar2.png',
      action: 'liked',
      contentType: 'photo',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false
    },
    {
      id: '3',
      type: 'comment',
      sender: 'Mike Johnson',
      avatar: '/avatar4.png',
      contentType: 'post',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false
    },
    {
      id: '4',
      type: 'friendRequest',
      sender: 'Sarah Wilson',
      avatar: '/avatar5.png',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: false
    },
    {
      id: '5',
      type: 'invitation',
      sender: 'David Brown',
      avatar: '/avatar6.png',
      contentType: 'group "Photography Club"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      read: false
    }
  ]);
  const dropdownRef = useRef(null);

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

  const handleNotificationResponse = async (notificationId, action) => {
    try {
      // API call to handle friend request response
      await fetch(`/api/notifications/${notificationId}/${action}`, {
        method: 'POST',
      });
      // Remove the notification from the list
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
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
            {notifications.length > 0 ? (
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