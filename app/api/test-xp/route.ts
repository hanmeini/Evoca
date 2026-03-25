import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const displayName = req.nextUrl.searchParams.get("displayName");
    const photoURL = req.nextUrl.searchParams.get("photoURL");
    const amountStr = req.nextUrl.searchParams.get("amount") || "500";
    const amount = parseInt(amountStr);

    console.log(`[TEST-XP] Request for userId: ${userId}, name: ${displayName}, amount: ${amount}`);

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log(`[TEST-XP] User NOT FOUND. Auto-creating document: ${userId}`);
      const initialData = {
        displayName: displayName || "Sobat Evoca",
        photoURL: photoURL || null,
        totalXP: amount,
        gems: 500,
        streak: 1,
        completedMissions: []
      };
      await userRef.set(initialData);

      return NextResponse.json({ 
        success: true, 
        message: `Akun baru di-sync! Berhasil ditambahkan ${amount} XP.`,
        newXP: amount
      });
    }

    const userData = userDoc.data();
    const currentXP = userData?.totalXP || 0;
    const newXP = currentXP + amount;

    console.log(`[TEST-XP] User: ${userData?.displayName}, Current XP: ${currentXP}, New XP will be: ${newXP}`);

    const updates: any = { totalXP: newXP };
    if (displayName) updates.displayName = displayName;
    if (photoURL) updates.photoURL = photoURL;

    await userRef.update(updates);

    console.log(`[TEST-XP] Update SUCCESS for ${userId}`);

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil! Ditambahkan ${amount} XP ke ${userData?.displayName}. Total baru: ${newXP}`,
      newXP: newXP
    });

  } catch (error: unknown) {
    console.error("Test XP error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
