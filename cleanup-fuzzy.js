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
    const title = (data.metadata?.title || "").toLowerCase();
    const fileName = (data.fileName || "").toLowerCase();
    
    console.log(`Checking: ${doc.id} | Title: ${title} | FileName: ${fileName}`);

    // Fuzzy check for "materi 2" or something similar
    if (title.includes("materi") || fileName.includes("materi")) {
       console.log("MATCH MATERIAL: Deleting document:", doc.id);
       await doc.ref.delete();
    }
  }
}

run().catch(console.error);
