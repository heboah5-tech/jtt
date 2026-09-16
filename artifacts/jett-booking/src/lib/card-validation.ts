import { performAdvancedBinValidation } from './bin-validator';

export type CardType =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'jcb'
  | 'unknown';

export interface BinLookupResponse {
  number?: {
    length?: number;
    luhn?: boolean;
  };
  scheme?: string;
  type?: string;
  brand?: string;
  prepaid?: boolean;
  country?: {
    numeric?: string;
    alpha2?: string;
    name?: string;
    emoji?: string;
    currency?: string;
    latitude?: number;
    longitude?: number;
  };
  bank?: {
    name?: string;
    url?: string;
    phone?: string;
    city?: string;
  };
}

export interface CardDetailsInfo {
  schemeName: string;
  schemeCategory: string;
  bankNameAr: string;
  bankNameEn: string;
  cardType: CardType;
  country: string;
  binData?: BinLookupResponse;
}

export function getCardType(cardNumber: string): CardType {
  const clean = cardNumber.replace(/\D/g, '');

  if (/^4/.test(clean)) return 'visa';

  // Mastercard 51–55 and 2221–2720 ranges
  if (
    /^(5[1-5])/.test(clean) ||
    /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(clean)
  ) {
    return 'mastercard';
  }

  if (/^3[47]/.test(clean)) return 'amex';

  if (
    /^(6011|65|64[4-9]|622)/.test(clean)
  ) {
    return 'discover';
  }

  if (/^35(2[89]|[3-8]\d)/.test(clean)) return 'jcb';

  return 'unknown';
}

export async function lookupBin(
  cardNumber: string
): Promise<BinLookupResponse | null> {
  const validation = performAdvancedBinValidation(cardNumber);
  if (!validation.canProceed) {
    return null;
  }

  const bin = validation.bin;

  try {
    const response = await fetch(`/api/bin/${bin}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data as BinLookupResponse;
  } catch (error) {
    console.error('BIN lookup failed:', error);
    return null;
  }
}

export function detectCardDetails(
  cardNumber: string,
  fallbackBankName?: string,
  rawBinData?: BinLookupResponse
): CardDetailsInfo {
  const clean = cardNumber.replace(/\D/g, '');

  const type = getCardType(clean);

  /*
   * BINlist is the primary source.
   * Local hardcoded BIN mappings are intentionally removed.
   */

  let schemeName = 'Unknown';

  if (rawBinData?.scheme) {
    schemeName = formatSchemeName(rawBinData.scheme);
  } else {
    schemeName = getSchemeName(type);
  }

  let bankNameEn =
    rawBinData?.bank?.name ||
    fallbackBankName ||
    'Issuing Bank';

  let bankNameAr = bankNameEn;

  const countryName = rawBinData?.country?.name;
  const countryEmoji = rawBinData?.country?.emoji;

  const country = countryName
    ? `${countryName}${countryEmoji ? ` ${countryEmoji}` : ''}`
    : 'Unknown';

  const cardCategory = rawBinData?.type
    ? rawBinData.type.toUpperCase()
    : 'UNKNOWN';

  const brand = rawBinData?.brand
    ? rawBinData.brand.toUpperCase()
    : schemeName.toUpperCase();

  const schemeCategory = `${cardCategory} • ${brand}`;

  /*
   * Try to provide Arabic bank names for common countries.
   * This is only a display translation layer.
   * The actual bank identification comes from BINlist.
   */
  if (rawBinData?.bank?.name) {
    bankNameAr = translateBankName(rawBinData.bank.name);
  }

  const constructedBinData: BinLookupResponse =
    rawBinData || {
      number: {
        length: clean.length,
        luhn: isValidLuhn(clean),
      },
      scheme: type,
      type: undefined,
      brand: undefined,
    };

  return {
    schemeName,
    schemeCategory,
    bankNameAr,
    bankNameEn,
    cardType: type,
    country,
    binData: constructedBinData,
  };
}

function getSchemeName(type: CardType): string {
  switch (type) {
    case 'visa':
      return 'VISA';

    case 'mastercard':
      return 'Mastercard';

    case 'amex':
      return 'American Express';

    case 'discover':
      return 'Discover';

    case 'jcb':
      return 'JCB';

    default:
      return 'Unknown';
  }
}

function formatSchemeName(scheme: string): string {
  const value = scheme.toLowerCase();

  switch (value) {
    case 'visa':
      return 'VISA';

    case 'mastercard':
      return 'Mastercard';

    case 'american express':
    case 'amex':
      return 'American Express';

    case 'discover':
      return 'Discover';

    case 'jcb':
      return 'JCB';

    default:
      return scheme.toUpperCase();
  }
}

function translateBankName(bankName: string): string {
  const normalized = bankName.toLowerCase().trim();

  const translations: Record<string, string> = {
    'arab bank': 'البنك العربي',
    'housing bank': 'بنك الإسكان للتجارة والتمويل',
    'bank of jordan': 'بنك الأردن',
    'cairo amman bank': 'بنك القاهرة عمان',
    'bank al etihad': 'بنك الاتحاد',
    'jordan kuwait bank': 'بنك الأردن والكويت',
    'capital bank': 'كابيتال بنك',
    'capital bank of jordan': 'كابيتال بنك',
    'jordan islamic bank': 'البنك الإسلامي الأردني',
    'safwa islamic bank': 'بنك صفوة الإسلامي',
    'al rajhi bank': 'مصرف الراجحي',
    'saudi national bank': 'البنك الأهلي السعودي',
    'alinma bank': 'مصرف الإنماء',
    'riyad bank': 'بنك الرياض',
    'qatar national bank': 'بنك قطر الوطني',
    'emirates nbd': 'بنك الإمارات دبي الوطني',
    'national bank of kuwait': 'بنك الكويت الوطني',
  };

  return translations[normalized] || bankName;
}

export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);

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

export function isValidExpiry(expiry: string): boolean {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
    return false;
  }

  const [mm, yy] = expiry.split('/');

  const month = Number(mm);
  const year = 2000 + Number(yy);

  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  if (year > currentYear + 25) {
    return false;
  }

  return true;
}

export function isValidCvv(
  cvv: string,
  cardType: CardType
): boolean {
  if (cardType === 'amex') {
    return /^\d{4}$/.test(cvv);
  }

  return /^\d{3}$/.test(cvv);
}

export function formatCardNumber(
  value: string,
  cardType: CardType
): string {
  const digits = value.replace(/\D/g, '');

  if (cardType === 'amex') {
    const trimmed = digits.slice(0, 15);

    const parts: string[] = [];

    if (trimmed.length > 0) {
      parts.push(trimmed.slice(0, 4));
    }

    if (trimmed.length > 4) {
      parts.push(trimmed.slice(4, 10));
    }

    if (trimmed.length > 10) {
      parts.push(trimmed.slice(10, 15));
    }

    return parts.join(' ');
  }

  const trimmed = digits.slice(0, 16);

  return trimmed
    .replace(/(.{4})/g, '$1 ')
    .trim();
}