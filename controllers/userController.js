const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '_id username role');
        res.json(users);
    } catch (error) {
        console.error('Klaida gaunant vartotojus:', error);
        res.status(500).json({ message: 'Serverio klaida gaunant vartotojus.' });
    }
};

const registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Prašome įvesti vartotojo vardą ir slaptažodį.' });
    }

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(409).json({ message: 'Vartotojas su tokiu vartotojo vardu jau egzistuoja.' });
        }

        const user = await User.create({
            username,
            password,
            role: role || 'user',
        });

        if (user) {
            res.status(201).json({
                message: 'Vartotojas sėkmingai užregistruotas.',
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                },
            });
        } else {
            res.status(400).json({ message: 'Nepavyko užregistruoti vartotojo.' });
        }
    } catch (error) {
        console.error('Klaida registruojant vartotoją:', error);
        res.status(500).json({ message: 'Serverio klaida registruojant vartotoją.', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Prašome įvesti vartotojo vardą ir slaptažodį.' });
    }

    try {
        console.log("Gaunamas username:", username);
        console.log("Gaunamas password:", password);

        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                message: 'Prisijungimas sėkmingas.',
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                },
                token: generateToken(user)
            });
        } else {
            res.status(401).json({ message: 'Neteisingas vartotojo vardas arba slaptažodis.' });
        }

    } catch (error) {
        console.error('Klaida prisijungiant vartotojui:', error);
        res.status(500).json({ message: 'Serverio klaida prisijungiant vartotojui.', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers
};
