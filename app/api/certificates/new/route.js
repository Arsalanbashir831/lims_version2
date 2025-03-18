import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config"; // Your Firestore instance
import { collection, addDoc } from "firebase/firestore";
import admin from "@/db/firebase-admin";

const bucket = admin.storage().bucket();

export async function POST(request) {
	try {
		// Parse the JSON payload from the request.
		const payload = await request.json();
		const { jobId, requestId, groups } = payload;

		console.log("Received payload for jobId:", jobId, "requestId:", requestId);

		// Process each group and their tableData rows for image uploads.
		for (const group of groups) {
			// Ensure group.testMethod exists
			if (!group.testMethod) {
				console.warn("Group missing testMethod:", group);
				continue;
			}
			for (let i = 0; i < group.tableData.length; i++) {
				const row = group.tableData[i];
				if (row.Images && row.Images.base64) {
					const base64Data = row.Images.base64;
					const fileName = `${jobId}_${requestId}_${group.testMethod}_${i}.jpg`;
					const file = bucket.file(`images/${fileName}`);

					console.log("Uploading file:", fileName);

					// Save the image file to storage.
					await file.save(Buffer.from(base64Data, "base64"), {
						metadata: { contentType: "image/jpeg" },
					});

					// Make the file public.
					await file.makePublic();

					// Construct a download URL.
					const downloadUrl = `https://storage.googleapis.com/${bucket.name}/images/${fileName}`;
					row.Images = downloadUrl;
					console.log("File uploaded. Download URL:", downloadUrl);
				} else {
					console.log("No image data for row:", i);
				}
			}
		}

		// Save the enriched payload (with image URLs) to Firestore.
		const docRef = await addDoc(collection(db, "certificates"), payload);
		console.log("Document saved with ID:", docRef.id);
		return NextResponse.json({ success: true, id: docRef.id });
	} catch (error) {
		console.error("Error saving submission:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
