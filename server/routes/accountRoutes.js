const express = require('express');
const router = express.Router();
const { createAccount } = require('../controllers/accountController');

router.post('/accounts', createAccount);

module.exports = router;
