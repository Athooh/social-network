'use client'

import Header from '@/components/header/Header'
import pageStyles from '@/styles/page.module.css'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LeftSidebar from '@/components/sidebar/LeftSidebar'
import styles from '@/styles/Friends.module.css'

const sampleFriends = [
    {
      id: 1,
      name: 'Sarah Wilson',
      image: '/avatar1.png',
      mutualFriends: {
        count: 10,
        previews: ['/avatar2.png', '/avatar3.png', '/avatar4.png']
      }
    },
    {
      id: 2,
      name: 'Michael Johnson',
      image: '/avatar2.png',
      mutualFriends: {
        count: 15,
        previews: ['/avatar1.png', '/avatar5.png', '/avatar6.png']
      }
    },
    {
      id: 3,
      name: 'Emma Davis',
      image: '/avatar3.png',
      mutualFriends: {
        count: 8,
        previews: ['/avatar4.png', '/avatar5.png', '/avatar6.png']
      }
    },
    {
      id: 4,
      name: 'James Miller',
      image: '/avatar4.png',
      mutualFriends: {
        count: 12,
        previews: ['/avatar1.png', '/avatar2.png', '/avatar3.png']
      }
    },
    {
      id: 5,
      name: 'Sophia Brown',
      image: '/avatar5.png',
      mutualFriends: {
        count: 6,
        previews: ['/avatar1.png', '/avatar3.png', '/avatar6.png']
      }
    },
    {
      id: 6,
      name: 'Oliver Taylor',
      image: '/avatar6.png',
      mutualFriends: {
        count: 20,
        previews: ['/avatar2.png', '/avatar4.png', '/avatar5.png']
      }
    }
  ];

  const handleConfirm = (friendId) => {
    // Add your confirm logic here
  };

  const handleDelete = (friendId) => {
    // Add your delete logic here
  };

export default function FriendsPage() {
  return (
    <ProtectedRoute>
      <Header />
      <div className={styles.container}>
      <aside>
        <LeftSidebar />
      </aside>
      <main className={styles.mainContent}>
      <div className={styles.friendsGrid}>
            {sampleFriends.map(friend => (
              //add friend card here
              <div key={friend.id} className={styles.friendCard}>
              <img 
                src={friend.image} 
                alt={friend.name} 
                className={styles.profileImage}
              />
              <h3 className={styles.friendName}>{friend.name}</h3>
              <div className={styles.mutualFriends}>
                <div className={styles.mutualFriendsAvatars}>
                  {friend.mutualFriends.previews.map((preview, index) => (
                    <img 
                      key={index}
                      src={preview}
                      alt="Mutual friend"
                      className={styles.mutualFriendAvatar}
                      style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                    />
                  ))}
                </div>
                <span>{friend.mutualFriends.count} mutual friends</span>
              </div>
              <div className={styles.actions}>
                <button 
                  onClick={() => handleConfirm(friend.id)}
                  className={styles.confirmButton}
                >
                  Confirm
                </button>
                <button 
                  onClick={() => handleDelete(friend.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
            ))}
          </div>
        </main>
    </div>
    </ProtectedRoute>
  )
}
