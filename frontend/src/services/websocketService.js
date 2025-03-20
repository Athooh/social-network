"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/authcontext";
import { BASE_URL } from "@/utils/constants";

// Event types that match backend definitions
export const EVENT_TYPES = {
  POST_CREATED: "post_created",
  POST_LIKED: "post_liked",
  // Add more event types as needed
  // COMMENT_ADDED: 'comment_added',
  // MESSAGE_RECEIVED: 'message_received',
};

// Create a singleton WebSocket instance
let globalSocket = null;
let globalListeners = {};
let reconnectTimeout = null;
let pingInterval = null;

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const { isAuthenticated, token, loading } = useAuth();
  const eventListenersRef = useRef({});

  // Create WebSocket connection
  useEffect(() => {
    if (loading || !isAuthenticated || !token) return;

    // Connect only if no global connection exists
    if (!globalSocket || globalSocket.readyState === WebSocket.CLOSED) {
      connectWebSocket(token, setIsConnected, setLastMessage);
    } else {
      // If connection exists, just update local state
      setIsConnected(globalSocket.readyState === WebSocket.OPEN);
    }

    // Return cleanup that doesn't close the socket
    return () => {
      // Don't close the global socket when component unmounts
      // Only clean up component-specific resources if needed
    };
  }, [isAuthenticated, token, loading]);

  // Subscribe to events
  const subscribe = useCallback((eventType, callback) => {
    if (!eventListenersRef.current[eventType]) {
      eventListenersRef.current[eventType] = [];
    }

    // Add to component-specific listeners
    eventListenersRef.current[eventType].push(callback);

    // Add to global listeners
    if (!globalListeners[eventType]) {
      globalListeners[eventType] = [];
    }
    globalListeners[eventType].push(callback);

    return () => {
      // Remove from global listeners
      if (globalListeners[eventType]) {
        globalListeners[eventType] = globalListeners[eventType].filter(
          (cb) => cb !== callback
        );
      }

      // Remove from component-specific listeners
      if (eventListenersRef.current[eventType]) {
        eventListenersRef.current[eventType] = eventListenersRef.current[
          eventType
        ].filter((cb) => cb !== callback);
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    subscribe,
  };
};

// Separate function to handle WebSocket connection
function connectWebSocket(token, setIsConnected, setLastMessage) {
  // Clear any existing reconnect attempts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  // Clear existing ping interval
  if (pingInterval) {
    clearInterval(pingInterval);
  }

  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsHost = BASE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const wsUrl = `${wsProtocol}//${wsHost}/ws?token=${token}`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connected");
    setIsConnected(true);
  };

  ws.onclose = (event) => {
    console.log("WebSocket disconnected", event.code);
    setIsConnected(false);
    globalSocket = null;

    // Reconnect after delay unless it was a normal closure
    if (event.code !== 1000) {
      reconnectTimeout = setTimeout(() => {
        connectWebSocket(token, setIsConnected, setLastMessage);
      }, 3000);
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      setLastMessage(data);

      // Handle event routing
      const eventType = data.type;
      const payload = data.payload;

      if (globalListeners[eventType]) {
        globalListeners[eventType].forEach((callback) => {
          callback(payload);
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  // Set up ping interval
  pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    }
  }, 30000);

  // Store the socket globally
  globalSocket = ws;
}
