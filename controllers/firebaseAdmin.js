// backend/firebaseAdmin.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM compatibility untuk __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca file JSON manual
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../serviceAccountKey.json"), "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
