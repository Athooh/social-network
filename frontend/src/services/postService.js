import { useAuth } from "@/context/authcontext";
import { showToast } from "@/components/ui/ToastContainer";
import { handleApiError } from "@/utils/errorHandler";
import { useWebSocket, EVENT_TYPES } from "./websocketService";
import { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "@/utils/constants";
export const usePostService = () => {
  const { authenticatedFetch } = useAuth();
  const { subscribe } = useWebSocket();
  const [newPosts, setNewPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const { currentUserId } = useAuth();

  // Subscribe to post_created events
  useEffect(() => {
    const unsubscribePostCreated = subscribe(
      EVENT_TYPES.POST_CREATED,
      (payload) => {
        if (payload && payload.post) {
          console.log("Received post_created event:", payload);

          // Destructure user data with defaults
          const {
            UserData = {
              firstName: "Unknown",
              lastName: "User",
              avatar: "/avatar4.png",
            },
          } = payload.post;

          // Ensure avatar has absolute URL if it's a relative path
          const avatar = UserData.avatar?.startsWith("http")
            ? UserData.avatar
            : `${BASE_URL}/uploads/${UserData.avatar}`;

          // Ensure the post has all required fields
          const formattedPost = {
            ...payload.post,
            userData: {
              ...UserData,
              avatar, // Use the processed avatar URL
            },
            likesCount: payload.post.LikesCount || 0,
            comments: payload.post.comments || [],
            createdAt: payload.post.createdAt || new Date().toISOString(),
            imageUrl: payload.post.ImagePath?.String
              ? `/uploads/${payload.post.ImagePath.String}`
              : null,
            videoUrl: payload.post.VideoPath?.String
              ? `/uploads/${payload.post.VideoPath.String}`
              : null,
            content: payload.post.Content,
          };

          setNewPosts((prev) => [formattedPost, ...prev]);
        }
      }
    );
  }, [subscribe, currentUserId]);

  const createPost = async (formData) => {
    try {
      const response = await authenticatedFetch("posts", {
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

  const getFeedPosts = async (page = 1, pageSize = 10) => {
    try {
      const response = await authenticatedFetch(
        `posts?page=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Failed to fetch posts"
        );
      }

      const data = await response.json();

      // Update allPosts state when fetching posts
      if (page === 1) {
        setAllPosts(data);
      } else {
        setAllPosts((prev) => [...prev, ...data]);
      }

      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      showToast(error.message || "Error fetching posts", "error");
      throw error;
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await authenticatedFetch(`posts/like/${postId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Failed to like post"
        );
      }

      const data = await response.json();

      console.log("data from like post", data);

      // Use the utility function to update posts
      updatePostLikes(postId, data.likesCount, data.isLiked);

      return data;
    } catch (error) {
      console.error("Error liking post:", error);
      showToast(error.message || "Error liking post", "error");
      throw error;
    }
  };

  const addComment = async (postId, content, image) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const response = await authenticatedFetch(`posts/comments/${postId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Failed to add comment"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast(error.message || "Error adding comment", "error");
      throw error;
    }
  };

  const getPostComments = async (postId) => {
    try {
      const response = await authenticatedFetch(`posts/comments/${postId}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Failed to fetch comments"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching comments:", error);
      showToast(error.message || "Error fetching comments", "error");
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await authenticatedFetch(`posts`, {
        method: "DELETE",
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Failed to delete post"
        );
      }

      showToast("Post deleted successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast(error.message || "Error deleting post", "error");
      throw error;
    }
  };

  // Clear new posts and return them
  const getAndClearNewPosts = useCallback(() => {
    const posts = [...newPosts];
    setNewPosts([]);
    return posts;
  }, [newPosts]);

  const updatePostLikes = useCallback(
    (postId, likesCount, isLiked) => {
      console.log("Updating post likes:", { postId, likesCount, isLiked });

      // Convert postId to number to ensure consistent comparison
      const numericPostId = Number(postId);

      // Debug: Check if posts exist
      const postExistsInNew = newPosts.some(
        (post) => Number(post.id) === numericPostId
      );
      const postExistsInAll = allPosts.some(
        (post) => Number(post.id) === numericPostId
      );
      console.log(
        `Post ${numericPostId} exists in: newPosts=${postExistsInNew}, allPosts=${postExistsInAll}`
      );

      // Update the newPosts state
      setNewPosts((prevPosts) =>
        prevPosts.map((post) =>
          Number(post.id) === numericPostId
            ? { ...post, likesCount, isLiked }
            : post
        )
      );

      // Update allPosts state as well
      setAllPosts((prevPosts) =>
        prevPosts.map((post) =>
          Number(post.id) === numericPostId
            ? { ...post, likesCount, isLiked }
            : post
        )
      );

      // Return the updated data so components can use it
      return { postId: numericPostId, likesCount, isLiked };
    },
    [newPosts, allPosts]
  );

  return {
    createPost,
    getFeedPosts,
    likePost,
    addComment,
    getPostComments,
    deletePost,
    newPosts,
    getAndClearNewPosts,
    updatePostLikes,
    allPosts,
    setAllPosts,
  };
};
