// server.js
const express = require('express');
const cors = require('cors');
const workoutRoutes = require('./routes/WorkoutRoutes'); // Import workoutRoutes

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Define the route that listens for POST requests to /api/workout
app.use('/api/workout', workoutRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
