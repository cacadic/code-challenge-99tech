/**
 * Format amount for the "You receive" display with decimal places from settings
 * Removes trailing zeros for cleaner display
 * 
 * Note: JavaScript Number has precision limit of ~15-17 significant digits
 * For numbers exceeding this, values will be rounded and precision lost
 */
export const formatReceivedAmount = (value: number, decimalPlaces: number = 4): string => {
  if (value === 0) return "0.00";

  const formatted = value.toFixed(decimalPlaces);
  const trimmed = formatted.replace(/\.?0+$/, "");

  return trimmed;
};

/**
 * Validate and format input amount for the "You pay" section
 * - Remove leading zeros (except "0.")
 * - Allow only digits and decimal point
 * - Limits: up to 10 integer digits, total up to 15 digits (excluding dot)
 */
export const validateAmount = (value: string): string | null => {
  if (value === "") return "";
  if (value === ".") return ".";

  let processedValue = value;
  if (value.length > 1 && value.startsWith("0") && value[1] !== ".") {
    processedValue = value.replace(/^0+/, "");
  }

  if (!/^\d*\.?\d*$/.test(processedValue)) {
    return null;
  }

  const parts = processedValue.split(".");
  const integerPart = parts[0] || "";
  const decimalPart = parts[1] || "";
  
  const MAX_INTEGER_DIGITS = 10;
  const MAX_TOTAL_DIGITS = 15;

  let truncatedInteger = integerPart;
  if (integerPart.length > MAX_INTEGER_DIGITS) {
    truncatedInteger = integerPart.slice(0, MAX_INTEGER_DIGITS);
  }

  const availableForDecimal = Math.max(0, MAX_TOTAL_DIGITS - truncatedInteger.length);
  
  let truncatedDecimal = decimalPart;
  if (decimalPart.length > availableForDecimal) {
    truncatedDecimal = decimalPart.slice(0, availableForDecimal);
  }

  const totalDigits = truncatedInteger.length + truncatedDecimal.length;

  if (totalDigits > MAX_TOTAL_DIGITS) {
    const finalDecimalLength = Math.max(0, MAX_TOTAL_DIGITS - truncatedInteger.length);
    truncatedDecimal = truncatedDecimal.slice(0, finalDecimalLength);
  }

  const hasDecimalPoint = value.includes(".") || truncatedDecimal.length > 0;
  
  if (hasDecimalPoint) {
    return truncatedInteger ? `${truncatedInteger}.${truncatedDecimal}` : `0.${truncatedDecimal}`;
  } else {
    return truncatedInteger || "0";
  }
};
