const express = require('express');
const { login } = require('../controllers/authController');
const { createEmployeeController } = require('../controllers/employeeController');
const { asyncHandler, requireAuth } = require('../middleware');

function createApiRouter(repo) {
  const router = express.Router();
  const employees = createEmployeeController(repo);

  router.get('/health', (req, res) => res.json({ success: true, storage: repo.kind }));

  // Phase 1: authentication
  router.post('/login', login);

  // Phase 1 + 2: employees
  router.use('/employees', requireAuth);
  // Must be declared before the "/:id" routes.
  router.get('/employees/salary-clusters', asyncHandler(employees.salaryClusters));
  router.get('/employees', asyncHandler(employees.list));
  router.post('/employees', asyncHandler(employees.create));
  router.put('/employees/:id/status', asyncHandler(employees.toggleStatus));
  router.delete('/employees/:id', asyncHandler(employees.remove));

  return router;
}

module.exports = { createApiRouter };
