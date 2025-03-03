import styles from '@/styles/auth.module.css';
import Link from 'next/link';

export default function Login() {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1>Login</h1>
        <form className={styles.authForm}>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="btn-tertiary">Login</button>
        </form>
        <p>
          Don't have an account? <Link href="/auth/register">Register</Link>
        </p>
      </div>
    </div>
  );
}