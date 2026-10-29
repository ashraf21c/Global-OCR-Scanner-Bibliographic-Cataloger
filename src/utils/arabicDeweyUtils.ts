/**
 * Arabic Dewey Decimal Classification (التصنيف العشري لديوي - الطبعة العربية والتعديل الموحد)
 * Based on ALECSO (المنظمة العربية للتربية والثقافة والعلوم),
 * Arabic Union Catalog (الفهرس العربي الموحد), and National Libraries of Egypt & Saudi Arabia.
 *
 * In the Arabic derivation of Dewey:
 * - 210-219 (or 297 expanded): Allocated specifically for Islamic Sciences & Religion (العلوم الإسلامية)
 * - 410-419: Allocated specifically for the Arabic Language (اللغة العربية) replacing general English linguistics
 * - 810-819: Allocated specifically for Arabic Literature (الأدب العربي) replacing American literature
 * - 953-956: Arab & Islamic World History (تاريخ العالم العربي والإسلامي)
 */

export interface ArabicDeweyClass {
  code: string;
  arabicName: string;
  englishName: string;
  standardDdcEquivalent?: string;
  description: string;
}

export interface ArabicDeweyBreakdown {
  code: string;
  mainClass: { code: string; name: string };
  division: { code: string; name: string };
  section?: { code: string; name: string };
  fullArabicLabel: string;
  standardDdcEquivalent?: string;
}

// 10 Main Classes of Arabic Dewey (الأصول العشرة)
export const ARABIC_DEWEY_MAIN_CLASSES: Record<
  string,
  { arabicName: string; englishName: string; japaneseName: string }
> = {
  "000": {
    arabicName: "المعارف العامة والحواسيب والمكتبات",
    englishName: "Computer Science, Information & General Works",
    japaneseName: "総記・情報学・コンピュータ・図書館",
  },
  "100": {
    arabicName: "الفلسفة وعلم النفس والمنطق",
    englishName: "Philosophy & Psychology",
    japaneseName: "哲学・心理学・論理学",
  },
  "200": {
    arabicName: "الديانات والعلوم الإسلامية",
    englishName: "Religion & Islamic Sciences",
    japaneseName: "諸宗教・イスラム学（イスラム諸科学）",
  },
  "300": {
    arabicName: "العلوم الاجتماعية والقانون والتربية",
    englishName: "Social Sciences, Law & Education",
    japaneseName: "社会科学・法学・教育学",
  },
  "400": {
    arabicName: "اللغات واللسانيات (اللغة العربية)",
    englishName: "Language & Linguistics (Arabic Language)",
    japaneseName: "言語学・語学（アラビア語学）",
  },
  "500": {
    arabicName: "العلوم البحتة والرياضيات والفلك",
    englishName: "Pure Sciences & Mathematics",
    japaneseName: "自然科学・数学・天文学",
  },
  "600": {
    arabicName: "العلوم التطبيقية والتكنولوجيا والطب",
    englishName: "Technology & Applied Sciences",
    japaneseName: "応用科学・技術・医学",
  },
  "700": {
    arabicName: "الفنون والخط العربي والعمارة والرياضة",
    englishName: "Arts, Arabic Calligraphy & Recreation",
    japaneseName: "芸術・アラビア書道・建築・スポーツ",
  },
  "800": {
    arabicName: "الآداب ونقد الأدب (الأدب العربي)",
    englishName: "Literature (Arabic Literature)",
    japaneseName: "文学・文芸批評（アラビア文学）",
  },
  "900": {
    arabicName: "التاريخ والجغرافيا وتراجم الأعلام",
    englishName: "History, Geography & Biography",
    japaneseName: "歴史・地理・伝記",
  },
};

// Specialized divisions in Arabic Dewey
export const ARABIC_DEWEY_DIVISIONS: Record<
  string,
  { arabicName: string; englishName: string; japaneseName: string }
