import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";

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
		await deleteDoc(jobRef);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting job:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
