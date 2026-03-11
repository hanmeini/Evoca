import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 });
    }

    const docRef = adminDb.collection("documents").doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const docData = docSnap.data();
    const chatHistory = docData?.chatHistory || [];

    return NextResponse.json({ success: true, chatHistory }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error fetching chat history:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch chat history";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
