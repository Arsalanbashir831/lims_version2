import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// GET /api/certificates/[id]
export async function GET(request, { params }) {
	const { id } = params;
	try {
		const certificateRef = doc(db, "certificates", id);
		const snapshot = await getDoc(certificateRef);
		if (!snapshot.exists()) {
			return NextResponse.json(
				{ success: false, error: "Certificate not found" },
				{ status: 404 }
			);
		}
		const certificate = { id: snapshot.id, ...snapshot.data() };
		return NextResponse.json({ success: true, certificate });
	} catch (error) {
		console.error("Error fetching certificate:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

export async function PUT(request, { params }) {
	try {
		const { id } = params;
		const payload = await request.json();
		// Optionally sanitize payload if needed.
		await updateDoc(doc(db, "certificates", id), payload);
		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error("Error updating certificate:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// DELETE /api/certificates/[id]
export async function DELETE(request, { params }) {
	const { id } = params;
	try {
		const certificateRef = doc(db, "certificates", id);
		// Check if certificate exists
		const snapshot = await getDoc(certificateRef);
		if (!snapshot.exists()) {
			return NextResponse.json(
				{ success: false, error: "Certificate not found" },
				{ status: 404 }
			);
		}
		// Delete the certificate
		await deleteDoc(certificateRef);
		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error("Error deleting certificate:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
