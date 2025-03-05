import Header from '@/components/header/Header';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import CreatePost from '@/components/posts/CreatePost';
import Post from '@/components/posts/Post';
import styles from '@/styles/page.module.css';
import postStyles from '@/styles/Posts.module.css';

const samplePosts = [
  {
    id: 1,
    authorName: "John Doe",
    authorImage: "/avatar4.png",
    timestamp: "2 hours ago",
    content: "Just finished building a new feature!",
    image: "/image1.jpg",
    likes: 42,
    commentCount: 8,
    shares: 3,
    comments: [
      {
        id: 1,
        authorName: "Jane Smith",
        authorImage: "/avatar1.png",
        content: "That's awesome! Can't wait to see it.",
        timestamp: "1 hour ago"
      }
    ]
  },
  {
    id: 2,
    authorName: "Jane Smith",
    authorImage: "/avatar1.png",
    timestamp: "4 hours ago",
    content: "Beautiful day for coding! ☀️",
    likes: 24,
    commentCount: 3,
    shares: 1,
    comments: []
  }
];

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
          <section className={postStyles.postsContainer}>
            {samplePosts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </section>
        </main>
        <aside>
          <RightSidebar />
        </aside>
      </div>
    </>
  );
}