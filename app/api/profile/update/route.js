import { NextResponse } from "next/server";
import { db } from "@/config/firebase-config";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export async function POST(request) {
	try {
		const updatedData = await request.json();
		const { uid } = updatedData;
		console.log("updatedData", updatedData);
		if (!uid) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 }
			);
		}
		const userRef = doc(db, "users", uid);
		await updateDoc(userRef, updatedData);

		// Retrieve the updated user document
		const updatedDoc = await getDoc(userRef);
		const updatedUser = updatedDoc.data();

		// Return the updated document in the response
		return NextResponse.json({ success: true, user: updatedUser });
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
