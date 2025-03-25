"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useChatService } from "@/services/chatService";
import { useAuth } from "@/context/authcontext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const chatService = useChatService();
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Initialize chat service when the component mounts
  useEffect(() => {
    if (currentUser?.id) {
      chatService.initializeWebSocketSubscriptions();
    }
  }, [currentUser, chatService]);

  // Function to load contacts data - will be called explicitly from the Messages page
  const loadChatData = async () => {
    if (isDataLoaded || !currentUser?.id) return;

    setLoading(true);
    try {
      const contactsList = await chatService.loadContacts();
      setContacts(contactsList);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        ...chatService,
        contacts,
        loading,
        loadChatData,
        isDataLoaded,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
