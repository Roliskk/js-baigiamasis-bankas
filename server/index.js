const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes');
const path = require('path');

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);

app.use(express.static(path.join(__dirname, '../client')));

mongoose.connect('mongodb://localhost:27017/bankas', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Prisijungta prie MongoDB'))
  .catch(err => console.error('Klaida jungiantis prie MongoDB:', err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveris veikia: http://localhost:${PORT}`);
});
const cors = require('cors');
app.use(cors());