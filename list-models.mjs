import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = await genAI.listModels();
  console.log(JSON.stringify(models, null, 2));
}

list();
