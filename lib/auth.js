import { auth } from "@/config/firebase-config";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";

// Sign Up
export async function signUp(email, password) {
	try {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		return { user: userCredential.user };
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
