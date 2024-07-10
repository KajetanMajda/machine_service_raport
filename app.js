const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();

app.use(express.json());

const isPkg = typeof process.pkg !== 'undefined';
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;

app.use(express.static(path.join(basePath, 'public')));
app.use('/uploads', express.static(path.join(basePath, 'uploads')));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(basePath, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

const dataFilePath = path.join(basePath, 'data.json');

if (!fs.existsSync(dataFilePath)) {
  const initialData = {
    maintenance: [
      {
        id: 1,
        category: "Skoda",
        description: "testets",
        start_date: "12-12-2012",
        end_date: "12-12-2013",
        comments: "hsudhaosd",
        pictures: "path/to/picture1.jpg"
      }
    ]
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
}

// Wczytanie danych z pliku JSON
const readData = () => JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

// Endpoint do pobierania wszystkich raportów lub filtracji po kategorii
app.get('/api/reports', (req, res) => {
  const data = readData();
  const category = req.query.category;
  const reports = category ? data.maintenance.filter(report => report.category === category) : data.maintenance;
  res.json({ maintenance: reports });
});

app.post('/api/reports', upload.array('pictures', 10), (req, res) => {
  const { description, start_date, end_date, comments } = req.body;
  const category = req.body.category || 'Unknown';
  const data = readData();
  const newReport = {
    id: data.maintenance.length + 1,
    category,
    description,
    start_date,
    end_date,
    comments,
    pictures: req.files ? req.files.map(file => `${file.filename}`) : []
  };
  data.maintenance.push(newReport);
  writeData(data);
  res.json({ id: newReport.id });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(basePath, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});