import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { getTodayStr } from "@/src/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId, type } = await req.json();

    if (!userId || !type) {
      return NextResponse.json({ error: "Missing userId or type" }, { status: 400 });
    }

    const todayStr = getTodayStr();
    const userRef = adminDb.collection("users").doc(userId);

    const fieldMap: Record<string, string> = {
      'message': 'messagesSent',
      'upload': 'documentsUploaded',
      'quiz': 'quizzesPerfect',
      'podcast': 'podcastsFinished',
    };

    const field = fieldMap[type];
    if (!field) {
      return NextResponse.json({ error: "Invalid mission type" }, { status: 400 });
    }

    // Use set with merge true to ensure dailyProgress and todayStr maps exist
    await userRef.set({
      dailyProgress: {
        [todayStr]: {
          [field]: FieldValue.increment(1)
        }
      },
      recentActivity: FieldValue.serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error("Mission track failed:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
