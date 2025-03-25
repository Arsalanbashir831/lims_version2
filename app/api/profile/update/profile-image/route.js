// app/api/profile/update-image/route.js
import { NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "@/config/firebase-config";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(request) {
	try {
		// Parse the form data from the request.
		const formData = await request.formData();
		const file = formData.get("file");
		const uid = formData.get("uid");

		if (!file || !uid) {
			return NextResponse.json(
				{ error: "Missing file or uid" },
				{ status: 400 }
			);
		}

		// Create a unique file name using the uid and current timestamp.
		const fileExtension = file.name.split(".").pop();
		const fileName = `profileImages/${uid}.${fileExtension}`;
		const storageRef = ref(storage, fileName);

		// Read the file as an ArrayBuffer and upload it.
		const buffer = await file.arrayBuffer();
		await uploadBytes(storageRef, Buffer.from(buffer));

		// Get the download URL of the uploaded image.
		const downloadURL = await getDownloadURL(storageRef);

		// Update the user's Firestore document with the new profile picture URL.
		const userRef = doc(db, "users", uid);
		await updateDoc(userRef, { profilePicture: downloadURL });

		return NextResponse.json({ success: true, profilePicture: downloadURL });
	} catch (error) {
		console.error("Error updating profile image:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
