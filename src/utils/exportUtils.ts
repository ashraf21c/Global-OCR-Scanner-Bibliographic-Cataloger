import { BookRecord } from "../types/book";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export type CsvFormatOption = "utf8-bom" | "rfc4180" | "semicolon" | "tsv";

export type ExportFormat =
  | "csv-bom"
  | "csv-rfc4180"
  | "csv-semicolon"
  | "tsv"
  | "xls"
  | "json"
  | "json5"
  | "html"
  | "pdf"
  | "marc"
  | "bibtex"
  | "ris";

/**
 * Generate MARC21 XML representation of a book record
 */
export function generateMarcXml(book: BookRecord): string {
  const isbn = book.identifiers.isbn13 || book.identifiers.isbn10 || "";
  const authorName = book.authors[0]?.name || "Unknown Author";
  const year = book.publishedDate ? book.publishedDate.slice(0, 4) : "2024";

  return `<?xml version="1.0" encoding="UTF-8"?>
<record xmlns="http://www.loc.gov/MARC21/slim">
  <leader>00000cam a2200000Ia 4500</leader>
  <controlfield tag="001">${book.identifiers.oclc || book.identifiers.aucId || book.id}</controlfield>
  <controlfield tag="008">${year.padStart(4, "2")}01s${year}    xx            000 0 eng d</controlfield>
  ${isbn ? `<datafield tag="020" ind1=" " ind2=" "><subfield code="a">${isbn}</subfield></datafield>` : ""}
  ${book.identifiers.lccn ? `<datafield tag="010" ind1=" " ind2=" "><subfield code="a">${book.identifiers.lccn}</subfield></datafield>` : ""}
  ${book.classifications.dewey ? `<datafield tag="082" ind1="0" ind2="4"><subfield code="a">${book.classifications.dewey}</subfield></datafield>` : ""}
  ${book.classifications.arabicDewey ? `<datafield tag="084" ind1=" " ind2=" "><subfield code="a">${book.classifications.arabicDewey}</subfield><subfield code="2">arabic-dewey-10</subfield></datafield>` : ""}
  ${book.classifications.lcc ? `<datafield tag="050" ind1="0" ind2="0"><subfield code="a">${book.classifications.lcc}</subfield></datafield>` : ""}
  <datafield tag="100" ind1="1" ind2=" ">
    <subfield code="a">${escapeXml(authorName)}</subfield>
    ${book.authors[0]?.viafId ? `<subfield code="1">http://viaf.org/viaf/${book.authors[0].viafId}</subfield>` : ""}
  </datafield>
  <datafield tag="245" ind1="1" ind2="0">
    <subfield code="a">${escapeXml(book.title)}</subfield>
    ${book.subtitle ? `<subfield code="b">${escapeXml(book.subtitle)}</subfield>` : ""}
  </datafield>
  <datafield tag="260" ind1=" " ind2=" ">
    <subfield code="b">${escapeXml(book.publisher)}</subfield>
    <subfield code="c">${escapeXml(book.publishedDate)}</subfield>
  </datafield>
  ${book.physical.pageCount ? `<datafield tag="300" ind1=" " ind2=" "><subfield code="a">${book.physical.pageCount} p.</subfield></datafield>` : ""}
  ${book.identifiers.cCode ? `<datafield tag="590" ind1=" " ind2=" "><subfield code="a">Japanese C-Code: ${book.identifiers.cCode}</subfield></datafield>` : ""}
  ${book.identifiers.aucId ? `<datafield tag="590" ind1=" " ind2=" "><subfield code="a">Arabic Union Catalog AUC-ID: ${book.identifiers.aucId}</subfield></datafield>` : ""}
</record>`;
}

/**
 * Generate BibTeX citation entry
 */
export function generateBibtex(book: BookRecord): string {
  const author = book.authors.map((a) => a.name).join(" and ") || "Unknown";
  const key = (book.authors[0]?.transliteratedName || book.authors[0]?.name || "Book")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase() + (book.publishedDate ? book.publishedDate.slice(0, 4) : "2024");
  const year = book.publishedDate ? book.publishedDate.slice(0, 4) : "";
  const isbn = book.identifiers.isbn13 || book.identifiers.isbn10 || "";

  return `@book{${key},
  author    = {${author}},
  title     = {${book.title}${book.subtitle ? ": " + book.subtitle : ""}},
  publisher = {${book.publisher}},
  year      = {${year}},
  isbn      = {${isbn}},
  pages     = {${book.physical.pageCount || ""}},
  note      = {${[
    book.identifiers.cCode ? "C-Code: " + book.identifiers.cCode : "",
    book.identifiers.aucId ? "AUC: " + book.identifiers.aucId : "",
  ].filter(Boolean).join(", ")}}
}`;
}

/**
 * Generate RIS (Research Information Systems) format for Zotero / EndNote
 */
export function generateRis(book: BookRecord): string {
  const year = book.publishedDate ? book.publishedDate.slice(0, 4) : "";
  const lines: string[] = [
    "TY  - BOOK",
    `TI  - ${book.title}${book.subtitle ? ": " + book.subtitle : ""}`,
  ];

  book.authors.forEach((a) => {
    lines.push(`AU  - ${a.name}`);
  });

  if (book.publisher) lines.push(`PB  - ${book.publisher}`);
  if (year) lines.push(`PY  - ${year}`);
  if (book.identifiers.isbn13) lines.push(`SN  - ${book.identifiers.isbn13}`);
  if (book.identifiers.isbn10 && !book.identifiers.isbn13) lines.push(`SN  - ${book.identifiers.isbn10}`);
  if (book.physical.pageCount) lines.push(`SP  - ${book.physical.pageCount}`);
  if (book.description) lines.push(`AB  - ${book.description.replace(/\n+/g, " ")}`);
  if (book.identifiers.cCode) lines.push(`M1  - Japanese C-Code: ${book.identifiers.cCode}`);
  if (book.identifiers.aucId) lines.push(`M2  - Arabic Union Catalog: ${book.identifiers.aucId}`);

  lines.push("ER  - ");
  return lines.join("\n");
}

/**
 * Generate CSV with multiple formatting styles for wide compatibility:
 * - 'utf8-bom': Standard UTF-8 with Byte Order Mark for Microsoft Excel compatibility with Arabic & Japanese
 * - 'rfc4180': Strict RFC 4180 format with CRLF line breaks
 * - 'semicolon': European / Latin format with ';' delimiter
 * - 'tsv': Tab-Separated Values ('\t')
 */
export function generateCsv(books: BookRecord[], format: CsvFormatOption = "utf8-bom"): string {
  const delimiter =
    format === "semicolon" ? ";" : format === "tsv" ? "\t" : ",";
  const lineEnding = format === "rfc4180" ? "\r\n" : "\n";

  const headers = [
    "Title",
    "Romaji / Transliterated Title",
    "Author(s)",
    "Publisher",
    "Publication Date",
    "Language",
    "ISBN-13",
    "ISBN-10",
    "Japanese ISBN4",
    "Japanese C-Code",
    "Arabic Union Catalog (AUC)",
    "King Fahd Nat Library (KFNL)",
    "Dar El Kotob (Egypt)",
    "Neelwafurat ID",
    "Abjad ID",
    "Hindawi ID",
    "LCCN",
    "OCLC",
    "Pages",
    "NDC Classification",
    "Dewey",
    "Arabic Dewey 10 (ديوي العربي)",
    "LCC",
    "Format",
    "Price",
    "Shelf Location",
  ];

  const escapeField = (val: any) => {
    if (val === undefined || val === null) return "";
    let s = String(val).trim();
    // Replace double quotes with escaped double quotes
    if (s.includes('"') || s.includes(delimiter) || s.includes("\n") || s.includes("\r")) {
      s = `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = books.map((b) => [
    escapeField(b.title),
    escapeField(b.titleRomajiOrTranslated || ""),
    escapeField(b.authors.map((a) => a.name).join("; ")),
    escapeField(b.publisher),
    escapeField(b.publishedDate),
    escapeField(b.language),
    escapeField(b.identifiers.isbn13 || ""),
    escapeField(b.identifiers.isbn10 || ""),
    escapeField(b.identifiers.japaneseIsbn4 || ""),
    escapeField(b.identifiers.cCode || ""),
    escapeField(b.identifiers.aucId || ""),
    escapeField(b.identifiers.kfnlId || ""),
    escapeField(b.identifiers.darElKotobId || ""),
    escapeField(b.identifiers.nwfId || ""),
    escapeField(b.identifiers.abjadId || ""),
    escapeField(b.identifiers.hindawiId || ""),
    escapeField(b.identifiers.lccn || ""),
    escapeField(b.identifiers.oclc || ""),
    escapeField(b.physical.pageCount || ""),
    escapeField(b.classifications.ndc || ""),
    escapeField(b.classifications.dewey || ""),
    escapeField(b.classifications.arabicDewey || ""),
    escapeField(b.classifications.lcc || ""),
    escapeField(b.physical.format || ""),
    escapeField(b.physical.price || ""),
    escapeField(b.shelfLocation || ""),
  ]);

  let output = [
    headers.map(escapeField).join(delimiter),
    ...rows.map((r) => r.join(delimiter)),
  ].join(lineEnding);

  // Prepend UTF-8 BOM (\uFEFF) if requested, to force Excel to render Arabic and Japanese accurately
  if (format === "utf8-bom") {
    output = "\uFEFF" + output;
  }

  return output;
}

