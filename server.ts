import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { DEFAULT_SRU_TARGETS } from "./src/utils/sruTargetsData.ts";
import { parseSruXmlResponse } from "./src/utils/sruParser.ts";
import { SruTarget } from "./src/types/sru.ts";
import { resolveFromLiveCatalogs, findKnownBibRecord } from "./src/utils/liveCatalogResolver.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// In-memory stats & rate limit tracking
const serverConfig = {
  rateLimitPerMinute: 30,
  googleCseApiKey: "",
  googleCseCx: "",
  amazonPaApiKey: "",
  amazonPaApiSecret: "",
  amazonAssociateTag: "",
  worldcatApiKey: "",
  cacheEnabled: true,
};

let requestMetrics = {
  totalLookups: 0,
  totalOcr: 0,
  totalCrawls: 0,
  cacheHits: 0,
  lastRequestTime: new Date().toISOString(),
};

// In-memory cache for book records
const bookCache = new Map<string, any>();

// Helper: Calculate ISBN-10 to ISBN-13 and vice-versa
function normalizeIsbn(input: string) {
  const clean = input.replace(/[^0-9X-]/gi, "").trim();
  const digitsOnly = clean.replace(/-/g, "").toUpperCase();

  let isbn10: string | null = null;
  let isbn13: string | null = null;

  if (digitsOnly.length === 10) {
    isbn10 = digitsOnly;
    // Calculate ISBN-13 (978 + 9 digits + check digit)
    const base12 = "978" + digitsOnly.slice(0, 9);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(base12[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    isbn13 = base12 + check.toString();
  } else if (digitsOnly.length === 13) {
    isbn13 = digitsOnly;
    if (digitsOnly.startsWith("978")) {
      const base9 = digitsOnly.slice(3, 12);
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(base9[i], 10) * (10 - i);
      }
      const rem = (11 - (sum % 11)) % 11;
      const checkChar = rem === 10 ? "X" : rem.toString();
      isbn10 = base9 + checkChar;
    }
  }

  // Format Japanese ISBN if starts with 4 (or 978-4)
  const isJapanese =
    clean.startsWith("ISBN4") ||
    digitsOnly.startsWith("4") ||
    digitsOnly.startsWith("9784");

  return {
    raw: input,
    cleaned: clean,
    digitsOnly,
    isbn10,
    isbn13,
    isJapanese,
  };
}

// OCR endpoint: uses Gemini 3.8 Flash to extract book identifiers, barcodes, Japanese ISBNs, C-Codes
app.post("/api/book/ocr", async (req, res) => {
  try {
    requestMetrics.totalOcr++;
    requestMetrics.lastRequestTime = new Date().toISOString();

    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are a high-precision bibliographic OCR scanner and book identifier analyzer.
Look at this image containing a book cover, book back, barcode, or copyright/colophon page (such as Japanese 奥付 Okuzuke, or Arabic/English imprint).
Detect and extract:
1. Exact text shown for any barcode numbers, ISBNs (including Japanese ISBNs like ISBN4-..., 978-4-..., dual barcode C-Codes like 1920193004809 / C0193 \\480E), SBNs, LCCN, OCLC, ISSN, or arbitrary book reference strings. Preserve exact dashes, letters, and numbers.
2. The primary detected book identifier (prefer ISBN-13, ISBN-10, or exact Japanese ISBN).
3. Any secondary identifier (e.g., Japanese C-Code, Price code, EAN bottom barcode).
4. Any book title, author, and publisher visible in the image (in original language: Japanese Kanji/Kana, Arabic, English, etc.).
5. Classification and confidence.

Respond strictly in valid JSON with format:
{
  "exactRawText": "exact characters recognized with hyphens and letters",
  "primaryIdentifier": "e.g. 9784062005111 or ISBN4-06-200511-3",
  "identifierType": "ISBN-13" | "ISBN-10" | "Japanese-ISBN4" | "Barcode-EAN" | "Dual-Barcode-CCode" | "LCCN" | "OCLC" | "Custom-Identifier",
  "cCode": "C0193 or empty",
  "price": "\\480E or empty",
  "titleHint": "Title if visible or empty",
  "authorHint": "Author if visible or empty",
  "publisherHint": "Publisher if visible or empty",
  "languageHint": "ja" | "ar" | "en" | "other",
  "confidence": 0.95,
  "allExtractedTokens": ["token1", "token2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.warn("OCR Error / AI Vision quota limit:", error?.message);
    return res.json({
      success: true,
      result: {
        exactRawText: "",
        primaryIdentifier: "",
        identifierType: "Custom-Identifier",
        confidence: 0,
        quotaLimited: true,
        quotaNotice:
          "AI Vision Scanner reached API quota limit. Please use barcode video scan, test presets, or manual identifier entry.",
      },
    });
  }
});

// Deep Bibliographic Web Crawling & Search Grounding
app.post("/api/book/crawl", async (req, res) => {
  try {
    requestMetrics.totalCrawls++;
    requestMetrics.lastRequestTime = new Date().toISOString();

    const {
      identifier,
      targetCatalogs = [
        "amazon_jp",
        "amazon_com",
        "ndl",
        "aruc_auc",
        "kfnl",
        "dar_el_kotob",
        "nwf",
        "abjad",
        "hindawi",
        "noor_book",
        "al_manhal",
        "loc",
        "worldcat",
        "librarything"
      ],
    } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Missing identifier" });
    }

    const normalized = normalizeIsbn(identifier);
    const lookupKey = normalized.isbn13 || normalized.isbn10 || normalized.cleaned;

    const prompt = `You are a world-class bibliographic crawler, librarian cataloger, and library cross-referencer.
Target Book Identifier: "${identifier}" (Normalized ISBN-13: ${normalized.isbn13 || "N/A"}, ISBN-10: ${normalized.isbn10 || "N/A"}).
Target catalogs to crawl & cross-reference: ${targetCatalogs.join(", ")}.

Search and crawl information across these target sources:
1. Amazon Japan (amazon.co.jp) - fetch Japanese title, original title, Japanese author (Kanji + furigana/romaji), publisher, publication date, ASIN, C-Code (C分類), price in JPY, page count, Japanese synopsis, cover image link.
2. Amazon.com (amazon.com) - fetch global/US English edition metadata, ASIN, English synopsis, US list price in USD, international customer availability, and Amazon.com product link.
3. Japanese National Diet Library (NDL - iss.ndl.go.jp / ndlsearch.ndl.go.jp) & CiNii Books - official NDL authorities, NDLC classification, NDC (Nippon Decimal Classification).
4. Arab & Middle Eastern National Libraries, Union Catalogs & Databases:
   - Arabic Union Catalog (الفهرس العربي الموحد - AUC / aruc.org) - official unified Arab bibliographic authority
   - King Fahd National Library (مكتبة الملك فهد الوطنية - KFNL / kfnl.gov.sa) - Saudi Arabia national deposit & legal deposit
   - Egyptian National Library and Archives (دار الكتب والوثائق القومية المصرية - Dar El Kotob / darlkotob.gov.eg)
   - Neelwafurat (nwf.com / neelwafurat.com) - leading commercial book catalogue
   - Abjad (abjad.com) - leading Arabic reader & ebook platform
   - Hindawi Foundation (مؤسسة هنداوي / hindawi.org) - authoritative Arabic literary & academic texts
   - Noor-Book (مكتبة نور / noor-book.com) - massive indexed Arabic books database
   - Al-Manhal (المنهل / almanhal.com) - peer-reviewed Arab academic publications
   - Jamalon (جملون) & Kotobna (كتبنا)
   - Arab authors in Arabic script & Latin transliteration, Arabic publisher, Dar, edition, Dewey Arabic classification.
4. Library of Congress (LOC - loc.gov / id.loc.gov) - LCCN, LCSH subjects, LC call number, NACO author authority record.
5. WorldCat (worldcat.org) & LibraryThing (librarything.com) - OCLC number, LibraryThing work ID, global editions, reviews count, tags.
6. Author Authority Details:
   - Primary author name in original script (Kanji/Arabic) AND transliterated/English.
   - VIAF identifier, LC Authority ID, NDL Authority ID.
   - Cross-referenced other editions or translations (e.g. Japanese original and Arabic/English translations).

Return comprehensive, verified metadata in JSON strictly matching this schema:
{
  "title": "Main title in original language",
  "titleRomajiOrTranslated": "Romaji / transliterated or translated title",
  "subtitle": "Subtitle if any",
  "authors": [
    {
      "name": "Full name in original script",
      "transliteratedName": "Latin/Romaji/English name",
      "role": "Author" | "Editor" | "Translator" | "Illustrator",
      "viafId": "e.g. 108238901",
      "ndlId": "e.g. 00054222",
      "locId": "e.g. n79056789"
    }
  ],
  "publisher": "Publisher name",
  "publishedDate": "YYYY or YYYY-MM-DD",
  "language": "ja" | "ar" | "en" | "other",
  "description": "Comprehensive description / synopsis",
  "coverImageUrl": "High quality image URL from Amazon Japan, NDL, OpenLibrary, Hindawi or verified source",
  "identifiers": {
    "isbn13": "978...",
    "isbn10": "4-...",
    "cCode": "C0193",
    "asin": "B0...",
    "lccn": "2001-...",
    "oclc": "12345678",
    "librarything": "12345",
    "nwfId": "...",
    "abjadId": "...",
    "aucId": "AUC-...",
    "kfnlId": "...",
    "darElKotobId": "...",
    "hindawiId": "...",
    "noorBookId": "...",
    "alManhalId": "..."
  },
  "classifications": {
    "ndc": "Nippon Decimal Classification e.g. 913.6",
    "dewey": "Dewey Decimal e.g. 895.63 or 892.7",
    "arabicDewey": "Arabic Dewey 10 (e.g. 813 for Arabic novel, 415 for grammar, 214 for fiqh, 211 for Quran, 811 for poetry)",
    "arabicDeweyName": "Arabic subject title e.g. القصة والرواية العربية",
    "lcc": "Library of Congress Call No e.g. PL856.U73",
    "cCode": "Japanese C-Code e.g. C0193 (General Fiction)"
  },
  "physical": {
    "pageCount": 320,
    "format": "Tankobon / Bunko / Paperback / Hardcover",
    "dimensions": "15 x 10.5 cm",
    "price": "¥680 / EGP 150 / SAR 45"
  },
  "sourcesFound": [
    {
      "name": "Amazon Japan",
      "url": "https://www.amazon.co.jp/...",
      "matched": true,
      "notes": "Verified match on Amazon JP"
    },
    {
      "name": "Amazon.com",
      "url": "https://www.amazon.com/...",
      "matched": true,
      "notes": "Verified match on Amazon US / Global"
    },
    {
      "name": "NDL (National Diet Library)",
      "url": "https://iss.ndl.go.jp/...",
      "matched": true,
      "notes": "NDL catalogue record found"
    },
    {
      "name": "Arabic Union Catalog (الفهرس العربي الموحد)",
      "url": "https://www.aruc.org/...",
      "matched": true,
      "notes": "Unified Arab bibliographic entry"
    },
    {
      "name": "King Fahd National Library (مكتبة الملك فهد)",
      "url": "https://kfnl.gov.sa/...",
      "matched": true,
      "notes": "National deposit catalog"
    },
    {
      "name": "Egyptian National Library (دار الكتب المصرية)",
      "url": "https://darlkotob.gov.eg/...",
      "matched": false,
      "notes": "Checked"
    },
    {
      "name": "Neelwafurat (nwf.com)",
      "url": "https://www.neelwafurat.com/...",
      "matched": false,
      "notes": "Not applicable for this record"
    },
    {
      "name": "Abjad (أبجد)",
      "url": "https://www.abjad.com/...",
      "matched": false,
      "notes": "Checked"
    },
    {
      "name": "Hindawi Foundation (مؤسسة هنداوي)",
      "url": "https://www.hindawi.org/...",
      "matched": false,
      "notes": "Checked"
    },
    {
      "name": "Noor-Book (مكتبة نور)",
      "url": "https://www.noor-book.com/...",
      "matched": false,
      "notes": "Checked"
    },
    {
      "name": "Al-Manhal (المنهل)",
      "url": "https://www.almanhal.com/...",
      "matched": false,
      "notes": "Academic record check"
    },
    {
      "name": "Library of Congress",
      "url": "https://catalog.loc.gov/...",
      "matched": true,
      "notes": "US Catalog entry found"
    },
    {
      "name": "WorldCat",
      "url": "https://www.worldcat.org/...",
      "matched": true,
      "notes": "Global holdings available"
    },
    {
      "name": "LibraryThing",
      "url": "https://www.librarything.com/...",
      "matched": true,
      "notes": "Work page cross-referenced"
    }
  ],
  "crossReferencedEditions": [
    {
      "title": "Title of translated / related edition",
      "language": "ar / en / fr",
      "isbn": "978...",
      "publisher": "...",
      "year": "2020",
      "relation": "Translation / Alternative edition"
    }
  ],
  "citations": {
    "apa": "Author, A. (Year). Title. Publisher.",
    "mla": "Author, A. Title. Publisher, Year.",
    "chicagoNotes": "Author, Title (Publisher, Year).",
    "chicagoAuthorDate": "Author. Year. Title. Publisher.",
    "harvard": "Author (Year) Title. City: Publisher.",
    "ieee": "[1] A. Author, Title. Publisher, Year.",
    "sist02": "Author. Title. Publisher, Year, Page. (Japanese standard)",
    "arabicStandard": "المؤلف. (السنة). عنوان الكتاب. دار النشر."
  }
}`;

    let crawledData: any = null;
    let fallbackNotice: string | undefined = undefined;

    // Tier 1: Try Gemini with Google Search tool
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      crawledData = JSON.parse(text);
    } catch (searchToolErr: any) {
      console.warn("AI Crawl with search grounding quota limited / unavailable:", searchToolErr?.message);

      // Tier 2: Try standard Gemini without search tool (uses minimal tokens)
      try {
        const fallbackAiRes = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt + "\nExtract verified bibliographic catalog records accurately.",
          config: {
            responseMimeType: "application/json",
          },
        });
        const fallbackText = fallbackAiRes.text || "{}";
        crawledData = JSON.parse(fallbackText);
      } catch (geminiErr: any) {
        console.warn("AI Crawl quota reached (HTTP 429), resolving via live library catalogs:", geminiErr?.message);
        fallbackNotice = "Resolved via National Diet Library, Google Books & Union Catalogs (AI Quota Gracefully Bypassed)";
      }
    }

    // Tier 3: If Gemini was quota-limited or returned empty, resolve from live catalogs & curated registry
    if (!crawledData || !crawledData.title || crawledData.title.trim() === "") {
      crawledData = await resolveFromLiveCatalogs(identifier, normalized);
      fallbackNotice = fallbackNotice || "Catalog Record Ingested from Live Library Repositories";
    }

    // Cache the result
    if (serverConfig.cacheEnabled && lookupKey) {
      bookCache.set(lookupKey, crawledData);
    }

    return res.json({ success: true, data: crawledData, fallbackNotice });
  } catch (error: any) {
    console.error("Crawl error fallback:", error?.message);
    const normalized = normalizeIsbn(req.body?.identifier || "");
    const fallbackData = await resolveFromLiveCatalogs(req.body?.identifier || "", normalized);
    return res.json({
      success: true,
      data: fallbackData,
      fallbackNotice: "Resolved via National & Commercial Library Catalogs",
    });
  }
});

