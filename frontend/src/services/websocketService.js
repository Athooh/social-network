"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/authcontext";
import { showToast } from "@/components/ui/ToastContainer";
import { BASE_URL } from "@/utils/constants";

// Event types that match backend definitions
export const EVENT_TYPES = {
  POST_CREATED: "post_created",
  // Add more event types as needed
  // COMMENT_ADDED: 'comment_added',
  // POST_LIKED: 'post_liked',
  // MESSAGE_RECEIVED: 'message_received',
};

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const reconnectAttemptsRef = useRef(0);
  const { isAuthenticated, token, user } = useAuth();
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const baseDelay = 1000; // Start with 1 second delay
  const wasConnectedRef = useRef(false);
  const connectionInProgressRef = useRef(false); // Track if connection is in progress

  // Event listeners storage
  const [eventListeners, setEventListeners] = useState({});

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated || !token) return;

    // Prevent multiple simultaneous connection attempts
    if (connectionInProgressRef.current) {
      console.log("Connection attempt already in progress, skipping");
      return;
    }

    // Don't reconnect if already connected
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected, skipping connection attempt");
      return;
    }

    connectionInProgressRef.current = true;

    // Check if max reconnect attempts reached
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log(
        `Maximum reconnection attempts reached (${maxReconnectAttempts})`
      );
      showToast(
        "Could not establish connection after multiple attempts",
        "error"
      );
      connectionInProgressRef.current = false;
      return;
    }

    // Clear any existing timeouts or intervals
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    // Close existing connection if any
    if (socket) {
      socket.close();
    }

    // Create WebSocket connection with authentication token
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = BASE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const wsUrl = `${wsProtocol}//${wsHost}/ws?token=${token}`;

    console.log("Attempting to connect to WebSocket at:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      wasConnectedRef.current = true;
      connectionInProgressRef.current = false; // Reset connection in progress flag

      // Setup ping interval to keep connection alive
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000); // Send ping every 30 seconds
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        // Update last message state
        setLastMessage(data);

        // Notify listeners for this event type
        if (data.type && eventListeners[data.type]) {
          eventListeners[data.type].forEach((callback) => {
            callback(data.payload);
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
      setIsConnected(false);
      connectionInProgressRef.current = false; // Reset connection in progress flag

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Only attempt to reconnect if:
      // 1. It wasn't a clean closure (normal logout)
      // 2. We haven't reached max reconnect attempts
      if (
        event.code !== 1000 &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptsRef.current += 1;
        const currentAttempt = reconnectAttemptsRef.current;

        const delay = Math.min(
          baseDelay * Math.pow(2, currentAttempt - 1),
          30000
        );
        console.log(
          `Attempting to reconnect in ${delay}ms... (Attempt ${currentAttempt}/${maxReconnectAttempts})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isAuthenticated && token) {
            connect();
          }
        }, delay);
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.log(
          `Maximum reconnection attempts reached (${maxReconnectAttempts})`
        );
        showToast(
          "Could not establish connection after multiple attempts",
          "error"
        );
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      connectionInProgressRef.current = false; // Reset connection in progress flag

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };

    setSocket(ws);
  }, [isAuthenticated, token, eventListeners, socket]);

  // Subscribe to an event type
  const subscribe = useCallback((eventType, callback) => {
    setEventListeners((prev) => {
      const listeners = prev[eventType] || [];
      return {
        ...prev,
        [eventType]: [...listeners, callback],
      };
    });

    // Return unsubscribe function
    return () => {
      setEventListeners((prev) => {
        const listeners = prev[eventType] || [];
        return {
          ...prev,
          [eventType]: listeners.filter((cb) => cb !== callback),
        };
      });
    };
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, "User logged out");
      setSocket(null);
      setIsConnected(false);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on manual disconnect
      wasConnectedRef.current = false;

      // Clear any existing timeouts or intervals
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    }
  }, [socket]);

  // Connect when authenticated
  useEffect(() => {
    let mounted = true;

    if (isAuthenticated && token && mounted) {
      console.log("User authenticated, connecting to WebSocket");
      reconnectAttemptsRef.current = 0; // Reset counter on new connection attempt

      // Add a small delay to prevent rapid connection attempts
      const timer = setTimeout(() => {
        if (mounted) connect();
      }, 300);

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    } else if (!isAuthenticated && mounted) {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (socket) {
        socket.close(1000, "Component unmounted");
      }

      // Clear any existing timeouts or intervals
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Handle window focus/blur for connection management with debounce
  useEffect(() => {
    let visibilityTimeout = null;

    const handleVisibilityChange = () => {
      // Clear any existing timeout to debounce multiple rapid events
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }

      visibilityTimeout = setTimeout(() => {
        if (
          document.visibilityState === "visible" &&
          isAuthenticated &&
          (!socket || socket.readyState !== WebSocket.OPEN)
        ) {
          console.log("Page visible, attempting to reconnect");
          reconnectAttemptsRef.current = 0; // Reset counter on visibility change
          connect();
        }
      }, 1000); // 1 second debounce
    };

    const handleOnline = () => {
      // Clear any existing timeout to debounce multiple rapid events
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }

      visibilityTimeout = setTimeout(() => {
        if (
          isAuthenticated &&
          (!socket || socket.readyState !== WebSocket.OPEN)
        ) {
          console.log("Network online, attempting to reconnect");
          reconnectAttemptsRef.current = 0; // Reset counter when coming back online
          connect();
        }
      }, 1000); // 1 second debounce
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [isAuthenticated, connect, socket]);

  return {
    isConnected,
    lastMessage,
    subscribe,
    disconnect,
  };
};
