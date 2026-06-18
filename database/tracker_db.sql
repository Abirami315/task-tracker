CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  due_date    DATE,
  priority    VARCHAR(10) NOT NULL CHECK (priority IN ('Low','Medium','High')),
  is_done     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO tasks (title, description, due_date, priority, is_done) VALUES
('Learn SQL queries', 'Create tables, insert sample data, and write basic queries', '2026-06-20', 'High', FALSE),
('Practice Python', 'Solve 3 Python coding problems on HackerRank', '2026-06-19', 'High', FALSE),
('Build Project', 'Implement CRUD operations for the application', '2026-06-18', 'High', TRUE),
('Learn PostgreSQL Indexes', 'Understand indexes and create an column', '2026-06-25', 'Medium', FALSE),
('Update GitHub Repository', 'Push latest code changes and update README documentation', '2026-06-17', 'Low', FALSE); 

SELECT * FROM tasks;


CREATE INDEX index_tasks_due
ON tasks(due_date);

SELECT * from tasks ORDER BY due_date;

UPDATE tasks SET is_done = TRUE WHERE id = 4;

DELETE FROM tasks WHERE id = 3;
