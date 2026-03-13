import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const q = adminDb.collection("documents")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(20);

    const querySnapshot = await q.get();
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, history }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error fetching study history list:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch history list";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
