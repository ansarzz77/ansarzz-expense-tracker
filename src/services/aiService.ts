export interface ParsedTransaction {
  text: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  note?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// Debug log for production troubleshooting
if (!import.meta.env.DEV) {
  console.log("AI Service initialized. Backend URL:", BACKEND_URL || "Using relative path (Internal)");
}

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
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        } else {
            // This happens if we hit a 404 page on GitHub Pages instead of our Render API
            throw new Error(`The backend API was not found (Status: ${response.status}). Ensure your Render.com backend is deployed and VITE_BACKEND_URL is set in GitHub Secrets.`);
        }
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("The server did not return JSON. Check if the VITE_BACKEND_URL is correct.");
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

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        console.error("The Insights API did not return JSON. Using fallback advice.");
        return "Keep up the great work!";
    }

    const data = await response.json();
    return data.insight;
  } catch (error) {
    console.error("Error getting insights from backend:", error);
    return "Keep up the great work!";
  }
};
