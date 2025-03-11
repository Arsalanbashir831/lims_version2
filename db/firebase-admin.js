import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://lawlinks-e33fa-default-rtdb.firebaseio.com",
  });
}

export default admin;
