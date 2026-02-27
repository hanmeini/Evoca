import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { text, speakerId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Select different voices for Speaker A and Speaker B
    // You can replace these with your preferred ElevenLabs Voice IDs
    const voiceId = speakerId === "A" 
      ? "JBFqnCBsd6RMkjVDRZzb" // Example Voice A (e.g. George)
      : "CwhRBWXzGAHq8TQ4Fs17"; // Example Voice B (e.g. Roger)

    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    });

    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    // Convert string/stream response to buffer so we can send it as audio/mpeg
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream as unknown as AsyncIterable<Uint8Array>) {
        chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
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
