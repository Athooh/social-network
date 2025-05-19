"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/header/Header";
import styles from "@/styles/ProfilePage.module.css";
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
import { useAuth } from "@/context/authcontext";

// Define base URL for media assets
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const BASE_URL = API_URL.replace("/api", ""); // Remove '/api' to get the base URL

export default function ProfilePage({ params }) {
  // State for user data
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("posts");

  // Get authenticatedFetch from auth context
  const { authenticatedFetch, isAuthenticated } = useAuth();

  const resolvedParams = use(params);
  const { contacts, isLoadingContacts } = useFriendService();

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch("users/me");

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        console.log("User data:", data);
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user profile. Please try again later.");

        // Fallback to localStorage if API fails
        const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
        if (storedUser && Object.keys(storedUser).length > 0) {
          setUserData(storedUser);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authenticatedFetch, isAuthenticated]);

  // Example photos data (should eventually come from API)
  const photos = [
    { url: "/photo1.jpg" },
    { url: "/photo2.jpg" },
    { url: "/photo3.jpg" },
    { url: "/photo4.jpg" },
    { url: "/photo5.jpg" },
    { url: "/photo6.jpg" },
  ];

  const renderContent = () => {
    // If still loading data, show loading state
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>Loading profile data...</div>
      );
    }

    // If error and no fallback data, show error
    if (error && !userData) {
      return <div className={styles.errorContainer}>{error}</div>;
    }

    switch (activeSection) {
      case "about":
        return <ProfileAbout userData={userData} />;
      case "posts":
        return (
          <div className={styles.contentLayout}>
            <div className={styles.leftSidebar}>
              <ProfileAboutSideBar userData={userData} />
            </div>
            <div className={styles.mainContent}>
              <CreatePost />
              <PostList userData={userData} />
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
        {userData && (
          <ProfileBanner
            userData={userData}
            onNavClick={setActiveSection}
            activeSection="posts"
            isOwnProfile={true}
            BASE_URL={BASE_URL}
          />
        )}
        {renderContent()}
      </div>
    </>
  );
}
