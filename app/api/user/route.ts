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
      // Return default data if user doesn't exist in DB yet
      return NextResponse.json({ 
        success: true, 
        data: { totalXP: 0, streak: 1, gems: 500 } 
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: userSnap.data() }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
