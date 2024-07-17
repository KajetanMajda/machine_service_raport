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

// Wczytanie danych z pliku JSON
const readData = () => {
  if (fs.existsSync(dataFilePath)) {
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  }
  return { maintenance: [] }; // Return an empty array if file doesn't exist
};

const writeData = (data) => fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

// Endpoint do pobierania wszystkich raportów lub filtracji po kategorii
app.get('/api/reports', (req, res) => {
  const data = readData();
  const { category, sort, order } = req.query;
  let reports = category ? data.maintenance.filter(report => report.category === category) : data.maintenance;

  if (sort && order) {
    reports = reports.sort((a, b) => {
      if (sort === 'description' || sort === 'comments') {
        const textA = a[sort].toUpperCase();
        const textB = b[sort].toUpperCase();
        if (textA < textB) return order === 'asc' ? -1 : 1;
        if (textA > textB) return order === 'asc' ? 1 : -1;
        return 0;
      } else if (sort === 'start_date' || sort === 'end_date') {
        const dateA = new Date(a[sort]);
        const dateB = new Date(b[sort]);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sort === 'status') {
        const statusOrder = ['Brak statusu', 'Do zrobienia', 'W trakcie', 'Zrobione'];
        return order === 'asc' ? statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) : statusOrder.indexOf(b.status) - statusOrder.indexOf(a.status);
      }
      return 0;
    });
  }

  res.json({ maintenance: reports });
});


// Endpoint do dodawania nowego raportu
app.post('/api/reports', upload.array('pictures', 10), (req, res) => {
  const { description, start_date, end_date, status, comments } = req.body;
  const category = req.body.category || 'Unknown';
  const data = readData();
  const newReport = {
    id: data.maintenance.length + 1,
    category,
    description,
    start_date,
    end_date,
    status,
    comments,
    pictures: req.files ? req.files.map(file => `${file.filename}`) : []
  };
  data.maintenance.push(newReport);
  writeData(data);
  res.json({ id: newReport.id });
});

// Endpoint do aktualizacji istniejącego raportu
app.put('/api/reports/:id', (req, res) => {
  const data = readData();
  const reportId = parseInt(req.params.id, 10);
  const reportIndex = data.maintenance.findIndex(report => report.id === reportId);

  if (reportIndex !== -1) {
    const { description, start_date, end_date, status, comments } = req.body;
    data.maintenance[reportIndex] = {
      ...data.maintenance[reportIndex],
      description,
      start_date,
      end_date,
      status,
      comments
    };
    writeData(data);
    res.json(data.maintenance[reportIndex]);
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// Endpoint do usuwania raportu
app.delete('/api/reports/:id', (req, res) => {
  const data = readData();
  const reportId = parseInt(req.params.id, 10);
  const newReports = data.maintenance.filter(report => report.id !== reportId);

  if (newReports.length === data.maintenance.length) {
    return res.status(404).json({ error: 'Report not found' });
  }

  data.maintenance = newReports;
  writeData(data);
  res.status(204).end();
});

// Endpoint do usuwania zdjęcia z raportu
app.delete('/api/reports/:id/image', (req, res) => {
  const { id } = req.params;
  const { path } = req.body;

  const data = readData();
  const reportIndex = data.maintenance.findIndex(report => report.id === parseInt(id));

  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }

  data.maintenance[reportIndex].pictures = data.maintenance[reportIndex].pictures.filter(picture => picture !== path);

  writeData(data);
  res.status(204).end();
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(basePath, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});