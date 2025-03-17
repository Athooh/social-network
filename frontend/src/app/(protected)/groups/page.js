"use client";

import Header from "@/components/header/Header";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import pageStyles from "@/styles/page.module.css";
import styles from "@/styles/Groups.module.css";

const sampleGroups = [
  {
    id: 1,
    name: "Photography Enthusiasts",
    banner: "/banner1.jpg",
    profilePic: "/avatar1.png",
    isPublic: true,
    memberCount: 5234,
    members: [
      { id: 1, avatar: "/avatar1.png" },
      { id: 2, avatar: "/avatar2.png" },
      { id: 3, avatar: "/avatar3.png" },
    ]
  },
  {
    id: 2,
    name: "Tech Innovators",
    banner: "/banner2.jpg",
    profilePic: "/avatar4.png",
    isPublic: false,
    memberCount: 3122,
    members: [
      { id: 4, avatar: "/avatar4.png" },
      { id: 5, avatar: "/avatar5.png" },
      { id: 6, avatar: "/avatar6.png" },
    ]
  },
  {
    id: 3,
    name: "Travelers",
    banner: "/banner3.jpg", 
    profilePic: "/avatar2.png",
    isPublic: true,
    memberCount: 8433,
    members: [
      { id: 7, avatar: "/avatar2.png" },
      { id: 8, avatar: "/avatar.png" },
      { id: 9, avatar: "/avatar5.png" },
    ]
  },
  {
    id: 4,
    name: "Book Club",
    banner: "/banner4.jpg",
    profilePic: "/avatar3.png",
    isPublic: true,
    memberCount: 2891,
    members: [
      { id: 10, avatar: "/avatar1.png" },
      { id: 11, avatar: "/avatar3.png" },
      { id: 12, avatar: "/avatar2.png" },
    ]
  },
  {
    id: 5,
    name: "Foodies Unite",
    banner: "/banner5.jpg",
    profilePic: "/avatar6.png",
    isPublic: false,
    memberCount: 4567,
    members: [
      { id: 13, avatar: "/avatar3.png" },
      { id: 14, avatar: "/avatar4.png" },
      { id: 15, avatar: "/avatar5.png" },
    ]
  },
  {
    id: 6,
    name: "Fitness Fanatics",
    banner: "/banner6.jpg",
    profilePic: "/avatar5.png",
    isPublic: true,
    memberCount: 6789,
    members: [
      { id: 16, avatar: "/avatar6.png" },
      { id: 17, avatar: "/avatar.png" },
      { id: 18, avatar: "/avatar1.png" },
    ]
},
  // Add 4 more sample groups...
];

export default function Groups() {
  return (
    <ProtectedRoute>
      <Header />
      <div className={styles.container}>
        <aside className={pageStyles.leftSidebar}>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          <div className={styles.groupsHeader}>
            <h1>Groups</h1>
            <button className={styles.createGroupBtn}>
              <i className="fas fa-plus"></i> Create New Group
            </button>
          </div>
          
          <div className={styles.groupsGrid}>
            {sampleGroups.map(group => (
              <div key={group.id} className={styles.groupCard}>
                <div className={styles.groupBanner}>
                  <img src={group.banner} alt="" className={styles.bannerImg} />
                </div>
                <div className={styles.groupInfo}>
                  <img src={group.profilePic} alt="" className={styles.profilePic} />
                  <h3 className={styles.groupName}>{group.name}</h3>
                  <span className={styles.groupPrivacy}>
                    <i className={`fas ${group.isPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                    {group.isPublic ? 'Public Group' : 'Private Group'}
                  </span>
                  
                  <div className={styles.memberInfo}>
                    <div className={styles.memberAvatars}>
                      {group.members.map((member, index) => (
                        <img 
                          key={member.id} 
                          src={member.avatar} 
                          alt="" 
                          className={styles.memberAvatar}
                          style={{ zIndex: 3 - index }}
                        />
                      ))}
                    </div>
                    <span className={styles.memberCount}>
                      {group.memberCount.toLocaleString()} members
                    </span>
                  </div>
                  
                  <hr className={styles.divider} />
                  
                  <div className={styles.groupActions}>
                    <button className={styles.inviteBtn}>
                      <i className="fas fa-user-plus"></i> Invite
                    </button>
                    <button className={styles.joinBtn}>
                      Join Group
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 