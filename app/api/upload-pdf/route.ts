import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
// Removed unused cloudinary import for client-side upload approach
import { adminDb } from "@/src/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use dynamic edge handling to support large file uploads if needed, 
export const maxDuration = 60; // Set max duration for Vercel/NextJS to 60s

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, fileName, fileType, fileSize, userId } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
    }

    console.log("Starting AI analysis for user:", userId);
    const startTime = Date.now();

    // 1. Fetch file from Cloudinary to get Buffer
    let buffer: Buffer;
    try {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (fetchError: any) {
      console.error("Error fetching file from Cloudinary:", fetchError);
      return NextResponse.json({ error: "Failed to fetch file from storage" }, { status: 500 });
    }
    console.log("File buffer retrieved:", (Date.now() - startTime) / 1000, "s");

    // Gemini Promise (with internal timeout)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const base64Data = buffer.toString("base64");
    
    const prompt = `Anda adalah asisten ahli pendidikan. Tolong baca dokumen atau gambar yang terlampir ini dengan sangat teliti.
Tujuan Anda adalah mengekstrak semua informasi penting untuk membantu siswa belajar dan bersiap menghadapi kuis/ujian.
Fokuslah pada fakta, definisi, rumus, dan konsep kunci yang kemungkinan besar akan keluar dalam ujian.

Tolong berikan respon dalam format JSON murni (tanpa markdown blok koda) dengan struktur berikut:
{
  "title": "Judul materi yang menarik (Bahasa Indonesia)",
  "summary": "Ringkasan strategis berorientasi kuis. (MANDATORY: Gunakan format point-by-point '-', tebalkan kata kunci, dan gunakan Bahasa Indonesia).",
  "keyConcepts": ["Konsep 1", "Konsep 2", "Konsep 3"],
  "extractedText": "Seluruh teks yang berhasil diekstrak secara lengkap",
  "confidenceScore": 95,
  "estimatedReadTimeMinutes": 10
}`;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT_AI")), 9000);
    });

    try {
      const aiResponse = await (Promise.race([
        model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: fileType || "application/pdf"
            }
          }
        ]),
        timeoutPromise
      ]) as Promise<any>);

      console.log("Gemini analysis completed:", (Date.now() - startTime) / 1000, "s");

      const aiText = aiResponse.response.text() || "{}";
      const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

      let aiResult;
      try {
        aiResult = JSON.parse(cleanJsonString);
      } catch {
        console.error("Failed to parse Gemini JSON:", cleanJsonString);
        aiResult = {
          title: fileName || "Untitled Document",
          summary: "Berhasil diunggah namun gagal mengekstrak metadata otomatis.",
          extractedText: "Teks gagal diekstrak.",
          keyConcepts: []
        };
      }

      const { extractedText, ...metadata } = aiResult;

      // 4. Store in Firebase Firestore
      const docId = uuidv4();
      const newDoc = {
        id: docId,
        userId: userId,
        fileName: fileName || "Untitled Document",
        fileSize: fileSize || 0,
        fileUrl: fileUrl,
        fileType: fileType || "application/pdf",
        extractedText: extractedText || "",
        metadata: metadata,
        createdAt: new Date().toISOString(),
        completedStages: []
      };

      await adminDb.collection("documents").doc(docId).set(newDoc);

      return NextResponse.json({ success: true, document: newDoc }, { status: 200 });

    } catch (parallelError: any) {
      console.error("Parallel Error:", parallelError);
      if (parallelError.message === "TIMEOUT_AI") {
        return NextResponse.json({ error: "Analisis AI terlalu lama (Limit Vercel 10 detik). Coba gunakan file yang lebih kecil." }, { status: 504 });
      }
      return NextResponse.json({ error: `Upload Failure: ${parallelError.message}` }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("General API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}