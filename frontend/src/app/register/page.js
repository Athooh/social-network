"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/authcontext";
import PasswordInput from "@/components/inputs/PasswordInput";
import styles from "@/styles/auth.module.css";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    nickname: "",
    aboutMe: "",
    avatar: null,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file) {
        setFormData({
          ...formData,
          avatar: file,
        });
        setAvatarPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await signUp(formData);
      if (success) {
        router.push("/home");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.forumName}>Notebook</h1>
        <p>Create a new account</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.nameGroup}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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

          <div className={styles.formGroup}>
            <input
              type="date"
              name="dateOfBirth"
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="nickname"
              placeholder="Nickname (optional)"
              value={formData.nickname}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <textarea
              name="aboutMe"
              placeholder="About Me (optional)"
              value={formData.aboutMe}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="avatar" className={styles.avatarLabel}>
              Profile Picture (optional)
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleChange}
              className={styles.fileInput}
            />
            {avatarPreview && (
              <div className={styles.avatarPreview}>
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.authLink}>
          Already have an account? <Link href="/">Log In</Link>
        </div>
      </div>
    </div>
  );
}
