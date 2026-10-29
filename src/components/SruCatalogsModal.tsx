import React, { useEffect, useState } from "react";
import {
  Library,
  Globe,
  Radio,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Code2,
  ChevronDown,
  ChevronUp,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  BookOpen,
  Filter,
  X,
} from "lucide-react";
import { SruTarget, SruQueryResult, SruRegion } from "../types/sru";
import { DEFAULT_SRU_TARGETS } from "../utils/sruTargetsData";
import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface SruCatalogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIsbn?: string;
  onApplyExtractedMetadata?: (data: any) => void;
  lang?: UiLanguage;
}

export const SruCatalogsModal: React.FC<SruCatalogsModalProps> = ({
  isOpen,
  onClose,
  initialIsbn = "9784003101018",
  onApplyExtractedMetadata,
  lang = "en",
}) => {
  const t = TRANSLATIONS[lang];
  const [targets, setTargets] = useState<SruTarget[]>(DEFAULT_SRU_TARGETS);
  const [selectedRegion, setSelectedRegion] = useState<SruRegion | "all">("all");
  const [testIsbn, setTestIsbn] = useState<string>(initialIsbn || "9784003101018");
  const [queryResults, setQueryResults] = useState<Record<string, SruQueryResult>>({});
  const [loadingTargets, setLoadingTargets] = useState<Record<string, boolean>>({});
  const [expandedXml, setExpandedXml] = useState<Record<string, boolean>>({});
  const [copiedTargetXml, setCopiedTargetXml] = useState<string | null>(null);

  // New target modal/form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTargetName, setNewTargetName] = useState("");
  const [newTargetRegion, setNewTargetRegion] = useState<SruRegion>("english");
  const [newTargetProtocol, setNewTargetProtocol] = useState<"sru" | "z3950">("sru");
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [newTargetHost, setNewTargetHost] = useState("");
  const [newTargetPort, setNewTargetPort] = useState(210);
  const [newTargetDb, setNewTargetDb] = useState("");
  const [newTargetTemplate, setNewTargetTemplate] = useState('bath.isbn="{isbn}"');
  const [newTargetSchema, setNewTargetSchema] = useState("marcxml");
  const [newTargetDesc, setNewTargetDesc] = useState("");

  useEffect(() => {
    if (initialIsbn) {
      setTestIsbn(initialIsbn);
    }
  }, [initialIsbn]);

  // Load targets from server
  const fetchTargets = async () => {
    try {
      const res = await fetch("/api/sru/targets");
      if (res.ok) {
        const data = await res.json();
        if (data.targets && data.targets.length > 0) {
          setTargets(data.targets);
        }
      }
    } catch (e) {
      console.warn("Could not load targets from server:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTargets();
    }
  }, [isOpen]);

  const toggleTarget = async (id: string, currentState: boolean) => {
    const newState = !currentState;
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: newState } : t))
    );
    try {
      await fetch("/api/sru/toggle-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: newState }),
      });
    } catch (e) {
      console.error("Failed to toggle target:", e);
    }
  };

  const handleQuerySingleTarget = async (target: SruTarget) => {
    if (!testIsbn.trim()) return;
    setLoadingTargets((prev) => ({ ...prev, [target.id]: true }));

    try {
      const res = await fetch("/api/sru/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: target.id,
          isbn: testIsbn.trim(),
        }),
      });

      if (res.ok) {
        const result: SruQueryResult = await res.json();
        setQueryResults((prev) => ({ ...prev, [target.id]: result }));
      } else {
        setQueryResults((prev) => ({
          ...prev,
          [target.id]: {
            targetId: target.id,
            targetName: target.name,
            queryUrl: target.baseUrl,
            status: "error",
            recordCount: 0,
            errorMessage: `Server returned HTTP ${res.status}`,
          },
        }));
      }
    } catch (err: any) {
      setQueryResults((prev) => ({
        ...prev,
        [target.id]: {
          targetId: target.id,
          targetName: target.name,
          queryUrl: target.baseUrl,
          status: "error",
          recordCount: 0,
          errorMessage: err.message || "Failed to reach endpoint",
        },
      }));
    } finally {
      setLoadingTargets((prev) => ({ ...prev, [target.id]: false }));
    }
  };

  const handleQueryAllEnabled = async () => {
    const active = targets.filter((t) => t.enabled);
    for (const t of active) {
      handleQuerySingleTarget(t);
    }
  };

  const handleAddCustomTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetName || !newTargetUrl) return;

    const newTarget: SruTarget = {
      id: `custom_${Date.now()}`,
      name: newTargetName,
      region: newTargetRegion,
      protocol: newTargetProtocol,
      baseUrl: newTargetUrl,
      z3950Host: newTargetHost || undefined,
      z3950Port: newTargetPort || undefined,
      z3950Database: newTargetDb || undefined,
      version: "1.1",
      queryTemplate: newTargetTemplate,
      recordSchema: newTargetSchema,
      enabled: true,
      description: newTargetDesc || "Custom institutional library catalog gateway.",
    };

    try {
      const res = await fetch("/api/sru/add-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTarget),
      });
      if (res.ok) {
        const data = await res.json();
        setTargets(data.targets);
        setShowAddForm(false);
        // Reset form
        setNewTargetName("");
        setNewTargetUrl("");
        setNewTargetDesc("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyXmlToClipboard = (targetId: string, xml: string) => {
    navigator.clipboard.writeText(xml);
    setCopiedTargetXml(targetId);
    setTimeout(() => setCopiedTargetXml(null), 2000);
  };

  if (!isOpen) return null;

  const filteredTargets =
    selectedRegion === "all"
      ? targets
      : targets.filter((t) => t.region === selectedRegion);

  const regionCounts = {
    all: targets.length,
    japanese: targets.filter((t) => t.region === "japanese").length,
    arabic: targets.filter((t) => t.region === "arabic").length,
    english: targets.filter((t) => t.region === "english" || t.region === "global").length,
    european: targets.filter((t) => t.region === "european").length,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Radio className="w-5 h-5 text-indigo-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {t.sruModalTitle}
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  ANSI/NISO Z39.50 • SRU 1.1 / 1.2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.sruModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Test Query Bar */}
        <div className="bg-slate-950/70 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="text-xs font-semibold text-slate-300 shrink-0">
              Query ISBN / Key:
            </span>
            <div className="relative flex-1">
              <input
                type="text"
                value={testIsbn}
                onChange={(e) => setTestIsbn(e.target.value)}
                placeholder="Enter ISBN-13, ISBN-10, or Japanese ISBN (e.g. 9784003101018, 4003101014)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            {/* Quick Demo Pre-fill presets */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTestIsbn("9784003101018")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-rose-300 px-2 py-1 rounded transition-colors"
                title="Sōseki: Kokoro (Japanese)"
              >
                🇯🇵 Japanese
              </button>
              <button
                type="button"
                onClick={() => setTestIsbn("9789770913215")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2 py-1 rounded transition-colors"
                title="Naguib Mahfouz (Arabic)"
              >
                🇸🇦/🇪🇬 Arabic
              </button>
              <button
                type="button"
                onClick={() => setTestIsbn("9780140449136")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-1 rounded transition-colors"
                title="Global English Classic"
              >
                🇺🇸/🇬🇧 English
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQueryAllEnabled}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Query All Active Gateways</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Gateway</span>
            </button>
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="bg-slate-900 px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Region:
          </span>
          <button
            onClick={() => setSelectedRegion("all")}
            className={`px-3 py-1 rounded-md font-semibold transition-all shrink-0 ${
              selectedRegion === "all"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white bg-slate-800/60"
            }`}
          >
            All Repositories ({regionCounts.all})
          </button>
          <button
            onClick={() => setSelectedRegion("japanese")}
            className={`px-3 py-1 rounded-md font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedRegion === "japanese"
                ? "bg-rose-600 text-white"
                : "text-slate-400 hover:text-white bg-slate-800/60"
            }`}
          >
            <span>🇯🇵 Japanese (NDL / CiNii)</span>
            <span className="text-[10px] opacity-80">({regionCounts.japanese})</span>
          </button>
          <button
            onClick={() => setSelectedRegion("arabic")}
            className={`px-3 py-1 rounded-md font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedRegion === "arabic"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white bg-slate-800/60"
            }`}
          >
            <span>🇸🇦/🇪🇬 Arabic (AUC / BA / KFNL / QNL)</span>
            <span className="text-[10px] opacity-80">({regionCounts.arabic})</span>
          </button>
          <button
            onClick={() => setSelectedRegion("english")}
            className={`px-3 py-1 rounded-md font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedRegion === "english"
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:text-white bg-slate-800/60"
            }`}
          >
            <span>🇺🇸/🇬🇧 English (LOC / BL / WorldCat)</span>
            <span className="text-[10px] opacity-80">({regionCounts.english})</span>
          </button>
          <button
            onClick={() => setSelectedRegion("european")}
            className={`px-3 py-1 rounded-md font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedRegion === "european"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white bg-slate-800/60"
            }`}
          >
            <span>🇫🇷/🇩🇪 European (BnF / DNB)</span>
            <span className="text-[10px] opacity-80">({regionCounts.european})</span>
          </button>
        </div>

        {/* Add Custom Gateway Collapsible Panel */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomTarget}
            className="p-5 bg-slate-950 border-b border-slate-800 text-xs flex flex-col gap-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4 text-indigo-400" />
                Add Institutional SRU or Z39.50 Catalog Gateway
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Target Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harvard University Library"
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Region Category
                </label>
                <select
                  value={newTargetRegion}
                  onChange={(e) => setNewTargetRegion(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="japanese">Japanese</option>
                  <option value="arabic">Arabic &amp; Middle Eastern</option>
                  <option value="english">English / US / UK</option>
                  <option value="european">European</option>
                  <option value="global">Global / International</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Protocol Type
                </label>
                <select
                  value={newTargetProtocol}
                  onChange={(e) => setNewTargetProtocol(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="sru">SRU (Search/Retrieve via URL - HTTP)</option>
                  <option value="z3950">Z39.50 (ISO 23950 Gateway)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  SRU Base URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="http://lx2.loc.gov:210/LCDB or https://.../api/sru"
                  value={newTargetUrl}
                  onChange={(e) => setNewTargetUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  CQL Query Template (Use {"{isbn}"})
                </label>
                <input
                  type="text"
                  value={newTargetTemplate}
                  onChange={(e) => setNewTargetTemplate(e.target.value)}
                  placeholder='bath.isbn="{isbn}" or isbn="{isbn}"'
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            {newTargetProtocol === "z3950" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Z39.50 Host
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. z3950.loc.gov"
                    value={newTargetHost}
                    onChange={(e) => setNewTargetHost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Port (Default: 210)
                  </label>
                  <input
                    type="number"
                    value={newTargetPort}
                    onChange={(e) => setNewTargetPort(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Database Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VOYAGER or LCDB"
                    value={newTargetDb}
                    onChange={(e) => setNewTargetDb(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Record Schema (MARCXML, DC, DCNDL)
                </label>
                <input
                  type="text"
                  value={newTargetSchema}
                  onChange={(e) => setNewTargetSchema(e.target.value)}
                  placeholder="marcxml"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Description / Institution Note
                </label>
                <input
                  type="text"
                  value={newTargetDesc}
                  onChange={(e) => setNewTargetDesc(e.target.value)}
                  placeholder="Library catalog holdings and special collections"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save &amp; Register Target
              </button>
            </div>
          </form>
        )}

        {/* Targets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredTargets.map((target) => {
            const result = queryResults[target.id];
            const isLoading = loadingTargets[target.id];
            const isXmlOpen = expandedXml[target.id];

            return (
              <div
                key={target.id}
                className={`p-4 rounded-xl border transition-all ${
                  target.enabled
                    ? "bg-slate-950/80 border-slate-800"
                    : "bg-slate-950/40 border-slate-900 opacity-60"
                }`}
              >
                {/* Target Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-[260px]">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={target.enabled}
                        onChange={() => toggleTarget(target.id, target.enabled)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                        title={target.enabled ? "Disable Target" : "Enable Target"}
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {target.name}
                        </span>
                        {target.nativeName && (
                          <span className="text-xs text-slate-400 font-sans">
                            ({target.nativeName})
                          </span>
                        )}

                        {/* Badges */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            target.region === "japanese"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : target.region === "arabic"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : target.region === "european"
                              ? "bg-violet-950 text-violet-300 border border-violet-800"
                              : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                          }`}
                        >
                          {target.region}
                        </span>

                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {target.protocol.toUpperCase()} {target.version}
                        </span>

                        {target.recordSchema && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                            Schema: {target.recordSchema}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {lang === "ja" && target.descriptionJa
                          ? target.descriptionJa
                          : lang === "ar" && target.descriptionAr
                          ? target.descriptionAr
                          : target.description}
                      </p>

                      {/* Technical Endpoint Specs */}
                      <div className="mt-2 text-[11px] font-mono text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80">
                        <div className="flex items-center gap-1 truncate max-w-md">
                          <span className="text-slate-400">SRU Endpoint:</span>
                          <span className="text-slate-300 truncate">{target.baseUrl}</span>
                        </div>
                        {target.z3950Host && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Z39.50:</span>
                            <span className="text-amber-300">
                              {target.z3950Host}:{target.z3950Port || 210}/{target.z3950Database || "DEFAULT"}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">CQL Template:</span>
                          <span className="text-indigo-300">{target.queryTemplate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Query Button */}
                  <div className="flex items-center gap-2 self-start shrink-0">
                    {target.docUrl && (
                      <a
                        href={target.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-800"
                        title="Official SRU/Z39.50 Standard Documentation"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleQuerySingleTarget(target)}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Test Query</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Query Result Card */}
                {result && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {result.status === "success" && (
                          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Record Matched ({result.recordCount} found)
                          </span>
                        )}
                        {result.status === "not_found" && (
                          <span className="flex items-center gap-1 text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-800 font-bold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            No matching record (0 hits)
                          </span>
                        )}
                        {result.status === "error" && (
                          <span className="flex items-center gap-1 text-rose-400 bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-800 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            Gateway Unreachable / Timed out
                          </span>
                        )}

                        {result.latencyMs !== undefined && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            Response: {result.latencyMs}ms
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {result.rawXml && (
                          <button
                            onClick={() =>
                              setExpandedXml((prev) => ({
                                ...prev,
                                [target.id]: !prev[target.id],
                              }))
                            }
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-colors"
                          >
                            <Code2 className="w-3 h-3" />
                            <span>{isXmlOpen ? "Hide Raw XML" : "Inspect Raw MARCXML"}</span>
                            {isXmlOpen ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Error Diagnostic */}
                    {result.status === "error" && (
                      <p className="text-rose-300 text-[11px] bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60 mt-1">
                        {result.errorMessage}
                      </p>
                    )}

                    {/* Extracted Bibliographic Fields if present */}
                    {result.extractedData && result.status === "success" && (
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {result.extractedData.title && (
                          <div className="col-span-1 md:col-span-2">
                            <span className="text-slate-400 text-[10px] block">Extracted Title:</span>
                            <span className="font-semibold text-slate-100 text-xs">
                              {result.extractedData.title}
                            </span>
                          </div>
                        )}
                        {result.extractedData.authors && result.extractedData.authors.length > 0 && (
                          <div>
                            <span className="text-slate-400 text-[10px] block">Authors:</span>
                            <span className="text-slate-200">
                              {result.extractedData.authors.join(", ")}
                            </span>
                          </div>
                        )}
                        {result.extractedData.publisher && (
                          <div>
                            <span className="text-slate-400 text-[10px] block">Publisher &amp; Year:</span>
                            <span className="text-slate-200">
                              {result.extractedData.publisher} {result.extractedData.publicationYear ? `(${result.extractedData.publicationYear})` : ""}
                            </span>
                          </div>
                        )}
                        {result.extractedData.lccn && (
                          <div>
                            <span className="text-slate-400 text-[10px] block">LC Card Number (LCCN):</span>
                            <span className="font-mono text-indigo-400 font-semibold">
                              {result.extractedData.lccn}
                            </span>
                          </div>
                        )}
                        {result.extractedData.lcc && (
                          <div>
                            <span className="text-slate-400 text-[10px] block">LC Call Number (LCC):</span>
                            <span className="font-mono text-slate-200">
                              {result.extractedData.lcc}
                            </span>
                          </div>
                        )}
                        {result.extractedData.ndc && (
                          <div>
                            <span className="text-slate-400 text-[10px] block">Nippon Decimal (NDC):</span>
                            <span className="font-mono text-rose-300 font-semibold">
                              {result.extractedData.ndc}
                            </span>
                          </div>
                        )}
                        {result.extractedData.dewey && (
                          <div>
                            <span className="text-slate-400 text-[10px] block">Dewey Decimal (DDC):</span>
                            <span className="font-mono text-emerald-300 font-semibold">
                              {result.extractedData.dewey}
                            </span>
                          </div>
                        )}
                        {result.extractedData.subjects && result.extractedData.subjects.length > 0 && (
                          <div className="col-span-1 md:col-span-2">
                            <span className="text-slate-400 text-[10px] block">LCSH / Subject Headings:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {result.extractedData.subjects.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Raw XML Inspector */}
                    {isXmlOpen && result.rawXml && (
                      <div className="mt-2 relative">
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-800 text-[11px] text-slate-400">
                          <span>Raw XML Payload ({result.rawXml.length} bytes)</span>
                          <button
                            onClick={() => copyXmlToClipboard(target.id, result.rawXml!)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            {copiedTargetXml === target.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy XML</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-slate-950 rounded-b-lg border border-slate-800 overflow-x-auto font-mono text-[11px] text-cyan-300 max-h-56 leading-relaxed select-all">
                          {result.rawXml}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              All registered SRU &amp; Z39.50 targets are automatically integrated into deep multi-source bibliographic crawls.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
