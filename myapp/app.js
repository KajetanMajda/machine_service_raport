const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbFilePath = path.join(__dirname, 'db.json');

// Inicjalizacja pliku JSON jako bazy danych
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify({ users: [] }, null, 2));
}

// Wczytanie danych z pliku JSON
const readDB = () => JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
const writeDB = (data) => fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));

// Endpoint do pobierania wszystkich użytkowników
app.get('/api/users', (req, res) => {
  const data = readDB();
  res.json({ users: data.users });
});

// Endpoint do dodawania nowego użytkownika
app.post('/api/users', (req, res) => {
  const { name, surname } = req.body;
  const data = readDB();
  const newUser = { id: data.users.length + 1, name, surname };
  data.users.push(newUser);
  writeDB(data);
  res.json({ id: newUser.id });
});

// Serwowanie strony HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
