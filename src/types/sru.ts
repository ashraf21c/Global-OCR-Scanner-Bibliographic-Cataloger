export type SruRegion = "japanese" | "arabic" | "english" | "european" | "global";
export type SruProtocol = "sru" | "z3950";

export interface SruTarget {
  id: string;
  name: string;
  nativeName?: string;
  region: SruRegion;
  protocol: SruProtocol;
  baseUrl: string;
  z3950Host?: string;
  z3950Port?: number;
  z3950Database?: string;
  version: "1.1" | "1.2";
  queryTemplate: string;
  recordSchema: string;
  enabled: boolean;
  description: string;
  descriptionJa?: string;
  descriptionAr?: string;
  docUrl?: string;
}

export interface SruExtractedData {
  title?: string;
  authors?: string[];
  publisher?: string;
  publicationYear?: string;
  lccn?: string;
  ndc?: string;
  dewey?: string;
  lcc?: string;
  subjects?: string[];
  isbn?: string;
}

export interface SruQueryResult {
  targetId: string;
  targetName: string;
  queryUrl: string;
  status: "success" | "not_found" | "error" | "pending";
  recordCount: number;
  rawXml?: string;
  extractedData?: SruExtractedData;
  latencyMs?: number;
  errorMessage?: string;
}
