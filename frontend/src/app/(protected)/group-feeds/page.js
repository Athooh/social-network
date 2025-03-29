'use client';

import Header from '@/components/header/Header';
import CreatePost from '@/components/posts/CreatePost';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import styles from '@/styles/page.module.css';
import groupStyles from '@/styles/Groups.module.css';
import GroupPost from '@/components/groups/Group-Posts';
// Sample group data
const sampleGroups = [
  {
    id: 1,
    name: "Tech Innovators Hub",
    description: "A community for tech enthusiasts and innovators to share ideas and collaborate",
    privacy: "private",
    memberCount: 1234,
    creator: {
      id: 1,
      name: "John Doe",
      avatar: "/avatar1.png"
    },
    banner: "/banner1.jpg",
    posts: [
      {
        id: 1,
        content: "🚀 Upcoming Workshop: Introduction to AI & Machine Learning\n\nJoin us this Saturday for an interactive session on AI basics and practical ML applications. Perfect for beginners!\n\nTopics covered:\n- AI fundamentals\n- Machine Learning basics\n- Hands-on coding session\n\nDon't forget to RSVP!",
        userData: {
          firstName: "John",
          lastName: "Doe",
          avatar: "/avatar1.png"
        },
        createdAt: "2024-03-15T10:00:00Z",
        likesCount: 45,
        comments: [],
        isGroupPost: true,
        groupName: "Tech Innovators Hub"
      }
    ]
  },
  {
    id: 2,
    name: "Photography Enthusiasts",
    description: "Share your best shots, get feedback, and learn photography techniques",
    privacy: "public",
    memberCount: 2567,
    creator: {
      id: 2,
      name: "Jane Smith",
      avatar: "/avatar2.png"
    },
    banner: "/banner2.jpg",
    posts: [
      {
        id: 2,
        content: "📸 Monthly Photo Challenge: Urban Wildlife\n\nThis month's theme is all about capturing the wildlife in our cities!\n\nRules:\n1. Must be taken this month\n2. No zoo photos\n3. Urban setting required\n\nPrize: Feature in our monthly showcase + photography guidebook\n\nSubmit your entries in the comments!",
        imageUrl: "/sample-photo-1.jpg",
        userData: {
          firstName: "Jane",
          lastName: "Smith",
          avatar: "/avatar2.png"
        },
        createdAt: "2024-03-14T15:30:00Z",
        likesCount: 89,
        comments: [],
        isGroupPost: true,
        groupName: "Photography Enthusiasts"
      }
    ]
  },
  {
    id: 3,
    name: "Sustainable Living Community",
    description: "Tips, tricks, and discussions about sustainable living practices",
    privacy: "public",
    memberCount: 3789,
    creator: {
      id: 3,
      name: "Mike Johnson",
      avatar: "/avatar3.png"
    },
    banner: "/banner3.jpg",
    posts: [
      {
        id: 3,
        content: "♻️ Community Recycling Drive Event!\n\nJoin us for our monthly recycling drive:\n\n📅 Date: March 20th, 2024\n⏰ Time: 9 AM - 2 PM\n📍 Location: Community Center\n\nWhat to bring:\n- Electronics\n- Paper/Cardboard\n- Glass/Plastic\n\nBonus: Workshop on creative upcycling at 11 AM\n\nPlease indicate if you're attending in the comments!",
        userData: {
          firstName: "Mike",
          lastName: "Johnson",
          avatar: "/avatar3.png"
        },
        createdAt: "2024-03-13T09:15:00Z",
        likesCount: 156,
        comments: [],
        isGroupPost: true,
        groupName: "Sustainable Living Community"
      }
    ]
  }
];

export default function GroupFeeds() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          {sampleGroups.map(group => (
            <div key={group.id} className={groupStyles.groupSection}>
              <div className={groupStyles.groupHeader}>
                <div className={groupStyles.groupInfo}>
                  <img 
                    src={group.banner} 
                    alt={group.name} 
                    className={groupStyles.groupBanner}
                  />
                  <div className={groupStyles.groupDetails}>
                    <h2>{group.name}</h2>
                    <p>{group.description}</p>
                    <div className={groupStyles.groupMeta}>
                      <span>
                        <i className={`fas ${group.privacy === 'private' ? 'fa-lock' : 'fa-globe'}`}></i>
                        {group.privacy === 'private' ? 'Private Group' : 'Public Group'}
                      </span>
                      <span>•</span>
                      <span>{group.memberCount.toLocaleString()} members</span>
                    </div>
                  </div>
                </div>
                <div className={groupStyles.groupActions}>
                  <button className={groupStyles.joinButton}>
                    Join Group
                  </button>
                  <button className={groupStyles.moreButton}>
                    •••
                  </button>
                </div>
              </div>
              
              {/* <CreatePost isGroupPost groupId={group.id} groupName={group.name} /> */}
              
              {group.posts.map(post => (
                <GroupPost 
                  key={post.id} 
                  post={post}
                  onPostUpdated={() => {
                    // Handle post update
                  }}
                />
              ))}
            </div>
          ))}
        </main>
        <aside>
          <RightSidebar />
        </aside>
      </div>
    </>
  );
}
