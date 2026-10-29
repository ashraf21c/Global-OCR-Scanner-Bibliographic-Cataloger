import React, { useState, useEffect } from "react";
import {
  Scan,
  BookOpen,
  Sparkles,
  UserCheck,
  Archive,
  Sliders,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Library,
  BookMarked,
  Globe2,
  Compass,
  Radio,
} from "lucide-react";
import { ScannerModal } from "./components/ScannerModal";
import { BookDetailView } from "./components/BookDetailView";
import { LibrarianCitationTools } from "./components/LibrarianCitationTools";
import { AuthorAuthorityView } from "./components/AuthorAuthorityView";
import { BatchHistoryView } from "./components/BatchHistoryView";
import { ControlPanelModal } from "./components/ControlPanelModal";
import { ArabicDeweyCalculatorModal } from "./components/ArabicDeweyCalculatorModal";
import { SruCatalogsModal } from "./components/SruCatalogsModal";
import { BookRecord, OcrResult } from "./types/book";
import { parseBookIdentifier } from "./utils/isbnUtils";
import {
  convertStandardDeweyToArabicDewey,
  calculateArabicDeweyForBook,
  calculatePrioritizedClassification,
} from "./utils/arabicDeweyUtils";
import { UiLanguage, TRANSLATIONS } from "./utils/translations";

