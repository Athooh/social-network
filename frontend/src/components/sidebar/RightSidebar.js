"use client";

import styles from "@/styles/Sidebar.module.css";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useFriendService } from "@/services/friendService";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useUserStatus } from "@/services/userStatusService";
import ContactsSection from "@/components/contacts/ContactsList";

// Separate components for better organization
const FriendRequestSection = ({
  friendRequests,
  onAccept,
  onDecline,
  isLoading,
}) => (
  <section className={styles.friendRequests}>
    <h2>Friend Requests</h2>
    {isLoading ? (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="small" color="primary" />
      </div>
    ) : friendRequests.length === 0 ? (
      <p className={styles.emptyState}>No pending friend requests</p>
    ) : (
      friendRequests.map((request) => (
        <div key={request.id} className={styles.requestCard}>
          <div className={styles.requestProfile}>
            <img src={request.image} alt={request.name} />
            <div className={styles.requestInfo}>
              <h3>{request.name}</h3>
              <span>{request.mutualFriends} mutual friends</span>
            </div>
          </div>
          <div className={styles.requestActions}>
            <button
              className={styles.acceptButton}
              onClick={() => onAccept(request.followerId)}
            >
              Accept
            </button>
            <button
              className={styles.declineButton}
              onClick={() => onDecline(request.followerId)}
            >
              Decline
            </button>
          </div>
        </div>
      ))
    )}
  </section>
);
const GroupsSection = ({ groups }) => (
  <section className={styles.groups}>
    <h2>Groups</h2>
    {groups.map((group) => (
      <div key={group.id} className={styles.groupItem}>
        <div className={styles.groupProfile}>
          <img src={group.image} alt={group.name} />
          <div className={styles.groupInfo}>
            <h3>{group.name}</h3>
            <span>{group.members} members</span>
          </div>
        </div>
        <div className={styles.joinActions}>
          <button className={styles.joinButton}>Join</button>
        </div>
      </div>
    ))}
    <Link href="/groups">
      <div className={styles.viewGroup}>
        <button className={styles.viewButton}>
          View Groups <i className="fa-solid fa-users-line"></i>
        </button>
      </div>
    </Link>
  </section>
);

export default function RightSidebar() {
  // Static data for groups (could be moved to a service later)
  const groups = [
    { id: 1, name: "React Developers", image: "/react.png", members: 45 },
    { id: 2, name: "Vue.js Enthusiasts", image: "/vue.png", members: 32 },
    { id: 3, name: "Angular Developers", image: "/angular.png", members: 28 },
  ];

  // Use our friend service
  const {
    friendRequests,
    contacts,
    acceptFriendRequest,
    declineFriendRequest,
    isLoadingRequests,
    isLoadingContacts,
  } = useFriendService();

  // Limit contacts to display (to avoid cluttering the sidebar)
  const displayedContacts = contacts.slice(0, 10);

  return (
    <div className={styles.rightSidebar}>
      <FriendRequestSection
        friendRequests={friendRequests}
        onAccept={acceptFriendRequest}
        onDecline={declineFriendRequest}
        isLoading={isLoadingRequests}
      />

      <ContactsSection
        contacts={displayedContacts}
        isLoading={isLoadingContacts}
        isProfilePage={false}
      />

      <GroupsSection groups={groups} />
    </div>
  );
}
