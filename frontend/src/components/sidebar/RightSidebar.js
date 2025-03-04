'use client';

import styles from '@/styles/Sidebar.module.css';

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
    </div>
  );
} 