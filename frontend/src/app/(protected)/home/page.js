"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/header/Header";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import RightSidebar from "@/components/sidebar/RightSidebar";
import CreatePost from "@/components/posts/CreatePost";
import Post from "@/components/posts/Post";
import styles from "@/styles/page.module.css";
import postStyles from "@/styles/Posts.module.css";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChatSidebarFloat from "@/components/chat/ChatSidebarFloat";
import { usePostService } from "@/services/postService";
import { showToast } from "@/components/ui/ToastContainer";
import { BASE_URL } from "@/utils/constants";

const contacts = [
  {
    id: 1,
    name: "Jane Smith",
    avatar: "/avatar1.png",
    online: true,
    unreadCount: 2,
    messages: [
      { id: 1, content: "Hey there!", isSent: false },
      { id: 2, content: "Hi! How are you?", isSent: true },
    ],
  },
  {
    id: 2,
    name: "John Doe",
    avatar: "/avatar4.png",
    online: false,
    unreadCount: 0,
    messages: [],
  },
  // Add more contacts as needed
];

const pageSize = 10; // Match this with the default in getFeedPosts

export default function Home() {
  const { getFeedPosts, createPost } = usePostService();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Function to format posts from API to match our component's expected format
  const formatPosts = (apiPosts) => {
    if (!apiPosts) return [];
    
    return apiPosts.map((post) => ({
      id: post.id,
      authorName:
        post.userData.firstName + " " + post.userData.lastName ||
        "Unknown User",
      authorImage: `${BASE_URL}${post.userData.avatar}` || "/avatar4.png",
      timestamp: formatTimestamp(post.createdAt),
      content: post.content,
      image: post.imageUrl ? `${BASE_URL}${post.imageUrl}` : null,
      video: post.videoUrl ? `${BASE_URL}${post.videoUrl}` : null,
      likes: post.likesCount || 0,
      commentCount: post.comments?.length || 0,
      shares: 0, // If backend doesn't provide shares count
      comments: Array.isArray(post.comments) 
        ? post.comments.map((comment) => ({
            id: comment.id,
            authorName:
              comment.userData?.firstName + " " + comment.userData?.lastName ||
              "Unknown User",
            authorImage:
              `${BASE_URL}${comment.userData?.avatar}` || "/avatar1.png",
            image: comment.imageUrl ? `${BASE_URL}${comment.imageUrl}` : null,
            content: comment.content,
            timestamp: formatTimestamp(comment.createdAt),
          }))
        : [],
      privacy: post.privacy,
      userId: post.userId,
    }));
  };

  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  // Function to fetch posts
  const fetchPosts = async (pageNum) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getFeedPosts(pageNum, pageSize);

      const formattedPosts = formatPosts(data);

      setPosts((prev) => {
        if (pageNum === 1) {
          return formattedPosts;
        } else {
          // Filter out duplicates when appending new posts
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = formattedPosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        }
      });

      // Check if we received fewer posts than requested page size
      // This indicates we've reached the end of available posts
      setHasMore(formattedPosts.length >= pageSize);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refresh when page changes
  useEffect(() => {
    fetchPosts(page);
  }, [page, refreshTrigger]);

  // Handle post creation success
  const handlePostCreated = () => {
    // Reset to page 1 and refresh the feed
    setPage(1);
    setRefreshTrigger((prev) => prev + 1);
    showToast("Post created successfully!", "success");
  };

  return (
    <ProtectedRoute>
      <Header />
      <div className={styles.container}>
        <aside>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          <section className={postStyles.CreatePost}>
            <CreatePost onPostCreated={handlePostCreated} />
          </section>
          <section className={postStyles.postsContainer}>
            {posts.length === 0 && !loading && !error && (
              <div className={postStyles.emptyState}>
                <i className="fas fa-newspaper fa-3x"></i>
                <h3>Your feed is empty</h3>
                <p>
                  Share your thoughts, photos, or videos by creating your first
                  post above!
                </p>
                <p>
                  You can also follow friends to see their posts in your feed.
                </p>
              </div>
            )}

            {error && (
              <div className={postStyles.errorState}>
                <i className="fas fa-exclamation-circle fa-3x"></i>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button
                  onClick={() => {
                    setPage(1);
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                  className={postStyles.retryButton}
                >
                  Try Again
                </button>
              </div>
            )}

            {posts.map((post, index) => {
              if (posts.length === index + 1) {
                return (
                  <div ref={lastPostElementRef} key={post.id}>
                    <Post
                      post={post}
                      onPostUpdated={() =>
                        setRefreshTrigger((prev) => prev + 1)
                      }
                    />
                  </div>
                );
              } else {
                return (
                  <Post
                    key={post.id}
                    post={post}
                    onPostUpdated={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                );
              }
            })}

            {loading && (
              <div className={postStyles.loadingState}>
                <div className={postStyles.spinner}></div>
                <p>Loading posts...</p>
              </div>
            )}

            {!loading && !hasMore && posts.length > 0 && (
              <div className={postStyles.endOfFeed}>
                <p>You've reached the end of your feed!</p>
              </div>
            )}
          </section>
        </main>
        <aside>
          <RightSidebar />
        </aside>
      </div>
      <ChatSidebarFloat contacts={contacts} />
    </ProtectedRoute>
  );
}
