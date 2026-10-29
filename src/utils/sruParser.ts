import { XMLParser } from "fast-xml-parser";
import { SruExtractedData } from "../types/sru";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true,
});

/**
 * Extracts bibliographic fields from MARCXML, Dublin Core, or DCNDL XML.
 */
export function parseSruXmlResponse(xmlContent: string): {
  recordCount: number;
  extracted?: SruExtractedData;
} {
  try {
    const parsed = parser.parse(xmlContent);

    // Look for recordCount in searchRetrieveResponse
    const responseRoot =
      parsed["searchRetrieveResponse"] ||
      parsed["zs:searchRetrieveResponse"] ||
      parsed["sru:searchRetrieveResponse"] ||
      parsed;

    const countVal =
      responseRoot["numberOfRecords"] ||
      responseRoot["zs:numberOfRecords"] ||
      responseRoot["sru:numberOfRecords"] ||
      "0";

    const recordCount = parseInt(String(countVal), 10) || 0;
    if (recordCount === 0 && !xmlContent.includes("<record") && !xmlContent.includes("<dc") && !xmlContent.includes("<item")) {
      return { recordCount: 0 };
    }

    const extracted: SruExtractedData = {};

    // Helper: traverse object or array to find MARC datafields
    function findMarcDatafield(obj: any, tag: string): any[] {
      const results: any[] = [];
      function recurse(curr: any) {
        if (!curr || typeof curr !== "object") return;
        if (curr["datafield"] || curr["marc:datafield"]) {
          const dfs = curr["datafield"] || curr["marc:datafield"];
          const list = Array.isArray(dfs) ? dfs : [dfs];
          for (const df of list) {
            if (df["@_tag"] === tag || df["@_tag"] === String(tag)) {
              results.push(df);
            }
          }
        }
        for (const k in curr) {
          if (typeof curr[k] === "object") recurse(curr[k]);
        }
      }
      recurse(obj);
      return results;
    }

    function getSubfield(df: any, code: string): string | undefined {
      if (!df) return undefined;
      const subfields = df["subfield"] || df["marc:subfield"];
      if (!subfields) return undefined;
      const list = Array.isArray(subfields) ? subfields : [subfields];
      const match = list.find((s: any) => s["@_code"] === code);
      if (match) {
        return typeof match === "object" ? match["#text"] || match["_text"] || "" : String(match);
      }
      return undefined;
    }

    // MARC Tag 245 - Title
    const titleFields = findMarcDatafield(parsed, "245");
    if (titleFields.length > 0) {
      const titleA = getSubfield(titleFields[0], "a") || "";
      const titleB = getSubfield(titleFields[0], "b") || "";
      extracted.title = `${titleA} ${titleB}`.replace(/[/:,\s]+$/, "").trim();
    }

    // MARC Tag 100 / 700 - Authors
    const authorFields = [...findMarcDatafield(parsed, "100"), ...findMarcDatafield(parsed, "700")];
    if (authorFields.length > 0) {
      extracted.authors = authorFields
        .map((df) => getSubfield(df, "a"))
        .filter((a): a is string => Boolean(a))
        .map((a) => a.replace(/,\s*$/, "").trim());
    }

    // MARC Tag 260 / 264 - Publisher & Year
    const pubFields = [...findMarcDatafield(parsed, "264"), ...findMarcDatafield(parsed, "260")];
    if (pubFields.length > 0) {
      const pubName = getSubfield(pubFields[0], "b");
      const pubYear = getSubfield(pubFields[0], "c");
      if (pubName) extracted.publisher = pubName.replace(/[,;]\s*$/, "").trim();
      if (pubYear) extracted.publicationYear = pubYear.replace(/[^0-9]/g, "").slice(0, 4);
    }

    // MARC Tag 010 - LC Card Number / Control Number (LCCN)
    const lccnFields = findMarcDatafield(parsed, "010");
    if (lccnFields.length > 0) {
      const rawLccn = getSubfield(lccnFields[0], "a");
      if (rawLccn) extracted.lccn = rawLccn.trim();
    }

    // MARC Tag 050 - Library of Congress Classification (LCC)
    const lccFields = findMarcDatafield(parsed, "050");
    if (lccFields.length > 0) {
      const classPart = getSubfield(lccFields[0], "a") || "";
      const itemPart = getSubfield(lccFields[0], "b") || "";
      extracted.lcc = `${classPart} ${itemPart}`.trim();
    }

    // MARC Tag 082 - Dewey Decimal Classification (DDC)
    const ddcFields = findMarcDatafield(parsed, "082");
    if (ddcFields.length > 0) {
      const ddc = getSubfield(ddcFields[0], "a");
      if (ddc) extracted.dewey = ddc.trim();
    }

    // MARC Tag 090 / 084 - NDC (Nippon Decimal Classification) or Local
    const ndcFields = [...findMarcDatafield(parsed, "084"), ...findMarcDatafield(parsed, "090")];
    if (ndcFields.length > 0) {
      const ndc = getSubfield(ndcFields[0], "a");
      if (ndc) extracted.ndc = ndc.trim();
    }

    // MARC Tag 020 - ISBN
    const isbnFields = findMarcDatafield(parsed, "020");
    if (isbnFields.length > 0) {
      const isbn = getSubfield(isbnFields[0], "a");
      if (isbn) extracted.isbn = isbn.split(/\s+/)[0];
    }

    // MARC Tag 650 - Subject Headings
    const subjectFields = findMarcDatafield(parsed, "650");
    if (subjectFields.length > 0) {
      extracted.subjects = subjectFields
        .map((df) => getSubfield(df, "a"))
        .filter((s): s is string => Boolean(s));
    }

    // Dublin Core / DCNDL fallback if not MARC
    if (!extracted.title) {
      const dcTitle =
        parsed["dc:title"] ||
        parsed["title"] ||
        parsed["dcmess:title"] ||
        parsed["dcterms:title"];
      if (dcTitle) {
        extracted.title = typeof dcTitle === "object" ? dcTitle["#text"] || JSON.stringify(dcTitle) : String(dcTitle);
      }
    }
    if (!extracted.authors || extracted.authors.length === 0) {
      const dcCreator =
        parsed["dc:creator"] ||
        parsed["creator"] ||
        parsed["dcterms:creator"];
      if (dcCreator) {
        const list = Array.isArray(dcCreator) ? dcCreator : [dcCreator];
        extracted.authors = list.map((c) => (typeof c === "object" ? c["#text"] || "" : String(c))).filter(Boolean);
      }
    }

    return {
      recordCount: Math.max(recordCount, extracted.title ? 1 : 0),
      extracted,
    };
  } catch (err) {
    console.warn("Failed to parse SRU XML response:", err);
    return { recordCount: 0 };
  }
}
