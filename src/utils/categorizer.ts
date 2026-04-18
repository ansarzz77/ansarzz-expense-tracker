import { SEED_CATEGORIES } from '../context/GlobalState';

export const categories = SEED_CATEGORIES;

const categoryKeywords: Record<string, string[]> = {
  'Food': ['swiggy', 'zomato', 'restaurant', 'hotel', 'food', 'grocery', 'supermarket', 'blinkit', 'zepto', 'bigbasket', 'starbucks', 'mcdonalds', 'kfc', 'bakery', 'cafe'],
  'Transportation': ['uber', 'ola', 'rapido', 'petrol', 'diesel', 'fuel', 'metro', 'bus', 'train', 'irctc', 'flight', 'airline', 'indigo', 'air india', 'auto', 'taxi'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'clipping', 'garments', 'clothes', 'shoes', 'electronics', 'reliance digital', 'croma', 'tata cliq'],
  'Entertainment': ['netflix', 'hotstar', 'prime video', 'youtube', 'spotify', 'theatre', 'cinema', 'pvr', 'inox', 'bookmyshow', 'game', 'subscription'],
  'Rent': ['rent', 'house rent', 'flat rent', 'room rent'],
  'Salary': ['salary', 'wages', 'income', 'stipend', 'bonus', 'paycheck'],
  'Loan Instalment': ['emi', 'loan', 'hdfc bank', 'icici bank', 'sbi card', 'axis bank', 'instalment', 'mortgage'],
  'Society Maintenance': ['society', 'maintenance', 'apartment', 'association'],
  'Property Tax': ['property tax', 'municipal tax', 'tax'],
  'Utility-Self': ['electricity', 'water bill', 'bescom', 'gas', 'indane', 'hp gas', 'jio', 'airtel', 'vi ', 'vodafone', 'bsnl', 'recharge', 'wifi', 'broadband'],
  'Utility-Parents': ['parent electricity', 'parent mobile', 'parent recharge'],
  'Car Expense': ['car service', 'mechanic', 'car wash', 'parking', 'toll', 'fastag'],
  'Kids Madrassa': ['madrassa', 'school fee', 'tuition'],
  'Investment': ['mutual fund', 'stocks', 'zerodha', 'groww', 'upstox', 'sip', 'lic', 'insurance', 'fixed deposit', 'fd ', 'recurring deposit', 'rd '],
  'Credit Card': ['credit card bill', 'cc payment', 'amex', 'visa', 'mastercard', 'bill payment']
};

export const autoCategorize = (description: string): string => {
  const desc = description.toLowerCase();
  
  // First, check if the description directly contains any category name
  for (const category of categories) {
    if (desc.includes(category.toLowerCase())) {
      return category;
    }
  }
  
  // Then fall back to keyword mapping
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => desc.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return 'General';
};
