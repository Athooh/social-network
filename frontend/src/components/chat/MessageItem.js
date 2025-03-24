"use client";

import { useState } from "react";
import styles from "@/styles/Messages.module.css";
import { useAuth } from "@/context/authcontext";
import { formatRelativeTime } from "@/utils/dateUtils";
import { BASE_URL } from "@/utils/constants";

export default function MessageItem({ message }) {
  const { currentUser } = useAuth();
  const isCurrentUserSender = message.senderId === currentUser?.id;

  return (
    <div
      className={`${styles.messageItem} ${
        isCurrentUserSender ? styles.sent : styles.received
      }`}
    >
      {!isCurrentUserSender && (
        <img
          src={`${BASE_URL}/uploads/${message.sender.avatar}` || "/avatar.png"}
          alt={message.sender?.firstName || "User"}
          className={styles.messageAvatar}
        />
      )}
      <div className={styles.messageContent}>
        <div className={styles.messageText}>{message.content}</div>
        <div className={styles.messageTime}>
          {formatRelativeTime(new Date(message.createdAt))}
          {isCurrentUserSender && (
            <span className={styles.readStatus}>
              {message.isRead ? (
                <i className="fas fa-check-double" title="Read"></i>
              ) : (
                <i className="fas fa-check" title="Sent"></i>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
