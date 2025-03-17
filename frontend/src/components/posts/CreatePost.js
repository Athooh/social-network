'use client';

import { useState } from 'react';
import styles from '@/styles/Posts.module.css';

export default function CreatePost() {
  const [postText, setPostText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPostText('');
    setSelectedFiles([]);
    setPreviewUrls([]);
    setIsModalOpen(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
                <img src="/avatar4.png" alt="Profile" className={styles.profilePic} />
                <div>
                  <h3>John Doe</h3>
                  <button className={styles.privacyButton}>
                    <i className="fas fa-globe"></i>
                    Public
                    <i className="fas fa-caret-down"></i>
                  </button>
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
                        {url.includes('image') ? (
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
                      <i className="fas fa-images" style={{color: '#45bd62'}}></i>
                    </label>
                    <button type="button">
                      <i className="fas fa-user-tag" style={{color: '#1877f2'}}></i>
                    </button>
                    <button type="button">
                      <i className="fas fa-face-smile" style={{color: '#f7b928'}}></i>
                    </button>
                    <button type="button">
                      <i className="fas fa-map-marker-alt" style={{color: '#f5533d'}}></i>
                    </button>
                    <button type="button">
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
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