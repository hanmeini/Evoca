import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ 
        success: true, 
        stats: { totalXP: 0, rank: "-" } 
      });
    }

    const userData = userDoc.data();
    
    // Simple rank logic (mocking for now, but could be dynamic)
    // In a real app, you'd query the 'users' collection for count of people with more XP
    const usersCountWithMoreXP = await adminDb.collection("users")
      .where("totalXP", ">", userData?.totalXP || 0)
      .count()
      .get();
    
    const rank = usersCountWithMoreXP.data().count + 1;

    return NextResponse.json({ 
      success: true, 
      stats: { 
        totalXP: userData?.totalXP || 0,
        rank: rank
      } 
    });

  } catch (error: any) {
    console.error("User stats fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
