import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Using JSON Mode to force valid JSON output
const model = genAI ? genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
  }
}) : null;

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
): Promise<ParsedTransaction | null> => {
  if (!API_KEY || !model) return null;

  const today = new Date().toISOString().split('T')[0];
  const prompt = `
    Extract transaction details from: "${input}"
    Current Date: ${today}
    Valid Categories: ${categories.join(', ')}
    
    Return a JSON object matching this schema:
    {
      "text": string (short description),
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
      console.error("JSON Parse Error on AI response:", text, parseErr);
      return null;
    }
  } catch (error: any) {
    console.error("Error parsing transaction with AI:", error);
    if (error.message?.includes('quota')) {
      alert("AI Quota exceeded. Please wait a minute and try again.");
    }
    return null;
  }
};

export const getFinancialInsights = async (
  transactions: any[],
  buckets: any[],
  healthScore: number
): Promise<string> => {
  if (!API_KEY || !genAI) return "Set your VITE_GEMINI_API_KEY to get AI insights.";

  // Insights don't need JSON mode
  const insightModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
    Analyze these finances and give one concise, friendly piece of advice (max 2 sentences).
    Current Health Score: ${healthScore}/100
    Recent Transactions: ${JSON.stringify(transactions.slice(-10))}
    Savings Goals: ${JSON.stringify(buckets)}
    
    Act as a supportive financial coach. Highlight a trend or suggest a small win.
  `;

  try {
    const result = await insightModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting insights:", error);
    return "Keep up the great work on your financial journey!";
  }
};