// Fast & deep lookup endpoint: searches cache + curated catalog + live public endpoints + AI enrichment
app.post("/api/book/lookup", async (req, res) => {
  try {
    requestMetrics.totalLookups++;
    requestMetrics.lastRequestTime = new Date().toISOString();

    const { identifier, forceCrawl = false } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Missing identifier" });
    }

    const normalized = normalizeIsbn(identifier);
    const lookupKey = normalized.isbn13 || normalized.isbn10 || normalized.cleaned;

    if (!forceCrawl && serverConfig.cacheEnabled && bookCache.has(lookupKey)) {
      requestMetrics.cacheHits++;
      return res.json({
        success: true,
        source: "cache",
        data: bookCache.get(lookupKey),
      });
    }

    // 1. Check curated benchmark catalog registry
    const known = findKnownBibRecord(identifier, normalized.isbn13 || normalized.isbn10 || "");
    if (known) {
      if (serverConfig.cacheEnabled && lookupKey) {
        bookCache.set(lookupKey, known);
      }
      return res.json({
        success: true,
        source: "curated_catalog",
        data: known,
      });
    }

    // 2. Fetch live data from Google Books, Open Library, and National Diet Library (NDL)
    let catalogRecord = await resolveFromLiveCatalogs(identifier, normalized);

    // 3. If forceCrawl was requested and AI is available, attempt enrichment safely
    if (forceCrawl) {
      try {
        const crawlPrompt = `Fetch complete bibliographic metadata for book identifier: "${identifier}".
Return JSON with: title, titleRomajiOrTranslated, subtitle, authors (name, transliteratedName, role, viafId, ndlId, locId),
publisher, publishedDate, language, description, coverImageUrl,
identifiers (isbn13, isbn10, cCode, asin, lccn, oclc, librarything, nwfId, abjadId),
classifications (ndc, dewey, lcc, cCode),
physical (pageCount, format, dimensions, price),
sourcesFound, crossReferencedEditions, citations.`;

        const aiRes = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: crawlPrompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const aiParsed = JSON.parse(aiRes.text || "{}");
        if (aiParsed && aiParsed.title) {
          catalogRecord = {
            ...catalogRecord,
            ...aiParsed,
            identifiers: { ...catalogRecord.identifiers, ...(aiParsed.identifiers || {}) },
            classifications: { ...catalogRecord.classifications, ...(aiParsed.classifications || {}) },
          };
        }
      } catch (aiErr: any) {
        console.warn("AI Enrichment quota limit (HTTP 429), maintaining live catalog record:", aiErr?.message);
      }
    }

    if (serverConfig.cacheEnabled && lookupKey) {
      bookCache.set(lookupKey, catalogRecord);
    }

    return res.json({
      success: true,
      source: "live_catalogs",
      data: catalogRecord,
    });
  } catch (error: any) {
    console.error("Lookup error:", error?.message);
    const normalized = normalizeIsbn(req.body?.identifier || "");
    const fallbackData = await resolveFromLiveCatalogs(req.body?.identifier || "", normalized);
    return res.json({ success: true, data: fallbackData, source: "live_catalogs_fallback" });
  }
});

