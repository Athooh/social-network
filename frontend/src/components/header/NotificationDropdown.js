"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/styles/NotificationDropdown.module.css";
import { formatDistanceToNow } from "date-fns";
import { useNotificationService } from "@/services/notificationService"; // Adjust the path based on your project structure

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    isLoadingNotifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    handleFriendRequest,
  } = useNotificationService();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle friend request response (accept/decline)
  const handleNotificationResponse = async (followerId,notificationId, action) => {
    await handleFriendRequest(followerId,notificationId, action);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    fetchNotifications();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    fetchNotifications();
  };

  const handleMarkSingleAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    fetchNotifications();
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case "message":
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img
                src={notification.avatar}
                alt={notification.sender}
                className={styles.avatar}
              />
            </div>
            <span className={styles.text}>
              You have a new message from <strong>{notification.sender}</strong>
            </span>
          </div>
        );
      case "reaction":
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img
                src={notification.avatar}
                alt={notification.sender}
                className={styles.avatar}
              />
            </div>
            <span className={styles.text}>
              <strong>{notification.sender}</strong> {notification.action} your{" "}
              {notification.contentType}
            </span>
          </div>
        );
      case "comment":
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img
                src={notification.avatar}
                alt={notification.sender}
                className={styles.avatar}
              />
            </div>
            <span className={styles.text}>
              <strong>{notification.sender}</strong> commented on your{" "}
              {notification.contentType}
            </span>
          </div>
        );
      case "friendRequest":
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img
                src={notification.avatar}
                alt={notification.sender}
                className={styles.avatar}
              />
            </div>
            <div className={styles.textBox}>
              <span className={styles.text}>
                Friend request from <strong>{notification.sender}</strong>
              </span>
              <div className={styles.actions}>
                <button
                  onClick={() =>
                    handleNotificationResponse(notification.senderId,notification.id, "accept")
                  }
                  className={styles.acceptButton}
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    handleNotificationResponse(notification.senderId,notification.id, "decline")
                  }
                  className={styles.declineButton}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        );
      case "invitation":
        return (
          <div className={styles.notification}>
            <div className={styles.avatarContainer}>
              <img
                src={notification.avatar}
                alt={notification.sender}
                className={styles.avatar}
              />
            </div>
            <span className={styles.text}>
              You have been invited to {notification.contentType} by{" "}
              <strong>{notification.sender}</strong>
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
        className={`${styles.iconButton} ${isOpen ? styles.active : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-bell"></i>
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.headerActions}>
            <h3 className={styles.headerTitle}>Notifications</h3>
            <div className={styles.actionButtons}>
              <button
                className={styles.actionButton}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
              <button className={styles.actionButton} onClick={handleClearAll}>
                Clear all
              </button>
            </div>
          </div>
          <div className={styles.notificationList}>
            {isLoadingNotifications ? (
              <div className={styles.loadingState}>
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.read ? styles.unread : ""
                  }`}
                >
                  <div className={styles.notificationHeader}>
                    {renderNotificationContent(notification)}
                    {!notification.read && (
                      <button
                        className={styles.markReadButton}
                        onClick={() => handleMarkSingleAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <i className="fas fa-check"></i>
                        <span className={styles.tooltip}>Mark as read</span>
                      </button>
                    )}
                  </div>
                  <span className={styles.time}>
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })}
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
