import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 });
    }

    const docRef = adminDb.collection("documents").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const docData = docSnap.data();
    
    return NextResponse.json({ success: true, data: docData }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error fetching document details:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch document details";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
