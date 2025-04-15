const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage (replace with database in production)
let progressData = [];

// Get progress data with optional time range filter
router.get('/', (req, res) => {
  try {
    const { range } = req.query;
    let filteredData = [...progressData];
    
    if (range) {
      const now = new Date();
      let cutoffDate;
      
      switch(range) {
        case 'week':
          cutoffDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          cutoffDate = new Date(0); // All time
      }
      
      filteredData = progressData.filter(entry => 
        new Date(entry.date) >= cutoffDate
      );
    }
    
    res.json(filteredData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress data' });
  }
});

// Add new progress entry
router.post('/', (req, res) => {
  try {
    const { weight, bodyFat, muscleMass, waist, hips, workoutPerformance } = req.body;
    
    if (!weight && !bodyFat && !muscleMass && !waist && !hips && !workoutPerformance) {
      return res.status(400).json({ message: 'At least one metric is required' });
    }
    
    const newEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      weight: parseFloat(weight) || null,
      bodyFat: parseFloat(bodyFat) || null,
      muscleMass: parseFloat(muscleMass) || null,
      waist: parseFloat(waist) || null,
      hips: parseFloat(hips) || null,
      workoutPerformance: parseInt(workoutPerformance) || null
    };
    
    progressData.push(newEntry);
    progressData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save progress data' });
  }
});

// For demo purposes - reset data
router.delete('/reset', (req, res) => {
  progressData = [];
  res.json({ message: 'Progress data reset' });
});

// Generate demo data
router.post('/demo', (req, res) => {
  const now = new Date();
  const demoData = [];
  
  // Generate 30 days of random data
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate gradual weight loss and muscle gain
    const baseWeight = 75;
    const weight = (baseWeight - (i * 0.1) + (Math.random() * 0.5 - 0.25)).toFixed(1);
    
    const baseFat = 18;
    const bodyFat = (baseFat - (i * 0.05) + (Math.random() * 0.3 - 0.15)).toFixed(1);
    
    const baseMuscle = 32;
    const muscleMass = (baseMuscle + (i * 0.03) + (Math.random() * 0.2 - 0.1)).toFixed(1);
    
    const baseWaist = 85;
    const waist = (baseWaist - (i * 0.2) + (Math.random() * 0.5 - 0.25)).toFixed(1);
    
    const workoutPerformance = Math.floor(5 + (Math.random() * 3) + (i * 0.05));
    
    demoData.push({
      id: uuidv4(),
      date: date.toISOString(),
      weight: parseFloat(weight),
      bodyFat: parseFloat(bodyFat),
      muscleMass: parseFloat(muscleMass),
      waist: parseFloat(waist),
      hips: null,
      workoutPerformance: Math.min(10, workoutPerformance)
    });
  }
  
  progressData = demoData;
  res.json({ message: 'Demo data generated', count: demoData.length });
});

module.exports = router;