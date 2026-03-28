import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { adminDb } from "@/src/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { topic, userId } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Generate Content with Gemini

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Anda adalah asisten ahli pendidikan. Tolong buatkan materi belajar yang komprehensif, menarik, dan mudah dipahami mengenai topik: "${topic}".
Tujuan Anda adalah menyusun informasi penting untuk membantu siswa belajar dan bersiap menghadapi kuis/ujian.
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
  "extractedText": "Seluruh teks materi belajar yang Anda buat secara lengkap dan mendalam (minimal 500 kata)",
  "confidenceScore": 98,
  "estimatedReadTimeMinutes": 8
}

Pastikan "extractedText" berisi narasi lengkap dari materi tersebut agar sistem chat AI bisa menjawab pertanyaan siswa nantinya.`;

    const response = await model.generateContent(prompt);
    const aiText = response.response.text() || "{}";
    const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

    let aiResult;
    try {
      aiResult = JSON.parse(cleanJsonString);
      if (!aiResult.extractedText || aiResult.extractedText.trim() === "") {
        throw new Error("Materi kosong.");
      }
    } catch {
      console.error("Failed to parse Gemini JSON or generation failed:", cleanJsonString);
      throw new Error("Gagal menyusun materi dari topik tersebut. Silakan coba kata kunci lain atau coba lagi nanti.");
    }

    const { extractedText, ...metadata } = aiResult;

    // 2. Store in Firebase Firestore
    const docId = uuidv4();
    const newDoc = {
      id: docId,
      userId: userId,
      fileName: `Materi: ${topic}`,
      fileSize: 0,
      fileUrl: "", // No URL for generated text
      fileType: "generated",
      extractedText: extractedText || "",
      metadata: metadata,
      createdAt: new Date().toISOString(),
      completedStages: []
    };

    await adminDb.collection("documents").doc(docId).set(newDoc);

    return NextResponse.json({ success: true, document: newDoc }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error creating topic material:", error);
    return NextResponse.json(
      { error: "Gagal membuat materi. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
