import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});

// 🔁 Retry helper
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let isRequestInProgress = false;

export async function askFarmingExpert(
  prompt: string,
  imageBase64?: string,
  mimeType?: string,
) {
  if (isRequestInProgress) {
    return "Please wait, I'm already processing another request...";
  }

  isRequestInProgress = true;

  const parts: any[] = [{ text: prompt }];

  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    });
  }

  // 🔁 Retry logic (important for 429)
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        config: {
          systemInstruction:
            "You are an expert Tunisian agricultural consultant. You specialize in Mediterranean and Arid climate farming. You can diagnose plant diseases from images, suggest modern tools, and explain sustainable methods. Always provide practical advice suitable for Tunisia. If an image is provided, analyze it for plant health issues.",
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      return response.text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);

      // 🚨 Handle rate limit (429)
      if (error?.status === 429 || error?.message?.includes("429")) {
        const waitTime = 5000 * (attempt + 1); // increasing delay

        console.log(`Rate limited. Retrying in ${waitTime}ms...`);
        await delay(waitTime);

        continue;
      }

      // ❌ Other errors
      break;
    }
  }

  isRequestInProgress = false;

  return "⚠️ Too many requests or server busy. Please wait a moment and try again.";
}
