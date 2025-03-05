'use client';

import styles from '@/styles/Sidebar.module.css';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function RightSidebar() {
  const friendRequests = [
    { id: 1, name: 'Sarah Wilson', image: '/avatar1.png', mutualFriends: 5 },
    { id: 2, name: 'Mike Johnson', image: '/avatar2.png', mutualFriends: 3 },
    { id: 3, name: 'Emma Davis', image: '/avatar3.png', mutualFriends: 8 },
  ];

  const contacts = [
    { id: 1, name: 'Alice Smith', image: '/avatar.png', isOnline: true },
    { id: 2, name: 'Bob Wilson', image: '/avatar6.png', isOnline: false },
    { id: 3, name: 'Carol Johnson', image: '/avatar2.png', isOnline: true },
    { id: 4, name: 'David Brown', image: '/avatar3.png', isOnline: true },
    { id: 5, name: 'Eve Taylor', image: '/avatar1.png', isOnline: false },
    { id: 6, name: 'Frank Miller', image: '/avatar4.png', isOnline: true },
    { id: 7, name: 'Grace Davis', image: '/avatar5.png', isOnline: false },
    { id: 8, name: 'Henry Wilson', image: '/avatar6.png', isOnline: true },
    { id: 9, name: 'Ivy Clark', image: '/avatar3.png', isOnline: true },
    { id: 10, name: 'Jack Lewis', image: '/avatar.png', isOnline: false },
  ];

  const groups = [
    { id: 1, name: 'React Developers', image: '/react.png', members: 45 },
    { id: 2, name: 'Vue.js Enthusiasts', image: '/vue.png', members: 32 },
    { id: 3, name: 'Angular Developers', image: '/angular.png', members: 28 },
  ]

  return (
    <div className={styles.rightSidebar}>
      <section className={styles.friendRequests}>
        <h2>Friend Requests</h2>
        {friendRequests.map((request) => (
          <div key={request.id} className={styles.requestCard}>
            <div className={styles.requestProfile}>
              <img src={request.image} alt={request.name} />
              <div className={styles.requestInfo}>
                <h3>{request.name}</h3>
                <span>{request.mutualFriends} mutual friends</span>
              </div>
            </div>
            <div className={styles.requestActions}>
              <button className={styles.acceptButton}>Accept</button>
              <button className={styles.declineButton}>Decline</button>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.contacts}>
        <h2>Contacts</h2>
        {contacts.map((contact) => (
          <div key={contact.id} className={styles.contactItem}>
            <div className={styles.contactProfile}>
              <div className={styles.contactImageWrapper}>
                <img src={contact.image} alt={contact.name} />
                <span className={`${styles.onlineStatus} ${contact.isOnline ? styles.online : styles.offline}`} />
              </div>
              <span className={styles.contactName}>{contact.name}</span>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.groups}>
        <h2>Groups</h2>
        {groups.map((group) => (
          <div key={group.id} className={styles.groupItem}>
            <div className={styles.groupProfile}>
              <img src={group.image} alt={group.name} />
              <div className={styles.groupInfo}>
                <h3>{group.name}</h3>
                <span>{group.members} members</span>
              </div>
            </div>
            <div className={styles.joinActions}>
              <button className={styles.joinButton}>Join</button>
            </div>
          </div>
        ))}
        <Link href="/groups">
        <div className={styles.viewGroup}>
          <button className={styles.viewButton}>View Groups <i className="fa-solid fa-users-line"></i></button>
        </div>
        </Link>
      </section>
    </div>
  );
} 
