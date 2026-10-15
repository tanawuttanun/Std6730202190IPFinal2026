/**
 * 1D K-Means clustering (Lloyd's algorithm) with deterministic initialisation.
 *
 * Edge cases handled:
 *  - empty input            -> []
 *  - fewer unique values    -> k is reduced to the number of unique values
 *    than k                    (no empty / NaN clusters)
 *  - non-numeric values     -> ignored
 *  - empty cluster during   -> keeps its previous centroid
 *    iteration
 *
 * Returns clusters sorted by centroid (ascending):
 *   [{ centroid, values: number[] }, ...]
 */
function kMeans1D(rawValues, k = 3, maxIterations = 100) {
  const values = rawValues.map(Number).filter((v) => Number.isFinite(v));
  if (values.length === 0) return [];

  const unique = [...new Set(values)].sort((a, b) => a - b);
  const clusterCount = Math.min(k, unique.length);

  // Deterministic init: spread the initial centroids evenly over the sorted
  // unique values (min ... max). Same input always gives the same output.
  let centroids = Array.from({ length: clusterCount }, (_, i) => {
    const idx = clusterCount === 1 ? 0 : Math.round((i * (unique.length - 1)) / (clusterCount - 1));
    return unique[idx];
  });

  const assignments = new Array(values.length).fill(-1);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // Assignment step: nearest centroid.
    values.forEach((v, i) => {
      let best = 0;
      for (let c = 1; c < clusterCount; c++) {
        if (Math.abs(v - centroids[c]) < Math.abs(v - centroids[best])) best = c;
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        changed = true;
      }
    });

    // Update step: mean of each cluster.
    const sums = new Array(clusterCount).fill(0);
    const counts = new Array(clusterCount).fill(0);
    values.forEach((v, i) => {
      sums[assignments[i]] += v;
      counts[assignments[i]] += 1;
    });
    centroids = centroids.map((old, c) => (counts[c] > 0 ? sums[c] / counts[c] : old));

    if (!changed) break;
  }

  return centroids
    .map((centroid, c) => ({ centroid, values: values.filter((_, i) => assignments[i] === c) }))
    .filter((cluster) => cluster.values.length > 0)
    .sort((a, b) => a.centroid - b.centroid);
}

module.exports = { kMeans1D };
