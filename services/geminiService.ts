import { GoogleGenAI, Type } from "@google/genai";

// CAUTION: In a real app, never expose API keys on the client side.
// This is for demonstration purposes within the constraints.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBookRecommendations = async (
  query: string,
  currentInventory: string[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Cannot generate recommendations.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an expert Librarian AI. 
      The user is asking: "${query}".
      
      The current library inventory contains books with these titles:
      ${JSON.stringify(currentInventory)}

      Please recommend a book from the inventory if it matches, or suggest a famous book that *should* be in the library based on the request.
      Keep the response short, encouraging, and friendly.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "I couldn't find a specific recommendation at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the recommendation service.";
  }
};