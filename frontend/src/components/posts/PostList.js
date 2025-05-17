import React, { useState, useEffect } from "react";
import Post from "./Post";
import styles from "@/styles/PostList.module.css";
import { usePostService } from "@/services/postService";

const PostList = ({ userData }) => {
  const { getUserPosts } = usePostService();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      if (!userData || !userData.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userPosts = await getUserPosts(userData.id);
        console.log("Fetched posts:", userPosts);

        if (isMounted) {
          setPosts(userPosts);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        if (isMounted) {
          setError(err.message || "Failed to load posts");
          setIsLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [userData?.id]);

  if (isLoading) {
    return <div className={styles.loading}>Loading posts...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.postList}>
      {posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post.id}
            post={{
              id: post.id,
              author: {
                id: post.userData?.id || post.userId,
                name: post.userData
                  ? `${post.userData.firstName} ${post.userData.lastName}`
                  : "Unknown User",
                avatar: post.userData?.avatar || "/default-avatar.png",
              },
              content: post.content,
              imageUrl: post.imageUrl,
              videoUrl: post.videoUrl,
              privacy: post.privacy,
              timestamp: post.createdAt,
              updatedAt: post.updatedAt,
            }}
          />
        ))
      ) : (
        <div className={styles.noPosts}>No posts found</div>
      )}
    </div>
  );
};

export default PostList;
