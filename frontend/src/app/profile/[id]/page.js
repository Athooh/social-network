// src/app/profile/[id]/page.js
'use client';

import Header from '@/components/header/Header';
import styles from '@/styles/page.module.css';
import { use } from 'react';

export default function Profile({ params }) {
  const resolvedParams = use(params);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside></aside>
        <main className={styles.mainContent}>
          <section className={styles.welcomeSection}>
            <h1>Profile</h1>
            <p>User ID: {resolvedParams.id}</p>
          </section>
        </main>
        <aside></aside>
      </div>
    </>
  );
}