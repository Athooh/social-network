import { useState } from 'react';
import styles from '@/styles/GroupEvents.module.css';
import CreateEventModal from '@/components/events/CreateEventModal';

const GroupEvents = ({ groupId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  // Updated dummy events data
  const [events] = useState([
    {
      id: 1,
      name: 'Tech Meetup 2024',
      date: '2024-05-15T18:00:00',
      description: 'Join us for an evening of tech talks and networking',
      banner: '/banner1.jpg',
      attendees: 45,
      privacy: 'public'
    },
    {
      id: 2,
      name: 'Web Development Workshop',
      date: '2024-06-01T14:00:00',
      description: 'Hands-on workshop on modern web development',
      banner: '/banner2.jpg',
      attendees: 32,
      privacy: 'public'
    },
    {
      id: 3,
      name: 'AI & Machine Learning Summit',
      date: '2024-06-15T09:00:00',
      description: 'Exploring the latest trends in AI and ML',
      banner: '/banner3.jpg',
      attendees: 78,
      privacy: 'private'
    },
    {
      id: 4,
      name: 'Mobile App Development Bootcamp',
      date: '2024-07-01T10:00:00',
      description: 'Intensive training on mobile app development',
      banner: '/banner4.jpg',
      attendees: 25,
      privacy: 'public'
    }
  ]);

  // Filter events based on search
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <div className={styles.eventsContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Group Events</h2>
          <button 
            className={styles.createButton}
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus"></i>
            Create Event
          </button>
        </div>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.eventsGrid}>
        {currentEvents.map(event => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventBanner}>
              <img src={event.banner} alt={event.name} />
              <span className={styles.privacy}>
                <i className={`fas ${event.privacy === 'private' ? 'fa-lock' : 'fa-globe'}`}></i>
              </span>
            </div>
            <div className={styles.eventInfo}>
              <h3>{event.name}</h3>
              <p className={styles.date}>
                <i className="fas fa-calendar"></i>
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className={styles.attendees}>
                <i className="fas fa-users"></i>
                {event.attendees} attending
              </p>
              <div className={styles.actions}>
                <button className={styles.inviteButton}>
                  <i className="fas fa-user-plus"></i>
                  Invite
                </button>
                <button className={styles.interestedButton}>
                  Interested
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? styles.active : ''}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default GroupEvents;