"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/constants";
import Spinner from "./common/Spinner";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Use a ref to always have the latest value of user
  const latestUserRef = useRef(user);
  useEffect(() => {
    latestUserRef.current = user;
  }, [user]);

  // Wait 5 seconds before checking the user state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (latestUserRef.current) {
        setLoading(false);
      } else {
        router.push(ROUTES.AUTH.LOGIN);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner/>
      </div>
    );
  }

  return <>{children}</>;
}
