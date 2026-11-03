/**
 * Comprehensive Multilingual Translations for Global Book Scanner & Bibliographic OCR
 * Full localization across English (en), Japanese (ja), and Arabic (ar)
 */

export type UiLanguage = "en" | "ja" | "ar";

export interface TranslationDict {
  // App Header & Global
  appTitle: string;
  appSubtitle: string;
  versionBadge: string;
  apiControlPanel: string;
  scannedRecordsCount: string;
  footerTagline: string;

  // Nav Tabs & Header
  currentlyActiveRecord: string;
  viewFullIntelligenceRecord: string;
  tabScanner: string;
  tabRecord: string;
  tabCitations: string;
  tabAuthority: string;
  tabBatch: string;
  btnArabicDewey: string;
  btnArabicDeweySub: string;
  btnSru: string;

  // Scanner View
  scannerTitle: string;
  scannerSubtitle: string;
  tabBarcode: string;
  tabOcr: string;
  tabUpload: string;
  tabManual: string;
  startCamera: string;
  stopCamera: string;
  switchCamera: string;
  torchToggle: string;
  scanStatusReady: string;
  scanStatusActive: string;
  cameraTips: string;
  japaneseIsbn4Tip: string;
  dualBarcodeTip: string;
  arabicColophonTip: string;
  presetsTitle: string;
  presetsSubtitle: string;
  manualPlaceholder: string;
  manualLookupBtn: string;
  analyzingBook: string;
  detectedCode: string;
  secondaryCode: string;
  confidence: string;

  // Book & Periodical Detail View
  bibRecordBadge: string;
  japaneseIsbn4Badge: string;
  materialTypeBook: string;
  materialTypeMagazine: string;
  materialTypeJournal: string;
  materialTypeSerial: string;
  issnBadge: string;
  publicationFrequency: string;
  issnPortalRegistry: string;
  periodicalDetailsTitle: string;
  foundedYearLabel: string;
  countryOfOriginLabel: string;
  btnCitationsQuick: string;
  btnExportQuick: string;
  btnSpineQuick: string;
  btnRecrawl: string;
  btnRecrawling: string;
  noCover: string;
  zoomCoverTitle: string;
  downloadCover: string;
  targetAudience: string;
  formBinding: string;
  subjectGenre: string;
  japaneseCCodeBreakdown: string;
  originalPrice: string;
  tabClassifications: string;
  tabCatalogSources: string;
  tabCrossRef: string;
  tabRawJson: string;
  ndcTitle: string;
  ndcDesc: string;
  ddcTitle: string;
  ddcDesc: string;
  arabicDeweyTitle: string;
  arabicDeweyDesc: string;
  arabicDeweyConvertBtn: string;
  lccTitle: string;
  lccDesc: string;
  priorityBannerTitle: string;
  priorityTitleOnlyWarning: string;
  prioritySourcePrefix: string;
  sourceMatched: string;
  sourceChecked: string;
  openExternalCatalog: string;
  noCrossRefs: string;
  crossRefColTitle: string;
  crossRefColLang: string;
  crossRefColPublisher: string;
  crossRefColRelation: string;

  // Librarian & Citation Tools
  librarianSuiteTitle: string;
  librarianSuiteDesc: string;
  tabCitationList: string;
  tabExportFormats: string;
  tabSpineSlip: string;
  copyCitationBtn: string;
  copiedCitationBtn: string;
  spineCallScheme: string;
  spineAuthorCutter: string;
  spinePrintBtn: string;
  batchExportHeading: string;
  batchExportDesc: string;

  // Authority Control
  authorityTitle: string;
  authoritySubtitle: string;
  authorityBadge: string;
  authorRecordNum: string;
  transliterationLabel: string;
  connectedAuthorityIds: string;
  ndlAuthorityBadge: string;
  locNacoBadge: string;
  viafBadge: string;
  matrixTitle: string;
  matrixDesc: string;

  // Batch History
  batchTitle: string;
  batchSubtitle: string;
  batchSearchPlaceholder: string;
  batchFilterAll: string;
  batchFilterJa: string;
  batchFilterAr: string;
  batchFilterWestern: string;
  batchSelectAll: string;
  batchDeselectAll: string;
  batchExportDropdown: string;
  batchClearAll: string;
  batchEmpty: string;

  // Arabic Dewey Calculator Modal
  adModalTitle: string;
  adModalSubtitle: string;
  adExplanationTitle: string;
  adExplanationBody: string;
  adDirectionLabel: string;
  adStdToArab: string;
  adArabToStd: string;
  adInputCodeLabel: string;
  adCalculatedResult: string;
  adBreakdownTitle: string;
  adApplyBtn: string;
  adPresetsTitle: string;
  adMainClassesTitle: string;

  // SRU & Z39.50 Modal
  sruModalTitle: string;
  sruModalSubtitle: string;
  sruSearchInputLabel: string;
  sruSearchPlaceholder: string;
  sruExecuteBtn: string;
  sruTargetsHeading: string;
  sruEnabled: string;
  sruDisabled: string;
  sruViewRawMarc: string;
  sruNoResults: string;

  // Control Panel
  cpTitle: string;
  cpSubtitle: string;
  cpApiKeysSection: string;
  cpRateLimitSection: string;
  cpSaveBtn: string;
  cpResetBtn: string;

  // Custom Record & JSON5 Manager
  btnAddCustomRecord: string;
  customModalTitle: string;
  customModalSubtitle: string;
  tabWebForm: string;
  tabJson5Import: string;
  tabCodeGuide: string;
  customFormTitle: string;
  customFormSubtitle: string;
  customFieldTitle: string;
  customFieldSubtitle: string;
  customFieldPublisher: string;
  customFieldYear: string;
  customFieldLanguage: string;
  customFieldMaterialType: string;
  customFieldAuthors: string;
  customFieldIsbn13: string;
  customFieldIsbn10: string;
  customFieldIssn: string;
  customFieldNdc: string;
  customFieldDewey: string;
  customFieldArabicDewey: string;
  customFieldLcc: string;
  customFieldCoverUrl: string;
  customFieldDescription: string;
  customFieldPages: string;
  customFieldPrice: string;
  customSaveBtn: string;
  customResetBtn: string;
  loadJson5SampleBtn: string;
  uploadJson5Btn: string;
  importJson5Btn: string;
  json5SyntaxHelp: string;
  codeGuideTitle: string;
  codeGuideSubtitle: string;
  codeGuideFileLabel: string;
  codeGuideInstructions: string;

