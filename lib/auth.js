import { auth, db } from "@/config/firebase-config";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Sign Up
export async function signUp(email, password) {
	try {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// Create a user document in Firestore under the "users" collection
		await setDoc(doc(db, "users", user.uid), {
			email: user.email,
			createdAt: new Date().toISOString(),
			// Add any additional fields here as needed
		});

		return { user };
	} catch (error) {
		return { error: error.message };
	}
}

// Log In
export async function logIn(email, password) {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		return { user: userCredential.user };
	} catch (error) {
		return { error: error.message };
	}
}

// Log Out
export async function logOut() {
	try {
		await signOut(auth);
		return { success: true };
	} catch (error) {
		return { error: error.message };
	}
}
