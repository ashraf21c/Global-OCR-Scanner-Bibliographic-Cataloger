import React, { useEffect, useState } from "react";
import {
  Sliders,
  Key,
  Shield,
  Gauge,
  Database,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Activity,
  Layers,
  X,
} from "lucide-react";
import { ControlPanelConfig, RequestMetrics } from "../types/book";
import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface ControlPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: UiLanguage;
}

export const ControlPanelModal: React.FC<ControlPanelModalProps> = ({
  isOpen,
  onClose,
  lang = "en",
}) => {
  const t = TRANSLATIONS[lang];
  const [config, setConfig] = useState<ControlPanelConfig>({
    rateLimitPerMinute: 30,
    hasGoogleCseKey: false,
    hasGoogleCseCx: false,
    hasAmazonPaApi: false,
    hasWorldcatKey: false,
    cacheEnabled: true,
    cachedRecordsCount: 0,
  });

  const [metrics, setMetrics] = useState<RequestMetrics>({
    totalLookups: 0,
    totalOcr: 0,
    totalCrawls: 0,
    cacheHits: 0,
    lastRequestTime: "",
  });

  // Inputs for editing keys
  const [rateLimit, setRateLimit] = useState<number>(30);
  const [googleCseKey, setGoogleCseKey] = useState<string>("");
  const [googleCseCx, setGoogleCseCx] = useState<string>("");
  const [amazonPaApiKey, setAmazonPaApiKey] = useState<string>("");
  const [amazonPaApiSecret, setAmazonPaApiSecret] = useState<string>("");
  const [amazonAssociateTag, setAmazonAssociateTag] = useState<string>("");
  const [worldcatKey, setWorldcatKey] = useState<string>("");
  const [cacheEnabled, setCacheEnabled] = useState<boolean>(true);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch current config & metrics
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/control-panel");
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setMetrics(data.metrics);
        setRateLimit(data.config.rateLimitPerMinute || 30);
        setCacheEnabled(data.config.cacheEnabled ?? true);
      }
    } catch (e) {
      console.error("Failed to load control panel config:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    try {
      const payload: any = {
        rateLimitPerMinute: Number(rateLimit),
        cacheEnabled,
      };

      if (googleCseKey.trim()) payload.googleCseApiKey = googleCseKey.trim();
      if (googleCseCx.trim()) payload.googleCseCx = googleCseCx.trim();
      if (amazonPaApiKey.trim()) payload.amazonPaApiKey = amazonPaApiKey.trim();
      if (amazonPaApiSecret.trim()) payload.amazonPaApiSecret = amazonPaApiSecret.trim();
      if (amazonAssociateTag.trim()) payload.amazonAssociateTag = amazonAssociateTag.trim();
      if (worldcatKey.trim()) payload.worldcatApiKey = worldcatKey.trim();

      const res = await fetch("/api/control-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatusMessage("Settings updated successfully!");
        fetchConfig();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      setStatusMessage("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm("Are you sure you want to flush all cached catalog records?")) return;
    try {
      await fetch("/api/control-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearCache: true }),
      });
      fetchConfig();
      setStatusMessage("Catalog cache flushed.");
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (e: any) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  // Estimated cost calculation (based on commercial API rates if paid without free tier)
  const estimatedSavings = (
    (metrics.totalLookups * 0.005 + metrics.cacheHits * 0.01)
  ).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">
                {t.cpTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.cpSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          {/* Metrics & Usage Monitoring Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Usage &amp; API Cost Metrics
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                Active &amp; Throttled
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Total Lookups:</span>
                <span className="font-mono text-lg font-bold text-white">
                  {metrics.totalLookups}
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Exact OCRs:</span>
                <span className="font-mono text-lg font-bold text-amber-300">
                  {metrics.totalOcr}
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Deep Crawls:</span>
                <span className="font-mono text-lg font-bold text-indigo-300">
                  {metrics.totalCrawls}
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Cache Hits:</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {metrics.cacheHits}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Estimated Deduplication Savings:{" "}
                <strong className="text-emerald-300">${estimatedSavings}</strong>
              </span>
              <span>{config.cachedRecordsCount} records currently cached in memory</span>
            </div>
          </div>

          {/* Form for Settings & Credentials */}
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            {/* Rate Limiting Section */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-indigo-400" />
                  Crawler Rate Limiting Dial
                </label>
                <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {rateLimit} requests / minute
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 mt-2 block">
                Controls the maximum crawling rate across Amazon Japan, Neelwafurat, Abjad, and WorldCat to prevent IP blocking and respect website terms.
              </span>
            </div>

            {/* Google Custom Search Engine (CSE) for Web Crawling */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  Google Custom Search Engine (CSE) Credentials
                </span>
                <span className="text-[10px] text-slate-400">
                  Optional scraper accelerator
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Google Custom Search API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={googleCseKey}
                    onChange={(e) => setGoogleCseKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Search Engine ID (CX)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0123456789:abcdefgh"
                    value={googleCseCx}
                    onChange={(e) => setGoogleCseCx(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Amazon PA-API Credentials */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-rose-400" />
                  Amazon Product Advertising API (PA-API)
                </span>
                <span className="text-[10px] text-slate-400">
                  For Amazon Japan commercial pricing &amp; covers
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Access Key ID
                  </label>
                  <input
                    type="text"
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    value={amazonPaApiKey}
                    onChange={(e) => setAmazonPaApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Secret Access Key
                  </label>
                  <input
                    type="password"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={amazonPaApiSecret}
                    onChange={(e) => setAmazonPaApiSecret(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Associate Tag
                  </label>
                  <input
                    type="text"
                    placeholder="amazonjp-22"
                    value={amazonAssociateTag}
                    onChange={(e) => setAmazonAssociateTag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Cache Control & Reset */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  In-Memory High-Speed Cache
                </span>
                <span className="text-[11px] text-slate-400">
                  Deduplicates API requests and speeds up repeat scans.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Cache
                </button>
              </div>
            </div>

            {statusMessage && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Save Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
