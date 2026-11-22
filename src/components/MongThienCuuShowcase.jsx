import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Sparkles,
  Flame,
  Shield,
  Swords,
  Wind,
  Target,
  Zap,
  Crown,
  Compass,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Eye,
  EyeOff,
  Star,
  ShieldCheck,
  Mountain,
  Crosshair,
  Scroll,
  Play,
  Pause,
  Award,
  Lock,
  Globe,
} from 'lucide-react';
import {
  MTC_HERO_SLIDES,
  MTC_CLASSES,
  MTC_EVENT_BANNERS,
  MTC_FEATURES_SHOWCASE,
  MTC_WORLD_HIGHLIGHTS,
  MTC_QUICK_PILLARS,
} from '../data/mongThienCuuShowcaseData';

const DEFAULT_NOTICE =
  'Siêu phẩm Tiên Hiệp Huyền Huyễn Hòa Phong — Tứ Đại Hệ Phái tranh bá, săn Đại Yêu Man Hoang, đồng hành cùng Cửu Vĩ Huyền Hồ.';

const CLASS_VISUAL_THEMES = {
  kiemsi: {
    Icon: Swords,
    tabActive: 'border-sky-400/70 bg-gradient-to-br from-sky-500/20 via-amber-500/10 to-[#0F172A] shadow-[0_0_28px_rgba(56,189,248,0.22)]',
    stageBorder: 'border-sky-400/35',
    glowOrb: 'bg-sky-500/20',
    pill: 'bg-sky-500/15 border-sky-400/40 text-sky-200',
    barFill: 'from-sky-400 via-cyan-300 to-amber-400',
    titleGrad: 'from-sky-200 via-amber-200 to-amber-400',
    skillBadge: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  },
  vuco: {
    Icon: Wind,
    tabActive: 'border-rose-400/70 bg-gradient-to-br from-rose-500/20 via-fuchsia-500/10 to-[#0F172A] shadow-[0_0_28px_rgba(244,63,94,0.24)]',
    stageBorder: 'border-rose-400/35',
    glowOrb: 'bg-rose-500/20',
    pill: 'bg-rose-500/15 border-rose-400/40 text-rose-200',
    barFill: 'from-rose-400 via-pink-400 to-fuchsia-500',
    titleGrad: 'from-rose-200 via-pink-300 to-fuchsia-300',
    skillBadge: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
  },
  thuongsu: {
    Icon: Shield,
    tabActive: 'border-amber-400/70 bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-[#0F172A] shadow-[0_0_28px_rgba(245,158,11,0.24)]',
    stageBorder: 'border-amber-400/35',
    glowOrb: 'bg-amber-500/20',
    pill: 'bg-amber-500/15 border-amber-400/40 text-amber-200',
    barFill: 'from-amber-400 via-orange-500 to-rose-500',
    titleGrad: 'from-amber-200 via-orange-300 to-rose-400',
    skillBadge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  },
  cungthu: {
    Icon: Target,
    tabActive: 'border-cyan-400/70 bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-[#0F172A] shadow-[0_0_28px_rgba(34,211,238,0.24)]',
    stageBorder: 'border-cyan-400/35',
    glowOrb: 'bg-cyan-500/20',
    pill: 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200',
    barFill: 'from-cyan-400 via-teal-400 to-emerald-400',
    titleGrad: 'from-cyan-200 via-teal-200 to-emerald-300',
    skillBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
  },
};

const STAT_METRICS = [
  { key: 'atk', label: 'Công Kích', Icon: Swords },
  { key: 'def', label: 'Phòng Thủ', Icon: Shield },
  { key: 'burst', label: 'Bộc Phát', Icon: Zap },
  { key: 'control', label: 'Khống Chế', Icon: Crosshair },
  { key: 'range', label: 'Tầm Đánh', Icon: Target },
];

const FEATURE_FILTERS = [
  { id: 'all', label: 'Tất Cả' },
  { id: 'boss', label: 'Săn Boss Đại Yêu' },
  { id: 'pk', label: 'Chiến Trường PK' },
  { id: 'social', label: 'Nhân Duyên & Thời Trang' },
];

const CATEGORY_BADGE_STYLES = {
  boss: 'bg-rose-500/20 border-rose-400/40 text-rose-200',
  pk: 'bg-amber-500/20 border-amber-400/40 text-amber-200',
  social: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200',
};

const PILLAR_ICONS = [Swords, Sparkles, Crown, Flame];

function SectionHeading({ badge, title, subtitle }) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-[0.22em]">
        <Sparkles size={13} className="text-amber-400" />
        <span>{badge}</span>
      </div>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-rose-300">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className="flex items-center justify-center gap-3 pt-1">
        <span className="h-px w-14 bg-gradient-to-r from-transparent to-amber-500/60" />
        <span className="w-2 h-2 rotate-45 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
        <span className="h-px w-14 bg-gradient-to-l from-transparent to-amber-500/60" />
      </div>
    </div>
  );
}

