const { auth } = require('../config');

// Express 4 does not catch rejected promises; forward them to the error handler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
};

const requireAuth = (req, res, next) => {
  if (!auth.required) return next();
  if (req.headers.authorization === `Bearer ${auth.token}`) return next();
  return res.status(401).json({ success: false, message: 'Unauthorized: please log in first' });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
};

const DB_DOWN_CODES = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ENOTFOUND']);

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' });
  }
  console.error(err);
  if (DB_DOWN_CODES.has(err.code)) {
    return res.status(503).json({ success: false, message: 'Database is unavailable, please try again' });
  }
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = { asyncHandler, requestLogger, requireAuth, notFound, errorHandler };
