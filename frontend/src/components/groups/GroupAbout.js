import { useState } from 'react';
import styles from '@/styles/GroupAbout.module.css';
import { formatRelativeTime } from '@/utils/dateUtils';

let userdata = null;
try {
  const raw = localStorage.getItem("userData");
  if (raw) userdata = JSON.parse(raw);
  console.log("User data from localStorage:", userdata);
} catch (e) {
  console.error("Invalid userData in localStorage:", e);
}

const GroupAbout = ({ group }) => {
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleLeaveGroup = () => {
    // TODO: Implement leave group functionality
    setShowConfirmLeave(false);
  };

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.mainInfo}>
        <h2>About This Group</h2>
        <div className={styles.description}>
          <p>{group.description}</p>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <i className="fas fa-users"></i>
            <div>
              <h3>{group.memberCount.toLocaleString()}</h3>
              <p>Members</p>
            </div>
          </div>
          <div className={styles.statItem}>
            <i className="fas fa-calendar"></i>
            <div>
              <h3>March 2024</h3>
              <p>Created</p>
            </div>
          </div>
          <div className={styles.statItem}>
            <i className={`fas ${group.privacy === 'private' ? 'fa-lock' : 'fa-globe'}`}></i>
            <div>
              <h3>{group.privacy === 'private' ? 'Private' : 'Public'}</h3>
              <p>Privacy</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.inviteButton}>
            <i className="fas fa-user-plus"></i>
            Invite Members
          </button>
          <button 
            className={styles.leaveButton}
            onClick={() => setShowConfirmLeave(true)}
          >
            <i className="fas fa-sign-out-alt"></i>
            Leave Group
          </button>
        </div>
      </div>

      {showConfirmLeave && (
        <div className={styles.confirmDialog}>
          <div className={styles.dialogContent}>
            <h3>Leave Group?</h3>
            <p>Are you sure you want to leave this group?</p>
            <div className={styles.dialogActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowConfirmLeave(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={handleLeaveGroup}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className={styles.confirmDialog}>
          <div className={styles.dialogContent}>
            <h3>Delete Group?</h3>
            <p>Are you sure you want to Delete this group?</p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleDeleteGroup}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupAbout;