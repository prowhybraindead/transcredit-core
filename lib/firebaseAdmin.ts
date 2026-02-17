import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let db: Firestore | undefined;

function getAdminApp(): App {
    if (!app) {
        if (getApps().length > 0) {
            app = getApps()[0];
        } else {
            const serviceAccount = JSON.parse(
                process.env.FIREBASE_SERVICE_ACCOUNT || "{}"
            );
            app = initializeApp({
                credential: cert(serviceAccount),
            });
        }
    }
    return app;
}

export function getAdminDb(): Firestore {
    if (!db) {
        db = getFirestore(getAdminApp());
    }
    return db;
}
