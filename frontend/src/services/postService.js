import { useAuth } from "@/context/authcontext";
import { showToast } from "@/components/ui/ToastContainer";
import { handleApiError } from "@/utils/errorHandler";

export const usePostService = () => {
  const { authenticatedFetch } = useAuth();

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

      return await response.json();
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

      return await response.json();
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

  return {
    createPost,
    getFeedPosts,
    likePost,
    addComment,
    getPostComments,
    deletePost,
  };
};
