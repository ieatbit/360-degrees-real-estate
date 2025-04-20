/**
 * Formats a number to Indian currency format with ₹ symbol
 * Converts to lakhs and crores for readability
 * 
 * @param price - The price to format
 * @returns Formatted price string in Indian format (e.g., ₹ 5.85 Crore)
 */
export function formatIndianPrice(price: number | string): string {
  if (!price) return '₹ 0';
  
  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
  
  // Format based on value
  if (numPrice >= 10000000) { // 1 crore = 10,000,000
    const crores = (numPrice / 10000000).toFixed(2);
    // Remove trailing zeros after decimal
    const formatted = crores.replace(/\.00$/, '');
    return `₹ ${formatted} Crore`;
  } else if (numPrice >= 100000) { // 1 lakh = 100,000
    const lakhs = (numPrice / 100000).toFixed(2);
    // Remove trailing zeros after decimal
    const formatted = lakhs.replace(/\.00$/, '');
    return `₹ ${formatted} Lakh`;
  } else if (numPrice >= 1000) {
    return `₹ ${numPrice.toLocaleString('en-IN')}`;
  } else {
    return `₹ ${numPrice}`;
  }
} 