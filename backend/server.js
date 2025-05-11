import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:19000', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json());

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

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#000000' },
  icon: String,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

// Enhanced Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  scheduled: { type: Boolean, default: false },
  date: { type: Date, required: true, default: Date.now },
  startTime: String,
  endTime: String,
  quick: { type: Boolean, default: false },
  completedAt: Date,
  // New fields
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH'], 
    default: 'MEDIUM' 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category' 
  },
  labels: [String],
  timeSpent: { type: Number, default: 0 }, // in minutes
  dueDate: Date,
  subtasks: [{
    title: String,
    completed: { type: Boolean, default: false }
  }]
});

const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Task = mongoose.model('Task', taskSchema);

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

// Task Routes
app.post('/api/tasks', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.user._id
    });
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/api/tasks', auth, async (req, res) => {
  try {
    const { date } = req.query;
    let query = { user: req.user._id }; // Changed userId to user to match schema
    
    // If date is provided, filter tasks for that specific date
    if (date) {
      const queryDate = new Date(date).toISOString().split('T')[0];
      query = {
        ...query,
        startTime: { $regex: `^${queryDate}` } // Match tasks that start on this date
      };
    }
    
    const tasks = await Task.find(query);
    res.send(tasks);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.patch('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const task = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

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
