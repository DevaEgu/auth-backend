const dns = require('dns');
dns.setServers(['8.8.8.8']);


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const enrollRoutes = require('./routes/enroll');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enroll', enrollRoutes); 

// Root route
app.get('/', (req, res) => res.json({ message: "Welcome to the Auth API" }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// DB & Server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
