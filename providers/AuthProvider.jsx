"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { auth } from "@/config/firebase-config"; // Your Firebase initialization file
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";

// Create a context for auth state
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	useEffect(() => {
		// Listen for auth state changes
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				// Optionally force a token refresh
				const tokenResult = await getIdTokenResult(user, true);
				console.log("New ID token:", tokenResult.token);
				setUser(user);
			} else {
				setUser(null);
			}
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
	);
}

// Custom hook to access the auth context
export function useAuth() {
	return useContext(AuthContext);
}
