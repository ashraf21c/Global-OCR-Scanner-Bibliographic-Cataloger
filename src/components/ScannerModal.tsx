import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  Flashlight,
  FlashlightOff,
  RefreshCw,
  Upload,
  ScanLine,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { playScanSuccessBeep, playOcrCompleteChime } from "../utils/audioFeedback";
import { parseBookIdentifier, decodeCCode } from "../utils/isbnUtils";
import { OcrResult } from "../types/book";
import { TRANSLATIONS, UiLanguage } from "../utils/translations";

interface ScannerModalProps {
  onScanResult: (identifier: string, ocrDetails?: OcrResult) => void;
  isProcessing?: boolean;
  onOpenCustomModal?: () => void;
  lang?: UiLanguage;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  onScanResult,
  isProcessing = false,
  onOpenCustomModal,
  lang = "en",
}) => {
  const t = TRANSLATIONS[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scanMode, setScanMode] = useState<"barcode" | "ocr">("barcode");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual input state
  const [manualInput, setManualInput] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [lastDetected, setLastDetected] = useState<string | null>(null);
  const [secondaryDetected, setSecondaryDetected] = useState<string | null>(null); // e.g. Japanese C-Code

  const streamRef = useRef<MediaStream | null>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Localized presets for quick testing
  const samplePresets = [
    {
      label:
        lang === "ja"
          ? "🇯🇵 日本のISBN4（こころ）"
          : lang === "ar"
          ? "🇯🇵 ردمك ياباني كلاسيكي ISBN4 (كوكورو)"
          : "🇯🇵 Japanese ISBN4 (Kokoro)",
      code: "ISBN4-00-310101-4",
      desc:
        lang === "ja"
          ? "夏目漱石 - 岩波文庫（伝統的なISBN4形式）"
          : lang === "ar"
          ? "ناتسومي سوسيكي - طبعة إيوانامي بونكو الكلاسيكية"
          : "Natsume Sōseki - Iwanami Bunko (Classic Japanese ISBN4)",
    },
    {
      label:
        lang === "ja"
          ? "🇯🇵 2段バーコード（1Q84）"
          : lang === "ar"
          ? "🇯🇵 الباركود المزدوج الياباني (1Q84)"
          : "🇯🇵 Dual Barcode (1Q84)",
      code: "9784101001593",
      secondary: "1920193005806", // C0193 \580E
      desc:
        lang === "ja"
          ? "村上春樹 - 新潮社（下段Cコード C0193・本体定価¥580）"
          : lang === "ar"
          ? "هاروكي موراكامي - شينشوشا (يشمل رمز C0193 وسعر الين)"
          : "Haruki Murakami - Shinchosha (Includes C-Code C0193)",
    },
    {
      label:
        lang === "ja"
          ? "🇪🇬 アラビア文学古典（バイナル・カスレイン）"
          : lang === "ar"
          ? "🇪🇬 كلاسيكيات الأدب العربي (بين القصرين)"
          : "🇪🇬 Arabic Classic (Palace Walk)",
      code: "9789770902345",
      desc:
        lang === "ja"
          ? "ナギーブ・マフフーズ - 総合目録・アブジャド・NWF"
          : lang === "ar"
          ? "نجيب محفوظ - دار الشروق / نيل وفرات / أبجد"
          : "Naguib Mahfouz - Dar El Shorouk / Neelwafurat / Abjad",
    },
    {
      label:
        lang === "ja"
          ? "🇪🇬 翻訳書目（韓国の物語：理解と文化）"
          : lang === "ar"
          ? "🇪🇬 المركز القومي للترجمة (قصة كوريا)"
          : "🇪🇬 National Center for Translation (Story of Korea)",
      code: "9789779224664",
      desc:
        lang === "ja"
          ? "チェ・ジュンシク / マフムード・アブデルガッファール訳 - エジプト国立翻訳センター（2022年）"
          : lang === "ar"
          ? "تشوي جون شيك / تر: د. محمود عبد الغفار - المركز القومي للترجمة ونيل وفرات"
          : "Choi Joon-shik / Tr: Mahmoud Abdel Ghaffar - National Center for Translation & NWF",
    },
    {
      label:
        lang === "ja"
          ? "🇸🇦 アラブ統合目録 / KFNL（日々）"
          : lang === "ar"
          ? "🇸🇦 الفهرس العربي الموحد / مكتبة الملك فهد (الأيام)"
          : "🇸🇦 Arab Union Catalog / KFNL (The Days)",
      code: "9789770267239",
      desc:
        lang === "ja"
          ? "ターハー・フセイン - アラブ統一目録（AUC）およびキング・ファハド国立図書館"
          : lang === "ar"
          ? "طه حسين - الفهرس العربي الموحد ومكتبة الملك فهد الوطنية"
          : "Taha Hussein - Arabic Union Catalog (AUC) & King Fahd National Library",
    },
    {
      label:
        lang === "ja"
          ? "🏛️ ヒンダウィ財団 / エジプト国立図書館（歴史序説）"
          : lang === "ar"
          ? "🏛️ مؤسسة هنداوي / دار الكتب المصرية (المقدمة)"
          : "🏛️ Hindawi / Dar El Kotob (Muqaddimah)",
      code: "9789777196024",
      desc:
        lang === "ja"
          ? "イブン・ハルドゥーン - エジプト国立図書館・ヒンダウィ"
          : lang === "ar"
          ? "ابن خلدون - مؤسسة هنداوي ودار الكتب المصرية"
          : "Ibn Khaldun - Hindawi Foundation & Egyptian National Library",
    },
    {
      label:
        lang === "ja"
          ? "🏛️ 米国議会図書館（LCCN）"
          : lang === "ar"
          ? "🏛️ رقم بطاقة مكتبة الكونغرس (LCCN)"
          : "🏛️ Library of Congress (LCCN)",
      code: "2001-012345",
      desc:
        lang === "ja"
          ? "米国議会図書館の管理カード番号"
          : lang === "ar"
          ? "معرف الفهرسة في مكتبة الكونغرس الأمريكية"
          : "US Library of Congress Catalog Identifier",
    },
    {
      label:
        lang === "ja"
          ? "🌐 旧規格9桁 SBN"
          : lang === "ar"
          ? "🌐 ترقيم SBN القديم المكون من 9 أرقام"
          : "🌐 Legacy 9-digit SBN",
      code: "SBN-85364-001-9",
      desc:
        lang === "ja"
          ? "ISBN以前の英国・国際9桁規格"
          : lang === "ar"
          ? "المعيار البريطاني والدولي المعتمد قبل ردمك"
          : "Pre-ISBN 9-digit British/International format",
    },
    {
      label:
        lang === "ja"
          ? "📰 アラビア雑誌（ مجلة العربي - クウェート）"
          : lang === "ar"
          ? "📰 مجلة ثقافية شهرية (مجلة العربي - الكويت)"
          : "📰 Arabic Monthly Magazine (Al-Arabi - Kuwait)",
      code: "0002-3973",
      desc:
        lang === "ja"
          ? "ISSN 0002-3973 • クウェート情報省発行の代表的文化総合月刊誌（1958年創刊）"
          : lang === "ar"
          ? "ردمد 0002-3973 • تصدر عن وزارة الإعلام الكويتية منذ 1958 وتوزع في كافة الدول العربية"
          : "ISSN 0002-3973 • Famous illustrated cultural monthly published since 1958",
    },
    {
      label:
        lang === "ja"
          ? "📰 日本の総合月刊誌（文藝春秋 - 芥川賞発表）"
          : lang === "ar"
          ? "📰 مجلة يابانية فكرية وأدبية (بونغي شونجو - جائزة أكوتاغاوا)"
          : "📰 Japanese Monthly Magazine (Bungeishunju)",
      code: "0407-7601",
      desc:
        lang === "ja"
          ? "ISSN 0407-7601 • 菊池寛創刊・芥川賞受賞作および選評全文掲載の総合月刊誌"
          : lang === "ar"
          ? "ردمد 0407-7601 • أسسها كيكوتشي كان 1923، وتعلن فيها جائزة أكوتاغاوا الأدبية"
          : "ISSN 0407-7601 • Renowned literary & political monthly, awards Akutagawa Prize",
    },
    {
      label:
        lang === "ja"
          ? "🔬 国際学術定期刊行物（Nature）"
          : lang === "ar"
          ? "🔬 دورية علمية دولية أسبوعية (Nature)"
          : "🔬 International Scientific Journal (Nature)",
      code: "0028-0836",
      desc:
        lang === "ja"
          ? "ISSN 0028-0836 • 1869年創刊の世界最高峰の総合科学学術誌（週刊）"
          : lang === "ar"
          ? "ردمد 0028-0836 • أبرز دورية علمية محكمة أسبوعية في العالم (تأسست 1869)"
          : "ISSN 0028-0836 • World's leading multidisciplinary science journal (weekly)",
    },
  ];

  // Initialize camera
  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setHasTorch(Boolean(capabilities.torch));
      }

      setCameraActive(true);
      startBarcodeLoop();
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setErrorMessage(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in your browser or use the file upload / manual input below."
          : `Camera error: ${err.message || "Could not start camera."}`
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchActive(false);
  };

  // Toggle flashlight / torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const nextState = !torchActive;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchActive(nextState);
      } catch (e) {
        console.warn("Torch toggle failed:", e);
      }
    }
  };

  // Flip camera between back and front
  const switchCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Barcode scanning loop using BarcodeDetector if supported, fallback to ZXing
  const startBarcodeLoop = () => {
    let lastScanTime = 0;

    const checkBarcode = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(checkBarcode);
        return;
      }

      const now = Date.now();
      // Scan every 200ms to keep CPU light
      if (now - lastScanTime > 200) {
        lastScanTime = now;

        // Try native BarcodeDetector if available
        if ("BarcodeDetector" in window) {
          try {
            const detector = new (window as any).BarcodeDetector({
              formats: [
                "ean_13",
                "ean_8",
                "qr_code",
                "code_128",
                "code_39",
                "upc_a",
                "upc_e",
                "data_matrix",
              ],
            });
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              handleDetectedBarcodes(barcodes.map((b: any) => b.rawValue));
            }
          } catch (e) {
            // Fallback to ZXing
            scanWithZXing();
          }
        } else {
          // Native detector unavailable, use ZXing
          scanWithZXing();
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkBarcode);
    };

    animationFrameRef.current = requestAnimationFrame(checkBarcode);
  };

  const scanWithZXing = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    try {
      if (!zxingReaderRef.current) {
        zxingReaderRef.current = new BrowserMultiFormatReader();
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const result = await zxingReaderRef.current.decodeFromCanvas(canvas);
      if (result && result.getText()) {
        handleDetectedBarcodes([result.getText()]);
      }
    } catch (e) {
      // Normal when no barcode in frame
    }
  };

  // Handle scanned barcodes (supporting Japanese dual barcodes: 9784... top, 192... bottom)
  const handleDetectedBarcodes = (values: string[]) => {
    for (const val of values) {
      const parsed = parseBookIdentifier(val);

      if (parsed.type === "Dual-Barcode-CCode") {
        // Japanese 2nd barcode: C-Code + price
        setSecondaryDetected(val);
        playScanSuccessBeep();
      } else if (parsed.isbn13 || parsed.isbn10 || parsed.type === "Japanese-ISBN4") {
        const id = parsed.isbn13 || parsed.isbn10 || val;
        if (id !== lastDetected) {
          setLastDetected(id);
          playScanSuccessBeep();
          onScanResult(id);
        }
      } else if (val && val !== lastDetected) {
        setLastDetected(val);
        playScanSuccessBeep();
        onScanResult(val);
      }
    }
  };

  // Take Snapshot & run Exact OCR
  const captureAndOcr = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setOcrLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL("image/jpeg", 0.9);
      await runExactOcr(base64);
    } catch (e: any) {
      setErrorMessage("OCR capture failed: " + e.message);
    } finally {
      setOcrLoading(false);
    }
  };

  // Run Exact OCR on Base64 image
  const runExactOcr = async (imageBase64: string) => {
    setOcrLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/book/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: "image/jpeg" }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        if (data.result.quotaLimited) {
          setErrorMessage(
            data.result.quotaNotice ||
              "AI Vision Scanner reached its rate limit. Please use live barcode video scanning, quick test presets, or manual entry below."
          );
          return;
        }
        playOcrCompleteChime();
        const ocr: OcrResult = data.result;
        const targetId =
          ocr.primaryIdentifier || ocr.exactRawText || "UNKNOWN_IDENTIFIER";

        setLastDetected(targetId);
        if (ocr.cCode) {
          setSecondaryDetected(ocr.cCode);
        }

        onScanResult(targetId, ocr);
      } else {
        throw new Error(data.error || "No identifiable book text detected");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "OCR recognition error");
    } finally {
      setOcrLoading(false);
    }
  };

  // File Upload / Photo Drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        await runExactOcr(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Manual input submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    playScanSuccessBeep();
    onScanResult(manualInput.trim());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 mb-8">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <ScanLine className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {t.scannerTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.scannerSubtitle}
          </p>
        </div>

        {/* Scan Mode Toggle: Barcode Stream vs Exact OCR */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setScanMode("barcode")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scanMode === "barcode"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {t.tabBarcode}
          </button>
          <button
            onClick={() => setScanMode("ocr")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              scanMode === "ocr"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.tabOcr}
          </button>
        </div>
      </div>

      {/* Main Viewfinder / Interactive Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Video & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group shadow-inner">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Laser scan line & target reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="relative w-full max-w-sm h-48 border-2 border-indigo-400/70 rounded-2xl flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    {/* Corner accents */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-300" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-300" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-300" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-300" />

                    {/* Animated scanning laser line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse shadow-[0_0_8px_#ef4444]" />

                    <div className="text-center text-[11px] font-mono font-medium text-indigo-300/90 bg-slate-900/80 px-2 py-0.5 rounded-md self-center">
                      {lang === "ja"
                        ? "バーコード・日本ISBN4・奥付を枠内に合わせてください"
                        : lang === "ar"
                        ? "وجّه الكاميرا نحو الباركود أو ردمك الياباني أو صفحة العنوان"
                        : "Align Barcode, Japanese ISBN4 or Spine Identifier"}
                    </div>
                  </div>
                </div>

                {/* Top overlay controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-2 py-1.5 rounded-lg border border-slate-700/60">
                  {hasTorch && (
                    <button
                      onClick={toggleTorch}
                      title={t.torchToggle}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        torchActive
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {torchActive ? (
                        <Flashlight className="w-4 h-4" />
                      ) : (
                        <FlashlightOff className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={switchCameraFacing}
                    title={t.switchCamera}
                    className="p-1.5 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={stopCamera}
                    title={t.stopCamera}
                    className="p-1.5 text-slate-300 hover:text-red-400 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-8 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-md">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="max-w-xs">
                  <p className="font-semibold text-slate-200 text-sm">
                    {t.scanStatusReady}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.japaneseIsbn4Tip}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    {t.startCamera}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    {t.tabUpload}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons below viewfinder */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {cameraActive ? (
                <>
                  <button
                    onClick={captureAndOcr}
                    disabled={ocrLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    {ocrLoading ? t.analyzingBook : t.tabOcr}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {t.tabUpload}
                  </button>
                </>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {t.startCamera}
                </button>
              )}
            </div>

            {/* Quick status badge */}
            {lastDetected && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Detected: {lastDetected}</span>
                {secondaryDetected && (
                  <span className="text-amber-400 font-semibold">({secondaryDetected})</span>
                )}
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right column: Manual Input & One-Click Test Presets */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Direct Input Form */}
          <form
            onSubmit={handleManualSubmit}
            className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="book-id-input"
                className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                {t.tabManual}
              </label>
              <span className="text-[11px] text-slate-400">
                {lang === "ja"
                  ? "ハイフン・英数字の全形式に対応"
                  : lang === "ar"
                  ? "جميع التنسيقات والأرقام والشرطات"
                  : "Any format, hyphens or letters"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="book-id-input"
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={t.manualPlaceholder}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={isProcessing || !manualInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                {t.manualLookupBtn}
              </button>
            </div>

            {manualInput.trim() && parseBookIdentifier(manualInput).type === "ISSN" && (
              <div className="flex items-center gap-1.5 text-[11px] text-teal-300 bg-teal-950/60 border border-teal-800/80 px-2.5 py-1 rounded-lg">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>
                  {lang === "ja"
                    ? "📰 ISSN（逐次刊行物・雑誌コード）を検出"
                    : lang === "ar"
                    ? "📰 تم اكتشاف ردمد (ISSN) لدورية أو مجلة مستمرة"
                    : "📰 ISSN (Magazine / Periodical Identifier) Detected"}
                </span>
              </div>
            )}

            {onOpenCustomModal && (
              <button
                type="button"
                onClick={onOpenCustomModal}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1 font-medium transition-colors cursor-pointer"
              >
                <span>
                  {lang === "ja"
                    ? "未採録の書籍・雑誌を手動登録、またはJSON5一括インポート →"
                    : lang === "ar"
                    ? "الكتاب أو المجلة غير متوفرة في الفهارس؟ أضف سجلاً يدويًا أو استورد عبر JSON5 ←"
                    : "Unindexed book or magazine? Add custom record or import via JSON5 →"}
                </span>
              </button>
            )}
          </form>

          {/* Quick One-Click Benchmark Identifiers */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300">
                {t.presetsTitle}
              </span>
              <span className="text-[10px] text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-800/40">
                {lang === "ja" ? "1クリック照会" : lang === "ar" ? "فحص بنقرة واحدة" : "1-Click Test"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setManualInput(preset.code);
                    playScanSuccessBeep();
                    onScanResult(preset.code);
                  }}
                  className="text-left p-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {preset.label}
                    </span>
                    <span className="text-[11px] font-mono text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {preset.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
