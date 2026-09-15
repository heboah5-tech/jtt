export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'unknown';

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
  schemeName: string; // e.g. "VISA", "Mastercard", "American Express"
  schemeCategory: string; // e.g. "DEBIT • PLATINUM", "CREDIT • GOLD", "DEBIT • CLASSIC"
  bankNameAr: string; // e.g. "البنك العربي"
  bankNameEn: string; // e.g. "Arab Bank"
  cardType: CardType;
  country: string; // e.g. "الأردن 🇯🇴", "السعودية 🇸🇦", "Denmark 🇩🇰"
  rawBinData?: BinLookupResponse;
}

export function getCardType(cardNumber: string): CardType {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^(6011|65|64[4-9]|622)/.test(clean)) return 'discover';
  if (/^35(2[89]|[3-8][0-9])/.test(clean)) return 'jcb';
  return 'unknown';
}

export function detectCardDetails(cardNumber: string, fallbackBankName?: string, rawBinData?: BinLookupResponse): CardDetailsInfo {
  const clean = cardNumber.replace(/\D/g, '');
  const bin6 = clean.slice(0, 6);
  const bin4 = clean.slice(0, 4);
  const type = getCardType(cardNumber);

  let schemeName = rawBinData?.scheme ? rawBinData.scheme.toUpperCase() : 'VISA';
  if (!rawBinData?.scheme) {
    if (type === 'mastercard') schemeName = 'MasterCard';
    else if (type === 'amex') schemeName = 'American Express';
    else if (type === 'discover') schemeName = 'Discover';
    else if (type === 'jcb') schemeName = 'JCB';
    else if (type === 'visa') schemeName = 'VISA';
  }

  let bankNameAr = rawBinData?.bank?.name || 'البنك المصدر للبطاقة';
  let bankNameEn = rawBinData?.bank?.name || 'Issuing Bank';
  let country = rawBinData?.country?.name ? `${rawBinData.country.name} ${rawBinData.country.emoji || ''}`.trim() : 'الأردن 🇯🇴';
  let category = rawBinData?.type ? `${rawBinData.type.toUpperCase()} • ${rawBinData.brand?.toUpperCase() || (rawBinData.prepaid ? 'PREPAID' : 'STANDARD')}` : (type === 'amex' ? 'CREDIT • PLATINUM' : 'DEBIT • PLATINUM');

  // BIN Lookup rules for Jordan & Regional Banks if rawBinData not provided
  if (!rawBinData?.bank?.name) {
    if (/^(458838|458837|402289|417633|400000|402400|417634)/.test(bin6)) {
      bankNameAr = 'البنك العربي';
      bankNameEn = 'Arab Bank';
      country = 'الأردن 🇯🇴';
      category = 'DEBIT • PLATINUM';
    } else if (/^(521178|528430|489392|530122|438138)/.test(bin6)) {
      bankNameAr = 'بنك الإسكان للتجارة والتمويل';
      bankNameEn = 'Housing Bank';
      country = 'الأردن 🇯🇴';
      category = 'CREDIT • GOLD';
    } else if (/^(410292|421111|540700|409160)/.test(bin6)) {
      bankNameAr = 'بنك الأردن';
      bankNameEn = 'Bank of Jordan';
      country = 'الأردن 🇯🇴';
      category = 'DEBIT • CLASSIC';
    } else if (/^(530006|540759|426178|404900)/.test(bin6)) {
      bankNameAr = 'بنك القاهرة عمان';
      bankNameEn = 'Cairo Amman Bank';
      country = 'الأردن 🇯🇴';
      category = 'DEBIT • WORLD';
    } else if (/^(431180|520010|450638|403010)/.test(bin6)) {
      bankNameAr = 'بنك الاتحاد';
      bankNameEn = 'Bank al Etihad';
      country = 'الأردن 🇯🇴';
      category = 'CREDIT • PLATINUM';
    } else if (/^(479905|532840|457910|520100)/.test(bin6)) {
      bankNameAr = 'بنك الأردن والكويت';
      bankNameEn = 'Jordan Kuwait Bank';
      country = 'الأردن 🇯🇴';
      category = 'DEBIT • BLACK';
    } else if (/^(458456|428236|518880|407888)/.test(bin6)) {
      bankNameAr = 'كابيتال بنك';
      bankNameEn = 'Capital Bank of Jordan';
      country = 'الأردن 🇯🇴';
      category = 'CREDIT • INFINITE';
    } else if (/^(588845|588850|504900|458800)/.test(bin6)) {
      bankNameAr = 'البنك الإسلامي الأردني';
      bankNameEn = 'Jordan Islamic Bank';
      country = 'الأردن 🇯🇴';
      category = 'DEBIT • ISLAMIC';
    } else if (/^(457912|535999|409988)/.test(bin6)) {
      bankNameAr = 'بنك صفوة الإسلامي';
      bankNameEn = 'Safwa Islamic Bank';
      country = 'الأردن 🇯🇴';
      category = 'DEBIT • PLATINUM';
    } else if (/^(589005|589006|484783|455708|440647|409201|458451)/.test(bin6) || /^(5888|4908|4406|4228|4830|5852)/.test(bin4)) {
      bankNameAr = 'مصرف الراجحي (مدى)';
      bankNameEn = 'Al Rajhi Bank (MADA)';
      country = 'السعودية 🇸🇦';
      category = 'MADA • DEBIT';
    } else if (/^(535825|543357|400861|412565|589206)/.test(bin6)) {
      bankNameAr = 'البنك الأهلي السعودي (SNB)';
      bankNameEn = 'Saudi National Bank';
      country = 'السعودية 🇸🇦';
      category = 'CREDIT • WORLD ELITE';
    } else if (/^(457865|529741|455036|410621)/.test(bin6)) {
      bankNameAr = 'مصرف الإنماء';
      bankNameEn = 'Alinma Bank';
      country = 'السعودية 🇸🇦';
      category = 'MADA • PLATINUM';
    } else if (/^(455325|529415|407197|406996)/.test(bin6)) {
      bankNameAr = 'بنك الرياض';
      bankNameEn = 'Riyad Bank';
      country = 'السعودية 🇸🇦';
      category = 'MADA • DEBIT';
    } else if (/^(454888|537767|403208)/.test(bin6)) {
      bankNameAr = 'بنك قطر الوطني';
      bankNameEn = 'Qatar National Bank (QNB)';
      country = 'قطر 🇶🇦';
      category = 'CREDIT • FIRST';
    } else if (/^(451403|521020|402371)/.test(bin6)) {
      bankNameAr = 'بنك الإمارات دبي الوطني';
      bankNameEn = 'Emirates NBD';
      country = 'الإمارات 🇦🇪';
      category = 'CREDIT • SIGNATURE';
    } else if (/^(464600|542200|400100)/.test(bin6)) {
      bankNameAr = 'بنك الكويت الوطني';
      bankNameEn = 'National Bank of Kuwait (NBK)';
      country = 'الكويت 🇰🇼';
      category = 'DEBIT • PLATINUM';
    }
  }

  // If fallbackBankName was passed and wasn't generic unknown, use it
  if (fallbackBankName && fallbackBankName !== 'UNKNOWN' && fallbackBankName !== 'VISA' && fallbackBankName !== 'MASTERCARD' && fallbackBankName !== 'AMEX' && fallbackBankName !== 'البنك غير معروف') {
    if (bankNameAr === 'البنك المصدر للبطاقة') {
      bankNameAr = fallbackBankName;
      bankNameEn = fallbackBankName;
    }
  }

  // Construct structured bin data matching the user's schema
  const constructedBinData: BinLookupResponse = rawBinData || {
    number: {
      length: clean.length || 16,
      luhn: isValidLuhn(cardNumber)
    },
    scheme: schemeName.toLowerCase(),
    type: category.split('•')[0].trim().toLowerCase(),
    brand: category.split('•')[1]?.trim() || schemeName,
    prepaid: category.includes('PREPAID'),
    country: {
      name: country.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '').trim(),
      emoji: country.match(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/)?.[0] || '🇯🇴',
      currency: 'JOD'
    },
    bank: {
      name: bankNameEn,
      city: 'Amman'
    }
  };

  return {
    schemeName,
    schemeCategory: category,
    bankNameAr,
    bankNameEn,
    cardType: type,
    country,
    rawBinData: constructedBinData
  };
}

export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

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
  const [mmStr, yyStr] = expiry.split('/');
  const month = parseInt(mmStr, 10);
  const year = 2000 + parseInt(yyStr, 10);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1 to 12

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 25) return false;

  return true;
}

export function isValidCvv(cvv: string, cardType: CardType): boolean {
  if (cardType === 'amex') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
}

export function formatCardNumber(value: string, cardType: CardType): string {
  const digits = value.replace(/\D/g, '');
  if (cardType === 'amex') {
    const trimmed = digits.slice(0, 15);
    const parts = [];
    if (trimmed.length > 0) parts.push(trimmed.slice(0, 4));
    if (trimmed.length > 4) parts.push(trimmed.slice(4, 10));
    if (trimmed.length > 10) parts.push(trimmed.slice(10, 15));
    return parts.join(' ');
  } else {
    const trimmed = digits.slice(0, 16);
    return trimmed.replace(/(.{4})/g, '$1 ').trim();
  }
}
