// pages/api/chat.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const { message, bmi } = req.body;

    const prompt = `As a health assistant, respond to the following user message. 
    Their BMI is ${bmi || 'not calculated yet'}. User message: ${message}
    
    Keep responses concise and focused on providing accurate health information.
    If they haven't calculated their BMI yet, encourage them to do so.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}