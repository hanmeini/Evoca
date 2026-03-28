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

async function findUser() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('displayName', '==', 'magic power').get();
  
  if (snapshot.empty) {
     console.log("No user found by displayName.");
  } else {
     snapshot.forEach(doc => {
       console.log(`ID: ${doc.id} | Email: ${doc.data().email} | Name: ${doc.data().displayName}`);
     });
  }

  const snapshot2 = await usersRef.where('email', '==', 'magic power').get();
  if (!snapshot2.empty) {
     snapshot2.forEach(doc => {
       console.log(`ID: ${doc.id} | Email: ${doc.data().email} | Name: ${doc.data().displayName}`);
     });
  }
}

findUser().catch(console.error);
