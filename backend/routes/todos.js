const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Todo = require('../models/Todo');

// Get all todos
router.get('/', async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

// Add a todo
router.post('/', async (req, res) => {
  const { text, description = '', done = false, id, dueDate = null, priority = 'medium', tags = [] } = req.body;
  const todo = new Todo({ text, description, done, id, dueDate, priority, tags });
  await todo.save();
  res.json(todo);
});

// Update a todo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text, description = '', done = false, dueDate = null, priority = 'medium', tags = [] } = req.body;
  const todo = await Todo.findOneAndUpdate(
    { id },
    { text, description, done, dueDate, priority, tags },
    { new: true }
  );
  res.json(todo);
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Todo.findOneAndDelete({ id });
  res.json({ success: true });
});

module.exports = router; 