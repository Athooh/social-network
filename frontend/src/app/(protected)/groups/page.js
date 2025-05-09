"use client";

import Header from "@/components/header/Header";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import pageStyles from "@/styles/page.module.css";
import styles from "@/styles/Groups.module.css";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import { useState, useEffect } from 'react';
import { useGroupService } from "@/services/groupService";

const API_URL = process.env.API_URL || "http://localhost:8080/api";
const BASE_URL = API_URL.replace("/api", ""); // Remove '/api' to get the base URL

export default function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const { getallgroups } = useGroupService();

  useEffect(() => {
    async function fetchGroups() {
      try {
        const result = await getallgroups();  // Await the Promise
        setAllGroups(result); // Or result.value or result.data depending on what it returns
        // console.log("Fetched groups:", result);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    }

    fetchGroups();
  }, [getallgroups]);

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
            <button 
              className={styles.createGroupBtn}
              onClick={() => setIsModalOpen(true)}
            >
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

      <CreateGroupModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </ProtectedRoute>
  );
} 