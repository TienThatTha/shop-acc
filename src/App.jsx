import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import {
  User, Lock, Phone, Mail, ShieldCheck, ArrowRight, CheckCircle2,
  LogOut, Key, Wallet, Search, Gamepad2, X, Menu, Clock, Flame,
  Settings, Edit, Trash2, PlusCircle, Image as ImageIcon,
  History, Target, Gift, Save, Upload, Plus, Unlock, QrCode,
  Download, Copy, Check, AlertCircle, RefreshCw, ChevronDown, ChevronUp, ZoomIn, ChevronLeft, ChevronRight,
  Sparkles, TrendingUp, Users, Ticket, Settings2, MessageCircle, Send, Eye, EyeOff,
  ArrowLeftRight, RotateCcw, MoreVertical, AlertTriangle, ArrowLeft, Loader2, Swords, Crown, Zap, Shield, Package, Link, BarChart2,
  ShoppingCart, Bell, BellOff, Globe
} from 'lucide-react';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';
import { LEGENDARY_SHOES_IMG, getShoesImage } from './shoesAsset';
import TurnstileWidget from './components/TurnstileWidget';
import { isTurnstileConfigured } from './utils/turnstileConfig';
import { APK_CDN_URL } from './utils/cdnAsset';
import { DISCORD_INVITE_URL, DiscordIcon } from './components/DiscordIcon';
import {
  compressImageFile,
  getWheelNotifyFallback,
  getActiveStatus,
  enforceNumberInput,
  uploadToImgBB
} from './utils/shopHelpers';

const WizardCardFlip = lazy(() => import('./components/WizardCardFlip'));
const MongThienCuuShowcase = lazy(() => import('./components/MongThienCuuShowcase'));
const AdminScreen = lazy(() => import('./pages/AdminScreen'));
const BossGameScreen = lazy(() => import('./pages/BossGameScreen'));
const VongQuayScreen = lazy(() => import('./pages/VongQuayScreen'));
const DonateLiveScreen = lazy(() => import('./pages/DonateLiveScreen'));
const NaptienScreen = lazy(() => import('./pages/AccountScreens').then((m) => ({ default: m.NaptienScreen })));
const LichsuScreen = lazy(() => import('./pages/AccountScreens').then((m) => ({ default: m.LichsuScreen })));
const CayThueScreen = lazy(() => import('./pages/AccountScreens').then((m) => ({ default: m.CayThueScreen })));
const SecurityScreen = lazy(() => import('./pages/AccountScreens').then((m) => ({ default: m.SecurityScreen })));

const VALID_VIEWS = new Set([
  'dashboard', 'login', 'register', 'forgot-password', 'security', 'admin',
  'naptien', 'lichsu', 'caythue', 'vongquay', 'wizard', 'bossgame',
  'mongthiencuu', 'vip_info', 'donate'
]);

const isLocalhostUrlHost = () => {
  if (typeof window === 'undefined') return false;
  const h = (window.location.hostname || '').toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === 'localtest.me';
};
const getRankByPoints = (points, rankTiers = []) => {
  if (!rankTiers || rankTiers.length === 0) return 'Chưa xếp hạng';
  if (points == null || points < rankTiers[0].points) return 'Chưa xếp hạng';
  let currentRank = rankTiers[0].name;
  for (let i = 0; i < rankTiers.length; i++) {
    if (points >= rankTiers[i].points) {
      currentRank = rankTiers[i].name;
    } else {
      break;
    }
  }
  return currentRank;
};

const MTC_DEFAULT_SHOWCASE_NOTICE =
  'Siêu phẩm Tiên Hiệp Huyền Huyễn Hòa Phong — Tứ Đại Hệ Phái tranh bá, săn Đại Yêu Man Hoang, đồng hành cùng Cửu Vĩ Huyền Hồ.';

const LEGACY_MTC_NOTICE_TERMS = [
  'ch play',
  'app store',
  'appstore',
  'nạp ví game',
  'nạp tự động',
  'ip tunnel',
  'cổng tải cố định',
  'link tải apk cố định',
  'web h5'
];

const sanitizeMtcShowcaseNotice = (rawNotice) => {
  if (typeof rawNotice !== 'string') return MTC_DEFAULT_SHOWCASE_NOTICE;
  const trimmed = rawNotice.trim();
  if (!trimmed) return MTC_DEFAULT_SHOWCASE_NOTICE;
  const lower = trimmed.toLowerCase();
  if (LEGACY_MTC_NOTICE_TERMS.some((term) => lower.includes(term))) {
    return MTC_DEFAULT_SHOWCASE_NOTICE;
  }
  return trimmed;
};

const calculateBoostPrice = (currentPoints, targetPoints, rankTiers = []) => {
  if (!rankTiers || rankTiers.length === 0) return 0;
  if (currentPoints == null || targetPoints == null || currentPoints >= targetPoints) return 0;

  let totalCost = 0;
  let remainingPoints = currentPoints;

  for (let i = 0; i < rankTiers.length; i++) {
    const tier = rankTiers[i];
    const nextTier = rankTiers[i + 1];

    if (remainingPoints >= tier.points && (!nextTier || remainingPoints < nextTier.points)) {
      const priceForTier = tier.price || 0;

      if (!nextTier || targetPoints <= nextTier.points) {
        totalCost += (targetPoints - remainingPoints) * priceForTier;
        break;
      } else {
        totalCost += (nextTier.points - remainingPoints) * priceForTier;
        remainingPoints = nextTier.points;
      }
    }
  }
  return totalCost;
};
// --- COMPONENT LOGO TÙY CHỈNH ---
const CustomLogo = ({ className = "" }) => (
  <div className={`group shrink-0 ${className} cursor-pointer md:mr-6`}>
    <img
      src="/Tiengaming.png"
      alt="Shop Tiến Gaming"
      className="h-16 md:h-[4.5rem] w-auto object-contain drop-shadow-[0_2px_8px_rgba(16,185,129,0.25)] group-hover:drop-shadow-[0_2px_16px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-all duration-300"
    />
  </div>
);
// --- COMPONENT NÚT LIÊN HỆ NỔI ---
const FloatingContact = ({ currentUser, unreadCount, onOpenInbox, isAdminOnline }) => (
  <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-3 transition-all duration-300">

    {/* Nút Hộp Thư Mới */}
    {currentUser && (
      <button onClick={onOpenInbox} className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:-translate-y-1 transition-transform group relative">
        <MessageCircle size={22} className="text-white" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-500 animate-pulse">{unreadCount}</span>}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Hộp thư hỗ trợ</span>
        {isAdminOnline && (
          <>
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 bg-slate-900/95 border border-emerald-500/30 px-3 py-1.5 rounded-full pointer-events-none group-hover:opacity-0 transition-opacity shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">Đang trực tuyến</span>
            </div>
            <span className="absolute top-0 right-0 md:hidden w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#151D2F] animate-pulse shadow-sm"></span>
          </>
        )}
      </button>
    )}

    {/* Nút Tham Gia Discord Chơi Game */}
    <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer" className="w-12 h-12 bg-[#5865F2] hover:bg-[#4752C4] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(88,101,242,0.5)] hover:-translate-y-1 transition-all group relative border-2 border-indigo-300/40">
      <DiscordIcon className="w-6 h-6 text-white" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Discord Chơi Game</span>
    </a>

    <a href="https://zalo.me/0938240332" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-transform group relative border-2 border-blue-100">
      <span className="text-[#0068FF] font-black text-xs">Zalo</span>
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Chat Zalo</span>
    </a>
    <a href="https://www.facebook.com/giatien2408" target="_blank" rel="noreferrer" className="w-12 h-12 bg-gradient-to-b from-[#1877F2] to-[#145CE6] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(24,119,242,0.4)] hover:-translate-y-1 transition-transform group relative">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white" className="mt-0.5"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg>
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Facebook</span>
    </a>
  </div>
);
// HÀM XỬ LÝ SĐT (BẮT BUỘC BẮT ĐẦU BẰNG SỐ 0, TỐI ĐA 11 SỐ)
const enforcePhoneZeroInput = (e) => {
  let digits = e.target.value.replace(/[^0-9]/g, '');
  const zeroIdx = digits.indexOf('0');
  digits = zeroIdx === -1 ? '' : digits.slice(zeroIdx, zeroIdx + 11);
  e.target.value = digits;
};
const isValidVnPhone = (val) => /^0\d{9,10}$/.test(String(val || '').trim());
const isValidGmail = (val) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(String(val || '').trim());
const ImageCarousel = ({ images, title, setFullScreenImage, index, isFeatured }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images?.length]);

  if (!images || images.length === 0) return null;
  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      className="relative w-full bg-slate-900 cursor-pointer overflow-hidden mt-1 md:mt-2 group/img cursor-zoom-in"
      onClick={() => setFullScreenImage({ images, index: currentIndex, title })}
      title="Bấm để phóng to ảnh"
    >
      <img
        src={currentImage}
        loading={index < 8 ? "eager" : "lazy"}
        fetchPriority={index < 4 ? "high" : "auto"}
        decoding="async"
        className="w-full h-auto object-cover transition-transform duration-500 group-hover/img:scale-105"
        alt={title}
      />

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
        <div className="bg-black/60 p-2 rounded-full text-white flex items-center gap-1 text-xs font-bold">
          <ZoomIn size={16} /> Phóng to
        </div>
      </div>

      {isFeatured && (
        <div className="absolute bottom-1.5 left-1.5 z-20 pointer-events-none">
          <span className="text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md uppercase w-fit bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-[0_2px_10px_rgba(0,0,0,0.8)] border border-amber-300/50 backdrop-blur-md">
            🔥 DỊCH VỤ NỔI BẬT
          </span>
        </div>
      )}
    </div>
  );
};

const parseMtcQueryRedirect = () => {
  if (typeof window === 'undefined') return { shouldRedirectPlay: false, viewMtc: false };
  try {
    const params = new URLSearchParams(window.location.search);
    const playParam = (params.get('play') || '').trim().toLowerCase();
    const gameParam = (params.get('game') || '').trim().toLowerCase();
    const viewParam = (params.get('view') || '').trim().toLowerCase();
    return {
      shouldRedirectPlay: playParam === 'mtc' || gameParam === 'mtc',
      viewMtc: viewParam === 'mongthiencuu'
    };
  } catch {
    return { shouldRedirectPlay: false, viewMtc: false };
  }
};

const parseDepositDeepLink = () => {
  if (typeof window === 'undefined') return { isDepositDeepLink: false, method: null, hasQuery: false };
  try {
    const params = new URLSearchParams(window.location.search);
    const viewParam = (params.get('view') || '').trim().toLowerCase();
    const depositParam = (params.get('deposit') || '').trim().toLowerCase();
    const methodParam = (params.get('method') || '').trim().toLowerCase();
    const isDepositDeepLink = viewParam === 'naptien' || depositParam === '1' || depositParam === 'true';
    let method = null;
    if (methodParam === 'card') method = 'card';
    else if (methodParam === 'banking' || methodParam === 'qr') method = 'banking';
    return {
      isDepositDeepLink,
      method,
      hasQuery: isDepositDeepLink || Boolean(method)
    };
  } catch {
    return { isDepositDeepLink: false, method: null, hasQuery: false };
  }
};

const hasCachedAuthUser = () => {
  try {
    const raw = localStorage.getItem('shop_cached_user');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.id);
  } catch {
    return false;
  }
};

const App = () => {
  const initialDeepLinkRef = useRef(null);
  if (initialDeepLinkRef.current === null) {
    initialDeepLinkRef.current = parseDepositDeepLink();
  }
  const initialMtcQueryRef = useRef(null);
  if (initialMtcQueryRef.current === null) {
    initialMtcQueryRef.current = parseMtcQueryRedirect();
  }
  const isProcessingActionRef = useRef(false);
  // --- BỘ ĐÀM GỬI EMAIL & TELEGRAM BÁO CHO ADMIN ---
  const sendAdminAlert = (actionName, detailMessage) => {
    const templateParams = {
      action: actionName,
      details: detailMessage,
    };

    // 1. Gửi qua EmailJS (Mặc định)
    emailjs.send(
      'service_f2gzbuj',
      'template_465wjp8',
      templateParams,
      'PpccbGTjm_SrgZAwu'
    ).then((response) => {
      console.log('Đã báo Email cho Admin!', response.status);
    }).catch((err) => {
      console.error('Lỗi gửi Email:', err);
    });

    // 2. Gửi qua Telegram Bot
    supabase.functions.invoke('telegram-bot', {
      body: { type: 'admin_alert', actionName, detailMessage }
    }).catch(err => console.error('Lỗi gửi Telegram:', err));
  };

  // --- HÀM GỬI MAIL THÔNG BÁO CHO KHÁCH KHI NẠP TIỀN THÀNH CÔNG ---
  const sendDepositSuccessEmail = async (userEmail, userName, amount) => {
    if (!userEmail) return; // Nếu khách chưa cập nhật email thì bỏ qua không gửi

    try {
      await emailjs.send(
        'service_f2gzbuj',    // Dán Service ID của bạn vào đây
        'template_vf13qjh',   // Dán Template ID báo nạp tiền
        {
          to_email: userEmail,
          to_name: userName || 'Khách hàng',
          amount: new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ',
          date: new Date().toLocaleString('vi-VN')
        },
        'PpccbGTjm_SrgZAwu'     // Dán Public Key của bạn vào đây
      );
      console.log("Đã tự động gửi mail báo nạp tiền cho khách!");
    } catch (error) {
      console.error("Lỗi gửi mail nạp tiền cho khách:", error);
    }
  };


  const [bossTargetId, setBossTargetId] = useState('');
  const [bossPlayerSummary, setBossPlayerSummary] = useState(null);
  const [, setBossPlayerNotFound] = useState(false);
  const [, setBossNotFoundQuery] = useState('');
  const [showBossProfileModal, setShowBossProfileModal] = useState(false);
  const [showBossStatModal, setShowBossStatModal] = useState(false);
  const [, setIsCheckingBossPlayer] = useState(false);
  const [selectedBossPackage, setSelectedBossPackage] = useState(null);
  const [isBuyingBossPackage, setIsBuyingBossPackage] = useState(false);
  const [bossSuccessModal, setBossSuccessModal] = useState(null);

  // --- STATE LIÊN KẾT OTP & TÚI ĐỒ (INVENTORY) ---
  const [showLinkOtpModal, setShowLinkOtpModal] = useState(false);
  const [linkOtpCode, setLinkOtpCode] = useState('');
  const [, setLinkOtpExpiresAt] = useState(null);
  const [linkOtpCountdown, setLinkOtpCountdown] = useState(120);
  const [, setIsWaitingOtp] = useState(false);
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [userLinkedPlatforms, setUserLinkedPlatforms] = useState({ discord: false, tiktok: false });
  const [linkOtpTarget, setLinkOtpTarget] = useState('all');

  // Tự động nhận diện nền tảng đã liên kết của tài khoản
  const isDiscordLinked = Boolean(
    bossPlayerSummary?.linked_discord ||
    userLinkedPlatforms.discord ||
    (bossPlayerSummary?.user_id && String(bossPlayerSummary.user_id).toLowerCase().startsWith('discord_'))
  );

  const isTikTokLinked = Boolean(
    bossPlayerSummary?.linked_tiktok ||
    userLinkedPlatforms.tiktok ||
    (bossPlayerSummary?.user_id && !String(bossPlayerSummary.user_id).toLowerCase().startsWith('discord_'))
  );
  const [showBagModal, setShowBagModal] = useState(false);
  const [activeBagCategory, setActiveBagCategory] = useState('all');
  const [bagVisibleCount, setBagVisibleCount] = useState(30);
  const [isPerformingBagAction, setIsPerformingBagAction] = useState(false);
  const [bagActionLoadingItem, setBagActionLoadingItem] = useState(null);
  // --- STATE SÀN ĐẤU GIÁ (AUCTION MARKET) ---
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [auctionMarketData, setAuctionMarketData] = useState({ active_listings: [], recent_sold: [] });
  const [auctionActiveTab, setAuctionActiveTab] = useState('market'); // 'market', 'my_listings', 'history'
  const [auctionCategoryFilter, setAuctionCategoryFilter] = useState('all');
  const [auctionSearchTerm, setAuctionSearchTerm] = useState('');
  const [showListItemModal, setShowListItemModal] = useState(false);
  const [selectedItemToList, setSelectedItemToList] = useState(null);
  const [listingPrice, setListingPrice] = useState(100);
  const [listingSellQuantity, setListingSellQuantity] = useState(1);
  const [listingPassword, setListingPassword] = useState('');
  const [buyingLockedListing, setBuyingLockedListing] = useState(null);
  const [buyPasscodePrompt, setBuyPasscodePrompt] = useState('');

  // --- STATE XƯỞNG RÈN LONG TỘC (FORGE LEVEL TRANSFER) ---
  const [showForgeModal, setShowForgeModal] = useState(false);
  const [selectedForgeItemA, setSelectedForgeItemA] = useState(null);
  const [selectedForgeItemB, setSelectedForgeItemB] = useState(null);
  const [showForgeSelectModal, setShowForgeSelectModal] = useState(null); // 'A' | 'B' | null
  const [forgeFilterCategory, setForgeFilterCategory] = useState('all');
  const [forgeFilterLocation, setForgeFilterLocation] = useState('all'); // 'all' | 'equipped' | 'inventory'
  const [forgeSearchQuery, setForgeSearchQuery] = useState('');
  const [isHammerStriking, setIsHammerStriking] = useState(false);
  const [isPerformingForgeAction, setIsPerformingForgeAction] = useState(false);
  const [forgeSuccessModal, setForgeSuccessModal] = useState(null);
  const lastSpinWinsFetchRef = useRef(0);
  const lastLinkedSyncRef = useRef({ uid: null, ts: 0 });

  useEffect(() => {
    if (bossTargetId) {
      localStorage.setItem('shop_boss_target_id', bossTargetId);
    }
  }, [bossTargetId]);

  const [usersDb, setUsersDb] = useState(() => { try { const saved = localStorage.getItem('shop_users_db'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
  const [visitorCount, setVisitorCount] = useState(0);
  const [accountsDb, setAccountsDb] = useState(() => {
    const saved = localStorage.getItem('shop_accounts_db');
    return saved ? JSON.parse(saved) : [];
  });
  // Tự động nhớ vị trí màn hình hiện tại (ưu tiên deep-link nạp tiền từ game, ?view=<screen>, hoặc ?view=mongthiencuu)
  const [currentView, setCurrentView] = useState(() => {
    const deepLink = initialDeepLinkRef.current;
    if (deepLink?.isDepositDeepLink) {
      return hasCachedAuthUser() ? 'naptien' : 'login';
    }
    if (initialMtcQueryRef.current?.viewMtc) {
      return 'mongthiencuu';
    }
    if (typeof window !== 'undefined') {
      try {
        const viewParam = (new URLSearchParams(window.location.search).get('view') || '').trim().toLowerCase();
        if (VALID_VIEWS.has(viewParam) && (viewParam !== 'donate' || isLocalhostUrlHost())) {
          return viewParam;
        }
      } catch { /* ignore */ }
    }
    return localStorage.getItem('shop_current_view') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('shop_current_view', currentView);
    setViewingAcc(null); // Tự động đóng modal xem chi tiết nick khi chuyển tab/trang khác
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/play')) return;
    if (initialMtcQueryRef.current?.shouldRedirectPlay) return;
    try {
      const url = new URL(window.location.href);
      const currentParam = (url.searchParams.get('view') || '').trim().toLowerCase();
      if (currentView === 'dashboard' || (currentView === 'donate' && !isLocalhostUrlHost())) {
        if (url.searchParams.has('view')) {
          url.searchParams.delete('view');
          const nextUrl = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''}${url.hash}`;
          window.history.replaceState(null, document.title, nextUrl);
        }
      } else if (VALID_VIEWS.has(currentView) && currentParam !== currentView) {
        url.searchParams.set('view', currentView);
        const nextUrl = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
        window.history.replaceState(null, document.title, nextUrl);
      }
    } catch { /* ignore */ }
  }, [currentView]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/play')) return;
      try {
        const viewParam = (new URLSearchParams(window.location.search).get('view') || '').trim().toLowerCase();
        if (VALID_VIEWS.has(viewParam) && (viewParam !== 'donate' || isLocalhostUrlHost())) {
          setCurrentView(viewParam);
        } else if (!viewParam) {
          setCurrentView('dashboard');
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  // Lấy data tạm từ RAM lên ngay lập tức lúc F5 để web không bị trống
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('shop_cached_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // REF: Theo dõi currentUser cho realtime handlers (tránh closure cũ)
  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  const [viewingAcc, setViewingAcc] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeBoostingTab, setActiveBoostingTab] = useState('rank');
  const [activeBoostingGameClient, setActiveBoostingGameClient] = useState('Tất cả');
  const [adminBoostingCategoryFilter, setAdminBoostingCategoryFilter] = useState('rank');
  const [adminBoostingGameFilter, setAdminBoostingGameFilter] = useState('Tất cả');
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  // STATE: Đồng hồ đếm ngược gửi OTP
  const [verifyCooldown, setVerifyCooldown] = useState(0);
  useEffect(() => {
    if (verifyCooldown > 0) {
      const timer = setTimeout(() => setVerifyCooldown(verifyCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [verifyCooldown]);

  // Đồng hồ đếm ngược mã OTP liên kết tài khoản game
  useEffect(() => {
    if (!showLinkOtpModal || linkOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setLinkOtpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsWaitingOtp(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showLinkOtpModal, linkOtpCountdown]);
  const [showSpinNotice, setShowSpinNotice] = useState(false);
  // --- HỆ THỐNG THÔNG BÁO & GIAO DIỆN RESPONSIVE ---
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // Chuẩn hóa dữ liệu ảnh cho bộ phóng to ảnh (Hỗ trợ cả chuỗi đơn lẻ lẫn danh sách ảnh kèm vị trí)
  const activeFullScreenData = useMemo(() => {
    if (!fullScreenImage) return null;
    if (typeof fullScreenImage === 'string') {
      return { images: [fullScreenImage], index: 0, title: '' };
    }
    if (Array.isArray(fullScreenImage)) {
      const valid = fullScreenImage.filter(Boolean);
      return { images: valid, index: 0, title: '' };
    }
    const imgs = Array.isArray(fullScreenImage.images)
      ? fullScreenImage.images.filter(Boolean)
      : (fullScreenImage.url ? [fullScreenImage.url] : []);
    const idx = typeof fullScreenImage.index === 'number' && fullScreenImage.index >= 0 && fullScreenImage.index < imgs.length
      ? fullScreenImage.index
      : 0;
    return {
      images: imgs,
      index: idx,
      title: fullScreenImage.title || ''
    };
  }, [fullScreenImage]);

  const handlePrevFullScreenImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!activeFullScreenData || activeFullScreenData.images.length <= 1) return;
    const newIndex = (activeFullScreenData.index - 1 + activeFullScreenData.images.length) % activeFullScreenData.images.length;
    setFullScreenImage(prev => ({
      ...(typeof prev === 'object' && prev !== null ? prev : {}),
      images: activeFullScreenData.images,
      index: newIndex,
      title: activeFullScreenData.title
    }));
    setSelectedImageIndex(newIndex);
  };

  const handleNextFullScreenImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!activeFullScreenData || activeFullScreenData.images.length <= 1) return;
    const newIndex = (activeFullScreenData.index + 1) % activeFullScreenData.images.length;
    setFullScreenImage(prev => ({
      ...(typeof prev === 'object' && prev !== null ? prev : {}),
      images: activeFullScreenData.images,
      index: newIndex,
      title: activeFullScreenData.title
    }));
    setSelectedImageIndex(newIndex);
  };

  // Điều khiển bằng phím mũi tên Trái / Phải & Phím Esc để thoát
  useEffect(() => {
    if (!fullScreenImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setFullScreenImage(null);
      } else if (e.key === 'ArrowLeft' && activeFullScreenData && activeFullScreenData.images.length > 1) {
        e.preventDefault();
        handlePrevFullScreenImage();
      } else if (e.key === 'ArrowRight' && activeFullScreenData && activeFullScreenData.images.length > 1) {
        e.preventDefault();
        handleNextFullScreenImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullScreenImage, activeFullScreenData]);

  // Hỗ trợ vuốt tay chuyển ảnh trên màn hình cảm ứng điện thoại (Fullscreen Viewer)
  const fsTouchStartXRef = useRef(0);
  const fsTouchStartYRef = useRef(0);
  const handleFullScreenTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    fsTouchStartXRef.current = e.touches[0].clientX;
    fsTouchStartYRef.current = e.touches[0].clientY;
  };
  const handleFullScreenTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const diffX = e.changedTouches[0].clientX - fsTouchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - fsTouchStartYRef.current;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handlePrevFullScreenImage();
      } else {
        handleNextFullScreenImage();
      }
    }
  };

  // Hỗ trợ vuốt tay chuyển ảnh trên màn hình cảm ứng điện thoại trong modal chi tiết acc
  const modalTouchStartXRef = useRef(0);
  const modalTouchStartYRef = useRef(0);
  const handleModalTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    modalTouchStartXRef.current = e.touches[0].clientX;
    modalTouchStartYRef.current = e.touches[0].clientY;
  };
  const handleModalTouchEnd = (e, total) => {
    if (!e.changedTouches || e.changedTouches.length === 0 || !total || total <= 1) return;
    const diffX = e.changedTouches[0].clientX - modalTouchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - modalTouchStartYRef.current;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        setSelectedImageIndex(prev => (prev - 1 + total) % total);
      } else {
        setSelectedImageIndex(prev => (prev + 1) % total);
      }
    }
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State quản lý menu trên điện thoại
  const [showUserDropdown, setShowUserDropdown] = useState(false); // State dropdown menu user

  // --- STATE MODALS ---
  const [buyModalData, setBuyModalData] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [rentModalData, setRentModalData] = useState(null);
  const [rentKycMethod, setRentKycMethod] = useState('cccd'); // State quản lý chọn CCCD hay Cọc tiền
  // STATE MỚI CHO BẢNG QUY ĐỊNH THUÊ NICK
  const [showRentRules, setShowRentRules] = useState(null);
  const [isRulesAccepted, setIsRulesAccepted] = useState(false);
  const [successTxData, setSuccessTxData] = useState(null);
  const [boostingModalData, setBoostingModalData] = useState(null);
  const [copiedText, setCopiedText] = useState('');
  const [awesunGuideType, setAwesunGuideType] = useState(null); // 'inside' or 'outside'
  // State cho Hộp quà vòng quay x1 & x10
  const [giftModalData, setGiftModalData] = useState(null);
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [spin10ModalData, setSpin10ModalData] = useState(null);
  const [isSpin10Opened, setIsSpin10Opened] = useState(false);
  const [spinActionType, setSpinActionType] = useState('x1'); // 'x1' hoặc 'x10'

  // --- CÁC STATE CỦA VÒNG QUAY ---
  const [isSpinning, setIsSpinning] = useState(false);
  const isSpinningRef = useRef(false);
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);
  const [rotation, setRotation] = useState(0);
  const [playMode, setPlayMode] = useState('money');

  // --- CẤU HÌNH ---
  const [depositBonusConfig, setDepositBonusConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('shop_deposit_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          minAmount: parsed.minAmount || 50000,
          bonusSpins: parsed.bonusSpins !== undefined ? parsed.bonusSpins : 1
        };
      }
    } catch { /* ignore */ }
    return {
      minAmount: 50000,
      bonusSpins: 1
    };
  });
  const [vouchersDb, setVouchersDb] = useState([]);
  const [adminSearchUser, setAdminSearchUser] = useState('');
  const [adminMessageSearch, setAdminMessageSearch] = useState('');
  const [historyTab, setHistoryTab] = useState(() => localStorage.getItem('shop_history_tab') || 'buy'); // Quản lý Tab đang mở
  useEffect(() => { localStorage.setItem('shop_history_tab', historyTab); }, [historyTab]);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(5); // Số lượng hiển thị mỗi lần cuộn
  const [visibleUsersCount, setVisibleUsersCount] = useState(8); // Ban đầu chỉ hiện 10 user
  const [visibleDepsClient, setVisibleDepsClient] = useState(5); // Nạp tiền (Khách)
  const [visibleDepsAdmin, setVisibleDepsAdmin] = useState(5);   // Nạp tiền (Admin)
  const [visibleRentsAdmin, setVisibleRentsAdmin] = useState(5); // Thuê nick (Admin)
  const [visibleSpinsClient, setVisibleSpinsClient] = useState(6); // Vòng quay (Khách)
  const [visibleSpinsAdmin, setVisibleSpinsAdmin] = useState(5);   // Vòng quay (Admin)
  const [wheelConfig, setWheelConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('shop_wheel_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          moneyCost: parsed.moneyCost || 20000,
          spinCost: parsed.spinCost || 1,
          ticketPrice: parsed.ticketPrice || 20000,
          ticketSaleEnabled: parsed.ticketSaleEnabled !== false,
          status: parsed.status || 'closed',
          startTime: parsed.startTime || '2026-10-15T00:00:00+07:00',
          endTime: parsed.endTime || '2026-10-31T23:59:59+07:00',
          pityTarget: parsed.pityTarget !== undefined ? Number(parsed.pityTarget) : 120
        };
      }
    } catch { /* ignore */ }
    return {
      moneyCost: 20000,
      spinCost: 1,
      ticketPrice: 20000,
      ticketSaleEnabled: true,
      status: 'closed',
      startTime: '2026-10-15T00:00:00+07:00',
      endTime: '2026-10-31T23:59:59+07:00',
      pityTarget: 120
    };
  });
  const [wheelConfigLoaded, setWheelConfigLoaded] = useState(false);



  const [transactionsDb, setTransactionsDb] = useState(() => { const saved = localStorage.getItem('shop_tx_db'); return saved ? JSON.parse(saved) : []; });
  const [depositRequests, setDepositRequests] = useState(() => { const saved = localStorage.getItem('shop_dep_db'); return saved ? JSON.parse(saved) : []; });
  const [rentRequests, setRentRequests] = useState(() => { const saved = localStorage.getItem('shop_rent_db'); return saved ? JSON.parse(saved) : []; });
  const [boostingRequests, setBoostingRequests] = useState(() => { const saved = localStorage.getItem('shop_boost_db'); return saved ? JSON.parse(saved) : []; });
  const [approveDepositModal, setApproveDepositModal] = useState(null);

  const [messagesDb, setMessagesDb] = useState(() => { try { const saved = localStorage.getItem('shop_msg_db'); return saved ? JSON.parse(saved) : [{ id: 1, senderId: 2, receiverId: 1, content: 'Chào bạn, chúc bạn mua sắm vui vẻ tại hệ thống!', timestamp: Date.now() - 3600000, isRead: false }]; } catch { return [{ id: 1, senderId: 2, receiverId: 1, content: 'Chào bạn, chúc bạn mua sắm vui vẻ tại hệ thống!', timestamp: Date.now() - 3600000, isRead: false }]; } });

  const [boostingDb, setBoostingDb] = useState(() => {
    const saved = localStorage.getItem('shop_boosting_db');
    return saved ? JSON.parse(saved) : [];
  });

  const [wheelItemsMoneyDb, setWheelItemsMoneyDb] = useState(() => { try { const saved = localStorage.getItem('shop_wheel_money'); return saved ? JSON.parse(saved).sort((a, b) => String(a.id).localeCompare(String(b.id))) : []; } catch { return []; } });
  const [wheelItemsSpinDb, setWheelItemsSpinDb] = useState(() => { try { const saved = localStorage.getItem('shop_wheel_spin'); return saved ? JSON.parse(saved).sort((a, b) => String(a.id).localeCompare(String(b.id))) : []; } catch { return []; } });

  // --- CẤU HÌNH & DỮ LIỆU SỰ KIỆN "LẬT THẺ BÀI PHÙ THỦY" ---
  const [wizardEventConfig, setWizardEventConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('shop_wizard_event_config');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {
      status: 'hidden', // 'hidden' (Mặc định ẩn ngoài sảnh, Admin tự bật trong Admin Panel)
      startTime: '2026-10-17T05:00:00+07:00',
      pityTarget: 120,
      flipCost: 1,
      bannerTitle: 'Sự Kiện Phù Thủy - Lật Thẻ Ma Thuật',
      bannerSubtitle: 'Lật bài săn Nón Huyền Thoại Phù Thủy - Chắc chắn trúng ở mốc 120 thẻ!'
    };
  });
  const [wizardConfigLoaded, setWizardConfigLoaded] = useState(false);

  // --- CẤU HÌNH & STATE TRANG SHOWCASE MỘNG THIÊN CỬU ---
  const [mtcGameConfig, setMtcGameConfig] = useState(() => {
    const defaults = {
      status: 'public', // 'hidden' (Chỉ Admin thấy) | 'public' (Hiển thị công khai)
      webPlayStatus: 'hidden', // 'hidden' (Ẩn chơi trên web khỏi khách thường, chỉ Admin nội bộ dùng) | 'public' (Hiện công khai)
      apkUrl: '/download/MongThienCuu_s0_beta_online.apk',
      webPlayUrl: 'https://shoptiengaming.com/play/',
      version: '2.6.0-s0-beta',
      notice: MTC_DEFAULT_SHOWCASE_NOTICE
    };
    try {
      const saved = localStorage.getItem('shop_mtc_game_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const normalizedWebUrl =
            !parsed.webPlayUrl || String(parsed.webPlayUrl).includes('.trycloudflare.com')
              ? defaults.webPlayUrl
              : parsed.webPlayUrl;
          const normalizedWebPlayStatus = parsed.webPlayStatus === 'public' ? 'public' : 'hidden';
          return {
            ...defaults,
            ...parsed,
            webPlayUrl: normalizedWebUrl,
            webPlayStatus: normalizedWebPlayStatus
          };
        }
      }
    } catch { /* ignore */ }
    return defaults;
  });
  const [mtcConfigLoaded, setMtcConfigLoaded] = useState(false);
  const [mtcAuthChecked, setMtcAuthChecked] = useState(false);
  const [mtcServerRegistry, setMtcServerRegistry] = useState(null);
  const [registerTurnstileToken, setRegisterTurnstileToken] = useState('');
  const [registerTurnstileReset, setRegisterTurnstileReset] = useState(0);
  const lastRegisterAttemptRef = useRef(0);

  const [wizardCardItems, setWizardCardItems] = useState(() => {
    try {
      const saved = localStorage.getItem('shop_wizard_card_items');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [
      {
        id: 'hat_wizard_legendary',
        name: 'Nón Phù Thủy Tối Thượng (Huyền Thoại)',
        category: 'Trang bị Nón',
        type: 'hat',
        value: 1,
        rate: 0.5,
        color: '#f59e0b',
        image: '/game-assets/hat_wizard_legendary.png',
        isLegendary: true,
        desc: 'Mũ Phù Thủy Huyền Thoại (+450 Phép & +250 Kháng Phép). Áp dụng bảo hiểm 120 lượt chắc chắn nhận!'
      },
      {
        id: 'item_the_reroll_sieucap',
        name: 'Thẻ Reroll Siêu Cấp',
        category: 'Vật phẩm tiêu hao',
        type: 'consumable',
        value: 1,
        rate: 4.5,
        color: '#ec4899',
        image: '/game-assets/item_the_reroll_sieucap.png',
        isLegendary: false,
        desc: 'Tẩy toàn bộ chỉ số trang bị và đảm bảo ít nhất 2 dòng Cam/Đỏ tối thượng!'
      },
      {
        id: 'item_the_dotpha_giay',
        name: 'Thẻ Đột Phá Giày Thần Tốc',
        category: 'Vật phẩm tiêu hao',
        type: 'consumable',
        value: 1,
        rate: 8.0,
        color: '#a855f7',
        image: '/game-assets/item_the_dotpha_giay.png',
        isLegendary: false,
        desc: 'Đột phá tăng bậc và mở khóa hiệu ứng ẩn cho Giày Thần Tốc.'
      },
      {
        id: 'item_spin_ticket_5',
        name: '5 Thẻ may mắn',
        category: 'Thẻ sự kiện',
        type: 'ticket',
        value: 5,
        rate: 12.0,
        color: '#3b82f6',
        image: '/game-assets/item_spin_ticket_5.png',
        isLegendary: false,
        desc: 'Nhận ngay +5 Thẻ may mắn (Lượt chơi chung Vòng Quay & Lật Thẻ Phù Thủy).'
      },
      {
        id: 'item_attack_turn',
        name: '+3 Lượt Đánh Boss',
        category: 'Vật phẩm tiêu hao',
        type: 'consumable',
        value: 3,
        rate: 15.0,
        color: '#10b981',
        image: '/game-assets/item_attack_turn.png',
        isLegendary: false,
        desc: 'Tăng ngay 3 lượt khiêu chiến Boss Thế Giới để săn trang bị quý hiếm.'
      },
      {
        id: 'gem_ruby',
        name: '500 Hồng Thạch (Ruby)',
        category: 'Tiền tệ',
        type: 'ruby',
        value: 500,
        rate: 18.0,
        color: '#f43f5e',
        image: '/game-assets/gem_ruby.png',
        isLegendary: false,
        desc: '500 Hồng ngọc quý hiếm dùng để mua vật phẩm cao cấp.'
      },
      {
        id: 'currency_coins',
        name: '50.000 Xu Nâng Cấp',
        category: 'Tiền tệ',
        type: 'coins',
        value: 50000,
        rate: 22.0,
        color: '#eab308',
        image: '/game-assets/currency_coins.png',
        isLegendary: false,
        desc: '50.000 Xu dùng để cường hóa trang bị và nâng cấp kỹ năng.'
      },
      {
        id: 'item_the_reroll',
        name: 'Thẻ Tẩy Luyện Thường',
        category: 'Vật phẩm tiêu hao',
        type: 'consumable',
        value: 2,
        rate: 20.0,
        color: '#06b6d4',
        image: '/game-assets/item_the_reroll.png',
        isLegendary: false,
        desc: 'Tẩy lại 1 dòng chỉ số bất kỳ của trang bị.'
      }
    ];
  });
  const [shoesPity, setShoesPity] = useState(() => {
    try {
      const savedUser = localStorage.getItem('shop_cached_user');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (u?.id) {
        const local = localStorage.getItem(`shop_shoes_pity_${u.id}`);
        if (local !== null) return parseInt(local) || 0;
        if (u.shoes_pity !== undefined) return parseInt(u.shoes_pity) || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (currentUser?.id) {
      const local = localStorage.getItem(`shop_shoes_pity_${currentUser.id}`);
      if (currentUser.shoes_pity !== undefined && currentUser.shoes_pity !== null) {
        const dbPity = parseInt(currentUser.shoes_pity) || 0;
        setShoesPity(dbPity);
        try { localStorage.setItem(`shop_shoes_pity_${currentUser.id}`, dbPity.toString()); } catch { /* ignore */ }
      } else if (local !== null) {
        setShoesPity(parseInt(local) || 0);
      }
    } else {
      setShoesPity(0);
    }
  }, [currentUser?.id, currentUser?.shoes_pity]);

  // --- BỘ ĐẾM BẢO HIỂM SỰ KIỆN "LẬT THẺ BÀI PHÙ THỦY" (120 LƯỢT) ---
  const [wizardPity, setWizardPity] = useState(() => {
    try {
      const savedUser = localStorage.getItem('shop_cached_user');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (u?.id) {
        const local = localStorage.getItem(`shop_wizard_pity_${u.id}`);
        if (local !== null) return parseInt(local) || 0;
        if (u.wizard_pity !== undefined) return parseInt(u.wizard_pity) || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (currentUser?.id) {
      const local = localStorage.getItem(`shop_wizard_pity_${currentUser.id}`);
      if (currentUser.wizard_pity !== undefined && currentUser.wizard_pity !== null) {
        const dbPity = parseInt(currentUser.wizard_pity) || 0;
        setWizardPity(dbPity);
        try { localStorage.setItem(`shop_wizard_pity_${currentUser.id}`, dbPity.toString()); } catch { /* ignore */ }
      } else if (local !== null) {
        setWizardPity(parseInt(local) || 0);
      }
    } else {
      setWizardPity(0);
    }
  }, [currentUser?.id, currentUser?.wizard_pity]);

  // --- ĐẾM NGƯỢC & QUẢN LÝ TRẠNG THÁI SỰ KIỆN VÒNG QUAY MAY MẮN (VQMM) ---
  const WHEEL_EVENT_START_TIME = useMemo(() => {
    if (wheelConfig?.startTime) {
      const ms = new Date(wheelConfig.startTime).getTime();
      if (!isNaN(ms)) return ms;
    }
    return new Date('2026-10-15T00:00:00+07:00').getTime();
  }, [wheelConfig?.startTime]);

  const WHEEL_EVENT_END_TIME = useMemo(() => {
    if (wheelConfig?.endTime) {
      const ms = new Date(wheelConfig.endTime).getTime();
      if (!isNaN(ms)) return ms;
    }
    return new Date('2026-10-31T23:59:59+07:00').getTime();
  }, [wheelConfig?.endTime]);

  const [currentEventNow, setCurrentEventNow] = useState(() => {
    if (typeof window !== 'undefined' && window.__MOCK_TIME__) {
      return new Date(window.__MOCK_TIME__).getTime();
    }
    return Date.now();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const nowMs = (typeof window !== 'undefined' && window.__MOCK_TIME__)
        ? new Date(window.__MOCK_TIME__).getTime()
        : Date.now();
      setCurrentEventNow(nowMs);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Chỉ true khi đã tải xong wheel_config từ DB và sự kiện thực sự đang mở công khai cho khách
  const isWheelEventPublicOpen = useMemo(() => {
    if (!wheelConfigLoaded) return false;
    const status = wheelConfig?.status || 'closed';
    if (status === 'hidden' || status === 'closed') return false;
    if (status === 'auto') {
      return currentEventNow >= WHEEL_EVENT_START_TIME && currentEventNow < WHEEL_EVENT_END_TIME;
    }
    // status === 'active': chỉ mở khi chưa quá hạn endTime
    return currentEventNow < WHEEL_EVENT_END_TIME;
  }, [wheelConfigLoaded, currentEventNow, WHEEL_EVENT_START_TIME, WHEEL_EVENT_END_TIME, wheelConfig?.status]);

  // Chỉ cho Admin xem trước (kèm badge "Ẩn") khi đặt chế độ "hidden" hoặc "auto" chưa tới giờ mở.
  // Khi đặt "closed" (Đóng Sự Kiện) hoặc đã quá hạn -> ẩn hoàn toàn cho cả Admin lẫn khách.
  const isWheelAdminPreview = useMemo(() => {
    if (!wheelConfigLoaded) return false;
    const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
    if (!isAdmin || isWheelEventPublicOpen) return false;
    const status = wheelConfig?.status || 'closed';
    if (status === 'hidden') return true;
    if (status === 'auto' && currentEventNow < WHEEL_EVENT_START_TIME) return true;
    return false;
  }, [wheelConfigLoaded, currentUser?.role, isWheelEventPublicOpen, wheelConfig?.status, currentEventNow, WHEEL_EVENT_START_TIME]);

  const isWheelEventExpired = useMemo(() => {
    return !(isWheelEventPublicOpen || isWheelAdminPreview);
  }, [isWheelEventPublicOpen, isWheelAdminPreview]);

  const wheelCountdown = useMemo(() => {
    const isUpcoming = currentEventNow < WHEEL_EVENT_START_TIME;
    const targetMs = isUpcoming ? WHEEL_EVENT_START_TIME : WHEEL_EVENT_END_TIME;
    const diff = Math.max(0, targetMs - currentEventNow);
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      isExpired: currentEventNow >= WHEEL_EVENT_END_TIME,
      isUpcoming,
      totalSeconds
    };
  }, [currentEventNow, WHEEL_EVENT_START_TIME, WHEEL_EVENT_END_TIME]);

  // Tự động kiểm tra xem Vòng Quay có phần thưởng khả dụng nào không
  const hasActiveWheelRewards = useMemo(() => {
    const allItems = [...(wheelItemsMoneyDb || []), ...(wheelItemsSpinDb || [])];
    return allItems.length > 0 && allItems.some(item => item && (item.quantity === undefined || item.quantity === null || item.quantity > 0));
  }, [wheelItemsMoneyDb, wheelItemsSpinDb]);

  useEffect(() => {
    if (!wheelConfigLoaded) return;
    if (currentView === 'vongquay' && (!hasActiveWheelRewards || isWheelEventExpired)) {
      if (isWheelEventExpired && typeof showToast === 'function') {
        const status = wheelConfig?.status || 'closed';
        if (status === 'hidden') {
          showToast("Sự kiện Vòng Quay May Mắn hiện đang tạm ẩn để bảo trì!", "info");
        } else if (status === 'closed') {
          showToast("Sự kiện Vòng Quay May Mắn hiện đã đóng!", "info");
        } else if (currentEventNow < WHEEL_EVENT_START_TIME) {
          showToast("Sự kiện Vòng Quay May Mắn chưa đến thời gian mở!", "info");
        } else {
          showToast("Sự kiện Vòng Quay May Mắn đã chính thức kết thúc!", "info");
        }
      }
      setCurrentView('dashboard');
    }
  }, [wheelConfigLoaded, currentView, hasActiveWheelRewards, isWheelEventExpired, wheelConfig?.status, currentEventNow, WHEEL_EVENT_START_TIME]);

  // --- LOGIC ẨN / HIỆN & PHÂN QUYỀN SỰ KIỆN PHÙ THỦY ---
  const isWizardEventOpen = useMemo(() => {
    if (!wizardConfigLoaded) return false;
    const status = wizardEventConfig?.status || 'hidden';
    if (status === 'hidden' || status === 'closed') return false;
    if (status === 'public') return true;
    const targetMs = new Date(wizardEventConfig?.startTime || wizardEventConfig?.start_time || '2026-10-17T05:00:00+07:00').getTime();
    // Chế độ 'auto': tự động mở khi đến/qua giờ hẹn startTime
    if (status === 'auto' && !isNaN(targetMs) && currentEventNow >= targetMs) return true;
    return false;
  }, [wizardConfigLoaded, wizardEventConfig, currentEventNow]);

  const isWizardEventVisible = useMemo(() => {
    if (!wizardConfigLoaded) return false;
    const status = wizardEventConfig?.status || 'hidden';
    if (status === 'closed') return false; // Đóng hẳn toàn web (ẩn cả Admin trên menu)
    if (currentUser?.role?.toLowerCase() === 'admin') return true; // Admin thấy kèm nhãn "Admin"/"Admin Test" khi hidden/auto
    return isWizardEventOpen;
  }, [wizardConfigLoaded, wizardEventConfig?.status, currentUser?.role, isWizardEventOpen]);

  const isWizardEventAccessible = useMemo(() => {
    if (!wizardConfigLoaded) return false;
    const status = wizardEventConfig?.status || 'hidden';
    if (status === 'closed') return false;
    if (currentUser?.role?.toLowerCase() === 'admin') return true;
    return isWizardEventOpen;
  }, [wizardConfigLoaded, wizardEventConfig?.status, currentUser?.role, isWizardEventOpen]);

  useEffect(() => {
    if (!wizardConfigLoaded) return;
    if (currentView === 'wizard' && !isWizardEventAccessible) {
      if (typeof showToast === 'function') {
        showToast('Sự kiện Lật Thẻ Bài Phù Thủy chưa mở hoặc đang tạm ẩn!', 'warning');
      }
      setCurrentView('dashboard');
    }
  }, [wizardConfigLoaded, currentView, isWizardEventAccessible]);

  // --- LOGIC ẨN / HIỆN CỔNG GAME MỘNG THIÊN CỬU H5 ---
  const isMtcGameOpen = useMemo(() => mtcGameConfig?.status === 'public', [mtcGameConfig?.status]);
  const isMtcGameVisible = useMemo(() => {
    if (currentUser?.role?.toLowerCase() === 'admin') return true;
    return isMtcGameOpen;
  }, [currentUser?.role, isMtcGameOpen]);
  const isMtcGameAccessible = isMtcGameVisible;
  const isMtcWebPlayPublic = useMemo(() => mtcGameConfig?.webPlayStatus === 'public', [mtcGameConfig?.webPlayStatus]);
  const canUseMtcWebPlay = useMemo(() => currentUser?.role?.toLowerCase() === 'admin' || isMtcWebPlayPublic, [currentUser?.role, isMtcWebPlayPublic]);

  useEffect(() => {
    if (!initialMtcQueryRef.current?.shouldRedirectPlay) return;
    if (!mtcConfigLoaded) return;
    if (!isMtcWebPlayPublic && !mtcAuthChecked) return;

    if (canUseMtcWebPlay) {
      if (typeof window !== 'undefined') {
        window.location.replace('/play/');
      }
      return;
    }

    initialMtcQueryRef.current = { ...initialMtcQueryRef.current, shouldRedirectPlay: false };
    setCurrentView('mongthiencuu');
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        let changed = false;
        ['play', 'game'].forEach((param) => {
          if (url.searchParams.has(param)) {
            url.searchParams.delete(param);
            changed = true;
          }
        });
        if (changed) {
          const cleanUrl = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''}${url.hash}`;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch { /* ignore */ }
    }
  }, [mtcConfigLoaded, mtcAuthChecked, isMtcWebPlayPublic, canUseMtcWebPlay]);

  useEffect(() => {
    if (currentView === 'mongthiencuu' && !isMtcGameAccessible) {
      if (typeof showToast === 'function') {
        showToast('Cổng Mộng Thiên Cửu H5 hiện đang tạm ẩn để bảo trì!', 'warning');
      }
      setCurrentView('dashboard');
    }
  }, [currentView, isMtcGameAccessible]);

  // Tự động tải các giao dịch quay thưởng mới nhất từ cộng đồng để hiển thị lên thanh vinh danh (chống spam query khi đổi tab)
  useEffect(() => {
    if (currentView !== 'dashboard' && currentView !== 'vongquay') return undefined;
    const nowMs = Date.now();
    if (nowMs - lastSpinWinsFetchRef.current < 120000) return undefined;
    lastSpinWinsFetchRef.current = nowMs;

    let isSubscribed = true;
    const fetchPublicSpinWins = async () => {
      try {
        const { data: publicWins } = await supabase
          .from('transactions')
          .select('*')
          .eq('type', 'spin_win')
          .order('created_at', { ascending: false })
          .limit(30);

        if (publicWins && isSubscribed) {
          setTransactionsDb(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newItems = publicWins.filter(w => !existingIds.has(w.id));
            if (newItems.length === 0) return prev;
            return [...newItems, ...prev];
          });
        }
      } catch { /* ignore */ }
    };

    fetchPublicSpinWins();
    return () => { isSubscribed = false; };
  }, [currentView]);

  // --- LIFTED STATES TỪ CÁC TAB ĐỂ TRÁNH MẤT FOCUS KHI COMPONENT RENDER LẠI ---
  const [profileTab, setProfileTab] = useState('info');
  const messagesEndRef = useRef(null);

  const [isDepositing, setIsDepositing] = useState(false);
  const [depositMethod, setDepositMethod] = useState(() => {
    const deepLink = initialDeepLinkRef.current;
    if (deepLink?.method) return deepLink.method;
    const savedPostLoginMethod = sessionStorage.getItem('post_login_deposit_method');
    if (savedPostLoginMethod === 'card' || savedPostLoginMethod === 'banking') {
      return savedPostLoginMethod;
    }
    return 'banking';
  });

  // Xử lý deep-link nạp tiền từ game (?view=naptien&method=banking|card hoặc ?deposit=1)
  useEffect(() => {
    const deepLink = parseDepositDeepLink();
    if (!deepLink.hasQuery) return;

    const isAuth = hasCachedAuthUser();
    if (deepLink.method) {
      setDepositMethod(deepLink.method);
    }

    if (deepLink.isDepositDeepLink) {
      if (isAuth) {
        setCurrentView('naptien');
      } else {
        sessionStorage.setItem('post_login_view', 'naptien');
        if (deepLink.method) {
          sessionStorage.setItem('post_login_deposit_method', deepLink.method);
        }
        setCurrentView('login');
      }
    } else if (deepLink.method && !isAuth) {
      sessionStorage.setItem('post_login_deposit_method', deepLink.method);
    }

    try {
      const url = new URL(window.location.href);
      let changed = false;
      ['deposit', 'method'].forEach((param) => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param);
          changed = true;
        }
      });
      if (changed) {
        const cleanUrl = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''}${url.hash}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch { /* ignore */ }
  }, []);
  const [depositAmount, setDepositAmount] = useState('');
  const [voucherInput, setVoucherInput] = useState('');
  const [payosPaymentData, setPayosPaymentData] = useState(null);
  const [payosSuccess, setPayosSuccess] = useState(false);
  const [payosTimeLeft, setPayosTimeLeft] = useState(600);
  const [liveCardError, setLiveCardError] = useState(null);
  const [cardTelco, setCardTelco] = useState('VIETTEL');
  const [cardAmount, setCardAmount] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [cardSerial, setCardSerial] = useState('');

  const handleCancelDepositClient = async (id) => {
    setConfirmDialog({
      title: 'Hủy đơn nạp',
      message: 'Bạn có chắc chắn muốn hủy đơn nạp tiền này không?',
      onConfirm: async () => {
        const { error } = await supabase.from('deposit_requests').update({ status: 'Đã hủy' }).eq('id', id);
        if (error) {
          showToast("Lỗi khi hủy đơn: " + error.message, 'error');
        } else {
          setDepositRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Đã hủy' } : req));
          setPayosPaymentData(null);
          showToast("Đã hủy đơn nạp thành công!", 'success');

          // Xóa tin nhắn Telegram
          supabase.functions.invoke('telegram-bot', {
            body: { type: 'delete_request', requestId: id }
          }).catch(err => console.error("Lỗi xóa tin nhắn Telegram:", err));
        }
      }
    });
  };

  const [expandedTx, setExpandedTx] = useState(null);

  const [adminTab, setAdminTab] = useState(() => localStorage.getItem('shop_admin_tab') || 'users');
  useEffect(() => { localStorage.setItem('shop_admin_tab', adminTab); }, [adminTab]);
  useEffect(() => {
    if (currentUser?.role?.toLowerCase() === 'admin' && currentView === 'admin' && adminTab === 'mtc' && !mtcServerRegistry) {
      handleRefreshMtcTunnel(true);
    }
  }, [currentUser?.role, currentView, adminTab, mtcServerRegistry]);
  const [adminWheelType, setAdminWheelType] = useState('money');
  const [showAccModal, setShowAccModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [adminCoverImage, setAdminCoverImage] = useState(null);
  const [adminDetailImages, setAdminDetailImages] = useState([]);
  const [adminRentOptions, setAdminRentOptions] = useState([{ time: '', price: '' }]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const [globalProgressText, setGlobalProgressText] = useState('');
  const [isConfirmProcessing, setIsConfirmProcessing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewUserHistory, setViewUserHistory] = useState(null);
  const [showBoostingModal, setShowBoostingModal] = useState(false);
  const [editingBoosting, setEditingBoosting] = useState(null);
  const [adminBoostType, setAdminBoostType] = useState('rank');
  const [isEventMultiPackage, setIsEventMultiPackage] = useState(false);
  const [adminRankOptions, setAdminRankOptions] = useState([{ rank: '', price: '', comboPrice: '', inputType: 'bac', maxPoints: '', basePoints: '', tierCount: 1 }]);
  const [adminGame, setAdminGame] = useState('');
  const [crossfireText, setCrossfireText] = useState('');
  const [adminConfigType, setAdminConfigType] = useState('rank_price');
  const [selectedBoostRank, setSelectedBoostRank] = useState(0);
  const [boostSubTier, setBoostSubTier] = useState('');

  // Helper: số → La Mã (1-10)
  const toRoman = (n) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n - 1] || n.toString();
  const [boostCurrentPoints, setBoostCurrentPoints] = useState('');
  const [boostTargetPoints, setBoostTargetPoints] = useState('');
  const [boostTargetRank, setBoostTargetRank] = useState('');
  const [boostQuantity, setBoostQuantity] = useState(1);
  const [adminBoostingImage, setAdminBoostingImage] = useState([]);
  const [adminGameAvatar, setAdminGameAvatar] = useState(null);
  const [adminAccGameAvatar, setAdminAccGameAvatar] = useState(null);

  const getGameInfo = (gameStr) => {
    if (!gameStr) return { name: '', avatar: null, isFeatured: false, allowQuantity: false, maxQuantityPerOrder: 0 };
    try {
      const parsed = JSON.parse(gameStr);
      if (parsed && typeof parsed === 'object') return { name: parsed.name || gameStr, avatar: parsed.avatar || null, isFeatured: parsed.isFeatured || false, allowQuantity: parsed.allowQuantity || false, maxQuantityPerOrder: parsed.maxQuantityPerOrder || 0 };
    } catch { /* ignore */ }
    return { name: gameStr, avatar: null, isFeatured: false, allowQuantity: false, maxQuantityPerOrder: 0 };
  };
  const [adminBoostingPriceUnit, setAdminBoostingPriceUnit] = useState('');
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [editingWheel, setEditingWheel] = useState(null);
  const [adminWheelImage, setAdminWheelImage] = useState(null);
  const [adminWheelRewardType, setAdminWheelRewardType] = useState('game_attacks');
  const [adminWheelNotify, setAdminWheelNotify] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [editRentModal, setEditRentModal] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const chatMessagesEndRef = useRef(null);

  // CCCD Preview cho form thuê
  const [, setKycImagePreview] = useState(null);
  // --- ĐOẠN NÀY ĐỂ HÚT DỮ LIỆU TỪ MÁY CHỦ SUPABASE ---
  // Tự động kiểm tra mỗi khi khách chuyển trang
  // STATE: Ghi nhớ việc khách bấm "Không hiển thị lại" (Lưu trên RAM, F5 là tự reset về false)
  const [dismissNotice, setDismissNotice] = useState(false);
  const [showSpinRules, setShowSpinRules] = useState(false);
  const [dismissSpinRules, setDismissSpinRules] = useState(false);
  const [commentsDb, setCommentsDb] = useState(() => { const saved = localStorage.getItem('shop_comments_db'); return saved ? JSON.parse(saved) : []; });
  const [showReportedCommentsModal, setShowReportedCommentsModal] = useState(false);
  const [showEditHistoryId, setShowEditHistoryId] = useState(null);

  // 1. Kích hoạt bảng Trang Chủ (Sảnh chính)
  useEffect(() => {
    if (currentView === 'dashboard' && !dismissNotice && hasActiveWheelRewards && isWheelEventPublicOpen) {
      // Đợi 0.3s cho web load xong giao diện rồi mới nảy bảng lên (Tránh bị React nuốt lệnh)
      const timer = setTimeout(() => setShowSpinNotice(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowSpinNotice(false); // Chuyển sang tab khác hoặc khi sự kiện ẩn/đóng là tự động tắt bảng
    }
  }, [currentView, dismissNotice, hasActiveWheelRewards, isWheelEventPublicOpen]);

  // 2. Kích hoạt bảng Vòng Quay
  useEffect(() => {
    if (currentView === 'vongquay' && !dismissSpinRules) {
      const timer = setTimeout(() => setShowSpinRules(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowSpinRules(false);
    }
  }, [currentView, dismissSpinRules]); useEffect(() => {
    const fetchInitialData = async () => {

      // 1. TẢI CÁC DỮ LIỆU CÔNG KHAI NGAY LẬP TỨC

      // 1. CHẠY SONG SONG CÁC TIẾN TRÌNH ĐỂ GIẢM ĐỘ TRỄ & TIẾT KIỆM EGRESS SUPABASE
      const publicDataPromise = Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('boosting').select('*').order('id', { ascending: false }),
        supabase.from('wheel_items').select('*').order('id', { ascending: true }),
        supabase.from('vouchers').select('*'),
        supabase.from('comments').select('*, users(name, avatar_url, role)').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(200)
      ]).then(([accRes, boostRes, wheelRes, voucherRes, commentsRes]) => {
        if (accRes.data) {
          const fixedAccounts = accRes.data.map(acc => {
            let fixedRentOptions = acc.rentOptions;
            if (typeof fixedRentOptions === 'string') {
              try { fixedRentOptions = JSON.parse(fixedRentOptions); } catch { fixedRentOptions = []; }
            }
            if (!Array.isArray(fixedRentOptions)) fixedRentOptions = [];

            let fixedDetailImages = acc.detailImages;
            if (typeof fixedDetailImages === 'string') {
              try { fixedDetailImages = JSON.parse(fixedDetailImages); } catch { fixedDetailImages = []; }
            }
            if (!Array.isArray(fixedDetailImages)) fixedDetailImages = [];

            let fixedTags = acc.tags;
            if (typeof fixedTags === 'string') {
              try {
                let parsed = JSON.parse(fixedTags);
                fixedTags = Array.isArray(parsed) ? parsed : fixedTags.split(',').map(t => t.trim());
              } catch {
                fixedTags = fixedTags.split(',').map(t => t.trim());
              }
            }
            if (!Array.isArray(fixedTags)) fixedTags = [];

            return {
              ...acc,
              rentOptions: fixedRentOptions,
              detailImages: fixedDetailImages,
              tags: fixedTags,
              rentedUntil: acc.rentedUntil || acc.renteduntil || null,
              rentStartedAt: acc.rentStartedAt || acc.rentstartedat || null,
              currentRenterId: acc.currentRenterId || acc.currentrenterid || null
            };
          });
          setAccountsDb(fixedAccounts);
          localStorage.setItem('shop_accounts_db', JSON.stringify(fixedAccounts));
        }
        if (boostRes.data) {
          setBoostingDb(boostRes.data);
          localStorage.setItem('shop_boosting_db', JSON.stringify(boostRes.data));
        }
        if (wheelRes.data) {
          const sortedWheelRes = [...wheelRes.data].sort((a, b) => String(a.id).localeCompare(String(b.id)));
          const moneyItems = sortedWheelRes.filter(w => w.wheel_type === 'money').map(w => ({
            ...w,
            notify_on_win: w.notify_on_win !== undefined && w.notify_on_win !== null ? Boolean(w.notify_on_win) : getWheelNotifyFallback(w.id)
          }));
          const spinItems = sortedWheelRes.filter(w => w.wheel_type === 'spin').map(w => {
            const n = String(w.name || '').toLowerCase();
            const t = String(w.type || '').toLowerCase();
            let img = w.image;
            if (t === 'game_shoes_legendary' || n.includes('giày')) {
              img = getShoesImage(img) || LEGENDARY_SHOES_IMG;
            } else if (!img) {
              if (t === 'game_coins' || n.includes('xu')) img = '/game-assets/gold_coin.png';
              else if (t === 'game_attacks' || n.includes('lượt đánh') || n.includes('đánh boss')) img = '/game-assets/weapon_song_dao.png';
              else if (t === 'game_boss_chests' || n.includes('hòm boss')) img = '/game-assets/mystery_box_closed.png';
              else if (t === 'game_royal_chests' || n.includes('hoàng kim')) img = '/game-assets/royal_chest.png';
              else if (t === 'game_essence_stone' || n.includes('tinh hoa')) img = '/game-assets/da_tinh_hoa.png';
              else if (t === 'game_ring_crystal' || n.includes('tinh thể')) img = '/game-assets/ring_crystal.png';
            }

            const itemNotify = w.notify_on_win !== undefined && w.notify_on_win !== null ? Boolean(w.notify_on_win) : getWheelNotifyFallback(w.id);

            if (n.includes('xu') && (w.type === 'other' || w.type === 'game_coins' || w.id === 'WHEEL_GAME_COINS')) {
              return {
                ...w,
                image: img,
                type: 'game_coins',
                name: (w.name && w.name.includes('50,000')) ? '+20 Xu Nâng Cấp' : (w.name || '+20 Xu Nâng Cấp'),
                value: (w.value === 50000 || !w.value) ? 20 : Number(w.value),
                rate: (w.rate === '25%' && (w.value === 20 || w.value === 50000)) ? '5%' : w.rate,
                notify_on_win: itemNotify
              };
            }
            if (w.id === 'WHEEL_GAME_NONE' && w.rate === '24.5%') {
              return { ...w, image: img, rate: '44.5%', notify_on_win: itemNotify };
            }
            return { ...w, image: img, notify_on_win: itemNotify };
          });
          setWheelItemsMoneyDb(moneyItems);
          setWheelItemsSpinDb(spinItems);
          try { localStorage.setItem('shop_wheel_money', JSON.stringify(moneyItems)); } catch { /* ignore */ }
          try { localStorage.setItem('shop_wheel_spin', JSON.stringify(spinItems)); } catch { /* ignore */ }
        }
        if (voucherRes.data) setVouchersDb(voucherRes.data);
        if (commentsRes && commentsRes.data) {
          setCommentsDb(commentsRes.data);
          localStorage.setItem('shop_comments_db', JSON.stringify(commentsRes.data));
        }
      });

      // GỘP 5 TRUY VẤN site_config THÀNH 1 REQUEST DUY NHẤT (tránh tải game_auction_market ~103KB)
      const configPromise = (async () => {
        try {
          const { data: cfgRows } = await supabase
            .from('site_config')
            .select('id, value')
            .in('id', ['deposit_bonus', 'wheel_config', 'wizard_event_config', 'wizard_card_items', 'mtc_game_config']);

          const cfgMap = new Map((cfgRows || []).map((row) => [row.id, row.value]));

          const depositVal = cfgMap.get('deposit_bonus');
          if (depositVal) {
            setDepositBonusConfig(depositVal);
            localStorage.setItem('shop_deposit_config', JSON.stringify(depositVal));
          } else {
            const savedDepositConfig = localStorage.getItem('shop_deposit_config');
            if (savedDepositConfig) {
              try { setDepositBonusConfig(JSON.parse(savedDepositConfig)); } catch { /* ignore */ }
            }
          }

          const wheelVal = cfgMap.get('wheel_config');
          if (wheelVal) {
            setWheelConfig(prev => {
              const merged = { ...prev, ...wheelVal };
              try { localStorage.setItem('shop_wheel_config', JSON.stringify(merged)); } catch { /* ignore */ }
              return merged;
            });
          }

          const wzCfgVal = cfgMap.get('wizard_event_config');
          if (wzCfgVal) {
            setWizardEventConfig(prev => ({ ...prev, ...wzCfgVal }));
            localStorage.setItem('shop_wizard_event_config', JSON.stringify(wzCfgVal));
          }

          const wzItemsVal = cfgMap.get('wizard_card_items');
          if (Array.isArray(wzItemsVal) && wzItemsVal.length > 0) {
            setWizardCardItems(wzItemsVal);
            localStorage.setItem('shop_wizard_card_items', JSON.stringify(wzItemsVal));
          }

          const mtcVal = cfgMap.get('mtc_game_config');
          if (mtcVal) {
            setMtcGameConfig(prev => {
              const merged = {
                ...prev,
                ...mtcVal,
                webPlayStatus: mtcVal.webPlayStatus === 'public' ? 'public' : 'hidden'
              };
              try { localStorage.setItem('shop_mtc_game_config', JSON.stringify(merged)); } catch { /* ignore */ }
              return merged;
            });
          }
        } catch {
          const savedDepositConfig = localStorage.getItem('shop_deposit_config');
          if (savedDepositConfig) {
            try { setDepositBonusConfig(JSON.parse(savedDepositConfig)); } catch { /* ignore */ }
          }
        } finally {
          setWheelConfigLoaded(true);
          setWizardConfigLoaded(true);
          setMtcConfigLoaded(true);
        }
      })();

      // 2. KIỂM TRA ĐĂNG NHẬP NGẦM & TẢI DỮ LIỆU THEO CHỨC VỤ (CHẠY SONG SONG VỚI PUBLIC DATA)
      const userDataPromise = (async () => {
        try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Tìm xem ai đang đăng nhập
          const { data: user } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at, linked_game_id, shoes_pity').eq('id', session.user.id).single();

          if (user && !user.is_locked) {
            // Tra cứu linked_game_id từ Supabase game_orders (OTP completed) - ưu tiên server để tránh cache sai lệch giữa các tài khoản
            let linkedGameId = null;
            try {
              const { data: completedOtp } = await supabase
                .from('game_orders')
                .select('result, user_id')
                .eq('package_id', 'account_link_otp')
                .eq('status', 'completed')
                .or(`web_user.eq."${user.id}",rewards->>web_user_id.eq."${user.id}"`)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              if (completedOtp) {
                linkedGameId = completedOtp.result?.game_user_id || completedOtp.user_id;
              }
            } catch (e) {
              console.log("OTP link lookup:", e);
            }

            if (!linkedGameId && user.linked_game_id) {
              linkedGameId = user.linked_game_id;
            }
            if (!linkedGameId) {
              linkedGameId = localStorage.getItem(`shop_linked_game_id_${user.id}`);
            }

            if (linkedGameId) {
              localStorage.setItem(`shop_linked_game_id_${user.id}`, linkedGameId);
              if (!user.linked_game_id) {
                supabase.from('users').update({ linked_game_id: linkedGameId }).eq('id', user.id).then(() => {});
              }
            } else {
              localStorage.removeItem(`shop_linked_game_id_${user.id}`);
            }
            const enrichedUser = linkedGameId ? { ...user, linked_game_id: linkedGameId } : user;

            // TỰ ĐỘNG CỘNG LƯỢT QUAY KHI MUA VÉ VÒNG QUAY TỪ GAME
            try {
              let spinFilter = `web_user.eq."${user.id}"`;
              if (linkedGameId) {
                const cleanL = linkedGameId.toLowerCase().replace(/^@/, '');
                spinFilter += `,user_id.eq."${cleanL}",user_id.eq."@${cleanL}"`;
              }
              const { data: pendingSpinOrders } = await supabase
                .from('game_orders')
                .select('id, rewards')
                .eq('package_id', 'add_spin_tickets')
                .eq('status', 'pending')
                .or(spinFilter);

              if (pendingSpinOrders && pendingSpinOrders.length > 0) {
                const pendingIds = pendingSpinOrders.map(spo => spo.id).filter(Boolean);
                if (pendingIds.length > 0) {
                  const { data: claimRes, error: claimErr } = await supabase.rpc('rpc_claim_spin_tickets', {
                    p_order_ids: pendingIds
                  });
                  if (!claimErr && claimRes?.success && claimRes.claimed_spins > 0) {
                    enrichedUser.spins = claimRes.new_spins;
                    setTimeout(() => {
                      showToast(`🎉 Bạn vừa nhận được +${claimRes.claimed_spins} Lượt Quay Vòng Quay từ nhân vật game!`, 'success');
                    }, 1200);
                  }
                }
              }
            } catch (e_spin) {
              console.warn("Lỗi đồng bộ vé quay từ game:", e_spin);
            }

            setCurrentUser(enrichedUser);
            localStorage.setItem('shop_cached_user', JSON.stringify(enrichedUser));
            const pendingView = initialDeepLinkRef.current?.isDepositDeepLink
              ? 'naptien'
              : sessionStorage.getItem('post_login_view');
            const pendingMethod = initialDeepLinkRef.current?.method
              || sessionStorage.getItem('post_login_deposit_method');
            initialDeepLinkRef.current = { isDepositDeepLink: false, method: null, hasQuery: false };
            sessionStorage.removeItem('post_login_view');
            sessionStorage.removeItem('post_login_deposit_method');
            if (pendingMethod === 'card' || pendingMethod === 'banking') {
              setDepositMethod(pendingMethod);
            }
            if (pendingView) {
              setCurrentView(pendingView);
            }

            // GIẢI QUYẾT LỖI MẤT QUYỀN ADMIN (Chữ Hoa/Thường)
            const role = (user.role || 'user').toLowerCase();

            if (role === 'admin') {
              // QUYỀN ADMIN: TẢI TOÀN BỘ DATABASE VỀ PANEL
              const [usersRes, txRes, depRes, rentRes, msgRes, boostReqRes] = await Promise.all([
                supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at, linked_game_id, shoes_pity').order('id', { ascending: false }),
                supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(300),
                supabase.from('deposit_requests').select('*').neq('type', 'live_donate').order('created_at', { ascending: false }).limit(300),
                supabase.from('rent_requests').select('*').order('created_at', { ascending: false }).limit(200),
                supabase.from('messages').select('*').order('timestamp', { ascending: true }).limit(500),
                supabase.from('boosting_requests').select('*').order('created_at', { ascending: false }).limit(200)
              ]);

              if (usersRes.data) { setUsersDb(usersRes.data); try { localStorage.setItem('shop_users_db', JSON.stringify(usersRes.data)); } catch { /* ignore */ } }
              if (txRes.data) { setTransactionsDb(txRes.data); try { localStorage.setItem('shop_tx_db', JSON.stringify(txRes.data)); } catch { /* ignore */ } }
              if (depRes.data) { setDepositRequests(depRes.data); try { localStorage.setItem('shop_dep_db', JSON.stringify(depRes.data)); } catch { /* ignore */ } }
              if (msgRes.data) { setMessagesDb(msgRes.data); try { localStorage.setItem('shop_msg_db', JSON.stringify(msgRes.data)); } catch { /* ignore */ } }
              if (boostReqRes.data) {
                const fixedBoostReqs = boostReqRes.data.map(r => {
                  let parsedInfo = r.info;
                  if (typeof parsedInfo === 'string') {
                    try { parsedInfo = JSON.parse(parsedInfo); } catch { parsedInfo = {}; }
                  }
                  return {
                    ...r,
                    info: parsedInfo || {},
                    boostingTitle: r.boostingTitle || r.boostingtitle || '',
                    boostingId: r.boostingId || r.boostingid || ''
                  };
                });
                setBoostingRequests(fixedBoostReqs);
                try { localStorage.setItem('shop_boost_db', JSON.stringify(fixedBoostReqs)); } catch { /* ignore */ }
              }
              if (rentRes.data) {
                const fixedRentReqs = rentRes.data.map(r => ({
                  ...r,
                  accCode: r.accCode || r.acccode || '',
                  userId: r.userId || r.userid || ''
                }));
                setRentRequests(fixedRentReqs);
                try { localStorage.setItem('shop_rent_db', JSON.stringify(fixedRentReqs)); } catch { /* ignore */ }
              }
            } else {
              // QUYỀN KHÁCH: CHỈ TẢI CỦA KHÁCH
              const [myTx, myDep, myRent, myMsg, myBoostReq, adminRes] = await Promise.all([
                supabase.from('transactions').select('*').eq('user', user.name).order('created_at', { ascending: false }).limit(100),
                supabase.from('deposit_requests').select('*').eq('userId', session.user.id).neq('type', 'live_donate').order('created_at', { ascending: false }).limit(100),
                supabase.from('rent_requests').select('*').eq('userId', session.user.id).order('created_at', { ascending: false }).limit(100),
                supabase.from('messages').select('*').or(`senderId.eq.${session.user.id},receiverId.eq.${session.user.id}`).order('timestamp', { ascending: true }).limit(2000),
                supabase.from('boosting_requests').select('*').eq('user', user.name).order('created_at', { ascending: false }).limit(100), // <--- Đã thêm lệnh lấy Cày Thuê
                supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at, linked_game_id, shoes_pity').eq('role', 'admin').limit(1).maybeSingle()
              ]);

              if (myTx.data) { setTransactionsDb(myTx.data); try { localStorage.setItem('shop_tx_db', JSON.stringify(myTx.data)); } catch { /* ignore */ } }
              if (myDep.data) { setDepositRequests(myDep.data); try { localStorage.setItem('shop_dep_db', JSON.stringify(myDep.data)); } catch { /* ignore */ } }
              if (myMsg.data) { setMessagesDb(myMsg.data); try { localStorage.setItem('shop_msg_db', JSON.stringify(myMsg.data)); } catch { /* ignore */ } }
              if (adminRes.data) { setUsersDb([adminRes.data]); try { localStorage.setItem('shop_users_db', JSON.stringify([adminRes.data])); } catch { /* ignore */ } }
              if (myRent.data) {
                const fixedRentReqs = myRent.data.map(r => ({
                  ...r,
                  accCode: r.accCode || r.acccode || '',
                  userId: r.userId || r.userid || ''
                }));
                setRentRequests(fixedRentReqs);
                try { localStorage.setItem('shop_rent_db', JSON.stringify(fixedRentReqs)); } catch { /* ignore */ }
              }
              // Lọc và hiển thị Cày Thuê cho khách
              if (myBoostReq.data) {
                const fixedBoostReqs = myBoostReq.data.map(r => {
                  let parsedInfo = r.info;
                  if (typeof parsedInfo === 'string') {
                    try { parsedInfo = JSON.parse(parsedInfo); } catch { parsedInfo = {}; }
                  }
                  return {
                    ...r,
                    info: parsedInfo || {},
                    boostingTitle: r.boostingTitle || r.boostingtitle || '',
                    boostingId: r.boostingId || r.boostingid || ''
                  };
                });
                setBoostingRequests(fixedBoostReqs);
                try { localStorage.setItem('shop_boost_db', JSON.stringify(fixedBoostReqs)); } catch { /* ignore */ }
              }
            }
          }
        } else {
          if (localStorage.getItem('shop_cached_user')) {
            localStorage.removeItem('shop_cached_user');
            localStorage.removeItem('shop_tx_db');
            localStorage.removeItem('shop_dep_db');
            localStorage.removeItem('shop_rent_db');
            localStorage.removeItem('shop_boost_db');
            localStorage.removeItem('shop_users_db');
            localStorage.removeItem('shop_msg_db');
            localStorage.removeItem('shop_comments_db');
            setCurrentUser(null);
            if (initialDeepLinkRef.current?.isDepositDeepLink) {
              sessionStorage.setItem('post_login_view', 'naptien');
              if (initialDeepLinkRef.current.method) {
                sessionStorage.setItem('post_login_deposit_method', initialDeepLinkRef.current.method);
              }
            } else if (initialDeepLinkRef.current?.method) {
              sessionStorage.setItem('post_login_deposit_method', initialDeepLinkRef.current.method);
            }
            setCurrentView('login');
            showToast("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!", "error");
          }
        }
        } finally {
          setMtcAuthChecked(true);
        }
      })();

      // ĐỢI CẢ 3 TIẾN TRÌNH HOÀN THÀNH (Tiết kiệm được ít nhất 2 vòng chờ mạng)
      await Promise.all([publicDataPromise, configPromise, userDataPromise]);
    };

    fetchInitialData();

    // --- HỆ THỐNG ĐẾM LƯỢT TRUY CẬP ---
    const trackVisitor = async () => {
      const { data } = await supabase.from('site_stats').select('views').eq('id', 1).maybeSingle();
      let currentViews = data ? data.views : 0;

      // Dùng sessionStorage để khách F5 không bị cộng dồn ảo (Chỉ tính 1 lượt/1 phiên mở web)
      if (!sessionStorage.getItem('has_visited')) {
        currentViews += 1;
        if (data) {
          await supabase.from('site_stats').update({ views: currentViews }).eq('id', 1);
        } else {
          await supabase.from('site_stats').insert([{ id: 1, views: currentViews }]);
        }
        sessionStorage.setItem('has_visited', 'true');
      }
      setVisitorCount(currentViews);
    };

    trackVisitor();
  }, []);
  // Global Time State
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // --- HỆ THỐNG LẮNG NGHE DỮ LIỆU REALTIME (GOM KÊNH ĐỂ TIẾT KIỆM FREE TIER SUPABASE) ---
  // Kênh 1: Dữ liệu công khai chung (1 kênh duy nhất cho wheel_items, comments, accounts, boosting)
  useEffect(() => {
    const publicChannel = supabase.channel('realtime-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wheel_items' }, async () => {
        try {
          if (isSpinningRef.current) return;
          const { data } = await supabase.from('wheel_items').select('*').order('id', { ascending: true });
          if (data) {
            const sortedData = [...data].sort((a, b) => String(a.id).localeCompare(String(b.id)));
            const moneyItems = sortedData.filter(w => w.wheel_type === 'money').map(w => ({
              ...w,
              notify_on_win: w.notify_on_win !== undefined && w.notify_on_win !== null ? Boolean(w.notify_on_win) : getWheelNotifyFallback(w.id)
            }));
            const spinItems = sortedData.filter(w => w.wheel_type === 'spin').map(w => {
              const n = String(w.name || '').toLowerCase();
              const t = String(w.type || '').toLowerCase();
              let img = w.image;
              if (t === 'game_shoes_legendary' || n.includes('giày')) {
                img = getShoesImage(img) || LEGENDARY_SHOES_IMG;
              } else if (!img) {
                if (t === 'game_coins' || n.includes('xu')) img = '/game-assets/gold_coin.png';
                else if (t === 'game_attacks' || n.includes('lượt đánh') || n.includes('đánh boss')) img = '/game-assets/weapon_song_dao.png';
                else if (t === 'game_boss_chests' || n.includes('hòm boss')) img = '/game-assets/mystery_box_closed.png';
                else if (t === 'game_royal_chests' || n.includes('hoàng kim')) img = '/game-assets/royal_chest.png';
                else if (t === 'game_essence_stone' || n.includes('tinh hoa')) img = '/game-assets/da_tinh_hoa.png';
                else if (t === 'game_ring_crystal' || n.includes('tinh thể')) img = '/game-assets/ring_crystal.png';
              }
              const itemNotify = w.notify_on_win !== undefined && w.notify_on_win !== null ? Boolean(w.notify_on_win) : getWheelNotifyFallback(w.id);
              if (n.includes('xu') && (w.type === 'other' || w.type === 'game_coins' || w.id === 'WHEEL_GAME_COINS')) {
                return {
                  ...w,
                  image: img,
                  type: 'game_coins',
                  name: (w.name && w.name.includes('50,000')) ? '+20 Xu Nâng Cấp' : (w.name || '+20 Xu Nâng Cấp'),
                  value: (w.value === 50000 || !w.value) ? 20 : Number(w.value),
                  rate: (w.rate === '25%' && (w.value === 20 || w.value === 50000)) ? '5%' : w.rate,
                  notify_on_win: itemNotify
                };
              }
              if (w.id === 'WHEEL_GAME_NONE' && w.rate === '24.5%') {
                return { ...w, image: img, rate: '44.5%', notify_on_win: itemNotify };
              }
              return { ...w, image: img, notify_on_win: itemNotify };
            });
            setWheelItemsMoneyDb(moneyItems);
            setWheelItemsSpinDb(spinItems);
            try { localStorage.setItem('shop_wheel_money', JSON.stringify(moneyItems)); } catch { /* ignore */ }
            try { localStorage.setItem('shop_wheel_spin', JSON.stringify(spinItems)); } catch { /* ignore */ }
          }
        } catch (e) {
          console.warn("Lỗi sync realtime wheel_items:", e);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, async () => {
        const { data } = await supabase.from('comments').select('*, users(name, avatar_url, role)').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(200);
        if (data) setCommentsDb(data);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const acc = payload.new;
          let fixedRentOptions = acc.rentOptions;
          if (typeof fixedRentOptions === 'string') {
            try { fixedRentOptions = JSON.parse(fixedRentOptions); } catch { fixedRentOptions = []; }
          }
          if (!Array.isArray(fixedRentOptions)) fixedRentOptions = [];

          let fixedDetailImages = acc.detailImages;
          if (typeof fixedDetailImages === 'string') {
            try { fixedDetailImages = JSON.parse(fixedDetailImages); } catch { fixedDetailImages = []; }
          }
          if (!Array.isArray(fixedDetailImages)) fixedDetailImages = [];

          let fixedTags = acc.tags;
          if (typeof fixedTags === 'string') {
            try {
              let parsed = JSON.parse(fixedTags);
              fixedTags = Array.isArray(parsed) ? parsed : fixedTags.split(',').map(t => t.trim());
            } catch {
              fixedTags = fixedTags.split(',').map(t => t.trim());
            }
          }
          if (!Array.isArray(fixedTags)) fixedTags = [];

          const formattedAcc = {
            ...acc,
            rentOptions: fixedRentOptions,
            detailImages: fixedDetailImages,
            tags: fixedTags,
            rentedUntil: acc.rentedUntil || acc.renteduntil || null,
            rentStartedAt: acc.rentStartedAt || acc.rentstartedat || null,
            currentRenterId: acc.currentRenterId || acc.currentrenterid || null
          };

          setAccountsDb(prev => {
            const exists = prev.some(a => a.id === formattedAcc.id);
            if (exists) {
              return prev.map(a => a.id === formattedAcc.id ? formattedAcc : a);
            }
            return [formattedAcc, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setAccountsDb(prev => prev.filter(a => a.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boosting' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setBoostingDb(prev => {
            const exists = prev.some(b => b.id === payload.new.id);
            if (exists) {
              return prev.map(b => b.id === payload.new.id ? payload.new : b);
            }
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setBoostingDb(prev => prev.filter(b => b.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(publicChannel);
    };
  }, []);

  // Kênh 2: Dữ liệu riêng tư (CHỈ mở khi đã đăng nhập, khách lọc users theo đúng ID mình)
  useEffect(() => {
    if (!currentUser?.id) return undefined;
    const isAdminRole = currentUser?.role?.toLowerCase() === 'admin';
    const userWatchFilter = isAdminRole
      ? { event: '*', schema: 'public', table: 'users' }
      : { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${currentUser.id}` };

    const privateChannel = supabase.channel(`realtime-user-${currentUser.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessagesDb(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deposit_requests' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        const payloadUserId = payload.new.userId || payload.new.userid;
        if (!isAdmin && payloadUserId !== me?.id) return;
        setDepositRequests(prev => {
          if (prev.find(d => d.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'deposit_requests' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        setDepositRequests(prev => {
          const exists = prev.some(req => req.id === payload.new.id);
          if (exists || isAdmin) {
            return prev.map(req => req.id === payload.new.id ? { ...req, ...payload.new } : req);
          }
          return prev;
        });

        if (!isAdmin && payload.new.type === 'card' && payload.new.status === 'Thất bại') {
          setDepositRequests(prev => {
            const matched = prev.find(req => req.id === payload.new.id);
            if (matched && matched.userId === me?.id) {
              setLiveCardError(payload.new.details);
            }
            return prev;
          });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rent_requests' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        const payloadUserId = payload.new.userId || payload.new.userid;
        if (!isAdmin && payloadUserId !== me?.id) return;
        setRentRequests(prev => {
          if (prev.find(r => r.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rent_requests' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        const payloadUserId = payload.new.userId || payload.new.userid;
        if (!isAdmin && payloadUserId !== me?.id) return;
        setRentRequests(prev => prev.map(req => req.id === payload.new.id ? payload.new : req));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'boosting_requests' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        if (!isAdmin && payload.new.user !== me?.name) return;
        setBoostingRequests(prev => {
          if (prev.find(r => r.id === payload.new.id)) return prev;
          let parsedInfo = payload.new.info;
          if (typeof parsedInfo === 'string') {
            try { parsedInfo = JSON.parse(parsedInfo); } catch { parsedInfo = {}; }
          }
          const fixedPayload = { ...payload.new, info: parsedInfo || {}, boostingTitle: payload.new.boostingTitle || payload.new.boostingtitle || '', boostingId: payload.new.boostingId || payload.new.boostingid || '' };
          return [fixedPayload, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'boosting_requests' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        if (!isAdmin && payload.new.user !== me?.name) return;
        let parsedInfo = payload.new.info;
        if (typeof parsedInfo === 'string') {
          try { parsedInfo = JSON.parse(parsedInfo); } catch { parsedInfo = {}; }
        }
        const fixedPayload = { ...payload.new, info: parsedInfo || {}, boostingTitle: payload.new.boostingTitle || payload.new.boostingtitle || '', boostingId: payload.new.boostingId || payload.new.boostingid || '' };
        setBoostingRequests(prev => prev.map(r => r.id === fixedPayload.id ? fixedPayload : r));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        const myIdentifier = me?.name || me?.phone || 'Khách Vô Danh';

        if (payload.new.type === 'deposit_auto' && payload.new.user === myIdentifier) {
          setPayosPaymentData(null);
          setPayosSuccess(true);
          setDepositAmount('');
          setVoucherInput('');
          showToast("Thanh toán tự động thành công!", "success");
          setTimeout(() => setPayosSuccess(false), 5000);
          setDepositRequests(prev => prev.map(req => {
            if (req.type === 'banking' && req.status !== 'Thành công' && req.status !== 'Đã hủy') {
              return { ...req, status: 'Thành công' };
            }
            return req;
          }));
        }

        if (!isAdmin && payload.new.user !== myIdentifier) return;
        setTransactionsDb(prev => {
          if (prev.find(t => t.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', userWatchFilter, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        if (payload.eventType === 'INSERT') {
          if (!isAdmin) return;
          setUsersDb(prev => {
            if (prev.find(u => u.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
          return;
        }
        if (isAdmin) {
          setUsersDb(prev => prev.map(u => u.id === payload.new.id ? payload.new : u));
        } else if (payload.new.role?.toLowerCase() === 'admin') {
          setUsersDb(prev => {
            if (prev.find(u => u.id === payload.new.id)) {
              return prev.map(u => u.id === payload.new.id ? payload.new : u);
            }
            return [...prev, payload.new];
          });
        }
        if (payload.new.id === me?.id) {
          const preservedLinked = payload.new.linked_game_id || me?.linked_game_id || localStorage.getItem(`shop_linked_game_id_${me?.id}`);
          const mergedMe = { ...payload.new, linked_game_id: preservedLinked };
          setCurrentUser(mergedMe);
          localStorage.setItem('shop_cached_user', JSON.stringify(mergedMe));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_orders' }, async (payload) => {
        const ord = payload.new;
        if (ord && ord.package_id === 'add_spin_tickets') {
          const me = currentUserRef.current;
          if (!me) return;
          const cleanLinked = (me.linked_game_id || '').toLowerCase().replace(/^@/, '');
          const ordUser = (ord.user_id || '').toLowerCase().replace(/^@/, '');
          const isMatch = (ord.web_user && ord.web_user === me.id) || (cleanLinked && ordUser === cleanLinked);
          if (isMatch) {
            const addedSpins = parseInt(ord.rewards?.spins || ord.rewards?.tickets || 0, 10);
            if (addedSpins > 0) {
              if (ord.status === 'pending') {
                const { data: claimRes, error: claimErr } = await supabase.rpc('rpc_claim_spin_tickets', {
                  p_order_ids: [ord.id]
                });
                if (!claimErr && claimRes?.success && claimRes.claimed_spins > 0) {
                  setCurrentUser(prev => prev ? ({ ...prev, spins: claimRes.new_spins }) : prev);
                  showToast(`🎉 Nhận thành công +${claimRes.claimed_spins} Lượt Quay Vòng Quay từ nhân vật game!`, 'success');
                }
              } else {
                showToast(`🎉 Nhận thành công +${addedSpins} Lượt Quay Vòng Quay từ nhân vật game!`, 'success');
              }
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(privateChannel);
    };
  }, [currentUser?.id, currentUser?.role]);
  // Tự động chuyển vòng quay nếu bị trống (Chống lỗi F5)
  useEffect(() => {
    if (playMode === 'money' && wheelItemsMoneyDb.length === 0 && wheelItemsSpinDb.length > 0) {
      setPlayMode('spin');
    } else if (playMode === 'spin' && wheelItemsSpinDb.length === 0 && wheelItemsMoneyDb.length > 0) {
      setPlayMode('money');
    }
  }, [wheelItemsMoneyDb.length, wheelItemsSpinDb.length, playMode]);

  // Lấy đơn nạp tự động hiện tại để đếm ngược
  const activePendingBankingReq = depositRequests.find(d => d.userId === currentUser?.id && (d.status === 'Chờ duyệt' || d.status === 'Chờ thanh toán') && d.type !== 'card' && d.type !== 'live_donate');

  // Đếm ngược 10 phút tự hủy lệnh nạp
  useEffect(() => {
    let timer;
    const pendingReq = activePendingBankingReq || (payosPaymentData ? { created_at: new Date().toISOString(), id: `PAYOS_${payosPaymentData.orderCode}` } : null);

    if (pendingReq) {
      const createdAtTime = new Date(pendingReq.created_at || Date.now()).getTime();
      timer = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, 600 - Math.floor((now - createdAtTime) / 1000));
        setPayosTimeLeft(diff);
        if (diff === 0) {
          clearInterval(timer);
          supabase.from('deposit_requests').update({ status: 'Đã hủy' }).eq('id', pendingReq.id).then(() => {
            setPayosPaymentData(null);
            showToast("Lệnh nạp tự động hủy do quá thời gian chờ (10 phút)!", "error");
          });
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activePendingBankingReq, payosPaymentData]);

  const formatPayosTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Lắng nghe lệnh PayOS để tắt QR khi thanh toán thành công
  useEffect(() => {
    if (payosPaymentData) {
      const matchedReq = depositRequests.find(d => d.id === `PAYOS_${payosPaymentData.orderCode}`);
      if (matchedReq) {
        if (matchedReq.status === 'Thành công' || matchedReq.status === 'Đã duyệt') {
          setPayosPaymentData(null);
          setPayosSuccess(true);
          setDepositAmount('');
          setVoucherInput('');
          showToast("Thanh toán tự động thành công!", "success");
          setTimeout(() => setPayosSuccess(false), 5000);
        } else if (matchedReq.status === 'Đã hủy' || matchedReq.status === 'Thất bại') {
          setPayosPaymentData(null);
        }
      }
    }
  }, [depositRequests, payosPaymentData]);

  // POLLING DỰ PHÒNG: Trong trường hợp Supabase Realtime bị lỗi/mất kết nối
  useEffect(() => {
    let pollTimer;
    if (payosPaymentData) {
      pollTimer = setInterval(async () => {
        try {
          const { data } = await supabase
            .from('deposit_requests')
            .select('status, details')
            .eq('id', `PAYOS_${payosPaymentData.orderCode}`)
            .single();

          if (data) {
            if (data.status === 'Thành công' || data.status === 'Đã duyệt') {
              setPayosPaymentData(null);
              setPayosSuccess(true);
              setDepositAmount('');
              setVoucherInput('');
              showToast("Thanh toán tự động thành công!", "success");
              setTimeout(() => setPayosSuccess(false), 5000);
              // Ép cập nhật local state để UI đồng bộ ngay lập tức
              setDepositRequests(prev => prev.map(r =>
                r.id === `PAYOS_${payosPaymentData.orderCode}` ? { ...r, status: data.status, details: data.details } : r
              ));
            } else if (data.status === 'Thất bại' || data.status === 'Đã hủy') {
              setPayosPaymentData(null);
              setDepositRequests(prev => prev.map(r =>
                r.id === `PAYOS_${payosPaymentData.orderCode}` ? { ...r, status: data.status, details: data.details } : r
              ));
            }
          }
        } catch (e) {
          console.error("Polling lỗi:", e);
        }
      }, 3000); // Check mỗi 3 giây
    }
    return () => clearInterval(pollTimer);
  }, [payosPaymentData]);

  // =====================================================================
  // ĐÃ XÓA POLLING TOÀN DIỆN DỰ PHÒNG: Gây tốn quá nhiều băng thông (Egress)
  // Hệ thống Realtime (supabase.channel) ở trên đã đủ để cập nhật dữ liệu
  // =====================================================================


  // Xử lý Check In Hộp Thư Tự Động (Lọc để tránh loop)
  useEffect(() => {
    if (currentView === 'security' && profileTab === 'inbox') {
      const hasUnread = messagesDb.some(m => m.receiverId === currentUser?.id && !m.isRead);
      if (hasUnread) {
        const updatedMsgs = messagesDb.map(m => m.receiverId === currentUser?.id ? { ...m, isRead: true } : m);
        setMessagesDb(updatedMsgs);
        supabase.from('messages').update({ isRead: true }).eq('receiverId', currentUser.id).then();
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentView, profileTab, messagesDb, currentUser]);

  // Xử lý cuộn tự động cho Admin khi có tin nhắn mới
  useEffect(() => {
    if (currentView === 'admin' && adminTab === 'messages' && activeChatUser) {
      setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messagesDb, currentView, adminTab, activeChatUser]);

  // Cập nhật trạng thái "Đang hoạt động" cho currentUser (Ping mỗi 5 phút khi tab đang mở để bảo vệ Free Tier)
  useEffect(() => {
    if (!currentUser) return;
    const updateLastActive = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('id', currentUser.id);
      } catch { /* ignore */ }
    };
    updateLastActive(); // Cập nhật ngay khi load
    const interval = setInterval(updateLastActive, 300000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChangeAvatar = async (e) => {
    if (!currentUser) return;
    const file = e.target.files[0];
    if (!file) return;

    // Check size
    if (file.size > 5 * 1024 * 1024) return showToast("Ảnh tối đa 5MB", "error");

    try {
      setIsGlobalProcessing(true);
      let fileToUpload = file;
      try {
        fileToUpload = await compressImageFile(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 512,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.85,
        });
      } catch (compErr) {
        console.warn("Bỏ qua nén avatar, dùng file gốc:", compErr);
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const imgUrl = await uploadToImgBB(reader.result, 'avatar');
          const { error } = await supabase.from('users').update({ avatar_url: imgUrl }).eq('id', currentUser.id);
          if (error) throw error;
          setCurrentUser({ ...currentUser, avatar_url: imgUrl });
          localStorage.setItem('shop_cached_user', JSON.stringify({ ...currentUser, avatar_url: imgUrl }));
          showToast("Đã cập nhật ảnh đại diện!");
        } catch (err) {
          console.error(err);
          showToast("Lỗi khi tải ảnh lên!", "error");
        } finally {
          setIsGlobalProcessing(false);
        }
      };
      reader.readAsDataURL(fileToUpload);
    } catch (err) {
      console.error(err);
      setIsGlobalProcessing(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser) return;
    try {
      setIsGlobalProcessing(true);
      const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', currentUser.id);
      if (error) throw error;
      const updatedUser = { ...currentUser, avatar_url: null };
      setCurrentUser(updatedUser);
      localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
      showToast("Đã gỡ ảnh đại diện!");
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi gỡ ảnh!", "error");
    } finally {
      setIsGlobalProcessing(false);
    }
  };

  const handleResolveReport = async (commentId, action) => {
    try {
      if (action === 'delete') {
        await supabase.from('comments').delete().eq('id', commentId);
        showToast("Đã xóa bình luận vi phạm!");
      } else {
        await supabase.from('comments').update({ reported_by: [] }).eq('id', commentId);
        showToast("Đã bỏ qua báo cáo!");
      }
    } catch (err) {
      console.error(err);
      showToast("Có lỗi xảy ra", "error");
    }
  };

  // --- HÀM XỬ LÝ LÕI ---
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const contact = e.target.contact.value.trim();
      const password = e.target.password.value;

      if (!contact) {
        return showToast("Vui lòng nhập Số điện thoại (0...) hoặc Email (@gmail.com)!", 'error');
      }

      let loginEmails = [];

      // Chỉ cho phép đăng nhập theo đúng Email (@gmail.com) hoặc SĐT (bắt đầu bằng số 0, 10-11 số)
      if (contact.includes('@')) {
        if (!isValidGmail(contact)) {
          return showToast("Email đăng nhập phải đúng định dạng @gmail.com!", 'error');
        }
        const { data: candidates } = await supabase
          .from('users')
          .select('email, balance')
          .ilike('email', contact)
          .limit(25);

        const matchedUsers = (candidates || []).filter(
          (u) => (u.email || '').trim().toLowerCase() === contact.toLowerCase()
        );
        matchedUsers.sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));

        const seenEmails = new Set();
        for (const u of matchedUsers) {
          const em = (u.email || '').trim();
          const emKey = em.toLowerCase();
          if (em && !seenEmails.has(emKey)) {
            seenEmails.add(emKey);
            loginEmails.push(em);
          }
        }

        if (loginEmails.length === 0) {
          return showToast("Email này chưa được đăng ký!", 'error');
        }
      } else {
        if (!isValidVnPhone(contact)) {
          return showToast("Vui lòng đăng nhập bằng Số điện thoại (bắt đầu bằng số 0, 10-11 số) hoặc Email (@gmail.com)!", 'error');
        }
        const { data: candidates } = await supabase
          .from('users')
          .select('email, phone, balance')
          .eq('phone', contact)
          .limit(25);

        const matchedUsers = (candidates || []).filter(
          (u) => (u.phone || '').trim() === contact
        );
        matchedUsers.sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));

        const seenEmails = new Set();
        for (const u of matchedUsers) {
          const em = (u.email || '').trim();
          const emKey = em.toLowerCase();
          if (em && !seenEmails.has(emKey)) {
            seenEmails.add(emKey);
            loginEmails.push(em);
          }
        }

        if (loginEmails.length === 0) {
          return showToast("Số điện thoại này chưa được đăng ký!", 'error');
        }
      }

      // Đăng nhập bằng Email liên kết khớp chính xác SĐT/Email đã nhập
      let authData = null;
      let authError = null;
      for (const candidateEmail of loginEmails) {
        const res = await supabase.auth.signInWithPassword({
          email: candidateEmail,
          password,
        });
        if (!res.error && res.data?.user) {
          authData = res.data;
          authError = null;
          break;
        }
        authError = res.error;
      }

      if (authError || !authData?.user) return showToast("Sai tài khoản hoặc mật khẩu!", 'error');

      // ... (Giữ nguyên toàn bộ phần code lấy thông tin userData ở bên dưới của bạn) ...

      // Lấy thông tin user để hiển thị lên web
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at')
        .eq('id', authData.user.id)
        .single();

      if (userData) {
        if (userData.is_locked) {
          await supabase.auth.signOut();
          localStorage.removeItem('shop_cached_user');
          return showToast("Tài khoản của bạn đã bị khóa!", 'error');
        }
        setBossPlayerSummary(null);
        setBossTargetId('');
        setCurrentUser(userData);
        localStorage.setItem('shop_cached_user', JSON.stringify(userData));

        // XÚC DỮ LIỆU ADMIN NGAY KHI ĐĂNG NHẬP ĐỂ KHÔNG BỊ TRỐNG PANEL
        const role = (userData.role || 'user').toLowerCase();
        if (role === 'admin') {
          const [usersRes, txRes, depRes, rentRes, msgRes, boostReqRes] = await Promise.all([
            supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').order('id', { ascending: false }),
            supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(300),
            supabase.from('deposit_requests').select('*').neq('type', 'live_donate').order('created_at', { ascending: false }).limit(300),
            supabase.from('rent_requests').select('*').order('created_at', { ascending: false }).limit(200),
            supabase.from('messages').select('*').order('timestamp', { ascending: true }).limit(500),
            supabase.from('boosting_requests').select('*').order('created_at', { ascending: false }).limit(200)
          ]);
          if (usersRes.data) { setUsersDb(usersRes.data); try { localStorage.setItem('shop_users_db', JSON.stringify(usersRes.data)); } catch { /* ignore */ } }
          if (txRes.data) { setTransactionsDb(txRes.data); try { localStorage.setItem('shop_tx_db', JSON.stringify(txRes.data)); } catch { /* ignore */ } }
          if (depRes.data) { setDepositRequests(depRes.data); try { localStorage.setItem('shop_dep_db', JSON.stringify(depRes.data)); } catch { /* ignore */ } }
          if (rentRes.data) {
            // Nhớ lọc chữ hoa/thường cho bảng Thuê Nick
            const fixedRentReqs = rentRes.data.map(r => ({
              ...r,
              accCode: r.accCode || r.acccode || '',
              userId: r.userId || r.userid || ''
            }));
            setRentRequests(fixedRentReqs);
            try { localStorage.setItem('shop_rent_db', JSON.stringify(fixedRentReqs)); } catch { /* ignore */ }
          }
          if (msgRes.data) { setMessagesDb(msgRes.data); try { localStorage.setItem('shop_msg_db', JSON.stringify(msgRes.data)); } catch { /* ignore */ } }
          if (boostReqRes.data) {
            const fixedBoostReqs = boostReqRes.data.map(r => ({
              ...r,
              boostingTitle: r.boostingTitle || r.boostingtitle || '',
              boostingId: r.boostingId || r.boostingid || ''
            }));
            setBoostingRequests(fixedBoostReqs);
            try { localStorage.setItem('shop_boost_db', JSON.stringify(fixedBoostReqs)); } catch { /* ignore */ }
          }
        }

        const postLoginView = sessionStorage.getItem('post_login_view');
        const postLoginDepositMethod = sessionStorage.getItem('post_login_deposit_method');
        sessionStorage.removeItem('post_login_view');
        sessionStorage.removeItem('post_login_deposit_method');
        if (postLoginDepositMethod === 'card' || postLoginDepositMethod === 'banking') {
          setDepositMethod(postLoginDepositMethod);
        }
        setCurrentView(postLoginView || 'dashboard');
        showToast(`Chào mừng ${userData.name} quay trở lại!`, 'success');
      } else {
        showToast("Lỗi: Tài khoản Auth tồn tại nhưng không tìm thấy Data trong bảng Users!", 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Honeypot chống bot điền form tự động
    if (e.target.company_website?.value?.trim()) {
      return showToast("Yêu cầu đăng ký không hợp lệ!", "error");
    }

    const email = e.target.email.value.trim().toLowerCase();
    const password = e.target.password.value;
    const name = e.target.name.value.trim();
    const phone = e.target.phone.value.trim();

    if (name.length < 3) {
      return showToast("Họ và tên phải có ít nhất 3 ký tự!", "error");
    }
    if (!isValidVnPhone(phone)) {
      return showToast("Số điện thoại phải bắt đầu bằng số 0 và gồm 10-11 chữ số!", "error");
    }
    if (!isValidGmail(email)) {
      return showToast("Email phải đúng định dạng @gmail.com (ví dụ: tenban@gmail.com)!", "error");
    }
    if (password.length < 6) {
      return showToast("Mật khẩu phải có ít nhất 6 ký tự!", "error");
    }

    const nowMs = Date.now();
    const waitMs = 15000 - (nowMs - lastRegisterAttemptRef.current);
    if (waitMs > 0) {
      return showToast(`Vui lòng đợi ${Math.ceil(waitMs / 1000)} giây trước khi gửi đăng ký tiếp!`, "warning");
    }

    if (isTurnstileConfigured) {
      if (!registerTurnstileToken) {
        return showToast("Vui lòng hoàn thành xác minh chống bot (Cloudflare Turnstile)!", "error");
      }
      try {
        const tsRes = await fetch('/api/verify-turnstile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: registerTurnstileToken }),
        });
        const tsJson = await tsRes.json().catch(() => null);
        if (!tsRes.ok || !tsJson?.ok) {
          setRegisterTurnstileToken('');
          setRegisterTurnstileReset((prev) => prev + 1);
          return showToast(tsJson?.error || "Xác minh chống bot thất bại, vui lòng thử lại!", "error");
        }
      } catch {
        setRegisterTurnstileToken('');
        setRegisterTurnstileReset((prev) => prev + 1);
        return showToast("Không thể xác minh chống bot lúc này!", "error");
      }
    }

    const resetTurnstileIfActive = () => {
      if (isTurnstileConfigured) {
        setRegisterTurnstileToken('');
        setRegisterTurnstileReset((prev) => prev + 1);
      }
    };

    lastRegisterAttemptRef.current = nowMs;

    // KIỂM TRA TRÙNG LẶP SĐT HOẶC EMAIL TRONG DATABASE TRƯỚC (2 truy vấn độc lập)
    const [{ data: dupPhones }, { data: dupEmails }] = await Promise.all([
      supabase.from('users').select('id, phone').eq('phone', phone).limit(1),
      supabase.from('users').select('id, email').ilike('email', email).limit(1),
    ]);

    if (dupPhones && dupPhones.length > 0) {
      resetTurnstileIfActive();
      return showToast("Số điện thoại này đã được đăng ký! Không được tạo thêm tài khoản trùng SĐT.", "error");
    }
    if (dupEmails && dupEmails.length > 0) {
      resetTurnstileIfActive();
      return showToast("Email này đã được đăng ký! Không được tạo thêm tài khoản trùng Email.", "error");
    }

    // 1. Tạo tài khoản bảo mật trong Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      resetTurnstileIfActive();
      return showToast("Lỗi đăng ký: " + authError.message, 'error');
    }

    if (authData.user) {
      // 2. Tạo hồ sơ người dùng trong bảng 'users' (Dùng chung ID với Auth)
      const newUser = {
        id: authData.user.id,
        name,
        phone,
        email,
        balance: 0,
        spins: 0,
        role: 'user'
      };

      const { error: dbError } = await supabase.from('users').insert([newUser]);

      if (dbError) {
        resetTurnstileIfActive();
        showToast("Lỗi tạo hồ sơ: " + dbError.message, 'error');
      } else {
        resetTurnstileIfActive();
        showToast("Đăng ký thành công! Hãy đăng nhập nhé.", 'success');
        setCurrentView('login');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isRecovering) return;
    const email = e.target.email.value.trim().toLowerCase();
    if (!isValidGmail(email)) {
      return showToast("Email khôi phục phải đúng định dạng @gmail.com!", 'error');
    }
    setIsRecovering(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setIsRecovering(false);
    if (error) return showToast("Lỗi: " + error.message, 'error');
    setRecoveryEmail(email);
    setForgotPasswordStep(2);
    showToast("Đã gửi mã xác thực vào Email của bạn!", 'success');
  };

  const handleVerifyRecoveryOtp = async (e) => {
    e.preventDefault();
    if (isRecovering) return;
    setIsRecovering(true);
    const token = e.target.otp.value.trim();
    const { error } = await supabase.auth.verifyOtp({
      email: recoveryEmail,
      token,
      type: 'recovery'
    });
    setIsRecovering(false);
    if (error) return showToast("Mã xác thực không hợp lệ hoặc đã hết hạn!", 'error');
    showToast("Xác thực thành công! Vui lòng đặt mật khẩu mới.", 'success');
    setForgotPasswordStep(3);
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (isRecovering) return;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    if (newPassword !== confirmPassword) {
      return showToast("Mật khẩu xác nhận không khớp!", 'error');
    }
    setIsRecovering(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsRecovering(false);
    if (error) return showToast("Lỗi cập nhật mật khẩu: " + error.message, 'error');
    showToast("Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.", 'success');
    setForgotPasswordStep(1);
    setCurrentView('login');
    await supabase.auth.signOut();
  };
  // HÀM TÍNH TỔNG TIỀN KHÁCH ĐÃ TIÊU & KIỂM TRA VIP (Tiêu trên 3tr)
  // Sửa hàm nạp tiền
  const calculateTotalRecharged = (userId) => {
    if (!userId) return 0; // Nếu không có ID thì trả về 0 luôn, không chạy tiếp
    return depositRequests
      .filter(d => d.userId === userId && d.status === 'Thành công')
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const requireAuth = (viewName) => {
    if (!currentUser) {
      showToast("Tính năng này yêu cầu đăng nhập!", 'error');
      setCurrentView('login');
    } else {
      setCurrentView(viewName);
    }
  };

  const copyToClipboard = (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch {
      showToast("Lỗi khi copy", 'error');
    }
  };

  const handleBuyAccount = (acc) => {
    if (!currentUser) return requireAuth('login');

    setBuyQuantity(1);
    setBuyModalData(acc);
  };

  const executeBuyAccount = async (acc, quantity) => {
    if (!currentUser.is_email_verified) return showToast("Vui lòng vào mục Cá nhân để xác thực Email trước khi thanh toán!", "error");
    if (isGlobalProcessing) return;
    setIsGlobalProcessing(true);

    // GỌI HÀM BẢO MẬT TRÊN SERVER (RPC)
    // Cập nhật RPC của bạn để hỗ trợ tham số soluong nhé. Nếu chưa có, hãy tạo mới hàm m_buy_acc_v2
    const { data, error } = await supabase.rpc('m_buy_acc_v2', {
      nick_id: acc.id,
      khach_id: currentUser.id,
      soluong: quantity
    });

    setIsGlobalProcessing(false);

    if (error) {
      return showToast(error.message || "Giao dịch thất bại!", 'error');
    }

    if (data && data.success) {
      const newBalance = currentUser.balance - (acc.price * quantity);
      const updatedUser = { ...currentUser, balance: newBalance };
      setCurrentUser(updatedUser);
      localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));

      // Cập nhật stock ở client
      setAccountsDb(accountsDb.map(a => {
        if (a.id === acc.id) {
          const currentStock = a.stock !== undefined ? a.stock : 1;
          const newStock = currentStock - quantity;
          if (newStock <= 0) return { ...a, stock: 0, is_sold: true };
          return { ...a, stock: newStock };
        }
        return a;
      }));
      setViewingAcc(null);
      setBuyModalData(null);
      setSuccessTxData({ type: 'buy', title: 'Mua Thành Công!', acc: acc, quantity: quantity });
      showToast(`Mua thành công ${quantity} tài khoản!`);
    } else {
      showToast(data?.message || "Giao dịch không thành công!", "error");
    }
  };

  const initiateRent = (acc, opt) => {
    if (!currentUser) return requireAuth('login');

    // KIỂM TRA THIẾT BỊ: Chỉ hỗ trợ PC
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return showToast("Hệ thống chỉ hỗ trợ thuê nick trên máy tính. Vui lòng thực hiện trên máy tính!", "error");
    }

    // THAY VÌ MỞ BẢNG THANH TOÁN, CHÚNG TA MỞ BẢNG QUY ĐỊNH TRƯỚC
    setIsRulesAccepted(false); // Reset lại ô checkbox về rỗng
    setShowRentRules({ acc, opt }); // Mở bảng quy định và lưu lại thông tin gói khách chọn
  };
  const handleSendVerification = async () => {
    if (verifyCooldown > 0) return; // Đang đếm ngược thì cấm bấm

    setVerifyCooldown(60); // 1. Khóa nút 60s ngay lập tức
    setShowOtpModal(true); // 2. BẬT BẢNG NHẬP MÃ LÊN NGAY TỨC THÌ
    showToast("Đang gửi mã xác thực về Email...", 'success');

    // 3. Cho hệ thống gửi mail ngầm ở phía sau
    const { error } = await supabase.auth.signInWithOtp({
      email: currentUser.email,
      options: { shouldCreateUser: false }
    });

    if (error) {
      // Mở khóa nút đếm ngược
      setVerifyCooldown(0);

      if (error.status === 429) {
        // Lỗi đẩy mail quá nhanh (Spam OTP) -> Không tắt bảng, để nguyên cho khách xài lại mã cũ ở hòm thư
        return showToast("Hệ thống mail đang bảo vệ an ninh! Vui lòng mở hòm thư lấy Mã để nhập tiếp.", 'error');
      } else {
        // Lỗi khác nghiêm trọng -> Tắt bảng
        setShowOtpModal(false);
        return showToast("Lỗi gửi mã: " + error.message, 'error');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    // Đối chiếu mã OTP khách nhập với máy chủ Supabase
    const { error } = await supabase.auth.verifyOtp({
      email: currentUser.email,
      token: otpCode,
      type: 'email' // Khai báo loại xác thực bằng mã 6 số
    });

    if (error) return showToast("Mã xác thực không hợp lệ hoặc đã hết hạn!", 'error');

    // Nếu mã đúng, hệ thống cấp quyền và cập nhật DB
    await supabase.from('users').update({ is_email_verified: true }).eq('id', currentUser.id);
    const updatedUser = { ...currentUser, is_email_verified: true };
    setCurrentUser(updatedUser);
    localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
    setShowOtpModal(false);
    setOtpCode('');
    showToast("Xác thực Email thành công!", 'success');
  };
  // HÀM XỬ LÝ NGƯNG THUÊ & QUY ĐỔI GIỜ DƯ
  // HÀM XỬ LÝ NGƯNG THUÊ, QUY ĐỔI GIỜ DƯ & TỰ ĐỘNG HOÀN CỌC
  // HÀM XỬ LÝ NGƯNG THUÊ, QUY ĐỔI TIỀN QUỸ & TỰ ĐỘNG HOÀN CỌC
  // HÀM XỬ LÝ NGƯNG THUÊ, QUY ĐỔI TIỀN QUỸ & TỰ ĐỘNG HOÀN CỌC (CÔNG THỨC CHỐNG LỖ)
  const handleStopRent = async (acc) => {
    setConfirmDialog({
      title: 'Xác nhận Ngưng thuê',
      message: 'Hệ thống sẽ tính toán quy đổi giờ dư thành TIỀN QUỸ (dựa trên giá trị thực tế của gói thuê) và hoàn lại tiền cọc (nếu có). Bạn chắc chắn chứ?',
      onConfirm: async () => {
        const nowTime = Date.now();
        const startTime = acc.rentStartedAt || nowTime;
        const endTime = acc.rentedUntil;

        // 1. Tính tổng giờ (Bao gồm cả khuyến mãi) và giờ đã dùng
        const totalHours = (endTime - startTime) / 3600000;
        const usedHours = (nowTime - startTime) / 3600000;

        // Khấu trừ tối thiểu 2 giờ chơi (quy định của shop)
        const deducted = Math.max(2, usedHours);
        let savedHours = totalHours - deducted;
        if (savedHours < 0) savedHours = 0;

        // 2. TÌM ĐƠN THUÊ ĐỂ LẤY GIÁ TRỊ GÓI & HOÀN CỌC
        const { data: activeRentReqs } = await supabase
          .from('rent_requests')
          .select('*')
          .eq('accCode', acc.code)
          .eq('userId', currentUser.id)
          .eq('status', 'Đã giao acc');

        let refundAmount = 0;
        let paidPrice = 0;

        if (activeRentReqs && activeRentReqs.length > 0) {
          const currentReq = activeRentReqs[0];
          refundAmount = currentReq.info?.depositAmount || 0;

          // Dò tìm lại gói thuê khách đã chọn để lấy số tiền thực tế khách đã trả (VD: 50.000đ)
          const selectedOption = acc.rentOptions?.find(opt => opt.time === currentReq.time);

          // Lấy giá của gói đó. Nếu không tìm thấy, dự phòng bằng giá giờ gốc * thời gian
          paidPrice = selectedOption ? selectedOption.price : (acc.rentPricePerHour * totalHours);

          // Đổi trạng thái đơn thành Đã trả
          await supabase.from('rent_requests').update({ status: 'Đã trả acc' }).eq('id', currentReq.id);
          setRentRequests(rentRequests.map(r => r.id === currentReq.id ? { ...r, status: 'Đã trả acc' } : r));
        } else {
          // Back-up nếu mạng lỗi không tìm được hóa đơn
          paidPrice = acc.rentPricePerHour * totalHours;
        }

        // 3. CÔNG THỨC QUY ĐỔI GIỜ DƯ (CHỐNG LỖ CỦA TIẾN)
        // Giá trị 1 giờ thực tế = Tổng tiền / Tổng số giờ (gốc + km)
        // VD: 50.000đ / 6h = 8.333đ/h
        const effectiveHourlyRate = totalHours > 0 ? (paidPrice / totalHours) : 0;

        // Số tiền được cộng vào Quỹ = Giờ dư * Giá trị 1 giờ thực tế
        // VD: 4h * 8.333đ = 33.333đ
        const savedMoney = Math.floor(savedHours * effectiveHourlyRate);

        // 4. Cập nhật Supabase: Trả Acc về trạng thái trống
        await supabase.from('accounts').update({
          rentedUntil: null,
          rentStartedAt: null,
          currentRenterId: null
        }).eq('id', acc.id);

        // 5. Cập nhật Tiền Quỹ và Tiền Hoàn Cọc vào User
        const newFund = (currentUser.rentFund || 0) + savedMoney;
        const newBalance = currentUser.balance + refundAmount;

        await supabase.from('users').update({
          rentFund: newFund,
          balance: newBalance
        }).eq('id', currentUser.id);

        // 6. Ghi Lịch sử Giao dịch
        const newTxs = [];
        if (refundAmount > 0) {
          newTxs.push({
            id: `TX${Date.now()}1`, user: currentUser.name,
            action: `Hoàn cọc thuê Mã ${acc.code}`, amount: -refundAmount,
            date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
            status: 'Thành công', type: 'deposit_refund', isSpinCost: false
          });
        }
        if (savedMoney > 0) {
          newTxs.push({
            id: `TX${Date.now()}2`, user: currentUser.name,
            action: `Quy đổi ${savedHours.toFixed(1)}h dư (Mã ${acc.code}) vào Quỹ Bảo Lưu`, amount: -savedMoney,
            date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
            status: 'Thành công', type: 'fund_add', isSpinCost: false,
            accDetails: { balanceAfter: newBalance, fundAfter: newFund }
          });
        }

        if (newTxs.length > 0) {
          await supabase.from('transactions').insert(newTxs);
          setTransactionsDb([...newTxs, ...transactionsDb]);
        }

        // 7. Cập nhật giao diện Web
        const updatedUser = { ...currentUser, rentFund: newFund, balance: newBalance };
        setCurrentUser(updatedUser);
        localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
        setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));
        setAccountsDb(accountsDb.map(a => a.id === acc.id ? { ...a, rentedUntil: null, currentRenterId: null } : a));
        setViewingAcc(null);

        showToast(`Ngưng thuê thành công! Quỹ Thuê của bạn được cộng thêm ${new Intl.NumberFormat('vi-VN').format(savedMoney)}đ.`);
      }
    });
  }; const handleUndoTransaction = async (tx, userObj) => {
    if (tx.status.includes('Hoàn tác') || tx.status.includes('Từ chối')) {
      return showToast("Giao dịch này đã bị hủy/hoàn tác từ trước rồi!", "error");
    }

    setConfirmDialog({
      title: 'Xác nhận Hoàn Tác',
      message: `Hoàn tác giao dịch "${tx.action}"? Hệ thống sẽ cộng/trừ ngược lại ${tx.isSpinCost ? 'Lượt quay' : 'Tiền'} vào tài khoản khách. (Lưu ý: Bạn tự chủ động thu hồi Acc/Dịch vụ nếu có).`,
      onConfirm: async () => {
        // 1. Lấy Data sống từ Database trước khi hoàn tác
        const { data: liveUser } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', userObj.id).single();
        if (!liveUser) return showToast("Lỗi: Không tìm thấy khách hàng!", "error");

        const reverseAmount = tx.amount;
        let newBalance = liveUser.balance;
        let newSpins = liveUser.spins || 0;

        if (tx.isSpinCost) {
          newSpins += reverseAmount;
        } else {
          newBalance += reverseAmount;
        }

        // 2. Lưu vĩnh viễn vào Supabase
        const { error: userErr } = await supabase.from('users').update({ balance: newBalance, spins: newSpins }).eq('id', userObj.id);
        if (userErr) return showToast("Lỗi hoàn tiền: " + userErr.message, "error");

        await supabase.from('transactions').update({ status: 'Đã hoàn tác' }).eq('id', tx.id);

        // 3. Cập nhật giao diện RAM để web nhảy số liền
        const updatedUser = { ...userObj, balance: newBalance, spins: newSpins };

        setUsersDb(usersDb.map(u => u.id === userObj.id ? updatedUser : u));
        if (currentUser?.id === userObj.id) setCurrentUser(updatedUser);
        localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));

        setTransactionsDb(transactionsDb.map(t => t.id === tx.id ? { ...t, status: 'Đã hoàn tác' } : t));

        // Cập nhật luôn màn hình Lịch sử đang mở để Admin thấy tiền khách nhảy ngay lập tức
        setViewUserHistory(updatedUser);

        showToast("Hoàn tác thành công! Đã xử lý xong tài sản của khách.");
      }
    });
  };
  const unreadCount = currentUser ? messagesDb.filter(m => m.receiverId === currentUser?.id && m.senderId !== currentUser?.id && !m.isRead).length : 0;

  // --- CÁC HÀM RENDER COMPONENTS ---

  // 1. Mobile Sidebar (Drawer)
  const renderMobileSidebar = () => {
    if (!isMobileMenuOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] md:hidden flex">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="w-[80vw] max-w-sm bg-[#151D2F] h-full flex flex-col shadow-2xl relative z-10 animate-slide-in-left border-r border-slate-800">

          {/* Header Drawer */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0B1120]">
            <CustomLogo />
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-800/50 rounded-full text-slate-400 hover:text-white transition-colors"><X size={22} /></button>
          </div>

          {/* Thông tin đăng nhập trên Mobile */}
          <div className="p-5 border-b border-slate-800 bg-gradient-to-b from-[#0B1120]/50 to-transparent">
            {currentUser ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-500 shadow-inner"><User size={24} /></div>
                  <div>
                    <p className="font-bold text-white text-lg line-clamp-1">{currentUser.name}</p>
                    <p className="text-xs text-emerald-400 font-black bg-emerald-500/10 px-2 py-0.5 rounded inline-block mt-1 shadow-sm">{new Intl.NumberFormat('vi-VN').format(currentUser.balance)}đ</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#0B1120] border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Lượt Quay</span>
                    <span className="text-rose-400 font-bold text-sm">{currentUser.spins || 0}</span>
                  </div>
                  <button onClick={() => { setIsMobileMenuOpen(false); setCurrentView('security'); setProfileTab('inbox'); }} className="flex-1 bg-blue-900/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg p-2 flex flex-col items-center justify-center transition-colors relative">
                    <MessageCircle size={16} className="mb-1" />
                    <span className="text-[10px] font-bold">Hỗ Trợ</span>
                    {unreadCount > 0 && <span className="absolute top-1 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#151D2F] animate-pulse"></span>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-400 text-center mb-1">Vui lòng đăng nhập để giao dịch</p>
                <div className="flex gap-3">
                  <button onClick={() => { setIsMobileMenuOpen(false); setCurrentView('login'); }} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-sm font-bold transition-colors">Đăng Nhập</button>
                  <button onClick={() => { setIsMobileMenuOpen(false); setCurrentView('register'); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-colors">Đăng Ký</button>
                </div>
              </div>
            )}
          </div>

          {/* Menu Links */}
          <div className="p-4 flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Danh mục Dịch Vụ</p>
            {[
              { name: 'Trang Chủ', view: 'dashboard', auth: false, icon: <Gamepad2 size={20} /> },
              { name: 'Nạp Tiền VNĐ', view: 'naptien', auth: true, icon: <Wallet size={20} /> },
              { name: '⚔️ Nạp Game Mộng Thiên Huyễn', view: 'bossgame', auth: true, icon: <Swords size={20} /> },
              {
                name: '🏛️ Sàn Đấu Giá (Chợ Xu)',
                view: 'bossgame',
                auth: true,
                icon: <Sparkles size={20} className="text-amber-400" />,
                action: () => {
                  requireAuth('bossgame');
                  setCurrentView('bossgame');
                  fetchAuctionMarketData();
                  setShowAuctionModal(true);
                }
              },
              {
                name: '🎒 Túi Đồ & Trang Bị',
                view: 'bossgame',
                auth: true,
                icon: <Package size={20} className="text-purple-400" />,
                action: () => {
                  requireAuth('bossgame');
                  setCurrentView('bossgame');
                  setShowBagModal(true);
                }
              },
              ...(!bossPlayerSummary ? [{
                name: '🔗 Lấy Mã OTP Game',
                view: 'bossgame',
                auth: true,
                icon: <Zap size={20} className="text-yellow-400 animate-pulse" />,
                action: () => {
                  requireAuth('bossgame');
                  setCurrentView('bossgame');
                  handleGenerateLinkOtp();
                }
              }] : []),
              { name: 'Dịch Vụ Cày Thuê', view: 'caythue', auth: false, icon: <Target size={20} /> },
              ...(hasActiveWheelRewards && !isWheelEventExpired ? [{
                name: 'Vòng Quay May Mắn',
                view: 'vongquay',
                auth: false,
                icon: <Gift size={20} />,
                ...(isWheelAdminPreview ? { badge: 'Ẩn' } : {})
              }] : []),
              ...(isWizardEventVisible ? [{
                name: 'Sự kiện phù thủy',
                view: 'wizard',
                auth: false,
                icon: <Sparkles size={20} className="text-purple-400 animate-pulse" />,
                isWizard: true,
                badge: !isWizardEventOpen ? 'Admin Test' : 'Mới'
              }] : []),
              ...(isMtcGameVisible ? [{
                name: '🐉 Mộng Thiên Cửu H5',
                view: 'mongthiencuu',
                auth: false,
                icon: <Flame size={20} className="text-amber-400" />,
                badge: !isMtcGameOpen ? 'Đang ẩn' : 'Mới'
              }] : []),
              { name: 'Lịch Sử Giao Dịch', view: 'lichsu', auth: true, icon: <History size={20} /> },
              {
                name: '🎮 Discord Chơi Game',
                view: 'discord',
                auth: false,
                icon: <DiscordIcon className="w-5 h-5 text-[#5865F2]" />,
                action: () => {
                  window.open(DISCORD_INVITE_URL, '_blank');
                }
              },
              ...(currentUser?.role === 'admin' ? [{ name: 'Panel Quản Trị Hệ Thống', view: 'admin', auth: true, icon: <Settings size={20} />, adminOnly: true }] : [])
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (item.action) {
                    item.action();
                  } else if (item.auth) {
                    requireAuth(item.view);
                  } else {
                    setCurrentView(item.view);
                  }
                }}
                className={`p-3.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all text-left ${
                  item.isWizard
                    ? currentView === item.view
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                      : 'bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/40'
                    : currentView === item.view
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : item.adminOnly
                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon} <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold uppercase ${item.badge === 'Admin Test' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
                    {item.badge}
                  </span>
                )}
                {currentView === item.view && <ArrowRight size={16} className="opacity-50" />}
              </button>
            ))}
          </div>

          {/* Logout */}
          {currentUser && (
            <div className="p-5 border-t border-slate-800 bg-[#0B1120]">
              <button onClick={() => {
                setIsMobileMenuOpen(false);
                setConfirmDialog({
                  title: 'Xác nhận Đăng xuất', message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?',
                  onConfirm: async () => {
                    await supabase.auth.signOut();
                    localStorage.removeItem('shop_cached_user'); // <--- Đấm phát chết luôn Session của Supabase
                    localStorage.removeItem('shop_user_id');
                    localStorage.removeItem('shop_boss_target_id');
                    localStorage.removeItem('shop_linked_game_player');
                    sessionStorage.removeItem('post_login_view');
                    sessionStorage.removeItem('post_login_deposit_method');
                    setBossPlayerSummary(null);
                    setBossTargetId('');
                    setCurrentUser(null);
                    setCurrentView('dashboard');
                    showToast("Đã đăng xuất an toàn!");
                  }
                });
              }} className="w-full py-3.5 bg-rose-500/10 text-rose-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20"><LogOut size={18} /> Thoát Tài Khoản</button>
            </div>
          )}
        </div>
      </div>
    )
  };

  // 2. Mobile Bottom Navigation Bar
  const renderMobileBottomNav = () => {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#151D2F]/95 backdrop-blur-lg border-t border-slate-800 z-[45] flex justify-around items-center h-[68px] pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        {[
          { id: 'dashboard', name: 'Trang chủ', icon: <Gamepad2 size={22} />, auth: false },
          { id: 'bossgame', name: 'Nạp Game', icon: <Swords size={22} />, auth: true },
          { id: 'caythue', name: 'Cày thuê', icon: <Target size={22} />, auth: false },
          { id: 'naptien', name: 'Nạp tiền', icon: <Wallet size={22} />, auth: true },
          { id: 'donate', name: 'Donate Live', icon: <Sparkles size={22} className="text-emerald-400" />, auth: false },
          ...(hasActiveWheelRewards && !isWheelEventExpired ? [{ id: 'vongquay', name: 'Vòng quay', icon: <Gift size={22} />, auth: false }] : []),
          ...(isWizardEventVisible ? [{ id: 'wizard', name: 'Phù Thủy', icon: <Sparkles size={22} className="text-purple-400" />, auth: false }] : []),
          ...(isMtcGameVisible ? [{ id: 'mongthiencuu', name: 'Thiên Cửu', icon: <Flame size={22} className="text-amber-400" />, auth: false }] : []),
          { id: 'security', name: 'Cá nhân', icon: <User size={22} />, auth: true }
        ].map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.auth) requireAuth(item.id);
                else setCurrentView(item.id);
              }}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : ''}`}>
                {item.icon}
                {/* Badge Thông báo nhỏ xíu cho Hộp thư ở tab Cá nhân */}
                {item.id === 'security' && unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#151D2F] animate-pulse"></span>}
              </div>
              <span className="text-[9px] font-bold mt-1 whitespace-nowrap">{item.name}</span>
              {isActive && <div className="absolute top-0 w-8 h-1 bg-blue-500 rounded-b-full shadow-[0_0_10px_rgba(59,130,246,1)]"></div>}
            </button>);
        })}
      </div>
    );
  };

  const renderNavbar = () => (
    <>
      <header className="bg-[#151D2F] border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="w-full bg-gradient-to-r from-rose-600/20 via-orange-500/20 to-rose-600/20 text-orange-400 py-2 px-4 text-center text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b border-rose-500/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 animate-pulse opacity-50"></div>
          <Clock size={16} className="animate-bounce shrink-0" />
          <span className="relative z-10 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Giờ hoạt động: 8h00 - 23h00. Ngoài khung giờ này quý khách vui lòng kiên nhẫn chờ đợi, xin cảm ơn!</span>
        </div>
        <div className="w-full max-w-[1550px] mx-auto px-3 sm:px-6 h-20 flex items-center justify-between gap-2 xl:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-300 hover:text-white p-2 -ml-2 bg-slate-800/50 rounded-lg transition-colors"><Menu size={24} /></button>
            <div onClick={() => setCurrentView('dashboard')}>
              <CustomLogo className="hidden sm:flex" />
              <div className="sm:hidden cursor-pointer">
                <img src="/Tiengaming.png" alt="Shop Tiến Gaming" className="h-14 w-auto object-contain" />
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            {[
              { name: 'Mua Nick', view: 'dashboard', auth: false },
              { name: 'Nạp Tiền', view: 'naptien', auth: true },
              {
                name: (
                  <span className="flex items-center gap-1">
                    <span>⚔️</span>
                    <span className="hidden xl:inline">Nạp Game</span>
                    <span>Mộng Thiên Huyễn</span>
                  </span>
                ),
                view: 'bossgame',
                auth: true
              },
              {
                name: (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <span>🏛️</span>
                    <span>Sàn Đấu Giá</span>
                  </span>
                ),
                view: 'bossgame',
                action: () => {
                  requireAuth('bossgame');
                  setCurrentView('bossgame');
                  fetchAuctionMarketData();
                  setShowAuctionModal(true);
                },
                auth: true
              },
              { name: 'Cày Thuê', view: 'caythue', auth: false },
              {
                name: (
                  <span className="flex items-center gap-1 font-bold text-emerald-300">
                    <span>💎</span>
                    <span>Donate Live</span>
                  </span>
                ),
                view: 'donate',
                auth: false,
                isDonateLive: true
              },
              {
                name: '💎 Donate Live',
                view: 'donate',
                auth: false,
                icon: <Sparkles size={20} className="text-emerald-400" />,
                isDonateLive: true,
                badge: 'TTS'
              },
              ...(hasActiveWheelRewards && !isWheelEventExpired ? [{ name: 'Vòng Quay', view: 'vongquay', auth: false, isWheel: true }] : []),
              ...(isWizardEventVisible ? [{
                name: 'Sự kiện phù thủy',
                view: 'wizard',
                auth: false,
                isWizard: true
              }] : []),
              ...(isMtcGameVisible ? [{
                name: '🐉 Mộng Thiên Cửu',
                view: 'mongthiencuu',
                auth: false,
                isMtcGame: true
              }] : []),
              { name: 'Lịch Sử', view: 'lichsu', auth: true }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.auth) {
                    requireAuth(item.view);
                  } else {
                    setCurrentView(item.view);
                  }
                }}
                className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                  item.isWizard
                    ? currentView === 'wizard'
                      ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] font-bold'
                      : 'bg-gradient-to-r from-purple-950/70 to-indigo-950/70 text-purple-300 border border-purple-500/50 hover:border-purple-400 hover:text-white hover:shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                    : currentView === item.view
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {item.isWizard && <Sparkles size={14} className="text-amber-300 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />}
                <span>{item.name}</span>
                {item.isWizard && !isWizardEventOpen && currentUser?.role?.toLowerCase() === 'admin' && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded border border-amber-500/30">Admin</span>
                )}
                {item.isMtcGame && !isMtcGameOpen && currentUser?.role === 'admin' && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 py-0.5 rounded border border-rose-500/30">Ẩn</span>
                )}
                {item.isWheel && isWheelAdminPreview && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 py-0.5 rounded border border-rose-500/30">Ẩn</span>
                )}
              </button>
            ))}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1 relative shrink-0 ${currentView === 'admin' ? 'bg-rose-600 text-white' : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                  }`}
              >
                <Settings size={15} /> Admin
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{unreadCount}</span>}
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser ? (
              <>
                {/* --- KHU VỰC HIỂN THỊ SỐ DƯ & PHÍM TẮT GAME --- */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

                  {/* Số Dư Ví */}
                  <div
                    onClick={() => { requireAuth('naptien'); setCurrentView('naptien'); }}
                    className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)] cursor-pointer shrink-0"
                    title="Số dư ví"
                  >
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-extrabold text-[12px] sm:text-[15px] whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN').format(currentUser.balance)}<span className="text-[10px] sm:text-xs ml-0.5 font-bold">đ</span>
                    </span>
                  </div>

                  {/* Lượt chơi / Thẻ may mắn */}
                  {((hasActiveWheelRewards && !isWheelEventExpired) || isWizardEventVisible) && (
                    <div
                      onClick={() => setCurrentView(isWizardEventVisible ? 'wizard' : 'vongquay')}
                      className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500/15 via-rose-500/15 to-purple-500/15 border border-purple-500/40 hover:border-purple-400 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer shrink-0"
                      title="Thẻ may mắn (Lượt chơi chung Vòng Quay & Sự Kiện Phù Thủy)"
                    >
                      <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                      <span className="text-amber-300 font-extrabold text-[12px] sm:text-[15px] whitespace-nowrap">
                        {currentUser.spins || 0}<span className="text-[10px] sm:text-xs ml-0.5 font-bold"> Lượt</span>
                      </span>
                    </div>
                  )}
                </div>
                {/* Nút cá nhân ẩn bớt trên màn hình cực nhỏ vì đã có bottom nav */}
                <div className="relative hidden sm:block">
                  <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-[#0B1120] p-2 rounded-lg px-3 py-2 border border-slate-700 relative">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                    <div className="flex items-center gap-1.5 transition-opacity">
                      <span className="text-sm font-semibold">{currentUser.name}</span>
                      {calculateTotalRecharged(currentUser?.id) >= 3000000 && (
                        <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-[#0B1120] text-[9px] px-1.5 py-0.5 rounded font-black shadow-[0_0_10px_rgba(250,204,21,0.5)]">VIP</span>
                      )}
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                    {currentUser.role !== 'admin' && unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{unreadCount}</span>}
                  </button>

                  {/* DROPDOWN MENU */}
                  {showUserDropdown && (
                    <>
                      <div className="fixed inset-0 z-[29]" onClick={() => setShowUserDropdown(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-56 bg-[#151D2F] border border-slate-700 rounded-xl shadow-2xl z-[30] py-2 animate-fade-in overflow-hidden">
                        <div className="p-4 border-b border-slate-700 flex flex-col items-center justify-center gap-2">
                          <div className="relative group cursor-pointer">
                            <img src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=151D2F&color=fff`} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-slate-600 group-hover:opacity-50 transition-opacity" />
                            <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">Thay đổi</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => { setShowUserDropdown(false); handleChangeAvatar(e); }} />
                            </label>
                          </div>
                          {currentUser.avatar_url && (
                            <button onClick={() => { setShowUserDropdown(false); handleRemoveAvatar(); }} className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-semibold">
                              Gỡ avatar
                            </button>
                          )}
                        </div>
                        <button onClick={() => { setShowUserDropdown(false); setCurrentView('security'); setProfileTab('info'); }} className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors flex items-center gap-3">
                          <User size={18} className="text-blue-400" /> Quản lý chung
                        </button>
                        <button onClick={() => { setShowUserDropdown(false); setCurrentView('security'); setProfileTab('transfer'); }} className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-emerald-600/20 hover:text-emerald-400 transition-colors flex items-center gap-3">
                          <ArrowLeftRight size={18} className="text-emerald-400" /> Chuyển tiền
                        </button>
                        <button onClick={() => { setShowUserDropdown(false); setCurrentView('security'); setProfileTab('vip'); }} className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-yellow-600/20 hover:text-yellow-400 transition-colors flex items-center gap-3">
                          <Sparkles size={18} className="text-yellow-400" /> VIP
                        </button>

                        <div className="border-t border-slate-700 my-1"></div>
                        {/* Mục game Mộng Thiên Huyễn */}
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            requireAuth('bossgame');
                            setCurrentView('bossgame');
                            if (!bossPlayerSummary) handleGenerateLinkOtp();
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-2.5"
                        >
                          <Link size={16} className="text-amber-400" /> {bossPlayerSummary ? `Game: @${bossPlayerSummary.user_id}` : '🔗 Lấy Mã OTP Game'}
                        </button>
                        {bossPlayerSummary && (
                          <>
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                requireAuth('bossgame');
                                setCurrentView('bossgame');
                                setShowBagModal(true);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors flex items-center gap-2.5"
                            >
                              <Package size={15} className="text-purple-400" /> 🎒 Túi Đồ & Trang Bị
                            </button>
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                requireAuth('bossgame');
                                setCurrentView('bossgame');
                                fetchAuctionMarketData();
                                setShowAuctionModal(true);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-orange-300 hover:bg-orange-500/20 transition-colors flex items-center gap-2.5"
                            >
                              <span className="text-sm">🏛️</span> Sàn Đấu Giá (Chợ Xu)
                            </button>
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                requireAuth('bossgame');
                                setCurrentView('bossgame');
                                setShowBossStatModal(true);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-2.5"
                            >
                              <BarChart2 size={15} className="text-emerald-400" /> 📊 Xem Bảng Stat
                            </button>
                          </>
                        )}

                        <div className="border-t border-slate-700 my-1"></div>
                        <button onClick={() => { setShowUserDropdown(false); setConfirmDialog({ title: 'Đăng xuất', message: 'Bạn có chắc muốn đăng xuất?', onConfirm: async () => { await supabase.auth.signOut(); localStorage.removeItem('shop_cached_user'); localStorage.removeItem('shop_user_id'); localStorage.removeItem('shop_boss_target_id'); localStorage.removeItem('shop_linked_game_player'); sessionStorage.removeItem('post_login_view'); sessionStorage.removeItem('post_login_deposit_method'); setBossPlayerSummary(null); setBossTargetId(''); setCurrentUser(null); setCurrentView('dashboard'); showToast('Đã đăng xuất an toàn!'); } }); }} className="w-full px-4 py-3 text-left text-sm font-semibold text-rose-400 hover:bg-rose-600/20 hover:text-rose-300 transition-colors flex items-center gap-3">
                          <LogOut size={18} /> Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setCurrentView('login')} className="text-slate-300 hover:text-white text-xs sm:text-sm font-semibold px-2 sm:px-4 py-2 transition-colors">Đăng Nhập</button>
                <button onClick={() => setCurrentView('register')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg shadow-blue-600/20 transition-colors">Đăng Ký</button>            </>
            )}
          </div>
        </div>
      </header>
      <div className="bg-gradient-to-r from-emerald-900/40 via-blue-900/40 to-rose-900/40 border-b border-slate-800 text-center py-1.5 px-4 shadow-sm hidden sm:block">
        <p className="text-xs md:text-sm font-semibold text-slate-300">
          🎉 <strong className="text-emerald-400">TIN VUI:</strong> Hệ thống đã hỗ trợ <span className="text-white font-bold">Nạp Tiền Bằng Thẻ Cào</span> siêu tốc 24/7!
          <button onClick={() => { requireAuth('naptien'); setDepositMethod('card'); }} className="ml-2 text-rose-400 hover:text-rose-300 underline font-bold transition-colors">
            Thử ngay
          </button>
        </p>
      </div>
    </>
  );
  const renderForgotPasswordScreen = () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#151D2F] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Khôi phục mật khẩu</h2>
        {forgotPasswordStep === 1 && (
          <>
            <p className="text-slate-400 text-sm text-center mb-6">Nhập Email (@gmail.com) bạn đã đăng ký, chúng tôi sẽ gửi mã xác thực gồm 6 số.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input name="email" type="email" pattern="[a-zA-Z0-9._%+\-]+@[gG][mM][aA][iI][lL]\.[cC][oO][mM]" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none focus:border-blue-500" placeholder="Nhập Email (@gmail.com) của bạn..." title="Vui lòng nhập đúng định dạng Email @gmail.com" />
              <button type="submit" disabled={isRecovering} className={`w-full ${isRecovering ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors`}>
                {isRecovering ? <><RefreshCw className="animate-spin" size={20} /> Đang gửi mã...</> : 'Gửi Mã Xác Thực'}
              </button>
            </form>
          </>
        )}

        {forgotPasswordStep === 2 && (
          <>
            <p className="text-slate-400 text-sm text-center mb-6">Mã xác thực 6 số đã được gửi đến <strong>{recoveryEmail}</strong>. Vui lòng kiểm tra hộp thư (kể cả thư rác).</p>
            <form onSubmit={handleVerifyRecoveryOtp} className="space-y-4">
              <input name="otp" type="text" maxLength="6" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none focus:border-blue-500 tracking-widest text-center text-xl font-bold" placeholder="------" />
              <button type="submit" disabled={isRecovering} className={`w-full ${isRecovering ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors`}>
                {isRecovering ? <><RefreshCw className="animate-spin" size={20} /> Đang kiểm tra...</> : 'Xác Nhận Mã'}
              </button>
            </form>
          </>
        )}

        {forgotPasswordStep === 3 && (
          <>
            <p className="text-slate-400 text-sm text-center mb-6">Xác thực thành công. Vui lòng tạo mật khẩu mới.</p>
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="relative">
                <input name="newPassword" type={showNewPass ? "text" : "password"} required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none focus:border-blue-500 pr-10" placeholder="Mật khẩu mới" />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors">
                  {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input name="confirmPassword" type={showConfirmPass ? "text" : "password"} required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none focus:border-blue-500 pr-10" placeholder="Nhập lại mật khẩu mới" />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors">
                  {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button type="submit" disabled={isRecovering} className={`w-full ${isRecovering ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors`}>
                {isRecovering ? <><RefreshCw className="animate-spin" size={20} /> Đang cập nhật...</> : 'Đổi Mật Khẩu'}
              </button>
            </form>
          </>
        )}
        <button onClick={() => setCurrentView('login')} className="w-full mt-4 text-slate-400 text-sm hover:text-white transition-colors">Quay lại đăng nhập</button>
      </div>
    </div>
  );
  const renderLoginScreen = () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <button onClick={() => setCurrentView('dashboard')} className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2"><ArrowRight className="rotate-180" size={18} /> Về trang chủ</button>
      <div className="max-w-md w-full bg-[#151D2F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-slate-800 bg-[#0B1120]/50 flex justify-center">
          <CustomLogo />
        </div>
        <div className="p-8">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tài khoản (SĐT hoặc Email @gmail.com)</label>
              <input name="contact" type="text" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 focus:border-blue-500 outline-none" placeholder="Nhập SĐT (bắt đầu bằng 0) hoặc Email (@gmail.com)..." />
            </div>
            <div className="relative">
              <label className="block text-sm text-slate-400 mb-1">Mật khẩu</label>
              <input name="password" type={showPassword ? "text" : "password"} required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 focus:border-blue-500 outline-none pr-10" placeholder="123456" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-slate-500 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => setCurrentView('forgot-password')}
                className="text-xs text-blue-400 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
            <button type="submit" disabled={isLoggingIn} className={`w-full ${isLoggingIn ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 rounded-lg mt-6 shadow-lg flex items-center justify-center gap-2 transition-colors`}>
              {isLoggingIn ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
          <div className="mt-6 text-center text-slate-400 text-sm">Chưa có tài khoản? <button onClick={() => setCurrentView('register')} className="text-blue-400 font-bold hover:underline">Đăng ký ngay</button></div>
        </div>
      </div>
    </div>
  );

  const renderRegisterScreen = () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#151D2F] border border-slate-800 rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Tạo tài khoản mới</h2>
        <form className="space-y-4" onSubmit={handleRegister}>
          <input name="name" type="text" minLength="3" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none" placeholder="Họ và tên hiển thị (ít nhất 3 ký tự)" />
          <input name="phone" type="tel" pattern="0[0-9]{9,10}" maxLength="11" onInput={enforcePhoneZeroInput} required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none" placeholder="Số điện thoại (bắt đầu bằng số 0, 10-11 số)" title="Số điện thoại phải bắt đầu bằng số 0 và gồm 10-11 chữ số" />
          <input name="email" type="email" pattern="[a-zA-Z0-9._%+\-]+@[gG][mM][aA][iI][lL]\.[cC][oO][mM]" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none" placeholder="Email (@gmail.com)" title="Vui lòng nhập Email đúng định dạng @gmail.com" />
          <div className="relative">
            <input name="password" type={showPassword ? "text" : "password"} required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none pr-10" placeholder="Mật khẩu" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <input name="company_website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <TurnstileWidget
            onToken={setRegisterTurnstileToken}
            onExpire={() => setRegisterTurnstileToken('')}
            resetSignal={registerTurnstileReset}
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mt-4 shadow-lg">Tạo Tài Khoản</button>
        </form>
        <button onClick={() => setCurrentView('login')} className="w-full mt-4 text-slate-400 text-sm hover:text-white">Quay lại đăng nhập</button>
      </div>
    </div>
  );

  const renderFooter = () => (
    <footer className="w-full max-w-[1500px] mx-auto mt-16 mb-4 px-4 flex flex-col items-center justify-center gap-10 pb-8 border-t border-slate-800 pt-12">

      {/* CỘT TRÁI: LOGO & SLOGAN */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-full max-w-2xl gap-5">

        {/* CÂU SLOGAN TRÊN CÙNG ĐƯỢC TÙY BIẾN THÀNH CÁC THẺ (PILLS) */}
        <div className="w-full max-w-[650px] flex flex-wrap justify-center gap-2 md:gap-3 px-2 mb-2">
          <span className="px-4 py-2 bg-[#151D2F] border border-blue-500/30 text-blue-400 text-[11px] sm:text-[13px] md:text-sm rounded-full font-black shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center gap-2 hover:bg-blue-500/10 hover:scale-105 transition-all cursor-default">
            <Gamepad2 size={18} /> Mua Bán Acc Game
          </span>
          <span className="px-4 py-2 bg-[#151D2F] border border-rose-500/30 text-rose-400 text-[11px] sm:text-[13px] md:text-sm rounded-full font-black shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center gap-2 hover:bg-rose-500/10 hover:scale-105 transition-all cursor-default">
            <TrendingUp size={18} /> Cày Thuê Rank & Sự Kiện
          </span>
          <span className="px-4 py-2 bg-[#151D2F] border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-[13px] md:text-sm rounded-full font-black shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-2 hover:bg-emerald-500/10 hover:scale-105 transition-all cursor-default">
            <Target size={18} /> Tìm Acc Theo Yêu Cầu
          </span>
          <span className="px-4 py-2 bg-[#151D2F] border border-yellow-500/30 text-yellow-400 text-[11px] sm:text-[13px] md:text-sm rounded-full font-black shadow-[0_0_15px_rgba(234,179,8,0.15)] flex items-center gap-2 hover:bg-yellow-500/10 hover:scale-105 transition-all cursor-default">
            <ShieldCheck size={18} /> Trung Gian Cực Rẻ - Phí Chỉ Từ 2.5%
          </span>
        </div>

        <img src="/Logo.png" alt="Shop Tiến Gaming" className="w-[95%] sm:w-[85%] lg:w-[90%] max-w-[480px] object-contain hover:scale-105 transition-transform drop-shadow-[0_0_40px_rgba(37,99,235,0.3)]" />

        {/* 3 Ô SLOGAN */}
        <div className="flex justify-center gap-3 md:gap-4 w-full max-w-[480px]">
          <div className="flex-1 bg-gradient-to-br from-blue-600/10 to-[#151D2F] border border-blue-500/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center shadow-lg hover:border-blue-400 hover:bg-blue-600/20 transition-all group">
            <ShieldCheck size={28} className="text-blue-400 group-hover:scale-110 group-hover:animate-pulse transition-transform" />
            <span className="text-white font-black text-[11px] md:text-[13px] uppercase tracking-wider">Tận Tâm</span>
          </div>

          <div className="flex-1 bg-gradient-to-br from-yellow-500/10 to-[#151D2F] border border-yellow-500/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center shadow-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-all group">
            <Sparkles size={28} className="text-yellow-400 group-hover:scale-110 group-hover:animate-pulse transition-transform" />
            <span className="text-white font-black text-[11px] md:text-[13px] uppercase tracking-wider">Chất Lượng</span>
          </div>

          <div className="flex-1 bg-gradient-to-br from-rose-500/10 to-[#151D2F] border border-rose-500/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center shadow-lg hover:border-rose-400 hover:bg-rose-500/20 transition-all group">
            <Gift size={28} className="text-rose-400 group-hover:scale-110 group-hover:animate-pulse transition-transform" />
            <span className="text-white font-black text-[11px] md:text-[13px] uppercase tracking-wider">Hậu Mãi</span>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: THÔNG TIN */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
          <a href="https://zalo.me/0938240332" target="_blank" rel="noreferrer" className="flex-1 lg:max-w-[280px] flex items-center justify-center lg:justify-start gap-4 bg-[#151D2F] hover:bg-[#1a233a] px-5 py-3.5 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform z-10 shrink-0">
              <span className="text-[#0068FF] font-black text-[11px]">Zalo</span>
            </div>
            <div className="text-left z-10">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Hỗ trợ Zalo</p>
              <p className="text-white font-black tracking-wider text-base">0938.240.332</p>
            </div>
          </a>

          <a href="https://www.facebook.com/giatien2408/" target="_blank" rel="noreferrer" className="flex-1 lg:max-w-[280px] flex items-center justify-center lg:justify-start gap-4 bg-[#151D2F] hover:bg-[#1a233a] px-5 py-3.5 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-[#1877F2]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-10 h-10 bg-gradient-to-b from-[#1877F2] to-[#145CE6] rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform z-10 shrink-0">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white" className="mt-0.5"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg>
            </div>
            <div className="text-left z-10">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Admin Facebook</p>
              <p className="text-white font-black tracking-wide text-base">Nhâm Gia Tiến</p>
            </div>
          </a>
        </div>
      </div>
    </footer>
  );

  const renderBoostingCard = (b, index) => {
    let gName = b.game || '';
    let gAvatar = null;
    try {
      const parsed = JSON.parse(b.game);
      gName = parsed.name || '';
      gAvatar = parsed.avatar || null;
    } catch { /* ignore */ }

    return (
      <div key={b.id} className="bg-[#151D2F] h-full border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all shadow-xl group flex flex-col relative mt-5 hover:-translate-y-1">
        <div className="flex justify-center -mt-5 relative z-30">
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#1a2744] to-[#1e2d4a] border border-blue-500/30 rounded-full pl-1 pr-4 py-1 shadow-xl shadow-blue-500/10">
            {gAvatar && <img src={gAvatar} alt={gName} className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shrink-0 ring-2 ring-blue-400/50" />}
            <span className="text-xs md:text-sm font-black text-blue-300 whitespace-nowrap">{gName}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden rounded-xl">
          {(b.oldPrice > b.price || b.discountPercent > 0) && (
            <div className="absolute top-3 md:top-6 -right-12 md:-right-10 w-36 md:w-40 text-center transform rotate-45 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-[8px] md:text-[11px] py-0.5 md:py-1 shadow-lg z-30 border-y border-white/20 uppercase tracking-widest pointer-events-none mt-4">
              GIẢM {b.oldPrice > b.price ? Math.round(((b.oldPrice - b.price) / b.oldPrice) * 100) : b.discountPercent}%
            </div>
          )}

          {b.image && (
            <ImageCarousel
              images={b.image.split(',')}
              title={b.title}
              setFullScreenImage={setFullScreenImage}
              index={index}
              isFeatured={(() => { try { return JSON.parse(b.game).isFeatured; } catch { return false; } })()}
            />
          )}

          <div className="p-2 md:p-4 flex-1 flex flex-col relative z-10 bg-[#151D2F]">
            <h4 className="text-sm md:text-base font-black text-white text-center mb-1 line-clamp-2 cursor-pointer hover:text-blue-400 leading-tight px-1 whitespace-pre-line" title={b.title} onClick={() => {
              setSelectedBoostRank(0);
              const firstOpt = b.rankOptions?.[0];
              setBoostSubTier(firstOpt?.inputType === 'bac' && (firstOpt?.tierCount || 1) > 1 ? toRoman(firstOpt?.tierCount || 1) : '');
              setBoostCurrentPoints('');
              setBoostTargetPoints('');
              setBoostTargetRank('');
              setBoostQuantity(1);
              setBoostingModalData(b);
            }}>{b.title}</h4>
            <p className="text-[10px] md:text-xs text-slate-400 mb-2 flex-grow whitespace-pre-wrap text-center px-1 line-clamp-2">{b.desc}</p>
            <div className="border-t border-slate-800 pt-2 md:pt-4 flex flex-col gap-2 md:gap-3 flex-1">
              {(() => {
                const isCumulative = b.rankOptions && b.rankOptions.length > 0 && b.rankOptions[0].points !== undefined;
                return (
                  <>
                    <div className="flex flex-col sm:flex-row gap-1.5 justify-center items-center text-center">
                      {!isCumulative && (
                        <div className="flex flex-col items-center py-1.5">
                          <p className="text-[10px] md:text-xs tracking-wider text-slate-500 font-bold mb-0.5 uppercase">GIÁ TỪ</p>
                          {b.oldPrice > b.price ? (
                            <>
                              <p className="text-xs md:text-sm font-bold text-slate-500 line-through mb-0.5">{new Intl.NumberFormat('vi-VN').format(b.oldPrice)}đ</p>
                              <p className="text-lg md:text-2xl mt-0.5 font-black text-rose-500">{new Intl.NumberFormat('vi-VN').format(b.price)}<span className="text-xs md:text-sm opacity-70 ml-0.5">đ{b.priceUnit && `/${b.priceUnit}`}</span></p>
                            </>
                          ) : b.discountPercent > 0 ? (
                            <>
                              <p className="text-xs md:text-sm font-bold text-slate-500 line-through mb-0.5">{new Intl.NumberFormat('vi-VN').format(b.price)}đ</p>
                              <p className="text-lg md:text-2xl mt-0.5 font-black text-rose-500">{new Intl.NumberFormat('vi-VN').format(b.price - Math.floor(b.price * (b.discountPercent / 100)))}<span className="text-xs md:text-sm opacity-70 ml-0.5">đ{b.priceUnit && `/${b.priceUnit}`}</span></p>
                            </>
                          ) : (
                            <p className="text-lg md:text-2xl mt-0.5 font-black text-rose-500">{new Intl.NumberFormat('vi-VN').format(b.price)}<span className="text-xs md:text-sm opacity-70 ml-0.5">đ{b.priceUnit && `/${b.priceUnit}`}</span></p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto w-full pt-1 md:pt-2">
                      <button onClick={() => {
                        if (!currentUser) return requireAuth('login');
                        setSelectedBoostRank(0);
                        const firstOpt = b.rankOptions?.[0];
                        setBoostSubTier(firstOpt?.inputType === 'bac' && (firstOpt?.tierCount || 1) > 1 ? toRoman(firstOpt?.tierCount || 1) : '');
                        setBoostCurrentPoints('');
                        setBoostTargetPoints('');
                        setBoostTargetRank('');
                        setBoostQuantity(1);
                        setBoostingModalData(b);
                      }} className="w-full py-1.5 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-1 transition-colors bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20">Đặt Đơn</button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };


  // --- HÀM CHUẨN HÓA DỮ LIỆU NGƯỜI CHƠI TỪ BẢNG GAME_PLAYERS (SUPABASE) ---
  const parseGamePlayerRecord = (dbPlayer) => {
    if (!dbPlayer) return null;
    let wp = null, ar = null, nk = null, rg = null, pt = null, pn = null, sh = null, ht = null;
    try { wp = dbPlayer.weapon ? (typeof dbPlayer.weapon === 'string' ? JSON.parse(dbPlayer.weapon) : dbPlayer.weapon) : null; } catch { wp = { name: dbPlayer.weapon }; }
    try { ar = dbPlayer.armor ? (typeof dbPlayer.armor === 'string' ? JSON.parse(dbPlayer.armor) : dbPlayer.armor) : null; } catch { ar = { name: dbPlayer.armor }; }
    try { pn = dbPlayer.pants ? (typeof dbPlayer.pants === 'string' ? JSON.parse(dbPlayer.pants) : dbPlayer.pants) : null; } catch { pn = { name: dbPlayer.pants }; }
    if (!pn && wp && wp.pants) {
      try {
        pn = typeof wp.pants === 'string' ? JSON.parse(wp.pants) : wp.pants;
      } catch {
        pn = { name: wp.pants };
      }
    }
    if (Array.isArray(pn)) pn = pn.length > 0 ? pn[0] : null;
    if (pn && !pn.name) pn = null;

    try { nk = dbPlayer.necklace ? (typeof dbPlayer.necklace === 'string' ? JSON.parse(dbPlayer.necklace) : dbPlayer.necklace) : null; } catch { nk = { name: dbPlayer.necklace }; }
    try { rg = dbPlayer.ring ? (typeof dbPlayer.ring === 'string' ? JSON.parse(dbPlayer.ring) : dbPlayer.ring) : null; } catch { rg = { name: dbPlayer.ring }; }
    try { pt = dbPlayer.pet ? (typeof dbPlayer.pet === 'string' ? JSON.parse(dbPlayer.pet) : dbPlayer.pet) : null; } catch { pt = { name: dbPlayer.pet }; }
    try { sh = dbPlayer.shoes ? (typeof dbPlayer.shoes === 'string' ? JSON.parse(dbPlayer.shoes) : dbPlayer.shoes) : null; } catch { sh = { name: dbPlayer.shoes }; }
    if (Array.isArray(sh)) sh = sh.length > 0 ? sh[0] : null;
    if (!sh && wp && wp.shoes) {
      try {
        sh = typeof wp.shoes === 'string' ? JSON.parse(wp.shoes) : wp.shoes;
      } catch {
        sh = { name: wp.shoes };
      }
      if (Array.isArray(sh)) sh = sh.length > 0 ? sh[0] : null;
    }
    if (sh && !sh.name) sh = null;

    try { ht = dbPlayer.hat ? (typeof dbPlayer.hat === 'string' ? JSON.parse(dbPlayer.hat) : dbPlayer.hat) : null; } catch { ht = { name: dbPlayer.hat }; }
    if (Array.isArray(ht)) ht = ht.length > 0 ? ht[0] : null;
    if (!ht && wp && wp.hat) {
      try {
        ht = typeof wp.hat === 'string' ? JSON.parse(wp.hat) : wp.hat;
      } catch {
        ht = { name: wp.hat };
      }
      if (Array.isArray(ht)) ht = ht.length > 0 ? ht[0] : null;
    }
    if (ht && !ht.name) ht = null;

    const normalizeEquipSubStats = (item) => {
      if (!item || typeof item !== 'object') return item;
      if (typeof item.sub_stats === 'string' && item.sub_stats.trim()) {
        try {
          const parsed = JSON.parse(item.sub_stats);
          if (Array.isArray(parsed)) item.sub_stats = parsed;
          else item.sub_stats = [item.sub_stats];
        } catch {
          item.sub_stats = [item.sub_stats];
        }
      }
      if (typeof item.star_sub_stats === 'string' && item.star_sub_stats.trim()) {
        try {
          const parsed = JSON.parse(item.star_sub_stats);
          if (Array.isArray(parsed)) item.star_sub_stats = parsed;
          else item.star_sub_stats = [item.star_sub_stats];
        } catch {
          item.star_sub_stats = [item.star_sub_stats];
        }
      }
      return item;
    };
    [wp, ar, pn, nk, rg, pt, sh, ht].forEach(normalizeEquipSubStats);

    return {
      exists: true,
      user_id: dbPlayer.user_id,
      nickname: dbPlayer.nickname || dbPlayer.user_id,
      level: dbPlayer.level || 1,
      cp: dbPlayer.cp || 0,
      bonus_attacks: dbPlayer.bonus_attacks || 0,
      avatar_url: (() => {
        let av = dbPlayer.avatar_url;
        if (av && typeof av === 'string') {
          const expMatch = av.match(/[?&]x-expires=(\d+)/);
          if (expMatch && expMatch[1]) {
            const expTime = parseInt(expMatch[1], 10);
            if (!isNaN(expTime) && Date.now() / 1000 >= expTime) {
              av = null; // Expired TikTok avatar
            }
          }
        }
        if (!av && currentUser?.id && (currentUser.linked_game_id === dbPlayer.user_id || currentUser.name === dbPlayer.nickname) && currentUser.avatar_url) {
          av = currentUser.avatar_url;
        }
        return av;
      })(),
      weapon: wp,
      armor: ar,
      pants: pn,
      pet: pt,
      ring: rg,
      necklace: nk,
      shoes: sh,
      hat: ht,
      exp: wp?.player_exp || 0,
      bonus_coins: (wp?.player_coins !== undefined && wp?.player_coins !== null) ? Number(wp.player_coins) : (dbPlayer.bonus_coins || dbPlayer.coins || 0),
      honor_points: Number(wp?.honor_points !== undefined && wp?.honor_points !== null ? wp.honor_points : (dbPlayer.honor_points || dbPlayer.honor || 0)),
      total_dmg: wp?.total_dmg || 0,
      has_x2_rate: wp?.has_x2_rate || false,
      platform: wp?.platform || 'tiktok',
      linked_discord: Boolean(wp?.linked_discord !== undefined ? wp.linked_discord : dbPlayer.linked_discord),
      linked_tiktok: Boolean(wp?.linked_tiktok !== undefined ? wp.linked_tiktok : dbPlayer.linked_tiktok),
      pvp_points: Number(wp?.pvp_points !== undefined ? wp.pvp_points : (dbPlayer.pvp_points || 500)),
      pvp_wins: Number(wp?.pvp_wins !== undefined ? wp.pvp_wins : (dbPlayer.pvp_wins || 0)),
      pvp_losses: Number(wp?.pvp_losses !== undefined ? wp.pvp_losses : (dbPlayer.pvp_losses || 0)),
      pvp_streak: Number(wp?.pvp_streak !== undefined ? wp.pvp_streak : (dbPlayer.pvp_streak || 0)),
      inventory: (() => {
        const raw = wp?.inventory || dbPlayer?.inventory;
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
          try {
            const pJson = JSON.parse(raw);
            if (Array.isArray(pJson)) return pJson;
          } catch { /* ignore */ }
        }
        return [];
      })()
    };
  };

  // --- HÀM TRA CỨU NGƯỜI CHƠI GAME BOSS MỘNG THIÊN HUYỄN ---
  const handleCheckBossPlayer = async (targetIdInput, isSilent = true) => {
    const rawId = (targetIdInput !== undefined ? targetIdInput : bossTargetId).trim();
    if (!rawId) {
      if (!isSilent) showToast("Vui lòng nhập ID TikTok, Discord ID hoặc Tên In-game!", "error");
      return;
    }
    setIsCheckingBossPlayer(true);
    try {
      const cleanId = rawId.replace(/^@/, '').trim().toLowerCase();
      let foundPlayer = null;
      setBossPlayerNotFound(false);

      // 1. Tra cứu trực tiếp từ Supabase Cloud (24/7, hoạt động mọi lúc kể cả khi tắt máy tính/tắt game)
      try {
        // Ưu tiên tra cứu TUYỆT ĐỐI theo user_id trước để tránh trùng nickname giữa các người chơi
        const { data: dbPlayerById } = await supabase
          .from('game_players')
          .select('*')
          .eq('user_id', cleanId)
          .maybeSingle();

        if (dbPlayerById) {
          foundPlayer = parseGamePlayerRecord(dbPlayerById);
        } else {
          // Chỉ tra cứu theo nickname nếu không tìm thấy user_id
          const { data: dbPlayersByNick } = await supabase
            .from('game_players')
            .select('*')
            .ilike('nickname', cleanId)
            .order('cp', { ascending: false })
            .limit(1);

          if (dbPlayersByNick && dbPlayersByNick.length > 0) {
            foundPlayer = parseGamePlayerRecord(dbPlayersByNick[0]);
          }
        }
      } catch (err) {
        console.log("Supabase player lookup:", err);
      }

      // 2. Tra cứu hoàn tất qua Supabase Cloud
      if (foundPlayer) {
        setBossPlayerSummary(foundPlayer);
        setBossTargetId(foundPlayer.user_id);
        setBossPlayerNotFound(false);
        setBossNotFoundQuery('');
        if (currentUser?.id && currentUser.linked_game_id === foundPlayer.user_id) {
          localStorage.setItem(`shop_linked_game_id_${currentUser.id}`, foundPlayer.user_id);
        }
        if (!isSilent) {
          showToast(`Đã nhận diện: ${foundPlayer.nickname} (Cấp ${foundPlayer.level} - ${new Intl.NumberFormat('vi-VN').format(foundPlayer.cp)} CP)!`);
        }
      } else {
        // KHÔNG TÌM THẤY: Báo rõ không có dữ liệu
        setBossPlayerSummary(null);
        setBossPlayerNotFound(true);
        setBossNotFoundQuery(rawId);
        if (!isSilent) {
          showToast(`Không tìm thấy dữ liệu người chơi "${rawId}"! Vui lòng kiểm tra lại ID.`, "error");
        }
      }
    } finally {
      setIsCheckingBossPlayer(false);
    }
  };

  // Dọn dẹp cache cũ không an toàn từ các phiên trước
  useEffect(() => {
    try {
      localStorage.removeItem('shop_linked_game_player');
      localStorage.removeItem('shop_boss_target_id');
    } catch { /* ignore */ }
  }, []);

  // Tự động đồng bộ và duy trì thông tin nhân vật game của tài khoản đã liên kết (có cooldown tránh re-fetch khi chuyển tab)
  useEffect(() => {
    if (!currentUser?.id) {
      lastLinkedSyncRef.current = { uid: null, ts: 0 };
      setBossPlayerSummary(null);
      setBossTargetId('');
      return;
    }
    const nowMs = Date.now();
    const uidChanged = lastLinkedSyncRef.current.uid !== currentUser.id;
    const isGameView = currentView === 'bossgame' || currentView === 'vongquay' || currentView === 'wizard';
    if (!uidChanged && (!isGameView || (nowMs - lastLinkedSyncRef.current.ts) < 120000)) {
      return;
    }
    lastLinkedSyncRef.current = { uid: currentUser.id, ts: nowMs };

    let isSubscribed = true;
    (async () => {
      try {
        // Luôn xác thực trực tiếp với Supabase Cloud để lấy đúng nhân vật liên kết, loại bỏ cache cũ sai lệch
        const { data: pastOrders } = await supabase
          .from('game_orders')
          .select('result, user_id, web_user, rewards')
          .eq('package_id', 'account_link_otp')
          .eq('status', 'completed')
          .or(`web_user.eq."${currentUser.id}",rewards->>web_user_id.eq."${currentUser.id}"`)
          .order('completed_at', { ascending: false })
          .limit(20);

        if (isSubscribed && pastOrders && pastOrders.length > 0) {
          let hasDc = false;
          let hasTt = false;
          let latestUid = null;
          pastOrders.forEach(ord => {
            const res = ord.result || {};
            const uid = res.game_user_id || ord.user_id;
            if (!latestUid && uid) latestUid = uid;
            const isDc = res.platform === 'discord' || (uid && String(uid).toLowerCase().startsWith('discord_'));
            const isTt = res.platform === 'tiktok' || (uid && !String(uid).toLowerCase().startsWith('discord_'));
            if (isDc) hasDc = true;
            if (isTt) hasTt = true;
          });
          setUserLinkedPlatforms({ discord: hasDc, tiktok: hasTt });

          if (latestUid) {
            localStorage.setItem(`shop_linked_game_id_${currentUser.id}`, latestUid);
            setCurrentUser(prev => prev && prev.linked_game_id !== latestUid ? ({ ...prev, linked_game_id: latestUid }) : prev);
            setBossTargetId(latestUid);
            handleCheckBossPlayer(latestUid);
            return;
          }
        }
      } catch (err) {
        console.log("Lỗi đồng bộ liên kết game:", err);
      }
      if (isSubscribed) {
        localStorage.removeItem(`shop_linked_game_id_${currentUser.id}`);
        setCurrentUser(prev => prev && prev.linked_game_id ? ({ ...prev, linked_game_id: null }) : prev);
        setBossPlayerSummary(null);
        setBossTargetId('');
      }
    })();
    return () => { isSubscribed = false; };
  }, [currentUser?.id, currentView]);


  // Tự động làm mới túi đồ mỗi khi mở Modal Túi Đồ
  useEffect(() => {
    if (showBagModal && bossTargetId) {
      handleCheckBossPlayer(bossTargetId);
    }
  }, [showBagModal]);

  // --- TỰ ĐỘNG ĐỒNG BỘ REALTIME DỮ LIỆU GAME (GAME_PLAYERS) TỪ SUPABASE (CHỈ MỞ Ở TRANG BOSS GAME & LỌC ĐÚNG ROW) ---
  useEffect(() => {
    if (currentView !== 'bossgame') return undefined;

    const watchedUid = (bossTargetId || currentUser?.linked_game_id || '').trim().toLowerCase().replace(/^@/, '');
    if (!watchedUid && !showAuctionModal) return undefined;

    const handleGamePlayerRealtime = (payload) => {
      const newRec = payload.new;
      if (!newRec) return;

      // 1. Cập nhật Sàn Đấu Giá Chợ Trời nếu có thay đổi vật phẩm từ game hoặc web
      if (newRec.user_id === '__auction_market__') {
        try {
          const parsed = typeof newRec.weapon === 'string' ? JSON.parse(newRec.weapon) : newRec.weapon;
          if (parsed && Array.isArray(parsed.active_listings)) {
            setAuctionMarketData(parsed);
            return;
          }
        } catch { /* ignore */ }
        if (typeof fetchAuctionMarketData === 'function') {
          fetchAuctionMarketData();
        }
        return;
      }

      // 2. Nhận diện nhân vật đang hiển thị trên giao diện hoặc nhân vật đã liên kết (Chỉ khớp chính xác ID, không khớp theo tên)
      const target = (bossTargetId || '').trim().toLowerCase().replace(/^@/, '');
      const linked = (currentUser?.linked_game_id || '').trim().toLowerCase().replace(/^@/, '');
      const rowUid = (newRec.user_id || '').trim().toLowerCase().replace(/^@/, '');

      const isCurrentTarget = target && rowUid === target;
      const isLinkedTarget = linked && rowUid === linked;

      if (isCurrentTarget || isLinkedTarget) {
        const parsed = parseGamePlayerRecord(newRec);
        if (parsed) {
          setBossPlayerSummary(parsed);
          setBossPlayerNotFound(false);
        }
      }
    };

    const gamePlayersChannel = supabase.channel(
      `realtime-game-players-${watchedUid || 'none'}-${showAuctionModal ? 'mkt' : 'nomkt'}`
    );

    if (watchedUid) {
      gamePlayersChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `user_id=eq.${watchedUid}` },
        handleGamePlayerRealtime
      );
    }

    if (showAuctionModal) {
      gamePlayersChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: 'user_id=eq.__auction_market__' },
        handleGamePlayerRealtime
      );
    }

    gamePlayersChannel.subscribe();

    return () => {
      supabase.removeChannel(gamePlayersChannel);
    };
  }, [currentView, bossTargetId, currentUser?.linked_game_id, showAuctionModal]);

  // --- HÀM TẠO MÃ OTP LIÊN KẾT TÀI KHOẢN (REALTIME + POLLING + TAB FOCUS) ---
  const handleGenerateLinkOtp = async (targetPlatform = 'all') => {
    if (!currentUser) return requireAuth('login');
    setIsGeneratingOtp(true);
    setLinkOtpTarget(targetPlatform);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const orderId = `OTP_${Date.now()}_${code}`;
      const expiresAt = Date.now() + 2 * 60 * 1000;

      const { error } = await supabase.from('game_orders').insert([{
        id: orderId,
        user_id: code,
        nickname: currentUser.name || 'Khách Web',
        web_user: currentUser.id,
        package_id: 'account_link_otp',
        package_name: targetPlatform === 'discord' ? 'Liên kết tài khoản Discord qua OTP' : 'Liên kết tài khoản game qua OTP',
        price: 0,
        rewards: {
          otp_code: code,
          web_user_id: currentUser.id,
          web_user_name: currentUser.name,
          target_platform: targetPlatform,
          expires_at: expiresAt
        },
        status: 'pending'
      }]);

      if (error) throw error;

      setLinkOtpCode(code);
      setLinkOtpExpiresAt(expiresAt);
      setLinkOtpCountdown(120);
      setIsWaitingOtp(true);
      setShowLinkOtpModal(true);
      showToast("Đã tạo mã OTP (hiệu lực 2 phút)! Hãy bình luận trên Live TikTok hoặc chat Discord để liên kết.", "success");

      // Xử lý khi hoàn tất liên kết (Đóng modal ngay lập tức, cập nhật giao diện không có độ trễ)
      let isCompletedHandled = false;
      let pollInterval = null;
      let realtimeChannel = null;

      const onOtpSuccess = (completedOrder) => {
        if (isCompletedHandled) return;
        isCompletedHandled = true;

        if (pollInterval) clearInterval(pollInterval);
        if (realtimeChannel) supabase.removeChannel(realtimeChannel);
        window.removeEventListener('focus', handleTabFocus);

        setIsWaitingOtp(false);
        setShowLinkOtpModal(false);

        const res = completedOrder.result || {};
        const linkedUid = res.game_user_id || completedOrder.user_id;
        const isDc = res.platform === 'discord' || String(linkedUid).toLowerCase().startsWith('discord_');
        const isTt = res.platform === 'tiktok' || !String(linkedUid).toLowerCase().startsWith('discord_');

        setUserLinkedPlatforms(prev => ({
          ...prev,
          discord: prev.discord || isDc,
          tiktok: prev.tiktok || isTt
        }));

        if (currentUser?.id) {
          localStorage.setItem(`shop_linked_game_id_${currentUser.id}`, linkedUid);
        }
        setCurrentUser(prev => prev ? ({ ...prev, linked_game_id: linkedUid }) : prev);
        setBossTargetId(linkedUid);

        // Hiển thị ngay profile nhân vật tạm thời để UI cập nhật tức thì 100% không bị treo
        setBossPlayerSummary(prev => ({
          ...(prev || {}),
          exists: true,
          user_id: linkedUid,
          nickname: res.game_nickname || linkedUid,
          level: res.level || prev?.level || 1,
          cp: res.cp || prev?.cp || 0,
          bonus_attacks: prev?.bonus_attacks || 0,
          royal_chests: prev?.royal_chests || 0,
          boss_chests: prev?.boss_chests || 0,
          avatar_url: res.avatar_url || prev?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(linkedUid)}`,
          weapon: prev?.weapon || null,
          armor: prev?.armor || null,
          pants: prev?.pants || null,
          pet: prev?.pet || null,
          ring: prev?.ring || null,
          necklace: prev?.necklace || null,
          shoes: prev?.shoes || null,
          exp: prev?.exp || 0,
          bonus_coins: prev?.bonus_coins || 0,
          total_dmg: prev?.total_dmg || 0,
          has_x2_rate: prev?.has_x2_rate || false,
          platform: res.platform || (isDc ? 'discord' : 'tiktok'),
          linked_discord: (prev?.linked_discord || isDc),
          linked_tiktok: (prev?.linked_tiktok || isTt),
          inventory: prev?.inventory || []
        }));

        showToast(`🎉 Liên kết thành công với nhân vật ${res.game_nickname || linkedUid}!`, "success");

        // Đồng thời tải đầy đủ trang bị & chỉ số từ game_players ở background
        handleCheckBossPlayer(linkedUid);
      };

      // 1. Kiểm tra ngay khi người dùng chuyển tab quay lại trình duyệt từ Discord/TikTok
      const handleTabFocus = async () => {
        if (isCompletedHandled) return;
        try {
          const { data: orderNow } = await supabase
            .from('game_orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();
          if (orderNow && orderNow.status === 'completed') {
            onOtpSuccess(orderNow);
          }
        } catch { /* ignore */ }
      };
      window.addEventListener('focus', handleTabFocus);

      // 2. Kênh Realtime Supabase: Bắt sự kiện UPDATE tức thì (50ms)
      try {
        realtimeChannel = supabase
          .channel(`otp_order_${orderId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'game_orders', filter: `id=eq.${orderId}` },
            (payload) => {
              if (payload.new && payload.new.status === 'completed') {
                onOtpSuccess(payload.new);
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.log("Realtime subscription error:", e);
      }

      // 3. Polling dự phòng mỗi 1.5s (chạy trong 5 phút đề phòng chuyển app)
      pollInterval = setInterval(async () => {
        if (isCompletedHandled) return;
        try {
          const { data: checkOrder } = await supabase
            .from('game_orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();

          if (checkOrder && checkOrder.status === 'completed') {
            onOtpSuccess(checkOrder);
          }
        } catch (e) {
          console.error("Lỗi poll OTP:", e);
        }
      }, 1500);

      setTimeout(() => {
        if (pollInterval) clearInterval(pollInterval);
        if (realtimeChannel) supabase.removeChannel(realtimeChannel);
        window.removeEventListener('focus', handleTabFocus);
      }, 5 * 60 * 1000);

    } catch (err) {
      console.error("Lỗi tạo mã OTP:", err);
      showToast("Không thể tạo mã OTP lúc này, vui lòng thử lại sau!", "error");
    } finally {
      setIsGeneratingOtp(false);
    }
  };
  // --- HÀM LẤY DỮ LIỆU SÀN ĐẤU GIÁ (AUCTION MARKET) ---
  const fetchAuctionMarketData = async () => {
    try {
      // 1. Đọc từ game_players (__auction_market__) - luôn được backend đồng bộ trực tiếp 24/7
      const { data: playerMarket } = await supabase
        .from('game_players')
        .select('weapon')
        .eq('user_id', '__auction_market__')
        .maybeSingle();

      if (playerMarket && playerMarket.weapon) {
        try {
          const parsed = typeof playerMarket.weapon === 'string' ? JSON.parse(playerMarket.weapon) : playerMarket.weapon;
          if (parsed && Array.isArray(parsed.active_listings)) {
            setAuctionMarketData(parsed);
            return;
          }
        } catch { /* ignore */ }
      }

      // 2. Dự phòng đọc từ site_config
      const { data } = await supabase
        .from('site_config')
        .select('*')
        .eq('id', 'game_auction_market')
        .maybeSingle();
      if (data && data.value) {
        setAuctionMarketData(data.value);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu sàn đấu giá:", err);
    }
  };
  // --- HÀM THANH TOÁN MUA GÓI NẠP GAME BOSS MỘNG THIÊN HUYỄN ---
  const executeBuyBossPackage = async (pkg) => {
    if (!currentUser) return requireAuth('login');
    if (!bossPlayerSummary) {
      showToast("Vui lòng liên kết tài khoản game qua mã OTP trước khi nạp!", "error");
      setShowLinkOtpModal(true);
      return;
    }
    if ((currentUser.balance || 0) < pkg.price) {
      showToast(`Số dư ví không đủ! Cần thêm ${new Intl.NumberFormat('vi-VN').format(pkg.price - (currentUser.balance || 0))}đ. Vui lòng nạp tiền vào ví.`, "error");
      return;
    }
    if (isBuyingBossPackage) return;
    setIsBuyingBossPackage(true);

    const orderId = `BG_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN');
    const targetUid = (bossPlayerSummary.user_id || bossTargetId).trim().replace(/^@/, '');

    try {
      // Trừ tiền + ghi giao dịch + tạo đơn trong 1 transaction an toàn phía Supabase (giá & phần thưởng do server tự tra)
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('rpc_buy_boss_package', {
        p_package_id: pkg.id,
        p_target_uid: targetUid,
        p_nickname: bossPlayerSummary?.nickname || bossTargetId.trim()
      });
      if (rpcErr) throw rpcErr;
      if (!rpcRes?.success) throw new Error(rpcRes?.message || 'Thanh toán thất bại!');

      const finalOrderId = rpcRes.order_id || orderId;
      const txPayload = {
        id: finalOrderId,
        user: currentUser.name,
        action: `Nạp ${pkg.name} [${bossTargetId.trim()}]`,
        amount: pkg.price,
        date: dateStr,
        status: 'Đã hoàn tất',
        type: 'boss_game_topup',
        isSpinCost: false,
        accDetails: { order_id: finalOrderId, user_id: targetUid, package_id: pkg.id, package_name: pkg.name, price: pkg.price }
      };

      // Cập nhật state client
      const updatedUser = { ...currentUser, balance: Number(rpcRes.new_balance) };
      setCurrentUser(updatedUser);
      localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
      setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));
      setTransactionsDb([txPayload, ...transactionsDb]);

      setSelectedBossPackage(null);
      setBossSuccessModal({
        pkg,
        targetId: bossTargetId.trim(),
        orderId: finalOrderId
      });
      showToast(`Nạp ${pkg.name} thành công! Vật phẩm đang được chuyển tự động vào game.`);
      sendAdminAlert('NẠP GAME BOSS MỘNG THIÊN HUYỄN', `Khách ${currentUser.name} vừa nạp ${pkg.name} (${new Intl.NumberFormat('vi-VN').format(pkg.price)}đ) cho ID: ${bossTargetId.trim()}`);

    } catch (err) {
      showToast("Lỗi khi thanh toán: " + (err.message || err), "error");
    } finally {
      setIsBuyingBossPackage(false);
    }
  };

  // --- CÁC HÀM XỬ LÝ GAME MỘNG THIÊN CỬU H5 (TẢI GAME CỐ ĐỊNH + NẠP XU VÍ GAME) ---
  const handleSaveMtcGameConfig = async (newCfg, toastMsg = 'Đã lưu cấu hình Mộng Thiên Cửu H5!') => {
    setMtcGameConfig(newCfg);
    try { localStorage.setItem('shop_mtc_game_config', JSON.stringify(newCfg)); } catch { /* ignore */ }
    try {
      await supabase.from('site_config').upsert({ id: 'mtc_game_config', value: newCfg });
    } catch (e) {
      console.warn('Lỗi lưu mtc_game_config:', e);
    }
    if (toastMsg) showToast(toastMsg, 'success');
  };

  const handleRefreshMtcTunnel = async (silent = false) => {
    try {
      const { data: regData } = await supabase.from('site_config').select('value').eq('id', 'mtc_server_registry').maybeSingle();
      if (regData?.value?.server_url) {
        setMtcServerRegistry(regData.value);
        if (!silent) showToast('Đã đồng bộ link máy chủ online mới nhất!', 'success');
        return regData.value;
      }
      const resp = await fetch('https://ntfy.sh/mtc_s0_beta_registry_f8a9d2c4e1b7/raw?poll=1&since=all', { cache: 'no-store' });
      if (resp.ok) {
        const txt = await resp.text();
        const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const last = JSON.parse(lines[lines.length - 1]);
          if (last?.online_url) {
            const synced = { server_url: last.online_url, base_url: last.base_url, version: `${last.version_name || '2.5.6'}-${last.server || 's0-beta'}`, updated_at: last.ts };
            setMtcServerRegistry(synced);
            if (!silent) showToast('Đã cập nhật link Web H5 mới nhất từ Cloud Registry!', 'success');
            return synced;
          }
        }
      }
    } catch {
      if (!silent) showToast('Không thể làm mới link server lúc này!', 'warning');
    }
    return null;
  };

  const renderDashboardScreen = () => {
    // Chỉ lấy những tài khoản chưa bị đánh dấu Đã Bán
    const availableAccounts = accountsDb.filter(acc => !acc.is_sold && (acc.stock === undefined || acc.stock > 0));

    const uniqueGamesMap = new Map();
    uniqueGamesMap.set('Mộng Thiên Huyễn', '/mongthienhuyen.jpg');
    availableAccounts.forEach(acc => {
      const info = getGameInfo(acc.game);
      if (!uniqueGamesMap.has(info.name)) uniqueGamesMap.set(info.name, info.avatar);
    });
    const gameTabs = ['Tất cả', ...uniqueGamesMap.keys()];
    const baseAccounts = activeTab === 'Tất cả' ? availableAccounts : availableAccounts.filter(acc => getGameInfo(acc.game).name === activeTab);
    const baseBoosting = boostingDb.filter(b => getGameInfo(b.game).isFeatured && (activeTab === 'Tất cả' || getGameInfo(b.game).name === activeTab));

    const mixedItems = [...baseBoosting, ...baseAccounts].sort((a, b) => {
      const aFeatured = getGameInfo(a.game).isFeatured;
      const bFeatured = getGameInfo(b.game).isFeatured;
      return (bFeatured === true) - (aFeatured === true);
    });


    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-20">
        {renderNavbar()}
        <main className="w-full max-w-7xl mx-auto px-4 lg:px-6 2xl:px-8 pt-6">
          <div className="w-full space-y-8">
            <section className="relative rounded-2xl border border-slate-800 overflow-hidden shadow-2xl min-h-[350px] flex items-center bg-[#0f172a]">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000&h=800" alt="Gaming Banner" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/90 to-transparent"></div>
              </div>

              <div className="relative z-10 w-full p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-left">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="inline-block px-4 py-1 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-full border border-rose-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(225,29,72,0.3)]">🔥 UY TÍN - TỐC ĐỘ - BẢO MẬT</div>
                    <div
                      onClick={() => { requireAuth('naptien'); setDepositMethod('card'); }}
                      className="inline-block px-4 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(16,185,129,0.3)] cursor-pointer hover:bg-emerald-500/30 transition-colors"
                    >
                      💳 HỖ TRỢ NẠP THẺ CÀO TỰ ĐỘNG
                    </div>
                    {hasActiveWheelRewards && isWheelEventPublicOpen && (
                      <div
                        onClick={() => setCurrentView('vongquay')}
                        className="inline-flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-rose-500/30 via-pink-500/30 to-amber-500/30 text-amber-300 font-extrabold text-xs rounded-full border border-rose-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-105 transition-all animate-pulse"
                        title="Hạn chót đúng 23h59 ngày 16/10"
                      >
                        <span className="text-sm">👟</span>
                        <span>VÒNG QUAY GIÀY THẦN TỐC (CÒN {wheelCountdown.days}N {wheelCountdown.hours}:{wheelCountdown.minutes}:{wheelCountdown.seconds})</span>
                      </div>
                    )}
                    <div
                      onClick={() => { requireAuth('bossgame'); setCurrentView('bossgame'); }}
                      className="inline-block px-4 py-1 bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-300 font-extrabold text-xs rounded-full border border-amber-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer hover:scale-105 transition-all animate-pulse"
                    >
                      ⚔️ NẠP GAME MỘNG THIÊN HUYỄN (TỰ ĐỘNG)
                    </div>
                    <div
                      onClick={() => {
                        requireAuth('bossgame');
                        setCurrentView('bossgame');
                        fetchAuctionMarketData();
                        setShowAuctionModal(true);
                      }}
                      className="inline-block px-4 py-1 bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-300 font-extrabold text-xs rounded-full border border-orange-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.5)] cursor-pointer hover:scale-105 transition-all"
                    >
                      🏛️ SÀN ĐẤU GIÁ (CHỢ XU 20%)
                    </div>
                    <div
                      onClick={() => {
                        requireAuth('bossgame');
                        setCurrentView('bossgame');
                        if (!bossPlayerSummary) handleGenerateLinkOtp(); else setShowBagModal(true);
                      }}
                      className="inline-block px-4 py-1 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-300 font-extrabold text-xs rounded-full border border-purple-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.5)] cursor-pointer hover:scale-105 transition-all"
                    >
                      {bossPlayerSummary ? '🎒 TÚI ĐỒ & QUẢN LÝ TRANG BỊ' : '🔗 LIÊN KẾT TÀI KHOẢN GAME (OTP)'}
                    </div>
                    <a
                      href={DISCORD_INVITE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-[#5865F2]/40 via-indigo-600/40 to-[#4752C4]/40 hover:from-[#5865F2]/70 hover:to-[#4752C4]/70 text-white font-extrabold text-xs rounded-full border border-[#5865F2]/60 backdrop-blur-sm shadow-[0_0_15px_rgba(88,101,242,0.4)] cursor-pointer hover:scale-105 transition-all"
                    >
                      <DiscordIcon className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>🎮 THAM GIA DISCORD CHƠI GAME</span>
                    </a>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase leading-tight drop-shadow-lg">
                    TRẢI NGHIỆM GAMING <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-rose-400">ĐỈNH CAO NHẤT</span>
                  </h2>
                  <p className="text-slate-300 mb-8 max-w-xl text-sm md:text-base leading-relaxed">Hệ thống Shop Tiến Gaming uy tín chất lượng số 1 Việt Nam. Hàng ngàn tài khoản VIP cho thuê và mua bán với giá cực sinh viên. Mua ngay nhận tài khoản trong 1 giây, bảo hành 1 đổi 1 nếu sai thông tin.</p>

                  <div className="relative max-w-xl w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input type="text" placeholder="Tìm tên game, mã ID, tướng, skin..." className="w-full pl-12 pr-12 py-4 bg-[#0B1120]/80 backdrop-blur-md border border-slate-700 rounded-xl text-sm md:text-base text-white focus:outline-none focus:border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors shadow-lg flex items-center justify-center"><ArrowRight size={20} /></button>
                  </div>
                </div>

                <div className="hidden lg:flex flex-col gap-5 w-72">
                  <div className="bg-[#151D2F]/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-xl transform transition-transform hover:scale-105 hover:border-emerald-500/50 cursor-default">
                    <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400"><ShieldCheck size={28} /></div>
                    <div><p className="text-white font-bold text-lg">Uy tín 100%</p><p className="text-xs text-slate-400">Bảo hành trọn đời</p></div>
                  </div>
                  <div className="bg-[#151D2F]/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-xl transform transition-transform hover:scale-105 hover:border-blue-500/50 cursor-default">
                    <div className="bg-blue-500/20 p-3 rounded-full text-blue-400"><RefreshCw size={28} /></div>
                    <div><p className="text-white font-bold text-lg">Giao dịch tự động</p><p className="text-xs text-slate-400">Nhận acc sau 1 giây</p></div>
                  </div>
                  <div className="bg-[#151D2F]/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-xl transform transition-transform hover:scale-105 hover:border-rose-500/50 cursor-default">
                    <div className="bg-rose-500/20 p-3 rounded-full text-rose-400"><Target size={28} /></div>
                    <div><p className="text-white font-bold text-lg">Cày thuê VIP</p><p className="text-xs text-slate-400">Nhanh chóng, an toàn</p></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ô BANNER THAM GIA SERVER DISCORD ĐỂ CHƠI GAME TẠI ĐÂY */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#5865F2]/50 bg-gradient-to-r from-[#171933] via-[#1a1f3d] to-[#12162a] p-5 sm:p-6 shadow-[0_0_35px_rgba(88,101,242,0.25)] flex flex-col md:flex-row items-center justify-between gap-5 transition-all hover:border-[#5865F2] hover:shadow-[0_0_45px_rgba(88,101,242,0.35)]">
              <div className="absolute top-0 right-0 w-80 h-32 bg-[#5865F2]/10 blur-3xl pointer-events-none"></div>
              <div className="flex items-center gap-4 text-left w-full md:w-auto relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#404eed] flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(88,101,242,0.7)] border border-indigo-300/30 animate-pulse">
                  <DiscordIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#5865F2]/25 border border-[#5865F2]/50 text-indigo-300">
                      🎮 CỘNG ĐỒNG GAME THỦ 24/7
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> BOT ĐANG HOẠT ĐỘNG
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Tham Gia Server Discord Để Chơi Game Tại Đây
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Chiến game săn Boss Mộng Thiên Huyễn, gõ lệnh nhận lượt đánh, mở rương thần binh khủng và giao lưu cộng đồng cực vui cùng hàng ngàn game thủ!
                  </p>
                </div>
              </div>

              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto shrink-0 px-6 py-3.5 bg-gradient-to-r from-[#5865F2] via-indigo-600 to-[#4752C4] hover:from-[#4752C4] hover:to-[#3b439c] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(88,101,242,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer relative z-10"
              >
                <DiscordIcon className="w-5 h-5 text-white shrink-0" />
                <span>Tham Gia Server Discord Ngay</span>
                <ArrowRight size={18} />
              </a>
            </div>

            <section>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Flame className="text-rose-500 animate-pulse" />
                  <h3 className="text-xl font-bold text-white uppercase">{activeTab === 'Tất cả' ? 'Tất cả sản phẩm' : `Tài khoản ${activeTab}`}</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 scrollbar-hide">
                  {gameTabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${activeTab === tab ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
                      {tab !== 'Tất cả' && uniqueGamesMap.get(tab) && <img src={uniqueGamesMap.get(tab)} className="w-4 h-4 rounded" alt="" />}
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-2.5 md:gap-x-5 gap-y-8 md:gap-y-10">
                {/* THẺ DỊCH VỤ NẠP GAME MỘNG THIÊN HUYỄN (TỰ ĐỘNG) */}
                {(activeTab === 'Tất cả' || activeTab === 'Mộng Thiên Huyễn') && (
                  <div
                    onClick={() => {
                      requireAuth('bossgame');
                      setCurrentView('bossgame');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#151D2F] h-full border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all shadow-xl group flex flex-col relative mt-5 hover:-translate-y-1 cursor-pointer"
                  >
                    {/* BADGE GAME NHÔ LÊN TRÊN THẺ (GIỐNG HỆT CÁC THẺ GAME KHÁC) */}
                    <div className="flex justify-center -mt-5 relative z-30">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-[#1a2744] to-[#1e2d4a] border border-blue-500/30 rounded-full pl-1 pr-4 py-1 shadow-xl shadow-blue-500/10">
                        <img src="/mongthienhuyen.jpg" alt="Mộng Thiên Huyễn" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shrink-0 ring-2 ring-blue-400/50" />
                        <span className="text-xs md:text-sm font-black text-blue-300 whitespace-nowrap">Mộng Thiên Huyễn</span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col relative overflow-hidden rounded-xl">
                      {/* RIBBON HOT TỰ ĐỘNG */}
                      <div className="absolute top-3 md:top-6 -right-12 md:-right-10 w-36 md:w-40 text-center transform rotate-45 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-[8px] md:text-[11px] py-0.5 md:py-1 shadow-lg z-30 border-y border-white/20 uppercase tracking-widest pointer-events-none mt-4">
                        TỰ ĐỘNG 24/7
                      </div>

                      {/* HÌNH ẢNH DỊCH VỤ */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                        <img
                          src="/mongthienhuyen.jpg"
                          alt="Nạp Game Mộng Thiên Huyễn"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#151D2F] via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-1.5 left-1.5 z-20 pointer-events-none">
                          <span className="text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md uppercase w-fit bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-[0_2px_10px_rgba(0,0,0,0.8)] border border-amber-300/50 backdrop-blur-md">
                            🔥 DỊCH VỤ NỔI BẬT
                          </span>
                        </div>
                      </div>

                      <div className="p-2 md:p-4 flex-1 flex flex-col relative z-10 bg-[#151D2F]">
                        <h4 className="text-sm md:text-base font-black text-white text-center mb-1 group-hover:text-blue-400 transition-colors leading-tight px-1 line-clamp-2">
                          ⚔️ Nạp Game Mộng Thiên Huyễn (Tự Động)
                        </h4>
                        <p className="text-[10px] md:text-xs text-slate-400 mb-2 flex-grow whitespace-pre-wrap text-center px-1 line-clamp-2">
                          Nạp Xu Game, Rương Hoàng Kim, Rương Boss, Lượt Đánh Boss & Nhẫn Thần Binh. Tự động chuyển quà vào acc ngay sau 1 giây!
                        </p>

                        <div className="border-t border-slate-800 pt-2 md:pt-4 mt-auto w-full">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              requireAuth('bossgame');
                              setCurrentView('bossgame');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full py-1.5 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-1 transition-colors bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                          >
                            Nạp Ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* THẺ Ô THAM GIA SERVER DISCORD ĐỂ CHƠI GAME TẠI ĐÂY */}
                {(activeTab === 'Tất cả' || activeTab === 'Mộng Thiên Huyễn') && (
                  <a
                    href={DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#151D2F] h-full border border-[#5865F2]/40 hover:border-[#5865F2] rounded-2xl transition-all shadow-xl hover:shadow-[0_0_25px_rgba(88,101,242,0.3)] group flex flex-col relative mt-5 hover:-translate-y-1 cursor-pointer"
                  >
                    {/* BADGE GAME NHÔ LÊN TRÊN THẺ */}
                    <div className="flex justify-center -mt-5 relative z-30">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-[#1e1f38] to-[#272b5c] border border-[#5865F2]/50 rounded-full pl-2 pr-4 py-1 shadow-xl shadow-indigo-500/20">
                        <div className="w-7 h-7 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0 ring-2 ring-indigo-400/50 shadow">
                          <DiscordIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs md:text-sm font-black text-indigo-300 whitespace-nowrap">Server Discord</span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col relative overflow-hidden rounded-xl">
                      {/* RIBBON HOT TỰ ĐỘNG */}
                      <div className="absolute top-3 md:top-6 -right-12 md:-right-10 w-36 md:w-40 text-center transform rotate-45 bg-gradient-to-r from-indigo-600 via-[#5865F2] to-indigo-600 text-white font-black text-[8px] md:text-[11px] py-0.5 md:py-1 shadow-lg z-30 border-y border-white/20 uppercase tracking-widest pointer-events-none mt-4">
                        CHƠI 24/7
                      </div>

                      {/* HÌNH ẢNH DỊCH VỤ / BANNER */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#1e1f38] via-[#2c2f5a] to-[#151D2F] flex items-center justify-center p-6">
                        <div className="text-center flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-[#5865F2] flex items-center justify-center shadow-[0_0_30px_rgba(88,101,242,0.8)] border border-indigo-300/40 mb-2">
                            <DiscordIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                          </div>
                          <span className="text-[10px] md:text-xs font-black text-indigo-300 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> BOT ĐANG HOẠT ĐỘNG
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#151D2F] via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-1.5 left-1.5 z-20 pointer-events-none">
                          <span className="text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md uppercase w-fit bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_2px_10px_rgba(0,0,0,0.8)] border border-indigo-300/50 backdrop-blur-md flex items-center gap-1">
                            🎮 CHƠI GAME MIỄN PHÍ
                          </span>
                        </div>
                      </div>

                      <div className="p-2 md:p-4 flex-1 flex flex-col relative z-10 bg-[#151D2F]">
                        <h4 className="text-sm md:text-base font-black text-white text-center mb-1 group-hover:text-indigo-400 transition-colors leading-tight px-1 line-clamp-2">
                          🎮 Tham Gia Server Discord Để Chơi Game Tại Đây
                        </h4>
                        <p className="text-[10px] md:text-xs text-slate-400 mb-2 flex-grow whitespace-pre-wrap text-center px-1 line-clamp-2">
                          Chơi game Mộng Thiên Huyễn săn Boss, gõ lệnh nhận lượt đánh, mở rương nhận trang bị khủng & giao lưu cùng anh em game thủ 24/7!
                        </p>

                        <div className="border-t border-slate-800 pt-2 md:pt-4 mt-auto w-full">
                          <div className="w-full py-1.5 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-1.5 transition-all bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-lg shadow-indigo-600/30 group-hover:scale-[1.02]">
                            <DiscordIcon className="w-4 h-4 text-white shrink-0" />
                            <span>Tham Gia Ngay</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                )}

                {mixedItems.map((item, index) => {
                  if (!item.code) return renderBoostingCard(item, index);
                  const acc = item;
                  const isRented = acc.rentedUntil && acc.rentedUntil > now;
                  let timeStr = "";
                  if (isRented) {
                    const diff = acc.rentedUntil - now;

                    // NẾU THỜI GIAN ĐÃ HẾT (CHẠM MỐC 0 HOẶC ÂM)
                    if (diff <= 0) {
                      timeStr = "00:00:00";

                      // CHỈ GỬI MAIL 1 LẦN DUY NHẤT (Kiểm tra xem đã gửi mail chưa, tránh bị gửi liên tục mỗi giây)
                      if (!acc.is_timeout_alerted && acc.currentRenterId) {
                        // Gọi hàm gửi Mail thông báo cho Admin
                        sendAdminAlert(
                          'HẾT GIỜ THUÊ NICK',
                          `Nick mã #${acc.code} đã hết thời gian thuê. Vui lòng vào kiểm tra và thu hồi tài khoản.`
                        );

                        // Cập nhật trạng thái để đánh dấu là "đã gửi mail", tránh bị lặp
                        acc.is_timeout_alerted = true;
                      }
                    }
                    // NẾU VẪN CÒN THỜI GIAN THÌ ĐẾM NGƯỢC BÌNH THƯỜNG
                    else {
                      const h = Math.floor(diff / 3600000);
                      const m = Math.floor((diff % 3600000) / 60000);
                      const s = Math.floor((diff % 60000) / 1000);
                      timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                    }
                  }

                  return (
                    <div key={acc.id} className="bg-[#151D2F] h-full rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col group shadow-lg hover:-translate-y-1 relative mt-5">
                      {/* --- BADGE GAME (NHÔ LÊN TRÊN THẺ) --- */}
                      <div className="flex justify-center -mt-5 relative z-30">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#1a2744] to-[#1e2d4a] border border-blue-500/30 rounded-full pl-1.5 pr-4 md:pr-5 py-1 shadow-xl shadow-blue-500/10">
                          {getGameInfo(acc.game).avatar ? <img src={getGameInfo(acc.game).avatar} alt={getGameInfo(acc.game).name} className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shrink-0 ring-2 ring-blue-400/50" /> : <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-500/20 ring-2 ring-blue-400/50 flex items-center justify-center shrink-0"><Gamepad2 size={16} className="text-blue-400" /></div>}
                          <span className="text-xs md:text-sm font-black text-blue-300 whitespace-nowrap">{getGameInfo(acc.game).name}</span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col relative overflow-hidden rounded-xl">
                        {(() => {
                          const buyDiscount = acc.oldPrice && acc.oldPrice > acc.price ? Math.round(((acc.oldPrice - acc.price) / acc.oldPrice) * 100) : 0;
                          const rentDiscount = acc.oldRentPrice && acc.oldRentPrice > acc.rentPricePerHour ? Math.round(((acc.oldRentPrice - acc.rentPricePerHour) / acc.oldRentPrice) * 100) : 0;
                          const packageRentDiscount = acc.rentDiscountPercent || 0;
                          const maxDiscount = Math.max(buyDiscount, rentDiscount, packageRentDiscount);
                          return maxDiscount > 0 ? (
                            <div className="absolute top-3 md:top-6 -right-12 md:-right-10 w-36 md:w-40 text-center transform rotate-45 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-[8px] md:text-[11px] py-0.5 md:py-1 shadow-lg z-30 border-y border-white/20 uppercase tracking-widest pointer-events-none mt-4">
                              GIẢM {maxDiscount}%
                            </div>
                          ) : null;
                        })()}
                        <div className="relative h-24 sm:h-32 md:h-44 w-full bg-slate-900 cursor-pointer overflow-hidden mt-1 md:mt-2" onClick={() => { setViewingAcc(acc); setSelectedImageIndex(0); }}>
                          <img
                            src={acc.coverImage}
                            loading={index < 8 ? "eager" : "lazy"}
                            fetchPriority={index < 4 ? "high" : "auto"}
                            decoding="async"
                            alt={getGameInfo(acc.game).name}
                            className={`w-full h-full object-cover transition-all duration-500 ${isRented ? 'opacity-50 grayscale hover:grayscale-0' : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'}`}
                          />
                          <div className="absolute top-1.5 left-1.5 flex flex-col items-start gap-1 z-20">
                            <div className="bg-rose-600 text-white text-[9px] md:text-xs font-bold px-1.5 md:px-2.5 py-0.5 md:py-1 rounded shadow-lg backdrop-blur-md bg-opacity-90 w-fit">Mã: {acc.code}</div>
                            <div className="flex gap-1">
                              <span className={`text-[8px] md:text-[10px] font-black px-1.5 md:px-2.5 py-0.5 md:py-1 rounded shadow-lg uppercase w-fit ${acc.tier === 'ULVIP' ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white' : acc.tier === 'SVIP' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0B1120]' : 'bg-blue-600 text-white'}`}>
                                {acc.tier || 'VIP'}
                              </span>
                            </div>
                          </div>
                          {isRented && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] z-20 hover:backdrop-blur-0 transition-all pointer-events-none">
                              <span className="text-white font-black text-[9px] md:text-xs tracking-wider bg-black/80 px-1.5 md:px-3 py-0.5 md:py-1 rounded-full mb-1 border border-yellow-500/50">ĐANG THUÊ</span>
                              <span className="text-yellow-400 font-mono font-bold text-xs md:text-sm tracking-widest drop-shadow-md">{timeStr}</span>
                            </div>
                          )}

                          {getGameInfo(acc.game).isFeatured && (
                            <div className="absolute bottom-1.5 left-1.5 z-20 pointer-events-none">
                              <span className="text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md uppercase w-fit bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-[0_2px_10px_rgba(0,0,0,0.8)] border border-amber-300/50 backdrop-blur-md">
                                🔥 DỊCH VỤ NỔI BẬT
                              </span>
                            </div>
                          )}

                        </div>
                        <div className="p-2 md:p-4 flex-1 flex flex-col relative z-10 bg-[#151D2F]">
                          <h4 className="text-sm md:text-base font-black text-white text-center mb-1 line-clamp-2 cursor-pointer hover:text-blue-400 leading-tight px-1 whitespace-pre-line" title={acc.title} onClick={() => { setViewingAcc(acc); setSelectedImageIndex(0); }}>{acc.title}</h4>
                          <div className="flex justify-center w-full mb-3 md:mb-4">
                            <span className="w-fit px-4 md:px-6 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-emerald-400 text-xs md:text-sm font-bold py-1 md:py-1.5 rounded-lg border border-emerald-500/30 text-center tracking-wide">
                              Kho: {acc.stock !== undefined ? acc.stock : 1}
                            </span>
                          </div>
                          <div className="border-t border-slate-800 pt-2 md:pt-4 flex flex-col gap-2 md:gap-3 flex-1">
                            <div className={`flex flex-col sm:flex-row gap-1.5 ${acc.rentPricePerHour > 0 ? 'justify-between items-start sm:items-center' : 'justify-center items-center text-center'}`}>
                              <div className={acc.rentPricePerHour > 0 ? '' : 'flex flex-col items-center py-1.5'}>
                                <p className={`${acc.rentPricePerHour > 0 ? 'text-[8px] md:text-[10px]' : 'text-[10px] md:text-xs tracking-wider'} text-slate-500 font-bold mb-0.5 uppercase`}>MUA ĐỨT</p>
                                {acc.oldPrice && acc.oldPrice > acc.price && (
                                  <p className={`${acc.rentPricePerHour > 0 ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'} font-bold text-slate-500 line-through mb-0.5`}>{new Intl.NumberFormat('vi-VN').format(acc.oldPrice)}đ</p>
                                )}
                                <p className={`${acc.rentPricePerHour > 0 ? 'text-sm md:text-lg' : 'text-lg md:text-2xl mt-0.5'} font-black text-rose-500`}>{new Intl.NumberFormat('vi-VN').format(acc.price)}<span className={`${acc.rentPricePerHour > 0 ? 'text-[9px] md:text-xs' : 'text-xs md:text-sm'} opacity-70 ml-0.5`}>đ</span></p>
                              </div>

                              {acc.rentPricePerHour > 0 && (
                                <div className="text-left sm:text-right sm:border-l sm:border-slate-700 sm:pl-3 w-full sm:w-auto">
                                  <p className="text-[8px] md:text-[10px] text-slate-500 font-bold mb-0.5 uppercase">THUÊ / GIỜ</p>
                                  {acc.oldRentPrice && acc.oldRentPrice > acc.rentPricePerHour && (
                                    <p className="text-[10px] md:text-xs font-bold text-slate-500 line-through mb-0.5">{new Intl.NumberFormat('vi-VN').format(acc.oldRentPrice)}đ</p>
                                  )}
                                  <p className="text-sm md:text-lg font-black text-blue-400">{new Intl.NumberFormat('vi-VN').format(acc.rentPricePerHour)}<span className="text-[9px] md:text-xs opacity-70 ml-0.5">đ</span></p>
                                </div>
                              )}
                            </div>

                            <div className="mt-auto w-full pt-1 md:pt-2">
                              {/* XỬ LÝ NÚT NGOÀI MẶT TIỀN: Phân biệt Chủ Thuê, Khách Vãng Lai và Gói Combo */}
                              {isRented && currentUser?.id === acc.currentRenterId ? (
                                (() => {
                                  // Dò xem khách đang thuê gói gì
                                  const activeReq = rentRequests.find(r => r.accCode === acc.code && r.status === 'Đã giao acc');
                                  const isCombo = activeReq && (activeReq.time.toLowerCase().includes('combo đêm') || activeReq.time.toLowerCase().includes('combo ngày'));

                                  return isCombo ? (
                                    <button disabled className="w-full py-1.5 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-1 md:gap-2 bg-slate-700 text-slate-400 cursor-not-allowed shadow-inner border border-slate-600">
                                      ĐANG THUÊ COMBO
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleStopRent(acc); }}
                                      className="w-full py-1.5 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-1 md:gap-2 transition-colors bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-95"
                                    >
                                      <Clock size={12} className="animate-pulse" /> NGỪNG THUÊ
                                    </button>
                                  );
                                })()
                              ) : (
                                <button
                                  onClick={() => { setViewingAcc(acc); setSelectedImageIndex(0); }}
                                  className={`w-full py-1.5 md:py-2.5 rounded-lg text-[10px] md:text-sm font-bold flex items-center justify-center gap-1 transition-colors ${isRented ? 'bg-slate-800 text-yellow-500 border border-slate-700 hover:bg-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'}`}
                                >
                                  {isRented ? 'ĐANG THUÊ' : <>CHI TIẾT <ArrowRight size={12} /></>}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </main>

        {/* --- FOOTER TRANG CHỦ --- */}
        {renderFooter()}

      </div>
    );
  };
  // =============================================================================
  // MÀN HÌNH GIỚI THIỆU & TẢI GAME MỘNG THIÊN CỬU
  // =============================================================================
  const renderMongThienCuuScreen = () => {
    if (!isMtcGameAccessible) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24">
          {renderNavbar()}
          <div className="max-w-md mx-auto mt-16 px-4 text-center">
            <div className="bg-[#151D2F] border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
              <Lock size={44} className="text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Trang Mộng Thiên Cửu Đang Tạm Ẩn</h3>
              <p className="text-sm text-slate-400 mb-6">Admin hiện đang ẩn trang này để bảo trì hoặc thử nghiệm nội bộ. Vui lòng quay lại sau!</p>
              <button onClick={() => setCurrentView('dashboard')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">
                Về Trang Chủ
              </button>
            </div>
          </div>
          {renderFooter()}
        </div>
      );
    }

    const configuredApkUrl = (mtcGameConfig?.apkUrl || '').trim();
    const rawApkUrl = (!configuredApkUrl || configuredApkUrl === '/download/MongThienCuu_s0_beta_online.apk')
      ? APK_CDN_URL
      : configuredApkUrl;

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-16">
        {renderNavbar()}
        <Suspense fallback={<div className="py-16 text-center text-slate-400 text-sm">Đang tải...</div>}>
          <MongThienCuuShowcase
            rawApkUrl={rawApkUrl}
            webPlayUrl="/play/"
            version={mtcGameConfig?.version || '2.6.0-s0-beta'}
            notice={sanitizeMtcShowcaseNotice(mtcGameConfig?.notice)}
            isAdmin={currentUser?.role?.toLowerCase() === 'admin'}
            isMtcGameOpen={isMtcGameOpen}
            onTogglePublic={() => handleSaveMtcGameConfig(
              { ...mtcGameConfig, status: isMtcGameOpen ? 'hidden' : 'public' },
              isMtcGameOpen ? 'Đã ẨN trang Mộng Thiên Cửu khỏi khách thường!' : 'Đã HIỆN CÔNG KHAI trang Mộng Thiên Cửu!'
            )}
            isWebPlayPublic={isMtcWebPlayPublic}
            onToggleWebPlay={() => handleSaveMtcGameConfig(
              { ...mtcGameConfig, webPlayStatus: isMtcWebPlayPublic ? 'hidden' : 'public' },
              isMtcWebPlayPublic ? 'Đã ẨN nút Chơi Trên Web (chỉ nội bộ Admin dùng)!' : 'Đã HIỆN CÔNG KHAI nút Chơi Trên Web cho mọi người!'
            )}
          />
        </Suspense>
        {renderFooter()}
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <>
      <div className="relative overflow-x-hidden">
        {currentView === 'login' && renderLoginScreen()}
        {currentView === 'forgot-password' && renderForgotPasswordScreen()}
        {currentView === 'register' && renderRegisterScreen()}
        {currentView === 'dashboard' && renderDashboardScreen()}
        <Suspense fallback={<div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-slate-400 text-sm font-semibold">Đang tải...</div>}>
          {currentView === 'security' && (
            <SecurityScreen
              currentUser={currentUser} setCurrentView={setCurrentView} showToast={showToast}
              setCurrentUser={setCurrentUser} setUsersDb={setUsersDb} usersDb={usersDb}
              setProfileTab={setProfileTab} profileTab={profileTab}
              calculateTotalRecharged={calculateTotalRecharged} verifyCooldown={verifyCooldown}
              handleSendVerification={handleSendVerification} showOldPass={showOldPass}
              setShowOldPass={setShowOldPass} showNewPass={showNewPass} setShowNewPass={setShowNewPass}
              showConfirmPass={showConfirmPass} setShowConfirmPass={setShowConfirmPass}
              messagesDb={messagesDb} setMessagesDb={setMessagesDb} messagesEndRef={messagesEndRef}
              unreadCount={unreadCount} sendAdminAlert={sendAdminAlert}
              setConfirmDialog={setConfirmDialog} renderNavbar={renderNavbar}
            />
          )}
          {currentView === 'admin' && (
            <AdminScreen
              renderNavbar={renderNavbar} currentUser={currentUser} setCurrentUser={setCurrentUser}
              setCurrentView={setCurrentView} showToast={showToast} accountsDb={accountsDb}
              setAccountsDb={setAccountsDb} usersDb={usersDb} setUsersDb={setUsersDb}
              transactionsDb={transactionsDb} setTransactionsDb={setTransactionsDb}
              boostingDb={boostingDb} setBoostingDb={setBoostingDb} boostingRequests={boostingRequests}
              setBoostingRequests={setBoostingRequests} depositRequests={depositRequests}
              setDepositRequests={setDepositRequests} rentRequests={rentRequests}
              setRentRequests={setRentRequests} vouchersDb={vouchersDb} setVouchersDb={setVouchersDb}
              messagesDb={messagesDb} setMessagesDb={setMessagesDb}
              wheelItemsMoneyDb={wheelItemsMoneyDb} setWheelItemsMoneyDb={setWheelItemsMoneyDb}
              wheelItemsSpinDb={wheelItemsSpinDb} setWheelItemsSpinDb={setWheelItemsSpinDb}
              wheelConfig={wheelConfig} setWheelConfig={setWheelConfig} wheelCountdown={wheelCountdown}
              wizardEventConfig={wizardEventConfig} setWizardEventConfig={setWizardEventConfig}
              wizardCardItems={wizardCardItems} setWizardCardItems={setWizardCardItems}
              mtcGameConfig={mtcGameConfig} mtcServerRegistry={mtcServerRegistry}
              isMtcGameOpen={isMtcGameOpen} isMtcWebPlayPublic={isMtcWebPlayPublic}
              handleSaveMtcGameConfig={handleSaveMtcGameConfig}
              handleRefreshMtcTunnel={handleRefreshMtcTunnel}
              depositBonusConfig={depositBonusConfig} setDepositBonusConfig={setDepositBonusConfig}
              visitorCount={visitorCount}
              adminTab={adminTab} setAdminTab={setAdminTab} adminGame={adminGame} setAdminGame={setAdminGame}
              adminAccGameAvatar={adminAccGameAvatar} setAdminAccGameAvatar={setAdminAccGameAvatar}
              adminCoverImage={adminCoverImage} setAdminCoverImage={setAdminCoverImage}
              adminDetailImages={adminDetailImages} setAdminDetailImages={setAdminDetailImages}
              adminRentOptions={adminRentOptions} setAdminRentOptions={setAdminRentOptions}
              adminBoostType={adminBoostType} setAdminBoostType={setAdminBoostType}
              adminBoostingImage={adminBoostingImage} setAdminBoostingImage={setAdminBoostingImage}
              adminBoostingPriceUnit={adminBoostingPriceUnit} setAdminBoostingPriceUnit={setAdminBoostingPriceUnit}
              adminGameAvatar={adminGameAvatar} setAdminGameAvatar={setAdminGameAvatar}
              adminRankOptions={adminRankOptions} setAdminRankOptions={setAdminRankOptions}
              adminBoostingCategoryFilter={adminBoostingCategoryFilter} setAdminBoostingCategoryFilter={setAdminBoostingCategoryFilter}
              adminBoostingGameFilter={adminBoostingGameFilter} setAdminBoostingGameFilter={setAdminBoostingGameFilter}
              adminWheelType={adminWheelType} setAdminWheelType={setAdminWheelType}
              adminWheelImage={adminWheelImage} setAdminWheelImage={setAdminWheelImage}
              adminWheelRewardType={adminWheelRewardType} setAdminWheelRewardType={setAdminWheelRewardType}
              adminWheelNotify={adminWheelNotify} setAdminWheelNotify={setAdminWheelNotify}
              adminConfigType={adminConfigType} setAdminConfigType={setAdminConfigType}
              adminSearchUser={adminSearchUser} setAdminSearchUser={setAdminSearchUser}
              adminMessageSearch={adminMessageSearch} setAdminMessageSearch={setAdminMessageSearch}
              activeChatUser={activeChatUser} setActiveChatUser={setActiveChatUser}
              chatMessagesEndRef={chatMessagesEndRef} editingAccount={editingAccount}
              setEditingAccount={setEditingAccount} editingBoosting={editingBoosting}
              setEditingBoosting={setEditingBoosting} editingUser={editingUser}
              setEditingUser={setEditingUser} editingVoucher={editingVoucher}
              setEditingVoucher={setEditingVoucher} editingWheel={editingWheel}
              setEditingWheel={setEditingWheel} showAccModal={showAccModal}
              setShowAccModal={setShowAccModal} showBoostingModal={showBoostingModal}
              setShowBoostingModal={setShowBoostingModal} showUserModal={showUserModal}
              setShowUserModal={setShowUserModal} showVoucherModal={showVoucherModal}
              setShowVoucherModal={setShowVoucherModal} showWheelModal={showWheelModal}
              setShowWheelModal={setShowWheelModal} approveDepositModal={approveDepositModal}
              setApproveDepositModal={setApproveDepositModal} editRentModal={editRentModal}
              setEditRentModal={setEditRentModal} viewUserHistory={viewUserHistory}
              setViewUserHistory={setViewUserHistory} visibleDepsAdmin={visibleDepsAdmin}
              setVisibleDepsAdmin={setVisibleDepsAdmin} visibleRentsAdmin={visibleRentsAdmin}
              setVisibleRentsAdmin={setVisibleRentsAdmin} visibleSpinsAdmin={visibleSpinsAdmin}
              setVisibleSpinsAdmin={setVisibleSpinsAdmin} visibleUsersCount={visibleUsersCount}
              setVisibleUsersCount={setVisibleUsersCount} isEventMultiPackage={isEventMultiPackage}
              setIsEventMultiPackage={setIsEventMultiPackage} crossfireText={crossfireText}
              setCrossfireText={setCrossfireText} isGlobalProcessing={isGlobalProcessing}
              setIsGlobalProcessing={setIsGlobalProcessing} setGlobalProgressText={setGlobalProgressText}
              setConfirmDialog={setConfirmDialog} setFullScreenImage={setFullScreenImage}
              setShowBossProfileModal={setShowBossProfileModal} setShowBossStatModal={setShowBossStatModal}
              handleCheckBossPlayer={handleCheckBossPlayer} getGameInfo={getGameInfo}
              copyToClipboard={copyToClipboard} sendDepositSuccessEmail={sendDepositSuccessEmail}
              handleUndoTransaction={handleUndoTransaction} isProcessingActionRef={isProcessingActionRef}
            />
          )}
          {currentView === 'naptien' && (
            <NaptienScreen
              renderNavbar={renderNavbar} renderFooter={renderFooter} currentUser={currentUser}
              depositRequests={depositRequests} setDepositRequests={setDepositRequests}
              depositAmount={depositAmount} setDepositAmount={setDepositAmount}
              voucherInput={voucherInput} setVoucherInput={setVoucherInput} vouchersDb={vouchersDb}
              isDepositing={isDepositing} setIsDepositing={setIsDepositing} showToast={showToast}
              setPayosPaymentData={setPayosPaymentData} payosPaymentData={payosPaymentData}
              setPayosSuccess={setPayosSuccess} payosSuccess={payosSuccess}
              payosTimeLeft={payosTimeLeft}
              depositMethod={depositMethod} setDepositMethod={setDepositMethod}
              cardTelco={cardTelco} setCardTelco={setCardTelco} cardAmount={cardAmount}
              setCardAmount={setCardAmount} cardCode={cardCode} setCardCode={setCardCode}
              cardSerial={cardSerial} setCardSerial={setCardSerial} liveCardError={liveCardError}
              setLiveCardError={setLiveCardError} formatPayosTime={formatPayosTime}
              handleCancelDepositClient={handleCancelDepositClient}
              visibleDepsClient={visibleDepsClient} setVisibleDepsClient={setVisibleDepsClient}
              copyToClipboard={copyToClipboard} sendAdminAlert={sendAdminAlert}
              isGlobalProcessing={isGlobalProcessing} setIsGlobalProcessing={setIsGlobalProcessing}
            />
          )}
          {currentView === 'lichsu' && (
            <LichsuScreen
              renderNavbar={renderNavbar} renderFooter={renderFooter} currentUser={currentUser}
              transactionsDb={transactionsDb} boostingRequests={boostingRequests}
              depositRequests={depositRequests} historyTab={historyTab} setHistoryTab={setHistoryTab}
              visibleHistoryCount={visibleHistoryCount} setVisibleHistoryCount={setVisibleHistoryCount}
              expandedTx={expandedTx} setExpandedTx={setExpandedTx}
              copyToClipboard={copyToClipboard} copiedText={copiedText}
              handleCancelDepositClient={handleCancelDepositClient}
            />
          )}
          {currentView === 'caythue' && (
            <CayThueScreen
              renderNavbar={renderNavbar} renderFooter={renderFooter} boostingDb={boostingDb}
              boostingRequests={boostingRequests} currentUser={currentUser}
              activeBoostingTab={activeBoostingTab} setActiveBoostingTab={setActiveBoostingTab}
              activeBoostingGameClient={activeBoostingGameClient}
              setActiveBoostingGameClient={setActiveBoostingGameClient}
              renderBoostingCard={renderBoostingCard}
            />
          )}
          {currentView === 'vongquay' && (
            <VongQuayScreen
              renderNavbar={renderNavbar} renderFooter={renderFooter} currentUser={currentUser}
              currentUserRef={currentUserRef} setCurrentUser={setCurrentUser} setUsersDb={setUsersDb}
              setCurrentView={setCurrentView} requireAuth={requireAuth} showToast={showToast}
              playMode={playMode} setPlayMode={setPlayMode}
              wheelItemsMoneyDb={wheelItemsMoneyDb} wheelItemsSpinDb={wheelItemsSpinDb}
              wheelConfig={wheelConfig} wheelCountdown={wheelCountdown}
              isWheelEventExpired={isWheelEventExpired} isSpinning={isSpinning}
              setIsSpinning={setIsSpinning} isSpinningRef={isSpinningRef}
              rotation={rotation} setRotation={setRotation} shoesPity={shoesPity}
              setShoesPity={setShoesPity} giftModalData={giftModalData}
              setGiftModalData={setGiftModalData} isGiftOpened={isGiftOpened}
              setIsGiftOpened={setIsGiftOpened} spin10ModalData={spin10ModalData}
              setSpin10ModalData={setSpin10ModalData} isSpin10Opened={isSpin10Opened}
              setIsSpin10Opened={setIsSpin10Opened} spinActionType={spinActionType}
              setSpinActionType={setSpinActionType} bossPlayerSummary={bossPlayerSummary}
              setBossPlayerSummary={setBossPlayerSummary} setShowLinkOtpModal={setShowLinkOtpModal}
              transactionsDb={transactionsDb} setTransactionsDb={setTransactionsDb}
              visibleSpinsClient={visibleSpinsClient} setVisibleSpinsClient={setVisibleSpinsClient}
            />
          )}
          {currentView === 'bossgame' && (
            <BossGameScreen
              renderNavbar={renderNavbar} renderFooter={renderFooter} currentUser={currentUser}
              requireAuth={requireAuth} showToast={showToast} setCurrentView={setCurrentView}
              setHistoryTab={setHistoryTab} bossTargetId={bossTargetId} bossPlayerSummary={bossPlayerSummary}
              setBossPlayerSummary={setBossPlayerSummary} showBossProfileModal={showBossProfileModal}
              setShowBossProfileModal={setShowBossProfileModal} showBossStatModal={showBossStatModal}
              setShowBossStatModal={setShowBossStatModal} selectedBossPackage={selectedBossPackage}
              setSelectedBossPackage={setSelectedBossPackage} isBuyingBossPackage={isBuyingBossPackage}
              executeBuyBossPackage={executeBuyBossPackage} bossSuccessModal={bossSuccessModal}
              setBossSuccessModal={setBossSuccessModal} showLinkOtpModal={showLinkOtpModal}
              setShowLinkOtpModal={setShowLinkOtpModal} linkOtpCode={linkOtpCode}
              linkOtpCountdown={linkOtpCountdown} isGeneratingOtp={isGeneratingOtp}
              linkOtpTarget={linkOtpTarget} isDiscordLinked={isDiscordLinked}
              isTikTokLinked={isTikTokLinked} handleGenerateLinkOtp={handleGenerateLinkOtp}
              handleCheckBossPlayer={handleCheckBossPlayer} showBagModal={showBagModal}
              setShowBagModal={setShowBagModal} activeBagCategory={activeBagCategory}
              setActiveBagCategory={setActiveBagCategory} bagVisibleCount={bagVisibleCount}
              setBagVisibleCount={setBagVisibleCount} isPerformingBagAction={isPerformingBagAction}
              setIsPerformingBagAction={setIsPerformingBagAction}
              bagActionLoadingItem={bagActionLoadingItem} setBagActionLoadingItem={setBagActionLoadingItem}
              showAuctionModal={showAuctionModal} setShowAuctionModal={setShowAuctionModal}
              auctionMarketData={auctionMarketData} fetchAuctionMarketData={fetchAuctionMarketData}
              auctionActiveTab={auctionActiveTab} setAuctionActiveTab={setAuctionActiveTab}
              auctionCategoryFilter={auctionCategoryFilter} setAuctionCategoryFilter={setAuctionCategoryFilter}
              auctionSearchTerm={auctionSearchTerm} setAuctionSearchTerm={setAuctionSearchTerm}
              showListItemModal={showListItemModal} setShowListItemModal={setShowListItemModal}
              selectedItemToList={selectedItemToList} setSelectedItemToList={setSelectedItemToList}
              listingPrice={listingPrice} setListingPrice={setListingPrice}
              listingSellQuantity={listingSellQuantity} setListingSellQuantity={setListingSellQuantity}
              listingPassword={listingPassword} setListingPassword={setListingPassword}
              buyingLockedListing={buyingLockedListing} setBuyingLockedListing={setBuyingLockedListing}
              buyPasscodePrompt={buyPasscodePrompt} setBuyPasscodePrompt={setBuyPasscodePrompt}
              showForgeModal={showForgeModal} setShowForgeModal={setShowForgeModal}
              selectedForgeItemA={selectedForgeItemA} setSelectedForgeItemA={setSelectedForgeItemA}
              selectedForgeItemB={selectedForgeItemB} setSelectedForgeItemB={setSelectedForgeItemB}
              showForgeSelectModal={showForgeSelectModal} setShowForgeSelectModal={setShowForgeSelectModal}
              forgeFilterCategory={forgeFilterCategory} setForgeFilterCategory={setForgeFilterCategory}
              forgeFilterLocation={forgeFilterLocation} setForgeFilterLocation={setForgeFilterLocation}
              forgeSearchQuery={forgeSearchQuery} setForgeSearchQuery={setForgeSearchQuery}
              isHammerStriking={isHammerStriking} setIsHammerStriking={setIsHammerStriking}
              isPerformingForgeAction={isPerformingForgeAction} setIsPerformingForgeAction={setIsPerformingForgeAction}
              forgeSuccessModal={forgeSuccessModal} setForgeSuccessModal={setForgeSuccessModal}
            />
          )}
        </Suspense>
        {currentView === 'wizard' && (
          <div className="min-h-screen bg-[#070512] text-slate-200 font-sans pb-24 md:pb-20">
            {renderNavbar()}
            <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
              {isWizardEventAccessible ? (
                <Suspense fallback={<div className="py-16 text-center text-slate-400 text-sm">Đang tải...</div>}>
                  <WizardCardFlip
                    currentUser={currentUser}
                    currentEventNow={currentEventNow}
                    wizardEventConfig={wizardEventConfig}
                    config={wizardEventConfig}
                    wizardItems={wizardCardItems}
                    rewards={wizardCardItems}
                    wizardPity={wizardPity}
                    setWizardPity={setWizardPity}
                    requireAuth={requireAuth}
                    onRequireAuth={() => requireAuth('wizard')}
                    setCurrentView={setCurrentView}
                    onOpenDeposit={() => {
                      requireAuth('naptien');
                      setCurrentView('naptien');
                    }}
                    onOpenHistory={() => {
                      requireAuth('lichsu');
                      setCurrentView('lichsu');
                    }}
                    transactionsDb={transactionsDb}
                    setTransactionsDb={setTransactionsDb}
                    onAddTransaction={(newTx) => {
                      setTransactionsDb(prev => [newTx, ...prev]);
                    }}
                    usersDb={usersDb}
                    setUsersDb={setUsersDb}
                    onUpdateUser={(updated) => {
                      setCurrentUser(updated);
                      localStorage.setItem('shop_cached_user', JSON.stringify(updated));
                      setUsersDb(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
                    }}
                    showToast={showToast}
                  />
                </Suspense>
              ) : (
                <div className="text-center py-20">
                  <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-8 max-w-md mx-auto">
                    <Sparkles size={48} className="text-purple-400 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold text-white mb-2">Sự Kiện Đang Tạm Ẩn</h3>
                    <p className="text-slate-400 text-sm mb-6">Sự kiện Lật Thẻ Bài Phù Thủy hiện đang được bảo trì hoặc chưa mở. Vui lòng quay lại sau!</p>
                    <button onClick={() => setCurrentView('dashboard')} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30">
                      Về Trang Chủ
                    </button>
                  </div>
                </div>
              )}
            </main>
            {renderMobileBottomNav()}
          </div>
        )}
        {currentView === 'mongthiencuu' && renderMongThienCuuScreen()}
        {currentView === 'donate' && (
          <DonateLiveScreen
            renderNavbar={renderNavbar}
            renderFooter={renderFooter}
            currentUser={currentUser}
            isTikTokLinked={isTikTokLinked}
            bossPlayerSummary={bossPlayerSummary}
            showToast={showToast}
            copyToClipboard={copyToClipboard}
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === 'vip_info' && (
          <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-20">
            {renderNavbar()}
            <div className="max-w-4xl mx-auto mt-8 px-4">
              {/* BANNER VIP FULL WIDTH & CENTERED */}
              <div className="w-full bg-gradient-to-br from-yellow-600/20 to-amber-900/20 border border-yellow-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden mb-8 shadow-[0_0_30px_rgba(234,179,8,0.1)] animate-fade-in">                 <Sparkles size={60} className="text-yellow-500 mb-4 animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter">Hệ Thống Khách Hàng VIP</h2>
                <p className="text-yellow-500/80 font-medium">Nâng tầm trải nghiệm - Khẳng định đẳng cấp</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="bg-[#151D2F] border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 text-yellow-500"><Target size={20} /> Cách thức lên VIP</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                      <span>Tổng tiền nạp tích lũy từ lúc tạo tài khoản đạt từ <strong className="text-white">3.000.000 VNĐ</strong> trở lên.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                      <span>Hệ thống tự động nâng cấp ngay khi bạn đủ điều kiện (Theo dõi tại mục Cá nhân).</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#151D2F] border border-slate-800 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 text-rose-500"><ShieldCheck size={20} /> Đặc quyền VIP</h3>
                  <ul className="space-y-4 text-sm text-slate-400">
                    <li className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><ShieldCheck size={18} /></div>
                      <span><strong className="text-white">MIỄN CCCD:</strong> Thuê acc không cần chụp ảnh giấy tờ.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><Wallet size={18} /></div>
                      <span><strong className="text-white">MIỄN CỌC:</strong> Không bị thu 500k tiền cọc an toàn.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button onClick={() => setCurrentView('dashboard')} className="w-full mt-10 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg animate-fade-in">QUAY LẠI CỬA HÀNG</button>
            </div>
          </div>
        )}
        {renderMobileSidebar()}
        {renderMobileBottomNav()}

        {/* Global Toast Notification */}
        {toast && (
          <div onClick={() => setToast(null)} className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-auto cursor-pointer p-4 transition-all duration-300">
            <div className={`flex flex-col items-center justify-center gap-4 px-8 py-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] border backdrop-blur-xl max-w-sm w-full text-center transform scale-100 transition-transform active:scale-95 ${toast.type === 'error' ? 'bg-[#1a0f14]/95 border-red-500/40 text-white shadow-red-500/20' : 'bg-[#0f1a14]/95 border-emerald-500/40 text-white shadow-emerald-500/20'}`}>
              <div className={`shrink-0 p-4 rounded-full ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {toast.type === 'error' ? <AlertCircle size={48} /> : <CheckCircle2 size={48} />}
              </div>
              <p className="font-bold text-lg leading-relaxed">{toast.message}</p>
            </div>
          </div>
        )}
        {/* Modal Hướng dẫn cài App điều khiển  */}
        {awesunGuideType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-blue-500/50 w-full max-w-md md:max-w-3xl rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.2)] max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0B1120] shrink-0">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase"><Download className="text-blue-500" /> HƯỚNG DẪN CÀI ĐẶT VÀ LẤY MÃ ĐIỀU KHIỂN</h3>
                <button onClick={() => setAwesunGuideType(null)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"><X size={18} /></button>
              </div>

              <div className="p-6 text-base md:text-lg text-slate-300 overflow-y-auto custom-scrollbar flex-1">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center shadow-[0_0_15px_rgba(16,185,129,0.15)] mb-5">
                  <p className="text-emerald-400 font-bold animate-pulse uppercase">TRÌNH DUYỆT CỦA BẠN ĐANG TẢI PHẦN MỀM XUỐNG. HÃY LÀM THEO CÁC BƯỚC SAU:</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* CỘT TRÁI: Bước 1 */}
                  <div className="flex-1 space-y-5">
                    <div className="flex gap-4 items-start">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-white/20 mt-1">1</span>
                      <div className="w-full">
                        <p className="leading-relaxed uppercase font-bold mb-3 text-white">BẤM TỔ HỢP PHÍM <strong className="text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(250,204,21,0.2)] whitespace-nowrap">CTRL + J</strong> TRÊN TRÌNH DUYỆT WEB CỦA BẠN VÀ MỞ CÁI APP NHƯ HÌNH BÊN DƯỚI</p>
                        <img src="/appdieukhien.png" alt="App điều khiển" className="w-24 rounded-2xl border border-slate-600 shadow-lg" />
                      </div>
                    </div>
                  </div>

                  {/* ĐƯỜNG CHIA CỘT (chỉ desktop) */}
                  <div className="hidden md:block w-[1px] bg-slate-700/50 self-stretch shrink-0"></div>

                  {/* CỘT PHẢI: Bước 2-3 */}
                  <div className="flex-1 space-y-5">
                    <div className="flex gap-4 items-start">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.4)] border border-white/20 mt-1">2</span>
                      <div className="w-full">
                        <p className="leading-relaxed uppercase font-bold mb-3 text-white">BẤM <strong className="text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(250,204,21,0.2)]">INSTALL NOW</strong> HOẶC CÀI ĐẶT NGAY NHƯ HÌNH</p>
                        <div className="relative cursor-pointer group" onClick={() => setFullScreenImage('/installnow.png')}>
                          <img src="/installnow.png" alt="Install Now" className="w-full rounded-lg border border-slate-600 shadow-lg" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                            <span className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"><ZoomIn size={14} /> Bấm để phóng to</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-2xl blur-md -z-10 animate-pulse"></div>
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-black shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.5)] border border-white/20 mt-1">3</span>
                      <div className="w-full bg-[#1A233A] border-2 border-rose-500/40 p-4 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                        <p className="text-white mb-3 uppercase font-bold">CHỤP HOẶC GHI RA <strong className="text-rose-400 font-black text-xl bg-rose-500/10 px-2 py-0.5 rounded whitespace-nowrap">2 CÁI ID VÀ MẬT KHẨU</strong> CỦA APP NHƯ HÌNH BÊN DƯỚI:</p>
                        <img src="/guide-hoptodesk.png" alt="Hướng dẫn HopToDesk" className="w-full rounded-lg border border-rose-500/30 shadow-lg" />
                      </div>
                    </div>

                    {awesunGuideType === 'inside' && (
                      <div className="flex gap-3 items-start pt-4 border-t border-slate-800">
                        <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shrink-0"><CheckCircle2 size={18} /></span>
                        <p className="text-emerald-400 font-bold uppercase">QUAY LẠI ĐÂY, GHI MÃ ID VÀ MẬT KHẨU VÀO Ô TRỐNG YÊU CẦU ĐỂ HOÀN TẤT.</p>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={() => setAwesunGuideType(null)} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg text-lg uppercase">ĐÃ HIỂU & ĐÓNG LẠI</button>
              </div>
            </div>
          </div>
        )}
        {/* Modal Xác thực OTP */}
        {showOtpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-blue-500/50 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck className="text-emerald-400" /> Xác Thực Email</h3>
                <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
              <p className="text-sm text-slate-400 mb-6">Chúng tôi đã gửi mã 6 chữ số đến <strong className="text-white">{currentUser?.email}</strong>. Vui lòng kiểm tra hộp thư (cả mục Spam).</p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} maxLength="6" placeholder="Nhập mã 6 số..." className="w-full text-center tracking-[0.5em] placeholder:tracking-normal placeholder:font-sans placeholder:text-sm text-2xl font-mono p-4 bg-[#0B1120] border border-slate-700 focus:border-emerald-500 rounded-xl text-white outline-none transition-all" required />                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-colors">Xác Nhận Ngay</button>
              </form>
            </div>
          </div>
        )}
        {showEditHistoryId && (() => {
          const comment = commentsDb.find(c => c.id === showEditHistoryId);
          if (!comment) return null;
          return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#151D2F] rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#0f172a]">
                  <h3 className="font-bold text-white flex items-center gap-2"><History size={18} className="text-blue-400" /> Lịch sử chỉnh sửa</h3>
                  <button onClick={() => setShowEditHistoryId(null)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-4">
                  <div className="border border-blue-500/30 rounded-xl p-3 bg-blue-500/5">
                    <div className="text-xs font-bold text-blue-400 mb-1 flex justify-between">
                      <span>Hiện tại</span>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  {(comment.edit_history || []).slice().reverse().map((hist, idx) => (
                    <div key={idx} className="border border-slate-700 rounded-xl p-3 bg-[#0B1120]">
                      <div className="text-xs font-bold text-slate-500 mb-1 flex justify-between">
                        <span>{new Date(hist.edited_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                      <p className="text-sm text-slate-400 whitespace-pre-wrap line-through opacity-70">{hist.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Modal Thông báo ưu đãi Trang Chủ */}
        {showSpinNotice && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111625] border border-rose-500/40 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.2)] p-6 md:p-8 text-center relative animate-zoom-in">

              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-[#111625] rounded-full flex items-center justify-center border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                  <Gift className="text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse" size={32} />
                </div>
              </div>

              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 mb-5 uppercase tracking-wide drop-shadow-md">
                Khuyến Mãi Cực Sốc!
              </h3>

              <div className="text-left bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 mb-8 space-y-5 shadow-inner">
                <p className="text-slate-300 text-base font-bold mb-3 text-center">
                  Hôm nay Shop có chương trình khuyến mãi cực sốc như sau:
                </p>

                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-rose-500/20 p-1.5 rounded-lg text-rose-400 border border-rose-500/30"><Ticket size={20} /></div>
                  <p className="text-base text-slate-300 leading-relaxed">
                    Nạp <strong className="text-rose-400 text-lg">{new Intl.NumberFormat('vi-VN').format(depositBonusConfig.minAmount / 1000)}k VNĐ</strong> tặng ngay <strong className="text-rose-400 text-lg">{depositBonusConfig.bonusSpins} Lượt Quay</strong>
                    <span className="block text-sm text-slate-500 mt-1.5 italic">(Không giới hạn số lần)</span>
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-yellow-500/20 p-1.5 rounded-lg text-yellow-400 border border-yellow-500/30"><Sparkles size={20} /></div>
                  <p className="text-base text-slate-300 leading-relaxed pt-1">
                    Cơ cấu Vòng Quay giải thưởng lên tới <strong className="text-yellow-400 text-xl drop-shadow-md">500k VNĐ</strong>
                  </p>
                </div>

                <p className="text-center text-rose-400 font-black pt-4 mt-3 border-t border-slate-800 uppercase text-sm tracking-widest animate-pulse">
                  Mời quý khách tham gia ạ !!!
                </p>
              </div>

              <div className="flex flex-col gap-3 px-2 md:px-6">
                <button
                  onClick={() => setShowSpinNotice(false)}
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-xl py-4 rounded-2xl transition-all duration-300 shadow-[0_10px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_30px_rgba(244,63,94,0.5)] hover:-translate-y-1 active:scale-95 tracking-wider"
                >
                  OK!
                </button>
                <button
                  onClick={() => {
                    setDismissNotice(true);
                    setShowSpinNotice(false);
                  }}
                  className="w-full py-2 mt-1 text-slate-500 hover:text-rose-400 text-base font-bold transition-colors"
                >
                  Không hiển thị lại!!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hướng Dẫn Tham Gia Vòng Quay */}
        {showSpinRules && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111625] border border-blue-500/40 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)] p-6 md:p-8 relative animate-zoom-in">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-[#111625] rounded-full flex items-center justify-center border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  <Gamepad2 className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" size={32} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 mb-6 uppercase tracking-wide drop-shadow-md">
                Cách Thức Tham Gia
              </h3>
              <div className="space-y-5 text-slate-300 text-base mb-8 text-left bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-inner">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0 border border-blue-500/30 mt-0.5">1</span>
                  <p className="pt-0.5 leading-relaxed">Cứ mỗi <strong className="text-rose-400 text-lg drop-shadow-sm">{new Intl.NumberFormat('vi-VN').format(depositBonusConfig.minAmount / 1000)}k VNĐ</strong> nạp vào website sẽ được tặng <strong className="text-rose-400 text-lg drop-shadow-sm">{depositBonusConfig.bonusSpins} lượt quay</strong> miễn phí ở vòng quay này.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0 border border-blue-500/30 mt-0.5">2</span>
                  <p className="pt-0.5 leading-relaxed">Quý khách có thể kiếm lượt quay thông qua <strong className="text-emerald-400 text-lg drop-shadow-sm">Voucher</strong> hoặc sự kiện ở Fanpage Admin.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0 border border-blue-500/30 mt-0.5">3</span>
                  <p className="pt-0.5 leading-relaxed">Quà trúng thưởng sẽ được cộng trực tiếp vào tài khoản quý khách trong <strong className="text-yellow-400 text-lg drop-shadow-sm">24H</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0 border border-blue-500/30 mt-0.5">4</span>
                  <p className="pt-0.5 leading-relaxed">Mọi thắc mắc vấn đề cứ liên hệ Admin hỗ trợ nhé !!</p>
                </div>
                <p className="text-center text-yellow-400 font-bold mt-4 pt-4 border-t border-slate-700/50 uppercase tracking-widest text-sm animate-pulse">
                  🍀 Chúc quý khách may mắn 🍀
                </p>
              </div>
              <div className="flex flex-col gap-3 px-2 md:px-6">
                <button
                  onClick={() => setShowSpinRules(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xl py-4 rounded-2xl transition-all duration-300 shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] hover:-translate-y-1 active:scale-95 tracking-wider"
                >
                  OK! ĐÃ HIỂU
                </button>
                <button
                  onClick={() => {
                    setDismissSpinRules(true);
                    setShowSpinRules(false);
                  }}
                  className="w-full py-2 mt-1 text-slate-500 hover:text-blue-400 text-base font-bold transition-colors"
                >
                  Không hiển thị lại!!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Mua Tài Khoản */}
        {buyModalData && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-slate-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                  <Gamepad2 size={30} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Xác nhận Mua Đứt</h3>
                <p className="text-sm text-slate-400 mb-4">Bạn đang mua nick <strong className="text-white">#{buyModalData.code}</strong></p>

                <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 mb-4 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Đơn giá:</span>
                    <span className="text-sm font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(buyModalData.price)}đ</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Tồn kho hiện tại:</span>
                    <span className="text-sm font-bold text-white">{buyModalData.stock !== undefined ? buyModalData.stock : 1}</span>
                  </div>
                  {getGameInfo(buyModalData.game).allowQuantity && (() => {
                    const actualStock = buyModalData.stock !== undefined ? buyModalData.stock : 1;
                    const gameInfo = getGameInfo(buyModalData.game);
                    const maxLimit = (gameInfo.maxQuantityPerOrder > 0) ? Math.min(actualStock, gameInfo.maxQuantityPerOrder) : actualStock;
                    return (
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">Số lượng mua:</span>
                          {gameInfo.maxQuantityPerOrder > 0 && <span className="text-[10px] text-slate-400">Tối đa {maxLimit} / lần</span>}
                        </div>
                        <input
                          type="number"
                          min="1"
                          max={maxLimit}
                          value={buyQuantity}
                          onChange={(e) => {
                            let val = parseInt(e.target.value) || 1;
                            if (val > maxLimit) val = maxLimit;
                            if (val < 1) val = 1;
                            setBuyQuantity(val);
                          }}
                          className="w-20 p-2 bg-[#151D2F] border border-slate-700 rounded-lg text-white font-bold text-center outline-none focus:border-blue-500"
                        />
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-between items-center bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <span className="text-sm font-bold text-emerald-400">Tổng thanh toán:</span>
                  <span className="text-lg font-black text-emerald-400">{new Intl.NumberFormat('vi-VN').format(buyModalData.price * buyQuantity)}đ</span>
                </div>
              </div>
              <div className="flex border-t border-slate-800 bg-[#0B1120]">
                <button onClick={() => setBuyModalData(null)} disabled={isGlobalProcessing} className="flex-1 p-4 font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Hủy</button>
                <div className="w-[1px] bg-slate-800"></div>
                <button disabled={isGlobalProcessing} onClick={() => executeBuyAccount(buyModalData, buyQuantity)} className="flex-1 p-4 font-bold text-blue-500 hover:bg-blue-600 hover:text-white transition-colors">{isGlobalProcessing ? 'Đang xử lý...' : 'Thanh Toán'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Global Confirm Dialog */}
        {confirmDialog && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-slate-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 text-center">
                {isConfirmProcessing ? (
                  <>
                    <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                      <RefreshCw size={30} className="text-emerald-400 animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Đang xử lý...</h3>
                    <p className="text-sm text-slate-400">Vui lòng chờ trong giây lát, không tắt trang!</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                      <AlertCircle size={30} className="text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h3>
                    <p className="text-sm text-slate-400">{confirmDialog.message}</p>
                  </>
                )}
              </div>
              <div className="flex border-t border-slate-800 bg-[#0B1120]">
                <button onClick={() => { if (!isConfirmProcessing) setConfirmDialog(null); }} disabled={isConfirmProcessing} className={`flex-1 p-4 font-bold transition-colors ${isConfirmProcessing ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>Hủy</button>
                <div className="w-[1px] bg-slate-800"></div>
                <button disabled={isConfirmProcessing} onClick={async () => {
                  if (isProcessingActionRef.current || isConfirmProcessing) return;
                  isProcessingActionRef.current = true;
                  setIsConfirmProcessing(true);
                  const action = confirmDialog.onConfirm;
                  try { await action(); } catch (e) { console.error(e); } finally {
                    isProcessingActionRef.current = false;
                    setIsConfirmProcessing(false);
                    setConfirmDialog(null);
                  }
                }} className={`flex-1 p-4 font-bold transition-colors ${isConfirmProcessing ? 'text-slate-600 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-600 hover:text-white'}`}>{isConfirmProcessing ? 'Đang xử lý...' : 'Đồng Ý'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Viewer Phóng to ảnh (Hỗ trợ chuyển ảnh Trái/Phải, Phím mũi tên, Vuốt cảm ứng điện thoại & Thanh Thumbnail) */}
        {activeFullScreenData && (
          <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-2 md:p-4 animate-fade-in select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setFullScreenImage(null);
              }
            }}
            onTouchStart={handleFullScreenTouchStart}
            onTouchEnd={handleFullScreenTouchEnd}
          >
            {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG: TIÊU ĐỀ, ĐẾM SỐ ẢNH & NÚT ĐÓNG */}
            <div className="w-full flex items-center justify-between px-2 md:px-6 py-2 z-[102]">
              <div className="flex items-center gap-2 md:gap-3 max-w-[70%]">
                {activeFullScreenData.images.length > 1 && (
                  <span className="bg-blue-600/90 text-white text-xs md:text-sm font-black px-3 py-1 rounded-full border border-blue-400/40 shadow-lg tracking-wider shrink-0">
                    {activeFullScreenData.index + 1} / {activeFullScreenData.images.length}
                  </span>
                )}
                {activeFullScreenData.title && (
                  <span className="text-xs md:text-sm text-slate-300 font-bold truncate hidden sm:inline-block">
                    {activeFullScreenData.title}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFullScreenImage(null)}
                className="p-2 md:p-2.5 bg-slate-800/80 hover:bg-rose-600 active:scale-95 rounded-full text-white transition-all border border-slate-700/80 shadow-lg cursor-pointer"
                title="Đóng phóng to (Esc)"
              >
                <X size={24} className="md:w-6 md:h-6 w-5 h-5" />
              </button>
            </div>

            {/* KHU VỰC CHÍNH: NÚT TRÁI - ẢNH PHÓNG TO - NÚT PHẢI */}
            <div
              className="relative w-full flex-1 flex items-center justify-center min-h-0 my-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setFullScreenImage(null);
                }
              }}
            >
              {/* NÚT CHUYỂN ẢNH TRÁI (PREV) */}
              {activeFullScreenData.images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevFullScreenImage}
                  className="absolute left-2 md:left-6 z-[103] p-2.5 md:p-4 bg-slate-900/85 hover:bg-blue-600 active:scale-90 text-white rounded-full border border-white/20 shadow-[0_4px_25px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all cursor-pointer group"
                  title="Ảnh trước (Phím ←)"
                >
                  <ChevronLeft size={28} className="md:w-8 md:h-8 w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
                </button>
              )}

              {/* HÌNH ẢNH ĐƯỢC PHÓNG TO */}
              <img
                key={activeFullScreenData.images[activeFullScreenData.index]}
                src={activeFullScreenData.images[activeFullScreenData.index]}
                className="max-w-full max-h-[72vh] md:max-h-[82vh] w-auto h-auto object-contain shadow-2xl border border-slate-800 rounded-xl transition-all duration-200 select-none"
                alt={`Ảnh ${activeFullScreenData.index + 1}`}
              />

              {/* NÚT CHUYỂN ẢNH PHẢI (NEXT) */}
              {activeFullScreenData.images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextFullScreenImage}
                  className="absolute right-2 md:right-6 z-[103] p-2.5 md:p-4 bg-slate-900/85 hover:bg-blue-600 active:scale-90 text-white rounded-full border border-white/20 shadow-[0_4px_25px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all cursor-pointer group"
                  title="Ảnh tiếp theo (Phím →)"
                >
                  <ChevronRight size={28} className="md:w-8 md:h-8 w-6 h-6 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>

            {/* THANH THUMBNAIL PHÍA DƯỚI CHO PHÉP NHẢY NHANH ĐẾN ẢNH BẤT KỲ */}
            {activeFullScreenData.images.length > 1 && (
              <div className="w-full max-w-2xl px-2 py-2 z-[102] flex items-center justify-center">
                <div className="flex gap-2 overflow-x-auto max-w-full py-1.5 px-2.5 custom-scrollbar bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl">
                  {activeFullScreenData.images.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenImage(prev => ({
                          ...(typeof prev === 'object' && prev !== null ? prev : {}),
                          images: activeFullScreenData.images,
                          index: idx,
                          title: activeFullScreenData.title
                        }));
                        setSelectedImageIndex(idx);
                      }}
                      className={`relative flex-shrink-0 w-12 h-9 md:w-16 md:h-11 rounded-lg overflow-hidden border-2 transition-all ${
                        activeFullScreenData.index === idx
                          ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105 opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-100 hover:scale-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* POPUP CHI TIẾT TÀI KHOẢN */}
        {viewingAcc && (() => {
          const viewingAllImages = [viewingAcc.coverImage, ...(viewingAcc.detailImages || [])].filter(Boolean);
          const isCurrentlyRented = viewingAcc.rentedUntil && viewingAcc.rentedUntil > Date.now();

          return (
            <>
              {/* Nút quay lại lơ lửng trên di động theo sát việc cuộn - Nằm ngoài lớp backdrop-filter để không bị ảnh hưởng bởi cuộn */}
              <button
                onClick={() => setViewingAcc(null)}
                className="fixed top-4 left-4 z-[90] md:hidden bg-slate-900/95 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-full border border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft size={16} /> Quay lại
              </button>

              <div className="fixed inset-0 z-40 flex items-start md:items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
                <div className="bg-[#151D2F] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row mt-2 mb-28 md:my-auto md:max-h-[90vh] overflow-visible md:overflow-hidden">

                  <div className="w-full md:w-1/2 bg-[#0B1120] p-3 md:p-4 flex flex-col gap-2 md:overflow-y-auto md:custom-scrollbar">
                    <div
                      className="relative w-full shrink-0 rounded-xl overflow-hidden border border-slate-800 bg-black cursor-zoom-in group select-none"
                      onClick={() => setFullScreenImage({ images: viewingAllImages, index: selectedImageIndex, title: viewingAcc.title })}
                      onTouchStart={handleModalTouchStart}
                      onTouchEnd={(e) => handleModalTouchEnd(e, viewingAllImages.length)}
                    >
                      <img src={viewingAllImages[selectedImageIndex] || viewingAllImages[0]} className="w-full h-auto block select-none pointer-events-none" alt="Main View" />
                      
                      {/* Lớp phủ hover với icon phóng to */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                        <div className="bg-black/60 p-3 rounded-full text-white flex items-center gap-2"><ZoomIn size={24} /></div>
                      </div>

                      {/* Nút chuyển ảnh Trái/Phải và Huy hiệu đếm số ảnh trực tiếp trên khung xem chi tiết */}
                      {viewingAllImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex(prev => (prev - 1 + viewingAllImages.length) % viewingAllImages.length);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-blue-600 active:scale-90 text-white rounded-full transition-all border border-white/20 shadow-lg z-10"
                            title="Ảnh trước"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex(prev => (prev + 1) % viewingAllImages.length);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-blue-600 active:scale-90 text-white rounded-full transition-all border border-white/20 shadow-lg z-10"
                            title="Ảnh tiếp"
                          >
                            <ChevronRight size={20} />
                          </button>
                          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 shadow pointer-events-none z-10">
                            {selectedImageIndex + 1} / {viewingAllImages.length}
                          </div>
                        </>
                      )}
                    </div>
                    {viewingAllImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto custom-scrollbar py-2 shrink-0">
                        {viewingAllImages.map((img, idx) => (
                          <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                            <img src={img} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    {/* === GÓI THUÊ TRẢI NGHIỆM CHUYỂN SANG CỘT TRÁI === */}
                    {viewingAcc.rentOptions && viewingAcc.rentOptions.length > 0 && (
                      <div className="pt-3 mt-1 border-t border-slate-800">
                        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600/20 via-teal-500/25 to-emerald-600/20 border border-emerald-500/40 rounded-xl p-5 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-fade-in text-center">
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgxNiwxODUsMTI5LDAuMSkiLz48L3N2Zz4=')] opacity-50"></div>
                          <p className="relative text-emerald-400 font-black text-base md:text-lg leading-relaxed uppercase tracking-wider">🎁 Tất cả gói thuê mua từ 2H đều được bảo lưu giờ dư khi chơi không hết</p>
                          <p className="relative text-emerald-300/60 text-xs mt-2 font-medium tracking-wide">Ngừng thuê bất cứ lúc nào — Giờ dư sẽ được lưu lại cho lần sau!</p>
                        </div>
                        {currentUser && (currentUser.rentFund || 0) > 0 && (
                          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/30 p-4 rounded-xl mb-4 shadow-inner">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-xs text-yellow-500 font-bold flex items-center gap-1.5"><Clock size={16} /> QUỸ THUÊ BẢO LƯU</p>
                              <p className="text-xl font-black text-yellow-400">{new Intl.NumberFormat('vi-VN').format(currentUser.rentFund || 0)}đ</p>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Khi thuê nick, hệ thống sẽ ưu tiên dùng tiền từ Quỹ này để thanh toán trước.</p>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 font-bold mb-2 uppercase flex items-center gap-1"><Clock size={12} /> Các gói thuê trải nghiệm</p>
                        {isCurrentlyRented && <div className="text-xs text-yellow-500 mb-3 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">Nick đang được thuê bởi khách khác, tạm thời không thể thuê. Bạn vẫn có thể mua đứt ngay lập tức.</div>}
                        {isCurrentlyRented && currentUser?.id === viewingAcc.currentRenterId && (
                          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl mb-3 shadow-[0_0_15px_rgba(225,29,72,0.1)]">
                            <div className="flex items-center gap-2 text-rose-500 mb-2">
                              <Clock size={16} className="animate-pulse" />
                              <span className="font-bold text-xs uppercase">Bạn đang trong phiên thuê</span>
                            </div>

                            {(() => {
                              const activeReqLeft = rentRequests.find(r => r.accCode === viewingAcc.code && r.status === 'Đã giao acc');
                              const isComboLeft = activeReqLeft && (activeReqLeft.time.toLowerCase().includes('combo đêm') || activeReqLeft.time.toLowerCase().includes('combo ngày'));

                              return isComboLeft ? (
                                <p className="text-[10px] text-slate-400 italic">Gói Combo không hỗ trợ ngừng thuê. Acc sẽ hết hạn tự động.</p>
                              ) : (
                                <button onClick={async () => {
                                  const activeReq = rentRequests.find(r => r.accCode === viewingAcc.code && r.status === 'Đã giao acc');
                                  if (!activeReq) return showToast('Không tìm thấy phiên thuê đang hoạt động!', 'error');
                                  setConfirmDialog({
                                    title: 'Ngừng thuê nick', message: `Bạn muốn ngừng thuê nick ${viewingAcc.code}? Thời gian thuê dư sẽ được quy đổi thành tiền vào Quỹ thuê.`, onConfirm: async () => {
                                      setIsGlobalProcessing(true);
                                      try {
                                        const { data: currentReq } = await supabase.from('rent_requests').select('*').eq('id', activeReq.id).single();
                                        const { data: acc } = await supabase.from('accounts').select('*').eq('id', viewingAcc.id).single();
                                        if (!currentReq || currentReq.status !== 'Đã giao acc' || !acc || acc.currentRenterId !== currentUser.id) {
                                          return showToast('Phiên thuê không hợp lệ hoặc đã kết thúc!', 'error');
                                        }

                                        const timeStr = currentReq.time.toLowerCase();
                                        const match = timeStr.match(/(\d+)\s*giờ/);
                                        const totalHours = match ? parseInt(match[1]) : 0;

                                        const rentStartTime = new Date(currentReq.created_at).getTime();
                                        const diffHours = (Date.now() - rentStartTime) / (1000 * 60 * 60);
                                        const usedHours = Math.ceil(diffHours);

                                        const deducted = Math.max(2, usedHours); // Khấu trừ tối thiểu 2h
                                        let savedHours = totalHours - deducted;
                                        if (savedHours < 0) savedHours = 0;

                                        const refundAmount = currentReq.info?.depositAmount || 0;
                                        const selectedOption = acc.rentOptions?.find(opt => opt.time === currentReq.time);
                                        const paidPrice = selectedOption ? selectedOption.price : (acc.rentPricePerHour * totalHours);
                                        const effectiveHourlyRate = totalHours > 0 ? (paidPrice / totalHours) : 0;
                                        const savedMoney = Math.floor(savedHours * effectiveHourlyRate);

                                        await supabase.from('accounts').update({ rentedUntil: null, rentStartedAt: null, currentRenterId: null }).eq('id', acc.id);
                                        await supabase.from('rent_requests').update({ status: 'Đã trả acc' }).eq('id', currentReq.id);

                                        const { data: liveUser } = await supabase.from('users').select('balance, rentFund').eq('id', currentUser.id).single();
                                        const newFund = (liveUser?.rentFund || 0) + savedMoney;
                                        const newBalance = (liveUser?.balance || 0) + refundAmount;
                                        await supabase.from('users').update({ rentFund: newFund, balance: newBalance }).eq('id', currentUser.id);

                                        const newTxs = [];
                                        if (refundAmount > 0) {
                                          newTxs.push({ id: `TX${Date.now()}1`, user: currentUser.name, action: `Hoàn cọc nick ${acc.code}`, amount: refundAmount, date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'), status: 'Thành công', type: 'deposit_refund' });
                                        }
                                        if (savedMoney > 0) {
                                          newTxs.push({ id: `TX${Date.now()}2`, user: currentUser.name, action: `Quy đổi ${savedHours.toFixed(1)}h dư (Nick ${acc.code}) vào Quỹ Thuê`, amount: savedMoney, date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'), status: 'Thành công', type: 'fund_add' });
                                        }
                                        if (newTxs.length > 0) {
                                          await supabase.from('transactions').insert(newTxs);
                                        }

                                        showToast(`Đã ngừng thuê! ${savedMoney > 0 ? `Được hoàn ${new Intl.NumberFormat('vi-VN').format(savedMoney)}đ vào Quỹ Thuê.` : ''}`);
                                        const u = { ...currentUser, balance: newBalance, rentFund: newFund };
                                        setCurrentUser(u);
                                        localStorage.setItem('shop_cached_user', JSON.stringify(u));
                                        setViewingAcc(null);
                                      } catch (err) {
                                        showToast('Lỗi: ' + err.message, 'error');
                                      } finally {
                                        setIsGlobalProcessing(false);
                                      }
                                    }
                                  });
                                }} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors"><RotateCcw size={14} /> Ngừng Thuê Ngay</button>
                              );
                            })()}
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                          {viewingAcc.rentOptions.map((opt, idx) => {
                            const activePrice = viewingAcc.rentDiscountPercent > 0
                              ? opt.price - Math.floor(opt.price * (viewingAcc.rentDiscountPercent / 100))
                              : opt.price;

                            return (
                              <button
                                key={idx}
                                disabled={isCurrentlyRented}
                                onClick={() => initiateRent(viewingAcc, { ...opt, price: activePrice, originalPrice: opt.price })}
                                className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1 animate-fade-in shadow-inner w-full ${isCurrentlyRented ? 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed' : 'border-slate-800 bg-[#0B1120] hover:border-blue-500 hover:bg-blue-900/20 cursor-pointer'}`}
                              >
                                <div className="flex flex-col items-center gap-1.5 w-full mb-1">
                                  <p className="font-black text-xl text-white">Thuê {opt.time}</p>
                                  {opt.bonusTime && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap font-bold shadow-sm">
                                      + Tặng {opt.bonusTime}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-center gap-1.5 text-blue-400 mt-2 border-t border-slate-800 w-full pt-3 relative">
                                  {viewingAcc.rentDiscountPercent > 0 && (
                                    <div className="absolute top-0 right-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg transform -translate-y-1/2">
                                      -{viewingAcc.rentDiscountPercent}%
                                    </div>
                                  )}
                                  <Wallet size={16} className="text-blue-500" />
                                  <div className="flex flex-col items-start leading-tight">
                                    {viewingAcc.rentDiscountPercent > 0 && (
                                      <p className="text-[10px] text-slate-500 line-through -mb-0.5">{new Intl.NumberFormat('vi-VN').format(opt.price)}đ</p>
                                    )}
                                    <p className="font-black text-lg">
                                      {new Intl.NumberFormat('vi-VN').format(activePrice)}
                                      <span className="text-xs ml-0.5">đ</span>
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-1/2 p-4 md:p-6 pb-4 md:pb-6 flex flex-col md:overflow-y-auto md:custom-scrollbar">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex gap-2 items-center mb-2">
                          <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">Mã: {viewingAcc.code}</span>
                          <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">Kho: {viewingAcc.stock !== undefined ? viewingAcc.stock : 1}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded border flex items-center gap-1 ${viewingAcc.tagColor}`}>
                            {getGameInfo(viewingAcc.game).avatar && <img src={getGameInfo(viewingAcc.game).avatar} className="w-4 h-4 rounded" alt="Game Avatar" />}
                            {getGameInfo(viewingAcc.game).name}
                          </span>

                          {/* HIỂN THỊ TAG ĐẲNG CẤP MỚI TẠI ĐÂY */}
                          <span className={`text-xs font-black px-2 py-1 rounded shadow-md uppercase ${viewingAcc.tier === 'ULVIP' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : viewingAcc.tier === 'SVIP' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0B1120]' : 'bg-blue-600 text-white'}`}>
                            {viewingAcc.tier || 'VIP'}
                          </span>
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-white leading-snug whitespace-pre-line">{viewingAcc.title}</h2>
                      </div>
                      <button onClick={() => setViewingAcc(null)} className="hidden md:block p-2 bg-[#0B1120] rounded-full text-slate-400 hover:text-white transition-colors border border-slate-800"><X size={20} /></button>
                    </div>

                    {/* SỐ DƯ VÍ - HIỂN THỊ NGAY TRÊN ĐẦU */}
                    {currentUser && (
                      <div className="flex items-center justify-between bg-[#0B1120] border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 shadow-inner">
                        <div className="flex items-center gap-2">
                          <Wallet size={18} className="text-emerald-500" />
                          <span className="text-sm text-slate-400 font-bold">Số dư ví của bạn:</span>
                        </div>
                        <span className="text-emerald-400 font-black text-lg">{new Intl.NumberFormat('vi-VN').format(currentUser.balance)}đ</span>
                      </div>
                    )}

                    <p className="text-sm text-slate-400 mb-6 bg-[#0B1120] p-4 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">{viewingAcc.description}</p>

                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                      {viewingAcc.tags.map((tag, i) => (
                        <div key={i} className="bg-[#0B1120] border border-slate-800 p-2 md:p-2.5 rounded-lg text-xs md:text-sm text-slate-300 font-medium flex items-center gap-1.5 md:gap-2">
                          <CheckCircle2 size={14} className="text-blue-500 shrink-0" /> <span className="line-clamp-1">{tag}</span>
                        </div>
                      ))}
                    </div>



                    <div className="hidden md:block mt-auto space-y-3">

                      <button onClick={() => handleBuyAccount(viewingAcc)} className="w-full bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-xl flex items-center justify-between transition-colors shadow-lg hover:-translate-y-1">
                        <div className="text-left">
                          <p className="font-bold text-lg">Mua Đứt Tài Khoản</p>
                          <p className="text-xs text-rose-200">Giao acc ngay, có thông tin TK/MK</p>
                        </div>
                        <span className="text-xl md:text-2xl font-black">{new Intl.NumberFormat('vi-VN').format(viewingAcc.price)}đ</span>
                      </button>
                    </div>
                  </div>

                  {/* Nút Mua Đứt Tự Động Dock Vào Cuối Content (Dùng Sticky) */}
                  <div className="md:hidden sticky bottom-[76px] w-full p-3 z-40 bg-[#151D2F] border-t border-slate-800 rounded-b-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <button onClick={() => handleBuyAccount(viewingAcc)} className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white p-3.5 rounded-2xl flex items-center justify-between transition-all shadow-[0_8px_30px_rgba(225,29,72,0.4)] border border-rose-500/50">
                      <div className="text-left">
                        <p className="font-bold text-base uppercase tracking-wide">Mua Đứt Ngay</p>
                        <p className="text-[10px] text-rose-200">Giao ngay, có TK/MK</p>
                      </div>
                      <span className="text-lg font-black">{new Intl.NumberFormat('vi-VN').format(viewingAcc.price)}đ</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
        {/* MODAL QUY ĐỊNH THUÊ NICK TỪ ADMIN */}
        {showRentRules && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-rose-500/50 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(225,29,72,0.2)]">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0B1120]">
                <h3 className="text-xl font-bold text-rose-500 flex items-center gap-2"><AlertCircle size={22} /> QUY ĐỊNH THUÊ NICK</h3>
                <button onClick={() => setShowRentRules(null)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 md:p-8">
                <h4 className="text-lg md:text-xl font-black text-white mb-6 text-center tracking-wide">VUI LÒNG ĐỌC KĨ QUY ĐỊNH TRƯỚC KHI THUÊ</h4>

                <div className="space-y-4 text-sm text-slate-300 mb-8 bg-[#0B1120] p-5 rounded-2xl border border-slate-800 shadow-inner">
                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-black shrink-0 text-xs shadow-lg shadow-rose-500/30">1</span>
                    <p><strong className="text-white">HỆ THỐNG SẼ TÍNH TỐI THIỂU 2 GIỜ/LẦN THUÊ</strong><br /><span className="text-slate-400 text-xs mt-0.5 block">(Bạn nghỉ sớm thì vẫn bị tính là 2 giờ chơi)</span></p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-black shrink-0 text-xs shadow-lg shadow-rose-500/30">2</span>
                    <p><strong className="text-rose-400">TUYỆT ĐỐI KHÔNG ĐƯỢC TẮT APP ĐIỀU KHIỂN</strong><br /><span className="text-slate-400 text-xs mt-0.5 block">(Phát hiện tắt: Xóa sạch tiền thuê và kick ra khỏi acc)</span></p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-black shrink-0 text-xs shadow-lg shadow-blue-500/30">3</span>
                    <p><strong className="text-white">QUÝ KHÁCH MUỐN NGỪNG THUÊ VUI LÒNG VÀO LẠI WEBSITE BẤM NGỪNG THUÊ</strong><br /><span className="text-slate-400 text-xs mt-0.5 block">Hệ thống sẽ tự động lưu lại giờ dư cho bạn (Nếu có).</span></p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 text-xs shadow-lg shadow-emerald-500/30">4</span>
                    <p><strong className="text-emerald-400">THÔNG TIN CHI TIẾT LIÊN HỆ ADMIN ĐỂ HỖ TRỢ</strong></p>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl cursor-pointer hover:bg-blue-500/20 transition-colors mb-6 group shadow-inner">
                  <input type="checkbox" checked={isRulesAccepted} onChange={(e) => setIsRulesAccepted(e.target.checked)} className="w-6 h-6 accent-blue-500 cursor-pointer rounded" />
                  <span className="text-sm font-bold text-blue-400 group-hover:text-blue-300">Tôi đã đọc kỹ quy định & chấp hành theo</span>
                </label>

                <button
                  disabled={!isRulesAccepted}
                  onClick={() => {
                    // Chuyển dữ liệu sang Modal Thanh toán
                    setRentKycMethod('cccd');
                    setRentModalData({ acc: showRentRules.acc, opt: showRentRules.opt });
                    setKycImagePreview(null);
                    setShowRentRules(null); // Tắt bảng quy định đi
                  }}
                  className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-lg ${isRulesAccepted ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                  OK! Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal KYC Thuê (Đã chia rõ logic VIP và Khách Thường) */}
        {rentModalData && (() => {
          const totalRecharged = calculateTotalRecharged(currentUser?.id);
          const isVIP = totalRecharged >= 3000000; // Khách VIP (Nạp trên 3tr)
          const isTrusted = currentUser?.is_trusted; // Nhận diện Khách quen
          const skipKyc = isVIP || isTrusted; // Lệnh tối cao: Gặp 1 trong 2 là cho qua hết

          // Cọc chỉ áp dụng nếu KHÔNG được skipKyc
          const needsDeposit = !skipKyc && rentKycMethod === 'deposit';
          const totalRentCost = rentModalData.opt.price + (needsDeposit ? 500000 : 0);

          return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="text-blue-500" /> Thủ tục thuê Nick</h3>
                  <button onClick={() => setRentModalData(null)} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-full"><X size={20} /></button>
                </div>

                <div className="text-sm text-slate-400 mb-4 bg-blue-900/10 p-3 rounded-lg border border-blue-500/20">
                  Đang thuê nick <strong className="text-white">#{rentModalData.acc.code}</strong> gói <strong className="text-white">{rentModalData.opt.time}</strong>
                  {rentModalData.opt.bonusTime && <strong className="text-emerald-400 ml-1">(+ Tặng {rentModalData.opt.bonusTime})</strong>}<br />
                  Phí thuê: <strong className="text-rose-400">{new Intl.NumberFormat('vi-VN').format(rentModalData.opt.price)}đ</strong>
                  {needsDeposit && <><br />Tiền cọc an toàn (Sẽ hoàn trả): <strong className="text-yellow-400">+500.000đ</strong></>}
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!currentUser.is_email_verified) return showToast("Vui lòng vào mục Cá nhân để xác thực Email trước khi thanh toán!", "error");
                  if (isProcessingActionRef.current) return;
                  isProcessingActionRef.current = true;

                  const targetForm = e.target;
                  // Bắt thẳng giá trị từ DOM để chống React làm mất dữ liệu
                  const capturedPhone = targetForm.phone?.value || '';
                  const capturedAwesunId = targetForm.awesunId?.value || '';
                  const capturedAwesunPass = targetForm.awesunPass?.value || '';
                  const capturedCccd = targetForm.cccd?.value || '';
                  const useFundCheckbox = targetForm.useFundCheckbox?.checked || false;

                  const processRent = async () => {
                    try {
                      // ĐÃ XÓA logic đẩy CCCD lên ImgBB ở đây để bảo mật tuyệt đối dữ liệu cá nhân của khách hàng.
                      // Toàn bộ ảnh CCCD (Base64) được lưu thẳng vào Supabase Database như cũ thay vì sang Server bên thứ 3.

                      // KIỂM TRA: Mỗi tài khoản chỉ được thuê 1 nick trong 1 lúc
                      const alreadyRenting = accountsDb.find(a => a.currentRenterId === currentUser.id && a.rentedUntil && a.rentedUntil > Date.now());
                      if (alreadyRenting) {
                        isProcessingActionRef.current = false;
                        return showToast(`Bạn đang thuê nick mã #${alreadyRenting.code} rồi! Vui lòng ngưng thuê nick cũ trước khi thuê nick mới.`, 'error');
                      }

                      const { acc, opt } = rentModalData; // Lấy dữ liệu acc và gói thuê

                      let rentCostFromFund = 0;
                      let rentPartFromMain = 0;
                      let depositFromMain = needsDeposit ? 500000 : 0;

                      // 1. TÍNH TOÁN TRỪ TIỀN
                      if (useFundCheckbox && (currentUser.rentFund || 0) > 0) {
                        if (currentUser.rentFund >= opt.price) {
                          rentCostFromFund = opt.price;
                          rentPartFromMain = 0;
                        } else {
                          rentCostFromFund = currentUser.rentFund;
                          rentPartFromMain = opt.price - currentUser.rentFund;
                        }
                      } else {
                        rentPartFromMain = opt.price;
                      }

                      const totalCostFromMain = rentPartFromMain + depositFromMain;

                      if (currentUser.balance < totalCostFromMain) {
                        return showToast(`Số dư không đủ! Cần ${new Intl.NumberFormat('vi-VN').format(totalCostFromMain)}đ.`, 'error');
                      }

                      // 2. CẬP NHẬT DATABASE (USERS)
                      const newBalance = currentUser.balance - totalCostFromMain;
                      const newFund = (currentUser.rentFund || 0) - rentCostFromFund;

                      // Tự động lưu số CCCD vào profile (chỉ lưu chuỗi số, tuyệt đối không lưu ảnh Base64 nặng để bảo vệ Supabase Free Tier)
                      if (!skipKyc && rentKycMethod === 'cccd' && capturedCccd) {
                        const { error: cccdErr } = await supabase.from('users').update({
                          cccd_number: capturedCccd
                        }).eq('id', currentUser.id);
                        if (cccdErr) console.error("Lỗi cập nhật CCCD:", cccdErr);
                      }

                      // 3. TẠO LỊCH SỬ GIAO DỊCH (Đã thêm Quỹ và Số dư cuối)
                      const txs = [];

                      // A. Lịch sử trừ ví chính
                      if (rentPartFromMain > 0 || !useFundCheckbox) {
                        txs.push({
                          id: `TX${Date.now()}1`, user: currentUser.name,
                          action: `Thuê nick ${acc.code} (${opt.time})`,
                          amount: rentPartFromMain,
                          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                          status: 'Thành công', type: 'rent_acc',
                          accDetails: { balanceAfter: newBalance, fundAfter: newFund } // <--- LƯU SỐ DƯ VÀO ĐÂY
                        });
                      }

                      // B. Lịch sử trừ Quỹ bảo lưu (Sửa lỗi sót hôm trước)
                      if (rentCostFromFund > 0) {
                        txs.push({
                          id: `TX${Date.now()}2`, user: currentUser.name,
                          action: `Dùng Quỹ Bảo Lưu thuê Mã ${acc.code}`,
                          amount: rentCostFromFund,
                          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                          status: 'Thành công', type: 'fund_use',
                          accDetails: { balanceAfter: newBalance, fundAfter: newFund } // <--- LƯU SỐ DƯ VÀO ĐÂY
                        });
                      }

                      // C. Lịch sử giữ cọc
                      if (depositFromMain > 0) {
                        txs.push({
                          id: `TX${Date.now()}3`, user: currentUser.name,
                          action: `Cọc an toàn nick ${acc.code}`,
                          amount: 500000,
                          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                          status: 'Đang giữ cọc', type: 'deposit_hold',
                          accDetails: { balanceAfter: newBalance, fundAfter: newFund } // <--- LƯU SỐ DƯ VÀO ĐÂY
                        });
                      }

                      // GỌI RPC TRỪ TIỀN VÀ GHI LỊCH SỬ AN TOÀN
                      const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_client_spend', {
                        p_amount: totalCostFromMain,
                        p_fund_amount: rentCostFromFund,
                        p_tx_data: txs
                      });

                      if (rpcError || !rpcData?.success) {
                        return showToast(rpcError?.message || rpcData?.message || 'Lỗi thanh toán thuê nick!', 'error');
                      }

                      // 4. GỬI ĐƠN THUÊ LÊN HỆ THỐNG
                      const newRentReq = {
                        id: `RNT${Date.now()}`,
                        user: currentUser.name,
                        userId: currentUser.id,
                        accCode: acc.code,
                        time: opt.time,
                        status: 'Chờ xử lý',
                        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                        info: {
                          bonusTime: opt.bonusTime || '',
                          kycMethod: skipKyc ? (isVIP ? 'vip' : 'khach_quen') : (currentUser.is_email_verified && rentKycMethod === 'cccd' ? 'verified_cccd' : rentKycMethod),
                          // Không lưu trực tiếp Base64 vào rent_requests nữa để tiết kiệm 95% Payload tải về của Admin
                          // Admin giờ sẽ bấm nút để tự động kéo ảnh từ bảng users xuống xem (Fetch On-Demand)
                          cccdNumber: (!skipKyc && rentKycMethod === 'cccd') ? (currentUser.is_cccd_verified ? currentUser.cccd_number : capturedCccd) : '',
                          phone: capturedPhone,
                          awesunId: capturedAwesunId,
                          awesunPass: capturedAwesunPass,
                          depositAmount: depositFromMain,
                          paidFromFund: rentCostFromFund,
                          paidFromMain: rentPartFromMain
                        }
                      };

                      const { data: rentData, error: rentError } = await supabase.from('rent_requests').insert([newRentReq]).select();

                      if (rentError) return showToast("Lỗi gửi đơn: " + rentError.message, 'error');

                      // 5. CẬP NHẬT GIAO DIỆN & ĐÓNG CỬA SỔ
                      if (rentData) {
                        const updatedUser = { ...currentUser, balance: newBalance, rentFund: newFund };
                        setCurrentUser(updatedUser);
                        localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));

                        setRentRequests([rentData[0], ...rentRequests]);
                        setTransactionsDb(prev => [...txs, ...prev]);

                        // QUAN TRỌNG: Đóng tất cả Modal
                        setRentModalData(null);
                        setViewingAcc(null);
                        setKycImagePreview(null);

                        showToast("Thuê thành công! Đang chuyển hướng...", "success");
                        sendAdminAlert('THUÊ NICK', `Khách ${currentUser.name} thuê nick #${acc.code}`);

                        setTimeout(() => {
                          setCurrentView('lichsu');
                        }, 1000);
                      }
                    } finally { isProcessingActionRef.current = false; }
                  };

                  // Hoàn tất: Bỏ khâu file ảnh Base64 nặng để bảo vệ tuyệt đối dung lượng Supabase Cloud
                  processRent();
                }} className="space-y-4">

                  {/* PHẦN HIỂN THỊ ĐIỀU KIỆN */}
                  {/* LỰA CHỌN NGUỒN TIỀN THANH TOÁN (HỖ TRỢ TRỪ HỖN HỢP) */}
                  {(currentUser.rentFund || 0) > 0 && rentModalData.opt.price > 0 && (
                    <label className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4 cursor-pointer hover:bg-yellow-500/20 transition-colors shadow-inner group">
                      <input type="checkbox" name="useFundCheckbox" className="w-5 h-5 accent-yellow-500 cursor-pointer" defaultChecked />
                      <div>
                        <p className="text-sm font-bold text-yellow-400 group-hover:text-yellow-300">Dùng Quỹ Bảo Lưu để thanh toán/giảm giá</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Quỹ đang có: {new Intl.NumberFormat('vi-VN').format(currentUser.rentFund || 0)}đ.
                          <br />
                          {(currentUser.rentFund || 0) >= rentModalData.opt.price
                            ? `Hệ thống sẽ trừ ${new Intl.NumberFormat('vi-VN').format(rentModalData.opt.price)}đ từ Quỹ.`
                            : `Sẽ dùng hết Quỹ, bạn cần trả thêm ${new Intl.NumberFormat('vi-VN').format(rentModalData.opt.price - currentUser.rentFund)}đ từ Ví chính.`}
                        </p>
                      </div>
                    </label>
                  )}
                  {isVIP ? (
                    <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 p-4 rounded-xl border border-yellow-500/50 mb-4 text-center">
                      <Sparkles size={24} className="text-yellow-400 mx-auto mb-1" />
                      <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm">Đặc Quyền Khách VIP</p>
                      <p className="text-sm text-slate-300 mt-2">Bạn được <span className="text-emerald-400 font-bold">MIỄN CHỤP CCCD</span> và <span className="text-emerald-400 font-bold">MIỄN CỌC 500K</span> khi thuê nick.</p>
                    </div>
                  ) : isTrusted ? (
                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 p-4 rounded-xl border border-emerald-500/50 mb-4 text-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-1" />
                      <p className="text-emerald-400 font-black uppercase tracking-widest text-lg">Khách Quen Uy Tín</p>
                      <p className="text-sm text-slate-300 mt-2">Hệ thống đã nhận diện. Bạn được <span className="text-emerald-400 font-bold">MIỄN CHỤP CCCD</span> và <span className="text-emerald-400 font-bold">MIỄN CỌC 500K</span>.</p>
                    </div>
                  ) : (
                    <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 mb-4">
                      <label className="text-sm font-bold text-slate-300 mb-3 block">Khách hàng vui lòng chọn 1 trong 2 thủ tục:</label>
                      <div className="flex gap-3 mb-4">
                        <div onClick={() => setRentKycMethod('cccd')} className={`flex-1 p-3 rounded-xl border cursor-pointer transition-colors flex flex-col justify-center items-center ${rentKycMethod === 'cccd' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#151D2F] border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                          <p className="font-bold text-sm">Cung cấp CCCD</p>
                          <p className="text-[10px] mt-1">(Miễn phí cọc)</p>
                        </div>
                        <div onClick={() => setRentKycMethod('deposit')} className={`flex-1 p-3 rounded-xl border cursor-pointer transition-colors flex flex-col justify-center items-center ${rentKycMethod === 'deposit' ? 'bg-rose-600/20 border-rose-500 text-rose-400' : 'bg-[#151D2F] border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                          <p className="font-bold text-sm">Cọc 500.000đ</p>
                          <p className="text-[10px] mt-1">(Hoàn lại khi trả nick)</p>
                        </div>
                      </div>

                      {/* Chỉ hiện chỗ up ảnh nếu khách chọn CCCD */}
                      {rentKycMethod === 'cccd' && (
                        currentUser?.is_cccd_verified ? (
                          <div className="col-span-2 bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/30 text-center animate-fade-in mb-4">
                            <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-2" />
                            <p className="text-emerald-400 font-bold text-lg">CCCD của bạn đã được Admin phê duyệt!</p>
                            <p className="text-sm text-slate-400 mt-1">Hệ thống đã lưu lại số CCCD, bạn có thể ấn Thanh toán ngay.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 animate-fade-in mb-4">
                            <div className="col-span-2">
                              <label className="text-xs text-slate-400 block mb-1.5 font-bold">Số Căn Cước Công Dân (12 số):</label>
                              <input name="cccd" placeholder="Nhập chính xác số CCCD của bạn" maxLength="12" className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-blue-500" required />
                              <p className="text-[11px] text-slate-500 mt-1">Hệ thống bảo mật tối đa: Chỉ lưu số định danh, không yêu cầu tải ảnh chụp để tránh chiếm dụng bộ nhớ.</p>
                            </div>
                          </div>
                        )
                      )}

                      {/* Bảng thông báo nạp cọc nếu khách chọn Cọc */}
                      {rentKycMethod === 'deposit' && (
                        <div className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-center animate-fade-in">
                          Hệ thống sẽ tạm giữ <strong>500.000đ</strong> từ số dư của bạn làm tiền cọc.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2"><Gamepad2 size={16} /> Cung cấp App điều khiển & SĐT</h4>
                      <button
                        type="button"
                        onClick={() => {
                          window.open('https://down.aweray.com/awesun/windows/Aweray_Remote_2.0.0.45399_x64.exe', '_blank');
                          setAwesunGuideType('inside');
                        }}
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-blue-500/30 shadow-sm"
                      >
                        <Download size={14} /> Tải App Điều Khiển
                      </button>
                    </div>

                    {/* Mới thêm: Ô tải App điều khiển lớn trong khối cung cấp thông tin */}
                    <div className="flex flex-col justify-center bg-[#151D2F] border border-blue-500/30 p-5 rounded-xl shadow-inner mb-4 relative overflow-hidden group">
                      <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Download size={100} />
                      </div>
                      <h3 className="text-white font-bold text-base mb-1 relative z-10 flex items-center gap-2">
                        <Gamepad2 className="text-blue-500" size={18} /> Bạn chưa có app điều khiển?
                      </h3>
                      <p className="text-xs text-slate-400 mb-3 relative z-10">Tải phần mềm điều khiển xa để chuẩn bị sẵn sàng trước khi thuê tài khoản game.</p>
                      <button
                        type="button"
                        onClick={() => {
                          window.open('https://down.aweray.com/awesun/windows/Aweray_Remote_2.0.0.45399_x64.exe', '_blank');
                          setAwesunGuideType('inside');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm relative z-10"
                      >
                        <Download size={16} /> Tải xuống ngay
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><input name="awesunId" placeholder="ID App (9 số)" pattern="[0-9]{9}" maxLength="9" onInput={enforceNumberInput} title="Vui lòng nhập đúng 9 số" className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white font-mono outline-none" required /></div>
                      <div><input name="awesunPass" placeholder="Mật khẩu" className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white font-mono outline-none" required /></div>
                      <div className="col-span-2"><input name="phone" type="tel" pattern="0[0-9]{9,10}" maxLength="11" onInput={enforcePhoneZeroInput} placeholder="SĐT liên hệ (bắt đầu bằng số 0, 10-11 số)" title="Số điện thoại phải bắt đầu bằng số 0 và gồm 10-11 chữ số" className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white outline-none" required /></div>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-600/20 text-lg uppercase tracking-wide">
                    Thanh toán {new Intl.NumberFormat('vi-VN').format(totalRentCost)}đ
                  </button>
                </form>
              </div>
            </div>
          );
        })()}
        {/* Modal Khách Đặt Cày Thuê */}
        {boostingModalData && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0B1120]">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Target className="text-blue-500" /> Đặt Đơn Cày Thuê</h3>
                <button onClick={() => setBoostingModalData(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {(() => {
                  const hasOptions = boostingModalData.rankOptions && boostingModalData.rankOptions.length > 0;
                  const currentOption = hasOptions ? boostingModalData.rankOptions[selectedBoostRank] : null;
                  const optionInputType = currentOption?.inputType || 'bac';
                  const currentOptionName = currentOption?.rank || '';
                  const perUnitPrice = currentOption?.price || boostingModalData.price;
                  const comboPrice = currentOption?.comboPrice || 0;
                  const maxPoints = currentOption?.maxPoints || 0;
                  const basePoints = currentOption?.basePoints || 0;
                  const absoluteMaxPoints = basePoints > 0 ? basePoints + maxPoints : maxPoints;
                  const optTierCount = currentOption?.tierCount || 1;
                  // Generate dynamic tier list: e.g. tierCount=3 → ['III','II','I'], tierCount=1 → ['I']
                  const tierList = Array.from({ length: optTierCount }, (_, i) => toRoman(optTierCount - i));

                  // --- LOGIC TÍNH GIÁ TỰ ĐỘNG ---
                  let activePrice = boostingModalData.price;
                  let priceLabel = '';

                  // Trích số điểm đích từ title (VD: "Rank Truyền Kỳ (3700pt)" hoặc "3700 Points")
                  const titlePointsMatch = boostingModalData.title?.match(/(\d+)\s*(?:Points?|pt)/i);
                  const titleTargetPoints = titlePointsMatch ? parseInt(titlePointsMatch[1]) : 0;

                  // Trích số điểm tối thiểu từ tên option (VD: "Thần Súng (3000pt)" → 3000)
                  const optionPointsMatch = currentOptionName?.match(/(\d+)\s*(?:Points?|pt)/i);
                  const optionMinPoints = optionPointsMatch ? parseInt(optionPointsMatch[1]) : 0;

                  // Validate điểm nhập
                  let pointsError = '';

                  const isPointBased = boostingModalData.rankOptions && boostingModalData.rankOptions.length > 0 && boostingModalData.rankOptions[0].points !== undefined;
                  const isRankCumulative = isPointBased && (boostingModalData.rankOptions.some(opt => /\b(I|II|III|IV|V|VI|VII|VIII|IX|X)\b/.test(opt.name)) || boostingModalData.rankOptions.every((opt, i) => opt.points === i));
                  if (isPointBased) {
                    const currentPts = parseInt(boostCurrentPoints);
                    const targetPts = parseInt(boostTargetPoints);
                    if (!isNaN(currentPts) && !isNaN(targetPts) && boostCurrentPoints !== '' && boostTargetPoints !== '') {
                      if (currentPts >= targetPts) {
                        pointsError = isRankCumulative ? 'Rank mục tiêu phải cao hơn rank hiện tại!' : 'Điểm mục tiêu phải lớn hơn điểm hiện tại!';
                        activePrice = 0;
                      } else {
                        activePrice = calculateBoostPrice(currentPts, targetPts, boostingModalData.rankOptions);
                        if (activePrice === 0) pointsError = 'Lỗi tính toán điểm!';
                        priceLabel = `(${getRankByPoints(currentPts, boostingModalData.rankOptions)} lên ${getRankByPoints(targetPts, boostingModalData.rankOptions)})`;
                      }
                    } else {
                      activePrice = 0;
                    }
                  } else if (hasOptions && currentOption) {
                    if (optionInputType === 'bac') {
                      if (optTierCount <= 1) {
                        activePrice = perUnitPrice;
                      } else {
                        const maxTierLabel = toRoman(optTierCount);
                        const selectedTierIdx = tierList.indexOf(boostSubTier);
                        if (boostSubTier === maxTierLabel || selectedTierIdx === 0 || selectedTierIdx === -1) {
                          activePrice = comboPrice || perUnitPrice;
                          priceLabel = '(Trọn gói)';
                        } else {
                          const romanToNum = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 };
                          const stepsRemaining = romanToNum[boostSubTier] || 1;
                          activePrice = perUnitPrice * stepsRemaining;
                          priceLabel = `(${stepsRemaining} bậc × ${new Intl.NumberFormat('vi-VN').format(perUnitPrice)}đ)`;
                        }
                      }
                    } else {
                      // ĐIỂM: Tính giá dựa trên basePoints + maxPoints
                      const currentPts = parseInt(boostCurrentPoints) || 0;
                      const targetPts = titleTargetPoints || absoluteMaxPoints || 0;
                      const lowerBound = basePoints > 0 ? basePoints : (optionMinPoints > 0 ? optionMinPoints : 0);
                      if (currentPts > 0 && targetPts > 0) {
                        if (lowerBound > 0 && currentPts < lowerBound) {
                          pointsError = `Điểm phải từ ${new Intl.NumberFormat('vi-VN').format(lowerBound)} trở lên (khởi đầu rank này)`;
                          activePrice = 0;
                        } else if (currentPts >= targetPts) {
                          pointsError = `Bạn đã vượt mốc ${new Intl.NumberFormat('vi-VN').format(targetPts)} điểm, hãy chọn gói cao hơn!`;
                          activePrice = 0;
                        } else {
                          const pointsNeeded = Math.max(0, targetPts - currentPts);
                          activePrice = perUnitPrice * pointsNeeded;
                        }
                      } else {
                        activePrice = 0;
                      }
                    }
                  }

                  // --- APPLY DISCOUNT ---
                  if (boostingModalData.discountPercent > 0 && activePrice > 0) {
                    const discountAmt = Math.floor(activePrice * (boostingModalData.discountPercent / 100));
                    activePrice = activePrice - discountAmt;
                    priceLabel = priceLabel ? `${priceLabel} (Giảm ${boostingModalData.discountPercent}%)` : `(Giảm ${boostingModalData.discountPercent}%)`;
                  }

                  // --- APPLY QUANTITY ---
                  if (boostingModalData.allow_quantity && boostQuantity > 1) {
                    activePrice = activePrice * boostQuantity;
                  }

                  return (
                    <>
                      <p className="text-sm text-slate-400 mb-3">Số dư của bạn: <span className="text-emerald-400 font-bold text-base">{new Intl.NumberFormat('vi-VN').format(currentUser?.balance || 0)}đ</span></p>
                      <div className="mb-4 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
                        <p className="text-sm text-slate-300">Dịch vụ: <strong className="text-white">{boostingModalData.title}</strong></p>

                        {/* --- KHU VỰC NHẬP SỐ LƯỢNG --- */}
                        {boostingModalData.allow_quantity && !hasOptions && (() => {
                          const gameInfo = getGameInfo(boostingModalData.game);
                          const maxLimit = gameInfo.maxQuantityPerOrder || 0;
                          return (
                            <div className="mt-3">
                              <div className="flex justify-between items-end mb-1">
                                <label className="text-xs text-emerald-400 font-bold">Số lượng mua</label>
                                {maxLimit > 0 && <span className="text-[10px] text-slate-400">Tối đa {maxLimit} / lần</span>}
                              </div>
                              <input
                                type="number"
                                min="1"
                                max={maxLimit > 0 ? maxLimit : undefined}
                                value={boostQuantity}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value) || 1;
                                  if (maxLimit > 0 && val > maxLimit) val = maxLimit;
                                  setBoostQuantity(Math.max(1, val));
                                }}
                                className="w-full p-2.5 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-bold outline-none shadow-inner"
                              />
                            </div>
                          );
                        })()}

                        {isRankCumulative ? (
                          <div className="mt-3 space-y-4">
                            <div>
                              <label className="text-xs text-blue-400 font-bold block mb-1.5">Rank hiện tại của bạn</label>
                              <select
                                value={boostCurrentPoints}
                                onChange={(e) => {
                                  setBoostCurrentPoints(e.target.value);
                                  if (boostTargetPoints !== '' && parseInt(boostTargetPoints) <= parseInt(e.target.value)) {
                                    setBoostTargetPoints('');
                                  }
                                }}
                                className="w-full p-2.5 bg-[#0B1120] border border-blue-500/50 rounded-lg text-blue-400 font-bold outline-none shadow-inner text-sm cursor-pointer"
                              >
                                <option value="">-- Chọn rank hiện tại --</option>
                                {boostingModalData.rankOptions.slice(0, -1).map((opt, idx) => (
                                  <option key={idx} value={opt.points}>{opt.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-rose-400 font-bold block mb-1.5">Rank mong muốn</label>
                              <select
                                value={boostTargetPoints}
                                onChange={(e) => setBoostTargetPoints(e.target.value)}
                                disabled={boostCurrentPoints === ''}
                                className="w-full p-2.5 bg-[#0B1120] border border-rose-500/50 rounded-lg text-rose-400 font-bold outline-none shadow-inner text-sm cursor-pointer disabled:opacity-50"
                              >
                                <option value="">-- Chọn rank mong muốn --</option>
                                {boostingModalData.rankOptions.map((opt, idx) => {
                                  if (boostCurrentPoints !== '' && opt.points <= parseInt(boostCurrentPoints)) return null;
                                  return <option key={idx} value={opt.points}>{opt.name}</option>;
                                })}
                              </select>
                            </div>
                            {pointsError && (
                              <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1"><AlertCircle size={12} /> {pointsError}</p>
                            )}
                          </div>
                        ) : isPointBased ? (
                          <div className="mt-3 space-y-4">
                            <div>
                              <label className="text-xs text-blue-400 font-bold block mb-1.5">Điểm hiện tại của bạn</label>
                              <input
                                type="number" min="0" value={boostCurrentPoints}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value) || 0;
                                  setBoostCurrentPoints(val > 0 ? val.toString() : '');
                                }}
                                placeholder="Nhập số điểm hiện tại của bạn..."
                                className="w-full p-2.5 bg-[#0B1120] border border-blue-500/50 rounded-lg text-blue-400 font-bold outline-none shadow-inner text-sm"
                              />
                              {boostCurrentPoints && parseInt(boostCurrentPoints) > 0 && (
                                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                                  <Target size={12} className="text-emerald-400" /> Hệ thống nhận diện: <span className="text-emerald-400 font-bold">{getRankByPoints(parseInt(boostCurrentPoints), boostingModalData.rankOptions)}</span>
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-rose-400 font-bold block mb-1.5">Điểm muốn đạt</label>
                                <input
                                  type="number" min="0" value={boostTargetPoints}
                                  onChange={(e) => {
                                    let val = parseInt(e.target.value) || 0;
                                    setBoostTargetPoints(val > 0 ? val.toString() : '');
                                    setBoostTargetRank(getRankByPoints(val, boostingModalData.rankOptions));
                                  }}
                                  placeholder="Nhập số điểm muốn đạt..."
                                  className="w-full p-2.5 bg-[#0B1120] border border-rose-500/50 rounded-lg text-rose-400 font-bold outline-none shadow-inner text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-rose-400 font-bold block mb-1.5">Hoặc Rank muốn đạt</label>
                                <select
                                  value={boostTargetRank}
                                  onChange={(e) => {
                                    const rankName = e.target.value;
                                    setBoostTargetRank(rankName);
                                    const matchedTier = boostingModalData.rankOptions.find(t => t.name === rankName || t.rank === rankName);
                                    if (matchedTier) setBoostTargetPoints(matchedTier.points.toString());
                                  }}
                                  className="w-full p-2.5 bg-[#0B1120] border border-rose-500/50 rounded-lg text-rose-400 font-bold outline-none shadow-inner text-sm"
                                >
                                  <option value="">Chọn Rank</option>
                                  {boostingModalData.rankOptions && boostingModalData.rankOptions.map(tier => (
                                    <option key={tier.name || tier.rank} value={tier.name || tier.rank}>{(tier.name || tier.rank)} ({tier.points})</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {pointsError && (
                              <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1"><AlertCircle size={12} /> {pointsError}</p>
                            )}
                          </div>
                        ) : (
                          <>
                            {hasOptions && (
                              <div className="mt-3">
                                <label className="text-xs text-blue-400 font-bold block mb-1">Rank hiện tại của bạn:</label>
                                <select
                                  value={selectedBoostRank}
                                  onChange={(e) => { const idx = parseInt(e.target.value); setSelectedBoostRank(idx); const opt = boostingModalData.rankOptions[idx]; setBoostSubTier(opt?.inputType === 'bac' && (opt?.tierCount || 1) > 1 ? toRoman(opt?.tierCount || 1) : ''); setBoostCurrentPoints(''); }}
                                  className="w-full p-2.5 bg-[#0B1120] border border-blue-500/50 rounded-lg text-white outline-none font-bold text-sm cursor-pointer shadow-inner"
                                >
                                  {boostingModalData.rankOptions && boostingModalData.rankOptions.map((opt, idx) => (
                                    <option key={idx} value={idx}>{opt.rank}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* --- KHU VỰC NHẬP BẬC HOẶC ĐIỂM --- */}
                            {hasOptions && currentOption && (
                              <div className="mt-3">
                                {optionInputType === 'bac' ? (
                                  optTierCount > 1 ? (
                                    <div>
                                      <label className="text-xs text-slate-400 font-bold block mb-1">Đang ở bậc nào?</label>
                                      <div className="flex gap-1.5 flex-wrap">
                                        {tierList.map(tier => (
                                          <button
                                            key={tier}
                                            type="button"
                                            onClick={() => setBoostSubTier(tier)}
                                            className={`flex-1 min-w-[40px] py-2 rounded-lg text-xs font-black transition-all border ${boostSubTier === tier
                                              ? (tier === toRoman(optTierCount) ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30' : 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30')
                                              : 'bg-[#0B1120] text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                          >
                                            {tier}
                                          </button>
                                        ))}
                                      </div>
                                      {boostSubTier === toRoman(optTierCount) && (
                                        <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                                          <Sparkles size={12} /> Bậc {toRoman(optTierCount)} → Áp dụng giá trọn gói (combo)
                                        </p>
                                      )}
                                      {boostSubTier && boostSubTier !== toRoman(optTierCount) && (
                                        <p className="text-[10px] text-blue-400 mt-1.5">
                                          Bậc {boostSubTier} → Cần cày {({ 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 })[boostSubTier] || '?'} bậc, tính giá bậc lẻ
                                        </p>
                                      )}
                                    </div>
                                  ) : null
                                ) : (
                                  <div>
                                    <label className="text-xs text-emerald-400 font-bold block mb-1.5">Điểm hiện tại của bạn</label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={boostCurrentPoints}
                                      onChange={(e) => {
                                        let val = parseInt(e.target.value) || 0;
                                        setBoostCurrentPoints(val > 0 ? val.toString() : '');
                                      }}
                                      placeholder={basePoints > 0 ? `Từ ${new Intl.NumberFormat('vi-VN').format(basePoints)} đến ${new Intl.NumberFormat('vi-VN').format(absoluteMaxPoints)}` : 'Nhập số điểm bạn đang có...'}
                                      className={`w-full p-2.5 bg-[#0B1120] border rounded-lg font-bold outline-none shadow-inner text-sm ${pointsError ? 'border-rose-500 text-rose-400' : 'border-emerald-500/50 text-emerald-400 focus:border-emerald-400'}`}
                                    />
                                    {pointsError && (
                                      <p className="text-[10px] text-rose-400 mt-1.5 flex items-center gap-1 font-bold">
                                        <AlertCircle size={12} /> {pointsError}
                                      </p>
                                    )}
                                    {!pointsError && boostCurrentPoints && parseInt(boostCurrentPoints) > 0 && absoluteMaxPoints > 0 && (
                                      <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                                        <Target size={12} /> Còn <span className="font-bold text-white mx-0.5">{new Intl.NumberFormat('vi-VN').format(Math.max(0, absoluteMaxPoints - (parseInt(boostCurrentPoints) || 0)))}</span> điểm cần cày → Đích: <span className="font-bold text-yellow-400 ml-0.5">{new Intl.NumberFormat('vi-VN').format(absoluteMaxPoints)}</span>
                                      </p>
                                    )}
                                    {!pointsError && (!boostCurrentPoints || parseInt(boostCurrentPoints) === 0) && (
                                      <p className="text-[10px] text-yellow-400 mt-1.5 flex items-center gap-1">
                                        <AlertCircle size={12} /> Vui lòng nhập điểm hiện tại để tính phí {absoluteMaxPoints > 0 && <span className="text-slate-500">(Đích tối đa: {new Intl.NumberFormat('vi-VN').format(absoluteMaxPoints)} điểm)</span>}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        <div className="mt-3 border-t border-blue-500/20 pt-3">
                          {optionInputType === 'diem' && <p className="text-slate-300 flex items-center gap-2 text-base mb-2">Đơn giá: <strong className="text-emerald-400 text-2xl">{new Intl.NumberFormat('vi-VN').format(perUnitPrice)}đ/điểm</strong></p>}
                          <p className="text-slate-300 flex items-center gap-2 text-base">Phí thanh toán: <strong className="text-rose-500 text-2xl">{new Intl.NumberFormat('vi-VN').format(activePrice)}đ</strong> {priceLabel && <span className="text-xs text-slate-500">{priceLabel}</span>}</p>
                        </div>
                      </div>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!currentUser.is_email_verified) return showToast("Vui lòng vào mục Cá nhân để xác thực Email trước khi thanh toán!", "error");
                        if (isGlobalProcessing) return;
                        if (activePrice <= 0) { showToast('Phí thanh toán không hợp lệ (0đ). Vui lòng kiểm tra lại thông tin điểm hoặc bậc.', 'error'); return; }
                        setIsGlobalProcessing(true);
                        try {
                          const loginMethod = e.target.loginMethod ? e.target.loginMethod.value : 'Không Cần';
                          const username = e.target.username ? e.target.username.value : (e.target.eventCode ? e.target.eventCode.value : '');
                          const password = e.target.password ? e.target.password.value : 'Bảo Mật Bằng Mã';
                          const note = e.target.note ? e.target.note.value : '';

                          const targetModal = boostingModalData;
                          setBoostingModalData(null);

                          if (currentUser.balance < activePrice) {
                            showToast("Số dư không đủ! Vui lòng nạp thêm tiền.", 'error');
                            setCurrentView('naptien');
                            return;
                          }

                          const reqId = `BST${Date.now()}`;
                          const newBalance = currentUser.balance - activePrice;

                          let packageTitle = targetModal.title;
                          const targetPts = titleTargetPoints || maxPoints || 0;
                          if (isRankCumulative) {
                            const cPts = parseInt(boostCurrentPoints);
                            const tPts = parseInt(boostTargetPoints);
                            if (!isNaN(cPts) && !isNaN(tPts)) {
                              const fromRank = getRankByPoints(cPts, boostingModalData.rankOptions);
                              const toRank = getRankByPoints(tPts, boostingModalData.rankOptions);
                              packageTitle = `${targetModal.title} [${fromRank} -> ${toRank}]`;
                            }
                          } else if (isPointBased) {
                            const cPts = parseInt(boostCurrentPoints) || 0;
                            const tPts = parseInt(boostTargetPoints) || 0;
                            packageTitle = `${targetModal.title} [${cPts} điểm -> ${tPts} điểm]`;
                          } else if (hasOptions && currentOption) {
                            const rankDetail = optionInputType === 'bac'
                              ? `Bậc ${boostSubTier}${boostSubTier === 'V' ? ' (Combo)' : ''}`
                              : (boostCurrentPoints && parseInt(boostCurrentPoints) > 0
                                ? `${boostCurrentPoints} điểm → ${new Intl.NumberFormat('vi-VN').format(targetPts)} điểm`
                                : 'Combo');
                            packageTitle = `${targetModal.title} [${rankDetail}]`;
                          }

                          if (targetModal.allow_quantity && boostQuantity > 1) {
                            packageTitle += ` (x${boostQuantity})`;
                          }

                          const newTx = {
                            id: `TX${Date.now()}`,
                            user: currentUser.name,
                            action: `Đặt cày thuê: ${packageTitle}`,
                            amount: activePrice,
                            date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                            status: 'Thành công',
                            type: 'boost',
                            accDetails: {
                              balanceAfter: newBalance,
                              fundAfter: currentUser.rentFund || 0
                            }
                          };

                          // GỌI RPC TRỪ TIỀN VÀ GHI LỊCH SỬ AN TOÀN
                          const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_client_spend', {
                            p_amount: activePrice,
                            p_fund_amount: 0,
                            p_tx_data: newTx
                          });

                          if (rpcError || !rpcData?.success) {
                            return showToast(rpcError?.message || rpcData?.message || 'Lỗi thanh toán cày thuê!', 'error');
                          }

                          const dbPayload = {
                            id: reqId,
                            user: currentUser.name,
                            boostingId: targetModal.id,
                            boostingTitle: packageTitle,
                            date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                            status: 'Chờ xử lý',
                            info: JSON.stringify({ loginMethod, username, password, note, amount: activePrice, quantity: targetModal.allow_quantity ? boostQuantity : 1 })
                          };

                          const { error: insertErr } = await supabase.from('boosting_requests').insert([dbPayload]);
                          if (insertErr) {
                            showToast("Lỗi Database: " + insertErr.message, "error");
                            return;
                          }

                          const newBoostReq = {
                            ...dbPayload,
                            info: { loginMethod, username, password, note, amount: activePrice, quantity: targetModal.allow_quantity ? boostQuantity : 1 }
                          };
                          const updatedUser = { ...currentUser, balance: newBalance };
                          setCurrentUser(updatedUser);
                          localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
                          setUsersDb(usersDb.map(u => u.id === currentUser?.id ? updatedUser : u));

                          setTransactionsDb([newTx, ...transactionsDb]);
                          setBoostingRequests([newBoostReq, ...boostingRequests]);

                          showToast("Đặt đơn thành công! Admin sẽ sớm xử lý.");
                          sendAdminAlert('ĐẶT CÀY THUÊ', `Khách ${currentUser.name} vừa đặt đơn: ${packageTitle}.`);
                          setHistoryTab('boost');
                          setCurrentView('lichsu');
                        } finally { setIsGlobalProcessing(false); }
                      }}>
                        <div className="space-y-4">
                          {boostingModalData.type === 'event' && boostingModalData.require_login === false ? (
                            <div>
                              <label className="text-xs font-bold text-emerald-400 block mb-1">Nhập Mã Sự Kiện / Link Liên Kết</label>
                              <input name="eventCode" type="text" placeholder="Nhập mã sự kiện hoặc link liên kết..." className="w-full p-3 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-mono outline-none focus:border-emerald-400 shadow-inner" required />
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="text-xs font-bold text-slate-400 block mb-1">Hình thức đăng nhập</label>
                                <select name="loginMethod" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500">
                                  <option value="Garena">Garena</option>
                                  <option value="Facebook">Facebook</option>
                                  <option value="Zing">Zing</option>
                                  <option value="Icloud">Icloud</option>
                                  <option value="Google">Google (Cần hỗ trợ mã)</option>
                                  <option value="Khác">Khác</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-bold text-slate-400 block mb-1">Tài khoản</label>
                                  <input name="username" type="text" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white font-mono outline-none focus:border-blue-500" required />
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-slate-400 block mb-1">Mật khẩu</label>
                                  <input name="password" type="text" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white font-mono outline-none focus:border-blue-500" required />
                                </div>
                              </div>
                            </>
                          )}
                          <div>
                            <label className="text-xs font-bold text-slate-400 block mb-1">Ghi chú (Không bắt buộc)</label>
                            <input name="note" type="text" placeholder="Ghi chú thêm cho Admin..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
                          </div>
                        </div>
                        <button type="submit" disabled={isGlobalProcessing} className={`w-full mt-6 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg ${isGlobalProcessing ? 'bg-slate-600 cursor-not-allowed opacity-70' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'}`}>
                          {isGlobalProcessing ? (
                            <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Đang xử lý...</>
                          ) : (
                            <>Thanh toán {new Intl.NumberFormat('vi-VN').format(activePrice)}đ</>
                          )}
                        </button>
                      </form>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
        {/* Modal Hoá Đơn Mua Thành Công */}
        {successTxData && successTxData.type === 'buy' && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-emerald-500 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)] transform transition-all scale-100">
              <div className="bg-emerald-500/10 p-6 text-center border-b border-emerald-500/20 relative">
                <button onClick={() => { setSuccessTxData(null); setCurrentView('lichsu') }} className="absolute top-4 right-4 text-emerald-500 hover:text-emerald-400"><X size={20} /></button>
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30"><Check size={40} className="text-white" /></div>
                <h3 className="text-2xl font-black text-emerald-400 uppercase">Mua Thành Công!</h3>
                <p className="text-sm text-slate-400 mt-1 font-bold">Nick mã #{successTxData.acc.code}</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-300 mb-4 text-center">Thông tin đăng nhập Game của bạn:</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1 flex justify-between">Tài khoản <span className="text-[10px] font-normal italic text-slate-600">(Chạm để copy)</span></p>
                    <div className="flex">
                      <input readOnly value={successTxData.acc.accUsername} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-l-lg text-white font-mono outline-none text-base" />
                      <button onClick={() => copyToClipboard(successTxData.acc.accUsername)} className="bg-slate-700 px-5 rounded-r-lg hover:bg-slate-600 text-white transition-colors font-bold"><Copy size={18} /></button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1 flex justify-between">Mật khẩu <span className="text-[10px] font-normal italic text-slate-600">(Chạm để copy)</span></p>
                    <div className="flex">
                      <input readOnly value={successTxData.acc.accPassword} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-l-lg text-white font-mono outline-none text-base" />
                      <button onClick={() => copyToClipboard(successTxData.acc.accPassword)} className="bg-slate-700 px-5 rounded-r-lg hover:bg-slate-600 text-white transition-colors font-bold"><Copy size={18} /></button>
                    </div>
                  </div>
                </div>
                {copiedText && <p className="text-emerald-400 text-xs font-bold text-center mt-4 animate-pulse">Đã copy vào khay nhớ tạm!</p>}
                <button onClick={() => { setSuccessTxData(null); setCurrentView('lichsu') }} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl mt-6 transition-colors shadow-lg">Xem chi tiết trong Lịch Sử</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Danh sách bình luận bị báo cáo */}
        {showReportedCommentsModal && currentUser?.role === 'admin' && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#151D2F] border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-fade-in">
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={20} /> Bình luận bị báo cáo
                </h3>
                <button onClick={() => setShowReportedCommentsModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {commentsDb.filter(c => c.reported_by?.length > 0).length === 0 ? (
                  <p className="text-center text-slate-500 py-10 font-bold">Không có bình luận nào bị báo cáo.</p>
                ) : (
                  commentsDb.filter(c => c.reported_by?.length > 0).map(comment => (
                    <div key={comment.id} className="bg-[#0B1120] border border-rose-500/30 rounded-xl p-4 shadow-lg shadow-rose-500/5">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-800">
                        <img src={comment.users?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.users?.name || 'K')}&background=151D2F&color=fff`} className="w-10 h-10 rounded-full border border-slate-700 object-cover" alt="avatar" />
                        <div>
                          <p className="text-sm font-bold text-white">{comment.users?.name || 'Khách'} <span className="text-slate-500 font-normal text-[10px] ml-2">{new Date(comment.created_at).toLocaleString('vi-VN')}</span></p>
                          <p className="text-xs text-rose-400 mt-0.5 font-bold flex items-center gap-1"><AlertTriangle size={12} /> Bị báo cáo bởi {comment.reported_by.length} người</p>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => handleResolveReport(comment.id, 'keep')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors">Bỏ qua báo cáo</button>
                        <button onClick={() => handleResolveReport(comment.id, 'delete')} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-rose-600/20 transition-colors flex items-center gap-2"><Trash2 size={16} /> Xóa bình luận</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- GLOBAL PROCESSING OVERLAY (HIỆN TIẾN ĐỘ TẢI ẢNH) --- */}
        {isGlobalProcessing && globalProgressText && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0B1120] border border-blue-500/30 p-8 rounded-2xl flex flex-col items-center gap-5 shadow-[0_0_50px_rgba(37,99,235,0.2)] max-w-sm w-full mx-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                <RefreshCw size={48} className="text-blue-500 animate-spin relative z-10" />
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-1">{globalProgressText}</p>
                <p className="text-xs text-slate-400">Vui lòng không đóng cửa sổ trong lúc này</p>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2 relative">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-emerald-400 animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* --- COMPONENT LIÊN HỆ GÓC DƯỚI --- */}
        {currentView !== 'admin' && (
          <FloatingContact
            currentUser={currentUser}
            unreadCount={unreadCount}
            isAdminOnline={usersDb.some(u => u.role === 'admin' && getActiveStatus(u.last_active).isOnline)}
            onOpenInbox={() => {
              if (currentUser?.role === 'admin') {
                setCurrentView('admin');
                setAdminTab('messages');
              } else {
                setCurrentView('security');
                setProfileTab('inbox');
              }
            }}
          />
        )}

        {/* --- DÀN LOA VÒNG QUAY SIÊU ĐƠN GIẢN CHỐNG LỖI --- */}
        <audio id="spinSound" src="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3" preload="auto" loop></audio>
        <audio id="winSound" src="https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3" preload="auto"></audio>
        <audio id="loseSound" src="https://assets.mixkit.co/active_storage/sfx/3148/3148-preview.mp3" preload="auto"></audio>
        {/* ----------------------------------------------- */}

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.8); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes zoom-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in-left {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes blink-1 {
          0%, 100% { opacity: 1; filter: brightness(1.5); }
          50% { opacity: 0.2; filter: brightness(0.5); }
        }
        @keyframes blink-2 {
          0%, 100% { opacity: 0.2; filter: brightness(0.5); }
          50% { opacity: 1; filter: brightness(1.5); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .animate-zoom-in { animation: zoom-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-confetti { animation: confetti linear forwards; }
        .animate-blink-1 { animation: blink-1 0.5s infinite; }
        .animate-blink-2 { animation: blink-2 0.5s infinite; }
        @keyframes rotate360 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.4; filter: blur(40px); } 50% { opacity: 0.8; filter: blur(60px); } }
        @keyframes float { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(10px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(15px) translateX(-15px); } }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 6s ease-in-out infinite 1s; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .pause {
          animation-play-state: paused !important;
        }
      `}} />
    </>
  );
};

export default App;