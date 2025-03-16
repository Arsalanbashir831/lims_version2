import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { collection, doc, runTransaction, addDoc } from "firebase/firestore";

export async function POST(request) {
	try {
		// Extract sample and sampleDetails from the request body
		const { sample, sampleDetails } = await request.json();

		// Get the current year and define a counter document ID for that year
		const currentYear = new Date().getFullYear();
		const counterDocId = `jobCounter-${currentYear}`;
		const counterRef = doc(db, "counters", counterDocId);

		// Run a transaction to get and update the counter atomically
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

		// Generate the Job ID (e.g., MTL-2025-0001)
		const jobId = `MTL-${currentYear}-${newSerial.toString().padStart(4, "0")}`;
		sample.jobId = jobId;

		// Generate unique item numbers for each sample detail.
		// For example: "MTL-2025-0001-001", "MTL-2025-0001-002", etc.
		const updatedDetails = sampleDetails.map((detail, index) => ({
			...detail,
			itemNo: `${jobId}-${(index + 1).toString().padStart(3, "0")}`,
		}));

		// Create the sample lot document data, including a timestamp if desired
		const sampleLotData = {
			sample,
			sampleDetails: updatedDetails,
			createdAt: new Date().toISOString(),
		};

		// Save the document to the "jobs" collection
		const docRef = await addDoc(collection(db, "jobs"), sampleLotData);

		return NextResponse.json({ success: true, jobId, id: docRef.id });
	} catch (error) {
		console.error("Error adding job:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
