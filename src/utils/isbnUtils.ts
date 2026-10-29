/**
 * Bibliographic & ISBN Parsing Utilities
 * Specialized in Japanese ISBN4, Dual Barcode C-Codes, SBNs, Arabic & Global Identifiers
 */

export interface ParsedIdentifier {
  raw: string;
  cleaned: string;
  type:
    | "Japanese-ISBN4"
    | "ISBN-13"
    | "ISBN-10"
    | "Dual-Barcode-CCode"
    | "SBN"
    | "LCCN"
    | "OCLC"
    | "Alphanumeric";
  isbn13?: string;
  isbn10?: string;
  japaneseIsbn4?: string;
  cCode?: {
    code: string;
    audience: string;
    format: string;
    subject: string;
    priceYen?: number;
  };
  isValidCheckDigit?: boolean;
}

// Japanese C-Code decoders with complete English, Japanese, and Arabic translations
interface TrilingualLabel {
  en: string;
  ja: string;
  ar: string;
}

const C_CODE_AUDIENCE: Record<string, TrilingualLabel> = {
  "0": { en: "General / Public", ja: "一般", ar: "جمهور عام" },
  "1": { en: "Instructional / Student", ja: "教養・学習", ar: "تعليمي وثقافي للطلاب" },
  "2": { en: "Children's / Juvenile", ja: "児童", ar: "أطفال وناشئة" },
  "3": { en: "Specialist / Professional", ja: "専門", ar: "تخصصي ومهني" },
};

const C_CODE_FORMAT: Record<string, TrilingualLabel> = {
  "0": { en: "Single Volume (Tankobon)", ja: "単行本", ar: "مجلد مفرد (تانكوبون)" },
  "1": { en: "Bunko Paperback", ja: "文庫", ar: "كتيب جيب (بونكو)" },
  "2": { en: "Shinsho Compact", ja: "新書", ar: "كتاب فكري بحجم الجيب (شينشو)" },
  "3": { en: "Anthology / Complete Works", ja: "全集・双書", ar: "أعمال كاملة ومجموعات" },
  "4": { en: "Mook / Magazine-Book", ja: "ムック", ar: "كتاب-مجلة (موك)" },
  "5": { en: "Dictionary / Reference", ja: "事・事典", ar: "معاجم ومراجع" },
  "6": { en: "Graphic / Illustrated Guide", ja: "図鑑", ar: "أطلس ودليل مصور" },
  "7": { en: "Picture Book", ja: "絵本", ar: "قصص مصورة للأطفال" },
  "8": { en: "Magnetic / Audio Media", ja: "磁気・録音媒体", ar: "وسائط صوتية ورقمية" },
  "9": { en: "Manga / Comics", ja: "コミック", ar: "مانغا وقصص مصورة" },
};

const C_CODE_SUBJECT: Record<string, TrilingualLabel> = {
  "00": { en: "Generalities", ja: "総記", ar: "معارف عامة" },
  "10": { en: "Philosophy & Psychology", ja: "哲学・心理学", ar: "فلسفة وعلم نفس" },
  "11": { en: "Religion", ja: "宗教", ar: "أديان" },
  "20": { en: "History & Geography", ja: "歴史・地理", ar: "تاريخ وجغرافيا" },
  "30": { en: "Social Sciences", ja: "社会科学", ar: "علوم اجتماعية" },
  "31": { en: "Politics", ja: "政治", ar: "علوم سياسية" },
  "32": { en: "Economics", ja: "経済", ar: "اقتصاد" },
  "33": { en: "Business & Management", ja: "経営", ar: "إدارة وأعمال" },
  "40": { en: "Natural Sciences & Math", ja: "自然科学・数学", ar: "علوم طبيعية ورياضيات" },
  "50": { en: "Technology & Engineering", ja: "工学・工業", ar: "هندسة وتكنولوجيا" },
  "60": { en: "Industry & Commerce", ja: "産業", ar: "صناعة وتجارة" },
  "70": { en: "Fine Arts & Music", ja: "芸術・美術", ar: "فنون جميلة وموسيقى" },
  "71": { en: "Design & Photography", ja: "デザイン・写真", ar: "تصميم وتصوير" },
  "76": { en: "Sports & Hobbies", ja: "趣味・スポーツ", ar: "هوايات ورياضة" },
  "80": { en: "Linguistics & Languages", ja: "語学", ar: "لغويات ولغات" },
  "90": { en: "Literature General", ja: "文学・総記", ar: "أدب عام ونقد" },
  "93": { en: "Japanese Literature", ja: "日本文学", ar: "أدب ياباني" },
  "95": { en: "English / American Literature", ja: "英米文学", ar: "أدب إنجليزي وأمريكي" },
  "97": { en: "Foreign Literature", ja: "外国文学", ar: "آداب أجنبية" },
  "98": { en: "Non-Fiction / Essay", ja: "随筆・ノンフィクション", ar: "مقالات وأدب واقعي" },
  "99": { en: "Comics / Graphic Novels", ja: "コミック", ar: "قصص وروايات مرسومة" },
};

