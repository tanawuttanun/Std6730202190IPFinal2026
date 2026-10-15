const { auth } = require('../config');

// POST /api/login
const login = (req, res) => {
  const { username, password } = req.body || {};

  const valid =
    typeof username === 'string' &&
    typeof password === 'string' &&
    username.trim() === auth.username &&
    password === auth.password;

  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
  return res.status(200).json({ success: true, token: auth.token });
};

module.exports = { login };
