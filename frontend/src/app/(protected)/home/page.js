import Header from '@/components/header/Header';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import styles from '@/styles/page.module.css';

export default function Home() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          <section className={styles.welcomeSection}>
            <h1>Welcome to My Social Network</h1>
          </section>
        </main>
        <aside>
          <RightSidebar />
        </aside>
      </div>
    </>
  );
} 