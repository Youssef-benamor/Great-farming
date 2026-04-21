import { GoogleGenAI } from "@google/genai";

export async function askFarmingExpert(prompt: string, imageBase64?: string, mimeType?: string) {
  try {
    // Use the selected API key from the platform dialog (process.env.API_KEY)
    // or fall back to the default GEMINI_API_KEY
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [{ text: prompt }];
    
    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: parts
        }
      ],
      config: {
        systemInstruction: "You are an expert Tunisian agricultural consultant. You specialize in Mediterranean and Arid climate farming. You can diagnose plant diseases from images, suggest modern tools, and explain sustainable methods. Always provide practical advice suitable for Tunisia. If an image is provided, analyze it for plant health issues.",
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // If the error is related to quota or missing key, we might want to trigger the key selection
    const errorString = JSON.stringify(error).toLowerCase();
    const errorMessage = (error.message || "").toLowerCase();
    const errorCode = error.code || (error.error && error.error.code);
    const errorStatus = (error.status || (error.error && error.error.status) || "").toLowerCase();
    
    if (
      errorMessage.includes("quota") || 
      errorMessage.includes("429") || 
      errorMessage.includes("limit") ||
      errorMessage.includes("resource_exhausted") ||
      errorMessage.includes("requested entity was not found") ||
      errorString.includes("quota") ||
      errorString.includes("429") ||
      errorString.includes("resource_exhausted") ||
      errorCode === 429 ||
      errorStatus === "resource_exhausted"
    ) {
      return "QUOTA_EXCEEDED";
    }
    
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
}
