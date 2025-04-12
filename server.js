const express = require('express');
const cors = require('cors');
const workoutRoutes = require('./routes/WorkoutRoutes');

const app = express();

// ✅ CORS setup (your frontend domain)
app.use(cors({
  origin: 'https://zane-fit-sharonzane01s-projects.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));


// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Workout routes
app.use('/api/workout', workoutRoutes);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
