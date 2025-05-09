import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/ProfileBanner.module.css';
import EditProfileModal from './EditProfileModal';

const ProfileBanner = ({
  bannerUrl,
  profileUrl,
  fullName,
  followersCount,
  followingCount,
  onNavClick,
  activeSection = 'posts',
  isPrivate = false,
  isOwnProfile = true,
  isFollowing = false,
  onFollow,
  onUnfollow
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleNavClick = (e, section) => {
    e.preventDefault();
    onNavClick(section);
  };

  return (
    <>
      <div className={styles.bannerContainer}>
        <div className={styles.bannerImage}>
          <Image
            src={bannerUrl || '/banner3.jpg'}
            alt="Profile Banner"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        
        <div className={styles.profileInfo}>
          <div className={styles.leftSection}>
            <div className={styles.profilePicture}>
              <Image
                src={profileUrl || '/avatar.png'}
                alt="Profile Picture"
                width={120}
                height={120}
              />
            </div>
            
            <div className={styles.userInfo}>
              <h2>{fullName}</h2>
              <div className={styles.privacyBadge}>
                {isPrivate ? (
                  <span className={`${styles.badge} ${styles.private}`}>
                    🔒 Private Profile
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles.public}`}>
                    🌐 Public Profile
                  </span>
                )}
              </div>
              <div className={styles.followInfo}>
                <div className={styles.followers}>
                  <div className={styles.avatarGroup}>
                    {/* Placeholder for follower avatars */}
                    <div className={styles.avatarStack}>
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className={styles.avatarWrapper}>
                          <Image
                            src="/avatar4.png"
                            alt="Follower"
                            width={24}
                            height={24}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.following}>
                  <span>| {followersCount} Followers</span>
                  <span> | {followingCount} Following</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightSection}>
            {isOwnProfile ? (
              <>
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Profile
                </button>
                <div className={styles.moreActions}>
                  <button className={styles.ellipsisButton}>⋮</button>
                </div>
              </>
            ) : (
              <div className={styles.actionButtons}>
                {isFollowing ? (
                  <button 
                    className={`${styles.followButton} ${styles.following}`}
                    onClick={onUnfollow}
                  >
                    Following
                  </button>
                ) : (
                  <button 
                    className={styles.followButton}
                    onClick={onFollow}
                  >
                    Follow
                  </button>
                )}
                <button className={styles.messageButton}>
                  Message
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.profileNav}>
          <nav>
            <a 
              href="#" 
              className={activeSection === 'posts' ? styles.active : ''} 
              onClick={(e) => handleNavClick(e, 'posts')}
            >
              Posts
            </a>
            <a 
              href="#" 
              className={activeSection === 'about' ? styles.active : ''} 
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
            <a 
              href="#" 
              className={activeSection === 'photos' ? styles.active : ''} 
              onClick={(e) => handleNavClick(e, 'photos')}
            >
              Photos
            </a>
            <a 
              href="#" 
              className={activeSection === 'groups' ? styles.active : ''} 
              onClick={(e) => handleNavClick(e, 'groups')}
            >
              Groups
            </a>
            <a 
              href="#" 
              className={activeSection === 'connections' ? styles.active : ''} 
              onClick={(e) => handleNavClick(e, 'connections')}
            >
              Connections
            </a>
            <a 
              href="#" 
              className={activeSection === 'events' ? styles.active : ''} 
              onClick={(e) => handleNavClick(e, 'events')}
            >
              Events
            </a>
          </nav>
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profileData={{
            bannerUrl,
            profileUrl,
            fullName,
            isPrivate,
          }}
        />
      )}
    </>
  );
};

export default ProfileBanner;