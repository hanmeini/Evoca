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

    // 1. Fetch document from Firebase
    const docRef = adminDb.collection("documents").doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const docData = docSnap.data();
    if (!docData || !docData.extractedText) {
        return NextResponse.json({ error: "Document text not found" }, { status: 404 });
    }
    
    // Check if quiz already exists to save API calls
    if (docData.quizData) {
        return NextResponse.json({ success: true, quiz: docData.quizData }, { status: 200 });
    }

    // 2. Generate Quiz via Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Based on the following document text, create a 5-question multiple choice quiz.
    The questions should test the user's understanding of key concepts in the text.
    Please write the quiz entirely in Bahasa Indonesia.
    
    Return ONLY a raw JSON array of objects. Do not include markdown formatting like \`\`\`json.
    Each object must have this exact structure:
    {
      "question": "The question text (in Bahasa Indonesia)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0 // The zero-based index of the correct option in the array
    }
    
    Document Text: 
    ${docData.extractedText.substring(0, 60000)} // limited to avoid massive token usage
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const aiText = response.text || "[]";
    const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let quizData = [];
    try {
       quizData = JSON.parse(cleanJsonString);
    } catch {
       console.error("Failed to parse Gemini Quiz JSON:", cleanJsonString);
       return NextResponse.json({ error: "Failed to generate usable quiz format." }, { status: 500 });
    }

    // 3. Save Quiz to Document in Firebase
    await docRef.update({
        quizData: quizData
    });

    return NextResponse.json({ success: true, quiz: quizData }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error generating quiz:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate quiz";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
