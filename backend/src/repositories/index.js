// Picks the storage used by the API at startup.
//   - No DB settings in .env          -> in-memory (exam default)
//   - DB settings + MySQL reachable   -> MySQL
//   - DB settings + MySQL unreachable -> in-memory with a warning
//                                        (or exit, if DB_REQUIRED=true)
const config = require('../config');
const { createMemoryEmployeeRepository } = require('./memoryEmployeeRepository');
const { createMysqlEmployeeRepository } = require('./mysqlEmployeeRepository');

async function createEmployeeRepository() {
  if (!config.db.enabled) {
    console.log('Storage: in-memory (no DB settings in backend/.env)');
    return createMemoryEmployeeRepository();
  }

  const { host, port, database, table } = config.db;
  let repo;
  try {
    repo = createMysqlEmployeeRepository(config.db);
    await repo.init();
    console.log(`Storage: MySQL ${host}:${port} / ${database}.${table}`);
    return repo;
  } catch (err) {
    if (repo) await repo.close().catch(() => {});
    const reason = `${err.code || ''} ${err.message}`.trim();
    if (config.dbRequired) {
      throw new Error(`Cannot use MySQL at ${host}:${port} (${reason})`);
    }
    console.warn(`WARNING: cannot use MySQL at ${host}:${port} (${reason})`);
    console.warn('Storage: in-memory fallback (set DB_REQUIRED=true to stop instead)');
    return createMemoryEmployeeRepository();
  }
}

module.exports = { createEmployeeRepository };
