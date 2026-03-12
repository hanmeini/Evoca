import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { documentId, stage, userId, xpGained } = await req.json();

    if (!documentId || !stage || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docRef = adminDb.collection("documents").doc(documentId);
    
    // Check if stage is already completed
    const docSnap = await docRef.get();
    const data = docSnap.data();
    const completedStages = data?.completedStages || [];

    if (!completedStages.includes(stage)) {
      // Add stage to completedStages
      await docRef.update({
        completedStages: FieldValue.arrayUnion(stage),
      });

      // Add XP to user
      if (xpGained) {
        const userRef = adminDb.collection("users").doc(userId);
        
        // Use a transaction or simply update
        // Need to check if field exists, but arrayUnion/increment handles it
        try {
          await userRef.set({
            totalXP: FieldValue.increment(xpGained),
            recentActivity: FieldValue.serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error("XP update error", e);
        }
      }
      
      return NextResponse.json({ success: true, message: `Completed ${stage} & Gained ${xpGained} XP` });
    }

    return NextResponse.json({ success: true, message: "Already completed" });
    
  } catch (error: any) {
    console.error("Progress update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
