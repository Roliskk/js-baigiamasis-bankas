const jwt = require('jsonwebtoken');

function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ message: 'Neleistinas žetonas.' });
  }

  next();
}

function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Prašome prisijungti.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Neturite teisių atlikti šį veiksmą.' });
    }

    next();
  };
}

module.exports = {
  optionalAuthenticateToken,
  authorizeRole,
};
