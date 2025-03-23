import React, { useState } from 'react';
import styles from '@/styles/ProfilePhotos.module.css';
import ContactsList from '@/components/contacts/ContactsList';

const ProfilePhotos = () => {
  // Example photo data - replace with actual data from your backend
  const [photos] = useState([
    { id: 1, url: '/banner1.jpg' },
    { id: 2, url: '/banner2.jpg' },
    { id: 3, url: '/banner3.jpg' },
    { id: 4, url: '/banner4.jpg' },
    { id: 5, url: '/banner5.jpg' },
    { id: 6, url: '/banner6.jpg' },
    { id: 7, url: '/banner7.jpg' },
    { id: 8, url: '/image1.jpg' },
    { id: 9, url: '/image2.jpg' },
    { id: 10, url: '/banner.png' },
    // Add more photos as needed
  ]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : photos.length - 1
    );
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => 
      prev < photos.length - 1 ? prev + 1 : 0
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (selectedPhotoIndex === null) return;
    
    switch(e.key) {
      case 'ArrowLeft':
        handlePrevPhoto();
        break;
      case 'ArrowRight':
        handleNextPhoto();
        break;
      case 'Escape':
        handleCloseModal();
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex]);

  return (
    <div className={styles.photosContainer}>
      <div className={styles.mainContent}>
        <h2>Photos</h2>
        <div className={styles.photoGrid}>
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className={styles.photoItem}
              onClick={() => handlePhotoClick(index)}
            >
              <img src={photo.url} alt="User photo" />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.sidebar}>
        <ContactsList />
      </div>

      {selectedPhotoIndex !== null && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              ×
            </button>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={handlePrevPhoto}
            >
              ‹
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNextPhoto}
            >
              ›
            </button>
            <img src={photos[selectedPhotoIndex].url} alt="Selected photo" />
            <div className={styles.photoCounter}>
              {selectedPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotos; 