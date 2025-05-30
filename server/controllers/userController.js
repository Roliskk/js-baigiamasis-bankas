const bcrypt = require('bcrypt');
const User = require('../models/Users');

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Vartotojas jau egzistuoja' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'admin'
    });

    await newUser.save();
    res.status(201).json({ message: 'Vartotojas sukurtas sėkmingai' });

  } catch (err) {
    console.error('Registracijos klaida:', err);
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Vartotojas nerastas' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Neteisingas slaptažodis' });
    }

    res.status(200).json({ message: 'Prisijungimas sėkmingas!' });

} catch (err) {
  console.error('🔥 Prisijungimo klaida:', err.message);
  res.status(500).json({ error: err.message });
}
};

module.exports = {
  registerUser,
  loginUser
};
