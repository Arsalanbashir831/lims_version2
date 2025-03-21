import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config"; // Your Firestore instance
import { collection, addDoc, doc, runTransaction } from "firebase/firestore";

export async function POST(request) {
	try {
		// Parse the JSON payload from the request.
		const payload = await request.json();
		const { jobId, requestId } = payload;

		console.log("Received payload for jobId:", jobId, "requestId:", requestId);

		// Generate a unique certificate issuance number.
		const currentYear = new Date().getFullYear();
		const counterDocId = `certificateCounter-${currentYear}`;
		const counterRef = doc(db, "counters", counterDocId);
		const newSerial = await runTransaction(db, async (transaction) => {
			const counterDoc = await transaction.get(counterRef);
			let serial;
			if (!counterDoc.exists()) {
				serial = 1;
				transaction.set(counterRef, { serial });
			} else {
				serial = counterDoc.data().serial + 1;
				transaction.update(counterRef, { serial });
			}
			return serial;
		});
		const issuanceNumber = `CERT-${currentYear}-${newSerial
			.toString()
			.padStart(4, "0")}`;
		// Add the issuance number to the payload.
		payload.issuanceNumber = issuanceNumber;
		console.log("Generated issuance number:", issuanceNumber);

		// Note: Image upload is now handled on the client side.
		// Save the enriched payload (with image URLs and issuance number) to Firestore.
		const docRef = await addDoc(collection(db, "certificates"), payload);
		console.log("Document saved with ID:", docRef.id);
		return NextResponse.json({ success: true, issuanceNumber, id: docRef.id });
	} catch (error) {
		console.error("Error saving submission:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
