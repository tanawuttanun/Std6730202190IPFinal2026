const { limits } = require('../config');

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

/**
 * Validates the POST /api/employees body.
 * Returns { error } (-> 400) or { value: { name, position, salary } } (cleaned).
 */
function validateNewEmployee(body) {
  const { name, position, salary } = body || {};

  const missing = ['name', 'position', 'salary'].filter((field) => isBlank(body?.[field]));
  if (missing.length > 0) {
    return { error: `Missing required field(s): ${missing.join(', ')}` };
  }

  if (typeof name !== 'string' || typeof position !== 'string') {
    return { error: 'name and position must be text' };
  }
  if (name.trim().length > limits.maxTextLength || position.trim().length > limits.maxTextLength) {
    return { error: `name and position must be at most ${limits.maxTextLength} characters` };
  }

  // Accept 45000 or "45000" (form inputs send strings); reject arrays, objects, "abc", etc.
  if (typeof salary !== 'number' && typeof salary !== 'string') {
    return { error: 'salary must be a number' };
  }
  const salaryNumber = Number(String(salary).trim());
  if (!Number.isFinite(salaryNumber) || salaryNumber <= 0) {
    return { error: 'salary must be a positive number' };
  }
  if (salaryNumber > limits.maxSalary) {
    return { error: `salary must not exceed ${limits.maxSalary}` };
  }

  return {
    value: {
      name: name.trim(),
      position: position.trim(),
      salary: Math.round(salaryNumber * 100) / 100, // 2 decimals, same as DECIMAL(12,2)
    },
  };
}

module.exports = { validateNewEmployee };
