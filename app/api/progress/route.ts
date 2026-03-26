import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getTodayStr } from "@/src/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { documentId, stage, userId, xpGained, gemsGained, score, total } = await req.json();

    if (!documentId || !stage || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const todayStr = getTodayStr();
    const userRef = adminDb.collection("users").doc(userId);

    // Helper to update mission progress
    const trackMission = async (type: string) => {
      const fieldMap: Record<string, string> = {
        'message': 'messagesSent',
        'upload': 'documentsUploaded',
        'quiz': 'quizzesPerfect',
        'podcast': 'podcastsFinished',
      };
      const field = fieldMap[type];
      if (field) {
        await userRef.set({
          dailyProgress: { [todayStr]: { [field]: FieldValue.increment(1) } }
        }, { merge: true });
      }
    };

    const isMission = documentId.startsWith("mission-");
    const isRoadmapReward = stage === "reward";
    
    // For missions or roadmap rewards, we skip the document check or treat it specially
    if (isMission || isRoadmapReward) {
       const userSnap = await userRef.get();
       const userData = userSnap.data();
       
       // For roadmap rewards, we use a unique stage key if it's a generic "reward" stage
       const claimKey = isRoadmapReward ? (stage === "reward" && documentId.startsWith("dummy-") ? `claim-roadmap-${documentId}` : `claim-reward-${documentId}`) : stage;

       if (userData?.completedMissions?.includes(claimKey)) {
          return NextResponse.json({ success: true, message: "Reward already claimed" });
       }

       const updateData: any = {
          gems: FieldValue.increment(gemsGained || 0),
          completedMissions: FieldValue.arrayUnion(claimKey),
          completedMissionsCount: FieldValue.increment(1),
          recentActivity: FieldValue.serverTimestamp()
       };
       
       if (isMission && xpGained) {
          updateData.totalXP = FieldValue.increment(xpGained);
       }

       await userRef.set(updateData, { merge: true });
       return NextResponse.json({ success: true, message: "Reward claimed successfully" });
    }

    const docRef = adminDb.collection("documents").doc(documentId);
    
    // Check if stage is already completed
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
       return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    const data = docSnap.data();
    const completedStages = data?.completedStages || [];

    if (!completedStages.includes(stage)) {
      // Mission tracking integration
      if (stage === "podcast") await trackMission("podcast");
      if (stage === "quiz" && score !== undefined && total !== undefined && score === total) {
        await trackMission("quiz");
      }

      // Add stage to completedStages
      await docRef.update({
        completedStages: FieldValue.arrayUnion(stage),
      });

      // Add XP & Gems to user
      await userRef.set({
        totalXP: FieldValue.increment(xpGained || 0),
        gems: FieldValue.increment(gemsGained || 0),
        recentActivity: FieldValue.serverTimestamp()
      }, { merge: true });
      
      return NextResponse.json({ success: true, message: `Completed ${stage}` });
    }

    return NextResponse.json({ success: true, message: "Already completed" });
    
  } catch (error: unknown) {
    console.error("Progress update failed:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