  // Notifications
  notifyLookingUp: string;
  notifyRecordLoaded: string;
  notifyError: string;
  notifyDeepCrawl: string;
  notifyDeepCrawlDone: string;
}

export const TRANSLATIONS: Record<UiLanguage, TranslationDict> = {
  en: {
    appTitle: "Global Book Scanner & Bibliographic OCR",
    appSubtitle: "Japanese ISBN4 • Dual C-Code Barcodes • Arabic NWF & Abjad • Library of Congress & WorldCat",
    versionBadge: "v2.6 Multi-Catalog",
    apiControlPanel: "API Control Panel",
    scannedRecordsCount: "Scanned Records",
    footerTagline: "Global Bibliographic & OCR Engine • Supporting Japanese ISBN4, Arabic Catalogs, & Authority Files",
    currentlyActiveRecord: "Currently Active Catalog Record",
    viewFullIntelligenceRecord: "View Full Intelligence Record",

    tabScanner: "Scanner & OCR",
    tabRecord: "Record",
    tabCitations: "Citations & Labels",
    tabAuthority: "Authorities",
    tabBatch: "Batch",
    btnArabicDewey: "Arabic Dewey 10",
    btnArabicDeweySub: "ديوي العربي",
    btnSru: "SRU / Z39.50",

    scannerTitle: "High-Precision Barcode, QR & Book Colophon OCR",
    scannerSubtitle: "Reads modern ISBN-13, ISBN-10, legacy Japanese ISBN4, dual C-Code barcodes, and Arab publisher imprints.",
    tabBarcode: "Live Barcode Video",
    tabOcr: "Camera OCR (Colophon / Okuzuke / Title)",
    tabUpload: "Upload Photo",
    tabManual: "Manual / Identifier Entry",
    startCamera: "Start Camera Scanner",
    stopCamera: "Stop Camera",
    switchCamera: "Switch Camera",
    torchToggle: "Flashlight / Torch",
    scanStatusReady: "Aim camera at book barcode, QR, or colophon",
    scanStatusActive: "Scanning frame for barcodes and OCR tokens...",
    cameraTips: "Scan Tips for Japanese & Arabic Books",
    japaneseIsbn4Tip: "Japanese books often have dual barcodes (ISBN on top, C-code and price below) or legacy ISBN4 format.",
    dualBarcodeTip: "Dual Barcodes: The 2nd barcode starts with 192, containing the C-Code audience/subject classification and price in Yen.",
    arabicColophonTip: "Arabic Books: Scan the copyright colophon or title page for Dar El Kotob deposit, AUC ID, or ISBN.",
    presetsTitle: "Quick Test Presets",
    presetsSubtitle: "Click any book benchmark below to instantly test catalog resolution:",
    manualPlaceholder: "Type ISBN-13, ISBN-10, Japanese ISBN4, C-Code, or LCCN...",
    manualLookupBtn: "Lookup Identifier",
    analyzingBook: "Analyzing image via neural OCR engine...",
    detectedCode: "Primary Detected Code",
    secondaryCode: "Secondary C-Code Barcode",
    confidence: "OCR Confidence",

    bibRecordBadge: "Bibliographic Record",
    japaneseIsbn4Badge: "🇯🇵 Japanese ISBN4",
    materialTypeBook: "Book (Monograph)",
    materialTypeMagazine: "Magazine / Cultural Periodical",
    materialTypeJournal: "Academic Journal / Serial",
    materialTypeSerial: "Serial Publication",
    issnBadge: "ISSN Registered",
    publicationFrequency: "Publication Frequency",
    issnPortalRegistry: "ISSN International Centre (ROAD)",
    periodicalDetailsTitle: "Periodical & Serial Intelligence",
    foundedYearLabel: "Established / First Issue",
    countryOfOriginLabel: "Country of Publication",
    btnCitationsQuick: "Citations (APA, MLA, SIST02, Arabic)",
    btnExportQuick: "MARC21 / BibTeX / RIS",
    btnSpineQuick: "Spine & Barcode Slip",
    btnRecrawl: "Re-Crawl",
    btnRecrawling: "Crawling Catalogs...",
    noCover: "No Cover Image",
    zoomCoverTitle: "High-Resolution Cover Preview",
    downloadCover: "Download Cover Image",
    targetAudience: "Target Audience",
    formBinding: "Form / Binding",
    subjectGenre: "Subject / Genre",
    japaneseCCodeBreakdown: "Japanese C-Code Breakdown",
    originalPrice: "Base Price (本体価格)",
    tabClassifications: "Classifications & Library Shelf",
    tabCatalogSources: "Catalog Sources (Amazon JP, NDL, NWF, Abjad, LOC)",
    tabCrossRef: "Cross-Referenced Editions & Translations",
    tabRawJson: "Raw JSON Record",
    ndcTitle: "Nippon Decimal Classification (NDC)",
    ndcDesc: "Standard Japanese library scheme",
    ddcTitle: "Standard Dewey (DDC)",
    ddcDesc: "Global public library classification",
    arabicDeweyTitle: "Arabic Dewey 10 (ديوي العربي)",
    arabicDeweyDesc: "ALECSO / Arab League unified classification",
    arabicDeweyConvertBtn: "Convert & Calculate",
    lccTitle: "Library of Congress (LCC)",
    lccDesc: "Academic research call number",
    priorityBannerTitle: "Classification Calculation Priority",
    priorityTitleOnlyWarning: "⚠️ Title-Only Calculation",
    prioritySourcePrefix: "✓ Source:",
    sourceMatched: "Matched",
    sourceChecked: "Catalog Checked",
    openExternalCatalog: "Open Catalog Record",
    noCrossRefs: "No international cross-referenced editions indexed yet.",
    crossRefColTitle: "Title & Edition",
    crossRefColLang: "Language",
    crossRefColPublisher: "Publisher & Year",
    crossRefColRelation: "Bibliographic Relation",

    librarianSuiteTitle: "Librarian & Researcher Suite",
    librarianSuiteDesc: "Multi-format citations, MARC21/BibTeX/RIS export, and printable spine labels.",
    tabCitationList: "Citations & References",
    tabExportFormats: "Export Formats",
    tabSpineSlip: "Print Spine Label & Slip",
    copyCitationBtn: "Copy",
    copiedCitationBtn: "Copied!",
    spineCallScheme: "Spine Call Number Scheme",
    spineAuthorCutter: "Author Cutter",
    spinePrintBtn: "Print Spine Slip",
    batchExportHeading: "Export Scanned Record",
    batchExportDesc: "Choose from 12 library and data science formats including CSV, XLS, JSON, JSON5, RTL-aware HTML, and PDF.",

    authorityTitle: "Author Authority & Cross-Catalog Referencing",
    authoritySubtitle: "Harmonized authority records across VIAF, National Diet Library (NDL), Library of Congress, and Arabic repositories.",
    authorityBadge: "Authority Controlled",
    authorRecordNum: "Record",
    transliterationLabel: "Latin / Transliteration",
    connectedAuthorityIds: "Connected Authority Identifiers",
    ndlAuthorityBadge: "NDL 典拠",
    locNacoBadge: "LOC NACO",
    viafBadge: "VIAF",
    matrixTitle: "Universal Cross-Referencing Matrix",
    matrixDesc: "This record correlates identifiers between commercial Japanese bookstores, national libraries, and Arabic bibliographic databases.",

    batchTitle: "Scan History & Batch Librarian Catalog",
    batchSubtitle: "records scanned in this session.",
    batchSearchPlaceholder: "Search batch by title, author, ISBN, C-Code, or AUC ID...",
    batchFilterAll: "All Languages",
    batchFilterJa: "Japanese (日本語)",
    batchFilterAr: "Arabic (العربية)",
    batchFilterWestern: "Western Languages",
    batchSelectAll: "Select All",
    batchDeselectAll: "Deselect All",
    batchExportDropdown: "Batch Export All",
    batchClearAll: "Clear Batch History",
    batchEmpty: "No scanned records yet. Start scanning barcodes or colophon pages above!",

    adModalTitle: "Arabic Dewey 10 Conversion & Calculator",
    adModalSubtitle: "التصنيف العشري لديوي - الطبعة العربية والتعديل الموحد (المنظمة العربية للتربية والثقافة والعلوم)",
    adExplanationTitle: "What is the Arabic Adaptation of Dewey Decimal (Arabic Dewey 10)?",
    adExplanationBody: "In the standard Dewey system, Arab and Islamic cultural domains are confined to minor decimal subcategories (such as 892.7 for Arabic literature, 492.7 for Arabic language, and 297 for Islam). ALECSO and the Arabic Union Catalog reassigned primary 3-digit divisions: 210-219 for Islamic Sciences, 410-419 for Arabic Language, and 810-819 for Arabic Literature.",
    adDirectionLabel: "Conversion Direction (اتجاه التحويل)",
    adStdToArab: "Standard DDC → Arabic Dewey 10",
    adArabToStd: "Arabic Dewey 10 → Standard DDC",
    adInputCodeLabel: "Classification Code to Convert",
    adCalculatedResult: "Calculated Classification",
    adBreakdownTitle: "Hierarchical Classification Breakdown",
    adApplyBtn: "Apply to Current Book Record",
    adPresetsTitle: "Standard Arab Benchmark Conversions",
    adMainClassesTitle: "10 Main Classes of Arabic Dewey (الأصول العشرة)",

    sruModalTitle: "Direct SRU & Z39.50 Library Gateway Explorer",
    sruModalSubtitle: "Connects directly via Search/Retrieve via URL (SRU) and Z39.50 protocols to global national and union catalogs.",
    sruSearchInputLabel: "Target ISBN or Bath/CQL Query",
    sruSearchPlaceholder: "e.g. 9784003101018 or bath.isbn=\"9789770902345\"",
    sruExecuteBtn: "Query Connected Gateways",
    sruTargetsHeading: "Configured Library Repositories",
    sruEnabled: "Active Gateway",
    sruDisabled: "Disabled",
    sruViewRawMarc: "View Raw MARCXML / DC",
    sruNoResults: "No live SRU responses retrieved yet. Click 'Query Connected Gateways' to execute.",

    cpTitle: "External API Keys, Rate Limits & Crawlers Control Panel",
    cpSubtitle: "Manage commercial APIs, Google Custom Search credentials, crawler limits, and caching policies.",
    cpApiKeysSection: "External API Keys & Authentication",
    cpRateLimitSection: "Rate Limiting & Concurrency Controls",
    cpSaveBtn: "Save Settings",
    cpResetBtn: "Reset to Defaults",

    btnAddCustomRecord: "Add / Import Records",
    customModalTitle: "Custom Bibliographic Record & JSON5 Manager",
    customModalSubtitle: "Add unindexed books or periodicals to your library catalog via a structured web form or JSON5 batch import.",
    tabWebForm: "Manual Record Web Form",
    tabJson5Import: "JSON5 Multi-Record Batch Import",
    tabCodeGuide: "Direct Codebase Guide (File to Edit)",
    customFormTitle: "Catalog a New Book or Periodical",
    customFormSubtitle: "Fill in bibliographic details. Citations, check digits, and Arabic Dewey are calculated automatically.",
    customFieldTitle: "Title (Main Title)",
    customFieldSubtitle: "Subtitle / Series Title",
    customFieldPublisher: "Publisher / Press",
    customFieldYear: "Year / Publication Date",
    customFieldLanguage: "Language",
    customFieldMaterialType: "Material Type",
    customFieldAuthors: "Authors & Contributors (Comma separated)",
    customFieldIsbn13: "ISBN-13 (978...)",
    customFieldIsbn10: "ISBN-10",
    customFieldIssn: "ISSN (Periodical / Serial)",
    customFieldNdc: "Nippon Decimal (NDC)",
    customFieldDewey: "Standard Dewey (DDC)",
    customFieldArabicDewey: "Arabic Dewey 10 (ALECSO)",
    customFieldLcc: "Library of Congress (LCC)",
    customFieldCoverUrl: "Cover Artwork Image URL",
    customFieldDescription: "Description / Colophon / Abstract",
    customFieldPages: "Page Count",
    customFieldPrice: "List Price",
    customSaveBtn: "Save & Index to Database",
    customResetBtn: "Clear Form",
    loadJson5SampleBtn: "Load Complete JSON5 Sample",
    uploadJson5Btn: "Upload .json5 / .json File",
    importJson5Btn: "Import All Records to Database",
    json5SyntaxHelp: "JSON5 allows comments (//), unquoted keys, single quotes, and trailing commas. Perfect for bulk librarian imports.",
    codeGuideTitle: "How to Add Permanent Custom Records in the Codebase",
    codeGuideSubtitle: "For records that remain permanently bundled with the application without needing local browser storage:",
    codeGuideFileLabel: "File to Edit in Workspace:",
    codeGuideInstructions: "Open the file above, navigate to KNOWN_BIB_RECORDS, and paste your record using its ISBN-13, ISBN-10, or ISSN as the key.",

    notifyLookingUp: "Looking up & crawling catalog for",
    notifyRecordLoaded: "Catalog record loaded for",
    notifyError: "Failed to retrieve book metadata",
    notifyDeepCrawl: "Executing deep multi-catalog crawl across Amazon JP, NDL, NWF, Abjad, and WorldCat...",
    notifyDeepCrawlDone: "Deep cross-catalog sync completed!",
  },

  ja: {
    appTitle: "グローバル書籍スキャナー＆書誌OCR",
    appSubtitle: "日本のISBN4・2段バーコードCコード・アラビア語NWF&アブジャド・米国議会図書館&WorldCat",
    versionBadge: "v2.6 マルチ目録版",
    apiControlPanel: "API管理パネル",
    scannedRecordsCount: "スキャン済み件数",
    footerTagline: "グローバル書誌＆OCRエンジン • 日本のISBN4・アラビア語総合目録・著者典拠ファイルを完全網羅",
    currentlyActiveRecord: "現在選択中の書誌レコード",
    viewFullIntelligenceRecord: "書誌インテリジェンス詳細を表示",

    tabScanner: "スキャナー & OCR",
    tabRecord: "書誌レコード",
    tabCitations: "引用・書誌ラベル",
    tabAuthority: "典拠ファイル",
    tabBatch: "一括バッチ",
    btnArabicDewey: "アラビア十進分類10",
    btnArabicDeweySub: "ディウイー分類",
    btnSru: "SRU / Z39.50",

    scannerTitle: "高精度バーコード・QR・奥付書誌OCRエンジン",
    scannerSubtitle: "ISBN-13、ISBN-10、旧日本ISBN4、2段バーコードCコード、奥付（発行所・著者・定価）を完全認識。",
    tabBarcode: "バーコード映像スキャン",
    tabOcr: "奥付・標題紙カメラOCR",
    tabUpload: "画像ファイル読み込み",
    tabManual: "識別子手動入力",
    startCamera: "カメラスキャン開始",
    stopCamera: "カメラ停止",
    switchCamera: "カメラ切替",
    torchToggle: "ライト点灯 / 消灯",
    scanStatusReady: "書籍のバーコードまたは奥付にカメラを合わせてください",
    scanStatusActive: "映像フレーム内のバーコードおよび文字を解析中...",
    cameraTips: "日本書およびアラビア語書籍のスキャン手順",
    japaneseIsbn4Tip: "日本の書籍は上段ISBNと下段Cコード（分類・定価）の2段バーコード、またはISBN4-形式で記載されています。",
    dualBarcodeTip: "2段バーコード：下段192から始まるコードにはCコード（読者対象・形態・内容）と本体価格（円）が格納されています。",
    arabicColophonTip: "アラビア語書籍：巻頭または巻末の著作権奥付・標題紙から国立図書館登録番号やISBNを読み取ります。",
    presetsTitle: "検証用プリセット（名著サンプル）",
    presetsSubtitle: "以下の名著をクリックすると、即座に国内外の書誌目録を照会します：",
    manualPlaceholder: "ISBN-13、ISBN-10、日本ISBN4、Cコード、LCCNを入力...",
    manualLookupBtn: "識別子を検索",
    analyzingBook: "神経網OCRエンジンで文字認識中...",
    detectedCode: "検出された主コード",
    secondaryCode: "検出された2段目Cコード",
    confidence: "OCR認識信頼度",

    bibRecordBadge: "書誌レコード詳細",
    japaneseIsbn4Badge: "🇯🇵 日本のISBN4",
    materialTypeBook: "図書（単行本・文庫）",
    materialTypeMagazine: "雑誌・総合定期刊行物",
    materialTypeJournal: "学術雑誌・紀要",
    materialTypeSerial: "逐次刊行物",
    issnBadge: "ISSN 登録番号",
    publicationFrequency: "刊行頻度",
    issnPortalRegistry: "ISSN国際センター（ROAD）",
    periodicalDetailsTitle: "雑誌・逐次刊行物インテリジェンス",
    foundedYearLabel: "創刊年・創刊号",
    countryOfOriginLabel: "刊行国",
    btnCitationsQuick: "引用形式（SIST 02, APA, MLA, アラビア式）",
    btnExportQuick: "MARC21 / BibTeX / RIS",
    btnSpineQuick: "背表紙ラベル・配架スリップ",
    btnRecrawl: "深層再クロール",
    btnRecrawling: "目録照会中...",
    noCover: "表紙画像なし",
    zoomCoverTitle: "高解像度表紙プレビュー",
    downloadCover: "表紙画像をダウンロード",
    targetAudience: "読者対象",
    formBinding: "発行形態",
    subjectGenre: "内容・主題",
    japaneseCCodeBreakdown: "日本図書コード Cコード内訳",
    originalPrice: "本体価格",
    tabClassifications: "分類体系・配架記号",
    tabCatalogSources: "参照目録（Amazon JP, 国立国会図書館, NWF, アブジャド, LOC）",
    tabCrossRef: "相互参照版・翻訳書一覧",
    tabRawJson: "生JSONレコード",
    ndcTitle: "日本十進分類法（NDC）",
    ndcDesc: "日本の公共・大学図書館の標準分類",
    ddcTitle: "デューイ十進分類法（DDC）",
    ddcDesc: "世界各国の公共図書館標準分類",
    arabicDeweyTitle: "アラビア十進分類10（ALECSO）",
    arabicDeweyDesc: "アラブ連盟（ALECSO）およびアラブ統合目録の統一改訂版",
    arabicDeweyConvertBtn: "分類の変換と計算",
    lccTitle: "米国議会図書館分類法（LCC）",
    lccDesc: "学術・研究図書館向けの配架分類記号",
    priorityBannerTitle: "分類算出の優先順位・根拠",
    priorityTitleOnlyWarning: "⚠️ タイトル情報のみから算出",
    prioritySourcePrefix: "✓ 算出根拠:",
    sourceMatched: "所蔵確認済み",
    sourceChecked: "目録確認済み",
    openExternalCatalog: "外部目録レコードを開く",
    noCrossRefs: "相互参照されている国際版・翻訳書はまだ登録されていません。",
    crossRefColTitle: "書名・版表示",
    crossRefColLang: "言語",
    crossRefColPublisher: "出版元・出版年",
    crossRefColRelation: "書誌的関係",

    librarianSuiteTitle: "司書・研究者向け書誌ツール",
    librarianSuiteDesc: "多規格の文献引用、MARC21/BibTeX/RISエクスポート、印刷用背表紙ラベル生成。",
    tabCitationList: "参考文献引用リスト",
    tabExportFormats: "書誌データ出力形式",
    tabSpineSlip: "配架ラベル・バーコード印刷",
    copyCitationBtn: "コピー",
    copiedCitationBtn: "コピー完了!",
    spineCallScheme: "背表紙配架記号の体系",
    spineAuthorCutter: "著者カッター記号",
    spinePrintBtn: "配架ラベルを印刷",
    batchExportHeading: "書誌レコードのエクスポート",
    batchExportDesc: "CSV（Excel対応BOM付き含む）、XLS、JSON、JSON5、RTL対応HTML、印刷用PDFなど12形式に対応。",

    authorityTitle: "著者典拠ファイル＆横断書誌照合",
    authoritySubtitle: "国立国会図書館（NDL 典拠）、米国議会図書館（LOC NACO）、VIAF、アラブ諸国の典拠レコードを統合。",
    authorityBadge: "典拠コントロール済み",
    authorRecordNum: "著者番号",
    transliterationLabel: "ラテン文字表記 / 翻字",
    connectedAuthorityIds: "連携典拠識別子",
    ndlAuthorityBadge: "NDL 典拠",
    locNacoBadge: "LOC NACO",
    viafBadge: "VIAF",
    matrixTitle: "国際書誌識別子クロスリファレンス表",
    matrixDesc: "日本の書店識別子、国立図書館蔵書、アラブ圏の書誌データベースの相互リンクを保持します。",

    batchTitle: "スキャン履歴＆一括目録管理",
    batchSubtitle: "件の書籍が現在セッションに登録されています。",
    batchSearchPlaceholder: "書名、著者、ISBN、Cコード、AUC IDで検索...",
    batchFilterAll: "すべての言語",
    batchFilterJa: "日本語書籍",
    batchFilterAr: "アラビア語書籍",
    batchFilterWestern: "欧文書籍",
    batchSelectAll: "全選択",
    batchDeselectAll: "選択解除",
    batchExportDropdown: "一括エクスポート",
    batchClearAll: "履歴をクリア",
    batchEmpty: "スキャンされた書籍はありません。上部のスキャナーから読み取りを開始してください。",

    adModalTitle: "アラビア十進分類10 変換・計算ツール",
    adModalSubtitle: "アラブ連盟教育文化科学機構（ALECSO）およびアラブ統一目録（AUC）によるデューイ改訂版",
    adExplanationTitle: "アラビア十進分類（Arabic Dewey 10）とは？",
    adExplanationBody: "従来のデューイ分類法では、アラブ・イスラム文化圏は小区分に限定されていました。ALECSOとアラブ統一目録は、210〜219番を「イスラム諸科学」、410〜419番を「アラビア語学」、810〜819番を「アラビア文学」として独立展開させました。",
    adDirectionLabel: "変換方向の指定",
    adStdToArab: "標準デューイ（DDC） → アラビア十進10",
    adArabToStd: "アラビア十進10 → 標準デューイ（DDC）",
    adInputCodeLabel: "変換対象の分類番号",
    adCalculatedResult: "算出された分類記号",
    adBreakdownTitle: "階層分類の内訳",
    adApplyBtn: "現在の書籍レコードに適用",
    adPresetsTitle: "標準アラビア分類の代表例",
    adMainClassesTitle: "アラビア十進分類の10大綱（الأصول العشرة）",

    sruModalTitle: "SRU / Z39.50 国際図書館ゲートウェイ照会",
    sruModalSubtitle: "国立国会図書館（NDL Search）、米国議会図書館、大英図書館、アラブ統一目録、アレクサンドリア図書館等のプロトコル直接照会。",
    sruSearchInputLabel: "検索ISBNまたはBath/CQLクエリ",
    sruSearchPlaceholder: "例：9784003101018 または bath.isbn=\"9789770902345\"",
    sruExecuteBtn: "接続先ゲートウェイを一括照会",
    sruTargetsHeading: "登録済み図書館・目録リポジトリ",
    sruEnabled: "有効",
    sruDisabled: "無効",
    sruViewRawMarc: "MARCXML / DC生データ表示",
    sruNoResults: "照会結果はまだありません。「接続先ゲートウェイを一括照会」を押して実行してください。",

    cpTitle: "外部APIキー・レート制限・クローラー管理設定",
    cpSubtitle: "Amazon Japan、Googleカスタム検索、WorldCat、レート制限およびキャッシュの管理。",
    cpApiKeysSection: "外部API認証キー設定",
    cpRateLimitSection: "レート制限・同時実行数設定",
    cpSaveBtn: "設定を保存",
    cpResetBtn: "初期設定に戻す",

    btnAddCustomRecord: "レコード追加・インポート",
    customModalTitle: "カスタム書誌レコード管理＆JSON5インポート",
    customModalSubtitle: "未採録の書籍や定期刊行物の個別手動登録、およびJSON5による複数レコード一括インポート。",
    tabWebForm: "書誌手動入力フォーム",
    tabJson5Import: "JSON5複数レコード一括インポート",
    tabCodeGuide: "ソースコード直接編集ガイド",
    customFormTitle: "新規書籍・逐次刊行物の登録",
    customFormSubtitle: "書誌情報を入力すると、引用記号・検査数字・アラビア十進分類が自動算出されます。",
    customFieldTitle: "書名・本タイトル",
    customFieldSubtitle: "副書名・シリーズ名",
    customFieldPublisher: "出版社・発行所",
    customFieldYear: "出版年・発行日",
    customFieldLanguage: "言語",
    customFieldMaterialType: "資料種別",
    customFieldAuthors: "著者・編者（カンマ区切り）",
    customFieldIsbn13: "ISBN-13（978...）",
    customFieldIsbn10: "ISBN-10",
    customFieldIssn: "ISSN（雑誌・逐次刊行物）",
    customFieldNdc: "日本十進分類法（NDC）",
    customFieldDewey: "標準デューイ分類（DDC）",
    customFieldArabicDewey: "アラビア十進分類10（ALECSO）",
    customFieldLcc: "米国議会図書館分類（LCC）",
    customFieldCoverUrl: "表紙画像URL",
    customFieldDescription: "内容紹介・奥付・抄録",
    customFieldPages: "ページ数",
    customFieldPrice: "定価・本体価格",
    customSaveBtn: "保存してデータベースに登録",
    customResetBtn: "フォームをクリア",
    loadJson5SampleBtn: "完全なJSON5サンプルを読込",
    uploadJson5Btn: ".json5 / .jsonファイルを読込",
    importJson5Btn: "全レコードを一括インポート",
    json5SyntaxHelp: "JSON5はコメント（//）、引用符省略キー、単一引用符、末尾カンマに対応。司書の大量インポートに最適です。",
    codeGuideTitle: "ソースコードに恒久レコードを追加する方法",
    codeGuideSubtitle: "ブラウザのローカルストレージに依存せず、アプリに恒久的に組み込む場合：",
    codeGuideFileLabel: "編集対象ファイル（ワークスペース）:",
    codeGuideInstructions: "上記のファイルを開き、KNOWN_BIB_RECORDS の中に ISBN-13、ISBN-10 または ISSN をキーとしてレコードを追加してください。",

    notifyLookingUp: "目録を照会中:",
    notifyRecordLoaded: "書誌レコードを読み込みました:",
    notifyError: "書誌メタデータの取得に失敗しました",
    notifyDeepCrawl: "Amazon JP、国会図書館、NWF、アブジャド、WorldCatの深層クローラーを実行中...",
    notifyDeepCrawlDone: "全目録の深層同期が完了しました！",
  },

  ar: {
    appTitle: "ماسح الكتب العالمي والتعرف الببليوغرافي الضوئي",
    appSubtitle: "معايير ISBN4 الياباني • الباركود المزدوج ورمز C • المواقع العربية نيل وفرات وأبجد • مكتبة الكونغرس ووورلد كات",
    versionBadge: "الإصدار 2.6 متعدد الفهارس",
    apiControlPanel: "لوحة تحكم المفاتيح والفهارس",
    scannedRecordsCount: "السجلات الممسوحة",
    footerTagline: "محرك ببليوغرافي وبصري شامل • يدعم الترقيم الياباني ISBN4 والفهارس العربية وملفات الاستناد العالمية",
    currentlyActiveRecord: "السجل الببليوغرافي النشط حاليًا",
    viewFullIntelligenceRecord: "عرض تفاصيل السجل الشامل",

    tabScanner: "الماسح والتعرف الضوئي",
    tabRecord: "السجل الببليوغرافي",
    tabCitations: "التوثيق وبطاقات الرف",
    tabAuthority: "ملفات الاستناد",
    tabBatch: "دفعة السجلات",
    btnArabicDewey: "ديوي العشري العربي 10",
    btnArabicDeweySub: "ألكسو / الفهرس الموحد",
    btnSru: "بوابات SRU / Z39.50",

    scannerTitle: "قارئ الباركود عالي الدقة والتعرف الضوئي على صفحة العنوان وحقوق النشر",
    scannerSubtitle: "يدعم ردمك 13 و10 والترقيم الياباني القديم ISBN4 والباركود المزدوج ورموز C ودور النشر العربية.",
    tabBarcode: "مسح الباركود المباشر بالكاميرا",
    tabOcr: "التعرف الضوئي (صفحة العنوان / صفحة النشر / كولوفون)",
    tabUpload: "رفع صورة من الجهاز",
    tabManual: "إدخال المعرف يدويًا",
    startCamera: "تشغيل كاميرا الماسح",
    stopCamera: "إيقاف الكاميرا",
    switchCamera: "تبديل الكاميرا",
    torchToggle: "تشغيل / إطفاء الفلاش",
    scanStatusReady: "وجّه الكاميرا نحو باركود الكتاب أو صفحة العنوان والبيانات",
    scanStatusActive: "جاري تحليل الإطارات للبحث عن الباركود والنصوص الببليوغرافية...",
    cameraTips: "إرشادات مسح الكتب اليابانية والعربية",
    japaneseIsbn4Tip: "الكتب اليابانية تحتوي عادة على باركودين متتاليين (العلوي ردمك، والسفلي رمز C والسعر بالين)، أو ردمك بصيغة ISBN4.",
    dualBarcodeTip: "الباركود المزدوج: يبدأ الباركود الثاني برقم 192، ويشمل تصنيف رمز C (الفئة المستهدفة، التجليد، الموضوع) وسعر الكتاب بالين.",
    arabicColophonTip: "الكتب العربية: امسح صفحة حقوق النشر أو صفحة العنوان لاكتشاف رقم الإيداع الوطني أو ردمك أو رمز الفهرس العربي.",
    presetsTitle: "نماذج اختبار سريعة (أمهات الكتب)",
    presetsSubtitle: "انقر على أي نموذج للاستعلام الفوري في الفهارس وقواعد البيانات:",
    manualPlaceholder: "أدخل رقم ردمك 13 أو 10 أو ISBN4 الياباني أو رمز C أو رقم بطاقة الكونغرس LCCN...",
    manualLookupBtn: "البحث عن المعرف",
    analyzingBook: "جاري تحليل الصورة عبر محرك التعرف الضوئي العصبي...",
    detectedCode: "الرمز الأساسي المكتشف",
    secondaryCode: "رمز C الياباني الثانوي المكتشف",
    confidence: "دقة التعرف البصري",

    bibRecordBadge: "السجل الببليوغرافي المفهرس",
    japaneseIsbn4Badge: "🇯🇵 ردمك ياباني ISBN4",
    materialTypeBook: "كتاب (دراسة مفردة / مجلد)",
    materialTypeMagazine: "مجلة ثقافية / دورية مصورة",
    materialTypeJournal: "دورية علمية / مجلة محكمة",
    materialTypeSerial: "مطبوعة متسلسلة / نشرة مستمرة",
    issnBadge: "ردمد معتمد (ISSN)",
    publicationFrequency: "دورية الصدور",
    issnPortalRegistry: "المركز الدولي لترقيم الدوريات (ROAD / ISSN)",
    periodicalDetailsTitle: "بيانات الدورية والمجلة المستمرة",
    foundedYearLabel: "سنة التأسيس / أول عدد",
    countryOfOriginLabel: "بلد الصدور",
    btnCitationsQuick: "صيغ التوثيق (المعيار العربي، APA، MLA، SIST02)",
    btnExportQuick: "تصدير مارك 21 / بيبتيك / RIS",
    btnSpineQuick: "بطاقة الرف وكعب الكتاب",
    btnRecrawl: "إعادة الفهرسة العميقة",
    btnRecrawling: "جاري البحث في الفهارس...",
    noCover: "لا توجد صورة غلاف",
    zoomCoverTitle: "معاينة الغلاف بدقة عالية",
    downloadCover: "تحميل صورة الغلاف",
    targetAudience: "الفئة المستهدفة",
    formBinding: "شكل التجليد",
    subjectGenre: "الموضوع والنوع",
    japaneseCCodeBreakdown: "تحليل وتفكيك رمز C الياباني",
    originalPrice: "السعر الأصلي (بالين)",
    tabClassifications: "أنظمة التصنيف ورموز الرف",
    tabCatalogSources: "مصادر الفهارس (أمازون اليابان، مكتبة البرلمان، نيل وفرات، أبجد، الكونغرس)",
    tabCrossRef: "الطبعات المتناظرة والترجمات العالمية",
    tabRawJson: "سجل البيانات بصيغة JSON",
    ndcTitle: "تصنيف نيبون العشري (NDC)",
    ndcDesc: "النظام القياسي للمكتبات اليابانية",
    ddcTitle: "تصنيف ديوي العشري القياسي (DDC)",
    ddcDesc: "نظام التصنيف المكتبي العالمي",
    arabicDeweyTitle: "التصنيف العشري العربي لديوي 10",
    arabicDeweyDesc: "الطبعة العربية والتعديل الموحد (ألكسو / الفهرس العربي الموحد)",
    arabicDeweyConvertBtn: "التحويل واحتساب التصنيف",
    lccTitle: "تصنيف مكتبة الكونغرس (LCC)",
    lccDesc: "رمز الاستدعاء المكتبي للأبحاث الأكاديمية",
    priorityBannerTitle: "أولوية ومصدر احتساب التصنيف المكتبي",
    priorityTitleOnlyWarning: "⚠️ تم الحساب بناءً على العنوان فقط",
    prioritySourcePrefix: "✓ المصدر المعتمد:",
    sourceMatched: "متطابق ومؤكد",
    sourceChecked: "تم فحص الفهرس",
    openExternalCatalog: "فتح السجل في الفهرس الخارجي",
    noCrossRefs: "لم يتم ربط طبعات أو ترجمات دولية متناظرة لهذا السجل حتى الآن.",
    crossRefColTitle: "عنوان الطبعة",
    crossRefColLang: "اللغة",
    crossRefColPublisher: "الناشر وسنة النشر",
    crossRefColRelation: "العلاقة الببليوغرافية",

    librarianSuiteTitle: "جناح المكتبيين والباحثين",
    librarianSuiteDesc: "توليد الاستشهادات المرجعية بعدة أنظمة، وتصدير مارك 21، وطباعة بطاقات كعوب الكتب وباركود الرف.",
    tabCitationList: "الاستشهادات والمراجع",
    tabExportFormats: "صيغ تصدير البيانات",
    tabSpineSlip: "طباعة بطاقة الكعب والباركود",
    copyCitationBtn: "نسخ",
    copiedCitationBtn: "تم النسخ!",
    spineCallScheme: "نظام رمز الاستدعاء للرف",
    spineAuthorCutter: "رمز كتر للمؤلف",
    spinePrintBtn: "طباعة بطاقة الكعب",
    batchExportHeading: "تصدير السجل الببليوغرافي",
    batchExportDesc: "اختر من بين 12 صيغة احترافية تشمل CSV (المتوافقة مع إكسل العربي)، XLS، JSON، JSON5، HTML الموجه من اليمين لليسار، و PDF.",

    authorityTitle: "ملفات الاستناد للمؤلفين والربط الببليوغرافي",
    authoritySubtitle: "ملفات استناد موحدة عبر VIAF، مكتبة البرلمان الياباني (NDL)، مكتبة الكونغرس، والفهارس العربية الموحدة.",
    authorityBadge: "ضبط استنادي معتمد",
    authorRecordNum: "المؤلف رقم",
    transliterationLabel: "النقحرة الصوتية بالحروف اللاتينية",
    connectedAuthorityIds: "المعرفات الاستنادية المرتبطة",
    ndlAuthorityBadge: "استناد NDL الياباني",
    locNacoBadge: "استناد الكونغرس NACO",
    viafBadge: "ملف الاستناد الدولي VIAF",
    matrixTitle: "مصفوفة الربط المتبادل بين المعرفات",
    matrixDesc: "يربط هذا السجل بين معرفات دور النشر اليابانية، والمكتبات الوطنية، وقواعد البيانات الببليوغرافية العربية.",

    batchTitle: "سجل المسح وإدارة الدفعات الببليوغرافية",
    batchSubtitle: "كتاب مفهرس في هذه الجلسة.",
    batchSearchPlaceholder: "ابحث في الدفعة بالعنوان، المؤلف، ردمك، رمز C، أو رقم الفهرس العربي...",
    batchFilterAll: "جميع اللغات",
    batchFilterJa: "كتب يابانية (日本語)",
    batchFilterAr: "كتب عربية (العربية)",
    batchFilterWestern: "كتب باللغات الغربية",
    batchSelectAll: "تحديد الكل",
    batchDeselectAll: "إلغاء تحديد الكل",
    batchExportDropdown: "تصدير الدفعة بالكامل",
    batchClearAll: "مسح سجل الجلسة",
    batchEmpty: "لا توجد سجلات ممسوحة حتى الآن. ابدأ بمسح الباركود أو صفحة النشر من الأعلى!",

    adModalTitle: "محاسب ومحول التصنيف العشري العربي لديوي 10",
    adModalSubtitle: "التصنيف العشري لديوي - الطبعة العربية والتعديل الموحد (المنظمة العربية للتربية والثقافة والعلوم)",
    adExplanationTitle: "ما هو التعديل العربي لتصنيف ديوي العشري (Arabic Dewey 10)؟",
    adExplanationBody: "في النظام الغربي لديوي، تُحصر الثقافة واللغة العربية في أقسام فرعية ضيقة (مثل 892.7 للأدب العربي و 492.7 للغة العربية و 297 للإسلام). قامت المنظمة العربية للتربية والثقافة والعلوم (ألكسو) والفهرس العربي الموحد بتخصيص الأقسام الرئيسية: 210-219 للعلوم الإسلامية، 410-419 للغة العربية، و 810-819 للأدب العربي.",
    adDirectionLabel: "اتجاه التحويل المكتبي",
    adStdToArab: "ديوي القياسي (DDC) ← ديوي العشري العربي 10",
    adArabToStd: "ديوي العشري العربي 10 ← ديوي القياسي (DDC)",
    adInputCodeLabel: "رمز التصنيف المراد تحويله",
    adCalculatedResult: "رمز التصنيف الناتج",
    adBreakdownTitle: "التسلسل الهرمي لأقسام التصنيف",
    adApplyBtn: "اعتماد وتطبيق على السجل الحالي",
    adPresetsTitle: "تحويلات معيارية شهيرة في الفهارس العربية",
    adMainClassesTitle: "الأصول العشرة الرئيسية للتصنيف العشري العربي",

    sruModalTitle: "مستكشف بوابات الفهارس المباشرة عبر SRU و Z39.50",
    sruModalSubtitle: "اتصال مباشر ببروتوكولات البحث والاسترجاع المكتبي في مكتبة البرلمان الياباني، مكتبة الكونغرس، المكتبة البريطانية، الفهرس العربي الموحد ومكتبة الإسكندرية.",
    sruSearchInputLabel: "رقم ردمك أو استعلام Bath / CQL",
    sruSearchPlaceholder: "مثال: 9784003101018 أو bath.isbn=\"9789770902345\"",
    sruExecuteBtn: "استعلام البوابات المفعلة",
    sruTargetsHeading: "فهارس ومكتبات التبادل الببليوغرافي",
    sruEnabled: "بوابة مفعلة",
    sruDisabled: "معطلة",
    sruViewRawMarc: "عرض بيانات مارك الخام MARCXML / DC",
    sruNoResults: "لم يتم استرجاع نتائج بعد. انقر على 'استعلام البوابات المفعلة' للبدء.",

    cpTitle: "لوحة تحكم مفاتيح البرمجة ومعدلات الاستعلام والخوادم",
    cpSubtitle: "إدارة مفاتيح واجهات برمجة التطبيقات (أمازون، جوجل، وورلد كات)، وتحديد معدلات الطلب وسياسات التخزين المؤقت.",
    cpApiKeysSection: "مفاتيح الاتصال والمصادقة الخارجية",
    cpRateLimitSection: "إعدادات حدود الطلبات وسرعة الزحف",
    cpSaveBtn: "حفظ الإعدادات",
    cpResetBtn: "استعادة القيم الافتراضية",

    btnAddCustomRecord: "إضافة واستيراد سجلات",
    customModalTitle: "إدارة السجلات المخصصة واستيراد JSON5",
    customModalSubtitle: "إضافة الكتب والدوريات غير المفهرسة إلى قاعدة البيانات عبر استمارة ويب نموذجية أو استيراد دفعات متعددة بصيغة JSON5.",
    tabWebForm: "استمارة التسجيل اليدوي",
    tabJson5Import: "استيراد دفعات متعددة (JSON5)",
    tabCodeGuide: "دليل التعديل المباشر في كود التطبيق",
    customFormTitle: "فهرسة كتاب أو دورية جديدة",
    customFormSubtitle: "أدخل البيانات الببليوغرافية، وسيتم احتساب التوثيق وأرقام التحقق وتصنيف ديوي العربي تلقائيًا.",
    customFieldTitle: "عنوان الوعاء (العنوان الرئيسي)",
    customFieldSubtitle: "العنوان الفرعي / اسم السلسلة",
    customFieldPublisher: "دار النشر / جهة الإصدار",
    customFieldYear: "سنة النشر / تاريخ الصدور",
    customFieldLanguage: "لغة الوعاء",
    customFieldMaterialType: "نوع المادة (كتاب / مجلة / دورية)",
    customFieldAuthors: "المؤلفون والمشاركون (مفصولين بفواصل)",
    customFieldIsbn13: "الترقيم الدولي الموحد ردمك 13 (978...)",
    customFieldIsbn10: "ردمك 10 (ISBN-10)",
    customFieldIssn: "الترقيم الدولي للدوريات ردمد (ISSN)",
    customFieldNdc: "تصنيف نيبون العشري (NDC)",
    customFieldDewey: "تصنيف ديوي القياسي (DDC)",
    customFieldArabicDewey: "ديوي العشري العربي 10 (ألكسو)",
    customFieldLcc: "تصنيف مكتبة الكونغرس (LCC)",
    customFieldCoverUrl: "رابط صورة الغلاف",
    customFieldDescription: "الوصف / بيانات الكولوفون / المستخلص",
    customFieldPages: "عدد الصفحات",
    customFieldPrice: "السعر الأصلي",
    customSaveBtn: "حفظ وفهرسة في قاعدة البيانات",
    customResetBtn: "تفريغ الاستمارة",
    loadJson5SampleBtn: "تحميل نموذج JSON5 الشامل",
    uploadJson5Btn: "رفع ملف .json5 أو .json",
    importJson5Btn: "استيراد كافة السجلات إلى القاعدة",
    json5SyntaxHelp: "يدعم معيار JSON5 التعليقات (//)، والمفاتيح غير المحاطة باقتباس، والفواصل الأخيرة، مما يجعله مثاليًا للفهرسة الجماعية للمكتبيين.",
    codeGuideTitle: "كيفية إضافة سجلات دائمة في كود التطبيق",
    codeGuideSubtitle: "لإضافة كتب ودوريات تظل مدمجة بصورة دائمة في التطبيق دون الحاجة لتخزين المتصفح المحلي:",
    codeGuideFileLabel: "الملف المطلوب تعديله في مساحة العمل:",
    codeGuideInstructions: "افتح الملف أعلاه، وتوجه إلى مصفوفة KNOWN_BIB_RECORDS، ثم الصق تسجيلة الكتاب مستخدمًا رقم ردمك 13 أو ردمك 10 أو ردمد ISSN كمفتاح للسجل.",

    notifyLookingUp: "جاري البحث والفهرسة للمعرف:",
    notifyRecordLoaded: "تم تحميل السجل الببليوغرافي لـ:",
    notifyError: "تعذر استرجاع البيانات الببليوغرافية",
    notifyDeepCrawl: "جاري تنفيذ فحص عميق يشمل أمازون اليابان، ومكتبة البرلمان، ونيل وفرات، وأبجد، ووورلد كات...",
    notifyDeepCrawlDone: "اكتملت المزامنة المتعددة لجميع الفهارس بنجاح!",
  },
};
