const express = require('express');
const db = require('./config/db');
const processRoutes = require('./routes/processRoutes');
const analystRoutes = require('./routes/analystRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando!');
});

app.use('/process', processRoutes);
app.use('/analyst', analystRoutes);

module.exports = app;
