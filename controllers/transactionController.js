const Transaction = require('../models/Transaction');
const User = require('../models/Users');

const createTransaction = async (req, res) => {
  const { senderId, receiverId, amount, description } = req.body;

  if (!senderId || !receiverId || !amount) {
    return res.status(400).json({ message: 'Būtini visi laukai: siuntėjas, gavėjas, suma.' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Suma turi būti didesnė už nulį.' });
  }

  try {
    // Patikrinam ar vartotojai egzistuoja
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Siuntėjas arba gavėjas nerastas.' });
    }

    // ❗ Čia galėtum tikrinti ar siuntėjo sąskaitoje pakanka lėšų

    // Sukuriam transakciją
    const transaction = await Transaction.create({
      sender: senderId,
      receiver: receiverId,
      amount,
      description,
    });

    res.status(201).json({
      message: 'Transakcija sėkmingai įrašyta.',
      transaction,
    });
  } catch (error) {
    console.error('Klaida kuriant transakciją:', error);
    res.status(500).json({ message: 'Serverio klaida.', error: error.message });
  }
};

const getUserTransactions = async (req, res) => {
  const { userId } = req.params;

  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ]
    }).populate('sender', 'username').populate('receiver', 'username').sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Klaida gaunant transakcijas:', error);
    res.status(500).json({ message: 'Nepavyko gauti transakcijų.' });
  }
};

module.exports = {
  createTransaction,
  getUserTransactions,
};
