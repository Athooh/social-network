'use client';

import { useState } from 'react';
import styles from '@/styles/Posts.module.css';

export default function Post({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // Add click outside handler
  const handleClickOutside = (e) => {
    if (!e.target.closest(`.${styles.postOptionsContainer}`)) {
      setShowOptions(false);
    }
  };

  // Add event listener when dropdown is open
  useState(() => {
    if (showOptions) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptions]);

  const handleOptionClick = (action) => {
    switch (action) {
      case 'edit':
        console.log('Edit post');
        break;
      case 'delete':
        console.log('Delete post');
        break;
      case 'follow':
        console.log('Follow user');
        break;
      case 'unfollow':
        console.log('Unfollow user');
        break;
    }
    setShowOptions(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      // Add comment logic here
      console.log('New comment:', commentText);
      setCommentText('');
    }
  };

  return (
    <article className={styles.post}>
      <div className={styles.postHeader}>
        <div className={styles.postAuthor}>
          <img src={post.authorImage} alt={post.authorName} className={styles.authorAvatar} />
          <div className={styles.authorInfo}>
            <h3>{post.authorName}</h3>
            <div className={styles.postMeta}>
              <span>{post.timestamp}</span>
              <span className={styles.dot}>•</span>
              <i className="fas fa-globe-americas"></i>
            </div>
          </div>
        </div>
        <div className={styles.postOptionsContainer}>
          <button 
            className={styles.postOptions}
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
          >
            <i className="fas fa-ellipsis-h"></i>
          </button>
          {showOptions && (
            <div className={styles.optionsDropdown}>
              <button onClick={() => handleOptionClick('edit')}>
                <i className="fas fa-edit"></i>
                Edit Post
              </button>
              <button onClick={() => handleOptionClick('delete')}>
                <i className="fas fa-trash-alt"></i>
                Delete Post
              </button>
              <div className={styles.dropdownDivider} />
              <button onClick={() => handleOptionClick('follow')}>
                <i className="fas fa-user-plus"></i>
                Follow
              </button>
              <button onClick={() => handleOptionClick('unfollow')}>
                <i className="fas fa-user-minus"></i>
                Unfollow
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.postContent}>
        <p>{post.content}</p>
        {post.image && (
          <div className={styles.postMedia}>
            <img src={post.image} alt="Post content" />
          </div>
        )}
      </div>

      <div className={styles.postStats}>
        <div className={styles.reactions}>
          <span className={styles.reactionIcons}>
            <i className="fas fa-thumbs-up" style={{ color: '#2078f4' }}></i>
            <i className="fas fa-heart" style={{ color: '#f33e58' }}></i>
          </span>
          <span>{post.likes} likes</span>
        </div>
        <div className={styles.engagement}>
          <span>{post.commentCount} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      <div className={styles.postActions}>
        <button 
          className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
          onClick={handleLike}
        >
          <i className="fas fa-thumbs-up"></i>
          <span>Like</span>
        </button>
        <button 
          className={styles.actionButton}
          onClick={() => setShowComments(!showComments)}
        >
          <i className="fas fa-comment"></i>
          <span>Comment</span>
        </button>
        <button className={styles.actionButton}>
          <i className="fas fa-share"></i>
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className={styles.commentsSection}>
          <form onSubmit={handleComment} className={styles.commentForm}>
            <img src="/avatar4.png" alt="Your avatar" className={styles.commentAvatar} />
            <div className={styles.commentInput}>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit" disabled={!commentText.trim()}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
          
          {post.comments && post.comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <img src={comment.authorImage} alt={comment.authorName} className={styles.commentAvatar} />
              <div className={styles.commentContent}>
                <div className={styles.commentBubble}>
                  <h4>{comment.authorName}</h4>
                  <p>{comment.content}</p>
                </div>
                <div className={styles.commentActions}>
                  <button>Like</button>
                  <button>Reply</button>
                  <span>{comment.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
} 