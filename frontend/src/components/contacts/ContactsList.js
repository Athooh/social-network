import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import styles from '@/styles/ContactsList.module.css';

const ContactsList = () => {
  // Example contacts data - replace with actual data from your backend
  const contacts = [
    {
      id: 1,
      name: "Jane Smith",
      avatar: "/avatar2.png",
      isOnline: true,
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "/avatar4.png",
      isOnline: false,
    },
    {
      id: 3,
      name: "Sarah Wilson",
      avatar: "/avatar5.png",
      isOnline: true,
    },
    // Add more contacts as needed
  ];

  return (
    <div className={styles.contactsSection}>
      <div className={styles.sectionHeader}>
        <h3>Contacts</h3>
      </div>
      
      <div className={styles.contactsList}>
        {contacts.map((contact) => (
          <div key={contact.id} className={styles.contactItem}>
            <div className={styles.avatarContainer}>
              <Image
                src={contact.avatar}
                alt={contact.name}
                width={40}
                height={40}
                className={styles.avatar}
              />
              {contact.isOnline && (
                <span className={styles.onlineStatus}>
                  <FontAwesomeIcon icon={faCircle} />
                </span>
              )}
            </div>
            <span className={styles.contactName}>{contact.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsList; 