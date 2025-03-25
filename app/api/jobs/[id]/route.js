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
			// Extract parts from jobId, e.g., "MTL-2025-0001" yields ["MTL", "2025", "0001"]
			const parts = jobId.split("-");
			if (parts.length < 3) {
				throw new Error("Job ID format is incorrect");
			}
			const year = parts[1];
			// Parse the serial part as a number
			const deletedSerial = parseInt(parts[2], 10);
			const counterDocId = `jobCounter-${year}`;
			const counterRef = doc(db, "counters", counterDocId);
			const counterSnap = await transaction.get(counterRef);

			if (!counterSnap.exists()) {
				// If counter doc doesn't exist, create it.
				// In this case, the deleted job was the only one.
				transaction.set(counterRef, { serial: 0, freeSerials: [] });
			} else {
				const data = counterSnap.data();
				let currentSerial = data.serial;
				// Ensure we have a free list array
				let freeSerials = Array.isArray(data.freeSerials)
					? data.freeSerials
					: [];

				if (deletedSerial === currentSerial) {
					// If the deleted job is the highest allocated, decrement the counter.
					currentSerial = currentSerial - 1;
					// Clean up: if the new highest number is in the free list, remove it and decrement further.
					while (freeSerials.includes(currentSerial)) {
						freeSerials = freeSerials.filter((num) => num !== currentSerial);
						currentSerial = currentSerial - 1;
					}
					transaction.update(counterRef, {
						serial: currentSerial,
						freeSerials,
					});
				} else {
					// For a non-highest job, add the deleted serial to the free list (if not already present).
					if (!freeSerials.includes(deletedSerial)) {
						freeSerials.push(deletedSerial);
						// Optional: sort freeSerials to always have the lowest available first.
						freeSerials.sort((a, b) => a - b);
					}
					transaction.update(counterRef, { freeSerials });
				}
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
