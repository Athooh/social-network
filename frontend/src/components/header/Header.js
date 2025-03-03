// src/components/header/Header.js
import styles from '@/styles/Header.module.css';
import Link from 'next/link';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/">
            <h1>My Social Network</h1>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/profile/1">Profile</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/auth/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}