> = {
  // 210-219: Islamic Sciences (العلوم الإسلامية في التعديل العربي)
  "210": {
    arabicName: "العلوم الإسلامية العامة",
    englishName: "Islamic Sciences General",
    japaneseName: "イスラム学総記",
  },
  "211": {
    arabicName: "القرآن الكريم وعلومه والتفسير",
    englishName: "Quranic Studies & Exegesis (Tafsir)",
    japaneseName: "クルアーン学・解釈学（タフスィール）",
  },
  "212": {
    arabicName: "الحديث النبوي الشريف وعلومه",
    englishName: "Prophetic Traditions (Hadith) & Sciences",
    japaneseName: "ハディース学（預言者伝承）",
  },
  "213": {
    arabicName: "العقيدة وأصول الدين وعلم الكلام",
    englishName: "Islamic Theology (Aqeedah & Kalam)",
    japaneseName: "イスラム神学（アカイーダ・カラーム）",
  },
  "214": {
    arabicName: "الفقه الإسلامي وأصوله والقواعد الفقهية",
    englishName: "Islamic Jurisprudence (Fiqh) & Principles",
    japaneseName: "イスラム法学・法源論（フィクフ）",
  },
  "215": {
    arabicName: "المذاهب والفرق الإسلامية والأديان المقارنة",
    englishName: "Islamic Schools, Sects & Comparative Religion",
    japaneseName: "イスラム諸宗派・比較宗教学",
  },
  "216": {
    arabicName: "التصوف الإسلامي والأخلاق والآداب الشرعية",
    englishName: "Sufism, Islamic Ethics & Morals",
    japaneseName: "スーフィズム（神秘主義）・倫理",
  },
  "217": {
    arabicName: "الدعوة والوعظ والإرشاد والمساجد",
    englishName: "Islamic Da'wah, Preaching & Institutions",
    japaneseName: "宣教（ダアワ）・説教・制度",
  },
  "218": {
    arabicName: "السيرة النبوية والتاريخ والحضارة الإسلامية",
    englishName: "Prophetic Biography (Seerah) & Civilization",
    japaneseName: "預言者伝（シーラ）・イスラム文明史",
  },
  "219": {
    arabicName: "الديانات الأخرى غير الإسلامية",
    englishName: "Other Religions",
    japaneseName: "イスラム以外の諸宗教",
  },

  // 410-419: Arabic Language (علوم اللغة العربية في التعديل العربي)
  "410": {
    arabicName: "علم اللغة العام وفقه اللغة العربية",
    englishName: "General Linguistics & Arabic Philology",
    japaneseName: "言語学一般・アラビア語文献学",
  },
  "411": {
    arabicName: "الخط العربي والكتابة والرسم الإملائي",
    englishName: "Arabic Calligraphy, Orthography & Writing",
    japaneseName: "アラビア書道・正書法・書記論",
  },
  "412": {
    arabicName: "الاشتقاق وعلم الصرف العربي",
    englishName: "Arabic Morphology (Sarf) & Derivation",
    japaneseName: "語形成論・形態論（サルフ）",
  },
  "413": {
    arabicName: "المعاجم والقواميس العربية",
    englishName: "Arabic Dictionaries & Lexicography",
    japaneseName: "アラビア語辞書・辞書学",
  },
  "414": {
    arabicName: "علم الأصوات والتجويد اللغوي",
    englishName: "Arabic Phonology & Phonetics",
    japaneseName: "音声学・読誦論（タジウィード）",
  },
  "415": {
    arabicName: "النحو العربي وقواعد الإعراب",
    englishName: "Arabic Grammar (Nahw) & Syntax",
    japaneseName: "アラビア語文法・統語論（ナフウ）",
  },
  "416": {
    arabicName: "العروض والقوافي والأوزان الشعرية",
    englishName: "Arabic Prosody (Arud) & Poetic Metres",
    japaneseName: "作詩論・韻律学（アルード）",
  },
  "417": {
    arabicName: "اللهجات العربية المعاصرة والقديمة",
    englishName: "Arabic Dialects & Socio-linguistics",
    japaneseName: "現代・古典アラビア語方言学",
  },
  "418": {
    arabicName: "أساليب التعبير والإنشاء والمراسلات",
    englishName: "Arabic Composition & Rhetorical Usage",
    japaneseName: "修辞学・作文法・書簡文",
  },
  "419": {
    arabicName: "لغات الإشارة والتخاطب العربية",
    englishName: "Arabic Sign & Alternative Communication",
    japaneseName: "アラビア手話・意思疎通手段",
  },

  // 810-819: Arabic Literature (الأدب العربي في التعديل العربي)
  "810": {
    arabicName: "تاريخ الأدب العربي والنقد والدراسات العامة",
    englishName: "Arabic Literature General & Criticism",
    japaneseName: "アラビア文学史・文芸批評",
  },
  "811": {
    arabicName: "الشعر العربي (القديم والحديث والمعاصر)",
    englishName: "Arabic Poetry (Classical & Modern)",
    japaneseName: "アラビア詩（古典・現代）",
  },
  "812": {
    arabicName: "المسرحية والدراما العربية",
    englishName: "Arabic Drama & Theatre",
    japaneseName: "アラビア戯曲・演劇",
  },
  "813": {
    arabicName: "القصة والرواية والأقصوصة العربية",
    englishName: "Arabic Fiction, Novels & Short Stories",
    japaneseName: "アラビア小説・短編小説・物語",
  },
  "814": {
    arabicName: "المقالات والمقامات والأدب النثري",
    englishName: "Arabic Essays, Maqamat & Prose",
    japaneseName: "随筆・マカーマ・散文文学",
  },
  "815": {
    arabicName: "الخطابة والمحاضرات الأدبية العربية",
    englishName: "Arabic Speeches & Oratory",
    japaneseName: "演説・文学的講話",
  },
  "816": {
    arabicName: "الرسائل والمكاتبات والمراسلات الأدبية",
    englishName: "Arabic Letters & Epistolary Literature",
    japaneseName: "書簡・往復書簡文学",
  },
  "817": {
    arabicName: "الفكاهة والطرائف والنوادر والأدب الساخر",
    englishName: "Arabic Humour, Satire & Anecdotes",
    japaneseName: "機知・風刺・ユーモア文学",
  },
  "818": {
    arabicName: "الأدب العربي المتنوع والخواطر والأمثال",
    englishName: "Arabic Miscellaneous Writings & Proverbs",
    japaneseName: "アラビア語雑録・金言・格言集",
  },
  "819": {
    arabicName: "آداب اللغات السامية والإسلامية الأخرى",
    englishName: "Other Semitic & Islamic Literatures",
    japaneseName: "その他セム系・イスラム諸語の文学",
  },

  // History & Arab World (التاريخ والجغرافيا العربية)
  "953": {
    arabicName: "تاريخ شبه الجزيرة العربية والخليج",
    englishName: "History of the Arabian Peninsula & Gulf",
    japaneseName: "アラビア半島・湾岸諸国の歴史",
  },
  "956": {
    arabicName: "تاريخ بلاد الشام والشرق الأوسط",
    englishName: "History of the Levant & Middle East",
    japaneseName: "レバント・中東現代史",
  },
  "962": {
    arabicName: "تاريخ مصر ووادي النيل والسودان",
    englishName: "History of Egypt, Sudan & Nile Valley",
    japaneseName: "エジプト・ナイル川流域・スーダン史",
  },
  "961": {
    arabicName: "تاريخ المغرب العربي وشمال إفريقيا",
    englishName: "History of the Maghreb & North Africa",
    japaneseName: "マグリブ・北アフリカ史",
  },
};

