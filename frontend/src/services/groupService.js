import { useAuth } from "@/context/authcontext";
import { showToast } from "@/components/ui/ToastContainer";
import { useState, useEffect, useCallback } from "react";
import { useWebSocket, EVENT_TYPES } from "./websocketService";
import { BASE_URL } from "@/utils/constants";

export const useGroupService = () => {
    const { authenticatedFetch } = useAuth();

    const createGroup = async (formData) => {
        try {
            const response = await authenticatedFetch("groups", {
                method: "POST",
                body: formData,
            });

            console.log("Response from createGroup:", response);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || errorData.error || "Failed to create group"
                );
            }

            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Error creating group:", error);
            showToast(error.message || "Error creating group", "error");
        }
    }

    const getallgroups = async () => {
        try {
            // First fetch all groups
            const response = await authenticatedFetch("groups", {
                method: "GET",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || errorData.error || "Failed to fetch groups"
                );
            }

            const groups = await response.json();

            if (!groups) {
                return [];
            }

            if (!Array.isArray(groups)) {
                throw new Error("Invalid response format");
            }
            

            // Then fetch posts for each group
            const groupsWithPosts = await Promise.all(
                groups.map(async (group) => {
                    const postsResponse = await authenticatedFetch(`groups/posts?groupId=${group.ID}`, {
                        method: "GET",
                    });

                    if (postsResponse.ok) {
                        const posts = await postsResponse.json();
                        return {
                            ...group,
                            posts: posts || []
                        };
                    }
                    return {
                        ...group,
                        posts: []
                    };
                })
            );

            return groupsWithPosts;
        } catch (error) {
            console.error("Error fetching groups:", error);
            showToast(error.message || "Error fetching groups", "error");
            return [];
        }
    }

    const deleteGroup = async (groupId) => {
        try {
            const response = await authenticatedFetch(`groups?id=${groupId}`, {
                method: "DELETE",
            });
            console.log("Response from deleteGroup:", response);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to delete group");
            }

            return true;
        } catch (error) {
            console.error("Error deleting group:", error);
            showToast(error.message || "Error deleting group", "error");
            return false;
        }
    };

    const leaveGroup = async (groupId) => {
        try {
            const response = await authenticatedFetch("groups/leave", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ groupId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to leave group");
            }

            return true;
        } catch (error) {
            console.error("Error leaving group:", error);
            showToast(error.message || "Error leaving group", "error");
            return false;
        }
    };

    const joinGroup = async (groupId) => {
        try {
            const response = await authenticatedFetch("groups/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ groupId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to join group");
            }

            return true;
        } catch (error) {
            console.error("Error joining group:", error);
            showToast(error.message || "Error joining group", "error");
            return false;
        }
    };

    const getgroup = async (groupId) => {
        try {
            // First fetch all groups
            const response = await authenticatedFetch(`groups?id=${groupId}`, {
                method: "GET",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || errorData.error || "Failed to fetch groups"
                );
            }

            const group = await response.json();

            console.log(group)
            return group;
        } catch (error) {
            console.error("Error fetching groups:", error);
            showToast(error.message || "Error fetching groups", "error");
            return [];
        }
    }

    const getgroupposts = async (groupId) => {
        try {
            const response = await authenticatedFetch(`groups/posts?groupId=${groupId}`, {
                method: "GET",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || errorData.error || "Failed to fetch group posts"
                );
            }

            const posts = await response.json();

            return posts;
        } catch (error) {
            console.error("Error fetching group posts:", error);
            showToast(error.message || "Error fetching group posts", "error");
            return [];
        }
    }

    const createPost = async (formData) => {
        try {
          const response = await authenticatedFetch("groups/posts", {
            method: "POST",
            body: formData,
          });
    
          // Check if response is not ok
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || errorData.error || "Failed to create post"
            );
          }
    
          const data = await response.json();
          showToast("Post created successfully!", "success");
          return data;
        } catch (error) {
          console.error("Error creating post:", error);
          showToast(error.message || "Error creating post", "error");
          throw error;
        }
      };

    const createEvent = async (groupId, eventData) => {
        try {
            const formData = new FormData();
            formData.append('groupId', groupId);
            formData.append('title', eventData.name);
            formData.append('description', eventData.description);
            // Format the date to RFC3339 format as required by the backend
            const formattedDate = new Date(eventData.date).toISOString();
            formData.append('eventDate', formattedDate);
            
            if (eventData.banner) {
                formData.append('banner', eventData.banner);
            }

            const response = await authenticatedFetch('groups/events', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create event');
            }

            const data = await response.json();
            showToast('Event created successfully!', 'success');
            return data;
        } catch (error) {
            console.error('Error creating event:', error);
            showToast(error.message || 'Error creating event', 'error');
            throw error;
        }
    };

    const getGroupEvents = async (groupId) => {
        try {
            const response = await authenticatedFetch(`groups/events?groupId=${groupId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch events');
            }

            const events = await response.json();
            return events;
        } catch (error) {
            console.error('Error fetching group events:', error);
            showToast(error.message || 'Error fetching events', 'error');
            return [];
        }
    };

    const respondToEvent = async (eventId, response) => {
        try {
            const resp = await authenticatedFetch('groups/events/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId,
                    response,
                }),
            });

            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to respond to event');
            }

            showToast('Response updated successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error responding to event:', error);
            showToast(error.message || 'Error responding to event', 'error');
            return false;
        }
    };

    const getEventResponses = async (eventId) => {
        try {
            const response = await authenticatedFetch(`groups/events/respond?eventId=${eventId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch responses');
            }

            const responses = await response.json();
            return responses;
        } catch (error) {
            console.error('Error fetching event responses:', error);
            showToast(error.message || 'Error fetching responses', 'error');
            return [];
        }
    };

    return { 
        createGroup,
        getgroup,
        createPost,
        getallgroups, 
        deleteGroup, 
        leaveGroup,
        getgroupposts,
        joinGroup,
        createEvent,
        getGroupEvents,
        respondToEvent,
        getEventResponses,
    };
};