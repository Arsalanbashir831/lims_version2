import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { collection, addDoc, getDocs } from "firebase/firestore";

// GET /api/certificates
export async function GET(request) {
	try {
		const certificatesRef = collection(db, "certificates");
		const snapshot = await getDocs(certificatesRef);
		const certificates = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		return NextResponse.json({ success: true, certificates });
	} catch (error) {
		console.error("Error fetching certificates:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
