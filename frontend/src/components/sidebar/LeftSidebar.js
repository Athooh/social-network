"use client";

import Link from "next/link";
import styles from "@/styles/Sidebar.module.css";
import { usePathname } from "next/navigation";
import { useWebSocket, EVENT_TYPES } from "@/services/websocketService";
import { useEffect, useState } from "react";

export default function LeftSidebar() {
  const pathname = usePathname();
  const [person, setPerson] = useState(null);
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    // Load user data from localStorage regardless of connection status
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    if (userData) {
      setPerson(userData);
    }

    // Only set up WebSocket subscription if connected
    if (!isConnected) {
      return;
    }

    // Subscribe to user stats updates
    const handleUserStatsUpdate = (payload) => {
      if (userData && payload.userId === userData.id) {
        const updatedUserData = { ...userData };

        // Update the specific stat that changed
        if (payload.statsType === "Posts") {
          updatedUserData.numPosts = payload.count;
        } else if (payload.statsType === "Followers") {
          updatedUserData.followersCount = payload.count;
        } else if (payload.statsType === "Following") {
          updatedUserData.followingCount = payload.count;
        } else if (payload.statsType === "Groups") {
          updatedUserData.groupsJoined = payload.count;
        }
        // Update localStorage and state
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        setPerson(updatedUserData);
      }
    };

    const unsubscribe = subscribe(
      EVENT_TYPES.USER_STATS_UPDATED,
      handleUserStatsUpdate
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe, isConnected]);

  if (!person) return null;

  const stats = [
    { label: "Posts", count: person.numPosts },
    { label: "Groups", count: person.groupsJoined },
    { label: "Followers", count: person.followersCount },
    { label: "Following", count: person.followingCount },
  ];

  const navLinks = [
    { icon: "fas fa-home", label: "Home", path: "/home" },
    { icon: "fas fa-users", label: "Groups", path: "/groups" },
    { icon: "fas fa-calendar-alt", label: "Events", path: "/events" },
    { icon: "fas fa-user-friends", label: "Friends", path: "/friends" },
    { icon: "fas fa-envelope", label: "Messages", path: "/messages" },
    { icon: "fas fa-user", label: "Profile", path: "/profile" },
    { icon: "fa-solid fa-gear", label: "Settings", path: "/settings" },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.profileSection}>
        <img src="/avatar4.png" alt="Profile" className={styles.profilePic} />
        <h2 className={styles.userName}>{person.firstName}</h2>
        <p className={styles.userProfession}>{person.aboutMe}</p>

        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <span className={styles.statCount}>{stat.count}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`${styles.navLink} ${
              pathname === link.path ? styles.active : ""
            }`}
          >
            <i className={link.icon}></i>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
