'use client';

import Header from '@/components/header/Header';
import styles from '@/styles/page.module.css';

export default function Messages() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside></aside>
        <main className={styles.mainContent}>
          <section className={styles.welcomeSection}>
            <h1>Messages</h1>
          </section>
        </main>
        <aside></aside>
      </div>
    </>
  );
}
