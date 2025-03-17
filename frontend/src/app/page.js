"use client";

import styles from "@/styles/auth.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordInput from "@/components/inputs/PasswordInput";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    router.push("/home");
    // Dummy credentials
    if (
      formData.email === "test@example.com" &&
      formData.password === "password123"
    ) {
      router.push("/home");
    } else {
      setError("Invalid email or password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.authContainer}>
      <h1 className="forumName">Notebook</h1>
      <div className={styles.authCard}>
        <h1>Login to Notebook</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <PasswordInput value={formData.password} onChange={handleChange} />
          <button type="submit" className="btn-tertiary">
            Login
          </button>
        </form>
        <p className={styles.authLink}>
          New to Notebook? <Link href="/auth/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
