// 45000 -> "฿45,000", 12345.5 -> "฿12,345.50"
// (manual formatting: Intl support differs between Android/iOS JS engines)
export const formatMoney = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return '-';
  const [int, dec] = Number.isInteger(num) ? [String(num)] : num.toFixed(2).split('.');
  return `฿${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${dec ? `.${dec}` : ''}`;
};
