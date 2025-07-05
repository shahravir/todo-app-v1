import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Change to your backend URL if needed

export async function fetchTodos() {
  const res = await axios.get(`${API_URL}/todos`);
  return res.data;
}

export async function addTodo(todo) {
  const res = await axios.post(`${API_URL}/todos`, todo);
  return res.data;
}

export async function updateTodo(id, updated) {
  const res = await axios.put(`${API_URL}/todos/${id}`, updated);
  return res.data;
}

export async function deleteTodo(id) {
  await axios.delete(`${API_URL}/todos/${id}`);
} 