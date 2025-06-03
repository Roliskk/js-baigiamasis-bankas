const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes');

const app = express();

const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json()); 
app.use((req, res, next) => {
    console.log(`Prieinanti užklausa: ${req.method} ${req.originalUrl}`);
    console.log(`Užklausos antraštės: ${JSON.stringify(req.headers, null, 2)}`);
    next(); 
});

app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);

app.use(express.static(path.join(__dirname, '../client')));

mongoose.connect('mongodb://localhost:27017/bankas')
  .then(() => console.log('Prisijungta prie MongoDB'))
  .catch(err => console.error('Klaida jungiantis prie MongoDB:', err));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Serveris veikia: http://localhost:${PORT}`);
});