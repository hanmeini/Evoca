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

async function kill() {
  const docsRef = db.collection('documents');
  const snapshot = await docsRef.get();
  
  snapshot.forEach(async doc => {
    const data = doc.data();
    const title = data.metadata?.title || "";
    const fileName = data.fileName || "";
    
    const combined = (title + " " + fileName).toLowerCase();
    
    if (combined.includes("materi 2")) {
       console.log(`KILLING ${doc.id} | User: ${data.userId} | Name: ${fileName} | Title: ${title}`);
       await doc.ref.delete();
    }
    
    if (combined.includes("043 artikel")) {
       console.log(`KILLING ${doc.id} | User: ${data.userId} | Name: ${fileName} | Title: ${title}`);
       await doc.ref.delete();
    }
  });
}

kill().catch(console.error);
