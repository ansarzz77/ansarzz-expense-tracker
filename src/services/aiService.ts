import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const getModel = () => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
};

export interface ParsedTransaction {
  text: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  note?: string;
}

export const parseNaturalLanguageTransaction = async (
  input: string, 
  categories: string[]
): Promise<ParsedTransaction> => {
  if (!API_KEY) {
    throw new Error("API Key is missing from the build. Check GitHub Secrets.");
  }
  
  const model = getModel();
  if (!model) {
    throw new Error("AI Model failed to initialize. Check if your API Key is valid.");
  }

  const today = new Date().toISOString().split('T')[0];
  const prompt = `
    Extract transaction details from: "${input}"
    Current Date: ${today}
    Valid Categories: ${categories.join(', ')}
    
    Return a JSON object matching this schema:
    {
      "text": string,
      "amount": number,
      "category": string (MUST be one of the Valid Categories),
      "date": "YYYY-MM-DD",
      "type": "income" | "expense",
      "note": string
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      return JSON.parse(text) as ParsedTransaction;
    } catch (parseErr) {
      throw new Error(`AI returned invalid JSON: ${text.substring(0, 100)}...`);
    }
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    const message = error.message || "Unknown AI error";
    
    if (message.includes('Failed to fetch')) {
      throw new Error("AI Network Error (Failed to fetch). This could be due to an invalid model name, an incorrect API key, or your browser/network blocking the request (CORS/Adblocker).");
    }
    if (message.includes('403')) {
      throw new Error("AI Access Denied (403). Check if your API Key has Referrer Restrictions blocking this domain or if the model name is incorrect.");
    }
    if (message.includes('404')) {
      throw new Error("AI Model Not Found (404). The model name might be incorrect or discontinued.");
    }
    if (message.includes('429')) {
      throw new Error("AI Quota Exceeded (429). Please wait a minute.");
    }
    throw new Error(message);
  }
};

export const getFinancialInsights = async (
  transactions: any[],
  buckets: any[],
  healthScore: number
): Promise<string> => {
  if (!API_KEY || !genAI) return "Set your VITE_GEMINI_API_KEY to get AI insights.";

  const insightModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze these finances and give one concise, friendly piece of advice (max 2 sentences).
    Current Health Score: ${healthScore}/100
    Recent Transactions: ${JSON.stringify(transactions.slice(-10))}
    Savings Goals: ${JSON.stringify(buckets)}
    
    Act as a supportive financial coach.
  `;

  try {
    const result = await insightModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting insights:", error);
    return "Keep up the great work!";
  }
};
