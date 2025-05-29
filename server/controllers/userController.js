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

module.exports = {
  registerUser
};
