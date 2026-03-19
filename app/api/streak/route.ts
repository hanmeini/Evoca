import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getTodayStr, getYesterdayStr } from "@/src/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    const todayStr = getTodayStr();

    if (!userDoc.exists) {
      // First time user initialization
      await userRef.set({
        streak: 1,
        lastStreakUpdate: todayStr,
        gems: 500,
        totalXP: 0,
        completedMissions: [],
        createdAt: FieldValue.serverTimestamp(),
        recentActivity: FieldValue.serverTimestamp()
      }, { merge: true });
      return NextResponse.json({ success: true, streak: 1 });
    }

    const userData = userDoc.data();
    const lastUpdateStr = userData?.lastStreakUpdate || "";
    const currentStreak = userData?.streak || 0;

    // 1. Same day visit
    if (lastUpdateStr === todayStr) {
      return NextResponse.json({ success: true, streak: currentStreak, message: "Already updated today" });
    }

    const yesterdayStr = getYesterdayStr();
    let newStreak = 1;
    let type = "reset";

    if (lastUpdateStr === yesterdayStr) {
      newStreak = currentStreak + 1;
      type = "increment";
    } else {
      // Streak broken (bolong) or first update ever
      newStreak = 1;
      type = "reset";
    }

    // Update the streak and timestamp
    await userRef.update({
      streak: newStreak,
      lastStreakUpdate: todayStr,
      recentActivity: FieldValue.serverTimestamp()
    });

    console.log(`[Streak] User ${userId}: ${lastUpdateStr} -> ${todayStr} [${type} to ${newStreak}]`);

    return NextResponse.json({ success: true, streak: newStreak, status: type });

  } catch (error: unknown) {
    console.error("Streak calculation error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
