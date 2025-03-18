import styles from '@/styles/Messages.module.css';

export default function NewMessageModal({ onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>New Message</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className={styles.modalBody}>
          <input
            type="text"
            placeholder="Search people..."
            className={styles.searchPeople}
          />
          <div className={styles.suggestedPeople}>
            {/* Add suggested contacts here */}
          </div>
        </div>
      </div>
    </div>
  );
} 