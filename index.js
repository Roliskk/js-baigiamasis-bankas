require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Prisijungta prie MongoDB");
        mongoose.set('strictQuery', false);
    })
    .catch((err) => console.error("❌ Klaida jungiantis prie DB:", err));

app.use(cors({
  origin: 'http://127.0.0.1:5500'
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`🛬 Užklausa: ${req.method} ${req.originalUrl}`);
  console.log(`🔎 Antraštės: ${JSON.stringify(req.headers, null, 2)}`);
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.get('/', (req, res) => {
    res.send('🚀 Serveris veikia!');
});

app.use(express.static(path.join(__dirname, '../client')));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Serveris veikia: http://localhost:${PORT}`);
});
