"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/constants";

export default function ProtectedRoute({ children }) {
	const { user } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Once user is determined (user is null or an object), we stop loading.
		if (user !== undefined) {
			if (!user) {
				router.push(ROUTES.AUTH.LOGIN);
			} else {
				setLoading(false);
			}
		}
	}, [user, router]);

	if (loading) {
		return <p>Loading...</p>;
	}

	return children;
}
