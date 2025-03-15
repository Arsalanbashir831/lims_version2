// app/api/get-user-profile/route.js
import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { doc, getDoc } from "firebase/firestore";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const uid = searchParams.get("uid");

	if (!uid) {
		return NextResponse.json({ error: "User ID is required" }, { status: 400 });
	}

	try {
		const userDocRef = doc(db, "users", uid);
		const userDoc = await getDoc(userDocRef);

		if (userDoc.exists()) {
			const data = userDoc.data();
			return NextResponse.json({ success: true, user: data });
		} else {
			return NextResponse.json(
				{ error: "User data not found" },
				{ status: 404 }
			);
		}
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return NextResponse.json(
			{ error: "Error fetching user profile." },
			{ status: 500 }
		);
	}
}
