// Client-side validation (mirrors the backend rules).

export const MAX_SALARY = 100000000;
export const MAX_TEXT_LENGTH = 100;

// "45,000" -> 45000 ; "" / "abc" -> NaN
export const parseSalary = (text) => Number(String(text).replace(/,/g, '').trim() || NaN);

// Returns an error message, or null when the employee form is valid.
export const validateEmployee = ({ name, position, salary }) => {
  const missing = [];
  if (!name.trim()) missing.push('Name');
  if (!position.trim()) missing.push('Position');
  if (!salary.trim()) missing.push('Salary');
  if (missing.length) return `Please fill in: ${missing.join(', ')}`;

  const value = parseSalary(salary);
  if (!Number.isFinite(value) || value <= 0) return 'Salary must be a positive number.';
  if (value > MAX_SALARY) return 'Salary is too large.';
  return null;
};

export const validateLogin = ({ username, password }) =>
  !username.trim() || !password ? 'Please enter both username and password.' : null;
