"use client"
import React, { useState, useEffect } from 'react';
import { Search, X, Heart, Share2, ChevronDown, ChefHat, Clock, Users, Loader2, BrainCircuit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useRouter } from 'next/navigation';

const CulinaryCanvas = () => {
  const router = useRouter();
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState('');
  const [recipeDialog, setRecipeDialog] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipeDetails, setRecipeDetails] = useState('');
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const navigateToAI = () => {
    router.push('/ai');
  };

  const ingredientCategories = {
    'Pantry Essentials': [
      'butter', 'egg', 'garlic', 'milk', 'onion', 'sugar', 'flour', 
      'olive oil', 'garlic powder', 'white rice', 'cinnamon', 'ketchup', 
      'soy sauce', 'vanilla extract', 'baking powder', 'baking soda'
    ],
    'Vegetables & Greens': [
      'lettuce', 'spinach', 'carrot', 'tomato', 'potato', 'broccoli', 
      'bell pepper', 'cucumber', 'corn', 'celery', 'mushroom', 'zucchini',
      'sweet potato', 'asparagus', 'cauliflower'
    ],
    'Fruits': [
      'apple', 'banana', 'orange', 'lemon', 'lime', 'strawberry', 
      'blueberry', 'raspberry', 'grape', 'mango', 'pineapple', 'avocado'
    ],
    'Meat & Protein': [
      'chicken breast', 'ground beef', 'salmon', 'tuna', 'pork chop', 
      'bacon', 'shrimp', 'tofu', 'eggs', 'turkey', 'lamb', 'sausage'
    ],
    'Dairy & Alternatives': [
      'milk', 'cheese', 'yogurt', 'butter', 'cream cheese', 'heavy cream',
      'sour cream', 'almond milk', 'soy milk', 'oat milk', 'cottage cheese'
    ],
    'Grains & Pasta': [
      'rice', 'pasta', 'bread', 'quinoa', 'oats', 'flour', 'cornmeal',
      'breadcrumbs', 'couscous', 'tortilla', 'noodles'
    ],
    'Spices & Seasonings': [
      'salt', 'black pepper', 'garlic powder', 'cumin', 'paprika', 
      'cinnamon', 'oregano', 'thyme', 'basil', 'chili powder', 'ginger',
      'nutmeg', 'curry powder', 'cayenne'
    ],
    'Condiments & Sauces': [
      'mayonnaise', 'ketchup', 'mustard', 'soy sauce', 'hot sauce',
      'worcestershire sauce', 'olive oil', 'vinegar', 'honey', 'maple syrup'
    ]
  };

  const suggestedIngredients = [
    'bread', 'flour', 'lemon', 'milk', 'chive', 'heavy cream', 'cream',
    'cheddar', 'baking mix', 'dark chocolate', 'tomato sauce', 'chicken broth',
    'ground beef', 'pasta', 'rice', 'onion powder', 'vegetable oil'
  ];

  const handleAddIngredient = (ingredient) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
    }
    setInputValue('');
  };

  const handleRemoveIngredient = (ingredient) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };
   const shareToWhatsApp = (recipe) => {
    const recipeDetails = `Check out this recipe I found!\n\n*${recipe.title}*\n\nIngredients used:\n${recipe.usedIngredients.map(i => `• ${i.name}`).join('\n')}\n\nMissing ingredients:\n${recipe.missedIngredients.map(i => `• ${i.name}`).join('\n')}\n\nMade with ❤️ on Culinary Canvas`;
    
    const encodedText = encodeURIComponent(recipeDetails);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const searchRecipes = async () => {
    const apiKey = 'de00c525011a4ed999e5d8d633297f6e';
    const ingredientsList = ingredients.join(',');
    
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredientsList}&number=4&ranking=2&ignorePantry=false`
      );
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };
const getRecipeDetails = async (recipe) => {
     // Set loading state and update UI
    setLoadingRecipe(true);
    setCurrentRecipe(recipe);
    setRecipeDialog(true);
    
    try {
        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(
            'AIzaSyDg6Ho6LTTjg6gxRy1PuWgTbeo7NopYZVE'
        );
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Create a structured prompt for recipe generation
        const prompt = `
            Create a detailed recipe guide for "${recipe.title}". Include:
            1. List of ingredients with measurements 
               (considering these main ingredients: 
               ${recipe.usedIngredients.map(i => i.name).join(', ')})
            2. Step-by-step cooking instructions
            3. Estimated cooking time and number of servings
            4. Cooking tips and possible variations
            
            Format the response with clear sections and proper spacing.
            Don't use any markdown symbols like #, *, or ` 
        
        // Generate content using the AI model
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Update state with the generated recipe details
        setRecipeDetails(text);
    } catch (error) {
        // Handle errors gracefully
        setRecipeDetails(
            'Sorry, I encountered an error getting the recipe details. Please try again.'
        );
    }
    
    // Reset loading state
    setLoadingRecipe(false);
};
  useEffect(() => {
    if (ingredients.length > 0) {
      searchRecipes();
    }
  }, [ingredients]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ChefHat className="h-8 w-8 text-pink-500" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
              Culinary Canvas
            </h1>
          </div>
          <p className="text-gray-600">Transform your ingredients into culinary masterpieces</p>
          
          {/* AI Navigation Button */}
          <button 
            onClick={navigateToAI}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl flex items-center gap-2 mx-auto hover:shadow-lg transition"
          >
            <BrainCircuit className="h-5 w-5" />
            AI Recipe Assistant
          </button>
        </div>

        <div className="flex gap-6">
          {/* Left Panel - Enhanced Pantry */}
          <div className="w-1/3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Your Pantry</h2>
                <p className="text-white/80">
                  {ingredients.length} ingredients ready for creation
                </p>
              </div>
              
              <div className="p-6">
                <div className="relative mb-6">
                  <input
                    type="text"
                    className="w-full p-4 border border-gray-200 rounded-xl pl-12 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                    placeholder="Search ingredients..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        handleAddIngredient(inputValue.trim());
                      }
                    }}
                  />
                  <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                </div>

                {/* Selected Ingredients */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Your Selected Ingredients:</p>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition"
                      >
                        {ingredient}
                        <X
                          className="h-4 w-4 cursor-pointer hover:text-pink-200 transition"
                          onClick={() => handleRemoveIngredient(ingredient)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  {Object.entries(ingredientCategories).map(([category, items]) => (
                    <div key={category} className="border border-gray-100 rounded-xl hover:shadow-md transition">
                      <button
                        className="w-full p-4 flex justify-between items-center text-left font-medium text-gray-700"
                        onClick={() => setExpandedCategory(expandedCategory === category ? '' : category)}
                      >
                        {category}
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            expandedCategory === category ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedCategory === category && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                          <div className="flex flex-wrap gap-2">
                            {items.map((ingredient) => (
                              <span
                                key={ingredient}
                                className={`px-4 py-2 rounded-xl text-sm cursor-pointer transition ${
                                  ingredients.includes(ingredient)
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 hover:border-pink-500'
                                }`}
                                onClick={() => handleAddIngredient(ingredient)}
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Recipes */}
          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {recipes.length > 0 ? `${recipes.length} Delicious Possibilities` : 'Start Adding Ingredients'}
              </h2>
              <p className="text-gray-600">Select ingredients to discover recipes</p>
            </div>

            {/* Suggested Ingredients */}
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <p className="font-medium text-gray-700 mb-4">Popular Ingredients:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="px-4 py-2 rounded-xl text-sm cursor-pointer bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-300 transition"
                    onClick={() => handleAddIngredient(ingredient)}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-2 gap-6">
              {recipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-xl transition group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-pink-500 hover:text-white transition">
                          <Heart className="h-5 w-5" />
                        </button>
                        <button onClick={() => shareToWhatsApp(recipe)} className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-pink-500 hover:text-white transition">
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-2">{recipe.title}</h3>
                        <div className="flex items-center gap-4 text-white/90">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">30 min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">4 servings</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{recipe.usedIngredientCount} ingredients matched</span>
                        <button 
                          className="text-pink-500 font-medium hover:text-pink-600 transition"
                          onClick={() => getRecipeDetails(recipe)}
                        >
                          View Recipe →
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Details Dialog */}
      <Dialog open={recipeDialog} onOpenChange={setRecipeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-pink-500"/>
        {currentRecipe?.title}
      </DialogTitle>
    </DialogHeader>
    
    <div className="mt-6">
      {loadingRecipe ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
          <span className="ml-3 text-gray-600">Preparing your recipe...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src={currentRecipe?.image} 
              alt={currentRecipe?.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">30 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">4 servings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap font-medium text-gray-800">
              {recipeDetails}
            </div>
          </div>

          {/* Ingredient Tags */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Ingredients Used:</h4>
            <div className="flex flex-wrap gap-2">
              {currentRecipe?.usedIngredients.map((ingredient) => (
                <span
                  key={ingredient.id}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm"
                >
                  {ingredient.name}
                </span>
              ))}
              {currentRecipe?.missedIngredients.map((ingredient) => (
                <span
                  key={ingredient.id}
                  className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm"
                >
                  {ingredient.name}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition flex items-center justify-center gap-2">
              <Heart className="h-5 w-5" />
              Save Recipe
            </button>
            <button onClick={() => shareToWhatsApp(currentRecipe)} className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition flex items-center justify-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Recipe
            </button>
          </div>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default CulinaryCanvas;