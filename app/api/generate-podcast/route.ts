import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

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

    const prompt = `You are a professional scriptwriter for an educational podcast.
    Based on the following document text, create an engaging and lively conversational podcast script between two hosts: Host A and Host B.
    
    PERSONA:
    - Host A: Curiously inquiring, energetic, and relatable. Asks the questions most students would have.
    - Host B: The expert, warm, clear-voiced, and very encouraging. Explains concepts using analogies and easy-to-understand Indonesian.
    
    TONE:
    - Conversational, smart, but approachable.
    - Use natural-sounding Bahasa Indonesia (e.g., "Wah, menarik banget!", "Jadi gini...", "Nah, poin pentingnya...").
    
    FORMAT:
    - Return ONLY a raw JSON array of objects representing the dialogue lines. 
    - Each object must have this exact structure: { "speaker": "A" | "B", "text": "The spoken dialogue line" }
    - Length: 12-18 lines total.
    
    Document Text: 
    ${docData.extractedText.substring(0, 60000)}
    `;

    // 2. Generate Podcast Script via Gemini API
    const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Define the schema for the podcast script
    const schema = {
      description: "Podcast dialogue script with two speakers",
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          speaker: {
            type: SchemaType.STRING,
            enum: ["A", "B"],
            description: "Speaker label (A or B)"
          },
          text: {
            type: SchemaType.STRING,
            description: "Dialogue text spoken by the host"
          }
        },
        required: ["speaker", "text"]
      }
    } as any;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const response = await model.generateContent(prompt);

    const aiText = response.response.text() || "[]";
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
