# Todo App v1

Full-stack todo application — **React Native (Expo)** frontend with an **Express + MongoDB** backend, real-time sync via Socket.IO, and offline queue support.

A reference implementation for modern delivery patterns: cross-platform UI, REST API, and live updates.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React Native, Expo, Material UI |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.IO |

## Structure

```
todo-app-v1/
├── frontend/    Expo app — todo list, sidebar, offline queue
└── backend/     Express API — todos, users, WebSocket events
```

## Getting started

**Backend:**

```bash
cd backend
npm install
npm start
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

Use Expo to run on web, iOS, or Android.

## Features

- Create, edit, and complete todos
- Real-time updates across clients
- Offline queue for resilient mobile use

---

**Ravi Shah** — Agentic engineering · Financial Services  
Hub: https://shahravir.github.io · [LinkedIn](https://www.linkedin.com/in/ravishah01/) · [Medium](https://medium.com/@shah.ravir) · [DEV](https://dev.to/shahravir)
