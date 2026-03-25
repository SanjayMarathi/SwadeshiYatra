import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyA9dAdXYYq_umbVn0YC5DmIN-T29zWxRHM";
const genAI = new GoogleGenerativeAI(geminiApiKey);

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-pro-latest"
];

async function test() {
  for (const modelName of MODEL_CANDIDATES) {
    console.log(`Testing ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      console.log(`Success with ${modelName}:`, result.response.text());
      return;
    } catch (e) {
      console.error(`Error with ${modelName}:`, e.message || e);
    }
  }
}

test();
