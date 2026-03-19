import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    // Fetch users sorted by totalXP descending
    const usersSnapshot = await adminDb.collection("users")
      .orderBy("totalXP", "desc")
      .limit(20)
      .get();

    const leaderboard = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.displayName || "Sobat Evoca",
        score: data.totalXP || 0,
        photoURL: data.photoURL || null,
        avatar: (data.displayName || "U").charAt(0).toUpperCase()
      };
    });

    return NextResponse.json({ 
      success: true, 
      leaderboard 
    });

  } catch (error: unknown) {
    console.error("Leaderboard fetch error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
