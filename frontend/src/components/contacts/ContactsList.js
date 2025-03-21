import React, { useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/ContactsList.module.css";
import { useUserStatus } from "@/services/userStatusService";

const ContactsList = ({ contacts }) => {
  const { isUserOnline, initializeStatuses } = useUserStatus();

  // Initialize online statuses from API data
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      initializeStatuses(contacts);
    }
  }, [contacts, initializeStatuses]);

  return (
    <div className={styles.contactsSection}>
      <div className={styles.sectionHeader}>
        <h3>Contacts</h3>
      </div>

      <div className={styles.contactsList}>
        {contacts.map((contact) => {
          // Use the API-provided status as default, then override with WebSocket updates
          const online = isUserOnline(contact.id, contact.isOnline);

          return (
            <div key={contact.id} className={styles.contactItem}>
              <div className={styles.avatarContainer}>
                <Image
                  src={contact.avatar}
                  alt={contact.name}
                  width={40}
                  height={40}
                  className={styles.avatar}
                />
                <span
                  className={`${styles.onlineStatus} ${
                    !online ? styles.offline : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faCircle}
                    style={{
                      color: online ? "#31a24c" : "#a3a3a3",
                      border: "2px solid #fff",
                      borderRadius: "50%",
                    }}
                  />
                </span>
              </div>
              <span className={styles.contactName}>{contact.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactsList;
