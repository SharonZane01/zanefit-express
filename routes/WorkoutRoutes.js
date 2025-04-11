const express = require('express');
const router = express.Router();

// Exercise database
const EXERCISES = {
  cardio: ['Running', 'Cycling', 'Jump Rope', 'Swimming', 'Rowing'],
  hiit: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'High Knees', 'Box Jumps'],
  strength: ['Squats', 'Deadlifts', 'Bench Press', 'Pull-ups', 'Overhead Press'],
  hypertrophy: ['Dumbbell Curls', 'Tricep Extensions', 'Lateral Raises', 'Leg Press'],
  home: ['Push-ups', 'Bodyweight Squats', 'Lunges', 'Plank', 'Burpees']
};

router.post('/', (req, res) => {
  // Validate required fields
  const requiredFields = ['age', 'height', 'weight', 'gender', 'goal', 'fitnessLevel'];
  const missingFields = requiredFields.filter(field => !(field in req.body));
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: missingFields.map(field => `${field} is required`)
    });
  }

  // Validate data types
  const numberFields = ['age', 'height', 'weight'];
  const invalidFields = numberFields.filter(field => isNaN(Number(req.body[field])));
  
  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: 'Invalid data types',
      details: invalidFields.map(field => `${field} must be a number`)
    });
  }

  try {
    // Destructure and safely parse optional arrays
    const {
      age,
      height,
      weight,
      gender,
      goal,
      fitnessLevel,
      workoutDays = 3,
      workoutDuration = 30,
      equipment = 'none'
    } = req.body;

    const injuries = Array.isArray(req.body.injuries) ? req.body.injuries : [];
    const preferences = Array.isArray(req.body.preferences) ? req.body.preferences : [];

    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    const bmiCategory = getBmiCategory(bmi);
    const tdee = calculateTDEE(age, gender, weight, height, fitnessLevel);

    const workoutPlan = {
      userProfile: {
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        gender,
        bmi,
        bmiCategory,
        tdee
      },
      planDetails: {
        goal,
        duration: 8,
        daysPerWeek: Number(workoutDays),
        sessionDuration: Number(workoutDuration),
        equipment,
        fitnessLevel
      },
      weeklySchedule: generateWeeklySchedule(
        Number(workoutDays),
        goal,
        equipment,
        fitnessLevel,
        Number(workoutDuration)
      ),
      nutrition: getNutritionPlan(goal, weight, tdee),
      recommendations: [
        `Your BMI is ${bmi} (${bmiCategory})`,
        injuries.length ? `Injury considerations: ${injuries.join(', ')}` : 'No injury considerations',
        getWorkoutFrequencyRecommendation(Number(workoutDays)),
        getEquipmentRecommendations(equipment)
      ].filter(Boolean)
    };

    res.json(workoutPlan);
  } catch (error) {
    console.error('Error generating workout plan:', error.stack || error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// --- Helper Functions ---

function calculateTDEE(age, gender, weight, height, activityLevel) {
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityFactors = {
    beginner: 1.2,
    intermediate: 1.375,
    advanced: 1.55
  };

  return Math.round(bmr * (activityFactors[activityLevel.toLowerCase()] || 1.2));
}

function generateWeeklySchedule(days, goal, equipment, fitnessLevel, duration) {
  const schedule = [];
  const workoutTypes = getWorkoutTypesForGoal(goal);
  const availableExercises = getAvailableExercises(workoutTypes, equipment, fitnessLevel);

  for (let day = 1; day <= days; day++) {
    const workoutType = getWorkoutTypeForDay(day, goal);
    const exercises = selectExercisesForWorkout(availableExercises, workoutType, fitnessLevel, duration);

    schedule.push({
      dayNumber: day,
      dayName: getDayName(day),
      workoutType,
      focusAreas: getFocusAreas(workoutType),
      durationMinutes: duration,
      exercises: exercises.map(exercise => ({
        name: exercise,
        sets: getSets(fitnessLevel),
        reps: getReps(goal, fitnessLevel),
        rest: getRestPeriod(goal, fitnessLevel),
        notes: getExerciseNotes(exercise, fitnessLevel)
      }))
    });
  }

  return schedule;
}

function getNutritionPlan(goal, weight, tdee) {
  const proteinPerKg = {
    'lose weight': 2.2,
    'build muscle': 2.5,
    'strength': 2.3,
    'endurance': 1.8,
    'default': 1.6
  };

  const proteinFactor = proteinPerKg[goal.toLowerCase()] || proteinPerKg.default;
  const protein = Math.round(proteinFactor * weight);
  const calories = goal.toLowerCase() === 'lose weight' ? tdee - 500 :
                   goal.toLowerCase() === 'build muscle' ? tdee + 250 : tdee;

  return {
    dailyCalories: calories,
    macronutrients: {
      protein: `${protein}g`,
      carbohydrates: `${Math.round((calories * 0.4) / 4)}g`,
      fats: `${Math.round((calories * 0.3) / 9)}g`
    },
    mealFrequency: '5-6 small meals per day',
    hydration: '3-4 liters of water daily'
  };
}

function getWorkoutTypesForGoal(goal) {
  const types = {
    'lose weight': ['cardio', 'hiit', 'strength'],
    'build muscle': ['strength', 'hypertrophy'],
    'strength': ['strength'],
    'endurance': ['cardio', 'hiit'],
    'default': ['strength', 'cardio']
  };
  return types[goal.toLowerCase()] || types.default;
}

function getAvailableExercises(types, equipment, fitnessLevel) {
  let exercises = [];
  types.forEach(type => {
    if (EXERCISES[type]) {
      exercises = exercises.concat(EXERCISES[type]);
    }
  });

  if (equipment === 'none') {
    exercises = exercises.filter(ex => EXERCISES.home.includes(ex));
  } else if (equipment === 'basic') {
    exercises = exercises.filter(ex => !['Deadlifts', 'Bench Press'].includes(ex));
  }

  return [...new Set(exercises)];
}

function selectExercisesForWorkout(availableExercises, workoutType, fitnessLevel, duration) {
  const count = Math.min(
    Math.floor(duration / 10),
    fitnessLevel === 'beginner' ? 5 :
    fitnessLevel === 'intermediate' ? 6 : 7
  );

  let filtered = availableExercises;
  if (workoutType === 'Upper Body') {
    filtered = filtered.filter(ex => !['Squats', 'Deadlifts', 'Leg Press', 'Lunges'].includes(ex));
  } else if (workoutType === 'Lower Body') {
    filtered = filtered.filter(ex => !['Push-ups', 'Pull-ups', 'Bench Press', 'Overhead Press'].includes(ex));
  }

  return [...filtered].sort(() => 0.5 - Math.random()).slice(0, count);
}

function getSets(fitnessLevel) {
  return fitnessLevel === 'beginner' ? '3' :
         fitnessLevel === 'intermediate' ? '3-4' : '4-5';
}

function getReps(goal, fitnessLevel) {
  goal = goal.toLowerCase();
  return goal === 'build muscle' ? '8-12' :
         goal === 'strength' ? '4-6' :
         fitnessLevel === 'beginner' ? '10-12' : '12-15';
}

function getRestPeriod(goal, fitnessLevel) {
  goal = goal.toLowerCase();
  return goal === 'strength' ? '2-3 minutes' :
         fitnessLevel === 'beginner' ? '30-60 seconds' : '60-90 seconds';
}

function getWorkoutTypeForDay(day, goal) {
  goal = goal.toLowerCase();
  if (goal === 'lose weight') {
    return day % 2 === 0 ? 'HIIT' : 'Strength';
  } else if (goal === 'endurance') {
    return day % 2 === 0 ? 'Cardio' : 'HIIT';
  }
  return day % 2 === 0 ? 'Upper Body' : 'Lower Body';
}

function getFocusAreas(workoutType) {
  const focus = {
    'Upper Body': ['Chest', 'Back', 'Shoulders', 'Arms'],
    'Lower Body': ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    'HIIT': ['Full Body', 'Cardio'],
    'Cardio': ['Cardiovascular'],
    'Strength': ['Compound Movements']
  };
  return focus[workoutType] || ['General Fitness'];
}

function getDayName(dayNumber) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[(dayNumber - 1) % 7];
}

function getBmiCategory(bmi) {
  bmi = parseFloat(bmi);
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function getWorkoutFrequencyRecommendation(days) {
  if (days < 3) return 'Consider increasing to at least 3 days per week for better results';
  if (days > 5) return 'Make sure to include rest days for recovery';
  return 'Good workout frequency for your level';
}

function getEquipmentRecommendations(equipment) {
  return equipment === 'none' ? 'Consider investing in resistance bands for more exercise variety' : '';
}

function getExerciseNotes(exercise, fitnessLevel) {
  const notes = {
    'Deadlifts': 'Maintain straight back, engage core',
    'Squats': 'Keep knees behind toes, chest up',
    'Bench Press': 'Retract shoulder blades, arch back slightly',
    'Pull-ups': 'Start with assisted if needed, focus on full range'
  };

  return notes[exercise] || 
    (fitnessLevel === 'beginner' ? 'Start with light weight, focus on form' : 'Adjust weight to challenge yourself');
}

module.exports = router;
