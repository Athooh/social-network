import React from 'react';
import styles from '@/styles/ProfileGroups.module.css';
import groupStyles from '@/styles/Groups.module.css';
import ContactsList from '@/components/contacts/ContactsList';
import { useGroupService } from '@/services/groupService';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { showToast } from '../ui/ToastContainer';

// Import the sample groups (you should later replace this with actual user groups data)
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
  // ... you can import more groups from the groups page
];

const ProfileGroups = ({ userData }) => {
  const router = useRouter();
  const [userGroups, setUserGroups] = useState([]);
  const { getusergroups, deleteGroup, leaveGroup, joinGroup } = useGroupService();

  const fetchGroups = async () => {
    try {
      
      const result = await getusergroups(userData.id)
      console.log(result)
      setUserGroups(result)
    } catch (error) {
      console.error("Error fetching groups:", error);
    }

  }

  useEffect(() => {
    fetchGroups();
  }, []);
  return (
    <div className={styles.groupsContainer}>
      <div className={styles.mainContent}>
        <div className={groupStyles.groupsHeader}>
          <h2>My Groups</h2>
        </div>

        <div className={groupStyles.groupsGrid}>
          {sampleGroups.map(group => (
            <div key={group.id} className={groupStyles.groupCard}>
              <div className={groupStyles.groupBanner}>
                <img src={group.banner} alt="" className={groupStyles.bannerImg} />
              </div>
              <div className={groupStyles.groupInfo}>
                <img src={group.profilePic} alt="" className={groupStyles.profilePic} />
                <h3 className={groupStyles.groupName}>{group.name}</h3>
                <span className={groupStyles.groupPrivacy}>
                  <i className={`fas ${group.isPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                  {group.isPublic ? 'Public Group' : 'Private Group'}
                </span>

                <div className={groupStyles.memberInfo}>
                  <div className={groupStyles.memberAvatars}>
                    {group.members.map((member, index) => (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt=""
                        className={groupStyles.memberAvatar}
                        style={{ zIndex: 3 - index }}
                      />
                    ))}
                  </div>
                  <span className={groupStyles.memberCount}>
                    {group.memberCount.toLocaleString()} members
                  </span>
                </div>

                <hr className={groupStyles.divider} />

                <div className={groupStyles.groupActions}>
                  <button className={styles.inviteBtn}>
                    View Group
                  </button>
                  <button className={styles.manageBtn}>
                    Manage Group
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.sidebar}>
        <ContactsList />
      </div>
    </div>
  );
};

export default ProfileGroups; 