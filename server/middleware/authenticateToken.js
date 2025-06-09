function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Nepateiktas žetonas (token).' });
  }

  // Kadangi nenaudojame JWT, tik patikriname ar token yra ne "fake"
  if (token === 'fakeToken') {
    return next();
  } else {
    return res.status(403).json({ message: 'Neleistinas žetonas.' });
  }
}

module.exports = authenticateToken;
