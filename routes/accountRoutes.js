const express = require('express');
const router = express.Router();
const Account = require('../models/Accounts');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer saugojimo konfigūracija
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Gauti sąskaitas
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { user: userId } : {}; // 🔄 Codex taisymas
        const accounts = await Account.find(filter);
        res.json(accounts);
    } catch (error) {
        console.error('Klaida gaunant sąskaitas:', error);
        res.status(500).json({ message: 'Serverio klaida.' });
    }
});

// Sukurti naują sąskaitą
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, personalId, balance, userId } = req.body;
        const accountNumber = 'LT' + Math.floor(Math.random() * 1000000000000000);
        const newAccount = new Account({ firstName, lastName, personalId, accountNumber, balance, user: userId }); // 🔄 Codex taisymas
        await newAccount.save();
        res.status(201).json({ message: 'Sąskaita sukurta.', account: newAccount });
    } catch (error) {
        console.error('Klaida kuriant sąskaitą:', error);
        res.status(500).json({ message: 'Serverio klaida.' });
    }
});

// Atnaujinti sąskaitą
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, personalId, accountNumber, balance, passportCopy } = req.body;
        const updated = await Account.findByIdAndUpdate(req.params.id, {
            firstName, lastName, personalId, accountNumber, balance, passportCopy
        }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Sąskaita nerasta.' });
        }
        res.json({ message: 'Sąskaita atnaujinta.', account: updated });
    } catch (error) {
        console.error('Klaida atnaujinant sąskaitą:', error);
        res.status(500).json({ message: 'Serverio klaida.' });
    }
});

// Trinti sąskaitą
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deleted = await Account.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Sąskaita nerasta.' });
        }
        res.json({ message: 'Sąskaita ištrinta.' });
    } catch (error) {
        console.error('Klaida trinant sąskaitą:', error);
        res.status(500).json({ message: 'Serverio klaida.' });
    }
});

// Paso kopijos įkėlimas
router.post('/:id/upload-passport', authenticateToken, upload.single('passportFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nepateiktas failas.' });
        }
        const accountId = req.params.id;
        const updated = await Account.findByIdAndUpdate(accountId, {
            passportCopy: true
        }, { new: true });

        if (!updated) {
            return res.status(404).json({ message: 'Sąskaita nerasta.' });
        }

        res.json({ message: 'Paso kopija įkelta sėkmingai.', file: req.file.filename });
    } catch (error) {
        console.error('Klaida įkeliant paso kopiją:', error);
        res.status(500).json({ message: 'Serverio klaida.' });
    }
});

module.exports = router;
