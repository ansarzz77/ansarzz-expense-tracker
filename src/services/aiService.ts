import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

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
  if (!API_KEY) return null;

  const today = new Date().toISOString().split('T')[0];
  const prompt = `
    Extract transaction details from the following text: "${input}"
    
    Current available categories: ${categories.join(', ')}
    Current date today: ${today}
    
    Rules:
    1. If the year isn't specified, assume it's the current year.
    2. If the category doesn't match exactly, pick the closest one from the list.
    3. If it's unclear if it's income or expense, assume 'expense' unless keywords like 'received', 'salary', 'earned' are present.
    4. Return ONLY a valid JSON object.
    
    Response format:
    {
      "text": "Short description",
      "amount": number,
      "category": "One from the list",
      "date": "YYYY-MM-DD",
      "type": "income" | "expense",
      "note": "Any extra details"
    }
  `;

  try {
    if (!model) return null;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from markdown if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ParsedTransaction;
    }
    return null;
  } catch (error) {
    console.error("Error parsing transaction with AI:", error);
    return null;
  }
};

export const getFinancialInsights = async (
  transactions: any[],
  buckets: any[],
  healthScore: number
): Promise<string> => {
  if (!API_KEY) return "Set your VITE_GEMINI_API_KEY to get AI insights.";

  const prompt = `
    Analyze these finances and give one concise, friendly piece of advice (max 2 sentences).
    Current Health Score: ${healthScore}/100
    Recent Transactions: ${JSON.stringify(transactions.slice(-10))}
    Savings Goals: ${JSON.stringify(buckets)}
    
    Act as a supportive financial coach. Highlight a trend or suggest a small win.
  `;

  try {
    if (!model) return "Set your VITE_GEMINI_API_KEY to get AI insights.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting insights:", error);
    return "Keep up the great work on your financial journey!";
  }
};
