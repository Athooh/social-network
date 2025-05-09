import { useState } from 'react';
import styles from '@/styles/GroupMembers.module.css';

const GroupMembers = ({ groupId }) => {
  // Dummy members data
  const [members] = useState([
    {
      id: 1,
      name: 'John Doe',
      avatar: '/avatar1.png',
      role: 'Admin',
      joinDate: '2024-01-01',
      isOnline: true
    },
    // Add more dummy members...
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 14;

  // Filter members based on search and tab
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);

  return (
    <div className={styles.membersContainer}>
      <div className={styles.header}>
        <h2>Group Members</h2>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Members
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'admins' ? styles.active : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          Admins
        </button>
      </div>

      <div className={styles.membersGrid}>
        {currentMembers.map(member => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.memberInfo}>
              <img
                src={member.avatar}
                alt={member.name}
                className={styles.avatar}
              />
              <div className={styles.details}>
                <h3>{member.name}</h3>
                <span className={member.isOnline ? styles.online : styles.offline}>
                  {member.isOnline ? 'Online' : 'Offline'}
                </span>
                {member.role === 'Admin' && (
                  <span className={styles.adminBadge}>Admin</span>
                )}
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.followButton}>
                Follow
              </button>
            </div>
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
  );
};

export default GroupMembers;