/**
 * Formats a numeric value into Indian Rupee currency format (e.g. ₹38,750 or ₹1,25,000)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `₹${formatted}`;
}

/**
 * Formats percentage numbers cleanly
 */
export function formatPercent(value: number): string {
  return `${value}%`;
}
