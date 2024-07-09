const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

const isPkg = typeof process.pkg !== 'undefined';
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;

app.use(express.static(path.join(basePath, 'public')));

const dataFilePath = path.join(basePath, 'data.json');

// Inicjalizacja pliku JSON jako bazy danych
if (!fs.existsSync(dataFilePath)) {
  const initialData = {
    users: [
      { id: 1, name: 'Jan', surname: 'Kowalski' },
      { id: 2, name: 'Janina', surname: 'Kowalska' }
    ]
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
}

// Wczytanie danych z pliku JSON
const readData = () => JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

// Endpoint do pobierania wszystkich użytkowników
app.get('/api/users', (req, res) => {
  const data = readData();
  res.json({ users: data.users });
});

// Endpoint do dodawania nowego użytkownika
app.post('/api/users', (req, res) => {
  const { name, surname } = req.body;
  const data = readData();
  const newUser = { id: data.users.length + 1, name, surname };
  data.users.push(newUser);
  writeData(data);
  res.json({ id: newUser.id });
});

// Serwowanie strony HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(basePath, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
