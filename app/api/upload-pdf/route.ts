import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "@/src/lib/cloudinary";
import { adminDb } from "@/src/lib/firebase-admin";
import { GoogleGenAI } from '@google/genai';

// Use dynamic edge handling to support large file uploads if needed, 
export const maxDuration = 60; // Set max duration for Vercel/NextJS to 60s

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
    }

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload to Cloudinary (as raw file so we can store it)
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "evoca-pdf",
          format: "pdf",
          public_id: `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const fileUrl = (cloudinaryResponse as { secure_url: string }).secure_url;

    // 3. Extract text from PDF using pdf-parse
    // Polyfill DOMMatrix for pdfjs-dist
    if (typeof globalThis !== "undefined" && !("DOMMatrix" in globalThis)) {
      (globalThis as unknown as { DOMMatrix: unknown }).DOMMatrix = class DOMMatrix { };
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    const extractedText = pdfData.text;
    await parser.destroy();

    // 4. Summarize and Extract key topics via Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Analyze the following document text and provide a concise JSON object. Please respond entirely in Bahasa Indonesia. Do not include markdown code block syntax. The JSON must exactly match this structure:
    {
      "title": "A short, descriptive title (in Bahasa Indonesia)",
      "summary": "A 2-3 sentence summary of the entire document (in Bahasa Indonesia)",
      "keyConcepts": ["Concept 1 (in Bahasa Indonesia)", "Concept 2", "Concept 3"],
      "confidenceScore": 95,
      "estimatedReadTimeMinutes": 10
    }
    
    Document Text: 
    ${extractedText.substring(0, 60000)} // Analyze up to first 60k chars for summary to save tokens
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text || "{}";
    // clean up potential markdown codeblocks that Gemini sometimes returns
    const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    let metadata = {};

    try {
      metadata = JSON.parse(cleanJsonString);
    } catch {
      console.error("Failed to parse Gemini JSON:", cleanJsonString);
      metadata = { title: file.name, summary: "Could not generate summary." };
    }

    // 5. Store in Firebase Firestore
    const docId = uuidv4();
    const newDoc = {
      id: docId,
      userId: userId,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: fileUrl,
      extractedText: extractedText, // Storing full text for later Chat interactions
      metadata: metadata,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("documents").doc(docId).set(newDoc);

    // Return the created doc id
    return NextResponse.json({ success: true, document: newDoc }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error processing PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process PDF";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}