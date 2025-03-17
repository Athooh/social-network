"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/authcontext";
import PasswordInput from "@/components/inputs/PasswordInput";
import styles from "@/styles/auth.module.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Get the 'from' parameter to redirect after login
  const from = searchParams.get("from") || "/home";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(formData);
      if (success) {
        router.push(from);
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.forumName}>Notebook</h1>
        <p>Connect with friends and the world around you.</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
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
              placeholder="Password"
              name="password"
            />
          </div>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className={styles.authLink}>
          <Link href="/forgot-password">Forgot Password?</Link>
        </div>

        <div className={styles.authLink}>
          Don't have an account? <Link href="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
