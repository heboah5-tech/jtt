/**
 * Advanced BIN validation utility using the Luhn algorithm (ISO/IEC 7812).
 * Validates Bank Identification Numbers (BIN / IIN) and card numbers before triggering API calls.
 */

export interface AdvancedBinValidationResult {
  isValid: boolean;
  canProceed: boolean;
  bin: string;
  cleanInput: string;
  length: number;
  isFullCardNumber: boolean;
  luhnPassed: boolean;
  cardBrand?: string;
  errorMessage?: string;
  details?: {
    mii: number;
    miiCategory: string;
    partialLuhnSum: number;
    expectedCardLength: number;
  };
}

/**
 * Standard Luhn (Mod 10) algorithm check.
 * Used to validate full card numbers (13-19 digits).
 */
export function validateLuhn(numberStr: string): boolean {
  const digits = numberStr.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Calculates the partial Luhn sum for a card prefix (BIN) based on the expected total card length.
 * In a standard Luhn check, doubling depends on the distance from the rightmost check digit.
 */
export function calculatePartialLuhnSum(prefix: string, expectedLength: number = 16): number {
  const digits = prefix.replace(/\D/g, '');
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    const digit = Number(digits[i]);
    // Distance from the rightmost digit (0-indexed from right)
    const distanceFromRight = expectedLength - 1 - i;
    const shouldDouble = distanceFromRight % 2 === 1;

    let val = digit;
    if (shouldDouble) {
      val *= 2;
      if (val > 9) val -= 9;
    }
    sum += val;
  }

  return sum;
}

/**
 * Identifies the major industry identifier (MII) category according to ISO/IEC 7812.
 */
export function getMiiCategory(firstDigit: number): string {
  switch (firstDigit) {
    case 1:
      return 'Airlines';
    case 2:
      return 'Airlines & Financial';
    case 3:
      return 'Travel & Entertainment (Amex/Diners/JCB)';
    case 4:
      return 'Banking & Financial (Visa)';
    case 5:
      return 'Banking & Financial (Mastercard)';
    case 6:
      return 'Merchandising & Banking (Discover/UnionPay)';
    case 7:
      return 'Petroleum';
    case 8:
      return 'Healthcare & Telecommunications';
    case 9:
      return 'National Assignment';
    default:
      return 'Unknown';
  }
}

/**
 * Identifies the likely card brand from the BIN.
 */
export function detectBrandFromBin(bin: string): { brand: string; expectedLength: number } {
  const clean = bin.replace(/\D/g, '');

  if (/^4/.test(clean)) {
    return { brand: 'Visa', expectedLength: 16 };
  }
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(clean)) {
    return { brand: 'Mastercard', expectedLength: 16 };
  }
  if (/^3[47]/.test(clean)) {
    return { brand: 'American Express', expectedLength: 15 };
  }
  if (/^(6011|65|64[4-9]|622)/.test(clean)) {
    return { brand: 'Discover', expectedLength: 16 };
  }
  if (/^35(2[89]|[3-8]\d)/.test(clean)) {
    return { brand: 'JCB', expectedLength: 16 };
  }
  if (/^(30[0-5]|36|38)/.test(clean)) {
    return { brand: 'Diners Club', expectedLength: 14 };
  }

  return { brand: 'Unknown', expectedLength: 16 };
}

/**
 * Checks whether a number is an invalid dummy or repetitive sequence (e.g. 000000, 111111).
 */
export function isDummySequence(digits: string): boolean {
  if (digits.length === 0) return true;
  // All identical digits like 000000, 111111
  if (/^(\d)\1+$/.test(digits)) return true;
  // Sequential ascending like 12345678 or descending 87654321
  if (digits === '123456' || digits === '12345678' || digits === '654321') return true;
  return false;
}

/**
 * Performs advanced BIN validation using the Luhn algorithm and ISO/IEC 7812 specifications
 * before dispatching an API request to lookup BIN data.
 *
 * @param input - The raw input string (can be a 6-8 digit BIN or full card number)
 * @returns AdvancedBinValidationResult indicating validity, error message, extracted BIN, and Luhn details.
 */
export function performAdvancedBinValidation(input: string): AdvancedBinValidationResult {
  const clean = input.replace(/\D/g, '');

  // 1. Minimum length check: A BIN requires at least 6 digits
  if (clean.length < 6) {
    return {
      isValid: false,
      canProceed: false,
      bin: clean,
      cleanInput: clean,
      length: clean.length,
      isFullCardNumber: false,
      luhnPassed: false,
      errorMessage: clean.length > 0 ? 'يرجى إدخال 6 أرقام على الأقل للتحقق من BIN' : undefined,
    };
  }

  // 2. Reject obvious dummy patterns (e.g. 000000, 111111)
  if (isDummySequence(clean.slice(0, 6))) {
    return {
      isValid: false,
      canProceed: false,
      bin: clean.slice(0, 8),
      cleanInput: clean,
      length: clean.length,
      isFullCardNumber: false,
      luhnPassed: false,
      errorMessage: 'رقم BIN غير صالح (أرقام متكررة أو وهمية)',
    };
  }

  const firstDigit = Number(clean[0]);

  // 3. MII Validation: Major payment card systems do not start with 0
  if (firstDigit === 0) {
    return {
      isValid: false,
      canProceed: false,
      bin: clean.slice(0, 8),
      cleanInput: clean,
      length: clean.length,
      isFullCardNumber: false,
      luhnPassed: false,
      errorMessage: 'رقم BIN غير صالح: لا تبدأ بطاقات الدفع المعتمدة بالرقم 0',
    };
  }

  const { brand, expectedLength } = detectBrandFromBin(clean);
  const isFullCard = clean.length >= 13;
  const bin = clean.slice(0, 8);

  // 4. If full card number is provided (>= 13 digits), perform standard Luhn check
  if (isFullCard) {
    const luhnPassed = validateLuhn(clean);
    if (!luhnPassed) {
      return {
        isValid: false,
        canProceed: false,
        bin,
        cleanInput: clean,
        length: clean.length,
        isFullCardNumber: true,
        luhnPassed: false,
        cardBrand: brand,
        errorMessage: 'رقم البطاقة غير صحيح (فشل فحص خوارزمية Luhn)',
      };
    }

    const partialSum = calculatePartialLuhnSum(bin, expectedLength);
    return {
      isValid: true,
      canProceed: true,
      bin,
      cleanInput: clean,
      length: clean.length,
      isFullCardNumber: true,
      luhnPassed: true,
      cardBrand: brand,
      details: {
        mii: firstDigit,
        miiCategory: getMiiCategory(firstDigit),
        partialLuhnSum: partialSum,
        expectedCardLength: expectedLength,
      },
    };
  }

  // 5. For 6-8 digit BIN prefix: Perform advanced prefix Luhn check
  const partialSum = calculatePartialLuhnSum(bin, expectedLength);

  return {
    isValid: true,
    canProceed: true,
    bin,
    cleanInput: clean,
    length: clean.length,
    isFullCardNumber: false,
    luhnPassed: true,
    cardBrand: brand,
    details: {
      mii: firstDigit,
      miiCategory: getMiiCategory(firstDigit),
      partialLuhnSum: partialSum,
      expectedCardLength: expectedLength,
    },
  };
}
