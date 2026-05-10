import React, { useState, useCallback, useRef } from "react";
import { Upload, X, CheckCircle, Info, Activity, Heart, Apple, Star, MessageSquare, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeCowImage } from "../services/geminiService";
import { CowBreedAnalysis, Feedback } from "../types";

export default function Dashboard() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CowBreedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة صالح.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const data = await analyzeCowImage(image);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitFeedback = async () => {
    if (!rating) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: feedbackMsg, breed: result?.breed }),
      });
      alert("شكراً لمشاركتك! تم إرسال تقييمك بنجاح.");
      setRating(0);
      setFeedbackMsg("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] pb-20 font-sans">
      {/* Header / Navigation */}
      <nav className="h-16 px-8 flex items-center justify-between border-b border-[#DED9D1] glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4A5D4E] rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight">Bovinsight <span className="text-[#A68A64]">AI</span></span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-semibold text-[#5A635C] uppercase tracking-widest">
          <span className="text-[#4A5D4E] border-b-2 border-[#4A5D4E] pb-1 cursor-pointer">لوحة التحكم</span>
          <span className="hover:text-[#4A5D4E] cursor-pointer">التحليلات</span>
          <span className="hover:text-[#4A5D4E] cursor-pointer">السجل</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-tight">د. أحمد صالح</p>
            <p className="text-[10px] text-[#A68A64]">مدير المزرعة</p>
          </div>
          <div className="w-10 h-10 bg-[#E8E1D6] rounded-full border-2 border-white shadow-sm flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#4A5D4E]" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Identification */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-[0_4px_24px_-4px_rgba(74,93,78,0.1)] flex-1 flex flex-col min-h-[500px]">
            <h2 className="font-serif text-2xl mb-6 text-[#2C332D]">تحديد السلالة</h2>
            
            {/* Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              className={`dashed-border bg-[#FDFBF7] rounded-2xl flex-1 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group hover:bg-[#F5F2ED] cursor-pointer
                ${image ? 'border-solid border-[#4A5D4E]' : ''}`}
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-[#A68A64]" />
                  </div>
                  <p className="font-semibold text-[#4A5D4E]">اسحب الصورة هنا أو <span className="underline">تصفح ملفاتك</span></p>
                  <p className="text-xs text-[#8E928E] mt-2">يدعم JPG, PNG (بحد أقصى 10 ميجا)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Quick Result Summary / Controls */}
            <div className="mt-6">
              {image && (
                <div className="flex gap-4 mb-4">
                  <button 
                    onClick={handleUpload}
                    disabled={isAnalyzing}
                    className="flex-1 bg-[#4A5D4E] text-white py-4 rounded-xl font-bold hover:bg-[#5A635C] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري التحليل...
                      </>
                    ) : (
                      "بدء التحليل بالفيديو/الذكاء"
                    )}
                  </button>
                  <button 
                    onClick={() => { setImage(null); setResult(null); setError(null); }}
                    className="p-4 rounded-xl bg-[#E8E1D6] text-[#4A5D4E] hover:bg-red-100 hover:text-red-600 transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {result && (
                <div className="flex items-center justify-between bg-[#F8F6F2] p-4 rounded-xl border border-[#E8E1D6] animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-4 text-right">
                    <div className="w-12 h-12 bg-[#4A5D4E] rounded-lg flex items-center justify-center text-white font-serif text-xl italic leading-none">
                      {result.breed.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-[#8E928E]">السلالة المكتشفة</p>
                      <p className="font-serif text-lg leading-tight text-[#4A5D4E]">{result.breed}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-tighter text-[#8E928E]">نسبة التأكد</p>
                    <p className="text-xl font-semibold text-[#4A5D4E]">{(result.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 mt-4"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: AI Insights */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="results-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6 h-full"
              >
                {/* AI Tip Card */}
                <div className="bg-[#4A5D4E] text-[#F5F2ED] rounded-3xl p-6 shadow-lg relative overflow-hidden">
                  <div className="absolute -left-4 -top-4 w-24 h-24 bg-white opacity-5 rounded-full"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-[#F5F2ED] p-1 rounded-md">
                      <Heart className="w-4 h-4 text-[#4A5D4E]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">المساعد البيطري الذكي</span>
                  </div>
                  <p className="font-serif text-lg leading-relaxed mb-4 italic text-right">
                    "{result.description}"
                  </p>
                  <div className="h-px bg-white/20 w-full mb-4"></div>
                  <button className="w-full bg-[#F5F2ED] text-[#4A5D4E] font-bold py-2 rounded-xl text-sm transition-all hover:bg-white shadow-md">
                    تحميل التقرير الكامل
                  </button>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <InsightMetric 
                    label="التغذية"
                    title="البروتين العالي"
                    content={result.nutrition}
                    border="border-[#A68A64]"
                  />
                  <InsightMetric 
                    label="التحويل"
                    title="معدل النمو"
                    content={result.conversionRate}
                    border="border-[#8E928E]"
                  />
                  <InsightMetric 
                    label="الصحة"
                    title="الحالة العامة"
                    content={result.healthCare}
                    border="border-[#4A5D4E]"
                    full
                  />
                </div>

                {/* Feedback Box */}
                <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#E8E1D6]">
                  <h3 className="font-serif text-lg mb-4 text-[#2C332D]">شاركنا رأيك في التقارير</h3>
                  <div className="flex gap-2 mb-4 justify-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => setRating(star)}
                        className={`p-1 transition-all ${rating >= star ? 'text-[#A68A64]' : 'text-neutral-200'}`}
                      >
                        <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder="اترك تعليقك هنا المساعدة في تطوير النظام..."
                    className="w-full bg-[#FDFBF7] rounded-xl p-3 text-xs focus:outline-none ring-1 ring-[#DED9D1] focus:ring-[#A68A64] h-20 mb-3 text-right"
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                  />
                  <button 
                    onClick={submitFeedback}
                    disabled={!rating}
                    className="w-full bg-[#E8E1D6] text-[#4A5D4E] py-2 rounded-xl text-xs font-bold hover:bg-[#DED9D1] transition-all disabled:opacity-50"
                  >
                    إرسال التقييم
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl shadow-soft"
              >
                <div className="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-6">
                  <Info className="w-8 h-8 text-[#8E928E]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#4A5D4E] mb-2">بانتظار البيانات الجينية</h3>
                <p className="text-xs text-[#8E928E] leading-relaxed max-w-xs">
                  بمجرد تحميل صورة سيقوم نظامنا الذكي بتحليل كافة المعايير الحيوية والغذائية للسلالة المختارة.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-10 px-8 bg-[#E8E1D6] border-t border-[#DED9D1] fixed bottom-0 w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#5A635C] z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4CAF50] rounded-full"></span>
            <span>ML Model: Active (v4.2)</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4CAF50] rounded-full"></span>
            <span>Gemini API: Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Session ID: BH-9941</span>
          <span className="hidden sm:inline">System Time: {new Date().toLocaleTimeString()} UTC</span>
        </div>
      </footer>
    </div>
  );
}

function InsightMetric({ label, title, content, border, full }: { label: string, title: string, content: string, border: string, full?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-[0_4px_24px_-4px_rgba(74,93,78,0.1)] border-t-4 ${border} ${full ? 'col-span-2' : ''} text-right transition-transform hover:-translate-y-1`}>
      <p className="text-[10px] font-bold text-[#8E928E] uppercase tracking-widest mb-1">{label}</p>
      <h4 className="font-serif text-lg mb-2 text-[#2C332D]">{title}</h4>
      <p className="text-xs text-[#5A635C] leading-relaxed line-clamp-4">
        {content}
      </p>
    </div>
  );
}
