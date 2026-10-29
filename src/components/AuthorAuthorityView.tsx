import React from "react";
import { BookRecord, AuthorRecord } from "../types/book";
import {
  UserCheck,
  Globe,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Layers,
  Sparkles,
  Link2,
} from "lucide-react";
import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface AuthorAuthorityViewProps {
  book: BookRecord;
  lang?: UiLanguage;
}

export const AuthorAuthorityView: React.FC<AuthorAuthorityViewProps> = ({
  book,
  lang = "en",
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t.authorityTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {t.authoritySubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.authorityBadge}</span>
        </div>
      </div>

      {/* Author cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {book.authors.map((author: AuthorRecord, idx: number) => (
          <div
            key={idx}
            className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {author.role || (lang === "ja" ? "著者" : lang === "ar" ? "مؤلف" : "Author")}
                </span>
                <span className="text-[11px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                  {t.authorRecordNum} #{idx + 1}
                </span>
              </div>

              {/* Native & Transliterated Names */}
              <div className="text-xl font-bold text-white">
                {author.name}
              </div>
              {author.transliteratedName && author.transliteratedName !== author.name && (
                <div className="text-sm text-slate-400 font-serif italic mt-0.5">
                  {t.transliterationLabel}: {author.transliteratedName}
                </div>
              )}
            </div>

            {/* Authority Links */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                {t.connectedAuthorityIds}:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {author.viafId ? (
                  <a
                    href={`http://viaf.org/viaf/${author.viafId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-lg text-xs font-mono border border-slate-800 transition-colors"
                  >
                    <span>{t.viafBadge}: {author.viafId}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="px-2 py-1 bg-slate-900/60 text-slate-500 rounded text-xs font-mono">
                    {lang === "ja" ? "VIAF 未登録" : lang === "ar" ? "قيد الانتظار VIAF" : "VIAF Pending"}
                  </span>
                )}

                {author.ndlId ? (
                  <a
                    href={`https://id.ndl.go.jp/auth/ndlna/${author.ndlId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 rounded-lg text-xs font-mono border border-rose-900/50 transition-colors"
                  >
                    <span>{t.ndlAuthorityBadge}: {author.ndlId}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="px-2 py-1 bg-slate-900/60 text-slate-500 rounded text-xs font-mono">
                    {lang === "ja" ? "NDL 未登録" : lang === "ar" ? "سجل محلي NDL" : "NDL Local Record"}
                  </span>
                )}

                {author.locId ? (
                  <a
                    href={`https://id.loc.gov/authorities/names/${author.locId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 rounded-lg text-xs font-mono border border-amber-900/50 transition-colors"
                  >
                    <span>{t.locNacoBadge}: {author.locId}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="px-2 py-1 bg-slate-900/60 text-slate-500 rounded text-xs font-mono">
                    {lang === "ja" ? "LOC 未登録" : lang === "ar" ? "سجل محلي LOC" : "LOC Catalog Ref"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Referencing between all database records */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">
            {t.matrixTitle}
          </h4>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {t.matrixDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">
              {lang === "ja" ? "日本のISBN4 & 13:" : lang === "ar" ? "ردمك الياباني 4 و 13:" : "Japanese ISBN4 & 13:"}
            </span>
            <span className="font-mono font-semibold text-slate-200">
              {book.identifiers.japaneseIsbn4 || book.identifiers.isbn13 || "N/A"}
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">
              {lang === "ja" ? "日本図書コード（Cコード）:" : lang === "ar" ? "رمز C الياباني:" : "Japanese C-Code:"}
            </span>
            <span className="font-mono font-semibold text-rose-300">
              {book.identifiers.cCode || (lang === "ja" ? "なし（標準書籍）" : lang === "ar" ? "بدون رمز C" : "None (Standard Book)")}
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">
              {lang === "ja" ? "米国議会図書館（LCCN）:" : lang === "ar" ? "مكتبة الكونغرس (LCCN):" : "Library of Congress (LCCN):"}
            </span>
            <span className="font-mono font-semibold text-amber-300">
              {book.identifiers.lccn || (lang === "ja" ? "出版時目録データ" : lang === "ar" ? "الفهرسة أثناء النشر" : "Cataloging in Publication")}
            </span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">
              {lang === "ja" ? "WorldCat OCLC 番号:" : lang === "ar" ? "رقم OCLC في وورلد كات:" : "WorldCat OCLC:"}
            </span>
            <span className="font-mono font-semibold text-indigo-300">
              {book.identifiers.oclc || (lang === "ja" ? "OCLC 照合可能" : lang === "ar" ? "مطابقة OCLC متاحة" : "OCLC Match Available")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
