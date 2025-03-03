'use client';

import styles from '@/styles/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add registration logic here
    router.push('/home');
  };

  return (
    <div className={styles.authContainer}>
        <h1 className="forumName">Notebook</h1>
      <div className={styles.authCard}>
        <h1>Create a new Account</h1>
        <p>Its quick and easy</p>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          {/* Required Fields */}
          <div className={styles.formGroup}>
            <input type="email" placeholder="Email" required />
          </div>
          <div className={styles.formGroup}>
            <input type="password" placeholder="Password" required />
          </div>
          <div className={styles.nameGroup}>
            <input type="text" placeholder="First Name" required />
            <input type="text" placeholder="Last Name" required />
          </div>
          <div className={styles.formGroup}>
            <label>Date of Birth</label>
            <input type="date" required />
          </div>

          {/* Optional Fields */}
          <div className={styles.formGroup}>
            <label>Profile Picture (Optional)</label>
            <input type="file" accept="image/*" />
          </div>
          <div className={styles.formGroup}>
            <input type="text" placeholder="Nickname (Optional)" />
          </div>
          <div className={styles.formGroup}>
            <textarea 
              placeholder="About Me (Optional)"
              rows={3}
            ></textarea>
          </div>

          <button type="submit" className="btn-primary">
            Create Account
          </button>
        </form>
        <p className={styles.authLink}>
          Already have an account? <Link href="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
