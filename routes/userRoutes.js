const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getUsers } = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// Registracija
router.post('/register', registerUser);

// Prisijungimas
router.post('/login', loginUser);

// Gauti visus vartotojus (naudojama tik su JWT)
router.get('/', authenticateToken, getUsers);

module.exports = router;
