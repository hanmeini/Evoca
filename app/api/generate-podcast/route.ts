import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 });
    }
    
    const docRef = adminDb.collection("documents").doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const docData = docSnap.data();
    if (!docData || !docData.extractedText) {
        return NextResponse.json({ error: "Document text not found" }, { status: 404 });
    }

    // Return existing script if already generated
    if (docData.podcastScript) {
        return NextResponse.json({ success: true, script: docData.podcastScript }, { status: 200 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are a scriptwriter for an educational podcast. 
    Based on the following document text, create a short conversational podcast script between two hosts: Host A and Host B.
    Host A is the curious learner asking questions, and Host B is the expert explaining the concepts found in the text.
    Please write the podcast script entirely in Bahasa Indonesia.
    
    Return ONLY a raw JSON array of objects representing the dialogue lines. 
    Do not include markdown formatting like \`\`\`json.
    Each object must have this exact structure:
    {
      "speaker": "A" or "B",
      "text": "The spoken dialogue line (in Bahasa Indonesia)"
    }
    
    Keep the entire script brief, around 8-12 lines total, summarizing the main points of the document.
    
    Document Text: 
    ${docData.extractedText.substring(0, 60000)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const aiText = response.text || "[]";
    const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let scriptData = [];
    try {
       scriptData = JSON.parse(cleanJsonString);
    } catch {
       console.error("Failed to parse Gemini script JSON:", cleanJsonString);
       return NextResponse.json({ error: "Failed to generate valid script format." }, { status: 500 });
    }

    await docRef.update({
        podcastScript: scriptData
    });

    return NextResponse.json({ success: true, script: scriptData }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error generating podcast script:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate podcast script";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
