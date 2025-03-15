// components/GuestRoute.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/constants";

export default function GuestRoute({ children }) {
	const { user } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// When auth state is determined:
		if (user !== undefined) {
			if (user) {
				// If the user is logged in, redirect them away from auth pages.
				router.push(ROUTES.DASHBOARD.INDEX);
			} else {
				// If no user is logged in, allow access.
				setLoading(false);
			}
		}
	}, [user, router]);

	if (loading) {
		// Optionally show a loading indicator while checking auth state.
		return <p>Loading...</p>;
	}

	return children;
}
