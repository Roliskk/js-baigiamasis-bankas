const User = require('../models/Users');
const bcrypt = require('bcryptjs'); // ✅ Pridėtas slaptažodžio šifravimas
const generateToken = require('../utils/generateToken');

// Gauti visus vartotojus
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '_id username role');
        res.json(users);
    } catch (error) {
        console.error('Klaida gaunant vartotojus:', error);
        res.status(500).json({ message: 'Serverio klaida gaunant vartotojus.' });
    }
};

// REGISTRACIJA
const registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Prašome įvesti vartotojo vardą ir slaptažodį.' });
    }

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'Vartotojas su tokiu vartotojo vardu jau egzistuoja.' });
        }

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

    if (!username || !password) {
        return res.status(400).json({ message: 'Prašome įvesti vartotojo vardą ir slaptažodį.' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Neteisingas vartotojo vardas arba slaptažodis' });
        }

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

module.exports = {
    registerUser,
    loginUser,
    getUsers
};
