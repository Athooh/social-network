import { useState } from 'react';
import styles from '@/styles/GroupPhotos.module.css';  // Update import to use correct CSS module

const GroupPhotos = () => {
  // Add more dummy photos to test grid layout
  const [photos] = useState([
    { id: 1, url: '/banner1.jpg', createdAt: '2024-05-01' },
    { id: 2, url: '/banner2.jpg', createdAt: '2024-05-01' },
    { id: 3, url: '/banner3.jpg', createdAt: '2024-05-01' },
    { id: 4, url: '/banner4.jpg', createdAt: '2024-05-01' },
    { id: 5, url: '/banner5.jpg', createdAt: '2024-05-01' },
    { id: 6, url: '/banner6.jpg', createdAt: '2024-05-01' },
    { id: 7, url: '/banner7.jpg', createdAt: '2024-05-01' },
    // Add more photos as needed
  ]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 20;

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(photos.length / photosPerPage);
  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);

  return (
    <div className={styles.photosContainer}>
      <div className={styles.mainContent}>
        <h2>Group Photos</h2>
        <div className={styles.photoGrid}>
          {currentPhotos.map((photo, index) => (
            <div 
              key={photo.id} 
              className={styles.photoItem}
              onClick={() => handlePhotoClick(index)}
            >
              <img 
                src={photo.url} 
                alt={`Group photo ${index + 1}`}
                loading="lazy" // Add lazy loading for better performance
              />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? styles.active : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPhotoIndex !== null && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseModal}>×</button>
            <img 
              src={photos[selectedPhotoIndex].url} 
              alt={`Selected photo ${selectedPhotoIndex + 1}`} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPhotos;