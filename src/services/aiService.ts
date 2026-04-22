export interface ParsedTransaction {
  text: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  note?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const parseNaturalLanguageTransaction = async (
  input: string, 
  categories: string[]
): Promise<ParsedTransaction> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/parse-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, categories })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Backend API Error:", error);
    throw new Error(error.message || "Failed to parse transaction via backend");
  }
};

export const getFinancialInsights = async (
  transactions: any[],
  buckets: any[],
  healthScore: number
): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/financial-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, buckets, healthScore })
    });

    if (!response.ok) return "Keep up the great work! (Insights unavailable)";

    const data = await response.json();
    return data.insight;
  } catch (error) {
    console.error("Error getting insights from backend:", error);
    return "Keep up the great work!";
  }
};