// Benchmark initial record: Natsume Sōseki's "Kokoro" (Japanese ISBN4 classic)
const INITIAL_DEMO_BOOK: BookRecord = {
  id: "kokoro-demo-isbn4",
  title: "こころ (Kokoro)",
  titleRomajiOrTranslated: "Kokoro: The Heart of Things",
  subtitle: "岩波文庫 (Iwanami Bunko Edition)",
  authors: [
    {
      name: "夏目漱石",
      transliteratedName: "Natsume Sōseki",
      role: "Author",
      viafId: "108238901",
      ndlId: "00054222",
      locId: "n79056789",
      bio: "Foremost novelist of the Meiji period in modern Japanese literature.",
    },
  ],
  publisher: "岩波書店 (Iwanami Shoten)",
  publishedDate: "1989-06-16",
  language: "ja",
  description:
    "『こころ』は夏目漱石の代表作。明治の精神の終焉と人間の孤独、罪の意識を描いた近代日本文学の不滅の古典。親友Kへの裏切りと先生の遺書を通じて倫理と自我の葛藤を浮き彫りにする。",
  coverImageUrl:
    "https://images-na.ssl-images-amazon.com/images/P/4003101014.09.LZZZZZZZ.jpg",
  altCoverUrls: [
    "https://images-na.ssl-images-amazon.com/images/P/4003101014.09.LZZZZZZZ.jpg",
    "https://covers.openlibrary.org/b/isbn/9784003101018-L.jpg?default=false"
  ],
  identifiers: {
    isbn13: "9784003101018",
    isbn10: "4003101014",
    japaneseIsbn4: "ISBN4-00-310101-4",
    cCode: "C0193",
    aucId: "AUC-SA-913421",
    kfnlId: "KFNL-1439-0821",
    lccn: "89-012847",
    oclc: "20782394",
    librarything: "18432",
  },
  classifications: {
    ndc: "913.6",
    dewey: "895.634",
    arabicDewey: "813",
    arabicDeweyName: "القصة والرواية (الأدب العربي المترجم)",
    lcc: "PL812.A8 K6",
    cCode: "C0193 (General Audience, Bunko Paperback, Japanese Literature)",
    subjectHeadings: ["Japanese Fiction - Meiji Period", "Psychological Fiction"],
    classificationBasis: "ndc",
    classificationNote: {
      en: "Calculated from official NDC classification (913.6)",
      ar: "تم الحساب بناءً على تصنيف نيبون العشري الرسمي (913.6)",
      ja: "公式の日本十進分類法（NDC: 913.6）から算出されました",
    },
  },
  physical: {
    pageCount: 382,
    format: "文庫 (Bunko Paperback)",
    dimensions: "15.0 x 10.6 cm",
    price: "¥480 + tax",
  },
  sourcesFound: [
    {
      name: "Amazon Japan",
      url: "https://www.amazon.co.jp/dp/4003101014",
      matched: true,
      notes: "Verified ASIN 4003101014 / Bunko paperback listing in stock",
    },
    {
      name: "Amazon.com (Global)",
      url: "https://www.amazon.com/dp/4003101014",
      matched: true,
      notes: "International Japanese import listing indexed under ASIN 4003101014",
    },
    {
      name: "National Diet Library (NDL)",
      url: "https://ndlsearch.ndl.go.jp/books/R100000002-I000001986422",
      matched: true,
      notes: "Official bibliographic deposit record NDC 913.6",
    },
    {
      name: "Arabic Union Catalog (الفهرس العربي الموحد)",
      url: "https://www.aruc.org",
      matched: true,
      notes: "Cross-referenced Arab translation records indexed under AUC-SA-913421",
    },
    {
      name: "King Fahd National Library (مكتبة الملك فهد)",
      url: "https://kfnl.gov.sa",
      matched: true,
      notes: "Legal deposit record for Middle East academic holdings",
    },
    {
      name: "Neelwafurat (nwf.com)",
      url: "https://www.neelwafurat.com",
      matched: true,
      notes: "Arabic translation edition 'القلب' cataloged under Dar Al-Mada",
    },
    {
      name: "Abjad (أبجد)",
      url: "https://www.abjad.com",
      matched: true,
      notes: "Arabic digital edition available for Middle East researchers",
    },
    {
      name: "Hindawi Foundation (مؤسسة هنداوي)",
      url: "https://www.hindawi.org",
      matched: true,
      notes: "Curated bibliographic author index entry",
    },
    {
      name: "Library of Congress",
      url: "https://catalog.loc.gov",
      matched: true,
      notes: "Asian Division holdings cataloged under LCCN 89-012847",
    },
    {
      name: "WorldCat",
      url: "https://www.worldcat.org/isbn/4003101014",
      matched: true,
      notes: "Held by 342 research libraries worldwide",
    },
    {
      name: "LibraryThing",
      url: "https://www.librarything.com/work/18432",
      matched: true,
      notes: "Work #18432 with 4,210 reader ratings",
    },
  ],
  crossReferencedEditions: [
    {
      title: "القلب (Kokoro - Arabic Translation)",
      language: "ar",
      isbn: "9789953684123",
      publisher: "دار المدى (Dar Al-Mada)",
      year: "2018",
      relation: "Arabic Translation",
    },
    {
      title: "Kokoro: A Novel (English Translation by Edwin McClellan)",
      language: "en",
      isbn: "9781590172148",
      publisher: "NYRB Classics",
      year: "2007",
      relation: "English Translation",
    },
  ],
  citations: {
    apa: "夏目漱石. (1989). こころ (Kokoro). 岩波書店.",
    mla: "夏目漱石. こころ (Kokoro). 岩波書店, 1989.",
    chicagoNotes: "夏目漱石, こころ (Kokoro) (岩波書店, 1989).",
    chicagoAuthorDate: "夏目漱石. 1989. こころ (Kokoro). 岩波書店.",
    harvard: "夏目漱石 (1989) こころ (Kokoro). 岩波書店.",
    ieee: "[1] Natsume Sōseki, こころ (Kokoro). 岩波書店, 1989.",
    sist02: "夏目漱石. こころ. 岩波書店, 1989, 382p, (岩波文庫).",
    arabicStandard: "ناتسومي، سوسيكي. (1989). كوكورو: القلب. إيوانامي شوتين.",
  },
  timestamp: Date.now(),
};

