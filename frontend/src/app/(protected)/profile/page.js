// src/app/profile/[id]/page.js
"use client";

import React, { useState } from "react";
import Header from "@/components/header/Header";
import styles from "@/styles/ProfilePage.module.css"; // Combined styles for the profile page
import { use } from "react";
import ProfileBanner from "@/components/profile/ProfileBanner";
import ProfileAboutSideBar from "@/components/profile/ProfileAboutSideBar";
import CreatePost from "@/components/posts/CreatePost";
import PostList from "@/components/posts/PostList";
import ProfilePhotosGrid from "@/components/profile/ProfilePhotosGrid";
import ContactsSection from "@/components/contacts/ContactsList";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfilePhotos from "@/components/profile/ProfilePhotos";
import ProfileGroups from "@/components/profile/ProfileGroups";
import ProfileEvents from "@/components/profile/ProfileEvents";
import ProfileConnections from "@/components/profile/ProfileConnections";
import { useFriendService } from "@/services/friendService";

export default function ProfilePage({ params }) {
  const [activeSection, setActiveSection] = useState("posts");
  const resolvedParams = use(params);
  const { contacts, isLoadingContacts } = useFriendService();

  // Example photos data
  const photos = [
    { url: "/photo1.jpg" },
    { url: "/photo2.jpg" },
    { url: "/photo3.jpg" },
    { url: "/photo4.jpg" },
    { url: "/photo5.jpg" },
    { url: "/photo6.jpg" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "about":
        return <ProfileAbout />;
      case "posts":
        return (
          <div className={styles.contentLayout}>
            <div className={styles.leftSidebar}>
              <ProfileAboutSideBar />
            </div>
            <div className={styles.mainContent}>
              <CreatePost />
              <PostList />
            </div>
            <div className={styles.rightSidebar}>
              <ProfilePhotosGrid photos={photos} totalPhotos={20} />
              <ContactsSection
                contacts={contacts}
                isLoading={isLoadingContacts}
                isProfilePage={true}
              />
            </div>
          </div>
        );
      case "photos":
        return <ProfilePhotos />;
      case "groups":
        return <ProfileGroups />;
      case "connections":
        return <ProfileConnections />;
      case "events":
        return <ProfileEvents />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className={styles.profileContainer}>
        <ProfileBanner
          bannerUrl="/banner2.jpg"
          profileUrl="/avatar3.png"
          fullName="John Doe"
          followersCount={4356}
          followingCount={200}
          onNavClick={setActiveSection}
        />
        {renderContent()}
      </div>
    </>
  );
}
