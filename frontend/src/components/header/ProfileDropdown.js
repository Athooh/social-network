'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Header.module.css';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  
  const handleLogout = () => {
    // Add any logout logic here (clearing session, etc.)
    router.push('/');
  };

  return (
    <div className={styles.profileDropdownContainer}>
      <img 
        src="/avatar4.png" 
        alt="Profile" 
        className={styles.profileIcon} 
        onClick={toggleDropdown}
      />
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.profileHeader}>
            <img src="/avatar4.png" alt="Profile" className={styles.dropdownProfilePic} />
            <div className={styles.profileInfo}>
              <h3>John Doe</h3>
              <span>Web Developer</span>
            </div>
          </div>
          
          <div className={styles.dropdownDivider} />
          
          <Link href="/profile/1" className={styles.dropdownItem}>
            <i className="fas fa-user"></i>
            View Profile
          </Link>
          
          <button onClick={toggleDarkMode} className={styles.dropdownItem}>
            <i className={isDarkMode ? "fas fa-sun" : "fas fa-moon"}></i>
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          
          <div className={styles.dropdownDivider} />
          
          <button onClick={handleLogout} className={styles.dropdownItem}>
            <i className="fas fa-sign-out-alt"></i>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}