// Control Panel Settings & Metrics
app.get("/api/control-panel", (req, res) => {
  res.json({
    config: {
      rateLimitPerMinute: serverConfig.rateLimitPerMinute,
      hasGoogleCseKey: Boolean(serverConfig.googleCseApiKey),
      hasGoogleCseCx: Boolean(serverConfig.googleCseCx),
      hasAmazonPaApi: Boolean(serverConfig.amazonPaApiKey),
      hasWorldcatKey: Boolean(serverConfig.worldcatApiKey),
      cacheEnabled: serverConfig.cacheEnabled,
      cachedRecordsCount: bookCache.size,
    },
    metrics: requestMetrics,
  });
});

app.post("/api/control-panel", (req, res) => {
  const {
    rateLimitPerMinute,
    googleCseApiKey,
    googleCseCx,
    amazonPaApiKey,
    amazonPaApiSecret,
    amazonAssociateTag,
    worldcatApiKey,
    cacheEnabled,
    clearCache,
  } = req.body;

  if (typeof rateLimitPerMinute === "number") {
    serverConfig.rateLimitPerMinute = rateLimitPerMinute;
  }
  if (typeof googleCseApiKey === "string") {
    serverConfig.googleCseApiKey = googleCseApiKey;
  }
  if (typeof googleCseCx === "string") {
    serverConfig.googleCseCx = googleCseCx;
  }
  if (typeof amazonPaApiKey === "string") {
    serverConfig.amazonPaApiKey = amazonPaApiKey;
  }
  if (typeof amazonPaApiSecret === "string") {
    serverConfig.amazonPaApiSecret = amazonPaApiSecret;
  }
  if (typeof amazonAssociateTag === "string") {
    serverConfig.amazonAssociateTag = amazonAssociateTag;
  }
  if (typeof worldcatApiKey === "string") {
    serverConfig.worldcatApiKey = worldcatApiKey;
  }
  if (typeof cacheEnabled === "boolean") {
    serverConfig.cacheEnabled = cacheEnabled;
  }
  if (clearCache) {
    bookCache.clear();
    requestMetrics.cacheHits = 0;
  }

  res.json({ success: true, message: "Control panel settings updated" });
});

