import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dns from 'dns';
import tasksRouter from './src/routes/tasks.js'; // Import task routes

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

process.env.PORT = 5000; // Force backend to listen on port 5000

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:19000', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json());

// Basic request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Configure DNS
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google's DNS servers

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 5,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    authSource: 'admin',
    directConnection: false,
    appName: 'assignm'
  };

  try {
    console.log('Attempting to connect to MongoDB...');
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Log connection attempt (without credentials)
    const safeUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@');
    console.log('Connecting to MongoDB:', safeUri);
    
    await mongoose.connect(uri, options);
    console.log('Successfully connected to MongoDB');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectWithRetry, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
    if (err.name === 'MongooseServerSelectionError') {
      console.error('Could not connect to MongoDB Atlas. Please check:');
      console.error('1. Your IP address is whitelisted in MongoDB Atlas');
      console.error('2. Your username and password are correct');
      console.error('3. Your cluster is running and accessible');
      console.error('4. Your network allows connections to MongoDB Atlas');
    }
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Start the connection
connectWithRetry();

// Add health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    mongodb: mongoStatus,
    timestamp: new Date().toISOString()
  });
});

// Import models
import { User } from './src/models/User.js';
import { Category } from './src/models/Category.js';
import { Task } from './src/models/Task.js';

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user = new User({
      email,
      password,
      name: username // Store the username as name
    });
    await user.save();
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    // Send response with user data
    res.status(201).send({ 
      user: { 
        email: user.email, 
        name: user.name // Include the username in response
      }, 
      token 
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid login credentials');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid login credentials');
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.send({ user: { email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Mount Task Routes
app.use('/api/tasks', tasksRouter);

// Category Routes
app.post('/api/categories', auth, async (req, res) => {
  try {
    const category = new Category({
      ...req.body,
      userId: req.user._id
    });
    await category.save();
    res.status(201).send(category);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/categories', auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id });
    res.send(categories);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
