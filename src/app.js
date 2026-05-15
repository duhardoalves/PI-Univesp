const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./config/db');
const processRoutes = require('./routes/processRoutes');
const analystRoutes = require('./routes/analystRoutes');

const app = express();
app.use(cors());

app.use(express.json());


app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use('/process', processRoutes);
app.use('/analyst', analystRoutes);

module.exports = app;
