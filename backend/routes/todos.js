const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: String,
  done: Boolean,
  id: String, // for compatibility with frontend
}, { timestamps: true });

const Todo = mongoose.model('Todo', TodoSchema);

// Get all todos
router.get('/', async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

// Add a todo
router.post('/', async (req, res) => {
  const { text, done, id } = req.body;
  const todo = new Todo({ text, done, id });
  await todo.save();
  res.json(todo);
});

// Update a todo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { text, done } = req.body;
  const todo = await Todo.findOneAndUpdate({ id }, { text, done }, { new: true });
  res.json(todo);
});

// Delete a todo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Todo.findOneAndDelete({ id });
  res.json({ success: true });
});

module.exports = router; 