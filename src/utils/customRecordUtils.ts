/**
 * Custom Bibliographic Record Utilities & JSON5 Multi-Record Importer
 * Supports manual form entry, JSON5 batch parsing, and codebase injection instructions.
 */

import JSON5 from "json5";
import { BookRecord, AuthorRecord } from "../types/book";
import { isbn10To13, isbn13To10, calculateIssnCheck, validateIssn } from "./isbnUtils";
import { convertStandardDeweyToArabicDewey } from "./arabicDeweyUtils";

/**
 * Complete, rich JSON5 sample template containing all supported fields
 * Covers Monograph Book (with Japanese ISBN4/C-Code), Arabic Edition (with Arabic Dewey 10),
 * and Serial Periodical / Magazine (with ISSN and publication frequency).
 */
export const SAMPLE_JSON5_TEMPLATE = `// ============================================================================
// Comprehensive JSON5 Bibliographic Import Sample
// Features supported by JSON5:
//   - Comments (like this one)
//   - Unquoted object keys (e.g. title: '...')
//   - Trailing commas in arrays and objects
//   - Single and double quoted strings
//   - Multiline strings with backslash
// ============================================================================

[
  // --------------------------------------------------------------------------
  // Record 1: Classic Japanese Book with Dual Barcode C-Code & NDC
  // --------------------------------------------------------------------------
  {
    id: 'custom-kokoro-1914',
    materialType: 'book', // 'book' | 'magazine' | 'journal' | 'serial'
    title: 'こころ (Kokoro)',
    titleRomajiOrTranslated: 'Kokoro: The Heart of Things',
    subtitle: '岩波文庫 (Iwanami Bunko Classic Edition)',
    originalLanguageTitle: '心',
    language: 'ja',
    publisher: '岩波書店 (Iwanami Shoten)',
    publishedDate: '1989-06-16',
    description: '『こころ』は夏目漱石の代表作。明治の精神の終焉と人間の孤独、罪の意識を描いた近代日本文学の不滅の古典。',
    coverImageUrl: 'https://images-na.ssl-images-amazon.com/images/P/4003101014.09.LZZZZZZZ.jpg',
    altCoverUrls: [
      'https://images-na.ssl-images-amazon.com/images/P/4003101014.09.LZZZZZZZ.jpg',
      'https://cover.openbd.jp/9784003101018.jpg',
    ],
    authors: [
      {
        name: '夏目漱石',
        transliteratedName: 'Natsume Sōseki',
        role: 'Author',
        viafId: '108238901',
        ndlId: '00054222',
        locId: 'n79056789',
        bio: '明治の文豪。代表作に『吾輩は猫である』『坊っちゃん』『こころ』など。',
      },
    ],
    identifiers: {
      isbn13: '9784003101018',
      isbn10: '4003101014',
      japaneseIsbn4: 'ISBN4-00-310101-4',
      cCode: 'C0193', // General, Bunko Paperback, Japanese Literature
      asin: '4003101014',
      lccn: '89-012847',
      oclc: '20782394',
    },
    classifications: {
      ndc: '913.6', // Nippon Decimal Classification
      dewey: '895.634',
      arabicDewey: '813',
      arabicDeweyName: 'القصة والرواية (الأدب المترجم)',
      lcc: 'PL812.A8 K6',
      subjectHeadings: [
        'Japanese Fiction - Meiji Period',
        'Psychological Fiction',
      ],
      classificationBasis: 'ndc',
    },
    physical: {
      pageCount: 382,
      format: '文庫 (Bunko Paperback)',
      dimensions: '15.0 x 10.6 cm',
      price: '¥480 + tax',
    },
    sourcesFound: [
      { name: 'National Diet Library (NDL)', matched: true, notes: 'Official NDC 913.6' },
      { name: 'Amazon Japan', matched: true, notes: 'ASIN 4003101014' },
    ],
    citations: {
      apa: 'Natsume, S. (1989). Kokoro (こころ). Iwanami Shoten.',
      mla: 'Natsume, Sōseki. こころ (Kokoro). Iwanami Shoten, 1989.',
      sist02: '夏目漱石. こころ. 東京: 岩波書店, 1989, 382p. (岩波文庫).',
      arabicStandard: 'ناتسومي سوسيكي. (1989). كوكورو. طوكيو: إيوانامي شوتين.',
    },
  },

  // --------------------------------------------------------------------------
  // Record 2: Arabic Monograph with Arabic Dewey 10 (ALECSO Standard)
  // --------------------------------------------------------------------------
  {
    id: 'custom-korea-story-ar',
    materialType: 'book',
    title: 'قصة كوريا: فهم الكوريين وثقافتهم',
    titleRomajiOrTranslated: 'The Story of Korea: Understanding Koreans and their Culture',
    subtitle: 'إصدارات المركز القومي للترجمة - العدد 3418',
    language: 'ar',
    publisher: 'المركز القومي للترجمة (National Center for Translation - Cairo)',
    publishedDate: '2022',
    description: 'دراسة أنثروبولوجية وثقافية معمقة حول طبيعة المجتمع الكوري وجذوره التاريخية وقيمه الاجتماعية وطقوس الشامانية وأبجدية الهانغول.',
    coverImageUrl: 'https://cdn.raffy.me/resize/400x600/covers/raffy.me_404420.webp',
    authors: [
      {
        name: 'تشوي جون شيك',
        transliteratedName: 'Choi Joon-shik',
        role: 'Author',
        bio: 'أستاذ الدراسات الكورية بجامعة إيها في سيول.',
      },
      {
        name: 'د. محمود عبد الغفار',
        transliteratedName: 'Dr. Mahmoud Abdel Ghaffar',
        role: 'Translator',
        bio: 'أستاذ الأدب المقارن بجامعة القاهرة.',
      },
    ],
    identifiers: {
      isbn13: '9789779224664',
      isbn10: '9779224661',
      nwfId: 'NWF-268593',
      aucId: 'AUC-EG-224664',
      darElKotobId: 'DEK-2022-1422',
    },
    classifications: {
      dewey: '951.9',
      arabicDewey: '951.9',
      arabicDeweyName: 'تاريخ كوريا وشعبها (تاريخ آسيا والشرق الأقصى)',
      lcc: 'DS904',
      subjectHeadings: [
        'كوريا - الحضارة والأنثروبولوجيا الثقافية',
        'المجتمع الكوري - العادات والتقاليد',
      ],
      classificationBasis: 'abstract_subjects',
    },
    physical: {
      pageCount: 116,
      format: 'غلاف عادي (Paperback)',
      dimensions: '24.0 x 17.0 cm',
      price: '90 EGP',
    },
    citations: {
      apa: 'جون شيك, ت. (2022). قصة كوريا: فهم الكوريين وثقافتهم (ترجمة م. عبد الغفار). المركز القومي للترجمة.',
      mla: 'تشوي جون شيك. قصة كوريا. ترجمة محمود عبد الغفار, المركز القومي للترجمة, 2022.',
      arabicStandard: 'تشوي جون شيك. (2022). قصة كوريا: فهم الكوريين وثقافتهم (ترجمة د. محمود عبد الغفار). القاهرة: المركز القومي للترجمة.',
    },
  },

  // --------------------------------------------------------------------------
  // Record 3: Serial Magazine / Periodical with ISSN (Kuwait / Arabic Monthly)
  // --------------------------------------------------------------------------
  {
    id: 'custom-al-arabi-magazine',
    materialType: 'magazine', // 'magazine' or 'journal'
    title: 'مجلة العربي (Al-Arabi Magazine)',
    titleRomajiOrTranslated: 'Al-Arabi Cultural & Literary Monthly',
    subtitle: 'مجلة شهرية ثقافية مصورة - وزارة الإعلام بدولة الكويت',
    language: 'ar',
    publisher: 'وزارة الإعلام - دولة الكويت',
    publishedDate: '1958-12-01',
    description: 'مجلة ثقافية شهرية عربية مصورة تأسست عام 1958، اشتهرت باستطلاعاتها المصورة النادرة حول مدن العالم وتاريخ الحضارات.',
    coverImageUrl: 'https://upload.wikimedia.org/wikipedia/ar/0/07/Al-Arabi_Magazine_first_issue.jpg',
    authors: [
      {
        name: 'د. أحمد زكي',
        transliteratedName: 'Dr. Ahmad Zaki',
        role: 'Founding Editor-in-Chief',
      },
    ],
    identifiers: {
      issn: '0002-3973',
      aucId: 'AUC-SERIAL-00023973',
      lccn: 'ne64003504',
      oclc: '4995963',
    },
    periodicalInfo: {
      frequency: 'Monthly (شهري)',
      frequencyAr: 'شهرية',
      frequencyJa: '月刊',
      volume: 'العدد 780',
      startYear: '1958',
      country: 'الكويت (Kuwait)',
      keyTitle: 'Al-ʻArabī (al-Kuwayt)',
      issnPortalUrl: 'https://portal.issn.org/resource/ISSN/0002-3973',
    },
    classifications: {
      dewey: '059.27',
      arabicDewey: '051',
      arabicDeweyName: 'المجلات والدوريات العامة العربية',
      lcc: 'AP95.A6 A7',
      subjectHeadings: [
        'الدوريات والمجلات العربية - الكويت',
        'الثقافة والفكر العربي المعاصر',
      ],
      classificationBasis: 'abstract_subjects',
    },
    physical: {
      pageCount: 196,
      format: 'مجلة مصورة ملونة (Magazine)',
      dimensions: '27.5 x 20.5 cm',
      price: '100 Fils (الكويت)',
    },
    citations: {
      apa: 'مجلة العربي. (1958-). وزارة الإعلام بدولة الكويت.',
      mla: 'مجلة العربي. وزارة الإعلام بدولة الكويت, 1958-.',
      arabicStandard: 'مجلة العربي. (1958-). الكويت: وزارة الإعلام.',
    },
  },
]
`;

