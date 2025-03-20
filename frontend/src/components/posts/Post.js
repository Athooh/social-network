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

export default function Post({ post, onPostUpdated }) {
  const { likePost, addComment, getPostComments, deletePost, updatePostLikes } =
    usePostService();
  const { subscribe } = useWebSocketContext();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentImage, setCommentImage] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    shares: post.shares || 0,
    image: post.imageUrl ? `${BASE_URL}${post.imageUrl}` : null,
    video: post.videoUrl ? `${BASE_URL}${post.videoUrl}` : null,
    userId: post.userId,
  };

  // Use formatted data instead of raw post data
  const [likesCount, setLikesCount] = useState(formattedPost.likes);
  const [comments, setComments] = useState(post.comments || []);

  // Add click outside handler
  const handleClickOutside = (e) => {
    if (!e.target.closest(`.${styles.postOptionsContainer}`)) {
      setShowOptions(false);
    }
  };

  // Add event listener when dropdown is open
  useEffect(() => {
    if (showOptions) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showOptions]);

  // Fetch comments when comment section is opened
  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    if (loadingComments) return;

    setLoadingComments(true);
    try {
      const commentsData = await getPostComments(post.id);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleOptionClick = async (action) => {
    switch (action) {
      case "edit":
        console.log("Edit post");
        break;
      case "delete":
        setShowDeleteModal(true);
        break;
      case "follow":
        console.log("Follow user");
        break;
      case "unfollow":
        console.log("Unfollow user");
        break;
    }
    setShowOptions(false);
  };

  const handleLike = async () => {
    try {
      const response = await likePost(post.id);
      // Update local state
      setIsLiked(response.isLiked);
      setLikesCount(response.likesCount);

      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error liking post:", error);
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

      // Format the new comment to match our component's expected format
      const formattedComment = {
        id: newComment.id,
        authorName: user?.name || "You",
        authorImage: user?.profilePicture || "/avatar4.png",
        content: commentText,
        timestamp: "just now",
        imageUrl: newComment.image || null,
      };

      setComments((prev) => [...prev, formattedComment]);
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

  const userData = JSON.parse(localStorage.getItem("userData"));

  const isCurrentUserPost = userData?.id === post.userId;

  const confirmDelete = async () => {
    try {
      await deletePost(post.id);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Add this useEffect to handle real-time like updates from WebSocket
  useEffect(() => {
    // Check if the post ID exists
    if (!post.id) return;

    // Subscribe to post like updates from WebSocket
    const unsubscribe = subscribe(EVENT_TYPES.POST_LIKED, (payload) => {
      // Make sure this update is for our post
      if (Number(payload.postId) === Number(post.id)) {
        setIsLiked(payload.isLiked);
        setLikesCount(payload.likesCount);
      }
    });

    // Clean up subscription when component unmounts
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [post.id, subscribe]);

  return (
    <article className={styles.post}>
      <div className={styles.postHeader}>
        <div className={styles.postAuthor}>
          <img
            src={formattedPost.authorImage}
            alt={formattedPost.authorName}
            className={styles.authorAvatar}
          />
          <div className={styles.authorInfo}>
            <h3>{formattedPost.authorName}</h3>
            <div className={styles.postMeta}>
              <span>{formattedPost.timestamp}</span>
              <span className={styles.dot}>•</span>
              <i
                className={`fas ${
                  formattedPost.privacy === "public"
                    ? "fa-globe-americas"
                    : formattedPost.privacy === "private"
                    ? "fa-lock"
                    : "fa-user-friends"
                }`}
              ></i>
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
              {isCurrentUserPost && (
                <>
                  <button onClick={() => handleOptionClick("edit")}>
                    <i className="fas fa-edit"></i>
                    Edit Post
                  </button>
                  <button onClick={() => handleOptionClick("delete")}>
                    <i className="fas fa-trash-alt"></i>
                    Delete Post
                  </button>
                  <div className={styles.dropdownDivider} />
                </>
              )}
              <button onClick={() => handleOptionClick("follow")}>
                <i className="fas fa-user-plus"></i>
                Follow
              </button>
              <button onClick={() => handleOptionClick("unfollow")}>
                <i className="fas fa-user-minus"></i>
                Unfollow
              </button>
            </div>
          )}
        </div>
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
          <span>{formattedPost.shares} shares</span>
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
              src={user?.profilePicture || "/avatar4.png"}
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

          {!loadingComments && commentsList.length === 0 && (
            <div className={styles.noComments}>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}

          {commentsList.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <img
                src={comment.authorImage}
                alt={comment.authorName}
                className={styles.commentAvatar}
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
                  <span>{comment.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Delete Post</h2>
              <button className={styles.closeButton} onClick={cancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.deleteConfirmText}>
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={cancelDelete}>
                  Cancel
                </button>
                <button className={styles.deleteBtn} onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
