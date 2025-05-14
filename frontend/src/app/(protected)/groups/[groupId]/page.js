'use client';

import { useState, useEffect } from 'react';
// Add new imports for components
import GroupAbout from '@/components/groups/GroupAbout';
import GroupPhotos from '@/components/groups/GroupPhotos';
import GroupMembers from '@/components/groups/GroupMembers';
import GroupEvents from '@/components/groups/GroupEvents';
import { useParams } from 'next/navigation';
import Header from '@/components/header/Header';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import styles from '@/styles/page.module.css';
import groupStyles from '@/styles/GroupPage.module.css';
import GroupCreatePost from '@/components/groups/GroupCreatePost';
import GroupPost from '@/components/groups/Group-Posts';
// Add GroupChat to imports
import GroupChat from '@/components/groups/GroupChat';
import { useGroupService } from "@/services/groupService"; 

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

export default function GroupPostPage() {
  const params = useParams();
  const { groupId } = params;
  const [group, setGroup] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  // Add activeSection state
  const [activeSection, setActiveSection] = useState('GroupPost');
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Add handleNavClick function
  const handleNavClick = (e, section) => {
    e.preventDefault();
    setActiveSection(section);
  };

  useEffect(() => {
    // TODO: Replace with actual API call to fetch group and post data
    // This is temporary mock data
    setGroup({
      id: groupId,
      name: "Tech Innovators Hub",
      description: "A community for tech enthusiasts and innovators",
      privacy: "public",
      memberCount: 1234,
      banner: "/banner1.jpg"
    });

    setPost({
      id: 1,
      content: "Sample post content",
      userData: {
        firstName: "John",
        lastName: "Doe",
        avatar: "/avatar1.png"
      },
      createdAt: new Date().toISOString(),
      likesCount: 0,
      comments: [],
      isGroupPost: true,
      groupName: "Tech Innovators Hub"
    });

    setLoading(false);
  }, [groupId]);

  const renderContent = () => {
    switch (activeSection) {
      case 'GroupPost':
        return (
          <>
            <GroupCreatePost groupId={groupId} groupName={group.name} />
            <GroupPost post={post} onPostUpdated={() => {/* Refresh post data */}} />
          </>
        );
      case 'AboutGroup':
        return <GroupAbout group={group} />;
      case 'photos':
        return <GroupPhotos groupId={groupId} />;
      case 'GroupMembers':
        return <GroupMembers groupId={groupId} />;
      case 'GroupEvents':
        return <GroupEvents groupId={groupId} />;
      // Add to renderContent switch
      case 'GroupChat':
        return <GroupChat groupId={groupId} groupName={group.name} />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside className={styles.leftSidebar}>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          <div className={groupStyles.groupHeader}>
            <img 
              src={group.banner} 
              alt={group.name} 
              className={groupStyles.groupBanner}
            />
            <div className={groupStyles.groupInfo}>
              <h1>{group.name}</h1>
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
            <div className={groupStyles.groupNav}>
                  <nav>
                    <a 
                        href="#" 
                        className={activeSection === 'GroupPost' ? styles.active : ''} 
                        onClick={(e) => handleNavClick(e, 'GroupPost')}
                      >
                        Posts
                      </a>
                      <a 
                        href="#" 
                        className={activeSection === 'AboutGroup' ? styles.active : ''} 
                        onClick={(e) => handleNavClick(e, 'AboutGroup')}
                      >
                        About
                      </a>
                      <a 
                        href="#" 
                        className={activeSection === 'photos' ? styles.active : ''} 
                        onClick={(e) => handleNavClick(e, 'photos')}
                      >
                        Photos
                      </a>
                      <a 
                        href="#" 
                        className={activeSection === 'GroupMembers' ? styles.active : ''} 
                        onClick={(e) => handleNavClick(e, 'GroupMembers')}
                      >
                        Members
                      </a>
                      <a 
                        href="#" 
                        className={activeSection === 'GroupEvents' ? styles.active : ''} 
                        onClick={(e) => handleNavClick(e, 'GroupEvents')}
                      >
                        Events
                      </a>
                      <a 
                        href="#" 
                        className={activeSection === 'GroupChat' ? styles.active : ''} 
                        onClick={(e) => handleNavClick(e, 'GroupChat')}
                      >
                        Chat
                        {unreadMessages > 0 && (
                          <span className={styles.unreadBadge}>{unreadMessages}</span>
                        )}
                      </a>
                    </nav>
                  </div>
          </div>

          <div className={groupStyles.content}>
            {renderContent()}
          </div>
        </main>
        <aside className={styles.rightSidebar}>
          <RightSidebar />
        </aside>
      </div>
    </>
  );
}