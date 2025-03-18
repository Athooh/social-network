'use client'

import styles from '@/styles/Sidebar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FriendsSidebar() {
  const pathname = usePathname()

  const stats = [
    { label: 'Posts', count: 120 },
    { label: 'Groups', count: 12 },
    { label: 'Followers', count: 1230 },
    { label: 'Following', count: 300 },
  ]

  const navLinks = [
    { icon: 'fas fa-user-plus', label: 'Friend Requests', path: '/friends/requests' },
    { icon: 'fas fa-users', label: 'Suggestions', path: '/friends/suggestions' },
    { icon: 'fas fa-user-friends', label: 'All Friends', path: '/friends/all' },
    { icon: 'fas fa-ban', label: 'Block List', path: '/friends/blocked' },
  ]

  const contacts = [
    { id: 1, name: 'Alice Smith', image: '/avatar.png', isOnline: true },
    { id: 2, name: 'Bob Wilson', image: '/avatar6.png', isOnline: false },
    { id: 3, name: 'Carol Johnson', image: '/avatar2.png', isOnline: true },
    { id: 4, name: 'David Brown', image: '/avatar3.png', isOnline: true },
    { id: 5, name: 'Eve Taylor', image: '/avatar1.png', isOnline: false },
  ]

  return (
    <div className={styles.sidebar}>
      <div className={styles.profileSection}>
        <img src="/avatar4.png" alt="Profile" className={styles.profilePic} />
        <h2 className={styles.userName}>John Doe</h2>
        <p className={styles.userProfession}>Web Developer</p>
        
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
            className={`${styles.navLink} ${pathname === link.path ? styles.active : ''}`}
          >
            <i className={link.icon}></i>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <section className={styles.contacts}>
        <h2>Contacts</h2>
        {contacts.map((contact) => (
          <div key={contact.id} className={styles.contactItem}>
            <div className={styles.contactProfile}>
              <div className={styles.contactImageWrapper}>
                <img src={contact.image} alt={contact.name} />
                <span className={`${styles.onlineStatus} ${contact.isOnline ? styles.online : styles.offline}`} />
              </div>
              <span className={styles.contactName}>{contact.name}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
} 