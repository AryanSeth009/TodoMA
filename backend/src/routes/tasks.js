import express from 'express';
import { Task } from '../models/Task.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    console.log('Backend: Received task creation request with body:', req.body);
    const task = new Task({
      ...req.body,
      user: req.user._id
    });
    await task.save();
    console.log('Backend: Task saved successfully:', task);
    res.status(201).json(task);
  } catch (error) {
    console.error('Backend: Error creating task:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update task (PATCH - partial update)
router.patch('/:id', auth, async (req, res) => {
  try {
    console.log(`Backend: Received task update request for ID ${req.params.id} with body:`, req.body);
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log('Backend: Task updated successfully:', task);
    res.json(task);
  } catch (error) {
    console.error('Backend: Error updating task:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update task (PUT - full replacement or create if not exists)
router.put('/:id', auth, async (req, res) => {
  try {
    console.log(`Backend: Received task PUT request for ID ${req.params.id} with body:`, req.body);
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, upsert: true } // upsert creates the document if it doesn't exist
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log('Backend: Task PUT successful:', task);
    res.json(task);
  } catch (error) {
    console.error('Backend: Error on task PUT:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`Backend: Received task delete request for ID ${req.params.id}`);
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log('Backend: Task deleted successfully:', task._id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Backend: Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
