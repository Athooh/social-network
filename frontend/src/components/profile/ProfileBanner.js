import React from 'react';
import Image from 'next/image';
import styles from '@/styles/ProfileBanner.module.css';

const ProfileBanner = ({
  bannerUrl,
  profileUrl,
  fullName,
  followersCount,
  followingCount,
}) => {
  return (
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
          <button className={styles.editButton}>Edit Profile</button>
          <div className={styles.moreActions}>
            <button className={styles.ellipsisButton}>⋮</button>
          </div>
        </div>
      </div>

      <div className={styles.profileNav}>
        <nav>
          <a href="#posts">Posts</a>
          <a href="#about">About</a>
          <a href="#photos">Photos</a>
          <a href="#groups">Groups</a>
          <a href="#connections">Connections</a>
          <a href="#events">Events</a>
        </nav>
      </div>
    </div>
  );
};

export default ProfileBanner; 