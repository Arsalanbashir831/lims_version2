import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		// Prepare concurrent API calls
		const jobsPromise = getDocs(collection(db, "jobs"));
		const userPromise = userId
			? getDoc(doc(db, "users", userId))
			: Promise.resolve(null);

		// Execute both calls concurrently
		const [jobsSnapshot, userDocSnap] = await Promise.all([
			jobsPromise,
			userPromise,
		]);

		// Process jobs data
		const jobs = jobsSnapshot.docs.map((docSnap) => ({
			id: docSnap.id,
			...docSnap.data(),
		}));

		// Extract user role if available
		let userRole = null;
		if (userDocSnap && userDocSnap.exists()) {
			userRole = userDocSnap.data().user_role;
		}

		return NextResponse.json({ success: true, jobs, userRole });
	} catch (error) {
		console.error("Error fetching jobs:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
