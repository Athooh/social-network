'use client'

import { useState } from 'react'
import Header from '@/components/header/Header'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LeftSidebar from '@/components/sidebar/LeftSidebar'
import styles from '@/styles/Friends.module.css'
import { useFriendService } from '@/services/friendService'

const suggestedFriends = [
  {
    id: 7,
    name: 'Emily Rodriguez',
    image: '/avatar4.png',
    mutualFriends: {
      count: 7,
      previews: ['/avatar1.png', '/avatar2.png', '/avatar3.png']
    }
  },
  {
    id: 8,
    name: 'Daniel Lee',
    image: '/avatar3.png',
    mutualFriends: {
      count: 2,
      previews: ['/avatar4.png', '/avatar5.png', '/avatar6.png']
    }
  },
  {
    id: 9,
    name: 'Olivia Garcia',
    image: '/avatar5.png',
    mutualFriends: {
      count: 9,
      previews: ['/avatar1.png', '/avatar3.png', '/avatar5.png']
    }
  },
  {
    id: 10,
    name: 'William Martinez',
    image: '/avatar6.png',
    mutualFriends: {
      count: 11,
      previews: ['/avatar2.png', '/avatar4.png', '/avatar6.png']
    }
  },
  {
    id: 11,
    name: 'Ava Thompson',
    image: '/avatar4.png',
    mutualFriends: {
      count: 5,
      previews: ['/avatar1.png', '/avatar3.png', '/avatar5.png']
    }
  },
  {
    id: 12,
    name: 'Ethan Wilson',
    image: '/avatar1.png',
    mutualFriends: {
      count: 14,
      previews: ['/avatar2.png', '/avatar4.png', '/avatar6.png']
    }
  }
];

export default function FriendsPage() {

  const { friendRequests, acceptFriendRequest, declineFriendRequest } = useFriendService()
  const [activeTab, setActiveTab] = useState('requests');

  const handleConfirm = (friendId) => {
    // Add your confirm logic here
    console.log(`Confirmed friend request from ID: ${friendId}`);
  };

  const handleDelete = (friendId) => {
    // Add your delete logic here
    console.log(`Deleted friend request from ID: ${friendId}`);
  };

  const handleAddFriend = (friendId) => {
    // Add your add friend logic here
    console.log(`Added friend with ID: ${friendId}`);
  };

  const handleRemove = (friendId) => {
    // Add your remove suggestion logic here
    console.log(`Removed suggestion with ID: ${friendId}`);
  };

  return (
    <ProtectedRoute>
      <Header />
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          <div className={styles.friendsHeader}>
            {/* <h1>Friends</h1> */}
            <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Friend Requests <span className={styles.requestCount}>{friendRequests.length}</span>
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'suggestions' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('suggestions')}
              >
                People You May Know
              </button>
            </div>
          </div>

          {activeTab === 'requests' ? (
            <>
              <h2 className={styles.sectionTitle}>Friend Requests</h2>
              <div className={styles.friendsGrid}>
                {friendRequests.map(friend => (
                  <div key={friend.id} className={styles.friendCard}>
                    <img 
                      src={friend.image} 
                      alt={friend.name} 
                      className={styles.profileImage}
                    />
                    <h3 className={styles.friendName}>{friend.name}</h3>
                    <div className={styles.mutualFriends}>
                      
                      <span>{friend.mutualFriends} mutual friends</span>
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
            </>
          ) : (
            <>
              <h2 className={styles.sectionTitle}>People You May Know</h2>
              <div className={styles.friendsGrid}>
                {suggestedFriends.map(friend => (
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
                        onClick={() => handleAddFriend(friend.id)}
                        className={styles.confirmButton}
                      >
                        Add Friend
                      </button>
                      <button 
                        onClick={() => handleRemove(friend.id)}
                        className={styles.deleteButton}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}