const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Inicializuojame .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Maršrutai
const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes');

app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);

// MongoDB prisijungimas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Prisijungta prie MongoDB debesies');
}).catch((err) => {
  console.error('❌ Klaida jungiantis prie MongoDB:', err.message);
});

// Serverio paleidimas
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Serveris paleistas: http://localhost:${PORT}`);
});
