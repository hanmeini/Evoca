import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";

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
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Berdasarkan teks dokumen berikut, buatlah kuis pilihan ganda yang terdiri dari 5 pertanyaan.
    
    ATURAN KHUSUS KHUSUS MATEMATIKA/TEKNIS:
    1. Jika teks berisi RUMUS, CONTOH SOAL, atau PERHITUNGAN, Anda WAJIB membuat soal kuis yang menggunakan Angka/Skenario yang BERBEDA dari contoh di teks (modifikasi angka/variabel).
    2. Tujuannya adalah memastikan user benar-benar paham logika perhitungannya, bukan cuma menghafal jawaban di teks.
    3. Pertanyaan harus menguji pemahaman konsep mendalam dan aplikasi rumus tersebut.
    
    ATURAN UMUM:
    - Seluruh kuis harus dalam Bahasa Indonesia.
    - Jawaban kuis harus benar-benar ada dasarnya di dalam teks.
    
    Kembalikan HANYA JSON array array murni (tanpa blok markdown).
    Struktur objek:
    {
      "question": "Teks pertanyaan (Bahasa Indonesia)",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "answerIndex": 0 // Index nol untuk jawaban yang benar
    }
    
    Teks Dokumen: 
    ${docData.extractedText.substring(0, 60000)}
    `;

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
