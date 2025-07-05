/**
 * @typedef {Object} Todo
 * @property {string} id - Unique identifier
 * @property {string} text - Title or main text
 * @property {string} description - Detailed description
 * @property {boolean} done - Completion status
 * @property {Date|null} dueDate - Due date (optional)
 * @property {string} priority - Priority: 'low' | 'medium' | 'high'
 * @property {string[]} tags - Array of tags
 * @property {string} [createdAt] - Creation timestamp (ISO string)
 * @property {string} [updatedAt] - Update timestamp (ISO string)
 */

// Example default Todo object
export const defaultTodo = {
  id: '',
  text: '',
  description: '',
  done: false,
  dueDate: null,
  priority: 'medium',
  tags: [],
  createdAt: '',
  updatedAt: '',
}; 