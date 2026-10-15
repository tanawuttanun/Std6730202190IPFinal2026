const { kMeans1D } = require('./kmeans');

const TIER_COUNT = 3;

// Builds the /salary-clusters response from the current employee list.
function analyzeSalaryStructure(employees) {
  const salaries = employees.map((e) => Number(e.salary)).filter((s) => Number.isFinite(s));

  if (salaries.length === 0) {
    return { success: true, totalEmployees: 0, clusters: [], message: 'No salary data to analyze' };
  }

  const clusters = kMeans1D(salaries, TIER_COUNT).map((cluster, i) => ({
    group: `Tier ${i + 1}`,
    centroid: Math.round(cluster.centroid),
    count: cluster.values.length,
    minSalary: Math.min(...cluster.values),
    maxSalary: Math.max(...cluster.values),
  }));

  const result = { success: true, totalEmployees: salaries.length, clusters };
  if (clusters.length < TIER_COUNT) {
    result.message = `Only ${clusters.length} distinct salary group(s) available (need at least ${TIER_COUNT} different salaries for ${TIER_COUNT} tiers)`;
  }
  return result;
}

module.exports = { analyzeSalaryStructure };
