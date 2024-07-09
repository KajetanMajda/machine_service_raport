const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const db = new sqlite3.Database(':memory:'); // Using an in-memory database for simplicity

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create table and insert sample data
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, surname TEXT)");
  db.run("INSERT INTO users (name, surname) VALUES ('Jan', 'Kowalski')");
  db.run("INSERT INTO users (name, surname) VALUES ('Janina', 'Kowalska')");
});

// Endpoint to get all users
app.get('/api/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// Endpoint to add a new user
app.post('/api/users', (req, res) => {
  const { name, surname } = req.body;
  db.run("INSERT INTO users (name, surname) VALUES (?, ?)", [name, surname], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