export default function App() {
  const [currentBook, setCurrentBook] = useState<BookRecord>(INITIAL_DEMO_BOOK);
  const [scanHistory, setScanHistory] = useState<BookRecord[]>(() => {
    try {
      const saved = localStorage.getItem("book_scan_history");
      return saved ? JSON.parse(saved) : [INITIAL_DEMO_BOOK];
    } catch {
      return [INITIAL_DEMO_BOOK];
    }
  });

  const [activeTab, setActiveTab] = useState<"scanner" | "book" | "citations" | "authority" | "history">("scanner");
  const [librarianToolMode, setLibrarianToolMode] = useState<"citations" | "export" | "spine_label">("citations");
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [controlPanelOpen, setControlPanelOpen] = useState<boolean>(false);
  const [arabicDeweyModalOpen, setArabicDeweyModalOpen] = useState<boolean>(false);
  const [sruModalOpen, setSruModalOpen] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<{
    type: "info" | "success" | "error";
    message: string;
  } | null>(null);

  const [currentLang, setCurrentLang] = useState<UiLanguage>(() => {
    try {
      const saved = localStorage.getItem("app_ui_lang") as UiLanguage;
      if (saved === "en" || saved === "ja" || saved === "ar") return saved;
    } catch (_) {}
    return "en";
  });

  useEffect(() => {
    try {
      localStorage.setItem("app_ui_lang", currentLang);
    } catch (_) {}
    document.documentElement.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", currentLang);
  }, [currentLang]);

  const t = TRANSLATIONS[currentLang];

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("book_scan_history", JSON.stringify(scanHistory));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [scanHistory]);

  const notify = (message: string, type: "info" | "success" | "error" = "info") => {
    setStatusNotification({ type, message });
    setTimeout(() => {
      setStatusNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleApplyArabicDewey = (arabicDewey: string, arabicDeweyName: string) => {
    if (!currentBook) return;
    const updated: BookRecord = {
      ...currentBook,
      classifications: {
        ...currentBook.classifications,
        arabicDewey,
        arabicDeweyName,
      },
    };
    setCurrentBook(updated);
    setScanHistory((prev) => [updated, ...prev.filter((b) => b.id !== updated.id)]);
    notify(`Arabic Dewey set to ${arabicDewey} (${arabicDeweyName})!`, "success");
  };

  // Perform search / crawl for a book identifier
  const handleIdentifierSubmit = async (rawIdentifier: string, ocrData?: OcrResult) => {
    setIsCrawling(true);
    notify(`Looking up & crawling catalog for "${rawIdentifier}"...`, "info");

    try {
      const res = await fetch("/api/book/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: rawIdentifier }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const raw = json.data;
        const parsedMeta = parseBookIdentifier(rawIdentifier);

        const newBookRecord: BookRecord = {
          id: `book-${Date.now()}`,
          title: raw.title || ocrData?.titleHint || rawIdentifier,
          titleRomajiOrTranslated: raw.titleRomajiOrTranslated,
          subtitle: raw.subtitle,
          authors:
            raw.authors && raw.authors.length > 0
              ? raw.authors
              : [
                  {
                    name: ocrData?.authorHint || "Unknown Author",
                    transliteratedName: ocrData?.authorHint,
                    role: "Author",
                  },
                ],
          publisher: raw.publisher || ocrData?.publisherHint || "Catalog Ingest",
          publishedDate: raw.publishedDate || new Date().getFullYear().toString(),
          language: raw.language || (parsedMeta.type === "Japanese-ISBN4" ? "ja" : "en"),
          description: raw.description,
          coverImageUrl: raw.coverImageUrl,
          identifiers: {
            isbn13: raw.identifiers?.isbn13 || parsedMeta.isbn13,
            isbn10: raw.identifiers?.isbn10 || parsedMeta.isbn10,
            japaneseIsbn4:
              raw.identifiers?.japaneseIsbn4 ||
              parsedMeta.japaneseIsbn4 ||
              (parsedMeta.type === "Japanese-ISBN4" ? rawIdentifier : undefined),
            cCode: raw.identifiers?.cCode || ocrData?.cCode || parsedMeta.cCode?.code,
            lccn: raw.identifiers?.lccn,
            oclc: raw.identifiers?.oclc,
            asin: raw.identifiers?.asin,
            librarything: raw.identifiers?.librarything,
            aucId: raw.identifiers?.aucId,
            kfnlId: raw.identifiers?.kfnlId,
            darElKotobId: raw.identifiers?.darElKotobId,
            hindawiId: raw.identifiers?.hindawiId,
            noorBookId: raw.identifiers?.noorBookId,
            alManhalId: raw.identifiers?.alManhalId,
            nwfId: raw.identifiers?.nwfId,
            abjadId: raw.identifiers?.abjadId,
            rawOcrText: ocrData?.exactRawText,
          },
          classifications: (() => {
            const bookTitle = raw.title || ocrData?.titleHint || rawIdentifier;
            const resolvedLang = raw.language || (parsedMeta.type === "Japanese-ISBN4" ? "ja" : "en");
            const resolvedNdc = raw.classifications?.ndc || (parsedMeta.type === "Japanese-ISBN4" ? "913.6" : undefined);
            const resolvedCCode = raw.identifiers?.cCode || ocrData?.cCode || parsedMeta.cCode?.code;

            const prioritized = calculatePrioritizedClassification({
              title: bookTitle,
              ndc: resolvedNdc,
              cCode: resolvedCCode,
              dewey: raw.classifications?.dewey,
              lcc: raw.classifications?.lcc,
              description: raw.description,
              subjects: raw.classifications?.subjectHeadings,
              language: resolvedLang,
            });

            return {
              ndc: resolvedNdc || prioritized.ndc,
              dewey: raw.classifications?.dewey || prioritized.dewey,
              arabicDewey: raw.classifications?.arabicDewey || prioritized.arabicDewey,
              arabicDeweyName: raw.classifications?.arabicDeweyName || prioritized.arabicDeweyName,
              lcc: raw.classifications?.lcc || prioritized.lcc,
              cCode: raw.classifications?.cCode || (parsedMeta.cCode ? `${parsedMeta.cCode.code} (${parsedMeta.cCode.audience}, ${parsedMeta.cCode.format}, ${parsedMeta.cCode.subject})` : undefined),
              subjectHeadings: raw.classifications?.subjectHeadings,
              classificationBasis: prioritized.basis,
              classificationNote: prioritized.note,
            };
          })(),
          physical: raw.physical || {
            format: parsedMeta.cCode ? parsedMeta.cCode.format : "Paperback",
            price: ocrData?.price,
          },
          sourcesFound: raw.sourcesFound || [
            {
              name: "Catalog Crawler",
              matched: true,
              notes: "Record retrieved via bibliographic resolver",
            },
          ],
          crossReferencedEditions: raw.crossReferencedEditions || [],
          citations: raw.citations || {},
          timestamp: Date.now(),
        };

        setCurrentBook(newBookRecord);
        setScanHistory((prev) => [newBookRecord, ...prev.filter((b) => b.id !== newBookRecord.id)]);
        setActiveTab("book");
        notify(`Catalog record loaded for "${newBookRecord.title}"!`, "success");
      } else {
        throw new Error(json.error || "Book not found in catalogs");
      }
    } catch (err: any) {
      console.error(err);
      notify(err.message || "Failed to retrieve book metadata", "error");
    } finally {
      setIsCrawling(false);
    }
  };

  // Re-run deep crawler with all sources (Amazon JP, NDL, NWF, Abjad, WorldCat)
  const handleDeepReCrawl = async () => {
    if (!currentBook) return;
    const targetId =
      currentBook.identifiers.isbn13 ||
      currentBook.identifiers.isbn10 ||
      currentBook.identifiers.japaneseIsbn4 ||
      currentBook.title;

    setIsCrawling(true);
    notify(`Executing deep multi-catalog crawl across Amazon JP, NDL, NWF, Abjad, and WorldCat...`, "info");

    try {
      const res = await fetch("/api/book/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: targetId }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const rePrioritized = calculatePrioritizedClassification({
          title: json.data.title || currentBook.title,
          ndc: json.data.classifications?.ndc || currentBook.classifications?.ndc,
          cCode: json.data.identifiers?.cCode || currentBook.identifiers?.cCode,
          dewey: json.data.classifications?.dewey || currentBook.classifications?.dewey,
          lcc: json.data.classifications?.lcc || currentBook.classifications?.lcc,
          description: json.data.description || currentBook.description,
          subjects: json.data.classifications?.subjectHeadings || currentBook.classifications?.subjectHeadings,
          language: json.data.language || currentBook.language,
        });

        const updated: BookRecord = {
          ...currentBook,
          ...json.data,
          identifiers: {
            ...currentBook.identifiers,
            ...(json.data.identifiers || {}),
          },
          classifications: {
            ...currentBook.classifications,
            ...(json.data.classifications || {}),
            arabicDewey: json.data.classifications?.arabicDewey || rePrioritized.arabicDewey,
            arabicDeweyName: json.data.classifications?.arabicDeweyName || rePrioritized.arabicDeweyName,
            classificationBasis: rePrioritized.basis,
            classificationNote: rePrioritized.note,
          },
          citations: {
            ...currentBook.citations,
            ...(json.data.citations || {}),
          },
        };
        setCurrentBook(updated);
        setScanHistory((prev) => [updated, ...prev.filter((b) => b.id !== updated.id)]);
        notify(json.fallbackNotice || "Deep cross-catalog sync completed!", "success");
      }
    } catch (e: any) {
      notify("Crawl notice: " + (e.message || "Catalog data up to date"), "info");
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div
      dir={currentLang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white"
    >
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-900/40 shrink-0">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                {t.appTitle}
              </h1>
              <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-800/60 hidden sm:inline-block">
                v2.6 Multi-Catalog
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Navigation, Language Switcher & Control Panel */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Global Language Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setCurrentLang("en")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentLang === "en"
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setCurrentLang("ja")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentLang === "ja"
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="日本語 (Japanese)"
            >
              日本語
            </button>
            <button
              type="button"
              onClick={() => setCurrentLang("ar")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentLang === "ar"
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="العربية (Arabic)"
            >
              العربية
            </button>
          </div>

          {/* Main View Tabs */}
          <nav className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("scanner")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "scanner"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{t.tabScanner}</span>
            </button>

            <button
              onClick={() => setActiveTab("book")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "book"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.tabRecord}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("citations");
                setLibrarianToolMode("citations");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "citations"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.tabCitations}</span>
            </button>

            <button
              onClick={() => setActiveTab("authority")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hidden md:flex ${
                activeTab === "authority"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t.tabAuthority}</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "history"
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{t.tabBatch} ({scanHistory.length})</span>
            </button>
          </nav>

          {/* Arabic Dewey 10 Calculator Trigger */}
          <button
            onClick={() => setArabicDeweyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Arabic Dewey 10 Calculator & Converter (التصنيف العشري العربي)"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{t.btnArabicDewey}</span>
            <span className="font-mono text-[10px] bg-emerald-900/80 px-1.5 py-0.2 rounded font-bold">
              10
            </span>
          </button>

          {/* SRU & Z39.50 Library Gateways Trigger */}
          <button
            onClick={() => setSruModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="SRU & Z39.50 Library Gateways (LOC, NDL, BL, AUC, BA, QNL, BnF, DNB)"
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{t.btnSru}</span>
          </button>

          {/* Control Panel Toggle */}
          <button
            onClick={() => setControlPanelOpen(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
            title="External API Keys, Rate Limits & Crawlers Control Panel"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {statusNotification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl border shadow-2xl text-xs font-semibold flex items-center gap-2 transition-all animate-bounce ${
            statusNotification.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-800"
              : statusNotification.type === "error"
              ? "bg-red-950/90 text-red-200 border-red-800"
              : "bg-indigo-950/90 text-indigo-200 border-indigo-800"
          }`}
        >
          {statusNotification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : statusNotification.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          )}
          <span>{statusNotification.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Active Tab View Rendering */}
        {activeTab === "scanner" && (
          <div>
            <ScannerModal
              lang={currentLang}
              onScanResult={handleIdentifierSubmit}
              isProcessing={isCrawling}
            />

            {/* Quick preview of currently loaded book under scanner */}
            {currentBook && (
              <div className="mt-8 pt-6 border-t border-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-300">
                      {t.currentlyActiveRecord}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("book")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>{t.viewFullIntelligenceRecord}</span>
                    <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>

                <BookDetailView
                  book={currentBook}
                  lang={currentLang}
                  onLanguageChange={setCurrentLang}
                  onOpenCitations={() => {
                    setActiveTab("citations");
                    setLibrarianToolMode("citations");
                  }}
                  onOpenExport={() => {
                    setActiveTab("citations");
                    setLibrarianToolMode("export");
                  }}
                  onOpenSpineLabel={() => {
                    setActiveTab("citations");
                    setLibrarianToolMode("spine_label");
                  }}
                  onReCrawl={handleDeepReCrawl}
                  onOpenArabicDeweyModal={() => setArabicDeweyModalOpen(true)}
                  onOpenSruModal={() => setSruModalOpen(true)}
                  isCrawling={isCrawling}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "book" && (
          <BookDetailView
            book={currentBook}
            lang={currentLang}
            onLanguageChange={setCurrentLang}
            onOpenCitations={() => {
              setActiveTab("citations");
              setLibrarianToolMode("citations");
            }}
            onOpenExport={() => {
              setActiveTab("citations");
              setLibrarianToolMode("export");
            }}
            onOpenSpineLabel={() => {
              setActiveTab("citations");
              setLibrarianToolMode("spine_label");
            }}
            onReCrawl={handleDeepReCrawl}
            onOpenArabicDeweyModal={() => setArabicDeweyModalOpen(true)}
            onOpenSruModal={() => setSruModalOpen(true)}
            isCrawling={isCrawling}
          />
        )}

        {activeTab === "citations" && (
          <LibrarianCitationTools
            book={currentBook}
            activeMode={librarianToolMode}
            lang={currentLang}
          />
        )}

        {activeTab === "authority" && (
          <AuthorAuthorityView book={currentBook} lang={currentLang} />
        )}

        {activeTab === "history" && (
          <BatchHistoryView
            history={scanHistory}
            lang={currentLang}
            onSelectBook={(selected) => {
              setCurrentBook(selected);
              setActiveTab("book");
            }}
            onClearHistory={() => setScanHistory([])}
          />
        )}
      </main>

      {/* Arabic Dewey 10 Converter & Calculator Modal */}
      <ArabicDeweyCalculatorModal
        isOpen={arabicDeweyModalOpen}
        onClose={() => setArabicDeweyModalOpen(false)}
        onApplyClassification={handleApplyArabicDewey}
        lang={currentLang}
        initialCode={
          currentBook?.classifications?.arabicDewey ||
          currentBook?.classifications?.dewey ||
          "892.73"
        }
      />

      {/* Control Panel Modal for External APIs & Crawlers */}
      <ControlPanelModal
        isOpen={controlPanelOpen}
        onClose={() => setControlPanelOpen(false)}
        lang={currentLang}
      />

      {/* SRU & Z39.50 Library Gateways Modal */}
      <SruCatalogsModal
        isOpen={sruModalOpen}
        onClose={() => setSruModalOpen(false)}
        lang={currentLang}
        initialIsbn={
          currentBook?.identifiers?.isbn13 ||
          currentBook?.identifiers?.isbn10 ||
          currentBook?.identifiers?.japaneseIsbn4 ||
          "9784003101018"
        }
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-indigo-400" />
          <span>
            {t.footerTagline}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setControlPanelOpen(true)}
            className="hover:text-slate-200 transition-colors"
          >
            {t.apiControlPanel}
          </button>
          <span>•</span>
          <span className="font-mono text-slate-400">
            {scanHistory.length} {t.scannedRecordsCount}
          </span>
        </div>
      </footer>
    </div>
  );
}
