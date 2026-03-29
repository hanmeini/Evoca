import { NextRequest, NextResponse } from "next/server";
import * as googleTTS from "google-tts-api";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { text, speakerId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    
    // Attempt ElevenLabs if Key is present
    if (apiKey && apiKey.startsWith("sk_")) {
      try {
        // High Quality Default Voices: Josh (A), Rachel (B)
        const selectedVoiceId = speakerId === "A" ? "TxGEqnSAsmSBH8I9Yp3E" : "21m00Tcm4TlvDq8ikWAM";

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.byteLength.toString(),
            },
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn("ElevenLabs info:", errorData?.detail?.message || "Quota/Service issue. Falling back to Google TTS.");
        }
      } catch (e) {
        console.error("ElevenLabs critical failure:", e);
      }
    }

    // Fallback or Secondary: Google TTS (Reliable/Free)
    const voiceLang = speakerId === "A" ? "id" : "ms";
    
    const base64AudioArray = await googleTTS.getAllAudioBase64(text, {
      lang: voiceLang,
      slow: false,
      host: 'https://translate.google.com',
      splitPunct: ',.?',
    });

    const audioBuffers = base64AudioArray.map((chunk: { base64: string }) => {
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
    console.error("Critical error generating audio:", error);
    const errorMessage = error instanceof Error ? error.message : "Gagal memuat suara podcast.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
