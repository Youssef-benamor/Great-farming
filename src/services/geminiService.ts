import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askFarmingExpert(prompt: string, imageBase64?: string, mimeType?: string) {
  try {
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
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
}