/**
 * Decodes a Japanese C-Code (e.g. C0193 or from barcode 1920193004809)
 */
export function decodeCCode(cCodeOrBarcode: string): {
  code: string;
  audience: string;
  audienceJa: string;
  audienceAr: string;
  format: string;
  formatJa: string;
  formatAr: string;
  subject: string;
  subjectJa: string;
  subjectAr: string;
  priceYen?: number;
} | undefined {
  let code = "";
  let priceYen: number | undefined;

  // Check if it's the Japanese 2nd barcode: 192 + 4-digit C-code + 5-digit price + 1 check digit
  if (/^192\d{10}$/.test(cCodeOrBarcode)) {
    code = "C" + cCodeOrBarcode.slice(3, 7);
    priceYen = parseInt(cCodeOrBarcode.slice(7, 12), 10);
  } else if (/^C\d{4}$/i.test(cCodeOrBarcode.trim())) {
    code = cCodeOrBarcode.trim().toUpperCase();
  } else {
    const match = cCodeOrBarcode.match(/C(\d{4})/i);
    if (match) {
      code = "C" + match[1];
    }
  }

  if (!code || code.length !== 5) return undefined;

  const audDigit = code[1];
  const formDigit = code[2];
  const subjDigits = code.slice(3, 5);

  const audObj = C_CODE_AUDIENCE[audDigit] || {
    en: `Audience Code ${audDigit}`,
    ja: `読者対象コード ${audDigit}`,
    ar: `رمز الفئة المستهدفة ${audDigit}`,
  };
  const formObj = C_CODE_FORMAT[formDigit] || {
    en: `Format Code ${formDigit}`,
    ja: `形態コード ${formDigit}`,
    ar: `رمز شكل التجليد ${formDigit}`,
  };
  const subjObj = C_CODE_SUBJECT[subjDigits] || {
    en: `Subject Code ${subjDigits}`,
    ja: `内容コード ${subjDigits}`,
    ar: `رمز الموضوع ${subjDigits}`,
  };

  return {
    code,
    audience: audObj.en,
    audienceJa: audObj.ja,
    audienceAr: audObj.ar,
    format: formObj.en,
    formatJa: formObj.ja,
    formatAr: formObj.ar,
    subject: subjObj.en,
    subjectJa: subjObj.ja,
    subjectAr: subjObj.ar,
    priceYen,
  };
}

/**
 * Calculate ISBN-10 check digit
 */
export function calculateIsbn10Check(base9: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(base9[i], 10) * (10 - i);
  }
  const rem = (11 - (sum % 11)) % 11;
  return rem === 10 ? "X" : rem.toString();
}

/**
 * Calculate ISBN-13 check digit
 */
