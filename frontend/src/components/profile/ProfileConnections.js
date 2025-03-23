import React, { useState } from 'react';
import styles from '@/styles/ProfileConnections.module.css';
import ContactsList from '@/components/contacts/ContactsList';

// Sample data for both following and followers
const sampleFollowing = Array(16).fill(null).map((_, index) => ({
  id: index + 1,
  name: `Following User ${index + 1}`,
  avatar: `/avatar${(index % 6) + 1}.png`,
  mutualFriends: Math.floor(Math.random() * 50) + 1
}));

const sampleFollowers = Array(16).fill(null).map((_, index) => ({
  id: index + 100, // Different ID range to avoid conflicts
  name: `Follower User ${index + 1}`,
  avatar: `/avatar${(index % 6) + 1}.png`,
  mutualFriends: Math.floor(Math.random() * 50) + 1
}));

const ProfileConnections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeTab, setActiveTab] = useState('following');

  const contacts = activeTab === 'following' ? sampleFollowing : sampleFollowers;
  const displayedContacts = showMore ? contacts : contacts.slice(0, 14);

  const toggleDropdown = (contactId) => {
    setActiveDropdown(activeDropdown === contactId ? null : contactId);
  };

  const filteredContacts = displayedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.connectionsContainer}>
      <div className={styles.mainContent}>
        <div className={styles.connectionsHeader}>
          <h2>My Connections</h2>
        </div>
        <div className={styles.connectionsStatsSearch}>
        <div className={styles.stats}>
            <span>2.5K Following</span>
            <span>•</span>
            <span>1.8K Followers</span>
          </div>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        </div>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'following' ? styles.active : ''}`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'followers' ? styles.active : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            Followers
          </button>
        </div>

        <div className={styles.contactsGrid}>
          {filteredContacts.map(contact => (
            <div key={contact.id} className={styles.contactCard}>
              <div className={styles.contactInfo}>
                <img src={contact.avatar} alt="" className={styles.avatar} />
                <div className={styles.details}>
                  <h3>{contact.name}</h3>
                  <span>{contact.mutualFriends} mutual friends</span>
                </div>
              </div>
              <div className={styles.actions}>
                <button 
                  className={styles.menuButton}
                  onClick={() => toggleDropdown(contact.id)}
                >
                  <i className="fas fa-ellipsis-h"></i>
                </button>
                {activeDropdown === contact.id && (
                  <div className={styles.dropdown}>
                    <button>
                      <i className="fas fa-user-minus"></i> 
                      {activeTab === 'following' ? 'Unfollow' : 'Remove Follower'}
                    </button>
                    <button>
                      <i className="fas fa-eye-slash"></i> Hide Contact
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!showMore && contacts.length > 14 && (
          <button 
            className={styles.loadMoreButton}
            onClick={() => setShowMore(true)}
          >
            Load More
          </button>
        )}
      </div>
      <div className={styles.sidebar}>
        <ContactsList />
      </div>
    </div>
  );
};

export default ProfileConnections; 