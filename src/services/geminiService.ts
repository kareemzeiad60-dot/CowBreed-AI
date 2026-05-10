import { GoogleGenAI, Type } from "@google/genai";
import { CowBreedAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeCowImage(base64Image: string): Promise<CowBreedAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this image of a cow. 
  Identify its breed and provide expert agricultural advice in ARABIC.
  
  Return the response in JSON format with the following fields:
  - breed: The name of the breed in Arabic.
  - confidence: A estimated confidence score between 0 and 1.
  - description: A detailed description of the breed features.
  - nutrition: Nutritional requirements and best feeding practices for this breed.
  - healthCare: Key health considerations and disease prevention.
  - conversionRate: Information about growth/milk conversion rate.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image.split(",")[1], mimeType: "image/jpeg" } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          breed: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          nutrition: { type: Type.STRING },
          healthCare: { type: Type.STRING },
          conversionRate: { type: Type.STRING }
        },
        required: ["breed", "confidence", "description", "nutrition", "healthCare", "conversionRate"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as CowBreedAnalysis;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("حدث خطأ أثناء تحليل البيانات. يرجى المحاولة مرة أخرى.");
  }
}
