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
  const usersRef = db.collection('users');
  const userSnapshot = await usersRef.get();
  let userId = null;

  userSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.displayName === 'magic power' || data.email === 'magic power') {
      userId = doc.id;
    }
  });

  if (!userId) {
    console.log("User 'magic power' not found.");
    return;
  }

  console.log("Found user ID:", userId);

  const docsRef = db.collection('documents').where('userId', '==', userId);
  const docSnapshot = await docsRef.get();

  const toDeleteRaw = [
    "MATERI 2",
    "043 artikel bahasa indonesia by fairysenduka.pdf"
  ];

  for (const doc of docSnapshot.docs) {
    const data = doc.data();
    const fileName = data.fileName;
    const title = data.metadata?.title;

    if (toDeleteRaw.includes(fileName) || toDeleteRaw.includes(title)) {
      console.log("Deleting document:", doc.id, "-", fileName || title);
      await doc.ref.delete();
    }
  }
}

run().catch(console.error);
