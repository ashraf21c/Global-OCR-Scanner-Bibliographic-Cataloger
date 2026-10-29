import React, { useState } from "react";
import {
  BookRecord,
  CatalogSourceResult,
  CrossReferencedEdition,
} from "../types/book";
import {
  Book,
  Download,
  ExternalLink,
  Tag,
  Hash,
  Globe,
  Layers,
  Sparkles,
  Share2,
  BookmarkCheck,
  Building,
  CheckCircle,
  Copy,
  Info,
  ChevronRight,
  Maximize2,
  X,
  Radio,
  Search,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { downloadCoverImage } from "../utils/exportUtils";
import { formatIsbnHyphens, decodeCCode } from "../utils/isbnUtils";

import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface BookDetailViewProps {
  book: BookRecord;
  onOpenCitations: () => void;
  onOpenExport: () => void;
  onOpenSpineLabel: () => void;
  onReCrawl: () => void;
  onOpenArabicDeweyModal?: () => void;
  onOpenSruModal?: () => void;
  isCrawling?: boolean;
  lang?: UiLanguage;
  onLanguageChange?: (lang: UiLanguage) => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  onOpenCitations,
  onOpenExport,
  onOpenSpineLabel,
  onReCrawl,
  onOpenArabicDeweyModal,
  onOpenSruModal,
  isCrawling = false,
  lang = "en",
  onLanguageChange,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "catalogs" | "crossref" | "raw">("overview");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [zoomCover, setZoomCover] = useState<boolean>(false);
  const [noteLang, setNoteLang] = useState<"en" | "ar" | "ja">(lang);
  const [failedCoverUrls, setFailedCoverUrls] = useState<Set<string>>(new Set());
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);
  const [showAltCovers, setShowAltCovers] = useState<boolean>(false);

  // Reset cover cascade when book changes
  React.useEffect(() => {
    setFailedCoverUrls(new Set());
    setSelectedCoverUrl(null);
    setShowAltCovers(false);
  }, [book.id, book.identifiers.isbn13]);

  // Compile full list of candidate covers
  const candidateCovers = React.useMemo(() => {
    const list: string[] = [];
    if (selectedCoverUrl) list.push(selectedCoverUrl);
    if (book.coverImageUrl && !list.includes(book.coverImageUrl)) list.push(book.coverImageUrl);
    if (book.altCoverUrls) {
      for (const u of book.altCoverUrls) {
        if (u && !list.includes(u)) list.push(u);
      }
    }
    const isbn13 = book.identifiers.isbn13;
    const isbn10 = book.identifiers.isbn10;
    const queryIsbn = isbn13 || isbn10;
    if (queryIsbn) {
      const olL = `https://covers.openlibrary.org/b/isbn/${queryIsbn}-L.jpg?default=false`;
      if (!list.includes(olL)) list.push(olL);
    }
    if (isbn10) {
      const amz = `https://images-na.ssl-images-amazon.com/images/P/${isbn10}.09.LZZZZZZZ.jpg`;
      if (!list.includes(amz)) list.push(amz);
    }
    return list;
  }, [book, selectedCoverUrl]);

  const activeCover = candidateCovers.find((u) => !failedCoverUrls.has(u));

  const handleCoverError = (url?: string) => {
    if (!url) return;
    setFailedCoverUrls((prev) => new Set([...prev, url]));
  };

  // Sync note language when global lang changes
  React.useEffect(() => {
    setNoteLang(lang);
  }, [lang]);

  const t = TRANSLATIONS[lang];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const primaryIsbn =
    book.identifiers.isbn13 || book.identifiers.isbn10 || "Unknown";
  const cCodeDetails = book.identifiers.cCode
    ? decodeCCode(book.identifiers.cCode)
    : undefined;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8 text-slate-100">
      {/* Top action bar */}
      <div className="bg-slate-950 px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
            <Book className="w-3.5 h-3.5" />
            {t.bibRecordBadge}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {formatIsbnHyphens(primaryIsbn)}
          </span>
          {book.identifiers.japaneseIsbn4 && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
              {t.japaneseIsbn4Badge}: {book.identifiers.japaneseIsbn4}
            </span>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCitations}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.btnCitationsQuick}
          </button>
          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {t.btnExportQuick}
          </button>
          <button
            onClick={onOpenSpineLabel}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/50 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            {t.btnSpineQuick}
          </button>
          <button
            onClick={onReCrawl}
            disabled={isCrawling}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title="Re-run deep crawler across all catalogs"
          >
            <Globe className="w-3.5 h-3.5" />
            {isCrawling ? t.btnRecrawling : t.btnRecrawl}
          </button>
        </div>
      </div>

      {/* Main book hero block */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-slate-800/80">
        {/* Cover Column */}
        <div className="md:col-span-3 flex flex-col items-center">
          <div className="relative group w-48 aspect-[2/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {activeCover ? (
              <img
                src={activeCover}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => setZoomCover(true)}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  // Detect 43-byte transparent 1x1 placeholder dot returned by OpenLibrary/Amazon 404
                  if (img.naturalWidth <= 2 && img.naturalHeight <= 2) {
                    handleCoverError(activeCover);
                  }
                }}
                onError={() => {
                  handleCoverError(activeCover);
                }}
              />
            ) : (
              <div className="text-center p-4 text-slate-500 flex flex-col items-center">
                <Book className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-xs">{t.noCover}</span>
              </div>
            )}

            {activeCover && (
              <button
                onClick={() => setZoomCover(true)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title={t.zoomCoverTitle}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons below cover */}
          <div className="mt-3 flex flex-col w-full gap-2">
            {activeCover && (
              <button
                onClick={() =>
                  downloadCoverImage(
                    activeCover,
                    `cover_${primaryIsbn.replace(/[^0-9]/g, "")}`
                  )
                }
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 bg-indigo-950/40 hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg border border-indigo-800/50 transition-colors w-full"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadCover}</span>
              </button>
            )}

            {candidateCovers.length > 1 && (
              <button
                onClick={() => setShowAltCovers(!showAltCovers)}
                className="text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors w-full"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {lang === "ja"
                    ? `別表紙候補 (${candidateCovers.length})`
                    : lang === "ar"
                    ? `أغلفة بديلة (${candidateCovers.length})`
                    : `Alternative Covers (${candidateCovers.length})`}
                </span>
              </button>
            )}
          </div>

          {/* Alternative Covers Selector Drawer */}
          {showAltCovers && (
            <div className="mt-2 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>
                  {lang === "ja"
                    ? "表紙ソース選択"
                    : lang === "ar"
                    ? "اختر الغلاف المناسب"
                    : "Select Cover Source"}
                </span>
                <button
                  onClick={() => setShowAltCovers(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                {candidateCovers.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCoverUrl(url);
                      setFailedCoverUrls((prev) => {
                        const next = new Set(prev);
                        next.delete(url);
                        return next;
                      });
                    }}
                    className={`relative aspect-[2/3] rounded-lg overflow-hidden border transition-all ${
                      activeCover === url
                        ? "border-indigo-500 ring-2 ring-indigo-500/40"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Candidate ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleCoverError(url)}
                    />
                    {activeCover === url && (
                      <div className="absolute top-1 right-1 bg-indigo-600 rounded-full p-0.5 text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick spine details */}
          <div className="mt-4 w-full bg-slate-950 p-3 rounded-xl border border-slate-800/70 text-xs flex flex-col gap-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="text-slate-200 font-medium">
                {book.physical.format || "Paperback / Book"}
              </span>
            </div>
            {book.physical.pageCount && (
              <div className="flex justify-between">
                <span>Pages:</span>
                <span className="text-slate-200 font-medium">
                  {book.physical.pageCount} pp.
                </span>
              </div>
            )}
            {book.physical.price && (
              <div className="flex justify-between">
                <span>List Price:</span>
                <span className="text-amber-300 font-medium">
                  {book.physical.price}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Language:</span>
              <span className="text-slate-200 uppercase font-semibold">
                {book.language || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Details Column */}
        <div className="md:col-span-9 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {book.title}
            </h1>
            {book.titleRomajiOrTranslated && (
              <h2 className="text-lg text-indigo-300 font-medium mt-1">
                {book.titleRomajiOrTranslated}
              </h2>
            )}
            {book.subtitle && (
              <p className="text-sm text-slate-400 mt-1 italic">
                {book.subtitle}
              </p>
            )}
          </div>

          {/* Author(s) Authority Badge List */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">By</span>
            {book.authors.map((author, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs"
              >
                <span className="font-semibold text-slate-100">
                  {author.name}
                </span>
                {author.transliteratedName && author.transliteratedName !== author.name && (
                  <span className="text-slate-400">
                    ({author.transliteratedName})
                  </span>
                )}
                {author.viafId && (
                  <a
                    href={`http://viaf.org/viaf/${author.viafId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline bg-slate-900 px-1 rounded"
                    title="VIAF Authority Record"
                  >
                    VIAF
                  </a>
                )}
                {author.ndlId && (
                  <a
                    href={`https://id.ndl.go.jp/auth/ndlna/${author.ndlId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-rose-400 hover:underline bg-slate-900 px-1 rounded"
                    title="NDL Japanese Authority Record"
                  >
                    NDL
                  </a>
                )}
                {author.locId && (
                  <a
                    href={`https://id.loc.gov/authorities/names/${author.locId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline bg-slate-900 px-1 rounded"
                    title="Library of Congress Name Authority (NACO)"
                  >
                    LOC
                  </a>
                )}
              </div>
            ))}
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {book.publisher || "Publisher not specified"}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300 font-mono">
              {book.publishedDate}
            </span>
          </div>

          {/* Description / Synopsis */}
          {book.description && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
              <p>{book.description}</p>
            </div>
          )}

          {/* Japanese C-Code Special Breakdown if present */}
          {cCodeDetails && (
            <div className="bg-gradient-to-r from-rose-950/30 to-slate-900 p-3.5 rounded-xl border border-rose-900/40 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  {t.japaneseCCodeBreakdown} ({cCodeDetails.code})
                </span>
                {cCodeDetails.priceYen && (
                  <span className="text-amber-300 font-mono font-semibold">
                    ¥{cCodeDetails.priceYen} E ({t.originalPrice})
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px] mt-1">
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">{t.targetAudience}:</span>
                  <span className="font-medium text-slate-200">
                    {lang === "ja"
                      ? `${cCodeDetails.audienceJa} (${cCodeDetails.audience})`
                      : lang === "ar"
                      ? `${cCodeDetails.audienceAr} (${cCodeDetails.audienceJa})`
                      : `${cCodeDetails.audience} (${cCodeDetails.audienceJa})`}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">{t.formBinding}:</span>
                  <span className="font-medium text-slate-200">
                    {lang === "ja"
                      ? `${cCodeDetails.formatJa} (${cCodeDetails.format})`
                      : lang === "ar"
                      ? `${cCodeDetails.formatAr} (${cCodeDetails.formatJa})`
                      : `${cCodeDetails.format} (${cCodeDetails.formatJa})`}
                  </span>
                </div>
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">{t.subjectGenre}:</span>
                  <span className="font-medium text-slate-200">
                    {lang === "ja"
                      ? `${cCodeDetails.subjectJa} (${cCodeDetails.subject})`
                      : lang === "ar"
                      ? `${cCodeDetails.subjectAr} (${cCodeDetails.subjectJa})`
                      : `${cCodeDetails.subject} (${cCodeDetails.subjectJa})`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Identifiers Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {book.identifiers.isbn13 && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>ISBN-13</span>
                  <button
                    onClick={() =>
                      copyToClipboard(book.identifiers.isbn13!, "isbn13")
                    }
                    className="hover:text-white"
                  >
                    {copiedField === "isbn13" ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {book.identifiers.isbn13}
                </span>
              </div>
            )}

            {book.identifiers.isbn10 && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>ISBN-10</span>
                  <button
                    onClick={() =>
                      copyToClipboard(book.identifiers.isbn10!, "isbn10")
                    }
                    className="hover:text-white"
                  >
                    {copiedField === "isbn10" ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {book.identifiers.isbn10}
                </span>
              </div>
            )}

            {book.identifiers.lccn && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span title="Library of Congress Card Number / Control Number">LC Card No. (LCCN)</span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://lccn.loc.gov/${encodeURIComponent(book.identifiers.lccn.trim())}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-400 transition-colors"
                      title="Open permalink in Library of Congress (lccn.loc.gov)"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() =>
                        copyToClipboard(book.identifiers.lccn!, "lccn")
                      }
                      className="hover:text-white"
                      title="Copy LC Card Number"
                    >
                      {copiedField === "lccn" ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {book.identifiers.lccn}
                </span>
              </div>
            )}

            {book.identifiers.oclc && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>OCLC (WorldCat)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(book.identifiers.oclc!, "oclc")
                    }
                    className="hover:text-white"
                  >
                    {copiedField === "oclc" ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {book.identifiers.oclc}
                </span>
              </div>
            )}

            {book.identifiers.aucId && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Arabic Union (AUC)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(book.identifiers.aucId!, "auc")
                    }
                    className="hover:text-white"
                  >
                    {copiedField === "auc" ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  {book.identifiers.aucId}
                </span>
              </div>
            )}

            {book.identifiers.kfnlId && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>KFNL (Saudi Deposit)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(book.identifiers.kfnlId!, "kfnl")
                    }
                    className="hover:text-white"
                  >
                    {copiedField === "kfnl" ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  {book.identifiers.kfnlId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 bg-slate-950 px-6 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "overview"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.tabClassifications}
        </button>
        <button
          onClick={() => setActiveTab("catalogs")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "catalogs"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.tabCatalogSources}
          <span className="bg-slate-800 text-[10px] px-1.5 py-0.2 rounded-full">
            {book.sourcesFound.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("crossref")}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "crossref"
              ? "border-indigo-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.tabCrossRef}
          <span className="bg-indigo-900/60 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full">
            {book.crossReferencedEditions?.length || 0}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nippon Decimal */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                {t.ndcTitle}
              </span>
              <p className="text-lg font-mono font-bold text-slate-100">
                {book.classifications.ndc || "913.6"}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {t.ndcDesc}
              </span>
            </div>

            {/* Standard Dewey */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                {t.ddcTitle}
              </span>
              <p className="text-lg font-mono font-bold text-slate-100">
                {book.classifications.dewey || "895.63 / 892.7"}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {t.ddcDesc}
              </span>
            </div>

            {/* Arabic Dewey 10 */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 p-4 rounded-xl border border-emerald-900/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <span>{t.arabicDeweyTitle}</span>
                  </span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800 font-bold">
                    ALECSO
                  </span>
                </div>
                <p className="text-lg font-mono font-bold text-emerald-300">
                  {book.classifications.arabicDewey || "813"}
                </p>
                <span className="text-[11px] text-slate-300 mt-0.5 block line-clamp-1">
                  {book.classifications.arabicDeweyName || "القصة والرواية والأدب العربي"}
                </span>
              </div>
              {onOpenArabicDeweyModal && (
                <button
                  onClick={onOpenArabicDeweyModal}
                  className="mt-3 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start transition-colors bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-800/80 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t.arabicDeweyConvertBtn}</span>
                </button>
              )}
            </div>

            {/* Library of Congress */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                {t.lccTitle}
              </span>
              <p className="text-lg font-mono font-bold text-slate-100">
                {book.classifications.lcc || "PL856 / PJ7846"}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {t.lccDesc}
              </span>
            </div>
          </div>

          {/* Classification Basis & Priority Derivation Banner */}
          <div className={`mt-4 p-4 rounded-xl border ${
            book.classifications.classificationBasis === "title_only"
              ? "bg-amber-950/30 border-amber-800/80 text-amber-200"
              : "bg-slate-950 border-slate-800 text-slate-300"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  book.classifications.classificationBasis === "title_only"
                    ? "bg-amber-900/60 text-amber-300 border-amber-700"
                    : "bg-emerald-950 text-emerald-300 border-emerald-800"
                }`}>
                  {book.classifications.classificationBasis === "title_only"
                    ? t.priorityTitleOnlyWarning
                    : `${t.prioritySourcePrefix} ${(book.classifications.classificationBasis || "NDC").toUpperCase()}`}
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {t.priorityBannerTitle}
                </span>
              </div>

              {/* Language switcher for the note & app */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => {
                    setNoteLang("en");
                    onLanguageChange?.("en");
                  }}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    noteLang === "en" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setNoteLang("ar");
                    onLanguageChange?.("ar");
                  }}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    noteLang === "ar" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  العربية
                </button>
                <button
                  onClick={() => {
                    setNoteLang("ja");
                    onLanguageChange?.("ja");
                  }}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    noteLang === "ja" ? "bg-rose-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  日本語
                </button>
              </div>
            </div>

            {/* Active note presentation */}
            <div className="text-xs leading-relaxed mt-2" dir={noteLang === "ar" ? "rtl" : "ltr"}>
              {noteLang === "en" && (
                <p className="font-medium text-slate-100">
                  {book.classifications.classificationNote?.en ||
                    (book.classifications.classificationBasis === "title_only"
                      ? "This is calculated using the title only"
                      : "Classification calculated from official bibliographic metadata.")}
                </p>
              )}
              {noteLang === "ar" && (
                <p className="font-medium text-slate-100 font-sans">
                  {book.classifications.classificationNote?.ar ||
                    (book.classifications.classificationBasis === "title_only"
                      ? "تم الحساب بناءً على العنوان فقط"
                      : "تم حساب التصنيف بناءً على البيانات الببليوغرافية المتاحة.")}
                </p>
              )}
              {noteLang === "ja" && (
                <p className="font-medium text-slate-100 font-sans">
                  {book.classifications.classificationNote?.ja ||
                    (book.classifications.classificationBasis === "title_only"
                      ? "タイトル情報のみから算出されました"
                      : "書誌メタデータ情報から算出されました。")}
                </p>
              )}
            </div>

            {/* Side-by-side view of all translations */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-400">
              <div dir="ltr">
                <span className="text-slate-500 font-semibold">EN: </span>
                <span>{book.classifications.classificationNote?.en || (book.classifications.classificationBasis === "title_only" ? "This is calculated using the title only" : "Calculated from metadata")}</span>
              </div>
              <div dir="rtl">
                <span className="text-slate-500 font-semibold">AR: </span>
                <span>{book.classifications.classificationNote?.ar || (book.classifications.classificationBasis === "title_only" ? "تم الحساب بناءً على العنوان فقط" : "محسوب من البيانات")}</span>
              </div>
              <div dir="ltr">
                <span className="text-slate-500 font-semibold">JA: </span>
                <span>{book.classifications.classificationNote?.ja || (book.classifications.classificationBasis === "title_only" ? "タイトル情報のみから算出されました" : "書誌情報から算出")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

        {activeTab === "catalogs" && (
          <div className="flex flex-col gap-4">
            {/* SRU & Z39.50 Direct Protocol Banner */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900 p-4 rounded-xl border border-cyan-800/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                  <Radio className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    Direct SRU &amp; Z39.50 Library Gateways
                    <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                      MARCXML &bull; CQL
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Query Library of Congress, NDL Japan, British Library, Arabic Union Catalog (AUC), Bibliotheca Alexandrina, Qatar National Library, BnF France, and DNB Germany.
                  </p>
                </div>
              </div>
              {onOpenSruModal && (
                <button
                  onClick={onOpenSruModal}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Launch SRU / Z39.50 Explorer</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {book.sourcesFound.map((source, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-slate-100">
                      {source.name}
                    </span>
                    {source.matched ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                        <CheckCircle className="w-3 h-3" /> Matched
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full">
                        Catalog Checked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {source.notes || "Bibliographic holdings indexed."}
                  </p>
                </div>

                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start transition-colors"
                  >
                    <span>Open in {source.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
            </div>
          </div>
        )}

        {activeTab === "crossref" && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-400 mb-2">
              Cross-referenced editions, translations, and global holdings linked across Japanese, Arabic, and Western catalogs:
            </p>
            {book.crossReferencedEditions && book.crossReferencedEditions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {book.crossReferencedEditions.map((ed, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-100">
                        {ed.title}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {ed.publisher} • {ed.year}
                      </span>
                      {ed.isbn && (
                        <span className="text-[11px] font-mono text-indigo-400">
                          ISBN: {ed.isbn}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 shrink-0">
                      {ed.relation}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                No foreign translation editions currently cross-referenced for this record.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cover Zoom Modal */}
      {zoomCover && activeCover && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomCover(false)}
        >
          <div
            className="relative max-w-lg max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-2 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomCover(false)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeCover}
              alt={book.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <div className="w-full pt-3 px-2 flex justify-between items-center text-xs">
              <span className="font-semibold text-white truncate max-w-xs">
                {book.title}
              </span>
              <button
                onClick={() =>
                  downloadCoverImage(
                    activeCover,
                    `cover_${primaryIsbn.replace(/[^0-9]/g, "")}`
                  )
                }
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