/**
 * Direct conversion table from Standard Dewey to Arabic Dewey 10
 */
const STANDARD_TO_ARABIC_MAP: Record<string, { arabicDewey: string; arabicName: string }> = {
  // Arabic Literature (Standard DDC 892.7 -> Arabic Dewey 810-818)
  "892.7": { arabicDewey: "810", arabicName: "الأدب العربي والدراسات العامة" },
  "892.709": { arabicDewey: "810.9", arabicName: "تاريخ الأدب العربي ونقده" },
  "892.71": { arabicDewey: "811", arabicName: "الشعر العربي" },
  "892.716": { arabicDewey: "811.6", arabicName: "الشعر العربي المعاصر والحديث" },
  "892.72": { arabicDewey: "812", arabicName: "المسرحية العربية" },
  "892.73": { arabicDewey: "813", arabicName: "القصة والرواية العربية" },
  "892.735": { arabicDewey: "813.5", arabicName: "الرواية العربية في القرن العشرين" },
  "892.736": { arabicDewey: "813.6", arabicName: "الرواية العربية المعاصرة" },
  "892.74": { arabicDewey: "814", arabicName: "المقالات والمقامات العربية" },
  "892.75": { arabicDewey: "815", arabicName: "الخطابة العربية" },
  "892.76": { arabicDewey: "816", arabicName: "الرسائل الأدبية العربية" },
  "892.77": { arabicDewey: "817", arabicName: "الفكاهة والنوادر والأدب الساخر" },
  "892.78": { arabicDewey: "818", arabicName: "الأدب العربي المتنوع والخواطر" },

  // Arabic Language (Standard DDC 492.7 -> Arabic Dewey 410-418)
  "492.7": { arabicDewey: "410", arabicName: "فقه اللغة العربية وعلم اللغة" },
  "492.71": { arabicDewey: "411", arabicName: "الخط العربي وقواعد الإملاء" },
  "492.72": { arabicDewey: "412", arabicName: "علم الصرف والاشتقاق العربي" },
  "492.73": { arabicDewey: "413", arabicName: "المعاجم والقواميس العربية" },
  "492.74": { arabicDewey: "414", arabicName: "الأصوات والتجويد" },
  "492.75": { arabicDewey: "415", arabicName: "النحو العربي والإعراب" },
  "492.76": { arabicDewey: "416", arabicName: "العروض والقوافي الشعرية" },
  "492.77": { arabicDewey: "417", arabicName: "اللهجات العربية التاريخية والمعاصرة" },
  "492.78": { arabicDewey: "418", arabicName: "الإنشاء واستعمال اللغة العربية" },

  // Islamic Studies (Standard DDC 297 -> Arabic Dewey 210-218)
  "297": { arabicDewey: "210", arabicName: "العلوم الإسلامية العامة" },
  "297.1": { arabicDewey: "211", arabicName: "علوم القرآن الكريم" },
  "297.12": { arabicDewey: "211", arabicName: "تفسير القرآن الكريم" },
  "297.122": { arabicDewey: "211.2", arabicName: "التفاسير المعتمدة" },
  "297.14": { arabicDewey: "211.4", arabicName: "آيات الأحكام" },
  "297.2": { arabicDewey: "212", arabicName: "الحديث الشريف وعلومه" },
  "297.22": { arabicDewey: "212.2", arabicName: "متون الحديث والشروح (الصحاح)" },
  "297.3": { arabicDewey: "213", arabicName: "العقيدة وأصول الدين والكلام" },
  "297.4": { arabicDewey: "214", arabicName: "الفقه الإسلامي وأصول الفقه" },
  "297.41": { arabicDewey: "214.1", arabicName: "العبادات في الفقه الإسلامي" },
  "297.42": { arabicDewey: "214.2", arabicName: "المعاملات والأحوال الشخصية" },
  "297.5": { arabicDewey: "216", arabicName: "الأخلاق والآداب الإسلامية" },
  "297.6": { arabicDewey: "216", arabicName: "التصوف الإسلامي ومدارسه" },
  "297.7": { arabicDewey: "217", arabicName: "الدعوة الإسلامية والجهاد" },
  "297.8": { arabicDewey: "215", arabicName: "الفرق والمذاهب الإسلامية" },
  "297.9": { arabicDewey: "218", arabicName: "السيرة النبوية والتاريخ الإسلامي" },
};

