import React from 'react';
import styles from '@/styles/ProfileEvents.module.css';
import eventStyles from '@/styles/Events.module.css';
import ContactsList from '@/components/contacts/ContactsList';

// Import the sample events (you should later replace this with actual user events data)
const sampleEvents = [
  {
    id: 1,
    name: "Community Cleanup Drive – Join Us Today!",
    banner: "/banner1.jpg",
    date: "2024-04-15",
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
    date: "2024-10-10",
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
    date: "2024-06-19",
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
    date: "2025-01-01",
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
    date: "2025-10-05",
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
    date: "2024-07-10",
    isPublic: true,
    memberCount: 6789,
    members: [
      { id: 16, avatar: "/avatar6.png" },
      { id: 17, avatar: "/avatar.png" },
      { id: 18, avatar: "/avatar1.png" },
    ]
},
  // ... you can import more events from the events page
];

const ProfileEvents = () => {
  return (
    <div className={styles.eventsContainer}>
      <div className={styles.mainContent}>
        <div className={eventStyles.eventsHeader}>
          <h2>My Events</h2>
        </div>
        
        <div className={eventStyles.eventsGrid}>
          {sampleEvents.map(event => (
            <div key={event.id} className={eventStyles.eventCard}>
              <div className={eventStyles.eventBanner}>
                <img src={event.banner} alt="" className={eventStyles.bannerImg} />
                <div className={eventStyles.dateBadge}>
                  <span className={eventStyles.month}>
                    {new Date(event.date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className={eventStyles.day}>
                    {new Date(event.date).getDate()}
                  </span>
                </div>
              </div>
              <div className={eventStyles.eventInfo}>
                <h3 className={eventStyles.eventName}>{event.name}</h3>
                <span className={eventStyles.eventPrivacy}>
                  <i className={`fas ${event.isPublic ? 'fa-globe' : 'fa-lock'}`}></i>
                  {event.isPublic ? 'Public Event' : 'Private Event'}
                </span>
                
                <div className={eventStyles.memberInfo}>
                  <div className={eventStyles.memberAvatars}>
                    {event.members.map((member, index) => (
                      <img 
                        key={member.id} 
                        src={member.avatar} 
                        alt="" 
                        className={eventStyles.memberAvatar}
                        style={{ zIndex: 3 - index }}
                      />
                    ))}
                  </div>
                  <span className={eventStyles.memberCount}>
                    {event.memberCount.toLocaleString()} Going
                  </span>
                </div>
                
                <hr className={eventStyles.divider} />
                
                <div className={eventStyles.eventActions}>
                  <button className={styles.inviteBtn}>
                    <i className="fas fa-share"></i> Share
                  </button>
                  <button className={styles.manageBtn}>
                    Manage Event
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.sidebar}>
        <ContactsList />
      </div>
    </div>
  );
};

export default ProfileEvents; 