// src/core/todo-manager.js
// Manages local JSON persistence, CRUD, status toggling, and date filtering for user tasks.

const fs = require('fs');
const path = require('path');

class TodoManager {
  constructor() {
    this.storagePath = null;
    this.todos = [];
  }

  init(storageDir) {
    this.storagePath = path.join(storageDir, 'pandu-todos.json');
    this.load();
  }

  load() {
    if (!this.storagePath || !fs.existsSync(this.storagePath)) {
      this.todos = [];
      return;
    }
    try {
      const data = fs.readFileSync(this.storagePath, 'utf-8');
      const parsed = JSON.parse(data);
      this.todos = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Failed to load pandu-todos.json:', err);
      this.todos = [];
    }
  }

  save() {
    if (!this.storagePath) return;
    try {
      fs.writeFileSync(this.storagePath, JSON.stringify(this.todos, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save pandu-todos.json:', err);
    }
  }

  // Get todos with optional filter: 'all', 'today', 'upcoming', 'done'
  getTodos(filter = 'all') {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + (24 * 60 * 60 * 1000) - 1;

    let filtered = [...this.todos];

    if (filter === 'done') {
      filtered = filtered.filter(t => Boolean(t.done));
    } else if (filter === 'today') {
      filtered = filtered.filter(t => {
        if (t.done) return false;
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate).getTime();
        // Today or overdue
        return due <= todayEnd;
      });
    } else if (filter === 'upcoming') {
      filtered = filtered.filter(t => {
        if (t.done) return false;
        if (!t.dueDate) return true; // Tasks without due date count as backlog/upcoming
        const due = new Date(t.dueDate).getTime();
        return due > todayEnd;
      });
    } else {
      // 'all'
    }

    // Sort order:
    // 1. Pending tasks first (done: false)
    // 2. Pending tasks by priority (high > medium > low), then due date ascending (earliest first, null last)
    // 3. Completed tasks by completedAt descending
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    filtered.sort((a, b) => {
      if (a.done !== b.done) {
        return a.done ? 1 : -1;
      }
      if (!a.done) {
        const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
        if (pDiff !== 0) return pDiff;

        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else {
        return (b.completedAt || 0) - (a.completedAt || 0);
      }
    });

    return filtered;
  }

  addTodo({ title, dueDate = null, priority = 'medium' }) {
    if (!title || !title.trim()) return null;

    const cleanTitle = title.trim();
    const cleanPriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';

    let formattedDue = null;
    if (dueDate) {
      const parsed = new Date(dueDate);
      if (!isNaN(parsed.getTime())) {
        formattedDue = parsed.toISOString();
      }
    }

    const todo = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: cleanTitle,
      dueDate: formattedDue,
      priority: cleanPriority,
      done: false,
      createdAt: Date.now(),
      completedAt: null,
      notifiedSoon: false
    };

    this.todos.push(todo);
    this.save();
    return todo;
  }

  updateTodo(id, updates = {}) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return null;

    if (updates.title !== undefined && updates.title.trim()) {
      todo.title = updates.title.trim();
    }
    if (updates.priority !== undefined) {
      const p = updates.priority.toLowerCase();
      if (['low', 'medium', 'high'].includes(p)) todo.priority = p;
    }
    if (updates.dueDate !== undefined) {
      if (!updates.dueDate) {
        todo.dueDate = null;
      } else {
        const parsed = new Date(updates.dueDate);
        if (!isNaN(parsed.getTime())) {
          todo.dueDate = parsed.toISOString();
          todo.notifiedSoon = false; // Reset notification when date changes
        }
      }
    }
    if (updates.done !== undefined) {
      todo.done = Boolean(updates.done);
      todo.completedAt = todo.done ? Date.now() : null;
    }

    this.save();
    return todo;
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return null;

    todo.done = !todo.done;
    todo.completedAt = todo.done ? Date.now() : null;
    this.save();
    return todo;
  }

  deleteTodo(id) {
    const idx = this.todos.findIndex(t => t.id === id);
    if (idx === -1) return false;

    this.todos.splice(idx, 1);
    this.save();
    return true;
  }

  getStats() {
    const total = this.todos.length;
    const done = this.todos.filter(t => t.done).length;
    const pending = total - done;

    const now = Date.now();
    const todayEnd = new Date().setHours(23, 59, 59, 999);

    const overdue = this.todos.filter(t => !t.done && t.dueDate && new Date(t.dueDate).getTime() < now).length;
    const dueToday = this.todos.filter(t => {
      if (t.done || !t.dueDate) return false;
      const due = new Date(t.dueDate).getTime();
      return due >= now && due <= todayEnd;
    }).length;

    return { total, done, pending, overdue, dueToday };
  }

  // Returns tasks due within windowMinutes (e.g. 30m) that have not been notified yet
  getTasksDueSoon(windowMinutes = 30) {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const dueSoon = [];

    for (const todo of this.todos) {
      if (todo.done || !todo.dueDate || todo.notifiedSoon) continue;

      const dueTime = new Date(todo.dueDate).getTime();
      const diff = dueTime - now;

      // Due in the next `windowMinutes`, or at most 10 minutes overdue
      if (diff <= windowMs && diff >= -10 * 60 * 1000) {
        todo.notifiedSoon = true;
        dueSoon.push(todo);
      }
    }

    if (dueSoon.length > 0) {
      this.save();
    }

    return dueSoon;
  }

  isEmpty() {
    return this.todos.length === 0;
  }

  // Check if no tasks have been created, modified, or completed in the last `hours`
  hasUntouchedTasks(hours = 2) {
    if (this.todos.length === 0) return true;

    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const hasRecent = this.todos.some(t => {
      return (t.createdAt && t.createdAt > cutoff) ||
             (t.completedAt && t.completedAt > cutoff);
    });

    return !hasRecent;
  }
}

module.exports = new TodoManager();
