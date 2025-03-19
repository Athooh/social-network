"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/Posts.module.css";
import { usePostService } from "@/services/postService";
import { showToast } from "@/components/ui/ToastContainer";
import { useAuth } from "@/context/authcontext";

export default function Post({ post, onPostUpdated }) {
  const { likePost, addComment, getPostComments, deletePost } =
    usePostService();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentImage, setCommentImage] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      await likePost(post.id);
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
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
        timestamp: "Just now",
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

  return (
    <article className={styles.post}>
      <div className={styles.postHeader}>
        <div className={styles.postAuthor}>
          <img
            src={post.authorImage}
            alt={post.authorName}
            className={styles.authorAvatar}
          />
          <div className={styles.authorInfo}>
            <h3>{post.authorName}</h3>
            <div className={styles.postMeta}>
              <span>{post.timestamp}</span>
              <span className={styles.dot}>•</span>
              <i
                className={`fas ${
                  post.privacy === "public"
                    ? "fa-globe-americas"
                    : post.privacy === "private"
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
        <p>{post.content}</p>
        {post.image && (
          <div className={styles.postMedia}>
            <img src={post.image} alt="Post content" />
          </div>
        )}
        {post.video && (
          <div className={styles.postMedia}>
            <video src={post.video} controls className={styles.videoContent} />
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
          <span>{post.commentCount} comments</span>
          <span>{post.shares} shares</span>
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

          {!loadingComments && comments.length === 0 && (
            <div className={styles.noComments}>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}

          {comments.map((comment) => (
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
