import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { collection, addDoc, doc, runTransaction } from "firebase/firestore";

export async function POST(request) {
	try {
		const { jobId, rows } = await request.json();

		// Generate a unique request ID in the format REQ-<YEAR>-<4-digit serial>
		const currentYear = new Date().getFullYear();
		const counterDocId = `requestCounter-${currentYear}`;
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
		const requestId = `REQ-${currentYear}-${newSerial
			.toString()
			.padStart(4, "0")}`;

		// Save the testing request with the nested testing items.
		// Extract jobId from selectedJob.sample.jobId if it exists.
		const requestData = {
			jobId,
			rows,
			requestId,
			createdAt: new Date().toISOString(),
		};

		const docRef = await addDoc(collection(db, "testingRequests"), requestData);

		return NextResponse.json({ success: true, requestId, id: docRef.id });
	} catch (error) {
		console.error("Error adding testing request:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
