const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GET /api/tasks - sorted due date
app.get('/api/tasks', async (req, res) => {
  try {
    const { status, priority } = req.query;
    const conditions = [];
    const values = [];

    if (status === 'pending') {
      conditions.push('is_done = FALSE');
    } else if (status === 'done') {
      conditions.push('is_done = TRUE');
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      values.push(priority);
      conditions.push(`priority = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM tasks
      ${whereClause}
      ORDER BY due_date ASC NULLS LAST, id ASC
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id - single task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks - create task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, due_date, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, priority)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), description || null, due_date || null, priority]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - full update 
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, priority, is_done } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, due_date = $3, priority = $4, is_done = $5
       WHERE id = $6
       RETURNING *`,
      [title.trim(), description || null, due_date || null, priority, !!is_done, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - remove
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`Task Tracker API running on http://localhost:${PORT}`);
});