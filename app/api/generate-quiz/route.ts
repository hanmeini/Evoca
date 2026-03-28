import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { documentId, type, userId } = await req.json();
    const isBoss = type === "boss";

    if (!documentId) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 });
    }

    let docData: { quizData?: any, extractedText?: string, [key: string]: any } | null = null;
    let docRef: any = null; // Reference type is complex from adminDb
    let finalDocId = documentId;

    if (isBoss && documentId.startsWith("boss-cluster-")) {
      const clusterNum = parseInt(documentId.split("-")[2]);
      const skipCount = (clusterNum - 1) * 4;
      
      // Determine the user UID (prioritize passed userId, then extract from ID if possible)
      const parts = documentId.split("-");
      const uidToUse = userId || (parts.length >= 4 ? parts.slice(3).join("-") : null);

      if (!uidToUse) {
        return NextResponse.json({ error: "User ID required for boss cluster" }, { status: 400 });
      }

      const docsSnap = await adminDb.collection("documents")
        .where("userId", "==", uidToUse)
        .orderBy("createdAt", "asc")
        .get();

      const realDocs = docsSnap.docs
        .filter(d => !d.id.startsWith("dummy-") && !d.id.startsWith("boss-cluster-"))
        .slice(skipCount, skipCount + 4);

      if (realDocs.length === 0) {
        return NextResponse.json({ error: "Materials for unit exam not found. Complete 4 regular missions first!" }, { status: 400 });
      }

      const combinedText = realDocs.map(d => d.data().extractedText).join("\n\n---\n\n");
      
      finalDocId = documentId;
      docRef = adminDb.collection("documents").doc(finalDocId);
      const bossSnap = await docRef.get();

      if (bossSnap.exists) {
        docData = bossSnap.data();
      } else {
        docData = {
          id: finalDocId,
          userId: uidToUse,
          fileName: `Evaluasi Unit ${clusterNum}`,
          extractedText: combinedText,
          metadata: { title: `Ujian Akhir Unit ${clusterNum}` },
          createdAt: new Date().toISOString(),
          isBossExam: true
        };
        await docRef.set(docData);
      }
    } else {
      docRef = adminDb.collection("documents").doc(documentId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
      docData = docSnap.data();
    }

    if (!docData || !docData.extractedText) {
      return NextResponse.json({ error: "Document text not found" }, { status: 404 });
    }

    if (docData.quizData && !isBoss) {
      return NextResponse.json({ success: true, quiz: docData.quizData }, { status: 200 });
    }

    const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // Define the schema for the quiz
    const quizSchema = {
      description: "List of multiple choice quiz questions",
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: {
            type: SchemaType.STRING,
            description: "The text of the quiz question"
          },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of exactly 4 multiple choice options"
          },
          answerIndex: {
            type: SchemaType.NUMBER,
            description: "The zero-based index of the correct option"
          }
        },
        required: ["question", "options", "answerIndex"]
      }
    } as any;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { 
        responseMimeType: "application/json",
        responseSchema: quizSchema
      }
    });

    let prompt = "";
    if (isBoss) {
      prompt = `Kamu adalah Prof. Harimau, penguji di aplikasi Evoca.
    Tugasmu adalah membuat UJIAN AKHIR (Boss Level) berupa 15 pertanyaan kuis pilihan ganda yang menguji ketajaman ingatan user dari seluruh materi yang dipelajari. Kualitas pertanyaan harus menantang dan mendalam.
    Buatlah pertanyaan yang bervariasi dari konsep dasar hingga aplikasi tingkat lanjut.
    
    Kembalikan HANYA JSON array murni (tanpa blok markdown).
    Struktur objek:
    {
      "question": "Teks pertanyaan (Bahasa Indonesia)",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "answerIndex": 0 // Index nol untuk jawaban yang benar
    }
    
    Teks Materi: 
    ${docData.extractedText.substring(0, 70000)}
    `;
    } else {
      prompt = `Berdasarkan teks dokumen berikut, buatlah kuis pilihan ganda yang terdiri dari 5 pertanyaan.
    
    ATURAN KHUSUS KHUSUS MATEMATIKA/TEKNIS:
    1. Jika teks berisi RUMUS, CONTOH SOAL, atau PERHITUNGAN, Anda WAJIB membuat soal kuis yang menggunakan Angka/Skenario yang BERBEDA dari contoh di teks (modifikasi angka/variabel).
    2. Tujuannya adalah memastikan user benar-benar paham logika perhitungannya, bukan cuma menghafal jawaban di teks.
    3. Pertanyaan harus menguji pemahaman konsep mendalam dan aplikasi rumus tersebut.
    
    ATURAN UMUM:
    - Seluruh kuis harus dalam Bahasa Indonesia.
    - Jawaban kuis harus benar-benar ada dasarnya di dalam teks.
    
    Kembalikan HANYA JSON array murni (tanpa blok markdown).
    Struktur objek:
    {
      "question": "Teks pertanyaan (Bahasa Indonesia)",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "answerIndex": 0 // Index nol untuk jawaban yang benar
    }
    
    Teks Dokumen: 
    ${docData.extractedText.substring(0, 60000)}
    `;
    }

    const response = await model.generateContent(prompt);
    const aiText = response.response.text() || "[]";
    const cleanJsonString = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

    let quizData = [];
    try {
      quizData = JSON.parse(cleanJsonString);
    } catch {
      console.error("Failed to parse Gemini Quiz JSON:", cleanJsonString);
      return NextResponse.json({ error: "Failed to generate usable quiz format." }, { status: 500 });
    }

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
