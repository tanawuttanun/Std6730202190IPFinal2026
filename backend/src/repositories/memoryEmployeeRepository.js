// In-memory employee store (default; data resets when the server restarts).
// Same async interface as the MySQL repository so controllers don't care which is used.
const seedEmployees = require('../data/seedEmployees');

const nextStatus = (status) => (status === 'Active' ? 'On Leave' : 'Active');

function createMemoryEmployeeRepository() {
  let employees;
  let nextId;

  const reset = () => {
    employees = seedEmployees.map((e, i) => ({ id: String(i + 1), ...e }));
    nextId = employees.length + 1; // ids are never reused, even after delete
  };
  reset();

  // Return copies so callers can't mutate the store by accident.
  const copy = (e) => (e ? { ...e } : null);

  return {
    kind: 'memory',

    async findAll() {
      return employees.map(copy);
    },

    async findById(id) {
      return copy(employees.find((e) => e.id === String(id)));
    },

    async create({ name, position, salary }) {
      const employee = { id: String(nextId++), name, position, status: 'Active', salary };
      employees.push(employee);
      return copy(employee);
    },

    async toggleStatus(id) {
      const employee = employees.find((e) => e.id === String(id));
      if (!employee) return null;
      employee.status = nextStatus(employee.status);
      return copy(employee);
    },

    async remove(id) {
      const index = employees.findIndex((e) => e.id === String(id));
      if (index === -1) return null;
      return copy(employees.splice(index, 1)[0]);
    },

    async close() {},

    reset, // used by tests
  };
}

module.exports = { createMemoryEmployeeRepository };
