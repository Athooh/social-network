'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header/Header';
import CreatePost from '@/components/posts/CreatePost';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import styles from '@/styles/page.module.css';
import groupFeeds from "@/styles/GroupFeeds.module.css";
import GroupPost from '@/components/groups/Group-Posts';
import { useGroupService } from '@/services/groupService';

const API_URL = process.env.API_URL || "http://localhost:8080/api";
const BASE_URL = API_URL.replace("/api", "");

let userdata = null;
try {
  const raw = localStorage.getItem("userData");
  if (raw) userdata = JSON.parse(raw);
  console.log("User data from localStorage:", userdata);
} catch (e) {
  console.error("Invalid userData in localStorage:", e);
}

export default function GroupFeeds() {
  const router = useRouter();
  const { getallgroups } = useGroupService();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const fetchedGroups = await getallgroups();
        setGroups(fetchedGroups);
        console.log('Fetched groups:', fetchedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (groupId) => {
    router.push(`/groups/${groupId}`);
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          {groups.map(group => (
            <div key={group.ID} className={groupFeeds.groupSection}>
              <div className={groupFeeds.groupHeader}>
                <div className={groupFeeds.groupInfo}>
                  <img
                    src={group.ProfilePicPath?.String ? `${BASE_URL}/uploads/${group.ProfilePicPath.String}` : "/avatar5.jpg"}
                    alt={group.Name}
                    className={groupFeeds.groupBanner}
                  />
                  <div className={groupFeeds.groupDetails}>
                    <h2
                      onClick={() => handleGroupClick(group.ID)}
                      style={{ cursor: 'pointer' }}
                    >
                      {group.Name}
                    </h2>
                    <p>{group.Description}</p>
                    <div className={groupFeeds.groupMeta}>
                      <span>
                        <i className={`fas ${group.IsPublic === 'private' ? 'fa-lock' : 'fa-globe'}`}></i>
                        {group.IsPublic === 'private' ? 'Private Group' : 'Public Group'}
                      </span>
                      <span>•</span>
                      <span>{group.MemberCount.toLocaleString()} members</span>
                    </div>
                  </div>
                </div>
                <div className={groupFeeds.groupActions}>
                  {group.IsMember ? (
                    userdata.id === group.Creator.id ? (
                      <button className={groupFeeds.Join}>
                        Delete Group
                      </button>
                    ) : (
                      <button className={groupFeeds.Join}>
                        Leave Group
                      </button>
                    )
                  ) : (
                    <button className={groupFeeds.Join}>
                      Join Group
                    </button>
                  )}
                  <button className={groupFeeds.moreButton}>
                    •••
                  </button>
                </div>
              </div>

              {group.posts.slice(0, 2).map(post => (
                <div key={post.ID}>
                  <GroupPost
                    post={post}
                    onPostUpdated={() => {
                      // Handle post update
                    }}
                  />
                </div>
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
