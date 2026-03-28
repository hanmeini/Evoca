import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary";

// Bun handles .env automatically - no need for dotenv

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function runDiagnostics() {
  console.log("--- Starting Diagnostics ---");

  // 1. Check Cloudinary
  try {
    console.log("\n[1] Testing Cloudinary...");
    const ping = await cloudinary.api.ping();
    console.log("Cloudinary Ping Success:", ping);
  } catch (error: any) {
    console.error("Cloudinary Error:", error.message);
  }

  // 2. Check Gemini Models
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const testModel = async (modelName: string) => {
    try {
      console.log(`\n[2] Testing Gemini Model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'System OK'");
      console.log(`Success with ${modelName}:`, result.response.text());
    } catch (error: any) {
      console.error(`Error with ${modelName}:`, error.message);
      if (error.message.includes("404") || error.message.includes("not found") || error.message.includes("not supported")) {
          console.log(`CONFIRMED: ${modelName} is NOT a valid model name.`);
      }
    }
  };

  await testModel("gemini-2.5-flash");
  await testModel("gemini-1.5-flash");

  console.log("\n--- Diagnostics Finished ---");
}

runDiagnostics();
