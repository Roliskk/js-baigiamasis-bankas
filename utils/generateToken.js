const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  if (!user || !user._id || !user.username || !user.role) {
    throw new Error('Nepakanka vartotojo informacijos tokeno generavimui.');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET neapibrėžtas. Patikrink .env failą.');
  }

  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );
};

module.exports = generateToken;

