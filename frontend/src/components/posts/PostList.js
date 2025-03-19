import React from 'react';
import Post from './Post';
import styles from '@/styles/PostList.module.css';

const PostList = () => {
  // Example post data - replace with actual data from your backend
  const posts = [
    {
      id: 1,
      author: {
        name: "John Doe",
        avatar: "/avatar1.png",
      },
      content: "This is a sample post content",
      timestamp: "2 hours ago",
      likes: 15,
      comments: 5,
      shares: 2,
    },
    // Add more sample posts as needed
  ];

  return (
    <div className={styles.postList}>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList; 