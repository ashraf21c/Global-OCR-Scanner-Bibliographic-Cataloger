import React, { useState, useRef } from "react";
import {
  X,
  FileText,
  FileCode2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Upload,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Newspaper,
  Layers,
  ArrowRight,
  ExternalLink,
  Code,
  Download,
  PlusCircle,
} from "lucide-react";
import { BookRecord, AuthorRecord } from "../types/book";
import {
  SAMPLE_JSON5_TEMPLATE,
  parseAndValidateJson5,
  normalizeCustomBookRecord,
} from "../utils/customRecordUtils";
import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface CustomRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordSaved: (record: BookRecord) => void;
  onBatchImported: (records: BookRecord[]) => void;
  lang?: UiLanguage;
}

export const CustomRecordModal: React.FC<CustomRecordModalProps> = ({
  isOpen,
  onClose,
  onRecordSaved,
  onBatchImported,
  lang = "en",
}) => {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"form" | "json5" | "codeguide">("form");

  // Form State
  const [materialType, setMaterialType] = useState<"book" | "magazine" | "journal" | "serial">("book");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [titleRomaji, setTitleRomaji] = useState("");
  const [authorsStr, setAuthorsStr] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedDate, setPublishedDate] = useState(new Date().getFullYear().toString());
  const [language, setLanguage] = useState<string>("ar");
  const [isbn13, setIsbn13] = useState("");
  const [isbn10, setIsbn10] = useState("");
  const [issn, setIssn] = useState("");
  const [cCode, setCCode] = useState("");
  const [ndc, setNdc] = useState("");
  const [dewey, setDewey] = useState("");
  const [arabicDewey, setArabicDewey] = useState("");
  const [lcc, setLcc] = useState("");
  const [subjectHeadingsStr, setSubjectHeadingsStr] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [format, setFormat] = useState("Paperback");
  const [price, setPrice] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [description, setDescription] = useState("");

  // JSON5 Editor State
  const [json5Input, setJson5Input] = useState(SAMPLE_JSON5_TEMPLATE);
  const [parsedPreview, setParsedPreview] = useState<{
    success: boolean;
    records: BookRecord[];
    error?: string;
  } | null>(null);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showNotification(lang === "ar" ? "يرجى إدخال عنوان الكتاب أو الدورية" : "Title is required.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const authors: AuthorRecord[] = authorsStr.trim()
        ? authorsStr.split(/[,;\n]/).map((name) => ({
            name: name.trim(),
            role: "Author",
          })).filter((a) => a.name.length > 0)
        : [{ name: "Catalog Author", role: "Author" }];

      const subjectHeadings = subjectHeadingsStr.trim()
        ? subjectHeadingsStr.split(/[,;\n]/).map((s) => s.trim()).filter((s) => s.length > 0)
        : undefined;

      const record = normalizeCustomBookRecord({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        titleRomajiOrTranslated: titleRomaji.trim() || undefined,
        materialType,
        authors,
        publisher: publisher.trim() || "Independent Press",
        publishedDate: publishedDate.trim(),
        language,
        description: description.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        identifiers: {
          isbn13: isbn13.trim() || undefined,
          isbn10: isbn10.trim() || undefined,
          issn: issn.trim() || undefined,
          cCode: cCode.trim() || undefined,
        },
        classifications: {
          ndc: ndc.trim() || undefined,
          dewey: dewey.trim() || undefined,
          arabicDewey: arabicDewey.trim() || undefined,
          lcc: lcc.trim() || undefined,
          subjectHeadings,
        },
        periodicalInfo:
          materialType === "magazine" || materialType === "journal" || materialType === "serial" || issn
            ? {
                frequency,
                startYear: publishedDate.slice(0, 4),
                keyTitle: title,
              }
            : undefined,
        physical: {
          pageCount: pageCount ? Number(pageCount) : undefined,
          format,
          price: price.trim() || undefined,
        },
      });

      // Send to server custom database endpoint
      await fetch("/api/book/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record }),
      }).catch((e) => console.warn("Server custom record registration notice:", e));

      onRecordSaved(record);
      showNotification(
        lang === "ja"
          ? "書誌レコードを正常に保存・インデックスしました！"
          : lang === "ar"
          ? "تم حفظ وفهرسة السجل بنجاح في قاعدة البيانات!"
          : "Record successfully saved and indexed into database!"
      );

      // Reset form fields
      setTitle("");
      setSubtitle("");
      setTitleRomaji("");
      setIsbn13("");
      setIsbn10("");
      setIssn("");
      setCoverImageUrl("");
      setDescription("");
    } catch (err: any) {
      showNotification(err.message || "Failed to save record", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate JSON5 Input
  const handleValidateJson5 = () => {
    const res = parseAndValidateJson5(json5Input);
    setParsedPreview(res);
    if (!res.success) {
      showNotification(res.error || "JSON5 validation error", "error");
    } else {
      showNotification(
        lang === "ja"
          ? `構文検証完了: ${res.records.length} 件のレコードが有効です`
          : lang === "ar"
          ? `تم التحقق بنجاح: ${res.records.length} سجلات جاهزة للاستيراد`
          : `Valid JSON5: ${res.records.length} record(s) ready to import.`
      );
    }
  };

  // Execute Batch Import from JSON5
  const handleExecuteImport = async () => {
    const res = parseAndValidateJson5(json5Input);
    if (!res.success || res.records.length === 0) {
      showNotification(res.error || "No valid records to import.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Sync batch with server database endpoint
      await fetch("/api/book/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: res.records }),
      }).catch((e) => console.warn("Server batch custom sync notice:", e));

      onBatchImported(res.records);
      showNotification(
        lang === "ja"
          ? `${res.records.length} 件のレコードを一括インポートしました！`
          : lang === "ar"
          ? `تم استيراد ${res.records.length} سجلاً بنجاح إلى قاعدة البيانات!`
          : `Successfully imported ${res.records.length} record(s) into database!`
      );
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Import failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // File upload handler (.json5, .json, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJson5Input(content);
        const check = parseAndValidateJson5(content);
        setParsedPreview(check);
        showNotification(
          check.success
            ? `Loaded file with ${check.records.length} valid record(s).`
            : "Loaded file, please review JSON5 syntax."
        );
      }
    };
    reader.readAsText(file);
  };

  const copyCodebaseSnippet = () => {
    const sampleSnippet = `// Add your custom record inside KNOWN_BIB_RECORDS in:
// /src/utils/liveCatalogResolver.ts (around line 32)

"9789779224664": {
  id: "custom-story-of-korea",
  title: "قصة كوريا: فهم الكوريين وثقافتهم",
  materialType: "book",
  authors: [
    { name: "تشوي جون شيك", role: "Author" },
    { name: "د. محمود عبد الغفار", role: "Translator" },
  ],
  publisher: "المركز القومي للترجمة",
  publishedDate: "2022",
  language: "ar",
  identifiers: {
    isbn13: "9789779224664",
    isbn10: "9779224661",
  },
  classifications: {
    dewey: "951.9",
    arabicDewey: "951.9",
    arabicDeweyName: "تاريخ كوريا وشعبها",
  },
  physical: { pageCount: 116, format: "Paperback" },
},`;
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCodeSnippet(true);
    setTimeout(() => setCopiedCodeSnippet(false), 2000);
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-900/40 shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {t.customModalTitle}
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">
                {t.customModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-950/60 px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "form"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.tabWebForm}</span>
          </button>

          <button
            onClick={() => setActiveTab("json5")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "json5"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.tabJson5Import}</span>
            <span className="bg-indigo-950 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded border border-indigo-800/50">
              Batch
            </span>
          </button>

          <button
            onClick={() => setActiveTab("codeguide")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "codeguide"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>{t.tabCodeGuide}</span>
          </button>
        </div>

        {/* Notification Toast inside Modal */}
        {notification && (
          <div
            className={`mx-6 mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-emerald-950/80 text-emerald-200 border-emerald-800"
                : "bg-red-950/80 text-red-200 border-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Structured Web Form */}
          {activeTab === "form" && (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    {t.customFormTitle}
                  </h3>
                  {/* Material Type Toggle */}
                  <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setMaterialType("book")}
                      className={`px-2.5 py-1 rounded font-medium transition-all ${
                        materialType === "book"
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Book (كتاب)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaterialType("magazine")}
                      className={`px-2.5 py-1 rounded font-medium transition-all ${
                        materialType === "magazine"
                          ? "bg-emerald-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Magazine (مجلة)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaterialType("journal")}
                      className={`px-2.5 py-1 rounded font-medium transition-all ${
                        materialType === "journal"
                          ? "bg-teal-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Journal (دورية علمية)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Title (Required) */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">
                      {t.customFieldTitle} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: قصة الحضارة / كوكورو" : "e.g. Palace Walk / Kokoro / Nature"}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {t.customFieldSubtitle}
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Critical Edition / Vol. 1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Transliterated / Romaji Title */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Transliterated / English Title
                    </label>
                    <input
                      type="text"
                      value={titleRomaji}
                      onChange={(e) => setTitleRomaji(e.target.value)}
                      placeholder="e.g. Kokoro: The Heart of Things"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Authors */}
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">
                      {t.customFieldAuthors}
                    </label>
                    <input
                      type="text"
                      value={authorsStr}
                      onChange={(e) => setAuthorsStr(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: نجيب محفوظ, د. طه حسين" : "e.g. Natsume Sōseki, Naguib Mahfouz"}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Publisher */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {t.customFieldPublisher}
                    </label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="e.g. Dar El Shorouk / Iwanami Shoten"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Publication Year */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {t.customFieldYear}
                    </label>
                    <input
                      type="text"
                      value={publishedDate}
                      onChange={(e) => setPublishedDate(e.target.value)}
                      placeholder="e.g. 2024 or 1989-06-16"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {t.customFieldLanguage}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ar">العربية (Arabic)</option>
                      <option value="ja">日本語 (Japanese)</option>
                      <option value="en">English</option>
                      <option value="fr">Français (French)</option>
                      <option value="de">Deutsch (German)</option>
                      <option value="other">Other Language</option>
                    </select>
                  </div>

                  {/* Cover URL */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {t.customFieldCoverUrl}
                    </label>
                    <input
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://... cover image link"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Identifiers & Standard Numbers Section */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Identifiers & Standard Library Numbers (ISBN / ISSN / C-Code)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldIsbn13}
                    </label>
                    <input
                      type="text"
                      value={isbn13}
                      onChange={(e) => setIsbn13(e.target.value)}
                      placeholder="978..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldIsbn10}
                    </label>
                    <input
                      type="text"
                      value={isbn10}
                      onChange={(e) => setIsbn10(e.target.value)}
                      placeholder="10 digits..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldIssn}
                    </label>
                    <input
                      type="text"
                      value={issn}
                      onChange={(e) => setIssn(e.target.value)}
                      placeholder="0000-0000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-teal-300 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Japanese C-Code
                    </label>
                    <input
                      type="text"
                      value={cCode}
                      onChange={(e) => setCCode(e.target.value)}
                      placeholder="C0193"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-rose-300 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Classifications Section */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Library Classifications & Shelf Numbers (NDC / DDC / ALECSO / LCC)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldDewey}
                    </label>
                    <input
                      type="text"
                      value={dewey}
                      onChange={(e) => setDewey(e.target.value)}
                      placeholder="e.g. 892.7 or 895.6"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldArabicDewey}
                    </label>
                    <input
                      type="text"
                      value={arabicDewey}
                      onChange={(e) => setArabicDewey(e.target.value)}
                      placeholder="e.g. 813 or 210"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-emerald-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldNdc}
                    </label>
                    <input
                      type="text"
                      value={ndc}
                      onChange={(e) => setNdc(e.target.value)}
                      placeholder="e.g. 913.6"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-rose-300 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldLcc}
                    </label>
                    <input
                      type="text"
                      value={lcc}
                      onChange={(e) => setLcc(e.target.value)}
                      placeholder="e.g. PJ7800 or PL812"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-slate-400 font-medium mb-1 text-xs">
                    Subject Headings (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={subjectHeadingsStr}
                    onChange={(e) => setSubjectHeadingsStr(e.target.value)}
                    placeholder="e.g. الأدب العربي الحديث, الرواية الفلسفية / Modern Fiction"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Physical & Description */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldPages}
                    </label>
                    <input
                      type="number"
                      value={pageCount || ""}
                      onChange={(e) => setPageCount(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="e.g. 384"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Format / Binding
                    </label>
                    <input
                      type="text"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      placeholder="Paperback / Hardcover"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      {t.customFieldPrice}
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. ¥540 / 90 EGP"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-amber-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-xs">
                    {t.customFieldDescription}
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Colophon notes, summary, publication background..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setSubtitle("");
                    setIsbn13("");
                    setIsbn10("");
                    setIssn("");
                    setCoverImageUrl("");
                    setDescription("");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  {t.customResetBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.customSaveBtn}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: JSON5 Multi-Record Batch Importer */}
          {activeTab === "json5" && (
            <div className="flex flex-col gap-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setJson5Input(SAMPLE_JSON5_TEMPLATE);
                      showNotification("Complete JSON5 template loaded with books and periodicals!");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.loadJson5SampleBtn}</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json5,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t.uploadJson5Btn}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleValidateJson5}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-900/60 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Validate JSON5</span>
                  </button>
                </div>
              </div>

              {/* JSON5 Syntax Tip */}
              <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/40 text-xs text-indigo-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{t.json5SyntaxHelp}</span>
              </div>

              {/* Code Editor Textarea */}
              <div className="relative">
                <textarea
                  rows={15}
                  value={json5Input}
                  onChange={(e) => setJson5Input(e.target.value)}
                  placeholder="Paste your JSON5 array of book records here..."
                  className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Parsed Preview Section */}
              {parsedPreview && (
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    parsedPreview.success
                      ? "bg-slate-950 border-emerald-800/60 text-slate-300"
                      : "bg-red-950/40 border-red-800/60 text-red-300"
                  }`}
                >
                  {parsedPreview.success ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Parsed {parsedPreview.records.length} Record(s) Successfully:
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                        {parsedPreview.records.map((r, i) => (
                          <div
                            key={i}
                            className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px]"
                          >
                            <span className="font-semibold text-white block line-clamp-1">
                              {i + 1}. {r.title}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {r.materialType || "book"} • {r.identifiers.isbn13 || r.identifiers.issn || r.language}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-300">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{parsedPreview.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Import Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t.importJson5Btn}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Direct Codebase File Guide */}
          {activeTab === "codeguide" && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <FileCode2 className="w-4 h-4 text-indigo-400" />
                  {t.codeGuideTitle}
                </h3>
                <p className="text-slate-400 mb-3">
                  {t.codeGuideSubtitle}
                </p>

                {/* Target File Badge */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {t.codeGuideFileLabel}
                    </span>
                    <span className="text-indigo-300 font-mono font-bold text-xs">
                      /src/utils/liveCatalogResolver.ts
                    </span>
                  </div>
                  <span className="bg-indigo-950 text-indigo-400 px-2 py-1 rounded text-[11px] font-mono border border-indigo-800/60">
                    Line ~32: KNOWN_BIB_RECORDS
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed mb-3">
                  {t.codeGuideInstructions}
                </p>

                {/* Code Snippet Box */}
                <div className="relative">
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={copyCodebaseSnippet}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {copiedCodeSnippet ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`// Inside /src/utils/liveCatalogResolver.ts:
export const KNOWN_BIB_RECORDS: Record<string, any> = {

  // Paste your custom record here using ISBN-13, ISBN-10, or ISSN as the key:
  "9789779224664": {
    id: "custom-story-of-korea",
    materialType: "book",
    title: "قصة كوريا: فهم الكوريين وثقافتهم",
    titleRomajiOrTranslated: "The Story of Korea: Understanding Koreans and their Culture",
    subtitle: "إصدارات المركز القومي للترجمة - العدد 3418",
    authors: [
      { name: "تشوي جون شيك", role: "Author" },
      { name: "د. محمود عبد الغفار", role: "Translator" },
    ],
    publisher: "المركز القومي للترجمة",
    publishedDate: "2022",
    language: "ar",
    coverImageUrl: "https://cdn.raffy.me/resize/400x600/covers/raffy.me_404420.webp",
    identifiers: {
      isbn13: "9789779224664",
      isbn10: "9779224661",
      nwfId: "NWF-268593",
      aucId: "AUC-EG-224664",
    },
    classifications: {
      dewey: "951.9",
      arabicDewey: "951.9",
      arabicDeweyName: "تاريخ كوريا وشعبها (تاريخ آسيا والشرق الأقصى)",
      lcc: "DS904",
      subjectHeadings: ["كوريا - الحضارة والأنثروبولوجيا الثقافية"],
      classificationBasis: "abstract_subjects",
    },
    physical: {
      pageCount: 116,
      format: "غلاف عادي (Paperback)",
      price: "90 EGP",
    },
  },
  
  // (Other records...)
};`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
