const os = require('os');
const config = require('./config');
const { createApp } = require('./app');
const { createEmployeeRepository } = require('./repositories');

async function main() {
  const repo = await createEmployeeRepository();
  const app = createApp(repo);

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`HR API running on http://localhost:${config.port}`);
    // LAN addresses: the Expo Go app on a phone must use one of these.
    Object.values(os.networkInterfaces())
      .flat()
      .filter((iface) => iface && iface.family === 'IPv4' && !iface.internal)
      .forEach((iface) => console.log(`  LAN: http://${iface.address}:${config.port}`));
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} is already in use. Stop the other server or set PORT in backend/.env`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  const shutdown = async () => {
    server.close();
    await repo.close().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(`Failed to start: ${err.message}`);
  process.exit(1);
});
