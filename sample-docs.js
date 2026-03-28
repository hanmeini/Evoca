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

async function sample() {
  const docsRef = db.collection('documents').limit(100);
  const snapshot = await docsRef.get();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | User: ${data.userId} | Name: ${data.fileName} | Title: ${data.metadata?.title}`);
  });
}

sample().catch(console.error);
