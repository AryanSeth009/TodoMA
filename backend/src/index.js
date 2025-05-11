import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import categoryRoutes from './routes/categories.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Development vs Production CORS configuration
const corsOptions = process.env.NODE_ENV === 'production' 
  ? {
      // Production CORS settings
      origin: process.env.FRONTEND_URL || 'https://your-production-url.com',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true
    }
  : {
      // Development CORS settings - more permissive
      origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
      optionsSuccessStatus: 200
    };

// Apply CORS middleware
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

// Add OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');

mongoose.set('debug', true); // Enable mongoose debugging

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 2000,
})
.then(() => {
  console.log('Successfully connected to MongoDB');
  console.log('Database name:', mongoose.connection.name);
})
.catch((error) => {
  console.error('MongoDB connection error details:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  if (error.reason) {
    console.error('Error reason:', error.reason);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
