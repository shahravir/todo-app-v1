const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  description: { type: String, default: '' },
  done: { type: Boolean, default: false },
  dueDate: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  tags: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Todo', TodoSchema); 