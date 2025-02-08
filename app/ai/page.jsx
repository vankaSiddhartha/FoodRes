"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Heart, Send, Calculator, MessageCircle } from 'lucide-react';

const HealthPage = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');

  const calculateBMI = () => {
    if (!height || !weight) {
      setMessage('Please enter both height and weight');
      return;
    }

    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    let category;
    if (bmiValue < 18.5) category = 'Underweight';
    else if (bmiValue < 25) category = 'Normal weight';
    else if (bmiValue < 30) category = 'Overweight';
    else category = 'Obese';

    setMessage(`Your BMI is ${bmiValue} (${category})`);
  };

  const handleUserMessage = async () => {
    if (!userInput.trim()) return;
    
    setLoading(true);
    const messageText = userInput;
    setUserInput('');
    setChatHistory(prev => [...prev, { type: 'user', content: messageText }]);
    
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyDg6Ho6LTTjg6gxRy1PuWgTbeo7NopYZVE');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a knowledgeable health assistant. Provide helpful, accurate, and concise advice about health, fitness, nutrition, and wellness. 
      
      User question: ${messageText}
      
      Keep your response focused on providing accurate health information and practical advice. If medical attention is needed, recommend consulting a healthcare professional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChatHistory(prev => [...prev, { type: 'assistant', content: text }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center mb-8">
          <Heart className="w-8 h-8 text-pink-500 mr-2" />
          <h1 className="text-3xl font-bold text-pink-500">Health Assistant</h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* BMI Calculator Section */}
          <Card className="border-pink-100 shadow-lg">
            <CardHeader className="border-b border-pink-100">
              <div className="flex items-center">
                <Calculator className="w-5 h-5 text-pink-500 mr-2" />
                <h2 className="text-xl font-semibold text-pink-500">BMI Calculator</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pink-600 mb-1">Height (cm)</label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Enter height"
                    className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-pink-600 mb-1">Weight (kg)</label>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight"
                    className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
              </div>
              
              <Button 
                onClick={calculateBMI}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                Calculate BMI
              </Button>

              {message && (
                <Alert className="bg-pink-50 border-pink-200">
                  <AlertDescription className="text-pink-700">{message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Health Assistant Chat Section */}
          <Card className="border-pink-100 shadow-lg">
            <CardHeader className="border-b border-pink-100">
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 text-pink-500 mr-2" />
                <h2 className="text-xl font-semibold text-pink-500">Health Chat Assistant</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="h-96 overflow-y-auto rounded-lg p-4 bg-white border border-pink-100">
                {chatHistory.length === 0 && (
                  <div className="text-center text-pink-400">
                    Ask me anything about health, fitness, nutrition, or wellness!
                  </div>
                )}
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-pink-100 ml-auto max-w-[80%] text-pink-800' 
                        : msg.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-100'
                        : 'bg-purple-50 mr-auto max-w-[80%] text-purple-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {loading && (
                  <div className="text-center text-pink-400 animate-pulse">
                    Thinking...
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask about health, fitness, or nutrition..."
                  className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUserMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleUserMessage}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;