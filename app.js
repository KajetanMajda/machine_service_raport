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

// Endpoint do dodawania zdjęcia do istniejącego raportu
app.post('/api/reports/:id/photo', upload.array('pictures', 10), (req, res) => {
  const data = readData();
  const reportId = parseInt(req.params.id, 10);
  const reportIndex = data.maintenance.findIndex(report => report.id === reportId);

  if (reportIndex !== -1) {
    const existingPictures = data.maintenance[reportIndex].pictures || [];
    const newPictures = req.files ? req.files.map(file => file.filename) : [];

    data.maintenance[reportIndex].pictures = [...existingPictures, ...newPictures];
    writeData(data);
    res.json({ id: reportId });
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// Endpoint do aktualizacji istniejącego raportu
app.put('/api/reports/:id/edit', (req, res) => {
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
app.delete('/api/reports/:id/image/:path', (req, res) => {
  const { id, path } = req.params;
  const data = readData();
  const reportIndex = data.maintenance.findIndex(report => report.id === parseInt(id));

  if (reportIndex === -1) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const report = data.maintenance[reportIndex];

  const decodedPath = decodeURIComponent(path);
  const imageIndex = report.pictures.indexOf(decodedPath);
  if (imageIndex === -1) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  report.pictures.splice(imageIndex, 1);
  writeData(data);
  
  res.status(204).end();
});

// Endpoint do wyswitlania wraz z filtrami
app.get('/api/report/category/:category/year/:year?/status/:status?', (req, res) => {
  const data = readData();
  const { category, year, status } = req.params;

  let filteredReports = data.maintenance.filter(report => report.category === category);

  if (year && year !== 'null') {
    filteredReports = filteredReports.filter(report => {
      const startDate = new Date(report.start_date);
      const endDate = new Date(report.end_date);
      const reportYearStart = startDate.getFullYear();
      const reportYearEnd = endDate.getFullYear();

      return reportYearStart == year || reportYearEnd == year;
    });
  }

  if (status && status !== 'null') {
    filteredReports = filteredReports.filter(report => report.status === status);
  }

  res.json({ maintenance: filteredReports });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(basePath, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});