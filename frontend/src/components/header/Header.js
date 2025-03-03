// src/components/header/Header.js
'use client';

import styles from '@/styles/Header.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // Add logout logic here
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/home">
            <h1>My Social Network</h1>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/home">Home</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/profile/1">Profile</Link>
          <Link href="/messages">Messages</Link>
          <button onClick={handleLogout}>Logout</button>
        </nav>
      </div>
    </header>
  );
}