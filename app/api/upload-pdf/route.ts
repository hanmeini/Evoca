import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { adminDb } from "@/src/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileUrl, fileName, fileType, fileSize, userId } = body;

    // Validation
    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log("Starting AI document analysis for player:", userId);
    const startTime = Date.now();

    // 1. Fetch file from Cloudinary to get Buffer for Gemini multimodal input
    let buffer: Buffer;
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file from Cloudinary URL");
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (fetchError: any) {
      console.error("Error fetching file from Cloudinary:", fetchError);
      return NextResponse.json({ error: "Gagal mengambil dokumen dari penyimpanan storage." }, { status: 500 });
    }
    console.log("File buffer retrieved in:", (Date.now() - startTime) / 1000, "s");

    // 2. Multimodal Analysis with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert to base64 for Gemini
    const base64Data = buffer.toString("base64");
    
    // User requested detailed prompt structure
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
3. WAJIB menggunakan format **tebal** pada kata kunci or istilah teknis di setiap baris.
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

    // 9 second timeout for Vercel
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT_AI")), 9000);
    });

    try {
      const result = await Promise.race([
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
      ]) as any;

      console.log("Gemini analysis done in:", (Date.now() - startTime) / 1000, "s");

      const aiText = result.response.text() || "{}";
      const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

      let processedAiResult;
      try {
        processedAiResult = JSON.parse(cleanJsonString);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON output:", cleanJsonString);
        throw new Error("Gagal membaca hasil analisis AI. Harap coba lagi.");
      }

      const { extractedText, ...metadata } = processedAiResult;
      
      if (!extractedText || extractedText.trim() === "" || extractedText === "Teks gagal diekstrak.") {
        throw new Error("AI gagal mengekstrak teks dari dokumen. Pastikan file terbaca dengan jelas.");
      }

      // 3. Store in Firebase Firestore
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

    } catch (apiError: any) {
      if (apiError.message === "TIMEOUT_AI") {
        return NextResponse.json({ error: "Analisis AI terlalu lama (Limit Vercel 10 detik). Harap gunakan file yang lebih kecil atau coba lagi." }, { status: 504 });
      }
      throw apiError;
    }

  } catch (error: any) {
    console.error("CRITICAL ERROR in upload-pdf route:", error);
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan sistem saat memproses dokumen.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}