import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getTodayStr } from "@/src/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { documentId, stage, userId, xpGained, gemsGained, foodGained, playGained, score, total } = await req.json();

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
          [`dailyProgress.${todayStr}.${field}`]: FieldValue.increment(1)
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
          totalGemsEarned: FieldValue.increment(gemsGained || 0),
          petFood: FieldValue.increment(foodGained || 0),
          petPlay: FieldValue.increment(playGained || 0),
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

    // Document based progress
    const docRef = adminDb.collection("documents").doc(documentId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
       return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const data = docSnap.data();
    const completedStages = data?.completedStages || [];
    const isNewStage = !completedStages.includes(stage);

    // Track Mission Progress (Daily Missions)
    // We allow mission tracking (like perfect quiz) even if the document stage was already finished before
    if (stage === "podcast") await trackMission("podcast");
    if (stage === "quiz" && score !== undefined && total !== undefined && score === total) {
      await trackMission("quiz");
    }

    // Update document completion and scores
    if (isNewStage || (stage === "quiz" && score !== undefined)) {
      const docUpdate: any = {};
      if (isNewStage) {
        docUpdate.completedStages = FieldValue.arrayUnion(stage);
      }
      if (stage === "quiz" && score !== undefined) {
        // Only update if it's the first time or if the score improved
        if (score > (data?.quizScore || 0)) {
          docUpdate.quizScore = score;
        }
      }
      
      if (Object.keys(docUpdate).length > 0) {
        await docRef.update(docUpdate);
      }
    }

    // Award XP/Gems only for the FIRST completion of a stage per document
    if (isNewStage) {
      await userRef.set({
        totalXP: FieldValue.increment(xpGained || 0),
        gems: FieldValue.increment(gemsGained || 0),
        totalGemsEarned: FieldValue.increment(gemsGained || 0),
        petFood: FieldValue.increment(foodGained || 0),
        petPlay: FieldValue.increment(playGained || 0),
        recentActivity: FieldValue.serverTimestamp()
      }, { merge: true });
      
      return NextResponse.json({ success: true, message: `Completed ${stage}` });
    }

    return NextResponse.json({ success: true, message: "Progress saved (Repeated completion, no new XP/Gems)" });
    
  } catch (error: unknown) {
    console.error("Progress update failed:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