/**
 * Reverse mapping from Arabic Dewey 10 to Standard DDC
 */
const ARABIC_TO_STANDARD_MAP: Record<string, string> = {
  "810": "892.7",
  "811": "892.71",
  "812": "892.72",
  "813": "892.73",
  "814": "892.74",
  "815": "892.75",
  "816": "892.76",
  "817": "892.77",
  "818": "892.78",
  "410": "492.7",
  "411": "492.71",
  "412": "492.72",
  "413": "492.73",
  "414": "492.74",
  "415": "492.75",
  "416": "492.76",
  "417": "492.77",
  "418": "492.78",
  "210": "297",
  "211": "297.1",
  "212": "297.2",
  "213": "297.3",
  "214": "297.4",
  "215": "297.8",
  "216": "297.5",
  "217": "297.7",
  "218": "297.9",
};

/**
 * Convert Standard Dewey Decimal (DDC) to Arabic Dewey 10
 */
export function convertStandardDeweyToArabicDewey(standardDdc: string): {
  arabicDewey: string;
  arabicName: string;
  isDerived: boolean;
} {
  const clean = standardDdc.trim();

  // Exact match
  if (STANDARD_TO_ARABIC_MAP[clean]) {
    return {
      arabicDewey: STANDARD_TO_ARABIC_MAP[clean].arabicDewey,
      arabicName: STANDARD_TO_ARABIC_MAP[clean].arabicName,
      isDerived: true,
    };
  }

  // Prefix match (e.g. 892.7354 -> 813.54)
  if (clean.startsWith("892.7")) {
    const sub = clean.slice(5); // e.g. "3" or "35"
    if (sub.startsWith("1")) return { arabicDewey: "811" + sub.slice(1), arabicName: "الشعر العربي", isDerived: true };
    if (sub.startsWith("2")) return { arabicDewey: "812" + sub.slice(1), arabicName: "المسرحية العربية", isDerived: true };
    if (sub.startsWith("3")) return { arabicDewey: "813" + sub.slice(1), arabicName: "القصة والرواية العربية", isDerived: true };
    if (sub.startsWith("4")) return { arabicDewey: "814" + sub.slice(1), arabicName: "المقالات والمقامات العربية", isDerived: true };
    if (sub.startsWith("5")) return { arabicDewey: "815" + sub.slice(1), arabicName: "الخطابة العربية", isDerived: true };
    if (sub.startsWith("6")) return { arabicDewey: "816" + sub.slice(1), arabicName: "الرسائل الأدبية العربية", isDerived: true };
    if (sub.startsWith("7")) return { arabicDewey: "817" + sub.slice(1), arabicName: "الفكاهة والنوادر", isDerived: true };
    if (sub.startsWith("8")) return { arabicDewey: "818" + sub.slice(1), arabicName: "الأدب العربي المتنوع", isDerived: true };
    return { arabicDewey: "810" + sub, arabicName: "الأدب العربي", isDerived: true };
  }

  // Language match (492.7 -> 410...)
  if (clean.startsWith("492.7")) {
    const sub = clean.slice(5);
    if (sub.startsWith("1")) return { arabicDewey: "411" + sub.slice(1), arabicName: "الخط العربي والإملاء", isDerived: true };
    if (sub.startsWith("2")) return { arabicDewey: "412" + sub.slice(1), arabicName: "علم الصرف والاشتقاق", isDerived: true };
    if (sub.startsWith("3")) return { arabicDewey: "413" + sub.slice(1), arabicName: "المعاجم العربية", isDerived: true };
    if (sub.startsWith("4")) return { arabicDewey: "414" + sub.slice(1), arabicName: "علم الأصوات والتجويد", isDerived: true };
    if (sub.startsWith("5")) return { arabicDewey: "415" + sub.slice(1), arabicName: "النحو العربي والإعراب", isDerived: true };
    if (sub.startsWith("6")) return { arabicDewey: "416" + sub.slice(1), arabicName: "العروض والقوافي", isDerived: true };
    if (sub.startsWith("7")) return { arabicDewey: "417" + sub.slice(1), arabicName: "اللهجات العربية", isDerived: true };
    if (sub.startsWith("8")) return { arabicDewey: "418" + sub.slice(1), arabicName: "الإنشاء واستعمال اللغة", isDerived: true };
    return { arabicDewey: "410" + sub, arabicName: "علوم اللغة العربية", isDerived: true };
  }

  // Islamic Studies match (297 -> 210...)
  if (clean.startsWith("297")) {
    const sub = clean.slice(3); // e.g. ".1" or ".2"
    if (sub.startsWith(".1")) return { arabicDewey: "211" + sub.slice(2), arabicName: "علوم القرآن والتفسير", isDerived: true };
    if (sub.startsWith(".2")) return { arabicDewey: "212" + sub.slice(2), arabicName: "الحديث النبوي الشريف", isDerived: true };
    if (sub.startsWith(".3")) return { arabicDewey: "213" + sub.slice(2), arabicName: "العقيدة وعلم الكلام", isDerived: true };
    if (sub.startsWith(".4")) return { arabicDewey: "214" + sub.slice(2), arabicName: "الفقه الإسلامي وأصوله", isDerived: true };
    if (sub.startsWith(".5")) return { arabicDewey: "216" + sub.slice(2), arabicName: "الأخلاق والتصوف الإسلامي", isDerived: true };
    if (sub.startsWith(".6")) return { arabicDewey: "216" + sub.slice(2), arabicName: "التصوف الإسلامي", isDerived: true };
    if (sub.startsWith(".7")) return { arabicDewey: "217" + sub.slice(2), arabicName: "الدعوة والمؤسسات الإسلامية", isDerived: true };
    if (sub.startsWith(".8")) return { arabicDewey: "215" + sub.slice(2), arabicName: "الفرق والمذاهب الإسلامية", isDerived: true };
    if (sub.startsWith(".9")) return { arabicDewey: "218" + sub.slice(2), arabicName: "السيرة والتاريخ الإسلامي", isDerived: true };
    return { arabicDewey: "210" + sub, arabicName: "العلوم الإسلامية", isDerived: true };
  }

  // For general disciplines, Arabic Dewey shares the standard 10 classes
  const mainDigit = clean.charAt(0) + "00";
  const mainClass = ARABIC_DEWEY_MAIN_CLASSES[mainDigit];
  return {
    arabicDewey: clean,
    arabicName: mainClass ? mainClass.arabicName : "تصنيف ديوي العام",
    isDerived: false,
  };
}

