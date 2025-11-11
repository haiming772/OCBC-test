const currency = new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' });

export function formatCurrency(value: number | string) {
  return currency.format(typeof value === 'string' ? Number(value) : value);
}
