const Account = require('../models/Accounts');
const iban = require('iban');

function generateLithuanianIBAN() {
  const bankCode = '70440';
  const accountPart = Math.floor(Math.random() * 1e11).toString().padStart(11, '0');
  let ibanBase = 'LT00' + bankCode + accountPart;
  return iban.electronicFormat(iban.fromBBAN('LT', ibanBase.slice(4)));
}

const createAccount = async (req, res) => {
  const { firstName, lastName, personalId } = req.body;

  try {
    const exists = await Account.findOne({ personalId });
    if (exists) return res.status(400).json({ error: 'Asmens kodas jau naudojamas.' });

    const newAccount = new Account({
      firstName,
      lastName,
      personalId,
      accountNumber: generateLithuanianIBAN(),
      balance: 0
    });

    await newAccount.save();
    res.status(201).json({ message: 'Sąskaita sukurta sėkmingai.', account: newAccount });
  } catch (error) {
    res.status(500).json({ error: 'Serverio klaida.' });
  }
};

module.exports = {
  createAccount
};