export function calculateIsbn13Check(base12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base12[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  return ((10 - (sum % 10)) % 10).toString();
}

/**
 * Convert 10-digit ISBN to standard 13-digit ISBN
 */
export function isbn10To13(isbn10: string): string {
  const digits = isbn10.replace(/[^0-9X]/gi, "");
  if (digits.length !== 10) return isbn10;
  const base12 = "978" + digits.slice(0, 9);
  return base12 + calculateIsbn13Check(base12);
}

/**
 * Convert 13-digit ISBN to 10-digit ISBN (if 978 prefix)
 */
export function isbn13To10(isbn13: string): string | null {
  const digits = isbn13.replace(/[^0-9]/g, "");
  if (digits.length !== 13 || !digits.startsWith("978")) return null;
  const base9 = digits.slice(3, 12);
  return base9 + calculateIsbn10Check(base9);
}

/**
 * Comprehensive parser for any book identifier:
 * - Japanese ISBN4 (e.g. ISBN4-06-200511-3, 4-06-200511-3)
 * - Dual Japanese Barcodes (EAN 9784... + 192...)
 * - Arbitrary hyphens and letters (e.g. SBN, LCCN 2001-12345, OCLC, ASIN)
 */
export function parseBookIdentifier(input: string): ParsedIdentifier {
  const raw = input.trim();
  const cleaned = raw.replace(/\s+/g, " ");

  // Check for Japanese 2nd barcode (192...)
  if (/^192\d{10}$/.test(raw.replace(/[^0-9]/g, ""))) {
    const cCode = decodeCCode(raw.replace(/[^0-9]/g, ""));
    return {
      raw,
      cleaned,
      type: "Dual-Barcode-CCode",
      cCode,
    };
  }

  // Check if starts with Japanese ISBN4 prefix or 4-...
  const isJapanesePrefixed =
    /^ISBN\s*4[-0-9X]+/i.test(raw) ||
    /^4-\d{2,7}-\d{2,7}-[\dX]/i.test(raw);

  // Digits and X only
  const digitsX = raw.replace(/[^0-9X]/gi, "").toUpperCase();

  // 9-digit legacy SBN
  if (digitsX.length === 9) {
    // SBN can be converted to 10-digit by prepending 0 or 4 (if Japanese)
    const prefix = isJapanesePrefixed ? "4" : "0";
    const isbn10Candidate = prefix + digitsX.slice(0, 8);
    const check = calculateIsbn10Check(isbn10Candidate);
    const full10 = isbn10Candidate + check;
    return {
      raw,
      cleaned,
      type: "SBN",
      isbn10: full10,
      isbn13: isbn10To13(full10),
    };
  }

  // 10-digit ISBN
  if (digitsX.length === 10) {
    const isJapanese = digitsX.startsWith("4") || isJapanesePrefixed;
    const base9 = digitsX.slice(0, 9);
    const expectedCheck = calculateIsbn10Check(base9);
    const isValid = digitsX[9] === expectedCheck;
    const isbn13 = isbn10To13(digitsX);

    return {
      raw,
      cleaned,
      type: isJapanese ? "Japanese-ISBN4" : "ISBN-10",
      isbn10: digitsX,
      isbn13,
      japaneseIsbn4: isJapanese ? `ISBN4-${digitsX.slice(1, 3)}-${digitsX.slice(3, 9)}-${digitsX[9]}` : undefined,
      isValidCheckDigit: isValid,
    };
  }

  // 13-digit ISBN
  if (digitsX.length === 13) {
    const isJapanese = digitsX.startsWith("9784") || digitsX.startsWith("9794");
    const base12 = digitsX.slice(0, 12);
    const expectedCheck = calculateIsbn13Check(base12);
    const isValid = digitsX[12] === expectedCheck;
    const isbn10 = isbn13To10(digitsX) || undefined;

    return {
      raw,
      cleaned,
      type: isJapanese ? "Japanese-ISBN4" : "ISBN-13",
      isbn13: digitsX,
      isbn10,
      japaneseIsbn4: isJapanese && isbn10 ? `ISBN4-${isbn10.slice(1, 3)}-${isbn10.slice(3, 9)}-${isbn10[9]}` : undefined,
      isValidCheckDigit: isValid,
    };
  }

  // Check for Library of Congress (LCCN e.g. 2001-012345 or 98-12345)
  if (/^(?:LCCN\s*)?(\d{2,4}-\d{6})$/i.test(cleaned)) {
    return {
      raw,
      cleaned,
      type: "LCCN",
    };
  }

  // Check for OCLC
  if (/^(?:OCLC\s*)?(\d{7,10})$/i.test(cleaned)) {
    return {
      raw,
      cleaned,
      type: "OCLC",
    };
  }

  // General alphanumeric identifier with hyphens and letters
  return {
    raw,
    cleaned,
    type: "Alphanumeric",
  };
}

/**
 * Format an ISBN with standard hyphens for readable librarian display
 */
export function formatIsbnHyphens(isbn: string): string {
  const digits = isbn.replace(/[^0-9X]/gi, "").toUpperCase();
  if (digits.length === 13) {
    // 978-4-xx-xxxxxx-x for Japan
    if (digits.startsWith("9784")) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 12)}-${digits.slice(12)}`;
    }
    // 978-977-xx-xxxx-x for Egypt/Arab
    if (digits.startsWith("978977")) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}-${digits.slice(12)}`;
    }
    // 978-9953-xx-xxx-x for Lebanon
    if (digits.startsWith("9789953")) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 12)}-${digits.slice(12)}`;
    }
    // General 978-x-xxx-xxxxx-x
    return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 12)}-${digits.slice(12)}`;
  } else if (digits.length === 10) {
    if (digits.startsWith("4")) {
      return `4-${digits.slice(1, 3)}-${digits.slice(3, 9)}-${digits.slice(9)}`;
    }
    return `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return isbn;
}
