import React, { useEffect, useState, useRef } from "react";
import { BookRecord } from "../types/book";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  FileCode,
  FileText,
  Tag,
  BookOpen,
  Share2,
  ExternalLink,
  QrCode as QrIcon,
} from "lucide-react";
import QRCode from "qrcode";
import {
  generateMarcXml,
  generateBibtex,
  generateRis,
  generateCsv,
  generateJson,
  generateJson5,
  generateHtml,
  generatePdf,
  exportBookData,
  downloadFile,
  formatCitations,
} from "../utils/exportUtils";
import { formatIsbnHyphens } from "../utils/isbnUtils";
import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface LibrarianCitationToolsProps {
  book: BookRecord;
  activeMode?: "citations" | "export" | "spine_label";
  onClose?: () => void;
  lang?: UiLanguage;
}

export const LibrarianCitationTools: React.FC<LibrarianCitationToolsProps> = ({
  book,
  activeMode = "citations",
  onClose,
  lang = "en",
}) => {
  const t = TRANSLATIONS[lang];
  const [mode, setMode] = useState<"citations" | "export" | "spine_label">(activeMode);
  const [selectedCitationFormat, setSelectedCitationFormat] = useState<string>("apa");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const citations = {
    ...formatCitations(book),
    ...(book.citations || {}),
  };

  const citationOptions = [
    { id: "apa", name: "APA 7th Edition", text: citations.apa },
    { id: "mla", name: "MLA 9th Edition", text: citations.mla },
    { id: "chicagoNotes", name: "Chicago 17th (Notes & Bib)", text: citations.chicagoNotes },
    { id: "chicagoAuthorDate", name: "Chicago 17th (Author-Date)", text: citations.chicagoAuthorDate },
    { id: "harvard", name: "Harvard System", text: citations.harvard },
    { id: "ieee", name: "IEEE Standard", text: citations.ieee },
    {
      id: "sist02",
      name:
        lang === "ja"
          ? "🇯🇵 科学技術情報流通技術基準 SIST 02"
          : lang === "ar"
          ? "🇯🇵 المعيار الياباني SIST 02"
          : "🇯🇵 SIST 02 (Japanese Standard)",
      text: citations.sist02,
    },
    {
      id: "arabicStandard",
      name:
        lang === "ja"
          ? "🇪🇬/🇸🇦 アラブ統一書誌引用基準"
          : lang === "ar"
          ? "🇪🇬/🇱🇧 المعيار العربي الموحد للتوثيق"
          : "🇪🇬/🇱🇧 Arabic Standard Citation",
      text: citations.arabicStandard,
    },
  ];

  // Generate QR code for spine label
  useEffect(() => {
    const primaryId = book.identifiers.isbn13 || book.identifiers.isbn10 || book.id;
    const targetUrl = `https://worldcat.org/isbn/${primaryId.replace(/[^0-9X]/gi, "")}`;
    QRCode.toDataURL(targetUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code error:", err));
  }, [book]);

  const copyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(id);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const [selectedCallScheme, setSelectedCallScheme] = useState<"arabic_dewey" | "standard_dewey" | "ndc" | "lcc">(
    book.language === "ar" || Boolean(book.classifications.arabicDewey) ? "arabic_dewey" : "standard_dewey"
  );

  const callNumber =
    selectedCallScheme === "arabic_dewey"
      ? book.classifications.arabicDewey || "813"
      : selectedCallScheme === "standard_dewey"
      ? book.classifications.dewey || "895.63"
      : selectedCallScheme === "ndc"
      ? book.classifications.ndc || "913.6"
      : book.classifications.lcc || "PL856";

  const schemeLabel =
    selectedCallScheme === "arabic_dewey"
      ? "Arabic Dewey 10"
      : selectedCallScheme === "standard_dewey"
      ? "Standard DDC"
      : selectedCallScheme === "ndc"
      ? "NDC (Japan)"
      : "LCC (Congress)";
  const authorCutter =
    (book.authors[0]?.transliteratedName || book.authors[0]?.name || "AUT")
      .slice(0, 3)
      .toUpperCase() + (book.publishedDate ? book.publishedDate.slice(2, 4) : "");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 mb-8">
      {/* Navigation sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t.librarianSuiteTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {t.librarianSuiteDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode("citations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === "citations"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.tabCitationList}
          </button>
          <button
            onClick={() => setMode("export")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === "export"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.tabExportFormats}
          </button>
          <button
            onClick={() => setMode("spine_label")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === "spine_label"
                ? "bg-amber-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.tabSpineSlip}
          </button>
        </div>
      </div>

      {/* 1. Citation Generator Mode */}
      {mode === "citations" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {citationOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedCitationFormat(opt.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedCitationFormat === opt.id
                    ? "bg-indigo-950/60 border-indigo-500 text-white shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span className="text-xs font-semibold block truncate">
                  {opt.name}
                </span>
              </button>
            ))}
          </div>

          {/* Active Citation Card */}
          {(() => {
            const current = citationOptions.find(
              (o) => o.id === selectedCitationFormat
            );
            if (!current) return null;
            return (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    {current.name} Format
                  </span>
                  <button
                    onClick={() =>
                      copyCitation(current.text || "", current.id)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-sm"
                  >
                    {copiedFormat === current.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Citation</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-sm font-serif text-slate-100 leading-relaxed select-all">
                  {current.text}
                </div>

                <span className="text-[11px] text-slate-400 italic">
                  Note: Formatted with complete author names, native titles, publication year, and publisher information.
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. Export Mode (Multi-Format CSV, XLS, JSON, JSON5, HTML, PDF, MARC21, BibTeX, RIS) */}
      {mode === "export" && (
        <div className="flex flex-col gap-6">
          {/* Section: HTML & PDF Document Exports */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              Document Formats (HTML dir="auto" &amp; PDF)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* HTML Export with rtl=auto / dir=auto */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">HTML Document (.html)</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800 font-mono">
                      dir="auto" / rtl="auto"
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Standalone HTML document with automatic bidirectional text layout (<code className="text-emerald-400">dir="auto"</code> / <code className="text-emerald-400">rtl="auto"</code>), embedded responsive typography, and print CSS.
                  </p>
                </div>
                <button
                  onClick={() =>
                    exportBookData([book], "html", `book_${book.id}`)
                  }
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download HTML (dir="auto")
                </button>
              </div>

              {/* PDF Export */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">PDF Document (.pdf)</span>
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded border border-rose-800 font-mono">
                      jsPDF / A4
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    High-resolution printable PDF with complete bibliographic classifications, Arabic Dewey 10, citations, and verified identifiers.
                  </p>
                </div>
                <button
                  onClick={() =>
                    exportBookData([book], "pdf", `book_${book.id}`)
                  }
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF Document
                </button>
              </div>
            </div>
          </div>

          {/* Section: Spreadsheets & Tabular Data */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Spreadsheet &amp; Delimited Tables (Wide Compatibility)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Excel UTF-8 BOM CSV */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Excel UTF-8 CSV (BOM)</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Includes UTF-8 BOM (\uFEFF) so Microsoft Excel opens Arabic &amp; Japanese text with perfect Unicode rendering.
                  </p>
                </div>
                <button
                  onClick={() =>
                    exportBookData([book], "csv-bom", `book_${book.id}`)
                  }
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Excel CSV
                </button>
              </div>

              {/* RFC 4180 CSV */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">RFC 4180 Strict CSV</span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                      RFC Standard
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Compliant with IETF RFC 4180 using CRLF line breaks and standard quote escaping for data pipelines.
                  </p>
                </div>
                <button
                  onClick={() =>
                    exportBookData([book], "csv-rfc4180", `book_${book.id}`)
                  }
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download RFC 4180
                </button>
              </div>

              {/* Semicolon Delimited CSV */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Semicolon Delimited (;)</span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                      EU / Regional
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Uses semicolon separator for European Excel versions where comma is reserved for decimals.
                  </p>
                </div>
                <button
                  onClick={() =>
                    exportBookData([book], "csv-semicolon", `book_${book.id}`)
                  }
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Semicolon CSV
                </button>
              </div>

              {/* TSV (Tab Separated) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">TSV (Tab-Separated)</span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                      .tsv
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tab-delimited table optimal for copy-pasting into spreadsheets or bulk database import commands.
                  </p>
                </div>
                <button
                  onClick={() =>
                    exportBookData([book], "tsv", `book_${book.id}`)
                  }
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download TSV
                </button>
              </div>

              {/* Native Microsoft Excel XLS */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Microsoft Excel (.xls)</span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800 font-mono">
                      SpreadsheetML
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Native Excel XML format with styled header rows, custom column widths, and verified Unicode preservation.
                  </p>
                </div>
                <button
                  onClick={() =>
                    exportBookData([book], "xls", `book_${book.id}`)
                  }
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Excel .XLS
                </button>
              </div>
            </div>
          </div>

          {/* Section: Structured Data (JSON & JSON5) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              Modern Developer Serialization (JSON &amp; JSON5)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Standard JSON */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Standard JSON (.json)</span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800 font-mono">
                      RFC 8259
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Formatted with 2-space indentation containing full identifiers, classifications, and citations.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      exportBookData([book], "json", `book_${book.id}`)
                    }
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSON
                  </button>
                  <button
                    onClick={() => {
                      const json = generateJson(book);
                      copyCitation(json, "json");
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
                  >
                    {copiedFormat === "json" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* JSON5 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">JSON5 Format (.json5)</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800 font-mono">
                      JSON5 Spec
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Human-readable serialization with unquoted keys, single-quoted strings, trailing commas, and header comments.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      exportBookData([book], "json5", `book_${book.id}`)
                    }
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download JSON5
                  </button>
                  <button
                    onClick={() => {
                      const json5 = generateJson5(book);
                      copyCitation(json5, "json5");
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
                  >
                    {copiedFormat === "json5" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Library Catalog Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Library Systems &amp; Bibliographic Formats
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* MARC21 XML */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">MARC21 / MARCXML</span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800 font-mono">
                      .xml
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Standard for Library Management Systems (ILS), Koha, Alma, and Arabic Union Catalog ingest.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const xml = generateMarcXml(book);
                      downloadFile(xml, `marc21_${book.id}.xml`, "application/xml");
                    }}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download MARC
                  </button>
                  <button
                    onClick={() => {
                      const xml = generateMarcXml(book);
                      copyCitation(xml, "marc");
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs"
                  >
                    {copiedFormat === "marc" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* BibTeX */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">BibTeX (.bib)</span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800 font-mono">
                      .bib
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Reference manager format for LaTeX, Overleaf, and scientific papers with C-Code annotation.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const bib = generateBibtex(book);
                      downloadFile(bib, `citation_${book.id}.bib`, "text/plain");
                    }}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download BibTeX
                  </button>
                  <button
                    onClick={() => {
                      const bib = generateBibtex(book);
                      copyCitation(bib, "bib");
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs"
                  >
                    {copiedFormat === "bib" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* RIS Format */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">RIS Format (.ris)</span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800 font-mono">
                      .ris
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Importable directly into Zotero, Thomson Reuters EndNote, and Mendeley.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const ris = generateRis(book);
                      downloadFile(ris, `reference_${book.id}.ris`, "application/x-research-info-systems");
                    }}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download RIS
                  </button>
                  <button
                    onClick={() => {
                      const ris = generateRis(book);
                      copyCitation(ris, "ris");
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs"
                  >
                    {copiedFormat === "ris" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Printable Spine Label & Catalog Slip */}
      {mode === "spine_label" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300">
                Standard 3&quot; &times; 1&quot; Library Spine Sticker &amp; Shelf Slip
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Formatted with Call Number, Cutter, Title, and dynamic QR Code for instant shelf cataloging.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print Spine Label
            </button>
          </div>

          {/* Scheme Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-300">
              Spine Call Number Standard:
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setSelectedCallScheme("arabic_dewey")}
                className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                  selectedCallScheme === "arabic_dewey"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇪🇬/🇸🇦 Arabic Dewey 10
              </button>
              <button
                onClick={() => setSelectedCallScheme("standard_dewey")}
                className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                  selectedCallScheme === "standard_dewey"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Standard DDC
              </button>
              <button
                onClick={() => setSelectedCallScheme("ndc")}
                className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                  selectedCallScheme === "ndc"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇯🇵 NDC
              </button>
              <button
                onClick={() => setSelectedCallScheme("lcc")}
                className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                  selectedCallScheme === "lcc"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🏛️ LCC
              </button>
            </div>
          </div>

          {/* Printable Preview Area */}
          <div className="flex justify-center p-6 bg-slate-950 rounded-xl border border-slate-800">
            <div
              id="printable-spine-label"
              className="w-80 bg-white text-black p-4 rounded-lg shadow-xl border-2 border-dashed border-slate-300 flex items-center justify-between gap-3 font-sans"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">
                    {schemeLabel}
                  </div>
                  <div className="font-mono text-base font-extrabold text-black leading-tight">
                    {callNumber}
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-800">
                    {authorCutter}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-black line-clamp-1">
                    {book.title}
                  </div>
                  <div className="text-[9px] font-mono text-slate-600">
                    {formatIsbnHyphens(book.identifiers.isbn13 || book.identifiers.isbn10 || "")}
                  </div>
                  {book.identifiers.cCode && (
                    <div className="text-[9px] font-mono font-bold text-slate-800">
                      C-Code: {book.identifiers.cCode}
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code */}
              {qrDataUrl && (
                <div className="flex flex-col items-center shrink-0">
                  <img
                    src={qrDataUrl}
                    alt="Spine QR"
                    className="w-20 h-20 object-contain"
                  />
                  <span className="text-[8px] font-mono text-slate-500 mt-0.5">
                    SCAN TO RECORD
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
