import * as admin from 'firebase-admin';

const getFirebaseAdmin = () => {
    if (!admin.apps.length) {
        try {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY;
            
            // Critical fix for Windows and various env formats
            const formattedKey = privateKey
                ? privateKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1')
                : undefined;

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
                    privateKey: formattedKey,
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
            });
            console.log("Firebase Admin initialized successfully.");
        } catch (error) {
            console.error('Firebase admin initialization FATAL error:', error);
            // We don't throw here to avoid crashing the whole module load,
            // but subsequent db calls will fail gracefully with a specific error.
        }
    }
    return admin;
};

// Exporting as functions or proxy-ready objects to prevent top-level crash
export const adminDb = (() => {
    try {
        return getFirebaseAdmin().firestore();
    } catch (e) {
        console.error("Failed to get Firestore instance:", e);
        return null as any;
    }
})();

export const adminAuth = (() => {
    try {
        return getFirebaseAdmin().auth();
    } catch (e) {
        return null as any;
    }
})();

export const adminStorage = (() => {
    try {
        return getFirebaseAdmin().storage();
    } catch (e) {
        return null as any;
    }
})();
