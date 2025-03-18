import { useAuth } from "@/context/authcontext"; 

export const usePostService = () => {
  const { authenticatedFetch } = useAuth();

  const createPost = async (formData) => {
    try {
      const response = await authenticatedFetch('posts', {
        method: 'POST',
        body: formData, 
      });

      console.log("Response ",response)
      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();

      console.log("Data ",data)
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  return { createPost };
};