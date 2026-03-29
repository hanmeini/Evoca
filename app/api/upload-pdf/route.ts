import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { adminDb } from "@/src/lib/firebase-admin";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, fileBase64, fileName, fileType, fileSize, userId } = body;

    // Validation
    if (!fileUrl && !fileBase64) {
      return NextResponse.json({ error: "No file content provided" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log("Starting AI document analysis for player:", userId);
    const startTime = Date.now();

    // 1. Get Buffer/Base64 for Gemini multimodal input
    let base64Data: string;
    let fileBuffer: Buffer;

    if (fileBase64) {
      console.log("Using direct Base64 from client.");
      base64Data = fileBase64;
      fileBuffer = Buffer.from(fileBase64, "base64");
    } else {
      console.log("Fetching file from Cloudinary (Base64 not provided/large file).");
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to fetch file from Cloudinary URL");
        const arrayBuffer = await response.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        base64Data = fileBuffer.toString("base64");
      } catch (fetchError: any) {
        console.error("Error fetching file from Cloudinary:", fetchError);
        return NextResponse.json({ error: "Gagal mengambil dokumen dari penyimpanan storage." }, { status: 500 });
      }
    }
    console.log("File data prepared in:", (Date.now() - startTime) / 1000, "s");

    // 2. NEW: Extract text for LONG PDF support (if not a scan)
    let extractedRawText = "";
    const isPdf = fileType === "application/pdf" || (fileName && fileName.toLowerCase().endsWith(".pdf"));

    if (isPdf) {
      try {
        const pdf = require("pdf-parse");
        const pdfData = await pdf(fileBuffer);
        extractedRawText = pdfData.text || "";
        console.log(`Extracted ${extractedRawText.length} characters from PDF text layer.`);
      } catch (pdfError) {
        console.warn("PDF parsing failed, falling back to Gemini OCR:", pdfError);
      }
    }

    // 3. Multimodal Analysis with Gemini
    const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing in environment variables.");
      return NextResponse.json({ error: "Sistem AI belum terkonfigurasi (API Key hilang)." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Define the schema to FORCE valid JSON output
    const responseSchema = {
      description: "Structured document analysis result",
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "Judul materi (Bahasa Indonesia)" },
        summary: { type: SchemaType.STRING, description: "Ringkasan strategis dengan poin-poin" },
        keyConcepts: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "List of key concepts"
        },
        extractedText: { type: SchemaType.STRING, description: "Konten teks lengkap hasil ekstraksi untuk konteks AI" },
        confidenceScore: { type: SchemaType.NUMBER },
        estimatedReadTimeMinutes: { type: SchemaType.NUMBER }
      },
      required: ["title", "summary", "keyConcepts", "extractedText", "confidenceScore", "estimatedReadTimeMinutes"]
    } as any;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Using stable 2.0-flash for production reliability
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    // User requested detailed prompt structure for deep scanning but optimized for speed
    const prompt = `Anda adalah asisten ahli pendidikan. Tolong baca dokumen atau gambar (mungkin terdiri dari banyak halaman) yang terlampir ini.
Tujuan Anda adalah merangkum materi secara cerdas dan mengekstrak informasi krusial untuk belajar.

Berikan respon dalam format JSON dengan struktur berikut:
{
  "title": "Judul materi (Bahasa Indonesia)",
  "summary": "Ringkasan strategis (Gunakan poin-poin '-', kata kunci ditebalkan '**', dan double newline)",
  "keyConcepts": ["[Konsep 1]: Penjelasan singkat.", "[Konsep 2]: Fakta kunci."],
  "extractedText": "Ringkasan lengkap dari isi dokumen agar sistem chat memiliki konteks yang cukup (bukan wall of text, tapi padat isi).",
  "confidenceScore": 95,
  "estimatedReadTimeMinutes": 5
}
Gunakan Bahasa Indonesia sepenuhnya.`;

    // 120 second timeout for processing (Safe for local, long enough for large multi-page files)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT_AI")), 120000);
    });

    try {
      // Logic: If we have significant extracted text, we send it as text (can handle 1000s of pages).
      // Otherwise, we send as multimodal (better for scans/images).
      const finalInput = extractedRawText.length > 500
        ? [prompt + "\n\nISI DOKUMEN:\n" + extractedRawText]
        : [prompt, { inlineData: { data: base64Data, mimeType: fileType || "application/pdf" } }];

      const result = await Promise.race([
        model.generateContent(finalInput),
        timeoutPromise
      ]) as any;

      console.log("Gemini analysis done in:", (Date.now() - startTime) / 1000, "s");

      let responseText: string;
      try {
        responseText = await result.response.text();
      } catch (geminiError: any) {
        console.error("Gemini Response Error:", geminiError);
        const blockerMsg = geminiError.message || "";
        if (blockerMsg.includes("blocked")) {
          throw new Error("Konten diblokir oleh filter keamanan AI. Coba ubah isi dokumen Anda.");
        }
        throw new Error("Gagal mengambil teks dari AI: " + (geminiError.message || "Unknown error"));
      }

      const aiText = responseText || "{}";

      // Robust JSON detection
      let cleanJsonString = aiText;
      const firstCurly = aiText.indexOf('{');
      const lastCurly = aiText.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1) {
        cleanJsonString = aiText.substring(firstCurly, lastCurly + 1);
      }

      let processedAiResult;
      try {
        processedAiResult = JSON.parse(cleanJsonString);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON output. Raw Text:", aiText);
        throw new Error("Gagal memproses hasil analisis AI. Harap coba lagi atau gunakan file yang lebih jelas.");
      }

      const { extractedText, ...metadata } = processedAiResult;

      if (!extractedText || extractedText.trim() === "" || extractedText === "Teks gagal diekstrak.") {
        throw new Error("AI gagal mengekstrak teks dari dokumen. Pastikan file terbaca dengan jelas.");
      }

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

      if (!adminDb) {
        throw new Error("Firestore Admin SDK is not initialized.");
      }

      await adminDb.collection("documents").doc(docId).set(newDoc);

      return NextResponse.json({ success: true, document: newDoc }, { status: 200 });

    } catch (apiError: any) {
      if (apiError.message === "TIMEOUT_AI") {
        return NextResponse.json({ error: "Analisis AI memakan waktu lebih dari 120 detik. Silakan coba file yang lebih ringan." }, { status: 504 });
      }
      throw apiError;
    }

  } catch (error: any) {
    console.error("CRITICAL ERROR in upload-pdf route:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan sistem saat memproses dokumen.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
