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

async function search() {
  const docsRef = db.collection('documents');
  const snapshot = await docsRef.get();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const title = data.metadata?.title;
    const fileName = data.fileName;
    if (title?.toLowerCase().includes("materi 2") || fileName?.toLowerCase().includes("materi 2")) {
       console.log(`FOUND: ${doc.id} | User: ${data.userId} | Name: ${fileName} | Title: ${title}`);
    }
  });
}

search().catch(console.error);
