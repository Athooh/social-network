"use client";

import { useState } from "react";
import { usePostService } from "@/services/postService"; // Adjust the import path
import styles from "@/styles/Posts.module.css";
import { showToast } from "@/components/ui/ToastContainer";

export default function CreatePost() {
  const { createPost } = usePostService();
  const [postText, setPostText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [privacy, setPrivacy] = useState("public");
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("content", postText);
    formData.append("privacy", privacy);
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    if (!postText && !selectedFiles.length) {
      showToast("Please enter a post content or add media", "error");
      return;
    }

    try {
      await createPost(formData);

      setPostText("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case "public":
        return "fas fa-globe";
      case "private":
        return "fas fa-lock";
      case "almost_private":
        return "fas fa-user-friends";
      default:
        return "fas fa-globe";
    }
  };

  const getPrivacyText = () => {
    switch (privacy) {
      case "public":
        return "Public";
      case "private":
        return "Private";
      case "almost_private":
        return "Almost Private";
      default:
        return "Public";
    }
  };

  return (
    <>
      <div className={styles.createPostCard}>
        <div className={styles.createPostHeader}>
          <img src="/avatar4.png" alt="Profile" className={styles.profilePic} />
          <div
            className={styles.createPostInput}
            onClick={() => setIsModalOpen(true)}
          >
            <input
              type="text"
              placeholder="What's on your mind, John?"
              readOnly
            />
          </div>
        </div>
        <div className={styles.createPostFooter}>
          <button className={styles.mediaButton}>
            <i className="fas fa-video"></i>
            <span>Live Video</span>
          </button>
          <button className={styles.mediaButton}>
            <i className="fas fa-images"></i>
            <span>Photo/Video</span>
          </button>
          <button className={styles.mediaButton}>
            <i className="fas fa-face-smile"></i>
            <span>Feeling/Activity</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create Post</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.userInfo}>
                <img
                  src="/avatar4.png"
                  alt="Profile"
                  className={styles.profilePic}
                />
                <div>
                  <h3>John Doe</h3>
                  <div className={styles.privacySelector}>
                    <button
                      className={styles.privacyButton}
                      onClick={() =>
                        setShowPrivacyDropdown(!showPrivacyDropdown)
                      }
                    >
                      <i className={getPrivacyIcon()}></i>
                      {getPrivacyText()}
                      <i className="fas fa-caret-down"></i>
                    </button>

                    {showPrivacyDropdown && (
                      <div className={styles.privacyDropdown}>
                        <div
                          className={`${styles.privacyOption} ${privacy === "public" ? styles.selected : ""}`}
                          onClick={() => {
                            setPrivacy("public");
                            setShowPrivacyDropdown(false);
                          }}
                        >
                          <i className="fas fa-globe"></i>
                          <div>
                            <span>Public</span>
                            <p className={styles.privacyDescription}>Anyone can see this post</p>
                          </div>
                        </div>
                        <div
                          className={`${styles.privacyOption} ${privacy === "private" ? styles.selected : ""}`}
                          onClick={() => {
                            setPrivacy("private");
                            setShowPrivacyDropdown(false);
                          }}
                        >
                          <i className="fas fa-lock"></i>
                          <div>
                            <span>Private</span>
                            <p className={styles.privacyDescription}>Only you can see this post</p>
                          </div>
                        </div>
                        <div
                          className={`${styles.privacyOption} ${privacy === "almost_private" ? styles.selected : ""}`}
                          onClick={() => {
                            setPrivacy("almost_private");
                            setShowPrivacyDropdown(false);
                          }}
                        >
                          <i className="fas fa-user-friends"></i>
                          <div>
                            <span>Almost Private</span>
                            <p className={styles.privacyDescription}>Only friends can see this post</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What's on your mind, John?"
                  autoFocus
                />

                {previewUrls.length > 0 && (
                  <div className={styles.previewGrid}>
                    {previewUrls.map((url, index) => (
                      <div key={index} className={styles.previewItem}>
                        {url.includes("image") ? (
                          <img src={url} alt="Preview" />
                        ) : (
                          <video src={url} controls />
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className={styles.removePreview}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.addToPost}>
                  <h4>Add to your post</h4>
                  <div className={styles.mediaButtons}>
                    <label className={styles.mediaLabel}>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        hidden
                      />
                      <i
                        className="fas fa-images"
                        style={{ color: "#45bd62" }}
                      ></i>
                    </label>
                    <button type="button">
                      <i
                        className="fas fa-user-tag"
                        style={{ color: "#1877f2" }}
                      ></i>
                    </button>
                    <button type="button">
                      <i
                        className="fas fa-face-smile"
                        style={{ color: "#f7b928" }}
                      ></i>
                    </button>
                    <button type="button">
                      <i
                        className="fas fa-map-marker-alt"
                        style={{ color: "#f5533d" }}
                      ></i>
                    </button>
                    <button type="button">
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  className={styles.postButton}
                  disabled={!postText && !selectedFiles.length}
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
