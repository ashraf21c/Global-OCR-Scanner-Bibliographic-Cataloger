export interface AuthorRecord {
  name: string;
  transliteratedName?: string;
  role?: string;
  viafId?: string;
  ndlId?: string;
  locId?: string;
  bio?: string;
}

export interface BookIdentifiers {
  isbn13?: string;
  isbn10?: string;
  japaneseIsbn4?: string;
  cCode?: string; // Japanese C-Code (e.g., C0193)
  asin?: string; // Amazon Japan ASIN
  lccn?: string; // Library of Congress Control Number
  oclc?: string; // WorldCat OCLC number
  librarything?: string; // LibraryThing work ID
  nwfId?: string; // Neelwafurat book ID
  abjadId?: string; // Abjad book ID
  aucId?: string; // Arabic Union Catalog (الفهرس العربي الموحد) ID
  kfnlId?: string; // King Fahd National Library (مكتبة الملك فهد الوطنية)
  darElKotobId?: string; // Egyptian National Library & Archives (دار الكتب المصرية)
  hindawiId?: string; // Hindawi Foundation (مؤسسة هنداوي)
  noorBookId?: string; // Noor-Book (مكتبة نور)
  alManhalId?: string; // Al-Manhal (المنهل)
  jamalonId?: string; // Jamalon (جملون)
  kotobnaId?: string; // Kotobna (كتبنا)
  issn?: string; // International Standard Serial Number (e.g. 0028-0836)
  eIssn?: string; // Electronic ISSN
  issnL?: string; // Linking ISSN (ISSN-L)
  coden?: string; // Chemical/Scientific serial CODEN
  rawOcrText?: string;
}

export interface BookClassifications {
  ndc?: string; // Nippon Decimal Classification
  dewey?: string; // Standard Dewey Decimal Classification
  arabicDewey?: string; // Arabic Dewey 10 (التصنيف العشري العربي لديوي - ألكسو / الفهرس العربي)
  arabicDeweyName?: string; // Arabic subject title (e.g. الرواية العربية, الفقه الإسلامي)
  lcc?: string; // Library of Congress Classification
  cCode?: string; // Japanese C-Code classification breakdown
  subjectHeadings?: string[];
  classificationBasis?: "ndc" | "cCode" | "catalog_dewey" | "lcc" | "abstract_subjects" | "title_only";
  classificationNote?: {
    en: string;
    ar: string;
    ja: string;
  };
}

export interface BookPhysical {
  pageCount?: number;
  format?: string;
  dimensions?: string;
  price?: string;
}

export interface CatalogSourceResult {
  name: string;
  url?: string;
  matched: boolean;
  notes?: string;
  catalogCategory?: "japanese" | "arabic" | "global_authority" | "commercial";
}

export interface CrossReferencedEdition {
  title: string;
  language: string;
  isbn?: string;
  publisher?: string;
  year?: string;
  relation: string; // "Original Edition", "Arabic Translation", "English Translation", "Revised Edition"
}

export interface BookCitations {
  apa?: string;
  mla?: string;
  chicagoNotes?: string;
  chicagoAuthorDate?: string;
  harvard?: string;
  ieee?: string;
  sist02?: string; // Japanese SIST 02 standard
  arabicStandard?: string; // Arab bibliographic citation standard
}

export interface BookRecord {
  id: string;
  title: string;
  titleRomajiOrTranslated?: string;
  subtitle?: string;
  originalLanguageTitle?: string;
  authors: AuthorRecord[];
  publisher: string;
  publishedDate: string;
  language: "ja" | "ar" | "en" | "fr" | "de" | "other" | string;
  materialType?: "book" | "magazine" | "journal" | "serial";
  periodicalInfo?: {
    frequency?: string; // Monthly, Quarterly, Weekly, Annual, etc.
    frequencyJa?: string; // 月刊, 季刊, 週刊, 年刊
    frequencyAr?: string; // شهرية, فصلية, أسبوعية, سنوية
    volume?: string;
    issue?: string;
    startYear?: string;
    country?: string;
    keyTitle?: string;
    issnPortalUrl?: string;
    crossrefUrl?: string;
  };
  description?: string;
  coverImageUrl?: string;
  altCoverUrls?: string[];
  identifiers: BookIdentifiers;
  classifications: BookClassifications;
  physical: BookPhysical;
  sourcesFound: CatalogSourceResult[];
  crossReferencedEditions: CrossReferencedEdition[];
  citations: BookCitations;
  timestamp: number;
  notes?: string;
  tags?: string[];
  shelfLocation?: string;
}

export interface OcrResult {
  exactRawText: string;
  primaryIdentifier?: string;
  identifierType?: string;
  cCode?: string;
  price?: string;
  titleHint?: string;
  authorHint?: string;
  publisherHint?: string;
  languageHint?: string;
  confidence?: number;
  allExtractedTokens?: string[];
}

export interface ControlPanelConfig {
  rateLimitPerMinute: number;
  hasGoogleCseKey: boolean;
  hasGoogleCseCx: boolean;
  hasAmazonPaApi: boolean;
  hasWorldcatKey: boolean;
  cacheEnabled: boolean;
  cachedRecordsCount: number;
}

export interface RequestMetrics {
  totalLookups: number;
  totalOcr: number;
  totalCrawls: number;
  cacheHits: number;
  lastRequestTime: string;
}
