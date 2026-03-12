import { NextRequest, NextResponse } from "next/server";
import * as googleTTS from "google-tts-api";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { text, speakerId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // A: Bahasa Indonesia, B: Bahasa Melayu (to create a distinct second speaker voice)
    const voiceLang = speakerId === "A" ? "id" : "ms";
    
    // google-tts-api handles chunking automatically for texts > 200 chars
    const base64AudioArray = await googleTTS.getAllAudioBase64(text, {
      lang: voiceLang,
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?',
    });

    // Combine all base64 chunks into a single ArrayBuffer/Buffer
    const audioBuffers = base64AudioArray.map((chunk) => {
        return Buffer.from(chunk.base64, 'base64');
    });
    const finalAudioBuffer = Buffer.concat(audioBuffers);

    return new NextResponse(finalAudioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": finalAudioBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error generating ElevenLabs audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate audio";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
