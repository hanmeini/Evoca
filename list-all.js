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

async function run() {
  const userId = "9mLmkeXeAcdEryGp6qCZ2sVllG02";
  console.log("Fetching docs for:", userId);
  const docsRef = db.collection('documents').where('userId', '==', userId);
  const snapshot = await docsRef.get();
  
  console.log("Documents count:", snapshot.size);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id} | Filename: ${data.fileName} | Title: ${data.metadata?.title}`);
  });
}

run().catch(console.error);
