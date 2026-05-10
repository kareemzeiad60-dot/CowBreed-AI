import { GoogleGenAI, Type } from "@google/genai";
import { CowBreedAnalysis } from "../types";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح Gemini API غير متوفر. يرجى إضافته في إعدادات التطبيق.");
    }
    genAI = new GoogleGenAI(apiKey as any);
  }
  return genAI;
}

export async function analyzeCowImage(base64Image: string): Promise<CowBreedAnalysis> {
  const ai = getGenAI();
  const modelName = "gemini-1.5-flash"; // Using a stable and common model name
  
  const prompt = `Analyze this image of a cow. 
  Identify its breed and provide expert agricultural advice in ARABIC.
  
  Return the response in JSON format (MUST be valid JSON) with the following fields:
  - breed: The name of the breed in Arabic.
  - confidence: A estimated confidence score between 0 and 1.
  - description: A detailed description of the breed features.
  - nutrition: Nutritional requirements and best feeding practices for this breed.
  - healthCare: Key health considerations and disease prevention.
  - conversionRate: Information about growth/milk conversion rate.`;

  try {
    const generativeModel = (ai as any).getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await generativeModel.generateContent([
      prompt,
      { inlineData: { data: base64Image.split(",")[1], mimeType: "image/jpeg" } }
    ]);

    const responseText = result.response.text();
    return JSON.parse(responseText.trim()) as CowBreedAnalysis;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error(error instanceof Error ? error.message : "حدث خطأ أثناء تحليل الصورة. تأكد من جودة الصورة والمحاولة لاحقاً.");
  }
}
