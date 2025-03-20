"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/context/authcontext";
import { showToast } from "@/components/ui/ToastContainer";
import { BASE_URL } from "@/utils/constants";

// Missing constants for ping/pong
const PING_INTERVAL = 5000; // 30 seconds
const PONG_TIMEOUT = 10000; // 10 seconds

// Event types that match backend definitions
export const EVENT_TYPES = {
  POST_CREATED: "post_created",
  POST_LIKED: "post_liked",
  // Add more event types as needed
  // COMMENT_ADDED: 'comment_added',
  // MESSAGE_RECEIVED: 'message_received',
};

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const reconnectAttemptsRef = useRef(0);
  const { isAuthenticated, token, loading } = useAuth();
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const baseDelay = 1000; // Start with 1 second delay
  const wasConnectedRef = useRef(false);
  const connectionInProgressRef = useRef(false); // Track if connection is in progress
  const isConnectedRef = useRef(false);
  const cleanupInProgressRef = useRef(false);
  const authCheckedRef = useRef(false);

  // Event listeners storage
  const [eventListeners, setEventListeners] = useState({});

  const pongTimeoutRef = useRef(null);
  

  // Cleanup function to properly terminate websocket connections and timers
  const clearTimersAndEvents = useCallback(() => {
    // Clear any existing timeouts or intervals
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (pongTimeoutRef.current) {
      clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }
  }, []);

   // Disconnect WebSocket
   const disconnect = useCallback(() => {
    // Prevent multiple disconnection attempts
    if (cleanupInProgressRef.current) {
      return;
    }
    
    cleanupInProgressRef.current = true;
    
    if (socket) {
      // Only close the socket if it's open
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, "User logged out");
      }
      setSocket(null);
    }
    
    setIsConnected(false);
    isConnectedRef.current = false;
    reconnectAttemptsRef.current = 0;
    wasConnectedRef.current = false;
    connectionInProgressRef.current = false;

    clearTimersAndEvents();
    cleanupInProgressRef.current = false;
   }, [socket, clearTimersAndEvents]);
  
 

  

  // Separate ping/pong setup
  const setupPingPong = useCallback((ws) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not open, skipping ping/pong setup");
      return;
    }

    console.log("Setting up ping/pong for WebSocket connection Clear Timeout");

    console.log("ws send ping",pingIntervalRef.current);


    pingIntervalRef.current = setInterval(() => {

      if (ws.readyState === WebSocket.OPEN) {
        console.log("======ws send ping======");
        try {
          ws.send(JSON.stringify({ type: "ping" }));
          pongTimeoutRef.current = setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.close();
              connect();
            }
          }, PONG_TIMEOUT);
        } catch (err) {
          clearTimersAndEvents();
        }
      } else {
        console.log("WebSocket not open, clearing ping interval");
      }
    }, PING_INTERVAL);
  }, []);

  const resetPingTimer = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      setupPingPong(socket);
    }
  }, [socket, setupPingPong]);
  // Connect to WebSocket with debounce to prevent rapid connection attempts
  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      console.log("Cannot connect: No authentication or token");
      disconnect();
      return;
    }

    // Add check for existing connection using ref
    if (isConnectedRef.current) {
      console.log("Already connected, skipping connection attempt");
      return;
    }

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

    if (socket) {
      socket.close(1000, "Creating new connection");
    }

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
    clearTimersAndEvents();

    // Close existing connection if any
    if (socket) {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, "Creating new connection");
      }
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
      isConnectedRef.current = true; 
      connectionInProgressRef.current = false; // Reset connection in progress flag

      // Start ping/pong
      console.log("setting up ping/pong")
      setupPingPong(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "pong") {
          console.log("Received pong");
          if (pongTimeoutRef.current) {
            clearTimeout(pongTimeoutRef.current);
            pongTimeoutRef.current = null;
          }
          return;
        }
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
      console.log(`WebSocket connection closed: ${event.code} ${event.reason || '<empty string>'}`);
      setIsConnected(false);
      isConnectedRef.current = false;
      connectionInProgressRef.current = false; // Reset connection in progress flag

      // Clear ping interval
      clearTimersAndEvents();

      // Only attempt to reconnect if:
      // 1. It wasn't a clean closure (normal logout)
      // 2. We haven't reached max reconnect attempts
      // 3. User is authenticated
      // 4. Not currently in cleanup
      if (
        event.code !== 1000 &&
        reconnectAttemptsRef.current < maxReconnectAttempts &&
        isAuthenticated && 
        token &&
        !cleanupInProgressRef.current
      ) {
        const currentAttempt = reconnectAttemptsRef.current + 1;
        reconnectAttemptsRef.current = currentAttempt;

        const delay = Math.min(
          baseDelay * Math.pow(2, currentAttempt - 1),
          30000
        );
        console.log(
          `Attempting to reconnect in ${delay}ms... (Attempt ${currentAttempt}/${maxReconnectAttempts})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isAuthenticated && token && !cleanupInProgressRef.current) {
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
      clearTimersAndEvents();
    };

    setSocket(ws);
  }, [isAuthenticated, token, eventListeners, socket, disconnect, clearTimersAndEvents,setupPingPong]);

 
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

  // Initialize connection
  const initialize = useCallback(() => {
    console.log("WebSocketProvider initialized - connection will be handled by auth state");
    // Don't attempt to connect here - the auth state effect will handle this
  }, []);

  // React to authentication state changes
  useEffect(() => {
    // Wait until auth loading is complete before making decisions
    if (loading) {
      console.log("Auth state is still loading, waiting...");
      return;
    }

   // Add a cleanup flag
  let isEffectActive = true;

  if (isAuthenticated && token && !isConnectedRef.current) {
    // Use a single flag for initialization
    if (!authCheckedRef.current) {
      authCheckedRef.current = true;
      console.log("Authentication confirmed, initializing WebSocket");
      
      // Add delay and check flags before connecting
      setTimeout(() => {
        if (isEffectActive && !isConnectedRef.current && !connectionInProgressRef.current) {
          reconnectAttemptsRef.current = 0;

          connect();
        }
      }, 1000);
    }
  } else if (!isAuthenticated) {
    console.log("User not authenticated - cleaning up WebSocket");
    disconnect();
    authCheckedRef.current = false;
  }

  return () => {
    isEffectActive = false;
  };
  }, [isAuthenticated, token, loading, connect, disconnect]);

  // Handle window focus/blur for connection management
  const handleVisibilityChange = useCallback(() => {
   
    if (
      document.visibilityState === "visible" &&
      isAuthenticated &&
      !isConnectedRef.current &&
      !connectionInProgressRef.current &&
      (!socket || socket.readyState !== WebSocket.OPEN)
    ) {
      console.log("Page visible, attempting to reconnect");
      reconnectAttemptsRef.current = 0; // Reset counter on visibility change
      connect();
    }
  }, [isAuthenticated, connect, socket]);

  // Handle online event
  const handleOnline = useCallback(() => {
    if (
      isAuthenticated &&
      !isConnectedRef.current &&
      !connectionInProgressRef.current &&
      (!socket || socket.readyState !== WebSocket.OPEN)
    ) {
      console.log("Network online, attempting to reconnect");
      reconnectAttemptsRef.current = 0; // Reset counter when coming back online
      connect();
    }
  }, [isAuthenticated, connect, socket]);

  // Setup event listeners
  useEffect(() => {
    let visibilityTimeoutId = null;
    
    const handleVisibilityChangeDebounced = () => {
      if (visibilityTimeoutId) {
        clearTimeout(visibilityTimeoutId);
      }
      
      visibilityTimeoutId = setTimeout(() => {
        if (
          document.visibilityState === "visible" &&
          isAuthenticated &&
          !isConnectedRef.current &&
          !connectionInProgressRef.current
        ) {
          console.log("Page visible, checking connection state");
          // connect();
        }
      }, 1000);
    };
  
    document.addEventListener("visibilitychange", handleVisibilityChangeDebounced);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChangeDebounced);
      if (visibilityTimeoutId) {
        clearTimeout(visibilityTimeoutId);
      }
    };
  }, [isAuthenticated, connect]);

  // Cleanup on unmount - to be called in useEffect in the parent component
  const cleanup = useCallback(() => {
    cleanupInProgressRef.current = true;
    
    if (socket) {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, "Component unmounted");
      }
    }

    clearTimersAndEvents();
    
    setSocket(null);
    setIsConnected(false);
    isConnectedRef.current = false;
    connectionInProgressRef.current = false;
    authCheckedRef.current = false;
    
    cleanupInProgressRef.current = false;
  }, [socket, clearTimersAndEvents]);

  return {
    isConnected,
    lastMessage,
    subscribe,
    disconnect,
    initialize,
    cleanup,
  };
};