import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const askGemini = async (userPrompt, productCatalog) => {
  try {
    // We create a system instruction so the AI knows its job
    const systemInstruction = `
      You are an expert sales assistant for "iPhone Ceylon Mobile", a premium electronics store in Sri Lanka.
      Your job is to help customers choose the best Apple products based on their needs.
      
      CRITICAL RULES:
      1. ONLY recommend products that are listed in the provided 'Available Inventory' below.
      2. If a user asks for a product not in the inventory, politely inform them it is out of stock.
      3. Always quote prices in Sri Lankan Rupees (LKR/Rs).
      4. Keep responses friendly, concise, and formatted with bullet points for readability.
      5. Mention that Cash on Delivery (COD) and Bank Transfers are accepted.

      AVAILABLE INVENTORY (JSON Format):
      ${JSON.stringify(productCatalog, null, 2)}
    `;

    // Combine the system instructions with the user's specific question
    const fullPrompt = `${systemInstruction}\n\nCustomer Question: ${userPrompt}`;

    // Call the Gemini 2.5 Flash model (Fast and cost-effective)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to communicate with AI');
  }
};