export default function MongThienCuuShowcase({
  rawApkUrl,
  webPlayUrl,
  version,
  notice,
  isAdmin,
  isMtcGameOpen,
  onTogglePublic,
  isWebPlayPublic = false,
  onToggleWebPlay,
}) {
  const showWebPlayButton = Boolean(isWebPlayPublic || isAdmin);
  const slides = useMemo(() => (Array.isArray(MTC_HERO_SLIDES) ? MTC_HERO_SLIDES : []), []);
  const classes = useMemo(() => (Array.isArray(MTC_CLASSES) ? MTC_CLASSES : []), []);
  const eventBanners = useMemo(() => (Array.isArray(MTC_EVENT_BANNERS) ? MTC_EVENT_BANNERS : []), []);
  const features = useMemo(() => (Array.isArray(MTC_FEATURES_SHOWCASE) ? MTC_FEATURES_SHOWCASE : []), []);
  const worldHighlights = useMemo(() => (Array.isArray(MTC_WORLD_HIGHLIGHTS) ? MTC_WORLD_HIGHLIGHTS : []), []);
  const quickPillars = useMemo(() => (Array.isArray(MTC_QUICK_PILLARS) ? MTC_QUICK_PILLARS : []), []);

  const [slideIdx, setSlideIdx] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(() => classes[0]?.id || 'kiemsi');
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxFeatureId, setLightboxFeatureId] = useState(null);

  const safeSlideIdx = slides.length > 0 ? slideIdx % slides.length : 0;
  const activeSlide = slides[safeSlideIdx] || {};

  const activeClass = useMemo(
    () => classes.find((cls) => cls.id === selectedClassId) || classes[0] || null,
    [classes, selectedClassId]
  );

  const activeTheme = CLASS_VISUAL_THEMES[activeClass?.id] || CLASS_VISUAL_THEMES.kiemsi;

  const filteredFeatures = useMemo(() => {
    if (activeCategory === 'all') return features;
    return features.filter((item) => item.category === activeCategory);
  }, [features, activeCategory]);

  const lightboxIndex = useMemo(() => {
    if (!lightboxFeatureId) return -1;
    return filteredFeatures.findIndex((item) => item.id === lightboxFeatureId);
  }, [filteredFeatures, lightboxFeatureId]);

  const activeLightboxItem = lightboxIndex >= 0 ? filteredFeatures[lightboxIndex] : null;

  useEffect(() => {
    if (!isAutoPlay || slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isAutoPlay, slides.length]);

  useEffect(() => {
    if (lightboxIndex < 0) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLightboxFeatureId(null);
      } else if (event.key === 'ArrowRight' && filteredFeatures.length > 0) {
        const nextIdx = (lightboxIndex + 1) % filteredFeatures.length;
        setLightboxFeatureId(filteredFeatures[nextIdx].id);
      } else if (event.key === 'ArrowLeft' && filteredFeatures.length > 0) {
        const prevIdx = (lightboxIndex - 1 + filteredFeatures.length) % filteredFeatures.length;
        setLightboxFeatureId(filteredFeatures[prevIdx].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredFeatures]);

  const displayVersion = useMemo(() => {
    const clean =
      String(version || '2.5.9')
        .replace(/[-_]?s0([-_]?beta)?/gi, '')
        .trim() || '2.5.9';
    return clean.startsWith('v') || clean.startsWith('V') ? clean : `v${clean}`;
  }, [version]);

  const resolvedWebPlayUrl = (webPlayUrl && String(webPlayUrl).trim()) || '/play/';

  const displayNotice = (notice && String(notice).trim()) || DEFAULT_NOTICE;

  const stepSlide = (delta) => {
    if (slides.length === 0) return;
    setSlideIdx((prev) => (prev + delta + slides.length) % slides.length);
  };

  const stepLightbox = (delta) => {
    if (filteredFeatures.length === 0 || lightboxIndex < 0) return;
    const nextIdx = (lightboxIndex + delta + filteredFeatures.length) % filteredFeatures.length;
    setLightboxFeatureId(filteredFeatures[nextIdx].id);
  };

  const scrollToClasses = () => {
    const target = document.getElementById('mtc-classes-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative overflow-x-clip text-slate-200">
      <style>{`
        @keyframes mtcKenBurns {
          0% { transform: scale(1) translate3d(0, 0, 0); }
          100% { transform: scale(1.07) translate3d(-0.8%, -0.8%, 0); }
        }
        @keyframes mtcFadeRise {
          0% { opacity: 0; transform: translateY(10px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mtcFloatEmber {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.35; }
          50% { transform: translateY(-14px) translateX(6px); opacity: 0.85; }
        }
        .mtc-ken-burns {
          animation: mtcKenBurns 8s ease-out forwards;
        }
        .mtc-fade-rise {
          animation: mtcFadeRise 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .mtc-ember-a {
          animation: mtcFloatEmber 5.5s ease-in-out infinite;
        }
        .mtc-ember-b {
          animation: mtcFloatEmber 7s ease-in-out infinite 1.4s;
        }
      `}</style>

      {/* Atmospheric ambient glows behind entire page */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-32 w-[30rem] h-[30rem] rounded-full bg-amber-500/5 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[34rem] h-[34rem] rounded-full bg-rose-500/5 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[28rem] h-[28rem] rounded-full bg-emerald-500/5 blur-[130px]" />
      </div>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-6 pt-5 sm:pt-7 space-y-16 sm:space-y-20">
        {/* 1. ADMIN STATUS BAR */}
        {isAdmin === true && (
          <div className="bg-gradient-to-r from-[#151D2F]/95 via-[#1E293B]/95 to-[#151D2F]/95 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 lg:grid-cols-2 gap-3 shadow-lg backdrop-blur-md">
            {/* Cụm 1: Trang Showcase & Tải APK */}
            <div className="min-w-0 rounded-xl bg-[#0B1120]/70 border border-white/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isMtcGameOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isMtcGameOpen ? <Eye size={18} /> : <EyeOff size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wider text-white leading-snug">
                    Trang Showcase &amp; Tải APK:{' '}
                    <span className={isMtcGameOpen ? 'text-emerald-400' : 'text-rose-400'}>
                      {isMtcGameOpen ? 'HIỆN CÔNG KHAI' : 'ẨN'}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Bật hoặc tắt trang giới thiệu &amp; tải APK với khách.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onTogglePublic}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md ${
                  isMtcGameOpen
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isMtcGameOpen ? (
                  <>
                    <EyeOff size={14} />
                    <span>Ẩn Khỏi Khách</span>
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    <span>Bật Hiện Công Khai</span>
                  </>
                )}
              </button>
            </div>

            {/* Cụm 2: Nút Chơi Trên Web (/play/) */}
            <div className="min-w-0 rounded-xl bg-[#0B1120]/70 border border-white/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isWebPlayPublic
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isWebPlayPublic ? <Globe size={18} /> : <Lock size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wider text-white leading-snug">
                    Nút Chơi Trên Web (/play/):{' '}
                    <span className={isWebPlayPublic ? 'text-emerald-400' : 'text-amber-300'}>
                      {isWebPlayPublic ? 'ĐANG MỞ CÔNG KHAI' : 'ĐANG ẨN — CHỈ NỘI BỘ'}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {isWebPlayPublic ? 'Khách thường đang thấy nút chơi trên web.' : 'Chỉ Admin thấy nút chơi web nội bộ.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleWebPlay}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md ${
                  isWebPlayPublic
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isWebPlayPublic ? (
                  <>
                    <Lock size={14} />
                    <span>Ẩn Chơi Trên Web</span>
                  </>
                ) : (
                  <>
                    <Globe size={14} />
                    <span>Bật Chơi Web Công Khai</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 2. CINEMATIC HERO BANNER */}
        <section
          aria-label="Giới thiệu Mộng Thiên Cửu"
          className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-[#0B1120] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
        >
          {/* Auto-rotating + manual background artwork slider */}
          <div className="absolute inset-0 overflow-hidden">
            {slides.map((slide, index) => {
              const isActive = index === safeSlideIdx;
              return (
                <div
                  key={slide.id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title || 'Mộng Thiên Cửu'}
                    className={`w-full h-full object-cover object-[center_28%] ${
                      isActive ? 'mtc-ken-burns' : 'scale-100'
                    }`}
                  />
                </div>
              );
            })}

            {/* Multi-layer cinematic dark scrims for crisp readability */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-r from-[#0B1120] via-[#0B1120]/85 to-[#0B1120]/45" />
            <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#0B1120] via-[#0B1120]/30 to-[#0B1120]/70" />
            <div className="absolute -top-24 -left-20 z-[2] w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-10 z-[2] w-72 h-72 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

            {/* Subtle floating sakura-gold light motes */}
            <span className="mtc-ember-a hidden sm:block absolute top-24 left-1/3 z-[2] w-2 h-2 rounded-full bg-amber-300/70 blur-[1px]" />
            <span className="mtc-ember-b hidden sm:block absolute bottom-44 left-1/2 z-[2] w-2.5 h-2.5 rounded-full bg-rose-300/60 blur-[1px]" />
          </div>

          {/* Hero foreground grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center p-5 sm:p-8 lg:p-12">
            {/* Left Copy & Logo + Primary CTA */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* Server Live & Version Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Máy Chủ Mới • Khai Mở 24/7</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-200 text-xs font-bold backdrop-blur-md">
                  <Crown size={13} className="text-amber-400" />
                  <span>Phiên Bản {displayVersion}</span>
                </span>
                {activeSlide.tag && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/35 text-rose-200 text-xs font-bold backdrop-blur-md">
                    <Flame size={13} className="text-rose-400" />
                    <span>{activeSlide.tag}</span>
                  </span>
                )}
              </div>

              {/* Official Calligraphic Game Logo */}
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-amber-400/15 blur-2xl rounded-full pointer-events-none" />
                <img
                  src="/mtc-showcase/logo.png"
                  alt="Mộng Thiên Cửu"
                  className="relative z-10 w-64 sm:w-80 md:w-[23.5rem] h-auto object-contain drop-shadow-[0_10px_28px_rgba(244,63,94,0.3)]"
                />
              </div>

              {/* Active Slide Title & Subtitle */}
              <div key={activeSlide.id || safeSlideIdx} className="mtc-fade-rise space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-rose-300">
                    {activeSlide.title || 'Mộng Thiên Cửu — Huyền Huyễn Hòa Phong'}
                  </span>
                </h1>
                {activeSlide.subtitle && (
                  <p className="text-sm sm:text-base font-bold text-amber-100/90">
                    {activeSlide.subtitle}
                  </p>
                )}
              </div>

              {/* Atmospheric Tagline + Slide Description */}
              <div className="bg-[#0F172A]/75 backdrop-blur-md border border-amber-500/20 border-l-4 border-l-amber-400 rounded-2xl p-4 sm:p-5 space-y-2 max-w-2xl shadow-inner">
                <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed">
                  {displayNotice}
                </p>
                {activeSlide.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeSlide.description}
                  </p>
                )}
              </div>

              {/* Primary Web Play & APK Download CTAs + Secondary Smooth-Scroll Button */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                {showWebPlayButton && (
                  <a
                    href={resolvedWebPlayUrl}
                    className="group relative overflow-hidden px-6 sm:px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-500 hover:from-amber-400 hover:via-yellow-300 hover:to-rose-400 text-[#0B1120] font-black text-sm sm:text-base shadow-[0_0_34px_rgba(245,158,11,0.45)] hover:shadow-[0_0_48px_rgba(244,63,94,0.55)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-3"
                  >
                    <Play size={20} className="shrink-0 fill-current transition-transform group-hover:scale-110" />
                    <span>{isAdmin && !isWebPlayPublic ? 'Chơi Trên Web (Nội Bộ)' : 'Chơi Ngay Trên Web'}</span>
                    {isAdmin && !isWebPlayPublic ? (
                      <span className="px-2 py-0.5 rounded-lg bg-[#0B1120]/25 text-[#0B1120] text-xs font-extrabold">
                        🔒 Nội bộ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-[#0B1120]/20 text-[#0B1120] text-xs font-extrabold">
                        PC • iOS • Android
                      </span>
                    )}
                  </a>
                )}

                <a
                  href={rawApkUrl}
                  download="MongThienCuu_s0_beta_online.apk"
                  className="group relative overflow-hidden px-6 sm:px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:via-teal-300 hover:to-cyan-300 text-[#0B1120] font-black text-sm sm:text-base shadow-[0_0_28px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-3"
                >
                  <Download size={20} className="shrink-0 transition-transform group-hover:translate-y-0.5" />
                  <span>Tải Game APK</span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#0B1120]/20 text-[#0B1120] text-xs font-extrabold">
                    {displayVersion}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={scrollToClasses}
                  className="px-5 sm:px-6 py-4 rounded-2xl bg-[#0F172A]/85 hover:bg-slate-800/90 text-amber-200 hover:text-white border border-amber-500/35 hover:border-amber-400/65 font-bold text-sm sm:text-base transition-all duration-300 inline-flex items-center gap-2.5 backdrop-blur-md cursor-pointer"
                >
                  <Compass size={18} className="text-amber-400" />
                  <span>Khám Phá Thế Giới</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                {showWebPlayButton ? (
                  <>
                    <p className="text-xs sm:text-sm text-amber-100/90 font-semibold leading-relaxed">
                      Chơi mượt trực tiếp trên <strong className="text-amber-300">PC, iPhone (iOS) &amp; Android</strong> qua địa chỉ cố định{' '}
                      <a href={resolvedWebPlayUrl} className="text-emerald-300 underline decoration-emerald-400/50 hover:text-emerald-200 font-bold">
                        shoptiengaming.com/play
                      </a>{' '}
                      đồng bộ Ví ShopTiếnGaming.
                    </p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300/90">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck size={15} className="text-emerald-400" />
                        <span>Chơi ngay không cần cài đặt &amp; hỗ trợ bộ cài Android chính thức</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles size={15} className="text-amber-400" />
                        <span>Đồ họa 3D Hòa Phong mượt mà</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-amber-100/90 font-semibold leading-relaxed">
                      Cài đặt bộ cài <strong className="text-emerald-300">APK Android chính thức</strong> — tự động kết nối đường truyền trực tuyến nhanh nhất &amp; đồng bộ Ví ShopTiếnGaming.
                    </p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300/90">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck size={15} className="text-emerald-400" />
                        <span>Bộ cài Android chính thức nhẹ mượt • Tự động cập nhật OTA trong ứng dụng</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles size={15} className="text-amber-400" />
                        <span>Đồ họa 3D Hòa Phong mượt mà</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Framed Artwork Showcase & Slide Switcher */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[390px] aspect-[4/5] rounded-3xl overflow-hidden border border-amber-400/40 bg-[#0F172A] shadow-[0_24px_65px_rgba(0,0,0,0.85)]">
                {/* Ornate corner flourishes */}
                <span className="pointer-events-none absolute top-3 left-3 z-20 w-5 h-5 border-t-2 border-l-2 border-amber-300/80 rounded-tl-md" />
                <span className="pointer-events-none absolute top-3 right-3 z-20 w-5 h-5 border-t-2 border-r-2 border-amber-300/80 rounded-tr-md" />
                <span className="pointer-events-none absolute bottom-3 left-3 z-20 w-5 h-5 border-b-2 border-l-2 border-amber-300/80 rounded-bl-md" />
                <span className="pointer-events-none absolute bottom-3 right-3 z-20 w-5 h-5 border-b-2 border-r-2 border-amber-300/80 rounded-br-md" />

                {slides.map((slide, index) => {
                  const isActive = index === safeSlideIdx;
                  return (
                    <img
                      key={slide.id || index}
                      src={slide.image}
                      alt={slide.title || 'Mộng Thiên Cửu Artwork'}
                      className={`absolute inset-0 w-full h-full object-cover object-[center_30%] transition-all duration-700 ${
                        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                    />
                  );
                })}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-[#0B1120]/30 z-10 pointer-events-none" />

                {/* Top Controls inside preview frame */}
                <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#0B1120]/75 backdrop-blur-md border border-amber-400/30 text-[11px] font-bold text-amber-200">
                    {safeSlideIdx + 1} / {slides.length || 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAutoPlay((prev) => !prev)}
                      aria-label={isAutoPlay ? 'Tạm dừng trình chiếu' : 'Tiếp tục trình chiếu'}
                      className="w-8 h-8 rounded-full bg-[#0B1120]/75 hover:bg-amber-500/30 border border-white/15 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {isAutoPlay ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => stepSlide(-1)}
                      aria-label="Ảnh trước"
                      className="w-8 h-8 rounded-full bg-[#0B1120]/75 hover:bg-amber-500/30 border border-white/15 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepSlide(1)}
                      aria-label="Ảnh tiếp theo"
                      className="w-8 h-8 rounded-full bg-[#0B1120]/75 hover:bg-amber-500/30 border border-white/15 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {/* Bottom Active Slide Caption */}
                <div className="absolute bottom-0 inset-x-0 z-20 p-5 space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                    {activeSlide.tag}
                  </p>
                  <p className="text-base font-black text-white leading-snug line-clamp-1">
                    {activeSlide.title}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {activeSlide.subtitle}
                  </p>
                </div>
              </div>

              {/* Interactive Slide Thumbnails */}
              {slides.length > 1 && (
                <div className="grid grid-cols-5 gap-2.5 w-full max-w-[390px] mt-3.5">
                  {slides.map((slide, index) => {
                    const isActive = index === safeSlideIdx;
                    return (
                      <button
                        key={slide.id || index}
                        type="button"
                        onClick={() => setSlideIdx(index)}
                        aria-label={`Chọn cảnh ${slide.title || index + 1}`}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.5)] scale-[1.04]'
                            : 'border-white/10 opacity-60 hover:opacity-100 hover:border-amber-400/50'
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title || `Slide ${index + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                        {isActive && (
                          <span className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 4 Quick Highlight Cards across the bottom of Hero */}
          {quickPillars.length > 0 && (
            <div className="relative z-10 border-t border-amber-500/20 bg-[#0B1120]/80 backdrop-blur-xl px-5 sm:px-8 lg:px-12 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {quickPillars.map((pillar, index) => {
                  const PillarIcon = PILLAR_ICONS[index % PILLAR_ICONS.length];
                  return (
                    <div
                      key={pillar.id || index}
                      className="group rounded-2xl bg-[#111A2E]/90 border border-white/10 hover:border-amber-400/40 p-4 flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <PillarIcon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {pillar.title}
                        </p>
                        <p className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-emerald-300 truncate">
                          {pillar.value}
                        </p>
                        <p className="text-xs text-slate-400 leading-snug mt-0.5 line-clamp-2">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 3. TỨ ĐẠI HỆ PHÁI — THỨC TỈNH HUYẾT MẠCH */}
        {activeClass && (
          <section id="mtc-classes-section" aria-label="Tứ Đại Hệ Phái" className="scroll-mt-24">
            <SectionHeading
              badge="Tứ Đại Hệ Phái"
              title="Thức Tỉnh Huyết Mạch"
              subtitle="Bốn con đường tu luyện mang sức mạnh ngũ hành và tuyệt kỹ độc tôn, tự do chuyển hóa phong cách chiến đấu."
            />

            {/* Class Selector Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {classes.map((cls) => {
                const isSelected = cls.id === activeClass.id;
                const theme = CLASS_VISUAL_THEMES[cls.id] || CLASS_VISUAL_THEMES.kiemsi;
                const TabIcon = theme.Icon;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`group text-left rounded-2xl border p-4 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? theme.tabActive
                        : 'border-white/10 bg-[#0F172A]/80 hover:border-amber-400/35 hover:bg-[#151D2F]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        {cls.portraitImg ? (
                          <img
                            src={cls.portraitImg}
                            alt={cls.name}
                            className={`w-11 h-11 rounded-xl object-cover object-top border bg-[#0B1120] shrink-0 ${
                              isSelected ? 'border-amber-400/60 shadow-md' : 'border-white/15'
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                              isSelected
                                ? theme.pill
                                : 'bg-slate-800/80 border-white/10 text-slate-400 group-hover:text-amber-300'
                            }`}
                          >
                            <TabIcon size={18} />
                          </div>
                        )}
                        <div>
                          <p className="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors leading-tight">
                            {cls.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{cls.roleLabel}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 self-start">
                        {cls.element}
                      </span>
                    </div>
                    {isSelected && (
                      <span className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${theme.barFill}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Class Stage */}
            <div
              className={`rounded-3xl border ${activeTheme.stageBorder} bg-[#0F172A]/95 overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-12`}
            >
              {/* Left Character Visual + Official Calligraphic PNGs */}
              <div className="lg:col-span-6 relative min-h-[460px] sm:min-h-[540px] flex flex-col justify-between overflow-hidden bg-[#0B1120]">
                <div className={`pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full blur-3xl ${activeTheme.glowOrb}`} />

                <img
                  key={`bg-${activeClass.id}`}
                  src={activeClass.artworkImg}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-50 scale-105 transition-all duration-500"
                />

                {/* Gradient overlays to guarantee crisp readability of character & calligraphy PNGs */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/20 to-[#0B1120]/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/65 via-transparent to-[#0B1120]/65" />

                {/* Official Full-Body Character Art Centered on Stage */}
                {activeClass.characterImg && (
                  <div className="absolute inset-x-0 top-6 bottom-12 z-[5] flex items-center justify-center pointer-events-none px-4">
                    <img
                      key={`char-${activeClass.id}`}
                      src={activeClass.characterImg}
                      alt={`Nhân vật ${activeClass.name}`}
                      className="mtc-fade-rise max-h-full max-w-[88%] w-auto h-auto object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.9)]"
                    />
                  </div>
                )}

                {/* Top Official Calligraphy Layer (nameImg + roleImg + loreImg) */}
                <div className="relative z-10 p-4 sm:p-6 flex items-start justify-between gap-3">
                  {/* Name + Role Calligraphy */}
                  <div className="flex items-center gap-2.5 bg-[#0B1120]/80 backdrop-blur-md border border-amber-400/25 rounded-2xl p-3 shadow-2xl">
                    {activeClass.nameImg && (
                      <div className="w-20 sm:w-24 aspect-square overflow-hidden flex items-start shrink-0">
                        <img
                          src={activeClass.nameImg}
                          alt={`Thư pháp ${activeClass.name}`}
                          className="w-full h-auto -translate-y-[7%] object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]"
                        />
                      </div>
                    )}
                    {activeClass.roleImg && (
                      <img
                        src={activeClass.roleImg}
                        alt={activeClass.roleLabel}
                        className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
                      />
                    )}
                  </div>

                  {/* Vertical Lore Calligraphy inside contrast-backed frosted seal */}
                  {activeClass.loreImg && (
                    <div className="bg-[#0B1120]/85 backdrop-blur-md border border-amber-400/25 rounded-2xl px-2.5 py-3 shadow-2xl">
                      <div className="w-24 sm:w-28 aspect-[5/7] overflow-hidden relative">
                        <img
                          src={activeClass.loreImg}
                          alt={`Châm ngôn ${activeClass.name}`}
                          className="w-full h-auto -translate-y-[11%] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Quick Meta Pills on Artwork */}
                <div className="relative z-10 p-4 sm:p-6 flex flex-wrap items-center gap-2.5">
                  <span className={`px-3 py-1.5 rounded-full border text-xs font-black backdrop-blur-md ${activeTheme.pill}`}>
                    Hệ: {activeClass.element}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[#0B1120]/80 border border-white/15 text-xs font-bold text-slate-200 backdrop-blur-md">
                    Vũ khí: {activeClass.weapon}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-[#0B1120]/80 border border-white/15 text-xs font-bold text-amber-300 backdrop-blur-md inline-flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>Độ khó: {activeClass.difficulty}</span>
                  </span>
                </div>
              </div>

              {/* Right Details: Lore, 5-Bar Stats & 3 Signature Skills */}
              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-gradient-to-br from-[#0F172A] via-[#131D35] to-[#0B1120]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                        {activeClass.roleLabel}
                      </p>
                      <h3
                        className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${activeTheme.titleGrad}`}
                      >
                        {activeClass.name}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-xl border text-xs font-bold ${activeTheme.pill}`}>
                      {activeClass.element}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{activeClass.loreText}</p>
                </div>

                {/* 5-Bar Animated Combat Stat Meters */}
                <div className="space-y-3 bg-[#0B1120]/70 border border-white/10 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Award size={14} />
                      <span>Chỉ Số Chiến Đấu</span>
                    </p>
                    <span className="text-[11px] text-slate-400 font-semibold">Thang điểm 100</span>
                  </div>

                  <div className="space-y-2.5">
                    {STAT_METRICS.map((metric) => {
                      const rawValue = Number(activeClass.stats?.[metric.key] ?? 0);
                      const clamped = Math.max(0, Math.min(100, rawValue));
                      const MetricIcon = metric.Icon;
                      return (
                        <div key={metric.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-200">
                              <MetricIcon size={13} className="text-amber-400" />
                              <span>{metric.label}</span>
                            </span>
                            <span className="font-black text-amber-300 tabular-nums">{clamped}</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-800/90 overflow-hidden p-0.5">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${activeTheme.barFill} transition-[width] duration-700 ease-out shadow-[0_0_10px_rgba(251,191,36,0.35)]`}
                              style={{ width: `${clamped}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3 Signature Skills */}
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Scroll size={14} />
                    <span>Tuyệt Kỹ Trấn Phái</span>
                  </p>
                  <div className="space-y-2.5">
                    {(activeClass.skills || []).slice(0, 3).map((skill, idx) => (
                      <div
                        key={skill.name || idx}
                        className="rounded-xl bg-[#0B1120]/75 border border-white/10 hover:border-amber-400/35 p-3.5 flex items-start gap-3 transition-colors"
                      >
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-black shrink-0 ${activeTheme.skillBadge}`}
                        >
                          Chiêu {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white">{skill.name}</p>
                          <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{skill.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. HOẠT ĐỘNG & PHÚC LỢI ĐẶC SẮC */}
        {eventBanners.length > 0 && (
          <section aria-label="Hoạt Động Và Phúc Lợi Đặc Sắc">
            <SectionHeading
              badge="Hoạt Động & Phúc Lợi"
              title="Phúc Lợi Đặc Sắc Khai Mở"
              subtitle="Chuỗi sự kiện tân thủ, thần khí thượng cổ, tọa kỵ huyền thú và long ngọc truyền thuyết đồng hành trên mọi chặng đường."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {eventBanners.map((banner, index) => (
                <article
                  key={banner.id || index}
                  className="group relative rounded-2xl border border-white/10 hover:border-amber-400/45 bg-gradient-to-br from-[#0F172A]/95 via-[#141E36]/90 to-[#0B1120]/95 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(245,158,11,0.14)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-200 text-[11px] font-black uppercase tracking-wider">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>{banner.tag}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span>Phúc Lợi #{index + 1}</span>
                    </span>
                  </div>

                  {/* Official 720x200 Event Banner with smooth edge blending */}
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#0E1528] via-[#192341] to-[#0E1528] border border-white/10 aspect-[18/5] flex items-center justify-center">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500"
                      style={{
                        maskImage:
                          'linear-gradient(to right, transparent 0%, black 6%, black 92%, transparent 100%)',
                        WebkitMaskImage:
                          'linear-gradient(to right, transparent 0%, black 6%, black 92%, transparent 100%)',
                      }}
                    />
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors">
                        {banner.title}
                      </h3>
                      <p className="text-xs font-bold text-amber-300/90 mt-0.5">
                        {banner.subtitle}
                      </p>
                    </div>
                    {banner.highlight && (
                      <p className="text-xs text-slate-300 leading-relaxed rounded-xl bg-[#0B1120]/70 border border-emerald-500/20 px-3.5 py-2.5">
                        {banner.highlight}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 5. VẠN GIỚI KỲ QUAN — LỘ TRÌNH CHINH PHỤC (+ LIGHTBOX) */}
        {features.length > 0 && (
          <section aria-label="Vạn Giới Kỳ Quan">
            <SectionHeading
              badge="Vạn Giới Kỳ Quan"
              title="Lộ Trình Chinh Phục"
              subtitle="Khám phá các cột mốc cảnh giới, săn Đại Yêu Man Hoang, tranh đoạt chiến trường liên server và kết duyên chốn tiên cảnh."
            />

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
              {FEATURE_FILTERS.map((filter) => {
                const count =
                  filter.id === 'all'
                    ? features.length
                    : features.filter((f) => f.category === filter.id).length;
                const isActive = activeCategory === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(filter.id);
                      setLightboxFeatureId(null);
                    }}
                    className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all duration-300 inline-flex items-center gap-2 cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white border-amber-300/60 shadow-[0_0_24px_rgba(245,158,11,0.35)]'
                        : 'bg-[#0F172A]/85 hover:bg-slate-800 text-slate-300 border-white/10 hover:border-amber-400/40'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isActive ? 'bg-black/25 text-white' : 'bg-slate-800 text-amber-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Features Poster Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.map((item) => {
                const badgeClass =
                  CATEGORY_BADGE_STYLES[item.category] ||
                  'bg-amber-500/20 border-amber-400/40 text-amber-200';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightboxFeatureId(item.id)}
                    className="group relative text-left rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/55 bg-[#0F172A] shadow-xl hover:shadow-[0_18px_48px_rgba(245,158,11,0.18)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0B1120]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#0B1120]/85 backdrop-blur-md border border-amber-400/45 text-amber-300 text-[11px] font-black">
                          {item.levelReq}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-bold backdrop-blur-md ${badgeClass}`}
                        >
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Hover Zoom Hint */}
                      <div className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-full bg-[#0B1120]/80 border border-amber-400/40 text-amber-300 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        <ZoomIn size={16} />
                      </div>
                    </div>

                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#0F172A] to-[#0B1120]">
                      <div className="space-y-1.5">
                        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                          {item.summary}
                        </p>
                      </div>
                      <span className="pt-2 text-[11px] font-black uppercase tracking-wider text-amber-400/90 inline-flex items-center gap-1">
                        <span>Phóng to toàn cảnh</span>
                        <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. THẾ GIỚI SƠN HÀ CỬU CHÂU + GRAND FOOTER DOWNLOAD CTA */}
        <section aria-label="Thế Giới Sơn Hà Cửu Châu" className="space-y-12">
          {worldHighlights.length > 0 && (
            <div>
              <SectionHeading
                badge="Sơn Hà Cửu Châu"
                title="Thế Giới Huyền Ảo Cửu Châu"
                subtitle="Từ hoa anh đào rợp bóng cố đô đến chiến trường Cửu Châu rộng lớn — từng khung cảnh đều thấm đẫm mỹ học Hòa Phong."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {worldHighlights.map((scene, index) => (
                  <article
                    key={scene.id || index}
                    className="group relative min-h-[380px] sm:min-h-[430px] rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 bg-[#0F172A] shadow-2xl flex items-end transition-all duration-300 hover:-translate-y-1"
                  >
                    <img
                      src={scene.image}
                      alt={scene.title}
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/55 to-transparent" />

                    <div className="relative z-10 p-6 space-y-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
                        <Mountain size={12} className="text-amber-300" />
                        <span>{scene.subtitle}</span>
                      </span>
                      <h3 className="text-xl font-black text-white group-hover:text-amber-200 transition-colors">
                        {scene.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {scene.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Grand Footer Download CTA Card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#141D35] via-[#1C1732] to-[#0B1120] p-7 sm:p-12 text-center shadow-[0_0_70px_rgba(245,158,11,0.15)]">
            <div className="pointer-events-none absolute -top-28 -left-28 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-28 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <img
                src="/mtc-showcase/logo.png"
                alt="Mộng Thiên Cửu"
                className="w-52 sm:w-72 h-auto mx-auto object-contain drop-shadow-[0_10px_28px_rgba(244,63,94,0.3)]"
              />

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-black">
                  Thế Giới Mở • Trực Tuyến 24/7
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-200 text-xs font-bold">
                  {displayVersion}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Sẵn Sàng Bước Vào Cõi{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-emerald-300">
                  Mộng Thiên Cửu
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Triệu hồi Cửu Vĩ Huyền Hồ, chọn lựa Tứ Đại Hệ Phái và viết nên truyền kỳ của riêng bạn trong thế giới Tiên Hiệp Hòa Phong.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                {showWebPlayButton && (
                  <a
                    href={resolvedWebPlayUrl}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-500 hover:from-amber-400 hover:via-yellow-300 hover:to-rose-400 text-[#0B1120] font-black text-base shadow-[0_0_36px_rgba(245,158,11,0.45)] hover:shadow-[0_0_50px_rgba(244,63,94,0.6)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  >
                    <Play size={20} className="fill-current transition-transform group-hover:scale-110" />
                    <span>{isAdmin && !isWebPlayPublic ? 'Chơi Trên Web (Nội Bộ)' : 'Chơi Ngay Trên Web'}</span>
                    {isAdmin && !isWebPlayPublic && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#0B1120]/25 text-[#0B1120] text-xs font-extrabold">
                        🔒 Nội bộ
                      </span>
                    )}
                  </a>
                )}
                <a
                  href={rawApkUrl}
                  download="MongThienCuu_s0_beta_online.apk"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:via-teal-300 hover:to-cyan-300 text-[#0B1120] font-black text-base shadow-[0_0_28px_rgba(16,185,129,0.35)] hover:shadow-[0_0_42px_rgba(16,185,129,0.55)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                >
                  <Download size={20} className="transition-transform group-hover:translate-y-0.5" />
                  <span>Tải Game APK Ngay</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal for Vạn Giới Kỳ Quan */}
      {activeLightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxItem.title}
          onClick={() => setLightboxFeatureId(null)}
          className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="mtc-fade-rise relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-amber-500/40 bg-[#0F172A] shadow-[0_0_80px_rgba(245,158,11,0.25)] p-4 sm:p-6"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-black">
                  {activeLightboxItem.levelReq}
                </span>
                <span
                  className={`px-3 py-1 rounded-full border text-xs font-bold ${
                    CATEGORY_BADGE_STYLES[activeLightboxItem.category] ||
                    'bg-slate-800 border-white/10 text-slate-200'
                  }`}
                >
                  {activeLightboxItem.categoryLabel}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {lightboxIndex + 1} / {filteredFeatures.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxFeatureId(null)}
                aria-label="Đóng xem ảnh"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Poster Image + Navigation */}
            <div className="relative my-4 flex items-center justify-center bg-[#0B1120] rounded-2xl p-2 sm:p-4 border border-white/10">
              {filteredFeatures.length > 1 && (
                <button
                  type="button"
                  onClick={() => stepLightbox(-1)}
                  aria-label="Tính năng trước"
                  className="absolute left-2 sm:left-4 z-10 w-10 h-10 rounded-full bg-[#0F172A]/90 hover:bg-amber-500 text-white border border-amber-400/40 flex items-center justify-center transition-colors cursor-pointer shadow-lg"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <img
                src={activeLightboxItem.image}
                alt={activeLightboxItem.title}
                className="max-h-[65vh] w-auto rounded-xl object-contain shadow-2xl"
              />

              {filteredFeatures.length > 1 && (
                <button
                  type="button"
                  onClick={() => stepLightbox(1)}
                  aria-label="Tính năng tiếp theo"
                  className="absolute right-2 sm:right-4 z-10 w-10 h-10 rounded-full bg-[#0F172A]/90 hover:bg-amber-500 text-white border border-amber-400/40 flex items-center justify-center transition-colors cursor-pointer shadow-lg"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-1.5 text-center max-w-2xl mx-auto">
              <h3 className="text-lg sm:text-xl font-black text-amber-200">
                {activeLightboxItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeLightboxItem.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
