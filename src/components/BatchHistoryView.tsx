import React, { useState } from "react";
import { BookRecord } from "../types/book";
import {
  Archive,
  Download,
  Trash2,
  Tag,
  BookOpen,
  ChevronRight,
  Search,
  FileText,
  FileCode,
  CheckSquare,
  Square,
  ChevronDown,
  Layers,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import {
  exportBookData,
  ExportFormat,
} from "../utils/exportUtils";
import { formatIsbnHyphens } from "../utils/isbnUtils";
import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface BatchHistoryViewProps {
  history: BookRecord[];
  onSelectBook: (book: BookRecord) => void;
  onClearHistory: () => void;
  onOpenCustomModal?: () => void;
  lang?: UiLanguage;
}

export const BatchHistoryView: React.FC<BatchHistoryViewProps> = ({
  history,
  onSelectBook,
  onClearHistory,
  onOpenCustomModal,
  lang = "en",
}) => {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLang, setFilterLang] = useState<string>("all");
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const filtered = history.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      b.title.toLowerCase().includes(term) ||
      (b.titleRomajiOrTranslated && b.titleRomajiOrTranslated.toLowerCase().includes(term)) ||
      b.authors.some((a) => a.name.toLowerCase().includes(term)) ||
      (b.identifiers.isbn13 && b.identifiers.isbn13.includes(term)) ||
      (b.identifiers.isbn10 && b.identifiers.isbn10.includes(term)) ||
      (b.identifiers.cCode && b.identifiers.cCode.toLowerCase().includes(term)) ||
      (b.identifiers.aucId && b.identifiers.aucId.toLowerCase().includes(term));

    const matchesLang =
      filterLang === "all" ||
      (filterLang === "ja" && (b.language === "ja" || Boolean(b.identifiers.japaneseIsbn4))) ||
      (filterLang === "ar" && b.language === "ar") ||
      (filterLang === "western" && b.language !== "ja" && b.language !== "ar");

    return matchesSearch && matchesLang;
  });

  const toggleSelectAll = () => {
    if (selectedBookIds.size === filtered.length && filtered.length > 0) {
      setSelectedBookIds(new Set());
    } else {
      setSelectedBookIds(new Set(filtered.map((b) => b.id)));
    }
  };

  const toggleSelectBook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getTargetBooks = (): BookRecord[] => {
    if (selectedBookIds.size > 0) {
      return history.filter((b) => selectedBookIds.has(b.id));
    }
    return filtered.length > 0 ? filtered : history;
  };

  const handleBatchExport = (format: ExportFormat) => {
    const targets = getTargetBooks();
    if (targets.length === 0) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    exportBookData(targets, format, `scanned_catalog_batch_${dateStr}`);
    setExportMenuOpen(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Archive className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t.batchTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {history.length} {t.batchSubtitle}
              {selectedBookIds.size > 0 && (
                <span className="text-indigo-400 font-semibold ml-1.5">
                  ({selectedBookIds.size} {lang === "ja" ? "件選択中" : lang === "ar" ? "محدد" : "selected"})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Batch Export Dropdown */}
        <div className="flex flex-wrap items-center gap-2 relative">
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={history.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {selectedBookIds.size > 0
                  ? (lang === "ja" ? `選択済みを出力 (${selectedBookIds.size})` : lang === "ar" ? `تصدير المحدد (${selectedBookIds.size})` : `Export Selected (${selectedBookIds.size})`)
                  : t.batchExportDropdown}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {exportMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-xs flex flex-col gap-1 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                {/* HTML & PDF Document Exports */}
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Document Exports
                </div>
                <button
                  onClick={() => handleBatchExport("html")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-950/40 text-emerald-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="font-bold">HTML Catalog (dir=auto)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">.html</span>
                </button>
                <button
                  onClick={() => handleBatchExport("pdf")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-950/40 text-rose-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="font-bold">PDF Document (Batch)</span>
                  <span className="text-[10px] text-rose-400 font-mono">.pdf</span>
                </button>

                {/* CSV Variants */}
                <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-900">
                  Spreadsheet &amp; CSV Formats
                </div>
                <button
                  onClick={() => handleBatchExport("csv-bom")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">Excel UTF-8 CSV (BOM)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">.csv</span>
                </button>
                <button
                  onClick={() => handleBatchExport("csv-rfc4180")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>RFC 4180 Strict CSV</span>
                  <span className="text-[10px] text-slate-500 font-mono">.csv</span>
                </button>
                <button
                  onClick={() => handleBatchExport("csv-semicolon")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Semicolon Delimited (EU)</span>
                  <span className="text-[10px] text-slate-500 font-mono">.csv</span>
                </button>
                <button
                  onClick={() => handleBatchExport("tsv")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Tab-Separated (TSV)</span>
                  <span className="text-[10px] text-slate-500 font-mono">.tsv</span>
                </button>
                <button
                  onClick={() => handleBatchExport("xls")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-950/40 text-emerald-300 flex items-center justify-between transition-colors"
                >
                  <span className="font-bold">Microsoft Excel (.xls)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">XML</span>
                </button>

                {/* Structured JSON & JSON5 */}
                <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-900">
                  Structured Serialization
                </div>
                <button
                  onClick={() => handleBatchExport("json")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">Standard JSON</span>
                  <span className="text-[10px] text-indigo-400 font-mono">.json</span>
                </button>
                <button
                  onClick={() => handleBatchExport("json5")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-amber-300 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold">JSON5 Format</span>
                  <span className="text-[10px] text-amber-400 font-mono">.json5</span>
                </button>

                {/* Library Systems */}
                <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-900">
                  Library System Records
                </div>
                <button
                  onClick={() => handleBatchExport("marc")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Batch MARC21 / MARCXML</span>
                  <span className="text-[10px] text-indigo-400 font-mono">.xml</span>
                </button>
                <button
                  onClick={() => handleBatchExport("bibtex")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Batch BibTeX Bibliography</span>
                  <span className="text-[10px] text-indigo-400 font-mono">.bib</span>
                </button>
                <button
                  onClick={() => handleBatchExport("ris")}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span>Batch RIS (Zotero/EndNote)</span>
                  <span className="text-[10px] text-indigo-400 font-mono">.ris</span>
                </button>
              </div>
            )}
          </div>

          {onOpenCustomModal && (
            <button
              onClick={onOpenCustomModal}
              className="px-3 py-2 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Add custom record or batch import via JSON5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.btnAddCustomRecord}</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear scan history?")) onClearHistory();
              }}
              className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800"
              title="Clear all history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder={t.batchSearchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterLang("all")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterLang === "all" ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.batchFilterAll} ({history.length})
          </button>
          <button
            onClick={() => setFilterLang("ja")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterLang === "ja" ? "bg-rose-950 text-rose-300 font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.batchFilterJa}
          </button>
          <button
            onClick={() => setFilterLang("ar")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterLang === "ar" ? "bg-emerald-950 text-emerald-300 font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.batchFilterAr}
          </button>
          <button
            onClick={() => setFilterLang("western")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterLang === "western" ? "bg-indigo-950 text-indigo-300 font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.batchFilterWestern}
          </button>
        </div>
      </div>

      {/* Selection Action Bar if items exist */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-2 py-1.5 mb-2 text-xs text-slate-400">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            {selectedBookIds.size === filtered.length ? (
              <CheckSquare className="w-4 h-4 text-indigo-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>
              {selectedBookIds.size === filtered.length
                ? "Deselect All"
                : `Select All (${filtered.length})`}
            </span>
          </button>
          <span className="text-[11px] text-slate-500">
            Click row to inspect record • Use checkbox to export selected batch
          </span>
        </div>
      )}

      {/* List of scanned books */}
      {filtered.length === 0 ? (
        <div className="text-center p-8 bg-slate-950 rounded-xl border border-slate-800/60 text-slate-500 text-xs">
          {history.length === 0
            ? "No books scanned yet. Scan barcodes with your camera, snap photos for exact OCR, or use benchmark presets above."
            : "No books match your search filter."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((item) => {
            const isJapanese =
              item.language === "ja" || Boolean(item.identifiers.japaneseIsbn4);
            const isArabic =
              item.language === "ar" ||
              Boolean(item.identifiers.aucId) ||
              Boolean(item.identifiers.kfnlId);
            const isbn = item.identifiers.isbn13 || item.identifiers.isbn10 || "";
            const isSelected = selectedBookIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onSelectBook(item)}
                className={`p-3.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                  isSelected
                    ? "border-indigo-500/80 bg-indigo-950/20"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Select Checkbox */}
                  <button
                    onClick={(e) => toggleSelectBook(item.id, e)}
                    className="p-1 hover:text-indigo-400 text-slate-500 transition-colors shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Thumbnail */}
                  <div className="w-10 h-14 bg-slate-900 rounded overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate group-hover:text-indigo-300 transition-colors">
                        {item.title}
                      </span>
                      {isJapanese && (
                        <span className="text-[10px] bg-rose-950/60 text-rose-300 px-1.5 py-0.2 rounded border border-rose-900/50 shrink-0 font-medium">
                          🇯🇵 Japanese
                        </span>
                      )}
                      {isArabic && (
                        <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-900/50 shrink-0 font-medium">
                          🇪🇬/🇸🇦 Arab Catalog
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.authors.map((a) => a.name).join(", ")} •{" "}
                      {item.publisher} ({item.publishedDate})
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatIsbnHyphens(isbn)}
                      </span>
                      {item.identifiers.cCode && (
                        <span className="text-[10px] font-mono text-amber-400">
                          [{item.identifiers.cCode}]
                        </span>
                      )}
                      {item.identifiers.aucId && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          [AUC: {item.identifiers.aucId}]
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