/**
 * Normalizes and fills defaults for an imported or manually created record
 */
export function normalizeCustomBookRecord(raw: Partial<BookRecord>): BookRecord {
  const now = Date.now();
  const id = raw.id || `custom-rec-${now}-${Math.random().toString(36).slice(2, 7)}`;
  const title = (raw.title || "Untitled Record").trim();
  const publisher = (raw.publisher || "Publisher Not Specified").trim();
  const publishedDate = (raw.publishedDate || new Date().getFullYear().toString()).trim();
  const language = raw.language || "en";
  const materialType = raw.materialType || (raw.identifiers?.issn ? "magazine" : "book");

  // Normalize Authors
  const authors: AuthorRecord[] = (raw.authors && raw.authors.length > 0)
    ? raw.authors.map((a) => ({
        name: a.name || "Unknown Author",
        transliteratedName: a.transliteratedName || a.name,
        role: a.role || "Author",
        viafId: a.viafId,
        ndlId: a.ndlId,
        locId: a.locId,
        bio: a.bio,
      }))
    : [{ name: "Catalog Author", role: "Author" }];

  // Normalize Identifiers
  const rawIdObj = raw.identifiers || {};
  let isbn13 = rawIdObj.isbn13?.replace(/[^0-9X]/gi, "");
  let isbn10 = rawIdObj.isbn10?.replace(/[^0-9X]/gi, "");
  let issn = rawIdObj.issn?.replace(/[^0-9X]/gi, "");

  if (isbn10 && !isbn13 && isbn10.length === 10) {
    isbn13 = isbn10To13(isbn10);
  }
  if (isbn13 && !isbn10 && isbn13.length === 13 && isbn13.startsWith("978")) {
    isbn10 = isbn13To10(isbn13) || undefined;
  }
  if (issn && issn.length === 8) {
    issn = `${issn.slice(0, 4)}-${issn.slice(4, 8)}`;
  }

  const isJp = language === "ja" || isbn13?.startsWith("9784") || isbn10?.startsWith("4");
  const japaneseIsbn4 = rawIdObj.japaneseIsbn4 || (isJp && isbn10 ? `ISBN4-${isbn10.slice(1, 3)}-${isbn10.slice(3, 9)}-${isbn10[9]}` : undefined);

  // Normalize Classifications
  const rawClass = raw.classifications || {};
  const dewey = rawClass.dewey;
  let arabicDewey = rawClass.arabicDewey;
  let arabicDeweyName = rawClass.arabicDeweyName;

  if (dewey && !arabicDewey) {
    const converted = convertStandardDeweyToArabicDewey(dewey);
    arabicDewey = converted.arabicDewey;
    arabicDeweyName = converted.arabicName;
  }

  // Citations auto-construction if missing
  const primaryAuthor = authors[0]?.name || "Author";
  const pubYear = publishedDate.slice(0, 4) || new Date().getFullYear().toString();
  const rawCitations = raw.citations || {};

  const citations = {
    apa: rawCitations.apa || `${primaryAuthor}. (${pubYear}). ${title}. ${publisher}.`,
    mla: rawCitations.mla || `${primaryAuthor}. ${title}. ${publisher}, ${pubYear}.`,
    chicagoNotes: rawCitations.chicagoNotes || `${primaryAuthor}, ${title} (${publisher}, ${pubYear}).`,
    chicagoAuthorDate: rawCitations.chicagoAuthorDate || `${primaryAuthor}. ${pubYear}. ${title}. ${publisher}.`,
    harvard: rawCitations.harvard || `${primaryAuthor} (${pubYear}) ${title}. ${publisher}.`,
    ieee: rawCitations.ieee || `[1] ${primaryAuthor}, ${title}. ${publisher}, ${pubYear}.`,
    sist02: rawCitations.sist02 || `${primaryAuthor}. ${title}. ${publisher}, ${pubYear}, ${raw.physical?.pageCount || 0}p.`,
    arabicStandard: rawCitations.arabicStandard || `${primaryAuthor}. (${pubYear}). ${title}. ${publisher}.`,
  };

  return {
    id,
    title,
    titleRomajiOrTranslated: raw.titleRomajiOrTranslated,
    subtitle: raw.subtitle,
    originalLanguageTitle: raw.originalLanguageTitle,
    authors,
    publisher,
    publishedDate,
    language,
    materialType,
    periodicalInfo: raw.periodicalInfo,
    description: raw.description,
    coverImageUrl: raw.coverImageUrl,
    altCoverUrls: raw.altCoverUrls || (raw.coverImageUrl ? [raw.coverImageUrl] : []),
    identifiers: {
      ...rawIdObj,
      isbn13,
      isbn10,
      japaneseIsbn4,
      issn,
    },
    classifications: {
      ...rawClass,
      dewey,
      arabicDewey,
      arabicDeweyName,
      classificationBasis: rawClass.classificationBasis || "abstract_subjects",
      classificationNote: rawClass.classificationNote || {
        en: "Manually registered and cataloged custom bibliographic record",
        ar: "سجل ببليوغرافي مخصص ومفهرس يدويًا",
        ja: "手動で登録・分類されたカスタム書誌レコード",
      },
    },
    physical: {
      pageCount: raw.physical?.pageCount,
      format: raw.physical?.format || (materialType === "magazine" ? "Magazine" : "Paperback"),
      dimensions: raw.physical?.dimensions,
      price: raw.physical?.price,
    },
    sourcesFound: raw.sourcesFound || [
      {
        name: "User Custom Database Entry",
        matched: true,
        notes: "Imported via Custom Record & JSON5 Manager",
      },
    ],
    crossReferencedEditions: raw.crossReferencedEditions || [],
    citations,
    timestamp: raw.timestamp || now,
    notes: raw.notes,
  };
}

