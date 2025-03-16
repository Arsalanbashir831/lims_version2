import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
	try {
		const snapshot = await getDocs(collection(db, "jobs"));
		const jobs = snapshot.docs.map((docSnap) => ({
			id: docSnap.id,
			...docSnap.data(),
		}));
		return NextResponse.json({ success: true, jobs });
	} catch (error) {
		console.error("Error fetching jobs:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
