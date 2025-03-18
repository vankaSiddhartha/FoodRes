"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Heart, Send, Calculator, MessageCircle, Activity, Tag } from 'lucide-react';

const HealthPage = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bmi, setBmi] = useState(null);
  const [message, setMessage] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [detectedIntents, setDetectedIntents] = useState([]);
  const [entityList, setEntityList] = useState([]);

  // NLP Intents and Entities database
  const intentPatterns = {
    'weight_loss': ['lose weight', 'weight loss', 'burn fat', 'diet plan', 'reduce weight'],
    'weight_gain': ['gain weight', 'bulk up', 'increase weight', 'mass gain'],
    'nutrition': ['food', 'diet', 'nutrition', 'meal plan', 'eating', 'calories'],
    'exercise': ['workout', 'exercise', 'training', 'fitness', 'cardio', 'strength'],
    'medical_advice': ['pain', 'doctor', 'symptom', 'treatment', 'condition', 'diagnosis'],
    'bmi_info': ['bmi', 'body mass index', 'overweight', 'underweight', 'obese', 'healthy weight'],
    'sleep': ['sleep', 'insomnia', 'rest', 'tired', 'bed', 'nap'],
    'stress': ['stress', 'anxiety', 'mental health', 'relax', 'meditation', 'calm'],
    'water': ['water', 'hydration', 'drink', 'fluid', 'dehydration']
  };

  const entityPatterns = {
    'body_part': ['arm', 'leg', 'back', 'chest', 'shoulder', 'head', 'neck', 'stomach', 'knee', 'elbow', 'foot', 'hand'],
    'nutrient': ['protein', 'carbs', 'fat', 'vitamin', 'mineral', 'fiber', 'sugar', 'sodium'],
    'exercise_type': ['cardio', 'strength', 'yoga', 'pilates', 'hiit', 'running', 'swimming', 'cycling', 'walking'],
    'meal': ['breakfast', 'lunch', 'dinner', 'snack', 'meal'],
    'medical': ['pain', 'injury', 'disease', 'condition', 'treatment', 'symptom', 'doctor'],
    'time_period': ['day', 'week', 'month', 'morning', 'evening', 'night', 'daily', 'weekly']
  };

  // NLP Processing function
  const processNLP = (text) => {
    const lowercaseText = text.toLowerCase();
    const detectedIntents = [];
    const detectedEntities = [];
    
    // Intent detection
    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      for (const pattern of patterns) {
        if (lowercaseText.includes(pattern)) {
          if (!detectedIntents.includes(intent)) {
            detectedIntents.push(intent);
          }
          break;
        }
      }
    });
    
    // Entity extraction
    Object.entries(entityPatterns).forEach(([entityType, entities]) => {
      for (const entity of entities) {
        const regex = new RegExp(`\\b${entity}\\b`, 'i');
        if (regex.test(lowercaseText)) {
          detectedEntities.push({ type: entityType, value: entity });
        }
      }
    });
    
    return { intents: detectedIntents, entities: detectedEntities };
  };

  // Function to generate rule-based responses using NLP
  const generateNLPResponse = (intents, entities, userProfile) => {
    let response = '';
    
    // Primary intent handling
    if (intents.includes('weight_loss')) {
      if (userProfile.bmi && userProfile.bmi < 18.5) {
        response = "Based on your BMI, weight loss may not be advisable. Consider consulting with a healthcare professional about healthy weight management strategies.";
      } else {
        response = "For healthy weight loss, focus on a moderate caloric deficit, regular exercise, and balanced nutrition. Aim for 0.5-1kg per week.";
      }
    } else if (intents.includes('weight_gain')) {
      if (userProfile.bmi && userProfile.bmi > 25) {
        response = "Based on your BMI, weight gain may not be advisable. Consider consulting with a healthcare professional about healthy weight management strategies.";
      } else {
        response = "For healthy weight gain, focus on a caloric surplus of 300-500 calories daily, protein intake, and strength training.";
      }
    } else if (intents.includes('nutrition')) {
      response = "A balanced diet should include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. Portion control is also important.";
    } else if (intents.includes('exercise')) {
      response = "Regular physical activity is recommended - aim for at least 150 minutes of moderate exercise or 75 minutes of vigorous exercise weekly, plus strength training.";
    } else if (intents.includes('medical_advice')) {
      response = "I'm not a medical professional. Please consult with a healthcare provider for personalized medical advice.";
    } else if (intents.includes('bmi_info')) {
      response = "BMI is a screening tool that measures body fat based on height and weight. A healthy BMI range is typically between 18.5-24.9.";
    } else if (intents.includes('sleep')) {
      response = "Adults should aim for 7-9 hours of quality sleep per night. Good sleep hygiene includes consistent sleep schedule and a relaxing bedtime routine.";
    } else if (intents.includes('stress')) {
      response = "Stress management techniques include deep breathing, meditation, physical activity, adequate sleep, and connecting with others.";
    } else if (intents.includes('water')) {
      response = "Adequate hydration is important for overall health. A general guideline is to drink about 2-3 liters of water daily, but needs vary by individual.";
    }
    
    // Entity-based customization
    const entityTypes = entities.map(e => e.type);
    const entityValues = entities.map(e => e.value);
    
    if (entityTypes.includes('body_part')) {
      const bodyParts = entities.filter(e => e.type === 'body_part').map(e => e.value);
      response += ` For ${bodyParts.join(' and ')} specifically, targeted exercises and proper form are important.`;
    }
    
    if (entityTypes.includes('nutrient')) {
      const nutrients = entities.filter(e => e.type === 'nutrient').map(e => e.value);
      response += ` Regarding ${nutrients.join(' and ')}, ensure you're getting appropriate amounts through food sources first before considering supplements.`;
    }
    
    if (entityTypes.includes('exercise_type')) {
      const exerciseTypes = entities.filter(e => e.type === 'exercise_type').map(e => e.value);
      response += ` ${exerciseTypes.join(' and ')} can be effective forms of exercise when done consistently and with proper technique.`;
    }
    
    // Age and gender customization
    if (userProfile.age) {
      const ageValue = parseInt(userProfile.age);
      if (ageValue < 18) {
        response += " For adolescents, nutritional needs are higher to support growth and development.";
      } else if (ageValue >= 65) {
        response += " For older adults, protein intake and strength training become increasingly important for maintaining muscle mass.";
      }
    }
    
    if (userProfile.gender) {
      if (userProfile.gender === 'female') {
        response += " Women may need to pay special attention to calcium and iron intake for bone health and to prevent anemia.";
      } else if (userProfile.gender === 'male') {
        response += " Men typically require more calories and protein due to higher muscle mass on average.";
      }
    }
    
    return response || "I'm your health assistant. Ask me about nutrition, exercise, or general wellness!";
  };

  // BMI calculation enhanced with age and gender considerations
  const calculateBMI = () => {
    if (!height || !weight || !age || !gender) {
      setMessage('Please enter height, weight, age, and gender');
      return;
    }

    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const ageValue = parseInt(age);
    const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    let category;
    if (bmiValue < 18.5) category = 'Underweight';
    else if (bmiValue < 25) category = 'Normal weight';
    else if (bmiValue < 30) category = 'Overweight';
    else category = 'Obese';

    setMessage(`Your BMI is ${bmiValue} (${category})`);

    // Generate NLP-based recommendations
    const userProfile = {
      bmi: bmiValue,
      category: category,
      age: ageValue,
      gender: gender
    };
    
    let nlpRecommendations = "";
    
    // Age-specific recommendations
    if (ageValue < 18) {
      nlpRecommendations += "For adolescents, focus on balanced nutrition for growth and development. ";
    } else if (ageValue >= 65) {
      nlpRecommendations += "For older adults, focus on maintaining muscle mass and bone density. ";
    }
    
    // Gender-specific recommendations
    if (gender === 'female') {
      nlpRecommendations += "Women should ensure adequate calcium and iron intake. ";
    } else if (gender === 'male') {
      nlpRecommendations += "Men typically require more protein and calories due to higher muscle mass. ";
    }
    
    // BMI-specific recommendations
    if (category === 'Underweight') {
      nlpRecommendations += "For underweight individuals: Focus on nutrient-dense foods, healthy fats, and protein. Consider strength training to build muscle.";
    } else if (category === 'Normal weight') {
      nlpRecommendations += "For normal weight individuals: Maintain your balanced diet and regular physical activity. Focus on fitness goals rather than weight changes.";
    } else if (category === 'Overweight') {
      nlpRecommendations += "For overweight individuals: Consider a moderate caloric deficit (300-500 calories/day) and increased physical activity. Focus on sustainable lifestyle changes.";
    } else {
      nlpRecommendations += "For individuals with obesity: Consider consulting with a healthcare provider about a comprehensive weight management plan. Focus on health improvements rather than just weight loss.";
    }

    setRecommendations(nlpRecommendations);
  };

  const handleUserMessage = async () => {
    if (!userInput.trim()) return;
    
    setLoading(true);
    const messageText = userInput;
    setUserInput('');
    setChatHistory(prev => [...prev, { type: 'user', content: messageText }]);
    
    // Process with NLP
    const nlpResults = processNLP(messageText);
    setDetectedIntents(nlpResults.intents);
    setEntityList(nlpResults.entities);
    
    // Create user profile from current data
    const userProfile = {
      bmi: bmi,
      age: age,
      gender: gender
    };
    
    // Generate NLP-based response
    const nlpResponse = generateNLPResponse(nlpResults.intents, nlpResults.entities, userProfile);
    
    // If we have good NLP coverage, use that response
    if (nlpResults.intents.length > 0 || nlpResults.entities.length > 0) {
      setChatHistory(prev => [...prev, { 
        type: 'assistant', 
        content: nlpResponse,
        nlpData: {
          intents: nlpResults.intents,
          entities: nlpResults.entities
        }
      }]);
      setLoading(false);
      return;
    }
    
    // Fall back to generative AI for complex or uncovered queries
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyDg6Ho6LTTjg6gxRy1PuWgTbeo7NopYZVE');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a knowledgeable health assistant. 
      
      User context:
      BMI: ${bmi || 'Not provided'}
      Age: ${age || 'Not provided'}
      Gender: ${gender || 'Not provided'}
      
      User question: ${messageText}
      
      Provide a helpful, accurate, and concise response that's personalized to their context if available. 
      Keep your response under 150 words and recommend consulting healthcare professionals for medical concerns.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChatHistory(prev => [...prev, { 
        type: 'assistant', 
        content: text,
        source: 'generative'
      }]);
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
          {/* Enhanced BMI Calculator Section */}
          <Card className="border-pink-100 shadow-lg">
            <CardHeader className="border-b border-pink-100">
              <div className="flex items-center">
                <Calculator className="w-5 h-5 text-pink-500 mr-2" />
                <h2 className="text-xl font-semibold text-pink-500">BMI Calculator</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-pink-600 mb-1">Age</label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age"
                    className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-pink-600 mb-1">Gender</label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="border-pink-200 focus:border-pink-500 focus:ring-pink-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
              
              {recommendations && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center mb-2">
                    <Activity className="w-4 h-4 text-purple-500 mr-2" />
                    <h3 className="font-medium text-purple-700">Personalized Recommendations</h3>
                  </div>
                  <p className="text-purple-800 text-sm">{recommendations}</p>
                </div>
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
                  <div key={index} className="mb-2">
                    <div className={`p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-pink-100 ml-auto max-w-[80%] text-pink-800' 
                        : msg.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-100'
                        : 'bg-purple-50 mr-auto max-w-[80%] text-purple-800'
                    }`}>
                      {msg.content}
                    </div>
                    
                    {/* Show NLP data for assistant messages */}
                    {msg.type === 'assistant' && msg.nlpData && (
                      <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-1">
                        {msg.nlpData.intents.map((intent, i) => (
                          <span key={i} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {intent.replace('_', ' ')}
                          </span>
                        ))}
                        {msg.nlpData.entities.map((entity, i) => (
                          <span key={i} className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                            {entity.value}
                          </span>
                        ))}
                      </div>
                    )}
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