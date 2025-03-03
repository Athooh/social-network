import styles from '@/styles/auth.module.css';
import Link from 'next/link';

export default function Register() {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1>Create Account</h1>
        <form className={styles.authForm}>
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
          Already have an account? <Link href="/auth/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
