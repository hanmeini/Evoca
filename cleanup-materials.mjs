import { adminDb } from "./src/lib/firebase-admin.js";

async function cleanup() {
  // 1. Find user "magic power"
  const usersRef = adminDb.collection("users");
  const usersSnapshot = await usersRef.get();
  let userId = null;
  
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.displayName === "magic power" || data.email === "magic power") {
      userId = doc.id;
    }
  });
  
  if (!userId) {
     console.log("User 'magic power' not found.");
     return;
  }
  
  console.log("User ID for 'magic power':", userId);
  
  // 2. Find documents
  const docsRef = adminDb.collection("documents").where("userId", "==", userId);
  const docsSnapshot = await docsRef.get();
  
  const toDelete = [
    "MATERI 2",
    "043 artikel bahasa indonesia by fairysenduka.pdf"
  ];
  
  for (const doc of docsSnapshot.docs) {
    const data = doc.data();
    const title = data.metadata?.title;
    const fileName = data.fileName;
    
    if (toDelete.includes(title) || toDelete.includes(fileName)) {
      console.log("Deleting document:", doc.id, "-", title || fileName);
      await doc.ref.delete();
    }
  }
}

cleanup();
