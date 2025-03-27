import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// GET /api/certificates
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		// Set up concurrent API calls
		const certificatesPromise = getDocs(collection(db, "certificates"));
		const userRolePromise = userId
			? getDoc(doc(db, "users", userId))
			: Promise.resolve(null);

		// Await both promises concurrently
		const [certificatesSnapshot, userDocSnap] = await Promise.all([
			certificatesPromise,
			userRolePromise,
		]);

		// Process certificates data
		const certificates = certificatesSnapshot.docs.map((docSnap) => ({
			id: docSnap.id,
			...docSnap.data(),
		}));

		// Extract the user role if available
		let userRole = null;
		if (userDocSnap && userDocSnap.exists()) {
			userRole = userDocSnap.data().user_role;
		}

		return NextResponse.json({ success: true, certificates, userRole });
	} catch (error) {
		console.error("Error fetching certificates:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