/**
 * Generate native Excel Workbook (SpreadsheetML XML format with .xls extension)
 * Completely compliant with Microsoft Excel, LibreOffice Calc, and Google Sheets without external binary dependencies.
 */
export function generateXls(books: BookRecord[]): string {
  const headers = [
    "Title",
    "Transliterated / English Title",
    "Authors",
    "Publisher",
    "Year",
    "Language",
    "ISBN-13",
    "ISBN-10",
    "Japanese ISBN4",
    "C-Code",
    "AUC (Arabic Union Catalog)",
    "KFNL (Saudi)",
    "Dar El Kotob (Egypt)",
    "Neelwafurat ID",
    "Abjad ID",
    "Hindawi ID",
    "LCCN",
    "OCLC",
    "Pages",
    "NDC",
    "Dewey",
    "Arabic Dewey 10",
    "LCC",
    "Format",
    "Price",
  ];

  const escapeXmlCell = (str: any) => {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const xmlRows = books.map((b) => {
    const cells = [
      b.title,
      b.titleRomajiOrTranslated || "",
      b.authors.map((a) => a.name).join("; "),
      b.publisher,
      b.publishedDate,
      b.language,
      b.identifiers.isbn13 || "",
      b.identifiers.isbn10 || "",
      b.identifiers.japaneseIsbn4 || "",
      b.identifiers.cCode || "",
      b.identifiers.aucId || "",
      b.identifiers.kfnlId || "",
      b.identifiers.darElKotobId || "",
      b.identifiers.nwfId || "",
      b.identifiers.abjadId || "",
      b.identifiers.hindawiId || "",
      b.identifiers.lccn || "",
      b.identifiers.oclc || "",
      b.physical.pageCount || "",
      b.classifications.ndc || "",
      b.classifications.dewey || "",
      b.classifications.arabicDewey || "",
      b.classifications.lcc || "",
      b.physical.format || "",
      b.physical.price || "",
    ];

    return `      <Row>
${cells
  .map(
    (c) =>
      `        <Cell><Data ss:Type="${typeof c === "number" ? "Number" : "String"}">${escapeXmlCell(c)}</Data></Cell>`
  )
  .join("\n")}
      </Row>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4338CA"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Bibliographic Records">
  <Table>
   <Column ss:AutoFitWidth="0" ss:Width="200"/>
   <Column ss:AutoFitWidth="0" ss:Width="160"/>
   <Column ss:AutoFitWidth="0" ss:Width="140"/>
   <Column ss:AutoFitWidth="0" ss:Width="120"/>
   <Column ss:AutoFitWidth="0" ss:Width="80"/>
   <Row ss:StyleID="Header">
${headers.map((h) => `    <Cell><Data ss:Type="String">${escapeXmlCell(h)}</Data></Cell>`).join("\n")}
   </Row>
${xmlRows.join("\n")}
  </Table>
 </Worksheet>
</Workbook>`;
}

/**
 * Generate Standard JSON
 */
export function generateJson(books: BookRecord[] | BookRecord): string {
  return JSON.stringify(books, null, 2);
}

/**
 * Generate JSON5 format (unquoted keys, single quotes, trailing commas, comments)
 */
export function generateJson5(books: BookRecord[] | BookRecord): string {
  const commentHeader = `// =======================================================
// Bibliographic Records Export - JSON5 Format
// Features: Unquoted identifiers, single-quoted strings, trailing commas
// Compatible with modern JavaScript/TypeScript configurations
// Generated: ${new Date().toISOString()}
// =======================================================\n`;

  function stringifyJson5(obj: any, indent = 0): string {
    const spaces = " ".repeat(indent);
    const innerSpaces = " ".repeat(indent + 2);

    if (obj === null) return "null";
    if (typeof obj === "undefined") return "undefined";
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    if (typeof obj === "string") {
      // Escape single quotes and backslashes
      const escaped = obj.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      return `'${escaped}'`;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      const items = obj
        .map((item) => `${innerSpaces}${stringifyJson5(item, indent + 2)},`)
        .join("\n");
      return `[\n${items}\n${spaces}]`;
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) return "{}";
      const pairs = keys
        .map((key) => {
          // Check if key is a valid unquoted JS identifier
          const isValidIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
          const formattedKey = isValidIdentifier ? key : `'${key}'`;
          return `${innerSpaces}${formattedKey}: ${stringifyJson5(obj[key], indent + 2)},`;
        })
        .join("\n");
      return `{\n${pairs}\n${spaces}}`;
    }

    return String(obj);
  }

  return commentHeader + stringifyJson5(books);
}

/**
 * Fallback citation formatters if not provided by server
 */
export function formatCitations(book: BookRecord) {
  const author = book.authors[0]?.name || "Unknown Author";
  const authorTranslit = book.authors[0]?.transliteratedName || author;
  const year = book.publishedDate ? book.publishedDate.slice(0, 4) : "n.d.";
  const title = book.title + (book.subtitle ? `: ${book.subtitle}` : "");
  const pub = book.publisher || "Publisher";

  return {
    apa: `${author}. (${year}). ${title}. ${pub}.`,
    mla: `${author}. ${title}. ${pub}, ${year}.`,
    chicagoNotes: `${author}, ${title} (${pub}, ${year}).`,
    chicagoAuthorDate: `${author}. ${year}. ${title}. ${pub}.`,
    harvard: `${author} (${year}) ${title}. ${pub}.`,
    ieee: `[1] ${authorTranslit}, ${title}. ${pub}, ${year}.`,
    sist02: `${author}. ${title}. ${pub}, ${year}, ${book.physical.pageCount || 0}p.`,
    arabicStandard: `${author}. (${year}). ${title}. ${pub}.`,
  };
}

/**
 * Download text content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate Standalone HTML Document with dir="auto" and rtl="auto" support
 * Fully styled for both digital reading and high-resolution printing
 */
export function generateHtml(books: BookRecord[]): string {
  const isSingle = books.length === 1;
  const pageTitle = isSingle ? books[0].title : `Bibliographic Catalog Export (${books.length} records)`;

  const cardsHtml = books
    .map((book, idx) => {
      const isbn13 = book.identifiers.isbn13 || "";
      const isbn10 = book.identifiers.isbn10 || "";
      const isbn4 = book.identifiers.japaneseIsbn4 || "";
      const cCode = book.identifiers.cCode || "";
      const aucId = book.identifiers.aucId || "";
      const kfnlId = book.identifiers.kfnlId || "";
      const darElKotobId = book.identifiers.darElKotobId || "";
      const lccn = book.identifiers.lccn || "";
      const oclc = book.identifiers.oclc || "";

      const ndc = book.classifications.ndc || "";
      const dewey = book.classifications.dewey || "";
      const arabicDewey = book.classifications.arabicDewey || "";
      const arabicDeweyName = book.classifications.arabicDeweyName || "";
      const lcc = book.classifications.lcc || "";
      const basis = book.classifications.classificationBasis || "title_only";

      const noteEn = book.classifications.classificationNote?.en || (basis === "title_only" ? "This is calculated using the title only" : "Calculated classification");
      const noteAr = book.classifications.classificationNote?.ar || (basis === "title_only" ? "تم الحساب بناءً على العنوان فقط" : "تصنيف محسوب");
      const noteJa = book.classifications.classificationNote?.ja || (basis === "title_only" ? "タイトル情報のみから算出されました" : "算出された分類");

      const isTitleOnly = basis === "title_only";

      const citations = {
        ...formatCitations(book),
        ...(book.citations || {}),
      };

      return `
    <article class="book-card" dir="auto" rtl="auto">
      <div class="card-header">
        <div class="title-meta">
          <div class="record-number no-print">#${idx + 1} of ${books.length}</div>
          <h2 class="book-title" dir="auto" rtl="auto">${escapeXml(book.title)}</h2>
          ${book.titleRomajiOrTranslated ? `<div class="book-romaji" dir="auto">${escapeXml(book.titleRomajiOrTranslated)}</div>` : ""}
          ${book.subtitle ? `<div class="book-subtitle" dir="auto">${escapeXml(book.subtitle)}</div>` : ""}
          <div class="book-authors" dir="auto">
            <strong>Authors:</strong> ${escapeXml(book.authors.map((a) => a.name + (a.transliteratedName ? ` (${a.transliteratedName})` : "")).join("; "))}
          </div>
          <div class="book-pub" dir="auto">
            <span><strong>Publisher:</strong> ${escapeXml(book.publisher)}</span> &bull; 
            <span><strong>Date:</strong> ${escapeXml(book.publishedDate)}</span> &bull; 
            <span><strong>Language:</strong> ${escapeXml(book.language)}</span>
            ${book.physical.pageCount ? ` &bull; <span><strong>Pages:</strong> ${book.physical.pageCount} p.</span>` : ""}
          </div>
        </div>
        ${book.coverImageUrl ? `<div class="cover-wrapper"><img src="${escapeXml(book.coverImageUrl)}" alt="Cover" class="cover-img" /></div>` : ""}
      </div>

      ${book.description ? `
      <div class="book-description" dir="auto" rtl="auto">
        <strong>Abstract / Summary:</strong>
        <p>${escapeXml(book.description)}</p>
      </div>` : ""}

      <!-- Identifiers Table -->
      <div class="table-container">
        <h3>Bibliographic Identifiers</h3>
        <table class="data-table">
          <tbody>
            ${isbn13 ? `<tr><th>ISBN-13</th><td class="font-mono">${escapeXml(isbn13)}</td></tr>` : ""}
            ${isbn10 ? `<tr><th>ISBN-10</th><td class="font-mono">${escapeXml(isbn10)}</td></tr>` : ""}
            ${isbn4 ? `<tr><th>Japanese ISBN4</th><td class="font-mono">${escapeXml(isbn4)}</td></tr>` : ""}
            ${cCode ? `<tr><th>Japanese C-Code</th><td class="font-mono">${escapeXml(cCode)}</td></tr>` : ""}
            ${aucId ? `<tr><th>Arabic Union Catalog (AUC-ID)</th><td class="font-mono">${escapeXml(aucId)}</td></tr>` : ""}
            ${kfnlId ? `<tr><th>King Fahd Nat Library (KFNL)</th><td class="font-mono">${escapeXml(kfnlId)}</td></tr>` : ""}
            ${darElKotobId ? `<tr><th>Dar El Kotob (Egypt)</th><td class="font-mono">${escapeXml(darElKotobId)}</td></tr>` : ""}
            ${lccn ? `<tr><th>Library of Congress (LCCN)</th><td class="font-mono">${escapeXml(lccn)}</td></tr>` : ""}
            ${oclc ? `<tr><th>WorldCat (OCLC)</th><td class="font-mono">${escapeXml(oclc)}</td></tr>` : ""}
          </tbody>
        </table>
      </div>

      <!-- Classifications & Arabic Dewey 10 -->
      <div class="table-container">
        <h3>Library Classifications &amp; Arabic Dewey 10</h3>
        <table class="data-table">
          <tbody>
            ${ndc ? `<tr><th>Nippon Decimal (NDC)</th><td class="font-mono"><strong>${escapeXml(ndc)}</strong> (Standard Japanese Library Scheme)</td></tr>` : ""}
            ${dewey ? `<tr><th>Standard Dewey (DDC)</th><td class="font-mono"><strong>${escapeXml(dewey)}</strong></td></tr>` : ""}
            ${arabicDewey ? `<tr>
              <th style="color: #065f46; background: #f0fdf4;">Arabic Dewey 10 (ديوي العربي - ألكسو)</th>
              <td class="font-mono" style="background: #f0fdf4;" dir="auto" rtl="auto">
                <span style="font-weight: bold; font-size: 15px; color: #047857;">${escapeXml(arabicDewey)}</span> 
                ${arabicDeweyName ? `&mdash; <span style="font-weight: 600; color: #065f46;">${escapeXml(arabicDeweyName)}</span>` : ""}
              </td>
            </tr>` : ""}
            ${lcc ? `<tr><th>Library of Congress (LCC)</th><td class="font-mono"><strong>${escapeXml(lcc)}</strong></td></tr>` : ""}
            <tr>
              <th>Classification Basis</th>
              <td>
                <span class="badge ${isTitleOnly ? 'badge-warning' : 'badge-verified'}">
                  ${isTitleOnly ? '⚠️ Title Only (Fallback)' : '✓ Verified Source: ' + basis.toUpperCase()}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Translated UI Note Box -->
        <div class="note-box ${isTitleOnly ? 'note-warning' : 'note-info'}" dir="auto" rtl="auto">
          <div class="note-title">
            ${isTitleOnly ? '⚠️ Notice: Classification Calculation Basis' : 'ℹ️ Classification Derivation Metadata'}
          </div>
          <div class="note-langs">
            <div class="note-row" dir="ltr"><strong>EN:</strong> ${escapeXml(noteEn)}</div>
            <div class="note-row" dir="rtl"><strong>العربية:</strong> ${escapeXml(noteAr)}</div>
            <div class="note-row" dir="ltr"><strong>日本語:</strong> ${escapeXml(noteJa)}</div>
          </div>
        </div>
      </div>

      <!-- Citations -->
      <div class="table-container">
        <h3>Formatted Citations</h3>
        <div class="citation-block"><strong>APA (7th ed.):</strong> ${escapeXml(citations.apa || "")}</div>
        <div class="citation-block"><strong>MLA (9th ed.):</strong> ${escapeXml(citations.mla || "")}</div>
        <div class="citation-block"><strong>🇯🇵 SIST 02 (Japan):</strong> ${escapeXml(citations.sist02 || "")}</div>
        <div class="citation-block" dir="rtl"><strong>🇪🇬/🇱🇧 المعيار العربي للتوثيق:</strong> ${escapeXml(citations.arabicStandard || "")}</div>
      </div>
    </article>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="auto" dir="auto" rtl="auto">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeXml(pageTitle)}</title>
  <style>
    :root {
      --primary: #4338ca;
      --primary-light: #e0e7ff;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --warning-bg: #fffbeb;
      --warning-border: #fcd34d;
      --warning-text: #92400e;
      --verified-bg: #ecfdf5;
      --verified-border: #a7f3d0;
      --verified-text: #065f46;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Arabic", "Hiragino Kaku Gothic ProN", "Meiryo", Arial, sans-serif;
      margin: 0;
      padding: 32px 16px;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      direction: auto;
      unicode-bidi: plaintext;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .top-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border);
      flex-wrap: wrap;
      gap: 12px;
    }
    .top-title {
      font-size: 20px;
      font-weight: 800;
      color: #1e1b4b;
      margin: 0;
    }
    .top-meta {
      font-size: 12px;
      color: var(--text-muted);
    }
    .print-btn {
      background-color: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    }
    .print-btn:hover {
      background-color: #3730a3;
    }
    .book-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 28px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    [dir="auto"], [rtl="auto"] {
      unicode-bidi: plaintext;
      text-align: start;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 20px;
    }
    .title-meta {
      flex: 1;
      min-width: 0;
    }
    .record-number {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary);
      margin-bottom: 4px;
    }
    .book-title {
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 6px 0;
      line-height: 1.3;
      color: #0f172a;
    }
    .book-romaji {
      font-size: 14px;
      font-style: italic;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .book-subtitle {
      font-size: 14px;
      color: #334155;
      margin-bottom: 8px;
    }
    .book-authors {
      font-size: 14px;
      color: #1e293b;
      margin-bottom: 6px;
    }
    .book-pub {
      font-size: 12.5px;
      color: var(--text-muted);
    }
    .cover-wrapper {
      width: 100px;
      height: 145px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
      flex-shrink: 0;
      background: #f1f5f9;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .book-description {
      background: #f8fafc;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 20px;
      font-size: 13px;
      color: #334155;
      border: 1px solid var(--border);
    }
    .book-description p {
      margin: 6px 0 0 0;
      line-height: 1.6;
    }
    .table-container {
      margin-bottom: 20px;
    }
    .table-container h3 {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      margin: 0 0 8px 0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    .data-table th, .data-table td {
      border: 1px solid var(--border);
      padding: 7px 12px;
      text-align: start;
    }
    .data-table th {
      background: #f8fafc;
      font-weight: 600;
      color: #334155;
      width: 35%;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    .badge-verified {
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .note-box {
      border-radius: 10px;
      padding: 12px 16px;
      margin-top: 10px;
      font-size: 12px;
    }
    .note-warning {
      background-color: var(--warning-bg);
      border: 1px solid var(--warning-border);
      color: var(--warning-text);
    }
    .note-info {
      background-color: var(--verified-bg);
      border: 1px solid var(--verified-border);
      color: var(--verified-text);
    }
    .note-title {
      font-weight: 700;
      margin-bottom: 6px;
    }
    .note-langs {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .note-row {
      line-height: 1.4;
    }
    .citation-block {
      background: #f8fafc;
      border-left: 3px solid var(--primary);
      padding: 8px 12px;
      font-size: 12px;
      margin-bottom: 6px;
      font-family: Georgia, Cambria, "Times New Roman", serif;
      color: #1e293b;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .container {
        max-width: 100% !important;
      }
      .no-print {
        display: none !important;
      }
      .book-card {
        border: 1px solid #cbd5e1 !important;
        box-shadow: none !important;
        margin-bottom: 30px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body dir="auto" rtl="auto">
  <div class="container" dir="auto" rtl="auto">
    <header class="top-toolbar">
      <div>
        <h1 class="top-title">${escapeXml(pageTitle)}</h1>
        <div class="top-meta">Exported on ${new Date().toLocaleDateString()} &bull; Total records: ${books.length}</div>
      </div>
      <button onclick="window.print()" class="print-btn no-print">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save to PDF
      </button>
    </header>

    <main dir="auto" rtl="auto">
      ${cardsHtml}
    </main>
  </div>
</body>
</html>`;
}

/**
 * Generate PDF Document using jsPDF and html2canvas with full Arabic, Japanese, and Latin Unicode support
 */
export async function generatePdf(books: BookRecord[], filenameBase: string = "catalog_export"): Promise<void> {
  if (typeof document === "undefined") return;

  const htmlContent = generateHtml(books);

  // Create an isolated container for rendering
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "820px";
  iframe.style.height = "1100px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  try {
    const docFrame = iframe.contentWindow?.document;
    if (!docFrame) throw new Error("Could not access iframe document");

    docFrame.open();
    docFrame.write(htmlContent);
    docFrame.close();

    // Wait for images and web fonts
    await new Promise((resolve) => setTimeout(resolve, 500));

    const targetElement = docFrame.body;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    await pdf.html(targetElement, {
      html2canvas: {
        scale: 0.68,
        useCORS: true,
        logging: false,
      },
      callback: (doc) => {
        doc.save(`${filenameBase}.pdf`);
      },
      x: 18,
      y: 18,
      width: 559,
      windowWidth: 820,
    });
  } catch (err) {
    console.warn("Direct PDF render failed, opening print dialogue:", err);
    // Reliable fallback: Open printable document
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        win.focus();
        win.print();
      };
    }
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Universal exporter for single or batch records
 */
export function exportBookData(
  books: BookRecord[],
  format: ExportFormat,
  filenameBase: string = "catalog_export"
) {
  const isSingle = books.length === 1;
  const singleBook = books[0];

  switch (format) {
    case "html": {
      const html = generateHtml(books);
      downloadFile(html, `${filenameBase}.html`, "text/html;charset=utf-8;");
      break;
    }
    case "pdf": {
      generatePdf(books, filenameBase);
      break;
    }
    case "csv-bom": {
      const csv = generateCsv(books, "utf8-bom");
      downloadFile(csv, `${filenameBase}_excel_utf8.csv`, "text/csv;charset=utf-8;");
      break;
    }
    case "csv-rfc4180": {
      const csv = generateCsv(books, "rfc4180");
      downloadFile(csv, `${filenameBase}_rfc4180.csv`, "text/csv;charset=utf-8;");
      break;
    }
    case "csv-semicolon": {
      const csv = generateCsv(books, "semicolon");
      downloadFile(csv, `${filenameBase}_semicolon.csv`, "text/csv;charset=utf-8;");
      break;
    }
    case "tsv": {
      const tsv = generateCsv(books, "tsv");
      downloadFile(tsv, `${filenameBase}.tsv`, "text/tab-separated-values;charset=utf-8;");
      break;
    }
    case "xls": {
      const xls = generateXls(books);
      downloadFile(xls, `${filenameBase}.xls`, "application/vnd.ms-excel;charset=utf-8;");
      break;
    }
    case "json": {
      const json = generateJson(isSingle ? singleBook : books);
      downloadFile(json, `${filenameBase}.json`, "application/json");
      break;
    }
    case "json5": {
      const json5 = generateJson5(isSingle ? singleBook : books);
      downloadFile(json5, `${filenameBase}.json5`, "text/plain;charset=utf-8;");
      break;
    }
    case "marc": {
      const records = books.map((b) => generateMarcXml(b)).join("\n");
      const collection = `<?xml version="1.0" encoding="UTF-8"?>\n<collection xmlns="http://www.loc.gov/MARC21/slim">\n${records}\n</collection>`;
      downloadFile(collection, `${filenameBase}_marc21.xml`, "application/xml");
      break;
    }
    case "bibtex": {
      const bib = books.map((b) => generateBibtex(b)).join("\n\n");
      downloadFile(bib, `${filenameBase}.bib`, "text/plain");
      break;
    }
    case "ris": {
      const ris = books.map((b) => generateRis(b)).join("\n");
      downloadFile(ris, `${filenameBase}.ris`, "application/x-research-info-systems");
      break;
    }
  }
}

/**
 * Download high-resolution cover image safely
 */
export async function downloadCoverImage(imageUrl: string, filename: string) {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".jpg") ? filename : `${filename}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    window.open(imageUrl, "_blank");
  }
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