/**
 * Convert Arabic Dewey 10 to Standard DDC
 */
export function convertArabicDeweyToStandardDewey(arabicDewey: string): string {
  const clean = arabicDewey.trim();
  const base3 = clean.slice(0, 3);
  const remainder = clean.slice(3);

  if (ARABIC_TO_STANDARD_MAP[base3]) {
    return ARABIC_TO_STANDARD_MAP[base3] + remainder;
  }
  return clean;
}

/**
 * Breakdown an Arabic Dewey 10 code into its hierarchical constituents
 */
export function getArabicDeweyBreakdown(code: string): ArabicDeweyBreakdown {
  const clean = code.trim();
  const mainCode = clean.charAt(0) + "00";
  const divCode = clean.slice(0, 2) + "0";

  const mainClass = ARABIC_DEWEY_MAIN_CLASSES[mainCode] || {
    arabicName: "فئة عامة",
    englishName: "General Class",
  };

  const division = ARABIC_DEWEY_DIVISIONS[clean.slice(0, 3)] ||
    ARABIC_DEWEY_DIVISIONS[divCode] || {
      arabicName: mainClass.arabicName,
      englishName: mainClass.englishName,
    };

  const standardEq = convertArabicDeweyToStandardDewey(clean);

  return {
    code: clean,
    mainClass: { code: mainCode, name: mainClass.arabicName },
    division: { code: divCode, name: division.arabicName },
    fullArabicLabel: `${division.arabicName} [ديوي العربي: ${clean}]`,
    standardDdcEquivalent: standardEq !== clean ? standardEq : undefined,
  };
}

export interface PrioritizedClassificationInput {
  title: string;
  ndc?: string;
  cCode?: string;
  dewey?: string;
  lcc?: string;
  description?: string;
  subjects?: string[];
  publisher?: string;
  language?: string;
}

export interface CalculatedClassificationResult {
  dewey: string;
  arabicDewey: string;
  arabicDeweyName: string;
  ndc?: string;
  lcc?: string;
  basis: "ndc" | "cCode" | "catalog_dewey" | "lcc" | "abstract_subjects" | "title_only";
  note: {
    en: string;
    ar: string;
    ja: string;
  };
}

