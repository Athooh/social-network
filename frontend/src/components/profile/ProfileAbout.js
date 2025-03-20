import React, { useState } from 'react';
import styles from '@/styles/ProfileAbout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, 
  faEllipsisH, 
  faBriefcase, 
  faGraduationCap, 
  faEnvelope, 
  faLink, 
  faPhone, 
  faHouse, 
  faLocationDot,
  faLock,
  faUser,
  faShare,
  faPenToSquare,
  faTrash,
  faCode,
  faBook
} from '@fortawesome/free-solid-svg-icons';
import ProfilePhotosGrid from './ProfilePhotosGrid';
import ContactsList from '../contacts/ContactsList';

const ProfileAbout = () => {
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showActionsPopup, setShowActionsPopup] = useState(false);

  // Add the same photos data as in the profile page
  const photos = [
    { url: '/photo1.jpg' },
    { url: '/photo2.jpg' },
    { url: '/photo3.jpg' },
    { url: '/photo4.jpg' },
    { url: '/photo5.jpg' },
    { url: '/photo6.jpg' },
  ];

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.mainContent}>
        <div className={styles.overviewSection}>
          <h2>Overview</h2>
          <div className={styles.highlightCards}>
            <div className={styles.highlightCard}>
              <FontAwesomeIcon icon={faBriefcase} className={styles.highlightIcon} />
              <div className={styles.highlightContent}>
                <h3>Work</h3>
                <p>Senior Developer at Tech Corp</p>
                <p className={styles.timeperiod}>2020 - Present</p>
              </div>
            </div>
            <div className={styles.highlightCard}>
              <FontAwesomeIcon icon={faGraduationCap} className={styles.highlightIcon} />
              <div className={styles.highlightContent}>
                <h3>Education</h3>
                <p>Master's in Computer Science</p>
                <p className={styles.timeperiod}>2018 - 2020</p>
              </div>
            </div>
            <div className={styles.highlightCard}>
              <FontAwesomeIcon icon={faLocationDot} className={styles.highlightIcon} />
              <div className={styles.highlightContent}>
                <h3>Location</h3>
                <p>San Francisco, CA</p>
                <p className={styles.timeperiod}>From New York</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bioSection}>
          <div className={styles.sectionHeader}>
            <h2>About</h2>
            <div className={styles.actionButtons}>
              <button 
                className={styles.privacyButton}
                onClick={() => setShowPrivacyPopup(!showPrivacyPopup)}
              >
                <FontAwesomeIcon icon={faGlobe} />
                <span>Public</span>
              </button>
              <button 
                className={styles.moreButton}
                onClick={() => setShowActionsPopup(!showActionsPopup)}
              >
                <FontAwesomeIcon icon={faEllipsisH} />
              </button>
              
              {showPrivacyPopup && (
                <div className={styles.popup}>
                  <button className={styles.popupItem}>
                    <FontAwesomeIcon icon={faGlobe} />
                    <span>Public</span>
                  </button>
                  <button className={styles.popupItem}>
                    <FontAwesomeIcon icon={faLock} />
                    <span>Private</span>
                  </button>
                  <button className={styles.popupItem}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>Only Me</span>
                  </button>
                </div>
              )}
              
              {showActionsPopup && (
                <div className={styles.popup}>
                  <button className={styles.popupItem}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                    <span>Edit</span>
                  </button>
                  <button className={styles.popupItem}>
                    <FontAwesomeIcon icon={faTrash} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <p className={styles.bioText}>
            "Lorem ipsum dolor sit amet consectetur. Nec donec vestibulum eleifend lectus ipsum ultrices et dictum"
          </p>

          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
              <div className={styles.contactInfo}>
                <label>Email</label>
                <span>test@mail.com</span>
              </div>
            </div>
            <div className={styles.contactItem}>
              <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
              <div className={styles.contactInfo}>
                <label>Phone</label>
                <span>(316) 555-0116</span>
              </div>
            </div>
            <div className={styles.contactItem}>
              <FontAwesomeIcon icon={faLink} className={styles.contactIcon} />
              <div className={styles.contactInfo}>
                <label>Website</label>
                <span>www.wisoky.com</span>
              </div>
            </div>
            <div className={styles.contactItem}>
              <FontAwesomeIcon icon={faLocationDot} className={styles.contactIcon} />
              <div className={styles.contactInfo}>
                <label>Address</label>
                <span>775 Rolling Green Rd., USA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Work Experience Section */}
        <div className={styles.experienceSection}>
          <h2>Work Experience</h2>
          <div className={styles.timelineList}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FontAwesomeIcon icon={faBriefcase} />
              </div>
              <div className={styles.timelineContent}>
                <h3>Senior Developer</h3>
                <p className={styles.company}>Tech Corp</p>
                <p className={styles.period}>2020 - Present · 3 years</p>
                <p className={styles.description}>
                  Led development of core platform features and mentored junior developers.
                  Implemented microservices architecture that improved system performance by 40%.
                </p>
                <div className={styles.skills}>
                  <span>React</span>
                  <span>Node.js</span>
                  <span>AWS</span>
                </div>
              </div>
            </div>
            {/* Add more work experiences */}
          </div>
        </div>

        {/* Education Section */}
        <div className={styles.educationSection}>
          <h2>Education</h2>
          <div className={styles.timelineList}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                <FontAwesomeIcon icon={faGraduationCap} />
              </div>
              <div className={styles.timelineContent}>
                <h3>Master's in Computer Science</h3>
                <p className={styles.school}>Stanford University</p>
                <p className={styles.period}>2018 - 2020</p>
                <p className={styles.description}>
                  Specialized in Machine Learning and Distributed Systems.
                  Published 2 research papers in international conferences.
                </p>
              </div>
            </div>
            {/* Add more education items */}
          </div>
        </div>

        {/* Skills Section */}
        <div className={styles.skillsSection}>
          <h2>Skills & Expertise</h2>
          <div className={styles.skillsGrid}>
            <div className={styles.skillCategory}>
              <h3>Technical Skills</h3>
              <div className={styles.skillTags}>
                <span className={styles.skillTag}>JavaScript</span>
                <span className={styles.skillTag}>React</span>
                <span className={styles.skillTag}>Node.js</span>
                <span className={styles.skillTag}>AWS</span>
                {/* Add more skills */}
              </div>
            </div>
            <div className={styles.skillCategory}>
              <h3>Soft Skills</h3>
              <div className={styles.skillTags}>
                <span className={styles.skillTag}>Leadership</span>
                <span className={styles.skillTag}>Project Management</span>
                <span className={styles.skillTag}>Team Collaboration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className={styles.interestsSection}>
          <h2>Interests</h2>
          <div className={styles.interestsList}>
            <div className={styles.interestItem}>
              <FontAwesomeIcon icon={faCode} className={styles.interestIcon} />
              <span>Open Source Development</span>
            </div>
            <div className={styles.interestItem}>
              <FontAwesomeIcon icon={faBook} className={styles.interestIcon} />
              <span>Technical Writing</span>
            </div>
            {/* Add more interests */}
          </div>
        </div>
      </div>
      
      <div className={styles.sidebar}>
        <ProfilePhotosGrid photos={photos} totalPhotos={20} />
        <ContactsList />
      </div>
    </div>
  );
};

export default ProfileAbout; 