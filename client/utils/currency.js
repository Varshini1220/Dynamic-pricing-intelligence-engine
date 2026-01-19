// Currency conversion utility
// Default: USD to INR conversion rate (approximate)
const USD_TO_INR = 83.50; // Update this rate as needed

export const CURRENCY_SYMBOL = '₹'; // Indian Rupee
export const CURRENCY_NAME = 'INR';

/**
 * Convert USD to INR
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in INR
 */
export function convertToINR(usdAmount) {
  return usdAmount * USD_TO_INR;
}

/**
 * Format currency for display
 * @param {number} amount - Amount in USD (will be converted to INR)
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, showDecimals = true) {
  const inrAmount = convertToINR(amount);
  
  if (showDecimals) {
    return `${CURRENCY_SYMBOL}${inrAmount.toFixed(2)}`;
  }
  
  return `${CURRENCY_SYMBOL}${Math.round(inrAmount).toLocaleString('en-IN')}`;
}

/**
 * Format large currency amounts with K/L/Cr notation
 * @param {number} amount - Amount in USD (will be converted to INR)
 * @returns {string} Formatted currency string with notation
 */
export function formatLargeCurrency(amount) {
  const inrAmount = convertToINR(amount);
  
  if (inrAmount >= 10000000) { // 1 Crore
    return `${CURRENCY_SYMBOL}${(inrAmount / 10000000).toFixed(2)}Cr`;
  } else if (inrAmount >= 100000) { // 1 Lakh
    return `${CURRENCY_SYMBOL}${(inrAmount / 100000).toFixed(2)}L`;
  } else if (inrAmount >= 1000) { // 1 Thousand
    return `${CURRENCY_SYMBOL}${(inrAmount / 1000).toFixed(2)}K`;
  }
  
  return `${CURRENCY_SYMBOL}${inrAmount.toFixed(2)}`;
}

/**
 * Get conversion rate info for display
 * @returns {object} Conversion rate information
 */
export function getConversionInfo() {
  return {
    rate: USD_TO_INR,
    from: 'USD',
    to: CURRENCY_NAME,
    symbol: CURRENCY_SYMBOL,
    formatted: `1 USD = ${CURRENCY_SYMBOL}${USD_TO_INR}`
  };
}

