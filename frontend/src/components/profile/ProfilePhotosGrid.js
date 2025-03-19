import React from 'react';
import Image from 'next/image';
import styles from '@/styles/ProfilePhotoGrid.module.css';

const ProfilePhotosGrid = ({ photos = [], totalPhotos = 0 }) => {
  // Show only first 6 photos
  const displayPhotos = photos.slice(0, 6);
  const remainingPhotos = totalPhotos - 5;

  return (
    <div className={styles.photosSection}>
      <div className={styles.sectionHeader}>
        <h3>Photos</h3>
        <a href="#" className={styles.seeAll}>See all</a>
      </div>
      
      <div className={styles.photoGrid}>
        {displayPhotos.map((photo, index) => (
          <div key={index} className={styles.photoItem}>
            {index === 5 && remainingPhotos > 0 ? (
              <>
                <Image
                  src={photo.url || '/photo1.jpg'}
                  alt={`Photo ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.photo}
                />
                <div className={styles.overlay}>
                  <span>+{remainingPhotos}</span>
                </div>
              </>
            ) : (
              <Image
                src={photo.url || '/default-photo.jpg'}
                alt={`Photo ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={styles.photo}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePhotosGrid; 