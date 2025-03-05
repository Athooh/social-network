'use client';

import Header from '@/components/header/Header';
import CreatePost from '@/components/posts/CreatePost';
import styles from '@/styles/page.module.css';

export default function Posts() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside></aside>
        <main className={styles.mainContent}>
          <CreatePost />
          {/* Posts list will go here */}
        </main>
        <aside></aside>
      </div>
    </>
  );
}
