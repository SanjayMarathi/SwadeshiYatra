import { GoogleGenerativeAI } from "@google/generative-ai";

const getKeys = (): string[] => {
  const keysStr =
    process.env.GEMINI_API_KEYS ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "";
  return keysStr.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
};

// Global state for current key index to persist across calls during session
let currentKeyIndex = 0;

export async function runWithRotation<T>(
  operation: (genAI: GoogleGenerativeAI) => Promise<T>
): Promise<T> {
  const keys = getKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found in environment variables.");
  }

  let lastError: any = null;
  const initialIndex = currentKeyIndex;

  // Try each key starting from the current session index
  for (let i = 0; i < keys.length; i++) {
    const index = (initialIndex + i) % keys.length;
    const apiKey = keys[index];
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
      const result = await operation(genAI);
      // Update global index so we start from the successful key next time
      currentKeyIndex = index;
      return result;
    } catch (err: any) {
      console.error(`[AI Rotation] Key 10s... failed:`, err.message || err);
      lastError = err;

      // Detect "Quota Exceeded" or "Rate Limit" errors
      const isQuotaError =
        err.message?.includes("429") ||
        err.message?.includes("quota") ||
        err.message?.includes("limit") ||
        err.status === 429;

      if (isQuotaError) {
        console.warn(`[AI Rotation] Quota exceeded for key ${index + 1}/${keys.length}. Switching...`);
        continue; // Try next key
      } else {
        // For other errors (syntax, logic), don't bother rotating, just fail
        throw err;
      }
    }
  }

  throw lastError || new Error("All configured API keys failed.");
}
