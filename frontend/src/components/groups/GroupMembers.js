import { useState } from 'react';
import styles from '@/styles/GroupMembers.module.css';

const API_URL = process.env.API_URL || "http://localhost:8080/api";
const BASE_URL = API_URL.replace("/api", "");// Replace with your actual base URL

const GroupMembers = ({ group }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 14;

  // Convert raw member data into usable format
  const members = (group?.Members || []).map((member) => ({
    id: member.User?.id,
    name: `${member.User?.firstName || ''} ${member.User?.lastName || ''}`,
    avatar: member.Avatar
      ? `${BASE_URL}/uploads/${member.Avatar}`
      : '/avatar5.jpg',
    role: member.Role?.toLowerCase() === 'admin' ? 'Admin' : 'Member',
    joinDate: member.CreatedAt,
    isOnline: false, // Adjust if you track online status
  }));

  // Filter by search
  let filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by tab
  if (activeTab === 'admins') {
    filteredMembers = filteredMembers.filter((member) => member.role === 'Admin');
  }

  // Pagination
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
        {currentMembers.map((member) => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.memberInfo}>
              <img src={member.avatar} alt={member.name} className={styles.avatar} />
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
              <button className={styles.followButton}>Follow</button>
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
