import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
	try {
		// Fetch all testing requests.
		const testingSnapshot = await getDocs(collection(db, "testingRequests"));
		const testingRequests = testingSnapshot.docs.map((docSnap) => ({
			id: docSnap.id,
			...docSnap.data(),
		}));

		// Fetch all jobs.
		const jobsSnapshot = await getDocs(collection(db, "jobs"));
		const jobsMap = {};
		jobsSnapshot.docs.forEach((docSnap) => {
			const jobData = docSnap.data();
			// Assuming each job document contains a 'sample' object with a 'jobId' field.
			if (jobData.sample && jobData.sample.jobId) {
				jobsMap[jobData.sample.jobId] = jobData;
			}
		});

		// Enrich each testing request with the necessary fields.
		// Add sampleDate from the job's createdAt and enrich each row with its corresponding MTC No,
		// dateOfTesting (from plannedTestDate), and sampleDescription (from the matching sample detail).
		const enrichedTestingRequests = testingRequests.map((req) => {
			const { createdAt, jobId, requestId, rows } = req;
			const job = jobsMap[jobId] || {};
			const clientName = job.sample?.clientName || "";
			const projectName = job.sample?.projectName || "";
			const sampleDate = job.createdAt || "";

			// Enrich each row.
			const sampleDetails = job.sampleDetails || [];
			const enrichedRows = rows.map((row) => {
				const matchingSample = sampleDetails.find((sampleDetail) => {
					return (
						sampleDetail.testMethods &&
						sampleDetail.testMethods.some(
							(tm) => tm.test_name === row.testMethod
						)
					);
				});
				return {
					...row,
					mtcNo: matchingSample ? matchingSample.mtcNo : "",
					// dateOfTesting: row.plannedTestDate || "",
					// sampleDescription: matchingSample ? matchingSample.description : "",
				};
			});

			return {
				createdAt,
				jobId,
				requestId,
				rows: enrichedRows,
				clientName,
				projectName,
				sampleDate,
			};
		});

		return NextResponse.json({
			success: true,
			testingRequests: enrichedTestingRequests,
		});
	} catch (error) {
		console.error("Error fetching testing requests:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
