'use client';

import Header from '@/components/header/Header';
import styles from '@/styles/page.module.css';

export default function Groups() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside></aside>
        <main className={styles.mainContent}>
          <section className={styles.welcomeSection}>
            <h1>Groups</h1>
          </section>
        </main>
        <aside></aside>
      </div>
    </>
  );
}
