// /api/testing-requests/[id]/route.js
import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

// PUT: Update an existing testing request
export async function PUT(request, { params }) {
	const { id } = params;
	try {
		const updatedData = await request.json();

		// Optional: Verify the document exists before updating.
		const docRef = doc(db, "testingRequests", id);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) {
			return NextResponse.json(
				{ error: "Document not found" },
				{ status: 404 }
			);
		}

		// Update the document with the new data.
		await updateDoc(docRef, updatedData);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating testing request:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// DELETE: Delete an existing testing request
export async function DELETE(request, { params }) {
	const { id } = params;
	try {
		const docRef = doc(db, "testingRequests", id);
		await deleteDoc(docRef);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting testing request:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
