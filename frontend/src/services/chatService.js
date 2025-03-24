import { useState, useEffect, useCallback } from "react";
import { useWebSocket, EVENT_TYPES } from "./websocketService";
import { useAuth } from "@/context/authcontext";

// Add chat event types to the WebSocket event types
export const CHAT_EVENT_TYPES = {
  PRIVATE_MESSAGE: "private_message",
  MESSAGES_READ: "messages_read",
  USER_TYPING: "user_typing",
};

// The EVENT_TYPES in websocketService.js already includes these events

export const useChatService = () => {
  const { user, authenticatedFetch } = useAuth();
  const { subscribe, send } = useWebSocket();
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial contacts and messages
  const loadContacts = useCallback(async () => {
    try {
      const response = await authenticatedFetch("chat/contacts");
      if (!response.ok) throw new Error("Failed to load contacts");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error loading contacts:", error);
      return [];
    }
  }, [authenticatedFetch]);

  // Load messages for a specific contact
  const loadMessages = useCallback(
    async (contactId, limit = 50, offset = 0) => {
      try {
        const response = await authenticatedFetch(
          `chat/messages?userId=${contactId}&limit=${limit}&offset=${offset}`
        );
        if (!response.ok) throw new Error("Failed to load messages");
        const data = await response.json();

        // Update messages state
        setMessages((prev) => ({
          ...prev,
          [contactId]: data,
        }));

        return data;
      } catch (error) {
        console.error("Error loading messages:", error);
        return [];
      }
    },
    [authenticatedFetch]
  );

  // Send a message to a contact
  const sendMessage = useCallback(
    async (receiverId, content) => {
      try {
        const response = await authenticatedFetch("chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId,
            content,
          }),
        });

        if (!response.ok) throw new Error("Failed to send message");
        const message = await response.json();

        // Update local messages state
        setMessages((prev) => {
          const contactMessages = prev[receiverId] || [];
          return {
            ...prev,
            [receiverId]: [...contactMessages, message],
          };
        });

        return message;
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [authenticatedFetch]
  );

  // Mark messages from a sender as read
  const markMessagesAsRead = useCallback(
    async (senderId) => {
      try {
        await authenticatedFetch("chat/mark-read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId,
          }),
        });

        // Update unread counts locally
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: 0,
        }));
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [authenticatedFetch]
  );

  // Send typing indicator with debouncing
  const sendTypingIndicator = useCallback(
    (() => {
      const typingTimeouts = {};

      return async (receiverId) => {
        // Clear any existing timeout for this receiver
        if (typingTimeouts[receiverId]) {
          clearTimeout(typingTimeouts[receiverId]);
        }

        // Set a new timeout - only send after 500ms of inactivity
        typingTimeouts[receiverId] = setTimeout(async () => {
          try {
            await authenticatedFetch("chat/typing", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                receiverId,
              }),
            });

            // Clear the timeout reference
            delete typingTimeouts[receiverId];
          } catch (error) {
            console.error("Error sending typing indicator:", error);
          }
        }, 500); // 500ms debounce time
      };
    })(),
    [authenticatedFetch]
  );

  // Initialize WebSocket subscriptions only once
  const initializeWebSocketSubscriptions = useCallback(() => {
    if (!user?.id || isInitialized) return;

    // Handle new messages
    const messageUnsubscribe = subscribe(
      CHAT_EVENT_TYPES.PRIVATE_MESSAGE,
      (payload) => {
        if (!payload) return;

        const {
          senderId,
          receiverId,
          content,
          createdAt,
          messageId,
          isRead,
          senderName,
          senderAvatar,
        } = payload;

        // Determine which contact this message belongs to
        const contactId = user.id === senderId ? receiverId : senderId;

        // Create message object
        const message = {
          id: messageId,
          senderId,
          receiverId,
          content,
          createdAt,
          isRead,
          sender: {
            id: senderId,
            firstName: senderName.split(" ")[0],
            lastName: senderName.split(" ")[1] || "",
            avatar: senderAvatar,
          },
        };

        // Update messages state
        setMessages((prev) => {
          const contactMessages = prev[contactId] || [];
          return {
            ...prev,
            [contactId]: [...contactMessages, message],
          };
        });

        // Update unread counts if we're the receiver
        if (receiverId === user.id && !isRead) {
          setUnreadCounts((prev) => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));
        }
      }
    );

    // Handle messages read
    const readUnsubscribe = subscribe(
      CHAT_EVENT_TYPES.MESSAGES_READ,
      (payload) => {
        if (!payload) return;

        const { senderId, receiverId, readAt } = payload;

        // If we're the sender, update our messages to the receiver as read
        if (senderId === user.id) {
          setMessages((prev) => {
            const contactMessages = prev[receiverId] || [];
            const updatedMessages = contactMessages.map((msg) => {
              if (msg.senderId === user.id && !msg.isRead) {
                return { ...msg, isRead: true, readAt };
              }
              return msg;
            });

            return {
              ...prev,
              [receiverId]: updatedMessages,
            };
          });
        }
      }
    );

    // Handle typing indicators
    const typingUnsubscribe = subscribe(
      CHAT_EVENT_TYPES.USER_TYPING,
      (payload) => {
        if (!payload) return;

        const { senderId, timestamp } = payload;

        // Set typing status
        setTypingUsers((prev) => ({
          ...prev,
          [senderId]: parseInt(timestamp),
        }));

        // Clear typing status after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => {
            const current = { ...prev };
            if (current[senderId] === parseInt(timestamp)) {
              delete current[senderId];
            }
            return current;
          });
        }, 3000);
      }
    );

    setIsInitialized(true);

    return () => {
      messageUnsubscribe();
      readUnsubscribe();
      typingUnsubscribe();
    };
  }, [user, subscribe, isInitialized]);

  // Initialize WebSocket subscriptions when user is available
  useEffect(() => {
    if (user?.id && !isInitialized) {
      const cleanup = initializeWebSocketSubscriptions();
      return cleanup;
    }
  }, [user, initializeWebSocketSubscriptions, isInitialized]);

  return {
    loadContacts,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    sendTypingIndicator,
    messages,
    typingUsers,
    unreadCounts,
    initializeWebSocketSubscriptions,
  };
};
