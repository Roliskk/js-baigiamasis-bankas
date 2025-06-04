const Account = require('../models/Accounts');
const iban = require('iban');

function generateLithuanianIBAN() {
    const accountPart = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const bban = '70440' + accountPart;
    return iban.fromBBAN('LT', bban);
}

const createAccount = async (req, res) => {
    const { firstName, lastName, personalId, balance } = req.body;

    if (!firstName || !lastName || !personalId) {
        return res.status(400).json({ message: 'Prašome užpildyti visus privalomus laukus: vardas, pavardė, asmens kodas.' });
    }

    try {
        const exists = await Account.findOne({ personalId });
        if (exists) {
            return res.status(409).json({ message: 'Sąskaita su tokiu asmens kodu jau egzistuoja.' });
        }

        let accountNumber;
        let ibanExists = true;
        while (ibanExists) {
            accountNumber = generateLithuanianIBAN();
            const existingAccount = await Account.findOne({ accountNumber });
            if (!existingAccount) {
                ibanExists = false;
            }
        }

        const newAccount = new Account({
            firstName,
            lastName,
            personalId,
            accountNumber: accountNumber,
            balance: balance || 0,
        });

        await newAccount.save();
        res.status(201).json({ message: 'Sąskaita sukurta sėkmingai.', account: newAccount });

    } catch (error) {
        console.error('Klaida kuriant sąskaitą:', error);
        res.status(500).json({ message: 'Serverio klaida kuriant sąskaitą.', error: error.message });
    }
};

const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({});
        res.status(200).json(accounts);
    } catch (error) {
        console.error('Klaida gaunant sąskaitas:', error);
        res.status(500).json({ message: 'Serverio klaida gaunant sąskaitas.', error: error.message });
    }
};

const getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (account) {
            res.status(200).json(account);
        } else {
            res.status(404).json({ message: 'Sąskaita nerasta.' });
        }
    } catch (error) {
        console.error('Klaida gaunant sąskaitą pagal ID:', error);
        res.status(500).json({ message: 'Serverio klaida gaunant sąskaitą.', error: error.message });
    }
};

const updateAccount = async (req, res) => {
    const { firstName, lastName, personalId, balance } = req.body;

    try {
        const account = await Account.findById(req.params.id);

        if (account) {

            if (personalId && personalId !== account.personalId) {
                const personalIdExists = await Account.findOne({ personalId });
                if (personalIdExists) {
                    return res.status(409).json({ message: 'Sąskaita su tokiu asmens kodu jau egzistuoja.' });
                }
            }

            account.firstName = firstName || account.firstName;
            account.lastName = lastName || account.lastName;
            account.personalId = personalId || account.personalId;
            account.balance = typeof balance === 'number' ? balance : account.balance;

            const updatedAccount = await account.save();

            res.status(200).json({
                message: 'Sąskaita atnaujinta sėkmingai.',
                account: {
                    _id: updatedAccount._id,
                    firstName: updatedAccount.firstName,
                    lastName: updatedAccount.lastName,
                    personalId: updatedAccount.personalId,
                    accountNumber: updatedAccount.accountNumber,
                    balance: updatedAccount.balance,
                },
            });
        } else {
            res.status(404).json({ message: 'Sąskaita nerasta.' });
        }
    } catch (error) {
        console.error('Klaida atnaujinant sąskaitą:', error);
        res.status(500).json({ message: 'Serverio klaida atnaujinant sąskaitą.', error: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (account) {
            await Account.deleteOne({ _id: req.params.id });
            res.status(200).json({ message: 'Sąskaita sėkmingai ištrinta.' });
        } else {
            res.status(404).json({ message: 'Sąskaita nerasta.' });
        }
    } catch (error) {
        console.error('Klaida trinant sąskaitą:', error);
        res.status(500).json({ message: 'Serverio klaida trinant sąskaitą.', error: error.message });
    }
};

module.exports = {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
};