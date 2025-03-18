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

      console.log("Response ", response);
      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const data = await response.json();

      showToast("Post created successfully!", "success");
      return data;
    } catch (error) {
      console.error("Error creating post:", error);
      await handleApiError(error, "Error creating post");
      throw error;
    }
  };

  return { createPost };
};
