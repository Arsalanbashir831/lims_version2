import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { doc, updateDoc, runTransaction, getDoc } from "firebase/firestore";

export async function GET(request, { params }) {
	const { id } = params;
	try {
		const jobRef = doc(db, "jobs", id);
		const jobSnap = await getDoc(jobRef);
		if (!jobSnap.exists()) {
			return NextResponse.json({ error: "Job not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, job: jobSnap.data() });
	} catch (error) {
		console.error("Error fetching job:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PUT(request, { params }) {
	const { id } = params;
	try {
		const updatedData = await request.json();
		const jobRef = doc(db, "jobs", id);
		await updateDoc(jobRef, updatedData);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating job:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = params;
	try {
		const jobRef = doc(db, "jobs", id);
		await runTransaction(db, async (transaction) => {
			// Get the job document first
			const jobSnap = await transaction.get(jobRef);
			if (!jobSnap.exists()) {
				throw new Error("Job not found");
			}
			const jobData = jobSnap.data();
			// Expect the jobId to be in the sample object (e.g., "MTL-2025-0001")
			const jobId = jobData.sample?.jobId;
			if (!jobId) {
				throw new Error("Job ID not found in the job document");
			}
			// Extract the year from the jobId
			// e.g., splitting "MTL-2025-0001" yields ["MTL", "2025", "0001"]
			const parts = jobId.split("-");
			const year = parts[1];
			const counterDocId = `jobCounter-${year}`;
			const counterRef = doc(db, "counters", counterDocId);
			const counterSnap = await transaction.get(counterRef);
			if (!counterSnap.exists()) {
				// If counter doc doesn't exist, create it with 0 (or handle as needed)
				transaction.set(counterRef, { serial: 0 });
			} else {
				const currentSerial = counterSnap.data().serial;
				// Decrement if greater than zero to avoid negative counters.
				const newSerial = currentSerial > 0 ? currentSerial - 1 : 0;
				transaction.update(counterRef, { serial: newSerial });
			}
			// Delete the job document
			transaction.delete(jobRef);
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting job:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
