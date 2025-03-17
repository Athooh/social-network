"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authcontext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication check is complete and user is not authenticated
    if (!loading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login protected route");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Show nothing while loading
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If authenticated, show the children components
  return isAuthenticated ? children : null;
}
