'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/header/Header';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import styles from '@/styles/page.module.css';
import groupStyles from '@/styles/GroupPage.module.css';
import GroupCreatePost from '@/components/groups/GroupCreatePost';
import GroupPost from '@/components/groups/Group-Posts';

export default function GroupPostPage() {
  const params = useParams();
  const { groupId, postId } = params;
  const [group, setGroup] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  // Add activeSection state
  const [activeSection, setActiveSection] = useState('GroupPost');

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
      id: postId,
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
  }, [groupId, postId]);

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
                        Groups
                      </a>
                      <a 
                        href="#" 
                        className={activeSection === 'GroupEvents' ? styles.active : ''} 
                        onClick={(e) => handleNavClick(e, 'GroupEvents')}
                      >
                        Events
                      </a>
                    </nav>
                  </div>
          </div>

          <div className={groupStyles.content}>
            <GroupCreatePost groupId={groupId} groupName={group.name} />
            <GroupPost 
              post={post}
              onPostUpdated={() => {
                // Refresh post data
              }}
            />
          </div>
        </main>
        <aside className={styles.rightSidebar}>
          <RightSidebar />
        </aside>
      </div>
    </>
  );
}