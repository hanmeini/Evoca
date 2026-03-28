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
  const docsRef = db.collection('documents').where('userId', '==', userId);
  const docSnapshot = await docsRef.get();
  
  if (docSnapshot.empty) {
     console.log("No documents for user.");
     return;
  }

  for (const doc of docSnapshot.docs) {
    const data = doc.data();
    const title = data.metadata?.title || "";
    const fileName = data.fileName || "";
    
    if (title.toLowerCase().includes("materi 2") || fileName.toLowerCase().includes("materi 2")) {
       console.log("Deleting document:", doc.id, "-", title || fileName);
       await doc.ref.delete();
    }
  }
}

run().catch(console.error);
