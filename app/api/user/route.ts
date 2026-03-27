import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          totalXP: 0, 
          streak: 1, 
          gems: 500,
          ownedMascots: ["tiger"],
          petLevels: { "tiger": 1 },
          selectedMascot: "tiger"
        } 
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: userSnap.data() }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, updates } = await req.json();

    if (!userId || !updates) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);
    await userRef.set(updates, { merge: true });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating user data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
