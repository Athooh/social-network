import { useAuth } from "@/context/authcontext";
import { showToast } from "@/components/ui/ToastContainer";
import { useState, useEffect } from "react";
import { useWebSocket, EVENT_TYPES } from "./websocketService";
import { BASE_URL } from "@/utils/constants";

export const useFriendService = () => {
  const { authenticatedFetch } = useAuth();
  const [friendRequests, setFriendRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const { subscribe } = useWebSocket();

  // Fetch pending friend requests
  const fetchFriendRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await authenticatedFetch("follow/pending-requests", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to fetch friend requests"
        );
      }

      const data = await response.json();

      if (data) {
        // Transform the data to match our component's expected format
        const formattedRequests = data.map((request) => ({
          id: request.ID,
          name: request.UserName,
          image: request.FollowerAvatar
            ? `${BASE_URL}/uploads/${request.FollowerAvatar}`
            : "/avatar.png",
          mutualFriends: request.MutualFriendsCount || 0,
          followerId: request.FollowerID,
        }));
        setFriendRequests(formattedRequests);

        return formattedRequests;
      }
      return [];
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      return [];
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Fetch contacts (followers/following)
  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const response = await authenticatedFetch("follow/following", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Failed to fetch contacts"
        );
      }

      const data = await response.json();

      if (!data) {
        return [];
      }

      console.log(data);
      // Transform the data to match our component's expected format
      const formattedContacts = data.map((contact) => ({
        id: contact.ID,
        name: contact.UserName,
        image: contact.UserAvatar
          ? `${BASE_URL}/uploads/${contact.UserAvatar}`
          : "/avatar.png",
        isOnline: contact.IsOnline || false,
        userId: contact.FollowerID,
      }));

      setContacts(formattedContacts);
      return formattedContacts;
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Accept a friend request
  const acceptFriendRequest = async (userId) => {
    try {
      const response = await authenticatedFetch("follow/accept", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to accept friend request"
        );
      }

      const data = await response.json();

      if (data.success) {
        showToast("Friend request accepted", "success");
        // Remove the request from the list
        setFriendRequests((prev) =>
          prev.filter((request) => request.followerId !== userId)
        );
        // Refresh contacts list
        fetchContacts();
      }

      return true;
    } catch (error) {
      showToast(error.message || "Error accepting friend request", "error");
      return false;
    }
  };

  // Decline a friend request
  const declineFriendRequest = async (userId) => {
    try {
      const response = await authenticatedFetch("follow/decline", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to decline friend request"
        );
      }

      const data = await response.json();

      if (data.success) {
        showToast("Friend request declined", "success");
        // Remove the request from the list
        setFriendRequests((prev) =>
          prev.filter((request) => request.followerId !== userId)
        );
      }

      return true;
    } catch (error) {
      showToast(error.message || "Error declining friend request", "error");
      return false;
    }
  };

  // Subscribe to friend request events
  useEffect(() => {
    // Listen for new friend requests
    const unsubscribeFollowRequest = subscribe("follow_request", (payload) => {
      if (payload) {
        const newRequest = {
          id: Date.now(), // Temporary ID
          name: payload.followerName,
          image: payload.avatar || "/avatar.png",
          mutualFriends: 0, // We might not have this info from the event
          followerId: payload.followerID,
        };

        setFriendRequests((prev) => [newRequest, ...prev]);
      }
    });

    // Listen for accepted friend requests
    const unsubscribeFollowAccepted = subscribe(
      "follow_request_accepted",
      (payload) => {
        if (payload) {
          // Refresh contacts list when a request is accepted
          fetchContacts();
        }
      }
    );

    return () => {
      if (unsubscribeFollowRequest) unsubscribeFollowRequest();
      if (unsubscribeFollowAccepted) unsubscribeFollowAccepted();
    };
  }, [subscribe]);

  // Initial data fetch
  useEffect(() => {
    fetchFriendRequests();
    fetchContacts();
  }, []);

  return {
    friendRequests,
    contacts,
    acceptFriendRequest,
    declineFriendRequest,
    fetchFriendRequests,
    fetchContacts,
    isLoadingRequests,
    isLoadingContacts,
  };
};
