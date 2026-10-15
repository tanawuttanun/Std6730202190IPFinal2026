// Derived numbers for the executive dashboard (computed from the employee list
// and the K-Means response; no extra backend endpoint needed).

const sum = (arr) => arr.reduce((s, v) => s + v, 0);

export function computeSummary(employees) {
  const salaries = employees.map((e) => Number(e.salary)).filter(Number.isFinite).sort((a, b) => a - b);
  const n = salaries.length;
  const active = employees.filter((e) => e.status === 'Active').length;
  const payroll = sum(salaries);
  const median = n === 0 ? 0 : n % 2 ? salaries[(n - 1) / 2] : (salaries[n / 2 - 1] + salaries[n / 2]) / 2;

  return {
    headcount: employees.length,
    active,
    onLeave: employees.length - active,
    activeRate: employees.length ? active / employees.length : 0,
    payroll,
    average: n ? payroll / n : 0,
    median,
    min: n ? salaries[0] : 0,
    max: n ? salaries[n - 1] : 0,
  };
}

// 1D K-Means clusters are contiguous salary ranges, so each employee belongs
// to the tier whose [minSalary, maxSalary] contains their salary. Falls back to
// the nearest centroid (e.g. employee added after the analysis was run).
export function tierIndexFor(salary, clusters) {
  if (!clusters?.length) return -1;
  const exact = clusters.findIndex((c) => salary >= c.minSalary && salary <= c.maxSalary);
  if (exact !== -1) return exact;
  let best = 0;
  clusters.forEach((c, i) => {
    if (Math.abs(salary - c.centroid) < Math.abs(salary - clusters[best].centroid)) best = i;
  });
  return best;
}

// Per-tier payroll and share of total payroll.
export function tierBreakdown(employees, clusters) {
  const totals = clusters.map(() => ({ payroll: 0, people: 0 }));
  employees.forEach((e) => {
    const i = tierIndexFor(Number(e.salary), clusters);
    if (i >= 0) {
      totals[i].payroll += Number(e.salary);
      totals[i].people += 1;
    }
  });
  const totalPayroll = sum(totals.map((t) => t.payroll)) || 1;
  const totalPeople = sum(totals.map((t) => t.people)) || 1;
  return clusters.map((c, i) => ({
    ...c,
    payroll: totals[i].payroll,
    payrollShare: totals[i].payroll / totalPayroll,
    headcountShare: totals[i].people / totalPeople,
  }));
}

// Plain-language findings for a CEO.
export function buildInsights(breakdown) {
  if (breakdown.length === 0) return [];
  const insights = [];
  const top = breakdown[breakdown.length - 1];
  const bottom = breakdown[0];

  insights.push(
    `${top.group} is ${Math.round(top.headcountShare * 100)}% of staff but ${Math.round(
      top.payrollShare * 100
    )}% of total payroll.`
  );
  if (breakdown.length > 1 && bottom.centroid > 0) {
    insights.push(
      `Top tier earns ${(top.centroid / bottom.centroid).toFixed(1)}x the average of ${bottom.group}.`
    );
  }
  const largest = breakdown.reduce((a, b) => (b.count > a.count ? b : a));
  insights.push(`Largest group: ${largest.group} with ${largest.count} employee${largest.count === 1 ? '' : 's'}.`);
  return insights;
}
