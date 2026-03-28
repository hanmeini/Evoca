const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function listUsers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | Email: ${data.email} | Name: ${data.displayName}`);
  });
}

listUsers().catch(console.error);
