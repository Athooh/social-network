import Header from '@/components/header/Header';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import CreatePost from '@/components/posts/CreatePost';
import styles from '@/styles/page.module.css';
import postStyles from '@/styles/Posts.module.css';  // Renamed this import

export default function Home() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <aside>
          <LeftSidebar />
        </aside>
        <main className={styles.mainContent}>
          <section className={postStyles.CreatePost}>
           <CreatePost />
          </section>
        </main>
        <aside>
          <RightSidebar />
        </aside>
      </div>
    </>
  );
}