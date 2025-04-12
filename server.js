const express = require('express');
const cors = require('cors');
const workoutRoutes = require('./routes/WorkoutRoutes');

const app = express();

// CORS (allow your frontend domain)
app.use(cors({
  origin: 'https://zane-fit-sharonzane01s-projects.vercel.app',
}));

// Middleware
app.use(express.json()); // To parse JSON bodies

// Routes
app.use('/api/workout', workoutRoutes);

// Health check route (optional)
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
