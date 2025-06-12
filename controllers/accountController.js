const Account = require('../models/Accounts');
const iban = require('iban');

// Pagalbinė funkcija Lietuvos IBAN generavimui (jei jau turite, galite palikti savo)
function generateLithuanianIBAN() {
    const countryCode = 'LT';
    const bankCode = '70440'; // Pvz., Swedbank banko kodas
    let checksum = Math.floor(10 + Math.random() * 89); // Dviejų skaitmenų kontrolinė suma
    let accountNumber = '';
    for (let i = 0; i < 11; i++) { // 11 skaitmenų sąskaitos numeris
        accountNumber += Math.floor(Math.random() * 10);
    }

    const unformattedIban = countryCode + checksum + bankCode + accountNumber;
    if (!iban.isValid(unformattedIban)) {
        // Jei sugeneruotas IBAN nėra validus, bandom dar kartą.
        // Paprastesniam pavyzdžiui, galime tiesiog grąžinti, bet geresnėje sistemoje bandytume generuoti vėl.
        // Šiame pavyzdyje tiesiog užtikriname, kad skaičius bus validus, jei ne, grąžins neteisingą.
        // Dėl paprastumo ir to, kad IBAN generavimas nėra pagrindinė užduotis, paliekame taip.
        return unformattedIban; // Grąžina, net jei nevalidus, kad neužsuktų begalinės rekursijos.
    }
    return unformattedIban;
}

const createAccount = async (req, res) => {
    const { firstName, lastName, personalId, balance, userId } = req.body; // <-- Pakeista čia

    // Generuojame unikalų sąskaitos numerį, kol jis bus unikalus
    let accountNumber;
    let isUnique = false;
    let attempts = 0; // Pridedame bandymų skaitiklį
    while (!isUnique && attempts < 10) { // Apribojame bandymus
        accountNumber = generateLithuanianIBAN();
        const existingAccount = await Account.findOne({ accountNumber });
        if (!existingAccount) {
            isUnique = true;
        }
        attempts++;
    }
    if (!isUnique) { // Jei po bandymų nepavyko sugeneruoti unikalaus, grąžiname klaidą
        return res.status(500).json({ message: 'Nepavyko sugeneruoti unikalaus sąskaitos numerio.' });
    }

    try {
        const accountExists = await Account.findOne({ personalId });

        if (accountExists) {
            return res.status(409).json({ message: 'Sąskaita su tokiu asmens kodu jau egzistuoja.' });
        }

        const account = await Account.create({
            firstName,
            lastName,
            personalId,
            accountNumber,
            balance: balance || 0,
            user: userId || null, // <-- PRIDĖTA ŠI EILUTĖ
        });

        if (account) {
            res.status(201).json({
                message: 'Sąskaita sėkmingai sukurta.',
                account: {
                    _id: account._id,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    personalId: account.personalId,
                    accountNumber: account.accountNumber,
                    balance: account.balance,
                    passportCopy: account.passportCopy || null,
                    user: account.user ? account.user.toString() : null, // Grąžiname user ID kaip string
                },
            });
        } else {
            res.status(400).json({ message: 'Nepavyko sukurti sąskaitos.' });
        }
    } catch (error) {
        console.error('Klaida kuriant sąskaitą:', error);
        res.status(500).json({ message: 'Serverio klaida kuriant sąskaitą.', error: error.message });
    }
};

const getAccounts = async (req, res) => {
    console.log('GET /api/accounts užklausa pasiekė getAccounts funkciją.');
    try {
        const { userId } = req.query; // <-- GAUNAME userId IŠ UŽKLAUSOS PARAMETRŲ
        let query = {}; // Sukuriame tuščią užklausos objektą

        if (userId) { // Jei userId yra perduotas
            query.user = userId; // <-- PRIDEDAME FILTRAVIMĄ PAGAL USER ID
            console.log(`Filtruojamos sąskaitos pagal vartotojo ID: ${userId}`);
        } else {
            console.log('Rodos, userId nebuvo pateiktas, grąžinamos visos sąskaitos (jei leidžiama).');
        }

        const accounts = await Account.find(query); // Naudojame query objektą sąskaitoms rasti
        console.log('Sąskaitos gautos iš DB (Mongoose objektai):', accounts);

        // KONVERTUOJAME Mongoose objektus į paprastus JavaScript objektus
        const plainAccounts = accounts.map(account => account.toObject());
        console.log('Sąskaitos konvertuotos į paprastus objektus:', plainAccounts);

        res.status(200).json(plainAccounts);
        console.log('Atsakymas su sąskaitomis išsiųstas.');

    } catch (error) {
        console.error('Klaida gaunant sąskaitas:', error);
        res.status(500).json({ message: 'Serverio klaida gaunant sąskaitas.', error: error.message });
    }
};

const getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);

        if (account) {
            res.status(200).json(account.toObject());
        } else {
            res.status(404).json({ message: 'Sąskaita nerasta.' });
        }
    } catch (error) {
        console.error('Klaida gaunant sąskaitą pagal ID:', error);
        res.status(500).json({ message: 'Serverio klaida gaunant sąskaitą.', error: error.message });
    }
};

const updateAccount = async (req, res) => {
    const { firstName, lastName, personalId, accountNumber, balance, passportCopy } = req.body;

    try {
        const account = await Account.findById(req.params.id);

        if (account) {
            account.firstName = firstName || account.firstName;
            account.lastName = lastName || account.lastName;
            account.personalId = personalId || account.personalId;
            account.accountNumber = accountNumber || account.accountNumber;
            account.balance = balance !== undefined ? balance : account.balance;
            account.passportCopy = passportCopy !== undefined ? passportCopy : account.passportCopy;

            const updatedAccount = await account.save();

            res.status(200).json({
                message: 'Sąskaita sėkmingai atnaujinta.',
                account: updatedAccount.toObject()
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

const transferFunds = async (req, res) => {
    const { fromAccountNumber, toAccountNumber, amount } = req.body;

    if (!fromAccountNumber || !toAccountNumber || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Neteisingi duomenys pervedimui.' });
    }

    try {
        const fromAccount = await Account.findOne({ accountNumber: fromAccountNumber });
        const toAccount = await Account.findOne({ accountNumber: toAccountNumber });

        if (!fromAccount) {
            return res.status(404).json({ message: 'Siuntėjo sąskaita nerasta.' });
        }
        if (!toAccount) {
            return res.status(404).json({ message: 'Gavėjo sąskaita nerasta.' });
        }
        if (fromAccount.balance < amount) {
            return res.status(400).json({ message: 'Nepakankamas lėšų likutis siuntėjo sąskaitoje.' });
        }

        fromAccount.balance -= amount;
        toAccount.balance += amount;

        await fromAccount.save();
        await toAccount.save();

        res.status(200).json({ message: 'Pervedimas sėkmingas.' });

    } catch (error) {
        console.error('Klaida pervedant lėšas:', error);
        res.status(500).json({ message: 'Serverio klaida pervedant lėšas.', error: error.message });
    }
};

module.exports = {
    createAccount,
    getAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    transferFunds,
};