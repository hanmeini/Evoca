import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "@/src/lib/cloudinary";
import { adminDb } from "@/src/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    console.log("Starting PDF processing for user:", userId);
    const startTime = Date.now();

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Buffer prepared:", (Date.now() - startTime) / 1000, "s");

    // 2. Upload to Cloudinary
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // Automatically handle PDF or Images
          folder: "evoca-uploads",
          public_id: `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    console.log("Cloudinary upload done:", (Date.now() - startTime) / 1000, "s");

    const fileUrl = (cloudinaryResponse as { secure_url: string }).secure_url;

    // 3. Multimodal Analysis with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    console.log("Gemini model initialized. Starting inference...");

    // Convert to base64 for Gemini multimodal input
    const base64Data = buffer.toString("base64");

    const prompt = `Anda adalah asisten ahli pendidikan. Tolong baca dokumen atau gambar yang terlampir ini dengan sangat teliti.
Tujuan Anda adalah mengekstrak semua informasi penting untuk membantu siswa belajar dan bersiap menghadapi kuis/ujian.
Fokuslah pada fakta, definisi, rumus, dan konsep kunci yang kemungkinan besar akan keluar dalam ujian.

Tolong berikan respon dalam format JSON murni (tanpa markdown blok koda) dengan struktur berikut:
{
  "title": "Judul materi yang menarik (Bahasa Indonesia)",
  "summary": "Ringkasan strategis berorientasi kuis.

MANDATORY RULES:
1. JANGAN PERNAH memberikan ringkasan dalam bentuk paragraf panjang (NO WALL OF TEXT).
2. WAJIB menggunakan format point-by-point (-) untuk setiap penjelasan.
3. WAJIB menggunakan format **tebal** pada kata kunci atau istilah teknis di setiap baris.
4. Pastikan ada baris kosong (double newline) di antara setiap section.

WAJIB menggunakan struktur berikut:

KONTEKS:
- **Konteks:** Penjelasan konteks materi secara singkat (1-2 poin saja).

INTI MATERI:
- **[Keyword]:** Penjelasan yang singkat, padat, dan mudah di-scan.
- **[Keyword]:** Penjelasan penting lainnya berorientasi kuis.
- **[Keyword]:** Rumus atau data teknis jika ada.

KESIMPULAN:
- **Poin Utama:** 1-2 poin kesimpulan strategis.

(Gunakan Bahasa Indonesia sepenuhnya).",
  "keyConcepts": ["[Konsep 1]: Penjelasan spesifik berorientasi kuis (1 kalimat).", "[Konsep 2]: Fakta atau rumus teknis yang krusial (1 kalimat).", "[Konsep 3]: Definisi mendalam yang sering diujikan (1 kalimat)."],
  "extractedText": "Seluruh teks yang berhasil Anda baca/ekstrak dari dokumen ini secara lengkap",
  "confidenceScore": 95,
  "estimatedReadTimeMinutes": 10
}

Pastikan "extractedText" berisi semua teks yang ada di dalam gambar/dokumen agar sistem chat bisa bekerja nantinya.`;

    let response;
    try {
      response = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
          }
        }
      ]);
    } catch (apiError: any) {
      console.error("[", new Date().toLocaleTimeString(), "] Stage: Gemini Analysis FAILED", apiError);
      if (apiError.message?.includes("429") || apiError.status === 429) {
        throw new Error("Kuota harian AI habis (Limit: 20x/hari). Silakan coba lagi besok atau gunakan akun lain.");
      }
      throw apiError;
    }
    console.log("Gemini analysis done:", (Date.now() - startTime) / 1000, "s");

    const aiText = response.response.text() || "{}";
    const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

    let aiResult;
    try {
      aiResult = JSON.parse(cleanJsonString);
      if (!aiResult.extractedText || aiResult.extractedText.trim() === "" || aiResult.extractedText === "Teks gagal diekstrak.") {
        throw new Error("Tidak ada teks yang dapat diekstrak.");
      }
    } catch {
      console.error("Failed to parse Gemini JSON or extract text:", cleanJsonString);
      throw new Error("Gagal mengekstrak teks dari dokumen. Pastikan gambar/PDF terbaca dengan jelas atau coba lagi.");
    }

    const { extractedText, ...metadata } = aiResult;

    // 4. Store in Firebase Firestore
    const docId = uuidv4();
    const newDoc = {
      id: docId,
      userId: userId,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: fileUrl,
      fileType: file.type,
      extractedText: extractedText || "",
      metadata: metadata,
      createdAt: new Date().toISOString(),
      completedStages: [] // Start fresh, user needs to complete stages manually
    };

    await adminDb.collection("documents").doc(docId).set(newDoc);

    // Return the created doc id
    return NextResponse.json({ success: true, document: newDoc }, { status: 200 });

  } catch (error: unknown) {
    console.error("CRITICAL ERROR in upload-pdf route:", error);
    
    // Provide detailed error messaging based on the error context
    let errorMessage = "Terjadi kesalahan sistem saat memproses dokumen.";
    if (error instanceof Error) {
       errorMessage = error.message;
       // Add context if we recognize certain error types
       if (errorMessage.includes("429")) {
         errorMessage = "Kuota harian AI Gemini telah habis. Silakan coba lagi besok.";
       }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}