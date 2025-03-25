import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import {
	doc,
	getDoc,
	updateDoc,
	deleteDoc,
	runTransaction,
} from "firebase/firestore";

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
		await runTransaction(db, async (transaction) => {
			// Get the certificate document
			const certificateRef = doc(db, "certificates", id);
			const snapshot = await transaction.get(certificateRef);
			if (!snapshot.exists()) {
				throw new Error("Certificate not found");
			}
			const certificateData = snapshot.data();

			// Extract the certificateId from the document (expected format: "CERT-<YEAR>-<4-digit serial>")
			const certificateId = certificateData.issuanceNumber;
			if (!certificateId) {
				throw new Error("Certificate does not have a certificateId");
			}
			const parts = certificateId.split("-");
			if (parts.length < 3) {
				throw new Error("Invalid certificateId format");
			}
			const year = parts[1];
			// Convert the serial part (e.g., "0001") to a number
			const deletedSerial = parseInt(parts[2], 10);

			// Define the counter document reference (e.g., "certificateCounter-2025")
			const counterDocId = `certificateCounter-${year}`;
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
					// If the deleted certificate is the highest allocated, decrement the counter.
					currentSerial = currentSerial - 1;
					// Remove any consecutive free serials that now become the new highest allocated.
					while (freeSerials.includes(currentSerial)) {
						freeSerials = freeSerials.filter((num) => num !== currentSerial);
						currentSerial = currentSerial - 1;
					}
					transaction.update(counterRef, {
						serial: currentSerial,
						freeSerials,
					});
				} else {
					// For a certificate that isn't the highest, add its serial to the free list (if not already present).
					if (!freeSerials.includes(deletedSerial)) {
						freeSerials.push(deletedSerial);
						// Sort the free list so that the smallest available serial can be easily retrieved later.
						freeSerials.sort((a, b) => a - b);
					}
					transaction.update(counterRef, { freeSerials });
				}
			}
			// Finally, delete the certificate document.
			transaction.delete(certificateRef);
		});
		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error("Error deleting certificate:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
