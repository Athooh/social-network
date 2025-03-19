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

  return { createPost };
};