/**
 * Calculates classification based on strict priority:
 * 1. NDC number (if listed, use it)
 * 2. Japanese C-Code (if listed, use it)
 * 3. Catalog Dewey or LCC (if listed, convert it)
 * 4. Relative data (abstract / description, subject headings, publisher data)
 * 5. Fallback: Title only (adds translated note "This is calculated using the title only")
 */
export function calculatePrioritizedClassification(
  input: PrioritizedClassificationInput
): CalculatedClassificationResult {
  const { title, ndc, cCode, dewey, lcc, description, subjects, language } = input;

  // PRIORITY 1: Official NDC Classification
  if (ndc && ndc.trim()) {
    const cleanNdc = ndc.trim();
    let calculatedDewey = "895.63";
    let calculatedArabicDewey = "813";
    let calculatedArabicName = "القصة والرواية (محسوب من تصنيف NDC الياباني)";

    if (cleanNdc.startsWith("913")) {
      calculatedDewey = "895.63";
      calculatedArabicDewey = "813";
      calculatedArabicName = "القصة والرواية (الأدب الروائي)";
    } else if (cleanNdc.startsWith("911")) {
      calculatedDewey = "895.61";
      calculatedArabicDewey = "811";
      calculatedArabicName = "الشعر والقصائد (الشعر الياباني والعالمي)";
    } else if (cleanNdc.startsWith("912")) {
      calculatedDewey = "895.62";
      calculatedArabicDewey = "812";
      calculatedArabicName = "المسرحية والدراما";
    } else if (cleanNdc.startsWith("91")) {
      calculatedDewey = "895.6";
      calculatedArabicDewey = "810";
      calculatedArabicName = "الأدب العام والدراسات الأدبية";
    } else if (cleanNdc.startsWith("1")) {
      calculatedDewey = "100";
      calculatedArabicDewey = "100";
      calculatedArabicName = "الفلسفة وعلم النفس";
    } else if (cleanNdc.startsWith("2")) {
      calculatedDewey = "900";
      calculatedArabicDewey = "900";
      calculatedArabicName = "التاريخ والجغرافيا";
    } else if (cleanNdc.startsWith("3")) {
      calculatedDewey = "300";
      calculatedArabicDewey = "300";
      calculatedArabicName = "العلوم الاجتماعية";
    } else if (cleanNdc.startsWith("4")) {
      calculatedDewey = "500";
      calculatedArabicDewey = "500";
      calculatedArabicName = "العلوم الطبيعية والرياضيات";
    } else if (cleanNdc.startsWith("5") || cleanNdc.startsWith("6")) {
      calculatedDewey = "600";
      calculatedArabicDewey = "600";
      calculatedArabicName = "التكنولوجيا والعلوم التطبيقية";
    } else if (cleanNdc.startsWith("7")) {
      calculatedDewey = "700";
      calculatedArabicDewey = "700";
      calculatedArabicName = "الفنون والرياضة";
    } else if (cleanNdc.startsWith("8")) {
      calculatedDewey = "400";
      calculatedArabicDewey = "400";
      calculatedArabicName = "علوم اللغات واللسانيات";
    }

    return {
      dewey: calculatedDewey,
      arabicDewey: calculatedArabicDewey,
      arabicDeweyName: calculatedArabicName,
      ndc: cleanNdc,
      lcc,
      basis: "ndc",
      note: {
        en: `Calculated from official NDC classification (${cleanNdc})`,
        ar: `تم الحساب بناءً على تصنيف نيبون العشري الرسمي (${cleanNdc})`,
        ja: `公式の日本十進分類法（NDC: ${cleanNdc}）から算出されました`,
      },
    };
  }

  // PRIORITY 2: Japanese C-Code
  if (cCode && cCode.trim()) {
    const cleanCode = cCode.trim().toUpperCase();
    const subMatch = cleanCode.match(/C\d(\d)(\d{2})/);
    let calculatedDewey = "895.63";
    let calculatedArabicDewey = "813";
    let calculatedArabicName = "الأدب والرواية (محسوب من C-Code)";

    if (subMatch) {
      const subject = subMatch[2];
      if (subject === "93") {
        calculatedDewey = "895.63";
        calculatedArabicDewey = "813";
        calculatedArabicName = "الرواية والقصة (الأدب الياباني)";
      } else if (subject === "90") {
        calculatedDewey = "800";
        calculatedArabicDewey = "810";
        calculatedArabicName = "الأدب العام";
      } else if (subject === "10" || subject === "11") {
        calculatedDewey = "100";
        calculatedArabicDewey = "100";
        calculatedArabicName = "الفلسفة والديانات";
      } else if (subject === "20") {
        calculatedDewey = "900";
        calculatedArabicDewey = "900";
        calculatedArabicName = "التاريخ والجغرافيا";
      } else if (subject === "30" || subject === "31" || subject === "32") {
        calculatedDewey = "300";
        calculatedArabicDewey = "300";
        calculatedArabicName = "العلوم الاجتماعية والاقتصاد";
      }
    }

    return {
      dewey: calculatedDewey,
      arabicDewey: calculatedArabicDewey,
      arabicDeweyName: calculatedArabicName,
      ndc: "913.6",
      lcc,
      basis: "cCode",
      note: {
        en: `Calculated from Japanese C-Code (${cleanCode})`,
        ar: `تم الحساب بناءً على الرمز التصنيفي الياباني (${cleanCode})`,
        ja: `日本図書コード（Cコード: ${cleanCode}）から算出されました`,
      },
    };
  }

  // PRIORITY 3: Existing Catalog Dewey Decimal
  if (dewey && dewey.trim()) {
    const conv = convertStandardDeweyToArabicDewey(dewey.trim());
    return {
      dewey: dewey.trim(),
      arabicDewey: conv.arabicDewey,
      arabicDeweyName: conv.arabicName,
      lcc,
      basis: "catalog_dewey",
      note: {
        en: `Calculated from catalog Dewey Decimal (${dewey.trim()})`,
        ar: `تم الحساب بناءً على تصنيف ديوي المدرج في الفهرس (${dewey.trim()})`,
        ja: `書誌記載のデューイ十進分類（${dewey.trim()}）から算出されました`,
      },
    };
  }

  // PRIORITY 4: Library of Congress (LCC)
  if (lcc && lcc.trim()) {
    const cleanLcc = lcc.trim().toUpperCase();
    let calculatedDewey = "892.73";
    let calculatedArabicDewey = "813";
    let calculatedArabicName = "القصة والرواية (محسوب من LCC)";

    if (cleanLcc.startsWith("PJ")) {
      calculatedDewey = "892.7";
      calculatedArabicDewey = "810";
      calculatedArabicName = "الأدب العربي والدراسات الشرقية";
    } else if (cleanLcc.startsWith("PL")) {
      calculatedDewey = "895.6";
      calculatedArabicDewey = "813";
      calculatedArabicName = "الرواية والأدب الشرقي";
    } else if (cleanLcc.startsWith("BP")) {
      calculatedDewey = "297";
      calculatedArabicDewey = "210";
      calculatedArabicName = "العلوم والدراسات الإسلامية";
    } else if (cleanLcc.startsWith("B")) {
      calculatedDewey = "100";
      calculatedArabicDewey = "100";
      calculatedArabicName = "الفلسفة وعلم النفس";
    }

    return {
      dewey: calculatedDewey,
      arabicDewey: calculatedArabicDewey,
      arabicDeweyName: calculatedArabicName,
      lcc: cleanLcc,
      basis: "lcc",
      note: {
        en: `Calculated from Library of Congress classification (${cleanLcc})`,
        ar: `تم الحساب بناءً على تصنيف مكتبة الكونغرس (${cleanLcc})`,
        ja: `米国議会図書館分類（LCC: ${cleanLcc}）から算出されました`,
      },
    };
  }

  // PRIORITY 5: Relative Data (Abstract / Description, Subject Headings, Publisher Metadata)
  const hasAbstract = Boolean(description && description.trim().length > 15);
  const hasSubjects = Boolean(subjects && subjects.length > 0);

  if (hasAbstract || hasSubjects) {
    const relativeText = `${description || ""} ${(subjects || []).join(" ")}`.toLowerCase();
    const calculated = analyzeTextForClassification(relativeText, language);

    return {
      dewey: calculated.dewey,
      arabicDewey: calculated.arabicDewey,
      arabicDeweyName: calculated.arabicDeweyName,
      basis: "abstract_subjects",
      note: {
        en: "Calculated from abstract & publisher subject metadata",
        ar: "تم الحساب بناءً على المستخلص والبيانات الموضوعية للناشر",
        ja: "要約および出版社の主題メタデータから算出されました",
      },
    };
  }

  // PRIORITY 6 (FALLBACK): Title Only
  const calculatedFromTitle = analyzeTextForClassification(title.toLowerCase(), language);
  return {
    dewey: calculatedFromTitle.dewey,
    arabicDewey: calculatedFromTitle.arabicDewey,
    arabicDeweyName: calculatedFromTitle.arabicDeweyName,
    basis: "title_only",
    note: {
      en: "This is calculated using the title only",
      ar: "تم الحساب بناءً على العنوان فقط",
      ja: "タイトル情報のみから算出されました",
    },
  };
}

