const { validateNewEmployee } = require('../validators/employeeValidator');
const { analyzeSalaryStructure } = require('../services/salaryAnalysisService');

const notFound = (res, id) =>
  res.status(404).json({ success: false, message: `Employee with id ${id} not found` });

// Controllers receive the repository (memory or MySQL) from the app factory.
function createEmployeeController(repo) {
  return {
    // GET /api/employees
    async list(req, res) {
      const employees = await repo.findAll();
      res.status(200).json({ success: true, count: employees.length, data: employees });
    },

    // POST /api/employees
    async create(req, res) {
      const { error, value } = validateNewEmployee(req.body);
      if (error) return res.status(400).json({ success: false, message: error });

      const employee = await repo.create(value);
      return res.status(201).json({ success: true, data: employee });
    },

    // PUT /api/employees/:id/status
    async toggleStatus(req, res) {
      const employee = await repo.toggleStatus(req.params.id);
      if (!employee) return notFound(res, req.params.id);
      return res.status(200).json({ success: true, data: employee });
    },

    // DELETE /api/employees/:id
    async remove(req, res) {
      const removed = await repo.remove(req.params.id);
      if (!removed) return notFound(res, req.params.id);
      return res.status(200).json({ success: true, message: 'Employee deleted', data: removed });
    },

    // GET /api/employees/salary-clusters
    async salaryClusters(req, res) {
      const employees = await repo.findAll();
      res.status(200).json(analyzeSalaryStructure(employees));
    },
  };
}

module.exports = { createEmployeeController };
