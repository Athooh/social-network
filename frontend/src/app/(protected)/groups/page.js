"use client";

import { useRouter } from 'next/navigation';
import Header from "@/components/header/Header";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import pageStyles from "@/styles/page.module.css";
import styles from "@/styles/Groups.module.css";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import { useState, useEffect } from 'react';
import { useGroupService } from "@/services/groupService";
import { showToast } from "@/components/ui/ToastContainer";

const API_URL = process.env.API_URL || "http://localhost:8080/api";
const BASE_URL = API_URL.replace("/api", ""); // Remove '/api' to get the base URL
let userdata = null;
try {
  const raw = localStorage.getItem("userData");
  if (raw) userdata = JSON.parse(raw);
  console.log("User data from localStorage:", userdata);
} catch (e) {
  console.error("Invalid userData in localStorage:", e);
}


export default function Groups() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allGroups, setAllGroups] = useState([]);
    const { getallgroups, deleteGroup, leaveGroup, joinGroup } = useGroupService();

    const fetchGroups = async () => {
        try {
            const result = await getallgroups();
            setAllGroups(result);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleGroupAction = async (group, action) => {
        try {
            let success = false;
            
            switch (action) {
                case 'delete':
                    success = await deleteGroup(group.ID);
                    if (success) {
                        showToast("Group deleted successfully", "success");
                    }
                    break;
                case 'leave':
                    success = await leaveGroup(group.ID);
                    if (success) {
                        showToast("Left group successfully", "success");
                    }
                    break;
                case 'join':
                    success = await joinGroup(group.ID);
                    if (success) {
                        showToast("Joined group successfully", "success");
                    }
                    break;
            }

            if (success) {
                // Refresh groups list
                fetchGroups();
            }
        } catch (error) {
            console.error(`Error during ${action} action:`, error);
        }
    };

    const handleGroupClick = (groupId) => {
        router.push(`/groups/${groupId}`);
    };

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
                        {allGroups === null && (
                            <div className={styles.noGroups}>
                                <h2>No groups found</h2>
                                <p>Start by creating a new group!</p>
                            </div>
                        )}

                        {allGroups != null && allGroups.map(group => (
                            <div 
                                key={group.ID} 
                                className={styles.groupCard}
                                onClick={() => handleGroupClick(group.ID)}
                            >
                                <div className={styles.groupBanner}>
                                    <img 
                                        src={group.BannerPath?.String ? 
                                            `${BASE_URL}/uploads/${group.BannerPath.String}` : 
                                            "/banner5.jpg"} 
                                        alt="" 
                                        className={styles.bannerImg} 
                                    />
                                </div>
                                <div className={styles.groupInfo}>
                                    <img src={group.ProfilePicPath?.String ? `${BASE_URL}/uploads/${group.ProfilePicPath.String}` : "/avatar5.jpg"} alt="" className={styles.profilePic} />
                                    <h3 className={styles.groupName}>{group.Name}</h3>
                                    <span className={styles.groupPrivacy}>
                                        <i className={`fas ${group.IsPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                                        {group.IsPublic ? 'Public Group' : 'Private Group'}
                                    </span>

                                    <div className={styles.memberInfo}>
                                        <div className={styles.memberAvatars}>
                                          {group.Members.slice(0, 3).map((member, index) => (
                                            <img
                                              key={member.Id}
                                              src={member.Avatar ? `${BASE_URL}/uploads/${member.Avatar}` : "/avatar5.jpg"}
                                              alt=""
                                              className={styles.memberAvatar}
                                              style={{ zIndex: 3 - index }}
                                            />
                                          ))}
                                        </div>
                                        <span className={styles.memberCount}>
                                          {group.MemberCount.toLocaleString()} members
                                        </span>
                                      </div>

                                    <hr className={styles.divider} />

                                    <div className={styles.groupActions} onClick={e => e.stopPropagation()}>
                                        {group.IsMember && (
                                            <button className={styles.inviteBtn}>
                                                <i className="fas fa-user-plus"></i> Invite
                                            </button>
                                        )}

                                        {group.IsMember ? (
                                            userdata?.id === group.Creator?.id ? (
                                                <button 
                                                    className={styles.leaveBtn}
                                                    onClick={() => handleGroupAction(group, 'delete')}
                                                >
                                                    Delete Group
                                                </button>
                                            ) : (
                                                <button 
                                                    className={styles.leaveBtn}
                                                    onClick={() => handleGroupAction(group, 'leave')}
                                                >
                                                    Leave Group
                                                </button>
                                            )
                                        ) : (
                                            <button 
                                                className={styles.inviteBtn}
                                                onClick={() => handleGroupAction(group, 'join')}
                                            >
                                                Join Group
                                            </button>
                                        )}
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
                onGroupCreated={fetchGroups}
            />
        </ProtectedRoute>
    );
}