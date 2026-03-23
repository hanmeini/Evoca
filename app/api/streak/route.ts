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
    const dailyProgress = userData?.dailyProgress || {};

    const hasActivityOn = (dateStr: string) => {
      const d = dailyProgress[dateStr] || {};
      return (d.documentsUploaded || 0) >= 1 || 
             (d.messagesSent || 0) >= 5 || 
             (d.quizzesPerfect || 0) >= 1 || 
             (d.podcastsFinished || 0) >= 1;
    };

    if (lastUpdateStr === todayStr) {
      return NextResponse.json({ success: true, streak: currentStreak, message: "Checked today" });
    }

    const yesterdayStr = getYesterdayStr();
    let newStreak = currentStreak;
    let type = "maintain";

    if (lastUpdateStr === yesterdayStr) {
      // If they had activity yesterday, and this is the first check today, increment?
      // Actually, many apps only increment AFTER today's goal is met.
      // But let's increment on first visit IF yesterday was completed.
      if (hasActivityOn(yesterdayStr)) {
        newStreak = currentStreak + 1;
        type = "increment";
      } else {
        // Did not finish mission yesterday -> Streak reset
        newStreak = 1; 
        type = "reset_no_activity";
      }
    } else {
      // Streak broken (missed yesterday visit entirely)
      newStreak = 1;
      type = "reset_missed_day";
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