/**
 * Parses and validates JSON5 string input.
 * Handles both a single BookRecord object or an array of BookRecords.
 */
export function parseAndValidateJson5(input: string): {
  success: boolean;
  records: BookRecord[];
  error?: string;
} {
  try {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, records: [], error: "Input is empty." };
    }

    const parsed = JSON5.parse(trimmed);

    let rawArray: any[] = [];
    if (Array.isArray(parsed)) {
      rawArray = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      // Single record or wrapped object
      if (Array.isArray(parsed.records)) {
        rawArray = parsed.records;
      } else if (Array.isArray(parsed.books)) {
        rawArray = parsed.books;
      } else {
        rawArray = [parsed];
      }
    } else {
      return { success: false, records: [], error: "JSON5 must contain an object or array of objects." };
    }

    if (rawArray.length === 0) {
      return { success: false, records: [], error: "No records found in JSON5 structure." };
    }

    const validated: BookRecord[] = [];
    for (let i = 0; i < rawArray.length; i++) {
      const item = rawArray[i];
      if (!item || typeof item !== "object") {
        return { success: false, records: [], error: `Record at index ${i} is not a valid object.` };
      }
      if (!item.title || typeof item.title !== "string" || !item.title.trim()) {
        return { success: false, records: [], error: `Record at index ${i} is missing required 'title' field.` };
      }
      validated.push(normalizeCustomBookRecord(item));
    }

    return { success: true, records: validated };
  } catch (err: any) {
    return {
      success: false,
      records: [],
      error: `JSON5 Syntax Error: ${err.message || String(err)}`,
    };
  }
}

/**
 * LocalStorage keys & persistence
 */
const STORAGE_KEY_CUSTOM_RECORDS = "bibliographic_custom_records_v1";

export function loadCustomRecordsFromLocalStorage(): BookRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeCustomBookRecord) : [];
  } catch (e) {
    console.warn("Failed to load custom records from localStorage", e);
    return [];
  }
}

export function saveCustomRecordsToLocalStorage(records: BookRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.warn("Failed to save custom records to localStorage", e);
  }
}
