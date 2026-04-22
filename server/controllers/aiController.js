const { getModel } = require('../config/gemini');

exports.parseTransaction = async (req, res) => {
  const { input, categories } = req.body;
  if (!input) return res.status(400).json({ error: "Input is required" });

  const model = getModel("gemini-2.5-flash", true);
  const today = new Date().toISOString().split('T')[0];
  const prompt = `
    Extract transaction details from: "${input}"
    Current Date: ${today}
    Valid Categories: ${categories ? categories.join(', ') : 'General, Food, Travel, Shopping, Salary'}
    
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
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Error (Parse):", error);
    res.status(500).json({ error: error.message || "Failed to parse transaction" });
  }
};

exports.getFinancialInsights = async (req, res) => {
  const { transactions, buckets, healthScore } = req.body;
  
  const model = getModel("gemini-2.5-flash", false);
  const prompt = `
    Analyze these finances and give one concise, friendly piece of advice (max 2 sentences).
    Current Health Score: ${healthScore}/100
    Recent Transactions: ${JSON.stringify(transactions ? transactions.slice(-10) : [])}
    Savings Goals: ${JSON.stringify(buckets || [])}
    
    Act as a supportive financial coach.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ insight: response.text() });
  } catch (error) {
    console.error("Gemini Error (Insights):", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
};
