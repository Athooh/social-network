"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.API_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Memoize handleLogout to prevent unnecessary re-renders
  const handleLogout = useCallback(
    async (sendRequest = true) => {
      if (sendRequest && token) {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
      }

      localStorage.removeItem("userData");
      localStorage.removeItem("token");

      // Clear the token cookie
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      setCurrentUser(null);
      setToken(null);
      setLoading(false);

      if (sendRequest) {
        router.push("/login");
      }
    },
    [token, router]
  ); // Dependencies: token and router

  const validateToken = useCallback(
    async (currentToken) => {
      try {
        const response = await fetch(`${API_URL}/auth/validate_token`, {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (!response.ok) {
          handleLogout(false);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Token validation error:", error);
        handleLogout(false);
      }
    },
    [handleLogout]
  ); // Depend on memoized handleLogout

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
      validateToken(storedToken);

      // router.push("/home");
    } else {
      setLoading(false);
      handleLogout(false);
    }
  }, [validateToken]);
  // Depend on memoized validateToken

  const login = async (formData) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      if (data && data.user && data.token) {
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        setCurrentUser(data.user);
        setToken(data.token);

        document.cookie = `token=${data.token}; path=/; max-age=86400; samesite=strict`;

        return true;
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return false;
    }
  };

  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const signUp = async (signUpData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("email", signUpData.email);
      formData.append("password", signUpData.password);
      formData.append("firstName", signUpData.firstName);
      formData.append("lastName", signUpData.lastName);
      formData.append("dateOfBirth", signUpData.dateOfBirth);
      formData.append("nickname", signUpData.nickname || "");
      formData.append("aboutMe", signUpData.aboutMe || "");

      if (signUpData.avatar) {
        formData.append("avatar", signUpData.avatar);
      }

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      const data = await response.json();

      if (data && data.user && data.token) {
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        document.cookie = `token=${data.token}; path=/; max-age=${data.expires_in}; samesite=strict`;

        setCurrentUser(data.user);
        setToken(data.token);
        return true;
      }

      throw new Error("Signup failed: invalid data from backend");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();

        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        setCurrentUser(data.user);
        setToken(data.token);
      } else {
        handleLogout(true);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      handleLogout(true);
    } finally {
      setLoading(false);
    }
  };

  const authenticatedFetch = async (url, options = {}) => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        handleLogout(true);
        throw new Error("No token found");
      }

      const authHeader = { Authorization: `Bearer ${storedToken}` };
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        handleLogout(true);
        throw new Error("Unauthorized - Please log in again.");
      }

      return response;
    } catch (error) {
      console.error("Authenticated fetch error:", error);
      throw error;
    }
  };

  const value = {
    login,
    logout: () => handleLogout(true),
    signUp,
    getAuthHeader,
    authenticatedFetch,
    currentUser,
    token,
    loading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
