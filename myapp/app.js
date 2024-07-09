const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const db = new sqlite3.Database(':memory:'); // Użycie bazy danych w pamięci dla prostoty

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Tworzenie tabeli i dodawanie przykładowych danych
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, surname TEXT)");
  db.run("INSERT INTO users (name, surname) VALUES ('Jan', 'Kowalski')");
  db.run("INSERT INTO users (name, surname) VALUES ('Janina', 'Kowalska')");
});

// Endpoint do pobierania wszystkich użytkowników
app.get('/api/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      fs.appendFileSync('error.log', `Error: ${err.message}\n`);
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// Endpoint do dodawania nowego użytkownika
app.post('/api/users', (req, res) => {
  const { name, surname } = req.body;
  db.run("INSERT INTO users (name, surname) VALUES (?, ?)", [name, surname], function(err) {
    if (err) {
      fs.appendFileSync('error.log', `Error: ${err.message}\n`);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Serwowanie strony HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  fs.appendFileSync('server.log', `Server running on port ${PORT}\n`);
  console.log(`Server running on port ${PORT}`);
});
