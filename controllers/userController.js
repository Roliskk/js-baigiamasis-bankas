const User = require('../models/Users');
const bcrypt = require('bcryptjs'); // ✅ Pridėtas slaptažodžio šifravimas
const generateToken = require('../utils/generateToken');

// REGISTRACIJA
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Vartotojas jau egzistuoja' });
    }

    // Šifruojame slaptažodį prieš išsaugant vartotoją
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Vartotojas sėkmingai sukurtas',
      user: {
        _id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
      token
    });
  } catch (error) {
    console.error('Registracijos klaida:', error.message);
    res.status(500).json({ message: 'Serverio klaida registruojant vartotoją' });
  }
};

// PRISIJUNGIMAS
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Neteisingas vartotojo vardas arba slaptažodis' });
    }

    // 🔒 Patikriname slaptažodį su bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Neteisingas vartotojo vardas arba slaptažodis' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Prisijungimas sėkmingas.',
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.error('Prisijungimo klaida:', error.message);
    res.status(500).json({ message: 'Serverio klaida prisijungiant' });
  }
};

// Gauti visus vartotojus
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id username role'); // ✅ Pridėtas `role`
    res.json(users);
  } catch (error) {
    console.error('Klaida gaunant vartotojus:', error.message);
    res.status(500).json({ message: 'Klaida gaunant vartotojų sąrašą' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers
};
