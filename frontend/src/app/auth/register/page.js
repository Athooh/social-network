'use client';

import styles from '@/styles/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PasswordInput from '@/components/inputs/PasswordInput';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nickname: '',
    aboutMe: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <PasswordInput 
                value={formData.password}
                onChange={handleChange}
            />
            </div>
          {/* Rest of the form fields */}
          <div className={styles.nameGroup}>
            <input 
              type="text" 
              name="firstName"
              placeholder="First Name" 
              value={formData.firstName}
              onChange={handleChange}
              required 
            />
            <input 
              type="text" 
              name="lastName"
              placeholder="Last Name" 
              value={formData.lastName}
              onChange={handleChange}
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Date of Birth</label>
            <input 
              type="date" 
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required 
            />
          </div>

          {/* Optional Fields */}
          <div className={styles.formGroup}>
            <label>Profile Picture (Optional)</label>
            <input type="file" accept="image/*" />
          </div>
          <div className={styles.formGroup}>
            <input 
              type="text" 
              name="nickname"
              placeholder="Nickname (Optional)" 
              value={formData.nickname}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <textarea 
              name="aboutMe"
              placeholder="About Me (Optional)"
              rows={3}
              value={formData.aboutMe}
              onChange={handleChange}
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
