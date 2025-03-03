'use client';

import styles from '@/styles/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add authentication logic here
    router.push('/home');
  };

  return (
    <div className={styles.authContainer}>
      <h1 className="forumName">Notebook</h1>
      <div className={styles.authCard}>
        <h1>Login to Notebook</h1>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="btn-tertiary">Login</button>
        </form>
        <p className={styles.authLink}>
          New to Social Network? <Link href="/auth/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

