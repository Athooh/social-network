"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/header/Header";
import styles from "@/styles/Messages.module.css";
import NewMessageModal from "./NewMessageModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useChatContext } from "@/context/chatContext";
import { useAuth } from "@/context/authcontext";
import { useUserStatus } from "@/services/userStatusService";
import MessageItem from "@/components/chat/MessageItem";
import { formatRelativeTime } from "@/utils/dateUtils";
import { showToast } from "@/components/ui/ToastContainer";
import { BASE_URL } from "@/utils/constants";

export default function Messages() {
  const { currentUser } = useAuth();
  const {
    loadContacts,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    sendTypingIndicator,
    messages,
    typingUsers,
    unreadCounts,
    loadChatData,
    isDataLoaded,
    contacts,
    loading,
  } = useChatContext();

  const { isUserOnline } = useUserStatus();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageText, setNewMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load contacts only when the page is loaded
  useEffect(() => {
    const fetchData = async () => {
      if (!isDataLoaded) {
        try {
          setLocalLoading(true);
          await loadChatData();
        } catch (error) {
          console.error("Error loading contacts:", error);
          showToast("Failed to load contacts", "error");
        } finally {
          setLocalLoading(false);
        }
      }
    };

    fetchData();
  }, [loadChatData, isDataLoaded]);

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedChat && selectedChat.userId) {
      const fetchMessages = async () => {
        try {
          await loadMessages(selectedChat.userId);
          // Mark messages as read when opening a chat
          await markMessagesAsRead(selectedChat.userId);
        } catch (error) {
          console.error("Error loading messages:", error);
          showToast("Failed to load messages", "error");
        }
      };

      fetchMessages();
    }
  }, [selectedChat, loadMessages, markMessagesAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  // Focus input when chat is selected
  useEffect(() => {
    if (selectedChat) {
      messageInputRef.current?.focus();
    }
  }, [selectedChat]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedChat || !selectedChat.userId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    sendTypingIndicator(selectedChat.userId);

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 3000);
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessageText.trim() || !selectedChat || !selectedChat.userId) return;

    try {
      await sendMessage(selectedChat.userId, newMessageText);
      setNewMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message", "error");
    }
  };

  // Handle selecting a chat
  const handleSelectChat = async (contact) => {
    if (!contact || !contact.userId) {
      console.error("Invalid contact selected:", contact);
      return;
    }

    setSelectedChat(contact);

    // Mark messages as read when selecting a chat
    if (unreadCounts[contact.userId] > 0) {
      try {
        await markMessagesAsRead(contact.userId);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };

  // Filter contacts based on search query
  const filteredContacts =
    contacts?.filter(
      (contact) =>
        contact &&
        contact.userId && // Ensure userId exists
        ((contact.firstName &&
          contact.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
          (contact.lastName &&
            contact.lastName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (contact.name &&
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())))
    ) || [];

  // Sort contacts by most recent message timestamp, then alphabetically
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    // Use the lastSent field from the backend data
    if (a.lastSent && b.lastSent) {
      const aTime = new Date(a.lastSent).getTime();
      const bTime = new Date(b.lastSent).getTime();
      if (aTime !== bTime) return bTime - aTime; // Most recent first
    }
    // If only one has lastSent, prioritize that one
    else if (a.lastSent) return -1;
    else if (b.lastSent) return 1;

    // Fallback to alphabetical order by name
    const aName = `${a.firstName || ""} ${a.lastName || ""}`.trim();
    const bName = `${b.firstName || ""} ${b.lastName || ""}`.trim();
    return aName.localeCompare(bName);
  });

  // Get current chat messages
  const currentChatMessages =
    selectedChat && selectedChat.userId
      ? messages[selectedChat.userId] || []
      : [];

  // Check if the selected user is typing
  const isTyping =
    selectedChat && selectedChat.userId && typingUsers[selectedChat.userId];

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.conversations}>
            {localLoading ? (
              <div className={styles.loadingState}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading conversations...</p>
              </div>
            ) : sortedContacts.length > 0 ? (
              sortedContacts.map((contact) => {
                if (!contact || !contact.userId) return null;

                return (
                  <div
                    key={contact.userId}
                    className={`${styles.conversationItem} ${
                      selectedChat?.userId === contact.userId
                        ? styles.selected
                        : ""
                    } ${contact.unreadCount > 0 ? styles.unread : ""}`}
                    onClick={() => handleSelectChat(contact)}
                  >
                    <div className={styles.avatarContainer}>
                      <img
                        src={
                          contact.avatar
                            ? `${BASE_URL}/uploads/${contact.avatar}`
                            : "/avatar.png"
                        }
                        alt={`${contact.firstName} ${contact.lastName}`}
                        className={styles.avatar}
                      />
                      <span
                        className={`${styles.statusIndicator} ${
                          contact.isOnline ? styles.online : styles.offline
                        }`}
                      ></span>
                    </div>
                    <div className={styles.previewContent}>
                      <h4
                        className={
                          contact.unreadCount > 0 ? styles.boldName : ""
                        }
                      >
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p
                        className={
                          contact.unreadCount > 0
                            ? styles.boldPreview
                            : styles.messagePreview
                        }
                      >
                        {contact.lastMessage ? (
                          contact.lastMessageSenderId === currentUser?.id ? (
                            <span>
                              You:{" "}
                              {contact.lastMessage.length > 30
                                ? `${contact.lastMessage.substring(0, 30)}...`
                                : contact.lastMessage}
                            </span>
                          ) : (
                            <span>
                              {contact.lastMessage.length > 30
                                ? `${contact.lastMessage.substring(0, 30)}...`
                                : contact.lastMessage}
                            </span>
                          )
                        ) : (
                          "Start a conversation"
                        )}
                      </p>
                    </div>
                    <div className={styles.conversationMeta}>
                      <span
                        className={`${styles.timestamp} ${
                          contact.unreadCount > 0 ? styles.boldTimestamp : ""
                        }`}
                      >
                        {contact.lastSent &&
                        contact.lastSent !== "0001-01-01T00:00:00Z"
                          ? formatRelativeTime(new Date(contact.lastSent))
                          : ""}
                      </span>
                      {contact.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>No conversations found</p>
              </div>
            )}
          </div>
        </aside>

        <main className={styles.chatArea}>
          {selectedChat && selectedChat.userId ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatUserInfo}>
                  <div className={styles.avatarContainer}>
                    <img
                      src={
                        `${BASE_URL}/uploads/${selectedChat.avatar}` ||
                        "/avatar.png"
                      }
                      alt={`${selectedChat.firstName} ${selectedChat.lastName}`}
                      className={styles.avatar}
                    />
                    <span
                      className={`${styles.statusIndicator} ${
                        isUserOnline(selectedChat.userId)
                          ? styles.online
                          : styles.offline
                      }`}
                    ></span>
                  </div>
                  <div className={styles.userDetails}>
                    <h2>
                      {selectedChat.firstName} {selectedChat.lastName}
                    </h2>
                    <span className={styles.userStatus}>
                      {isUserOnline(selectedChat.userId) ? "Online" : "Offline"}
                      {isTyping && (
                        <span className={styles.typingIndicator}>
                          {" "}
                          • Typing...
                        </span>
                      )}
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

              <div className={styles.messagesList}>
                {currentChatMessages.length > 0 ? (
                  currentChatMessages.map((message) => (
                    <MessageItem
                      key={
                        message.id || `${message.senderId}-${message.createdAt}`
                      }
                      message={message}
                    />
                  ))
                ) : (
                  <div className={styles.emptyMessages}>
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                )}
                {isTyping && (
                  <div className={styles.typingIndicatorContainer}>
                    <div className={styles.typingDot}></div>
                    <div className={styles.typingDot}></div>
                    <div className={styles.typingDot}></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className={styles.messageInputContainer}
              >
                <button type="button" className={styles.attachButton}>
                  <i className="fas fa-paperclip"></i>
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className={styles.messageInput}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={handleTyping}
                  ref={messageInputRef}
                />
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={!newMessageText.trim()}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </>
          ) : (
            <div className={styles.noChat}>
              <div className={styles.noChatContent}>
                <i className="fas fa-comments"></i>
                <h2>Select a conversation to start messaging</h2>
                <p>
                  Choose from your existing conversations or start a new one
                </p>
                <button
                  className={styles.newChatButton}
                  onClick={() => setShowNewMessageModal(true)}
                >
                  New Message
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      {showNewMessageModal && (
        <NewMessageModal
          onClose={() => setShowNewMessageModal(false)}
          onSelectContact={handleSelectChat}
        />
      )}
    </ProtectedRoute>
  );
}
