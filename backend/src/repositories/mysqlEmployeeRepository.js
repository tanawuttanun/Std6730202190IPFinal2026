// MySQL employee store (optional; enabled when DB_* variables are set in backend/.env).
const mysql = require('mysql2/promise');
const seedEmployees = require('../data/seedEmployees');

const COLUMNS = 'id, name, position, status, salary';

// API contract: id is a string, salary is a number.
const toEmployee = (row) =>
  row && {
    id: String(row.id),
    name: row.name,
    position: row.position,
    status: row.status,
    salary: Number(row.salary),
  };

// Only plain positive integers are valid ids; anything else is "not found" (404),
// never a SQL error.
const parseId = (id) => {
  const s = String(id);
  if (!/^\d{1,10}$/.test(s)) return null;
  const n = Number(s);
  return n > 0 && n <= 4294967295 ? n : null;
};

function createMysqlEmployeeRepository(dbConfig) {
  // The table name can't be a "?" placeholder, so it is whitelisted instead.
  if (!/^[A-Za-z0-9_]{1,64}$/.test(dbConfig.table)) {
    throw new Error(`Invalid DB_TABLE name: "${dbConfig.table}"`);
  }
  const table = `\`${dbConfig.table}\``;

  const pool = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectTimeout: dbConfig.connectTimeout,
    waitForConnections: true,
    connectionLimit: 5,
    charset: 'utf8mb4',
    decimalNumbers: true, // DECIMAL -> JS number (otherwise mysql2 returns strings)
  });

  const findById = async (id) => {
    const numericId = parseId(id);
    if (numericId === null) return null;
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM ${table} WHERE id = ?`, [numericId]);
    return toEmployee(rows[0]) || null;
  };

  return {
    kind: 'mysql',

    // Creates the table if needed and seeds it when empty.
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          position VARCHAR(100) NOT NULL,
          status ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active',
          salary DECIMAL(12, 2) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

      const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
      if (total === 0) {
        const values = seedEmployees.map((e) => [e.name, e.position, e.status, e.salary]);
        await pool.query(`INSERT INTO ${table} (name, position, status, salary) VALUES ?`, [values]);
      }
    },

    async findAll() {
      const [rows] = await pool.query(`SELECT ${COLUMNS} FROM ${table} ORDER BY id`);
      return rows.map(toEmployee);
    },

    findById,

    async create({ name, position, salary }) {
      const [result] = await pool.execute(
        `INSERT INTO ${table} (name, position, status, salary) VALUES (?, ?, 'Active', ?)`,
        [name, position, salary]
      );
      return findById(result.insertId);
    },

    async toggleStatus(id) {
      const numericId = parseId(id);
      if (numericId === null) return null;
      // Single atomic UPDATE: two quick taps can't leave the row in a wrong state.
      const [result] = await pool.execute(
        `UPDATE ${table} SET status = IF(status = 'Active', 'On Leave', 'Active') WHERE id = ?`,
        [numericId]
      );
      if (result.affectedRows === 0) return null;
      return findById(numericId);
    },

    async remove(id) {
      const existing = await findById(id);
      if (!existing) return null;
      const [result] = await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [Number(existing.id)]);
      // Deleted by another request in the meantime -> treat as not found.
      return result.affectedRows === 0 ? null : existing;
    },

    async close() {
      await pool.end();
    },
  };
}

module.exports = { createMysqlEmployeeRepository };
