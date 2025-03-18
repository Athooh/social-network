"use client";

import Header from "@/components/header/Header";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import pageStyles from "@/styles/page.module.css";
import styles from "@/styles/Events.module.css";
import CreateEventModal from "@/components/events/CreateEventModal";
import { useState } from 'react';

const sampleEvents = [
  {
    id: 1,
    name: "Community Cleanup Drive – Join Us Today!",
    banner: "/banner1.jpg",
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
    name: "Tech Meetup – Innovate, Connect, Grow!",
    banner: "/banner2.jpg",
    // profilePic: "/avatar4.png",
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
    name: "Charity Run – Run for a Cause!",
    banner: "/banner3.jpg", 
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
    name: "Entrepreneurship Workshop – Learn, Network, Succeed!",
    banner: "/banner4.jpg",
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
    name: "Food Donation Event – Make a Difference!",
    banner: "/banner5.jpg",
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
    name: "Health Awareness Campaign – Stay Informed, Stay Safe!",
    banner: "/banner6.jpg",
    isPublic: true,
    memberCount: 6789,
    members: [
      { id: 16, avatar: "/avatar6.png" },
      { id: 17, avatar: "/avatar.png" },
      { id: 18, avatar: "/avatar1.png" },
    ]
},
  // Add 4 more sample groups...
];

export default function Events() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ProtectedRoute>
      <Header />
      <div className={styles.container}>
        <aside className={pageStyles.leftSidebar}>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          <div className={styles.eventsHeader}>
            <h1>Events</h1>
            <button 
              className={styles.createEventBtn}
              onClick={() => setIsModalOpen(true)}
            >
              <i className="fas fa-plus"></i> Create New Event
            </button>
          </div>
          
          <div className={styles.eventsGrid}>
            {sampleEvents.map(event => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventBanner}>
                  <img src={event.banner} alt="" className={styles.bannerImg} />
                </div>
                <div className={styles.eventInfo}>
                  {/* <img src={event.profilePic} alt="" className={styles.profilePic} /> */}
                  <h3 className={styles.eventName}>{event.name}</h3>
                  <span className={styles.eventPrivacy}>
                    <i className={`fas ${event.isPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                    {event.isPublic ? 'Public Event' : 'Private Event'}
                  </span>
                  
                  <div className={styles.memberInfo}>
                    <div className={styles.memberAvatars}>
                      {event.members.map((member, index) => (
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
                      {event.memberCount.toLocaleString()} Going
                    </span>
                  </div>
                  
                  <hr className={styles.divider} />
                  
                  <div className={styles.eventActions}>
                    <button className={styles.inviteBtn}>
                      <i className="fas fa-share"></i> Share
                    </button>
                    <button className={styles.joinBtn}>
                      Interested
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <CreateEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </ProtectedRoute>
  );
} 