const express = require('express');
const cors = require('cors');
const WorkoutRoutes = require('./routes/WorkoutRoutes');
const NutritionRoutes = require('./routes/NutritionRoutes');
const ProgressRoutes = require('./routes/ProgressRoutes');
const EquipmentRoutes = require('./routes/EquipmentRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://zane-fit.vercel.app', 'https://zanefit.netlify.app'],  // Added missing comma
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Routes
app.use('/api/workout', WorkoutRoutes);
app.use('/api/nutrition', NutritionRoutes);
app.use('/api/progress', ProgressRoutes);
app.use('/api/equipment', EquipmentRoutes);


// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
