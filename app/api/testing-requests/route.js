import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
	try {
		// Fetch all testing requests.
		const testingSnapshot = await getDocs(collection(db, "testingRequests"));
		let testingRequests = testingSnapshot.docs.map((docSnap) => ({
			id: docSnap.id,
			...docSnap.data(),
		}));

		// Fetch all jobs.
		const jobsSnapshot = await getDocs(collection(db, "jobs"));
		const jobsMap = {};
		jobsSnapshot.docs.forEach((docSnap) => {
			const jobData = docSnap.data();
			// Assuming that each job document contains a 'sample' object with a 'jobId' field.
			if (jobData.sample && jobData.sample.jobId) {
				jobsMap[jobData.sample.jobId] = jobData;
			}
		});

		// Enrich each testing request with clientName and projectName from the jobs.
		testingRequests = testingRequests.map((req) => {
			// req.jobId is expected to be the same as jobData.sample.jobId
			const job = jobsMap[req.jobId];
			return {
				...req,
				clientName: job?.sample?.clientName || "",
				projectName: job?.sample?.projectName || "",
			};
		});

		return NextResponse.json({ success: true, testingRequests });
	} catch (error) {
		console.error("Error fetching testing requests:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
