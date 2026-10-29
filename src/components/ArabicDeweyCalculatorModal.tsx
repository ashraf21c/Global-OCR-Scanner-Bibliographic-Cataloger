import React, { useState } from "react";
import {
  Compass,
  ArrowRightLeft,
  BookOpen,
  Check,
  Sparkles,
  HelpCircle,
  Hash,
  X,
  Layers,
  Search,
} from "lucide-react";
import {
  ARABIC_DEWEY_MAIN_CLASSES,
  ARABIC_DEWEY_DIVISIONS,
  convertStandardDeweyToArabicDewey,
  convertArabicDeweyToStandardDewey,
  getArabicDeweyBreakdown,
} from "../utils/arabicDeweyUtils";
import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface ArabicDeweyCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyClassification?: (arabicDewey: string, arabicName: string) => void;
  initialCode?: string;
  lang?: UiLanguage;
}

export const ArabicDeweyCalculatorModal: React.FC<ArabicDeweyCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyClassification,
  initialCode = "892.73",
  lang = "en",
}) => {
  const t = TRANSLATIONS[lang];
  const [inputCode, setInputCode] = useState<string>(initialCode);
  const [conversionDirection, setConversionDirection] = useState<"std_to_arab" | "arab_to_std">("std_to_arab");
  const [selectedMainClass, setSelectedMainClass] = useState<string>("800");

  if (!isOpen) return null;

  // Real-time calculation
  let calculatedArabicDewey = "";
  let calculatedStandardDdc = "";
  let calculatedLabel = "";
  let breakdown: any = null;

  if (conversionDirection === "std_to_arab") {
    const res = convertStandardDeweyToArabicDewey(inputCode);
    calculatedArabicDewey = res.arabicDewey;
    calculatedLabel = res.arabicName;
    breakdown = getArabicDeweyBreakdown(res.arabicDewey);
  } else {
    calculatedStandardDdc = convertArabicDeweyToStandardDewey(inputCode);
    breakdown = getArabicDeweyBreakdown(inputCode);
    calculatedLabel = breakdown.fullArabicLabel;
  }

  // Quick Preset Conversions
  const presetConversions = [
    { std: "892.73", arab: "813", label: "الرواية والقصة العربية (Arabic Fiction)" },
    { std: "892.71", arab: "811", label: "الشعر العربي (Arabic Poetry)" },
    { std: "892.72", arab: "812", label: "المسرحية العربية (Arabic Drama)" },
    { std: "492.75", arab: "415", label: "النحو العربي والإعراب (Arabic Grammar)" },
    { std: "492.73", arab: "413", label: "المعاجم والقواميس العربية (Dictionaries)" },
    { std: "297.1", arab: "211", label: "علوم القرآن والتفسير (Quranic Studies)" },
    { std: "297.2", arab: "212", label: "الحديث النبوي الشريف (Hadith)" },
    { std: "297.4", arab: "214", label: "الفقه الإسلامي وأصوله (Islamic Fiqh)" },
    { std: "297.3", arab: "213", label: "العقيدة وعلم الكلام (Theology / Kalam)" },
    { std: "953", arab: "953", label: "تاريخ شبه الجزيرة العربية (Arabian Peninsula)" },
  ];

  const handleApply = () => {
    if (onApplyClassification) {
      const codeToApply =
        conversionDirection === "std_to_arab"
          ? calculatedArabicDewey
          : inputCode;
      onApplyClassification(codeToApply, calculatedLabel);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{t.adModalTitle}</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                  ALECSO / AUC
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.adModalSubtitle}
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

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          {/* Explanation Banner */}
          <div className="bg-emerald-950/30 border border-emerald-800/50 p-4 rounded-xl text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-200">
                {t.adExplanationTitle}
              </p>
              <p className="mt-1 text-slate-400 leading-relaxed">
                {t.adExplanationBody}
              </p>
            </div>
          </div>

          {/* Interactive Calculator Form */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                {t.adDirectionLabel}
              </span>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setConversionDirection("std_to_arab")}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    conversionDirection === "std_to_arab"
                      ? "bg-emerald-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.adStdToArab}
                </button>
                <button
                  onClick={() => setConversionDirection("arab_to_std")}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    conversionDirection === "arab_to_std"
                      ? "bg-emerald-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.adArabToStd}
                </button>
              </div>
            </div>

            {/* Input & Output Result Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {conversionDirection === "std_to_arab"
                    ? "رمز تصنيف ديوي القياسي (Standard DDC Notation):"
                    : "رمز تصنيف ديوي العربي (Arabic Dewey 10 Notation):"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="e.g. 892.73, 492.75, 297.1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                    DDC
                  </span>
                </div>
              </div>

              {/* Converted Output Card */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                  {conversionDirection === "std_to_arab"
                    ? "الرمز في تصنيف ديوي العربي (Arabic Dewey 10)"
                    : "الرمز القياسي المكافئ (Standard DDC Equivalent)"}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-2xl font-black text-white">
                    {conversionDirection === "std_to_arab"
                      ? calculatedArabicDewey || "---"
                      : calculatedStandardDdc || "---"}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-300 mt-1 truncate">
                  {calculatedLabel}
                </span>
              </div>
            </div>

            {/* Hierarchical Breakdown Box */}
            {breakdown && (
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 text-xs flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">
                  التفريغ الهرمي للتصنيف (Classification Hierarchy):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">الأصل الرئيسي (Main Class):</span>
                    <span className="font-semibold text-slate-200">
                      {breakdown.mainClass.code} - {breakdown.mainClass.name}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">القسم الفرعي (Division):</span>
                    <span className="font-semibold text-emerald-300">
                      {breakdown.division.code} - {breakdown.division.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Benchmark Presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
              أمثلة معتمدة للتحويل الفوري (Common Benchmark Conversions):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetConversions.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputCode(p.std);
                    setConversionDirection("std_to_arab");
                  }}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                      {p.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <span>Standard: {p.std}</span>
                      <span>&rarr;</span>
                      <span className="text-emerald-400 font-bold">Arabic: {p.arab}</span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    &larr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 10 Main Classes Reference Grid */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
              {t.adMainClassesTitle}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(ARABIC_DEWEY_MAIN_CLASSES).map(([code, val]) => (
                <button
                  key={code}
                  onClick={() => {
                    setInputCode(code);
                    setConversionDirection("arab_to_std");
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    inputCode.startsWith(code.charAt(0))
                      ? "bg-emerald-950/60 border-emerald-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono font-bold text-xs text-emerald-400 block">
                    {code}
                  </span>
                  <span className="text-[11px] line-clamp-2 leading-tight mt-0.5">
                    {lang === "ja"
                      ? val.japaneseName
                      : lang === "ar"
                      ? val.arabicName
                      : val.englishName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Apply Button */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {lang === "ja" ? "適用対象:" : lang === "ar" ? "الهدف المحدد:" : "Current Target:"}{" "}
            <strong className="text-emerald-300 font-mono">
              {conversionDirection === "std_to_arab" ? calculatedArabicDewey : inputCode}
            </strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              {lang === "ja" ? "閉じる" : lang === "ar" ? "إغلاق" : "Close"}
            </button>
            {onApplyClassification && (
              <button
                onClick={handleApply}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {t.adApplyBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
