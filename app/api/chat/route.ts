import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase-admin";
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { documentId, currentMessages } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "No document ID provided" }, { status: 400 });
    }

    if (!currentMessages || !Array.isArray(currentMessages)) {
       return NextResponse.json({ error: "Invalid messages provided" }, { status: 400 });
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

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Format conversation history for Gemini
    const systemInstruction = `You are a helpful AI assistant for an Educational Application.
You are helping a student understand a specific document.
Please respond entirely in Bahasa Indonesia.
Here is the document text you must base all your answers on:

<document>
${docData.extractedText.substring(0, 60000)}
</document>

Answer the user's questions based ONLY on this text. Keep your answers concise, clear, and educational.`;

    // Map frontend messages ("user" | "assistant") to Gemini roles ("user" | "model")
    // Note: The new gemini API takes an array of history messages.
    // The very last message from the user is passed as the current `contents`.
    
    // Ensure there is at least a user message
    const lastUserMessage = currentMessages[currentMessages.length - 1];
    
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
       return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    // Build history (excluding the very last user message)
    const history = currentMessages.slice(0, -1).map((msg: { role: string; content: string }) => ({
       role: msg.role === 'assistant' ? 'model' : 'user',
       parts: [{ text: msg.content }]
    }));

    // Start a chat session
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
           systemInstruction: systemInstruction,
        },
        history: history.length > 0 ? history : undefined
    });

    const response = await chat.sendMessage({
      message: lastUserMessage.content
    });
    
    const replyText = response.text || "Saya tidak yakin bagaimana harus menjawab itu berdasarkan dokumen tersebut.";

    // 4. Save message pair to Firestore
    try {
      const timestamp = new Date().toISOString();
      await docRef.update({
        chatHistory: [
          ...(docData.chatHistory || []),
          { role: 'user', content: lastUserMessage.content, timestamp },
          { role: 'assistant', content: replyText, timestamp }
        ]
      });
    } catch (saveError) {
      console.error("Failed to save chat history:", saveError);
      // We don't block the response even if saving history fails, 
      // but we log it.
    }

    return NextResponse.json({ success: true, reply: replyText }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error generating chat reply:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate chat reply";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
