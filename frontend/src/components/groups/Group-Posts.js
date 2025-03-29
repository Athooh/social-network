"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/Posts.module.css";
import { usePostService } from "@/services/postService";
import { showToast } from "@/components/ui/ToastContainer";
import { useAuth } from "@/context/authcontext";
import { formatRelativeTime } from "@/utils/dateUtils";
import { BASE_URL } from "@/utils/constants";
import { useWebSocketContext } from "@/context/websocketContext";
import { EVENT_TYPES } from "@/services/websocketService";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useWebSocket } from "@/services/websocketService";
import Image from "next/image";

export default function GroupPost({ post, onPostUpdated }) {
  const {
    likePost,
    addComment,
    getPostComments,
    deletePost,
    deleteComment,
    updatePostLikes,
  } = usePostService();
  const { subscribe } = useWebSocket();
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentImage, setCommentImage] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Format the post data to match component expectations
  const formattedPost = {
    id: post.id,
    authorName: post.userData
      ? `${post.userData.firstName} ${post.userData.lastName}`
      : "Unknown User",
    authorImage: post.userData?.avatar
      ? post.userData.avatar.startsWith("http")
        ? post.userData.avatar
        : `${BASE_URL}${post.userData.avatar}`
      : "/avatar4.png",
    content: post.content,
    timestamp: formatRelativeTime(post.createdAt),
    privacy: post.privacy,
    likes: post.likesCount || 0,
    commentCount: post.comments?.length || 0,
    image: post.imageUrl ? `${BASE_URL}${post.imageUrl}` : null,
    video: post.videoUrl ? `${BASE_URL}${post.videoUrl}` : null,
    userId: post.userId,
    groupName: post.groupName, // Added group context
  };

  const [likesCount, setLikesCount] = useState(formattedPost.likes);
  const [comments, setComments] = useState(post.comments || []);

  // Handle click outside for options menu
  useEffect(() => {
    if (showOptions) {
      const handleClickOutside = (e) => {
        if (!e.target.closest(`.${styles.postOptionsContainer}`)) {
          setShowOptions(false);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showOptions]);

  // Fetch comments when comment section is opened
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const commentsData = await getPostComments(post.id);
      if (commentsData) {
        setComments(commentsData.map(comment => ({
          ...comment,
          imageUrl: comment.imageUrl ? `${BASE_URL}${comment.imageUrl}` : null,
          authorName: `${comment.userData.firstName} ${comment.userData.lastName}`,
          authorImage: comment.userData.avatar
            ? comment.userData.avatar.startsWith("http")
              ? comment.userData.avatar
              : `${BASE_URL}/uploads/${comment.userData.avatar}`
            : "/avatar4.png",
          timestamp: formatRelativeTime(comment.createdAt)
        })));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Simplified options menu for group posts
  const handleOptionClick = async (action) => {
    switch (action) {
      case "delete":
        showConfirmation({
          title: "Delete Post",
          message: "Are you sure you want to delete this post? This action cannot be undone.",
          onConfirm: confirmDelete,
        });
        break;
    }
    setShowOptions(false);
  };

  const handleDeleteComment = (comment) => {
    showConfirmation({
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment?",
      onConfirm: () => confirmDeleteComment(comment.id),
    });
  };

  const confirmDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((comment) => comment.id !== commentId));
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deletePost(post.id);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await likePost(post.id);
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error liking post:", error);
      showToast("Failed to like post", "error");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) {
      showToast("Please enter a comment or add an image", "error");
      return;
    }

    try {
      const newComment = await addComment(post.id, commentText, commentImage);
      setComments(prev => [...prev, {
        ...newComment,
        authorName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "You",
        authorImage: currentUser?.avatar || "/avatar4.png",
        timestamp: "just now"
      }]);
      setCommentText("");
      setCommentImage(null);
      setCommentImagePreview(null);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCommentImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    setCommentImage(file);
    setCommentImagePreview(URL.createObjectURL(file));
  };

  const removeCommentImage = () => {
    setCommentImage(null);
    if (commentImagePreview) {
      URL.revokeObjectURL(commentImagePreview);
      setCommentImagePreview(null);
    }
  };

  const isCurrentUserPost = currentUser?.id === post.userId;

  // Render the post content
  return (
    <article className={styles.post}>
      <div className={styles.postHeader}>
        <div className={styles.postAuthor}>
          <img src={formattedPost.authorImage} alt={formattedPost.authorName} className={styles.authorAvatar} />
          <div className={styles.authorInfo}>
            <h3>{formattedPost.authorName}</h3>
            <div className={styles.postMeta}>
              <span>{formattedPost.timestamp}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.groupName}>{formattedPost.groupName}</span>
            </div>
          </div>
        </div>
        {currentUser?.id === post.userId && (
          <div className={styles.postOptionsContainer}>
            <button className={styles.postOptions} onClick={() => setShowOptions(!showOptions)}>
              <i className="fas fa-ellipsis-h"></i>
            </button>
            {showOptions && (
              <div className={styles.optionsDropdown}>
                <button onClick={() => handleOptionClick("delete")}>
                  <i className="fas fa-trash-alt"></i> Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.postContent}>
        <p>{formattedPost.content}</p>
        {formattedPost.image && (
          <div className={styles.postMedia}>
            <img src={formattedPost.image} alt="Post content" />
          </div>
        )}
        {formattedPost.video && (
          <div className={styles.postMedia}>
            <video
              src={formattedPost.video}
              controls
              className={styles.videoContent}
            />
          </div>
        )}
      </div>

      <div className={styles.postStats}>
        <div className={styles.reactions}>
          <span className={styles.reactionIcons}>
            <i className="fas fa-thumbs-up" style={{ color: "#2078f4" }}></i>
            <i className="fas fa-heart" style={{ color: "#f33e58" }}></i>
          </span>
          <span>{likesCount} likes</span>
        </div>
        <div className={styles.engagement}>
          <span>{formattedPost.commentCount} comments</span>
        </div>
      </div>

      <div className={styles.postActions}>
        <button
          className={`${styles.actionButton} ${isLiked ? styles.liked : ""}`}
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
            <img
              src={currentUser?.avatar || "/avatar4.png"}
              alt="Your avatar"
              className={styles.commentAvatar}
            />
            <div className={styles.commentInput}>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <label className={styles.commentImageLabel}>
                <i className="fas fa-camera"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCommentImageChange}
                  style={{ display: "none" }}
                />
              </label>
              <button
                type="submit"
                disabled={!commentText.trim() && !commentImage}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>

          {commentImagePreview && (
            <div className={styles.commentImagePreview}>
              <img src={commentImagePreview} alt="Comment attachment" />
              <button
                className={styles.removeCommentImage}
                onClick={removeCommentImage}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {loadingComments && (
            <div className={styles.commentsLoading}>
              <div className={styles.spinner}></div>
              <p>Loading comments...</p>
            </div>
          )}

          {!loadingComments && comments && comments.length === 0 && (
            <div className={styles.noComments}>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}

          {comments && comments.map((comment) => {
            const isCommentOwner = currentUser?.id === comment.userData?.id;

            return (
              <div key={`comment-${comment.id}`} className={styles.comment}>
                <Image
                  src={comment.authorImage || "/avatar4.png"}
                  alt={`${comment.authorName}'s avatar`}
                  height={32}
                  width={32}
                  className={styles.commentAvatar}
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.src = "/avatar4.png";
                  }}
                />
                <div className={styles.commentContent}>
                  <div className={styles.commentBubble}>
                    <h4>{comment.authorName}</h4>
                    <p>{comment.content}</p>
                    {comment.imageUrl && (
                      <div className={styles.commentImage}>
                        <img src={comment.imageUrl} alt="Comment attachment" />
                      </div>
                    )}
                  </div>
                  <div className={styles.commentActions}>
                    <button>Like</button>
                    <button>Reply</button>
                    {isCommentOwner && (
                      <button
                        className={styles.deleteCommentBtn}
                        onClick={() => handleDeleteComment(comment)}
                      >
                        Delete
                      </button>
                    )}
                    <span>{comment.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
      />
    </article>
  );
}
