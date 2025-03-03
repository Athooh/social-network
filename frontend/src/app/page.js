import Header from '@/components/header/Header';
import Image from 'next/image';
import styles from '@/styles/page.module.css';

export default function Home() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside></aside>
        <main className={styles.mainContent}>
          <section className={styles.welcomeSection}>
            <h1>Welcome to My Social Network</h1>
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={180} 
              height={37} 
              className={styles.logo}
              priority
            />
          </section>
          {/* Add more sections for posts, etc. */}
        </main>
        <aside></aside>
      </div>
    </>
  );
}

