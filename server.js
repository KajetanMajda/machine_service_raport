const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const outPath = path.join(__dirname, 'out');

app.use(express.static(outPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(outPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
