// backend/firebaseAdmin.js
import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

// ESM compatibility untuk __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca file JSON manual

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
