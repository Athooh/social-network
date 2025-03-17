"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/authcontext";
import PasswordInput from "@/components/inputs/PasswordInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
  const { login, isAuthenticated, loading } = useAuth();

  // Get the 'from' parameter to redirect after login
  const from = searchParams.get("from") || "/home";

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, loading, router]);

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

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner size="large" fullPage={true} />;
  }

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
            {isLoading ? (
              <>
                <LoadingSpinner size="small" color="light" /> Logging in...
              </>
            ) : (
              "Log In"
            )}
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
