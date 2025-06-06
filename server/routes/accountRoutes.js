const express = require('express');
const router = express.Router();
const { createAccount, getAccounts, getAccountById, updateAccount, deleteAccount, transferFunds } = require('../controllers/accountController');

router.post('/', createAccount);

router.get('/', getAccounts);

router.get('/:id', getAccountById);

router.put('/:id', updateAccount);

router.delete('/:id', deleteAccount);

router.post('/transfer', transferFunds);

module.exports = router;