/**
 * Text classification heuristic analyzer
 */
function analyzeTextForClassification(text: string, language?: string): {
  dewey: string;
  arabicDewey: string;
  arabicDeweyName: string;
} {
  // Islamic Sciences
  if (text.includes("قرآن") || text.includes("تفسير") || text.includes("quran")) {
    return { dewey: "297.1", arabicDewey: "211", arabicDeweyName: "علوم القرآن الكريم وتفسيره" };
  }
  if (text.includes("حديث") || text.includes("بخاري") || text.includes("hadith") || text.includes("سنة")) {
    return { dewey: "297.2", arabicDewey: "212", arabicDeweyName: "الحديث النبوي الشريف وعلومه" };
  }
  if (text.includes("فقه") || text.includes("أحكام") || text.includes("شريعة") || text.includes("fiqh")) {
    return { dewey: "297.4", arabicDewey: "214", arabicDeweyName: "الفقه الإسلامي وأصوله" };
  }
  if (text.includes("عقيدة") || text.includes("توحيد") || text.includes("كلام") || text.includes("aqeedah")) {
    return { dewey: "297.3", arabicDewey: "213", arabicDeweyName: "العقيدة وأصول الدين" };
  }
  if (text.includes("سيرة") || text.includes("نبي") || text.includes("صحابة") || text.includes("seerah")) {
    return { dewey: "297.9", arabicDewey: "218", arabicDeweyName: "السيرة النبوية والتاريخ الإسلامي" };
  }
  if (text.includes("تصوف") || text.includes("صوفية") || text.includes("أخلاق إسلامية")) {
    return { dewey: "297.5", arabicDewey: "216", arabicDeweyName: "التصوف والأخلاق الإسلامية" };
  }

  // Arabic Language
  if (text.includes("نحو") || text.includes("إعراب") || text.includes("grammar")) {
    return { dewey: "492.75", arabicDewey: "415", arabicDeweyName: "النحو العربي والإعراب" };
  }
  if (text.includes("صرف") || text.includes("اشتقاق") || text.includes("morphology")) {
    return { dewey: "492.72", arabicDewey: "412", arabicDeweyName: "علم الصرف والاشتقاق العربي" };
  }
  if (text.includes("معجم") || text.includes("قاموس") || text.includes("لسان العرب") || text.includes("dictionary")) {
    return { dewey: "492.73", arabicDewey: "413", arabicDeweyName: "المعاجم والقواميس العربية" };
  }
  if (text.includes("بلاغة") || text.includes("بيان") || text.includes("بديع") || text.includes("إنشاء")) {
    return { dewey: "492.78", arabicDewey: "418", arabicDeweyName: "البلاغة والإنشاء وأساليب التعبير" };
  }

  // Literature
  if (text.includes("شعر") || text.includes("قصيدة") || text.includes("ديوان") || text.includes("poetry")) {
    return { dewey: "892.71", arabicDewey: "811", arabicDeweyName: "الشعر العربي" };
  }
  if (text.includes("رواية") || text.includes("قصص") || text.includes("novel") || text.includes("fiction")) {
    return { dewey: "892.73", arabicDewey: "813", arabicDeweyName: "القصة والرواية العربية" };
  }
  if (text.includes("مسرحية") || text.includes("دراما") || text.includes("theatre") || text.includes("drama")) {
    return { dewey: "892.72", arabicDewey: "812", arabicDeweyName: "المسرحية والدراما العربية" };
  }
  if (text.includes("مقال") || text.includes("مقامات") || text.includes("نثر")) {
    return { dewey: "892.74", arabicDewey: "814", arabicDeweyName: "المقالات والنثر الأدبي العربي" };
  }

  // History & Regional
  if (text.includes("تاريخ مصر") || text.includes("مصر القديمة") || text.includes("egypt")) {
    return { dewey: "962", arabicDewey: "962", arabicDeweyName: "تاريخ مصر ووادي النيل" };
  }
  if (text.includes("تاريخ السعودية") || text.includes("شبه الجزيرة") || text.includes("نجد") || text.includes("حجاز")) {
    return { dewey: "953", arabicDewey: "953", arabicDeweyName: "تاريخ شبه الجزيرة العربية والخليج" };
  }
  if (text.includes("تاريخ الشام") || text.includes("فلسطين") || text.includes("سوريا") || text.includes("لبنان")) {
    return { dewey: "956", arabicDewey: "956", arabicDeweyName: "تاريخ بلاد الشام والشرق الأوسط" };
  }

  if (language === "ar") {
    return { dewey: "892.73", arabicDewey: "813", arabicDeweyName: "الرواية والأدب العربي" };
  }

  return { dewey: "895.63", arabicDewey: "813", arabicDeweyName: "الأدب العالمي / العام" };
}

/**
 * Backward compatibility wrapper for calculateArabicDeweyForBook
 */
export function calculateArabicDeweyForBook(book: {
  title: string;
  description?: string;
  language?: string;
  subjects?: string[];
}): { code: string; label: string } {
  const result = calculatePrioritizedClassification({
    title: book.title,
    description: book.description,
    language: book.language,
    subjects: book.subjects,
  });
  return { code: result.arabicDewey, label: result.arabicDeweyName };
}
