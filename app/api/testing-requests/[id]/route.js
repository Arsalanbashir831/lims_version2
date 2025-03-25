// /api/testing-requests/[id]/route.js
import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { doc, updateDoc, runTransaction, getDoc } from "firebase/firestore";

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
		await runTransaction(db, async (transaction) => {
			// Get the testing request document
			const reqDocRef = doc(db, "testingRequests", id);
			const reqSnap = await transaction.get(reqDocRef);
			if (!reqSnap.exists()) {
				throw new Error("Testing request not found");
			}
			const reqData = reqSnap.data();

			// Extract the requestId from the document (expected format: "REQ-<YEAR>-<4-digit serial>")
			const requestId = reqData.requestId;
			if (!requestId) {
				throw new Error("Testing request does not have a requestId");
			}
			const parts = requestId.split("-");
			if (parts.length < 3) {
				throw new Error("Invalid requestId format");
			}
			const year = parts[1];
			// Convert the serial string (e.g., "0001") to a number
			const deletedSerial = parseInt(parts[2], 10);

			// Define the counter document reference
			const counterDocId = `requestCounter-${year}`;
			const counterRef = doc(db, "counters", counterDocId);
			const counterSnap = await transaction.get(counterRef);

			if (!counterSnap.exists()) {
				// If the counter document doesn't exist, create one with serial = 0 and an empty free list.
				transaction.set(counterRef, { serial: 0, freeSerials: [] });
			} else {
				const data = counterSnap.data();
				let currentSerial = data.serial;
				let freeSerials = Array.isArray(data.freeSerials)
					? data.freeSerials
					: [];

				if (deletedSerial === currentSerial) {
					// If the deleted request is the highest allocated, decrement the counter.
					currentSerial = currentSerial - 1;
					// Check for consecutive free serials and remove them.
					while (freeSerials.includes(currentSerial)) {
						freeSerials = freeSerials.filter((num) => num !== currentSerial);
						currentSerial = currentSerial - 1;
					}
					transaction.update(counterRef, {
						serial: currentSerial,
						freeSerials,
					});
				} else {
					// For a non-highest request, add its serial to the free list if not already present.
					if (!freeSerials.includes(deletedSerial)) {
						freeSerials.push(deletedSerial);
						// Sort the free list so that the lowest available serial can be easily picked later.
						freeSerials.sort((a, b) => a - b);
					}
					transaction.update(counterRef, { freeSerials });
				}
			}
			// Finally, delete the testing request document.
			transaction.delete(reqDocRef);
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting testing request:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
