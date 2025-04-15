const express = require('express');
const router = express.Router();

// Calculate nutrition recommendations
router.post('/calculate', (req, res) => {
  const { age, weight, height, bodyType, activityLevel, gender, goals } = req.body;

  // Validate inputs
  if (!age || !weight || !height || !bodyType || !activityLevel || !gender || !goals) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Calculate BMR (Basal Metabolic Rate)
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // Adjust for activity level
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const tdee = bmr * activityFactors[activityLevel];

  // Adjust for goals
  let calorieTarget;
  const goalFactors = {
    weight_loss: 0.85,
    maintenance: 1,
    muscle_gain: 1.15
  };
  calorieTarget = tdee * goalFactors[goals];

  // Adjust macros based on body type
  let proteinPercentage, carbsPercentage, fatsPercentage;
  
  switch(bodyType) {
    case 'ectomorph':
      proteinPercentage = 25;
      carbsPercentage = 50;
      fatsPercentage = 25;
      break;
    case 'mesomorph':
      proteinPercentage = 30;
      carbsPercentage = 40;
      fatsPercentage = 30;
      break;
    case 'endomorph':
      proteinPercentage = 35;
      carbsPercentage = 30;
      fatsPercentage = 35;
      break;
    default:
      proteinPercentage = 30;
      carbsPercentage = 40;
      fatsPercentage = 30;
  }

  // Calculate grams
  const proteinGrams = Math.round((calorieTarget * (proteinPercentage/100)) / 4);
  const carbsGrams = Math.round((calorieTarget * (carbsPercentage/100)) / 4);
  const fatsGrams = Math.round((calorieTarget * (fatsPercentage/100)) / 9);

  // Generate meal plan
  const meals = generateMealPlan(bodyType, goals, calorieTarget);

  // Generate tips
  const tips = generateTips(bodyType, goals);

  res.json({
    calories: Math.round(calorieTarget),
    protein: proteinGrams,
    proteinPercentage,
    carbs: carbsGrams,
    carbsPercentage,
    fats: fatsGrams,
    fatsPercentage,
    meals,
    tips
  });
});

function generateMealPlan(bodyType, goals, calories) {
  // This would be more sophisticated in a real app
  const mealTemplates = {
    ectomorph: {
      breakfast: ["Oatmeal with banana and nuts", "Protein shake"],
      lunch: ["Grilled chicken with rice", "Vegetables"],
      dinner: ["Salmon with sweet potato", "Green salad"],
      snacks: ["Greek yogurt", "Handful of almonds"]
    },
    mesomorph: {
      breakfast: ["Scrambled eggs with whole wheat toast", "Avocado"],
      lunch: ["Lean beef with quinoa", "Steamed vegetables"],
      dinner: ["Grilled fish with brown rice", "Roasted veggies"],
      snacks: ["Cottage cheese", "Protein bar"]
    },
    endomorph: {
      breakfast: ["Vegetable omelette", "Small portion of berries"],
      lunch: ["Grilled chicken salad with olive oil", "Quinoa"],
      dinner: ["Lean protein with steamed vegetables", "Small portion of healthy fats"],
      snacks: ["Handful of nuts", "Protein shake"]
    }
  };

  const mealTimes = [
    { time: "Breakfast", name: "Energizing Start" },
    { time: "Lunch", name: "Balanced Meal" },
    { time: "Dinner", name: "Light Finish" },
    { time: "Snacks", name: "Nutrition Boost" }
  ];

  return mealTimes.map((meal, index) => ({
    time: meal.time,
    name: meal.name,
    items: mealTemplates[bodyType][meal.time.toLowerCase()],
    calories: Math.round(calories * (index === 3 ? 0.1 : 0.3)) // 30% for main meals, 10% for snacks
  }));
}

function generateTips(bodyType, goals) {
  const tips = {
    ectomorph: [
      "Focus on calorie-dense foods to meet your high energy needs",
      "Include healthy fats like nuts, seeds, and avocados",
      "Eat frequent meals to maintain energy levels",
      "Combine proteins with carbs for optimal muscle recovery"
    ],
    mesomorph: [
      "Maintain balanced macronutrients for your versatile metabolism",
      "Time your carbs around workouts for energy and recovery",
      "Keep protein intake consistent throughout the day",
      "Vary your workouts to continue seeing progress"
    ],
    endomorph: [
      "Focus on portion control and meal timing",
      "Choose complex carbs over simple sugars",
      "Include plenty of fiber to help with satiety",
      "Consider intermittent fasting if it suits your lifestyle"
    ]
  };

  const goalTips = {
    weight_loss: [
      "Create a moderate calorie deficit (300-500 kcal)",
      "Prioritize protein to preserve muscle mass",
      "Stay hydrated to support metabolism",
      "Include strength training to maintain muscle"
    ],
    maintenance: [
      "Monitor your weight and adjust as needed",
      "Maintain consistent eating patterns",
      "Focus on food quality for optimal health",
      "Stay active to support your metabolism"
    ],
    muscle_gain: [
      "Ensure adequate protein intake (1.6-2.2g per kg of body weight)",
      "Time your nutrition around workouts",
      "Progressively increase calories as you gain",
      "Prioritize recovery with quality sleep"
    ]
  };

  return [...tips[bodyType], ...goalTips[goals]];
}

module.exports = router;