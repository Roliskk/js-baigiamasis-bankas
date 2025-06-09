const express = require('express');
const router = express.Router();

const {
  createTransaction,
  getUserTransactions
} = require('../controllers/transactionController');

router.post('/', createTransaction);

router.get('/:userId', getUserTransactions);

module.exports = router;