// -------------------------------------------------------------
// SRU & Z39.50 Protocols Service & Live Bibliographic Gateway
// -------------------------------------------------------------
let sruTargetsList: SruTarget[] = [...DEFAULT_SRU_TARGETS];

app.get("/api/sru/targets", (req, res) => {
  res.json({ targets: sruTargetsList });
});

app.post("/api/sru/toggle-target", (req, res) => {
  const { id, enabled } = req.body;
  const target = sruTargetsList.find((t) => t.id === id);
  if (target) {
    target.enabled = Boolean(enabled);
    return res.json({ success: true, target });
  }
  return res.status(404).json({ error: "Target not found" });
});

app.post("/api/sru/add-target", (req, res) => {
  const newTarget: SruTarget = req.body;
  if (!newTarget.name || !newTarget.baseUrl) {
    return res.status(400).json({ error: "Target Name and Base URL are required" });
  }
  newTarget.id = newTarget.id || `custom_${Date.now()}`;
  newTarget.enabled = newTarget.enabled ?? true;
  sruTargetsList.push(newTarget);
  res.json({ success: true, target: newTarget, targets: sruTargetsList });
});

app.post("/api/sru/query", async (req, res) => {
  const { targetId, isbn } = req.body;
  if (!targetId || !isbn) {
    return res.status(400).json({ error: "Missing targetId or isbn" });
  }

  const target = sruTargetsList.find((t) => t.id === targetId);
  if (!target) {
    return res.status(404).json({ error: "SRU/Z39.50 target not found" });
  }

  const startTime = Date.now();
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, "").trim();

  // Build query URL
  let queryUrl = "";
  if (target.id === "cinii_books") {
    queryUrl = `${target.baseUrl}?isbn=${encodeURIComponent(cleanIsbn)}&format=rss`;
  } else {
    const rawQuery = target.queryTemplate.replace("{isbn}", cleanIsbn);
    const separator = target.baseUrl.includes("?") ? "&" : "?";
    queryUrl = `${target.baseUrl}${separator}operation=searchRetrieve&version=${target.version}&query=${encodeURIComponent(
      rawQuery
    )}&maximumRecords=1&recordSchema=${encodeURIComponent(target.recordSchema)}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const response = await fetch(queryUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BibliographicScanner-SRU-Client/1.0 (Librarian Tool)",
        Accept: "application/xml, text/xml, application/rss+xml, */*",
      },
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      return res.json({
        targetId: target.id,
        targetName: target.name,
        queryUrl,
        status: "error",
        recordCount: 0,
        errorMessage: `HTTP Error ${response.status}: ${response.statusText}`,
        latencyMs,
      });
    }

    const xmlText = await response.text();
    const parsed = parseSruXmlResponse(xmlText);

    return res.json({
      targetId: target.id,
      targetName: target.name,
      queryUrl,
      status: parsed.recordCount > 0 ? "success" : "not_found",
      recordCount: parsed.recordCount,
      rawXml: xmlText.slice(0, 50000), // Max 50KB for UI preview
      extractedData: parsed.extracted,
      latencyMs,
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.warn(`SRU fetch error for target ${target.id} (${queryUrl}):`, error.message);

    return res.json({
      targetId: target.id,
      targetName: target.name,
      queryUrl,
      status: "error",
      recordCount: 0,
      errorMessage: error.name === "AbortError" ? "Request timed out after 6.5s (Target library server unresponsive)" : (error.message || "Failed to reach SRU endpoint"),
      latencyMs,
    });
  }
});


// Mount Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: Number(PORT) },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
