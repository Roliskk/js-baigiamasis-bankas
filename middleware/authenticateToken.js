const jwt = require('jsonwebtoken');
const User = require('../models/Users'); // ✅ Pataisytas kelias

const protect = async (req, res, next) => {
    let token;

    // Tikriname ar yra Authorization antraštė su 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Ištraukiame tokeną
            token = req.headers.authorization.split(' ')[1];

            // Patikriname ir dekoduojame tokeną
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'slaptazodis123');

            // Pridedame vartotojo info prie request objekto (galima naudoti kitur)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Leidžiame pereiti prie kito middleware arba route
        } catch (error) {
            console.error('Tokeno klaida:', error);
            return res.status(403).json({ message: 'Neleistinas žetonas.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Nėra autorizacijos žetono.' });
    }
};

module.exports = protect;
