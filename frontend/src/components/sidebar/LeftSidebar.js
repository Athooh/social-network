'use client';

import Link from 'next/link';
import styles from '@/styles/Sidebar.module.css';
import { usePathname } from 'next/navigation';

export default function LeftSidebar() {
  const pathname = usePathname();

  const stats = [
    { label: 'Posts', count: 120 },
    { label: 'Groups', count: 12 },
    { label: 'Followers', count: 1230 },
    { label: 'Following', count: 300 },
  ];

  const navLinks = [
    { icon: 'fas fa-home', label: 'Home', path: '/home' },
    { icon: 'fas fa-users', label: 'Groups', path: '/groups' },
    { icon: 'fas fa-calendar-alt', label: 'Events', path: '/events' },
    { icon: 'fas fa-user-friends', label: 'Friends', path: '/Friends' },
    { icon: 'fas fa-envelope', label: 'Messages', path: '/messages' },
    { icon: 'fas fa-user', label: 'Profile', path: '/profile' },
    { icon: 'fa-solid fa-gear', label: 'Settings', path: '/settings' },
  ];


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
    </div>
  );
} 