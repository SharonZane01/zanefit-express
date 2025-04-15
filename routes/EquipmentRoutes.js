const express = require('express');
const router = express.Router();

// Complete exercise database for all equipment options
const exercisesDB = {
  // ===== No Equipment / Bodyweight =====
  none: [
    {
      name: "Push-ups",
      description: "Targets chest, shoulders, and triceps. Keep your body straight and lower until elbows are at 90°.",
      muscleGroup: "Upper Body",
      difficulty: "Beginner"
    },
    {
      name: "Bodyweight Squats",
      description: "Strengthens legs and glutes. Lower until thighs are parallel to the ground.",
      muscleGroup: "Lower Body",
      difficulty: "Beginner"
    },
    {
      name: "Plank",
      description: "Core stabilization exercise. Hold a straight-arm or forearm position.",
      muscleGroup: "Core",
      difficulty: "Beginner"
    },
    {
      name: "Burpees",
      description: "Full-body exercise combining squat, plank, and jump.",
      muscleGroup: "Full Body",
      difficulty: "Intermediate"
    }
  ],

  // ===== Home Equipment =====
  dumbbells: [
    {
      name: "Dumbbell Rows",
      description: "Bend at waist, pull dumbbell to hip to target upper back.",
      muscleGroup: "Back",
      difficulty: "Beginner"
    },
    {
      name: "Goblet Squats",
      description: "Hold dumbbell at chest while squatting for added resistance.",
      muscleGroup: "Legs",
      difficulty: "Intermediate"
    }
  ],
  "resistance-bands": [
    {
      name: "Band Rows",
      description: "Anchor band and pull toward waist to engage back muscles.",
      muscleGroup: "Back",
      difficulty: "Beginner"
    },
    {
      name: "Band Lateral Walks",
      description: "Place band around thighs and step sideways to activate glutes.",
      muscleGroup: "Hips",
      difficulty: "Beginner"
    }
  ],
  "yoga-mat": [
    {
      name: "Yoga Flow",
      description: "Sun salutations to improve flexibility and mobility.",
      muscleGroup: "Full Body",
      difficulty: "Beginner"
    }
  ],
  kettlebells: [
    {
      name: "Kettlebell Swings",
      description: "Hip-hinging movement to build explosive power.",
      muscleGroup: "Posterior Chain",
      difficulty: "Intermediate"
    }
  ],
  "pull-up-bar": [
    {
      name: "Pull-ups",
      description: "Grip bar wider than shoulders, pull chin over bar.",
      muscleGroup: "Back",
      difficulty: "Advanced"
    }
  ],
  "jump-rope": [
    {
      name: "Jump Rope Intervals",
      description: "30s fast jumps followed by 30s rest for cardio.",
      muscleGroup: "Cardio",
      difficulty: "Beginner"
    }
  ],
  "stability-ball": [
    {
      name: "Ball Hamstring Curls",
      description: "Lie on back, roll ball in/out with feet to target hamstrings.",
      muscleGroup: "Legs",
      difficulty: "Intermediate"
    }
  ],

  // ===== Gym Equipment =====
  "full-gym": [
    {
      name: "Custom Split Routine",
      description: "Combine machines and free weights for full-body training.",
      muscleGroup: "Full Body",
      difficulty: "All Levels"
    }
  ],
  barbell: [
    {
      name: "Bench Press",
      description: "Classic chest exercise. Lower bar to mid-chest and press up.",
      muscleGroup: "Chest",
      difficulty: "Intermediate"
    }
  ],
  "weight-plates": [
    {
      name: "Plate Front Raises",
      description: "Hold plate with both hands and raise to shoulder height.",
      muscleGroup: "Shoulders",
      difficulty: "Beginner"
    }
  ],
  bench: [
    {
      name: "Incline Dumbbell Press",
      description: "Adjust bench to 45° to target upper chest.",
      muscleGroup: "Chest",
      difficulty: "Intermediate"
    }
  ],
  "cable-machine": [
    {
      name: "Cable Flys",
      description: "Isolated chest movement with constant tension.",
      muscleGroup: "Chest",
      difficulty: "Intermediate"
    }
  ],
  "leg-press": [
    {
      name: "Leg Press",
      description: "Push platform away with legs while keeping back flat.",
      muscleGroup: "Legs",
      difficulty: "Beginner"
    }
  ],
  treadmill: [
    {
      name: "Incline Walk",
      description: "12% incline at 3mph for glute activation.",
      muscleGroup: "Cardio/Legs",
      difficulty: "Beginner"
    }
  ],
  elliptical: [
    {
      name: "Reverse Stride",
      description: "Pedal backward to target different leg muscles.",
      muscleGroup: "Cardio/Legs",
      difficulty: "Beginner"
    }
  ],
  "rowing-machine": [
    {
      name: "500m Sprints",
      description: "Powerful full-body cardio intervals.",
      muscleGroup: "Full Body",
      difficulty: "Advanced"
    }
  ],

  // ===== Specialized Equipment =====
  trx: [
    {
      name: "TRX Rows",
      description: "Lean back and pull yourself up using straps.",
      muscleGroup: "Back",
      difficulty: "Intermediate"
    }
  ],
  "battle-ropes": [
    {
      name: "Wave Slams",
      description: "Alternate arm waves for upper-body endurance.",
      muscleGroup: "Arms/Shoulders",
      difficulty: "Intermediate"
    }
  ],
  "medicine-ball": [
    {
      name: "Wall Throws",
      description: "Explosive throws to build power.",
      muscleGroup: "Core/Shoulders",
      difficulty: "Intermediate"
    }
  ],
  "plyo-box": [
    {
      name: "Box Jumps",
      description: "Explosive jumps onto box, land softly.",
      muscleGroup: "Legs",
      difficulty: "Advanced"
    }
  ],
  sandbag: [
    {
      name: "Sandbag Shouldering",
      description: "Lift bag from ground to shoulder alternately.",
      muscleGroup: "Full Body",
      difficulty: "Advanced"
    }
  ],
  sliders: [
    {
      name: "Slider Mountain Climbers",
      description: "Add instability to core exercise.",
      muscleGroup: "Core",
      difficulty: "Intermediate"
    }
  ]
};

// POST endpoint
router.post('/api/workout-suggestions', (req, res) => {
  const { equipment } = req.body;
  
  if (!equipment || !Array.isArray(equipment)) {
    return res.status(400).json({ error: "Invalid equipment list" });
  }

  try {
    const suggestedExercises = [];
    
    // Prioritize equipment-specific exercises
    equipment.forEach(equipId => {
      if (exercisesDB[equipId]) {
        suggestedExercises.push(...exercisesDB[equipId]);
      }
    });

    // Fallback to bodyweight if no equipment-specific exercises exist
    if (suggestedExercises.length === 0) {
      suggestedExercises.push(...exercisesDB.none);
    }

    // Limit to 6 exercises max for UX
    const finalExercises = suggestedExercises.slice(0, 6);
    
    res.json({ 
      success: true,
      exercises: finalExercises
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;