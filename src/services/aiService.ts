import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }) : null;

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
  if (!API_KEY) {
    console.error("Gemini API Key is missing! Please set VITE_GEMINI_API_KEY in your .env or GitHub Secrets.");
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const prompt = `
    Task: Extract transaction details from the user input.
    Input: "${input}"
    Current Date: ${today}
    Valid Categories: ${categories.join(', ')}
    
    Rules:
    1. Output MUST be a single valid JSON object.
    2. Category MUST be one of the "Valid Categories" listed above. If none match perfectly, choose the most logical fit.
    3. Amount MUST be a number.
    4. Type MUST be "income" or "expense".
    5. Date MUST be in YYYY-MM-DD format.
    6. If input is vague about year, use ${today.split('-')[0]}.
    
    Examples:
    - "500 for lunch" -> {"text": "Lunch", "amount": 500, "category": "Food", "date": "${today}", "type": "expense", "note": ""}
    - "Received 50000 salary" -> {"text": "Salary", "amount": 50000, "category": "Salary", "date": "${today}", "type": "income", "note": ""}
    - "800 on movie yesterday" -> {"text": "Movie", "amount": 800, "category": "Entertainment", "date": "yesterday's date", "type": "expense", "note": ""}
    
    Response Format (JSON ONLY):
    {
      "text": "string",
      "amount": number,
      "category": "string",
      "date": "YYYY-MM-DD",
      "type": "income" | "expense",
      "note": "string"
    }
  `;

  try {
    if (!model) {
      console.error("Gemini Model failed to initialize. Check if API_KEY is valid.");
      return null;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("AI Raw Response:", text);
    
    // Extract JSON from markdown if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("AI Parsed Success:", parsed);
        return parsed as ParsedTransaction;
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr, "Content:", jsonMatch[0]);
        return null;
      }
    }
    console.warn("No JSON found in AI response.");
    return null;
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
