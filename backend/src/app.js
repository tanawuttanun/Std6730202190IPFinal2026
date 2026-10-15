const express = require('express');
const cors = require('cors');
const { createApiRouter } = require('./routes');
const { requestLogger, notFound, errorHandler } = require('./middleware');

// Builds the Express app around a storage repository (memory or MySQL).
function createApp(repo, { logRequests = true } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));
  if (logRequests) app.use(requestLogger);

  app.get('/', (req, res) => {
    res.json({ success: true, message: 'HR Manager & Salary Analytics API is running', storage: repo.kind });
  });
  app.use('/api', createApiRouter(repo));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
