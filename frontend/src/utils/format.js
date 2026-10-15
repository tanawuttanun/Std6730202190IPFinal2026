// 45000 -> "฿45,000", 12345.5 -> "฿12,345.50"
// (manual formatting: Intl support differs between Android/iOS JS engines)
export const formatMoney = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return '-';
  const [int, dec] = Number.isInteger(num) ? [String(num)] : num.toFixed(2).split('.');
  return `฿${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${dec ? `.${dec}` : ''}`;
};

// 45000 -> "฿45K", 1250000 -> "฿1.25M" (for charts and KPI tiles)
export const formatCompactMoney = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return '-';
  const abs = Math.abs(num);
  const trim = (v) => String(Number(v.toFixed(2)));
  if (abs >= 1e6) return `฿${trim(num / 1e6)}M`;
  if (abs >= 1e3) return `฿${trim(num / 1e3)}K`;
  return `฿${Math.round(num)}`;
};
