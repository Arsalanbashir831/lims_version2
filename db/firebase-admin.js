import * as admin from "firebase-admin";

if (!process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY) {
	throw new Error(
		"FIREBASE_SERVICE_ACCOUNT_KEY is not defined in environment variables."
	);
}

const serviceAccount = JSON.parse(
	process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
);

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		databaseURL: "https://lawlinks-e33fa-default-rtdb.firebaseio.com",
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	});
}

export default admin;
