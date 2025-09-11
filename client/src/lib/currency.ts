/**
 * Currency formatting utilities for NPR (Nepali Rupees)
 */

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Rs. 0';
  }
  
  // Format NPR without decimals for whole numbers, with decimals for fractional amounts
  const formattedAmount = numAmount % 1 === 0 
    ? numAmount.toLocaleString('en-NP', { maximumFractionDigits: 0 })
    : numAmount.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return `Rs. ${formattedAmount}`;
}

export function formatCurrencyCompact(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Rs. 0';
  }
  
  // For large amounts, use compact notation
  if (numAmount >= 10000000) { // 1 crore
    return `Rs. ${(numAmount / 10000000).toFixed(1)}Cr`;
  } else if (numAmount >= 100000) { // 1 lakh
    return `Rs. ${(numAmount / 100000).toFixed(1)}L`;
  } else if (numAmount >= 1000) { // 1 thousand
    return `Rs. ${(numAmount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(numAmount);
}

export const CURRENCY_SYMBOL = 'Rs.';
export const CURRENCY_CODE = 'NPR';
export const CURRENCY_NAME = 'Nepali Rupee';