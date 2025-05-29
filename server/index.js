const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const accountRoutes = require('./routes/accountRoutes');
const userRoutes = require('./routes/userRoutes'); // 🟢 nauja

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/bankas')
  .then(() => console.log('Prisijungta prie MongoDB'))
  .catch(err => console.error('MongoDB klaida:', err));

app.use('/api', accountRoutes);
app.use('/api', userRoutes); // 🟢 nauja

const PORT = 5000;
app.listen(PORT, () => console.log(`Serveris veikia http://localhost:${PORT}`));
