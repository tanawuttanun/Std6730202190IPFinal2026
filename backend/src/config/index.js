// Central configuration. Values come from backend/.env (see .env.example).
// Nothing here is required: without a .env file the API runs with in-memory data.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const env = process.env;

const db = {
  host: env.DB_HOST || '',
  port: Number(env.DB_PORT) || 3306,
  user: env.DB_USER || '',
  password: env.DB_PASSWORD || '',
  database: env.DB_NAME || '',
  table: env.DB_TABLE || 'TanaHom_202190',
  connectTimeout: Number(env.DB_CONNECT_TIMEOUT_MS) || 5000,
};
db.enabled = Boolean(db.host && db.user && db.database);

module.exports = {
  port: Number(env.PORT) || 3000,

  auth: {
    // Fixed credentials required by the exam specification.
    username: 'admin',
    password: 'password123',
    token: 'mock-jwt-token',
    // true -> /api/employees* requires "Authorization: Bearer mock-jwt-token"
    required: env.REQUIRE_AUTH === 'true',
  },

  db,
  // true -> refuse to start if MySQL is configured but unreachable
  // false (default) -> fall back to in-memory data so the API always starts
  dbRequired: env.DB_REQUIRED === 'true',

  limits: {
    maxSalary: 100_000_000,
    maxTextLength: 100,
  },
};
