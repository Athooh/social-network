import React from 'react';
import styles from '@/styles/ProfileAboutSection.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPenToSquare,
  faBriefcase,
  faGraduationCap,
  faEnvelope,
  faGlobe,
  faPhone,
  faHouse,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';

const ProfileAboutSection = ({ userInfo }) => {
  return (
    <div className={styles.aboutSection}>
      {/* About Section */}
      <div className={styles.about}>
        <h3>About</h3>
        <p className={styles.bio}>
          Lorem ipsum dolor sit amet cons all Ofectetur. Pellentesque ipsum necat 
          congue pretium cursus orci. It Commodo donec tellus lacus pellentesque 
          sagittis habitant quam amet praesent.
        </p>
        <button className={styles.editButton}>
          <FontAwesomeIcon icon={faPenToSquare} />
          Edit Bio
        </button>
      </div>

      {/* Info Section */}
      <div className={styles.info}>
        <h3>Info</h3>
        <ul className={styles.infoList}>
          <li>
            <FontAwesomeIcon icon={faBriefcase} className={styles.icon} />
            <span>Developer</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faGraduationCap} className={styles.icon} />
            <span>Master's degree</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
            <span>test@mail.com</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faGlobe} className={styles.icon} />
            <span>www.wisoky.com</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faPhone} className={styles.icon} />
            <span>(316) 555-0116</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faHouse} className={styles.icon} />
            <span>USA</span>
          </li>
          <li>
            <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
            <span>775 Rolling Green Rd.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileAboutSection; 