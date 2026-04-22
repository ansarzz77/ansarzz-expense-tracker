const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = (modelName = "gemini-2.5-flash", isJson = false) => {
  const config = {};
  if (isJson) {
    config.responseMimeType = "application/json";
  }
  
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: config
  });
};

module.exports = { genAI, getModel };
