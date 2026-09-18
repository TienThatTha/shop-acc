import React, { useState, useEffect, useRef, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import {
  User, Lock, Phone, Mail, ShieldCheck, ArrowRight, CheckCircle2,
  LogOut, Key, Wallet, Search, Gamepad2, X, Menu, Clock, Flame,
  Settings, Edit, Trash2, PlusCircle, Image as ImageIcon,
  History, Target, Gift, Save, Upload, Plus, Unlock, QrCode,
  Download, Copy, Check, AlertCircle, RefreshCw, ChevronDown, ChevronUp, ZoomIn,
  Sparkles, TrendingUp, Users, Ticket, Settings2, MessageCircle, Send, Eye, EyeOff,
  ArrowLeftRight, RotateCcw, MoreVertical, AlertTriangle, ArrowLeft, Loader2, Swords, Crown, Zap, Shield, Gem, Package, Link, BarChart2
} from 'lucide-react';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';

const getRecordTime = (item) => {
  if (item.created_at) return new Date(item.created_at).getTime();
  if (item.date) {
    const dStr = item.date;
    let d = 0;
    const p1 = dStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const p2 = dStr.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/);
    if (p1 && p2) d = new Date(`${p1[3]}-${p1[2].padStart(2, '0')}-${p1[1].padStart(2, '0')}T${p2[1].padStart(2, '0')}:${p2[2].padStart(2, '0')}:${p2[3].padStart(2, '0')}`).getTime();
    if (d > 0 && !isNaN(d)) return d;
  }
  if (item.id) {
    const num = parseInt(String(item.id).replace(/\D/g, ''));
    if (!isNaN(num) && num > 1000000000000) return num;
  }
  return 0;
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


const BOSS_GAME_PACKAGES = [
  {
    id: 'pack_1',
    name: 'Gói 1: Tân Thủ Khởi Đầu',
    price: 20000,
    badge: 'Tân Thủ',
    badgeColor: 'from-emerald-500 to-teal-500',
    coins: 200,
    royalChests: 2,
    attacks: 2000,
    extraDesc: '200 Xu + 2 Rương Hoàng Kim + 2.000 Lượt Đánh',
    image: '/game-assets/royal_chest.png',
    items: []
  },
  {
    id: 'pack_2',
    name: 'Gói 2: Dũng Sĩ Chiến Trường',
    price: 50000,
    badge: 'Phổ Biến',
    badgeColor: 'from-blue-500 to-cyan-500',
    coins: 500,
    royalChests: 5,
    attacks: 5000,
    extraDesc: '500 Xu + 5 Rương Hoàng Kim + 5.000 Lượt Đánh',
    image: '/game-assets/royal_chest.png',
    items: []
  },
  {
    id: 'pack_3',
    name: 'Gói 3: Chiến Tướng Oai Vệ',
    price: 100000,
    badge: 'Bán Chạy',
    badgeColor: 'from-indigo-500 to-purple-500',
    coins: 1000,
    royalChests: 10,
    attacks: 10000,
    extraDesc: '1.000 Xu + 10 Rương Hoàng Kim + 10.000 Lượt Đánh',
    image: '/game-assets/royal_chest.png',
    items: []
  },
  {
    id: 'pack_4',
    name: 'Gói 4: Thần Tướng Trảm Yêu',
    price: 200000,
    badge: 'Siêu Cấp',
    badgeColor: 'from-purple-500 to-pink-500',
    coins: 2000,
    royalChests: 20,
    attacks: 20000,
    extraDesc: '2.000 Xu + 20 Rương Hoàng Kim + 20.000 Lượt Đánh',
    image: '/game-assets/royal_chest.png',
    items: []
  },
  {
    id: 'pack_5',
    name: 'Gói 5: Đại Hiệp Xuất Chúng',
    price: 500000,
    badge: 'Khuyến Mãi +20%',
    badgeColor: 'from-amber-500 to-orange-500',
    coins: 6000,
    royalChests: 60,
    attacks: 60000,
    extraDesc: '6.000 Xu Game VIP + 60 Rương Hoàng Kim + 60.000 Lượt Đánh (KM +20%)',
    image: '/game-assets/royal_chest.png',
    items: []
  },
  {
    id: 'pack_6',
    name: 'Gói 6: Ma Vương Diệt Thế',
    price: 1000000,
    badge: 'Khuyến Mãi +30%',
    badgeColor: 'from-rose-500 to-red-600',
    coins: 13000,
    royalChests: 130,
    attacks: 130000,
    extraDesc: '13.000 Xu Game VIP + 130 Rương Hoàng Kim + 130.000 Lượt Đánh (KM +30%)',
    image: '/game-assets/royal_chest.png',
    items: []
  },
  {
    id: 'pack_7',
    name: 'Gói 7: Cổ Đại Tôn Giả',
    price: 1500000,
    badge: 'KM +35% & Nhẫn 5⭐',
    badgeColor: 'from-emerald-400 to-green-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    coins: 20000,
    royalChests: 200,
    attacks: 200000,
    extraDesc: '20.000 Xu + 200 Rương HK + 200.000 Lượt + 💥 1x Nhẫn Cổ Đại 5⭐',
    image: '/game-assets/ring_codai.png',
    items: [
      {
        id: 'ring_chaos',
        name: 'Nhẫn Thần Long Chaos',
        category: 'ring',
        tier: 'Cổ Đại',
        stars: 5,
        base_dmg_percent: 80,
        skill_pct: 40.0,
        color: '#00ffaa',
        image: 'ring_codai.png',
        sub_stats: ['⚡ +25% Sát Thương Long Tộc'],
        quantity: 1
      }
    ]
  },
  {
    id: 'pack_8',
    name: 'Gói 8: Thượng Cổ Chí Tôn',
    price: 2500000,
    badge: '👑 VIP +50% & Nhẫn 1⭐',
    badgeColor: 'from-yellow-400 via-amber-500 to-red-600 shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse',
    coins: 37500,
    royalChests: 375,
    attacks: 375000,
    extraDesc: '37.500 Xu + 375 Rương HK + 375.000 Lượt + 🌌 1x Nhẫn Thượng Cổ 1⭐',
    image: '/game-assets/ring_thuongco.png',
    items: [
      {
        id: 'ring_prim',
        name: 'Bát Hoang Thần Giới Vô Cực',
        category: 'ring',
        tier: 'Thượng Cổ',
        stars: 1,
        base_dmg_percent: 150,
        skill_pct: 50.0,
        color: '#ff0055',
        image: 'ring_thuongco.png',
        sub_stats: ['🌌 +50% Sát Thương Vô Cực', '👑 +35% Lực Chiến CP Tổng'],
        quantity: 1
      }
    ]
  }
];

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

const getActiveStatus = (lastActiveTime) => {
  if (!lastActiveTime) return { text: 'Ngoại tuyến', isOnline: false };
  const diffInMinutes = Math.floor((new Date() - new Date(lastActiveTime)) / 60000);
  if (diffInMinutes < 3) return { text: 'Đang trực tuyến', isOnline: true };
  if (diffInMinutes < 60) return { text: `${diffInMinutes} phút trước`, isOnline: false };
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return { text: `${diffInHours} giờ trước`, isOnline: false };
  const diffInDays = Math.floor(diffInHours / 24);
  return { text: `${diffInDays} ngày trước`, isOnline: false };
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

// HÀM XỬ LÝ SĐT (CHỈ CHO NHẬP SỐ)
const enforceNumberInput = (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
};

let isProcessingAction = false;

// --- TÍCH HỢP IMGBB TỰ ĐỘNG ---
const IMGBB_API_KEY = '129f0f9c5449d2dc93e7cc00b153eeab';

const uploadToImgBB = async (base64String) => {
  if (!base64String || !base64String.startsWith('data:image')) return base64String;
  try {
    const base64Data = base64String.split(',')[1];
    const formData = new FormData();
    formData.append('image', base64Data);

    // Yêu cầu Fetch Upload ImgBB
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      console.error("Lỗi ImgBB:", data);
      throw new Error(data.error?.message || "Không thể upload ảnh lên máy chủ ImgBB");
    }
  } catch (err) {
    console.error("Lỗi upload ảnh:", err);
    throw err;
  }
};

const getCustomerFriendlyError = (details) => {
  if (!details) return null;
  const match = details.match(/^\[(.*?)\]/);
  if (!match) return null;
  const errorMsg = match[1].toLowerCase();

  const allowedErrors = [
    'được sử dụng',
    'sai mệnh giá',
    'sai mã số seri',
    'không tồn tại',
    'sai định dạng',
    'không hợp lệ'
  ];

  if (allowedErrors.some(allowed => errorMsg.includes(allowed))) {
    return match[1]; // Trả về chính xác câu lỗi từ API (ko thêm chữ Lỗi)
  }
  return null;
};

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
      onClick={() => setFullScreenImage(currentImage)}
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

const App = () => {

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


  // --- STATE CHO GAME MỘNG THIÊN HUYỄN & LIÊN KẾT TÀI KHOẢN ---
  const [bossTargetId, setBossTargetId] = useState('');
  const [bossPlayerSummary, setBossPlayerSummary] = useState(null);
  const [bossPlayerNotFound, setBossPlayerNotFound] = useState(false);
  const [bossNotFoundQuery, setBossNotFoundQuery] = useState('');
  const [showBossProfileModal, setShowBossProfileModal] = useState(false);
  const [showBossStatModal, setShowBossStatModal] = useState(false);
  const [isCheckingBossPlayer, setIsCheckingBossPlayer] = useState(false);
  const [selectedBossPackage, setSelectedBossPackage] = useState(null);
  const [isBuyingBossPackage, setIsBuyingBossPackage] = useState(false);
  const [bossSuccessModal, setBossSuccessModal] = useState(null);

  // --- STATE LIÊN KẾT OTP & TÚI ĐỒ (INVENTORY) ---
  const [showLinkOtpModal, setShowLinkOtpModal] = useState(false);
  const [linkOtpCode, setLinkOtpCode] = useState('');
  const [linkOtpExpiresAt, setLinkOtpExpiresAt] = useState(null);
  const [linkOtpCountdown, setLinkOtpCountdown] = useState(120);
  const [isWaitingOtp, setIsWaitingOtp] = useState(false);
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [showBagModal, setShowBagModal] = useState(false);
  const [activeBagCategory, setActiveBagCategory] = useState('all');
  const [isPerformingBagAction, setIsPerformingBagAction] = useState(false);
  const [bagActionLoadingItem, setBagActionLoadingItem] = useState(null);

  // --- STATE ITEM HOVER / INSPECT TOOLTIP ---
  const [activeItemTooltip, setActiveItemTooltip] = useState(null);
  const hideTooltipTimerRef = useRef(null);

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

  useEffect(() => {
    if (bossTargetId) {
      localStorage.setItem('shop_boss_target_id', bossTargetId);
    }
  }, [bossTargetId]);

  const [usersDb, setUsersDb] = useState(() => { try { const saved = localStorage.getItem('shop_users_db'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [visitorCount, setVisitorCount] = useState(0);
  const [accountsDb, setAccountsDb] = useState(() => {
    const saved = localStorage.getItem('shop_accounts_db');
    return saved ? JSON.parse(saved) : [];
  });
  // Tự động nhớ vị trí màn hình hiện tại
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('shop_current_view') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('shop_current_view', currentView);
    setViewingAcc(null); // Tự động đóng modal xem chi tiết nick khi chuyển tab/trang khác
  }, [currentView]);
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
  // State cho Hộp quà vòng quay
  const [giftModalData, setGiftModalData] = useState(null);
  const [isGiftOpened, setIsGiftOpened] = useState(false);

  // --- CÁC STATE CỦA VÒNG QUAY ---
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [playMode, setPlayMode] = useState('money');

  // --- CẤU HÌNH ---
  const [depositBonusConfig, setDepositBonusConfig] = useState({
    minAmount: 50000,
    bonusSpins: 1
  });
  const [vouchersDb, setVouchersDb] = useState([]);
  const [adminSearchUser, setAdminSearchUser] = useState('');
  const [historyTab, setHistoryTab] = useState(() => localStorage.getItem('shop_history_tab') || 'buy'); // Quản lý Tab đang mở
  useEffect(() => { localStorage.setItem('shop_history_tab', historyTab); }, [historyTab]);
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(5); // Số lượng hiển thị mỗi lần cuộn
  const [visibleUsersCount, setVisibleUsersCount] = useState(8); // Ban đầu chỉ hiện 10 user
  const [visibleDepsClient, setVisibleDepsClient] = useState(5); // Nạp tiền (Khách)
  const [visibleDepsAdmin, setVisibleDepsAdmin] = useState(5);   // Nạp tiền (Admin)
  const [visibleRentsAdmin, setVisibleRentsAdmin] = useState(5); // Thuê nick (Admin)
  const [visibleSpinsClient, setVisibleSpinsClient] = useState(6); // Vòng quay (Khách)
  const [visibleSpinsAdmin, setVisibleSpinsAdmin] = useState(5);   // Vòng quay (Admin)
  const [adminMessageSearch, setAdminMessageSearch] = useState('');
  const [wheelConfig, setWheelConfig] = useState({ moneyCost: 20000, spinCost: 1 });



  const [transactionsDb, setTransactionsDb] = useState(() => { const saved = localStorage.getItem('shop_tx_db'); return saved ? JSON.parse(saved) : []; });
  const [depositRequests, setDepositRequests] = useState(() => { const saved = localStorage.getItem('shop_dep_db'); return saved ? JSON.parse(saved) : []; });
  const [rentRequests, setRentRequests] = useState(() => { const saved = localStorage.getItem('shop_rent_db'); return saved ? JSON.parse(saved) : []; });
  const [boostingRequests, setBoostingRequests] = useState(() => { const saved = localStorage.getItem('shop_boost_db'); return saved ? JSON.parse(saved) : []; });
  const [approveDepositModal, setApproveDepositModal] = useState(null);

  const [messagesDb, setMessagesDb] = useState(() => { try { const saved = localStorage.getItem('shop_msg_db'); return saved ? JSON.parse(saved) : [{ id: 1, senderId: 2, receiverId: 1, content: 'Chào bạn, chúc bạn mua sắm vui vẻ tại hệ thống!', timestamp: Date.now() - 3600000, isRead: false }]; } catch (e) { return [{ id: 1, senderId: 2, receiverId: 1, content: 'Chào bạn, chúc bạn mua sắm vui vẻ tại hệ thống!', timestamp: Date.now() - 3600000, isRead: false }]; } });

  const [boostingDb, setBoostingDb] = useState(() => {
    const saved = localStorage.getItem('shop_boosting_db');
    return saved ? JSON.parse(saved) : [];
  });

  const [wheelItemsMoneyDb, setWheelItemsMoneyDb] = useState(() => { try { const saved = localStorage.getItem('shop_wheel_money'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [wheelItemsSpinDb, setWheelItemsSpinDb] = useState(() => { try { const saved = localStorage.getItem('shop_wheel_spin'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });

  // Tự động kiểm tra xem Vòng Quay có phần thưởng khả dụng nào không
  const hasActiveWheelRewards = useMemo(() => {
    const allItems = [...(wheelItemsMoneyDb || []), ...(wheelItemsSpinDb || [])];
    return allItems.length > 0 && allItems.some(item => item && (item.quantity === undefined || item.quantity === null || item.quantity > 0));
  }, [wheelItemsMoneyDb, wheelItemsSpinDb]);

  useEffect(() => {
    if (currentView === 'vongquay' && !hasActiveWheelRewards) {
      setCurrentView('dashboard');
    }
  }, [currentView, hasActiveWheelRewards]);

  // --- LIFTED STATES TỪ CÁC TAB ĐỂ TRÁNH MẤT FOCUS KHI COMPONENT RENDER LẠI ---
  const [profileTab, setProfileTab] = useState('info');
  const messagesEndRef = useRef(null);

  const [depositStep, setDepositStep] = useState(1);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositMethod, setDepositMethod] = useState('banking');
  const [depositAmount, setDepositAmount] = useState('');
  const [voucherInput, setVoucherInput] = useState('');
  const [pendingDeposit, setPendingDeposit] = useState(null);
  const [payosPaymentData, setPayosPaymentData] = useState(null);
  const [payosSuccess, setPayosSuccess] = useState(false);
  const [payosTimeLeft, setPayosTimeLeft] = useState(600);
  const [liveCardError, setLiveCardError] = useState(null);
  const [cardTelco, setCardTelco] = useState('VIETTEL');
  const [cardAmount, setCardAmount] = useState('10000');
  const [cardCode, setCardCode] = useState('');
  const [cardSerial, setCardSerial] = useState('');

  const [expandedTx, setExpandedTx] = useState(null);

  const [adminTab, setAdminTab] = useState(() => localStorage.getItem('shop_admin_tab') || 'users');
  useEffect(() => { localStorage.setItem('shop_admin_tab', adminTab); }, [adminTab]);
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
    } catch (e) { }
    return { name: gameStr, avatar: null, isFeatured: false, allowQuantity: false, maxQuantityPerOrder: 0 };
  };
  const [adminBoostingPriceUnit, setAdminBoostingPriceUnit] = useState('');
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [editingWheel, setEditingWheel] = useState(null);
  const [adminWheelImage, setAdminWheelImage] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [editRentModal, setEditRentModal] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const chatMessagesEndRef = useRef(null);
  const commentTextareaRef = useRef(null);

  // CCCD Preview cho form thuê
  const [kycImagePreview, setKycImagePreview] = useState(null);
  // --- ĐOẠN NÀY ĐỂ HÚT DỮ LIỆU TỪ MÁY CHỦ SUPABASE ---
  // Tự động kiểm tra mỗi khi khách chuyển trang
  // STATE: Ghi nhớ việc khách bấm "Không hiển thị lại" (Lưu trên RAM, F5 là tự reset về false)
  const [dismissNotice, setDismissNotice] = useState(false);
  const [showSpinRules, setShowSpinRules] = useState(false);
  const [dismissSpinRules, setDismissSpinRules] = useState(false);
  const [commentsDb, setCommentsDb] = useState(() => { const saved = localStorage.getItem('shop_comments_db'); return saved ? JSON.parse(saved) : []; });
  const [commentInput, setCommentInput] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [showCommentOptionsId, setShowCommentOptionsId] = useState(null);
  const [showReportedCommentsModal, setShowReportedCommentsModal] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showEditHistoryId, setShowEditHistoryId] = useState(null);

  // 1. Kích hoạt bảng Trang Chủ (Sảnh chính)
  useEffect(() => {
    if (currentView === 'dashboard' && !dismissNotice && hasActiveWheelRewards) {
      // Đợi 0.3s cho web load xong giao diện rồi mới nảy bảng lên (Tránh bị React nuốt lệnh)
      const timer = setTimeout(() => setShowSpinNotice(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowSpinNotice(false); // Chuyển sang tab khác là tự động dọn dẹp (tắt bảng)
    }
  }, [currentView, dismissNotice, hasActiveWheelRewards]);

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

      // 1. CHẠY SONG SONG CÁC TIẾN TRÌNH ĐỂ GIẢM ĐỘ TRỄ (LATENCY)
      const publicDataPromise = Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('boosting').select('*').order('id', { ascending: false }),
        supabase.from('wheel_items').select('*'),
        supabase.from('vouchers').select('*'),
        supabase.from('boosting_requests').select('*').order('id', { ascending: false }).limit(200), // Hút đơn Cày Thuê
        supabase.from('comments').select('*, users(name, avatar_url, role)').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(200)
      ]).then(([accRes, boostRes, wheelRes, voucherRes, boostReqRes, commentsRes]) => {
        if (accRes.data) {
          const fixedAccounts = accRes.data.map(acc => {
            let fixedRentOptions = acc.rentOptions;
            if (typeof fixedRentOptions === 'string') {
              try { fixedRentOptions = JSON.parse(fixedRentOptions); } catch (e) { fixedRentOptions = []; }
            }
            if (!Array.isArray(fixedRentOptions)) fixedRentOptions = [];

            let fixedDetailImages = acc.detailImages;
            if (typeof fixedDetailImages === 'string') {
              try { fixedDetailImages = JSON.parse(fixedDetailImages); } catch (e) { fixedDetailImages = []; }
            }
            if (!Array.isArray(fixedDetailImages)) fixedDetailImages = [];

            let fixedTags = acc.tags;
            if (typeof fixedTags === 'string') {
              try {
                let parsed = JSON.parse(fixedTags);
                fixedTags = Array.isArray(parsed) ? parsed : fixedTags.split(',').map(t => t.trim());
              } catch (e) {
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
          const moneyItems = wheelRes.data.filter(w => w.wheel_type === 'money');
          const spinItems = wheelRes.data.filter(w => w.wheel_type === 'spin');
          setWheelItemsMoneyDb(moneyItems);
          setWheelItemsSpinDb(spinItems);
          try { localStorage.setItem('shop_wheel_money', JSON.stringify(moneyItems)); } catch (e) { }
          try { localStorage.setItem('shop_wheel_spin', JSON.stringify(spinItems)); } catch (e) { }
        }
        if (voucherRes.data) setVouchersDb(voucherRes.data);
        if (boostReqRes.data) {
          const fixedBoostReqs = boostReqRes.data.map(r => {
            let parsedInfo = r.info;
            if (typeof parsedInfo === 'string') {
              try { parsedInfo = JSON.parse(parsedInfo); } catch (e) { parsedInfo = {}; }
            }
            return {
              ...r,
              info: parsedInfo || {},
              boostingTitle: r.boostingTitle || r.boostingtitle || '',
              boostingId: r.boostingId || r.boostingid || ''
            };
          });
          setBoostingRequests(fixedBoostReqs);
        }
        if (commentsRes && commentsRes.data) {
          setCommentsDb(commentsRes.data);
          localStorage.setItem('shop_comments_db', JSON.stringify(commentsRes.data));
        }
      });

      const configPromise = supabase.from('site_config').select('*').eq('id', 'deposit_bonus').maybeSingle().then(({ data: configData }) => {
        if (configData && configData.value) {
          setDepositBonusConfig(configData.value);
        } else {
          const savedDepositConfig = localStorage.getItem('shop_deposit_config');
          if (savedDepositConfig) setDepositBonusConfig(JSON.parse(savedDepositConfig));
        }
      });

      // 2. KIỂM TRA ĐĂNG NHẬP NGẦM & TẢI DỮ LIỆU THEO CHỨC VỤ (CHẠY SONG SONG VỚI PUBLIC DATA)
      const userDataPromise = (async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Tìm xem ai đang đăng nhập
          const { data: user } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', session.user.id).single();

          if (user && !user.is_locked) {
            // Tra cứu linked_game_id từ Supabase game_orders (OTP completed) - ưu tiên server để tránh cache sai lệch giữa các tài khoản
            let linkedGameId = null;
            try {
              const { data: completedOtp } = await supabase
                .from('game_orders')
                .select('result, user_id')
                .eq('package_id', 'account_link_otp')
                .eq('status', 'completed')
                .or(`web_user.eq."${user.name || user.id}",rewards->>web_user_id.eq."${user.id}"`)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              if (completedOtp) {
                linkedGameId = completedOtp.result?.game_user_id || completedOtp.user_id;
              }
            } catch (e) {
              console.log("OTP link lookup:", e);
            }

            if (linkedGameId) {
              localStorage.setItem(`shop_linked_game_id_${user.id}`, linkedGameId);
            } else {
              localStorage.removeItem(`shop_linked_game_id_${user.id}`);
            }
            const enrichedUser = linkedGameId ? { ...user, linked_game_id: linkedGameId } : user;
            setCurrentUser(enrichedUser);
            localStorage.setItem('shop_cached_user', JSON.stringify(enrichedUser));

            // GIẢI QUYẾT LỖI MẤT QUYỀN ADMIN (Chữ Hoa/Thường)
            const role = (user.role || 'user').toLowerCase();

            if (role === 'admin') {
              // QUYỀN ADMIN: TẢI TOÀN BỘ DATABASE VỀ PANEL
              const [usersRes, txRes, depRes, rentRes, msgRes, boostReqRes] = await Promise.all([
                supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').order('id', { ascending: false }),
                supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(300),
                supabase.from('deposit_requests').select('*').order('created_at', { ascending: false }).limit(300),
                supabase.from('rent_requests').select('*').order('created_at', { ascending: false }).limit(200),
                supabase.from('messages').select('*').order('timestamp', { ascending: true }).limit(500),
                supabase.from('boosting_requests').select('*').order('created_at', { ascending: false }).limit(200)
              ]);

              if (usersRes.data) { setUsersDb(usersRes.data); try { localStorage.setItem('shop_users_db', JSON.stringify(usersRes.data)); } catch (e) { } }
              if (txRes.data) { setTransactionsDb(txRes.data); try { localStorage.setItem('shop_tx_db', JSON.stringify(txRes.data)); } catch (e) { } }
              if (depRes.data) { setDepositRequests(depRes.data); try { localStorage.setItem('shop_dep_db', JSON.stringify(depRes.data)); } catch (e) { } }
              if (msgRes.data) { setMessagesDb(msgRes.data); try { localStorage.setItem('shop_msg_db', JSON.stringify(msgRes.data)); } catch (e) { } }
              if (boostReqRes.data) {
                const fixedBoostReqs = boostReqRes.data.map(r => {
                  let parsedInfo = r.info;
                  if (typeof parsedInfo === 'string') {
                    try { parsedInfo = JSON.parse(parsedInfo); } catch (e) { parsedInfo = {}; }
                  }
                  return {
                    ...r,
                    info: parsedInfo || {},
                    boostingTitle: r.boostingTitle || r.boostingtitle || '',
                    boostingId: r.boostingId || r.boostingid || ''
                  };
                });
                setBoostingRequests(fixedBoostReqs);
                try { localStorage.setItem('shop_boost_db', JSON.stringify(fixedBoostReqs)); } catch (e) { }
              }
              if (rentRes.data) {
                const fixedRentReqs = rentRes.data.map(r => ({
                  ...r,
                  accCode: r.accCode || r.acccode || '',
                  userId: r.userId || r.userid || ''
                }));
                setRentRequests(fixedRentReqs);
                try { localStorage.setItem('shop_rent_db', JSON.stringify(fixedRentReqs)); } catch (e) { }
              }
            } else {
              // QUYỀN KHÁCH: CHỈ TẢI CỦA KHÁCH
              const [myTx, myDep, myRent, myMsg, myBoostReq, adminRes] = await Promise.all([
                supabase.from('transactions').select('*').eq('user', user.name).order('created_at', { ascending: false }).limit(100),
                supabase.from('deposit_requests').select('*').eq('userId', session.user.id).order('created_at', { ascending: false }).limit(100),
                supabase.from('rent_requests').select('*').eq('userId', session.user.id).order('created_at', { ascending: false }).limit(100),
                supabase.from('messages').select('*').or(`senderId.eq.${session.user.id},receiverId.eq.${session.user.id}`).order('timestamp', { ascending: true }).limit(2000),
                supabase.from('boosting_requests').select('*').eq('user', user.name).order('created_at', { ascending: false }).limit(100), // <--- Đã thêm lệnh lấy Cày Thuê
                supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('role', 'admin').limit(1).maybeSingle()
              ]);

              if (myTx.data) { setTransactionsDb(myTx.data); try { localStorage.setItem('shop_tx_db', JSON.stringify(myTx.data)); } catch (e) { } }
              if (myDep.data) { setDepositRequests(myDep.data); try { localStorage.setItem('shop_dep_db', JSON.stringify(myDep.data)); } catch (e) { } }
              if (myMsg.data) { setMessagesDb(myMsg.data); try { localStorage.setItem('shop_msg_db', JSON.stringify(myMsg.data)); } catch (e) { } }
              if (adminRes.data) { setUsersDb([adminRes.data]); try { localStorage.setItem('shop_users_db', JSON.stringify([adminRes.data])); } catch (e) { } }
              if (myRent.data) {
                const fixedRentReqs = myRent.data.map(r => ({
                  ...r,
                  accCode: r.accCode || r.acccode || '',
                  userId: r.userId || r.userid || ''
                }));
                setRentRequests(fixedRentReqs);
                try { localStorage.setItem('shop_rent_db', JSON.stringify(fixedRentReqs)); } catch (e) { }
              }
              // Lọc và hiển thị Cày Thuê cho khách
              if (myBoostReq.data) {
                const fixedBoostReqs = myBoostReq.data.map(r => {
                  let parsedInfo = r.info;
                  if (typeof parsedInfo === 'string') {
                    try { parsedInfo = JSON.parse(parsedInfo); } catch (e) { parsedInfo = {}; }
                  }
                  return {
                    ...r,
                    info: parsedInfo || {},
                    boostingTitle: r.boostingTitle || r.boostingtitle || '',
                    boostingId: r.boostingId || r.boostingid || ''
                  };
                });
                setBoostingRequests(fixedBoostReqs);
                try { localStorage.setItem('shop_boost_db', JSON.stringify(fixedBoostReqs)); } catch (e) { }
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
            setCurrentView('login');
            showToast("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!", "error");
          }
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
  // --- HỆ THỐNG LẮNG NGHE DỮ LIỆU REALTIME (THỜI GIAN THỰC) ---
  useEffect(() => {
    // 1. Lắng nghe TIN NHẮN MỚI
    const messageChannel = supabase.channel('realtime-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessagesDb(prev => {
          // BỘ LỌC CHỐNG TRÙNG LẶP: Nếu ID tin nhắn đã hiện trên màn hình rồi thì bỏ qua
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    // 2. Lắng nghe LỆNH NẠP TIỀN MỚI & CẬP NHẬT TRẠNG THÁI
    // FIX: Phân quyền — Admin nhận TẤT CẢ, Khách chỉ nhận đơn của chính mình
    const depositChannel = supabase.channel('realtime-deposits')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deposit_requests' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        // Khách chỉ nhận đơn nạp của chính mình, Admin nhận hết
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

        // Cập nhật state một cách an toàn: nếu request đã có trong danh sách của user thì cập nhật luôn
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
      .subscribe();

    // 3. Lắng nghe ĐƠN THUÊ NICK MỚI & CẬP NHẬT TRẠNG THÁI
    // FIX: Phân quyền — Admin nhận TẤT CẢ, Khách chỉ nhận đơn thuê của chính mình
    const rentChannel = supabase.channel('realtime-rents')
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
      .subscribe();

    // 4. Lắng nghe ĐƠN CÀY THUÊ MỚI & CẬP NHẬT TRẠNG THÁI
    const boostReqChannel = supabase.channel('realtime-boosting-requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'boosting_requests' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        if (!isAdmin && payload.new.user !== me?.name) return;
        setBoostingRequests(prev => {
          if (prev.find(r => r.id === payload.new.id)) return prev;
          let parsedInfo = payload.new.info;
          if (typeof parsedInfo === 'string') {
            try { parsedInfo = JSON.parse(parsedInfo); } catch (e) { parsedInfo = {}; }
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
          try { parsedInfo = JSON.parse(parsedInfo); } catch (e) { parsedInfo = {}; }
        }
        const fixedPayload = { ...payload.new, info: parsedInfo || {}, boostingTitle: payload.new.boostingTitle || payload.new.boostingtitle || '', boostingId: payload.new.boostingId || payload.new.boostingid || '' };
        setBoostingRequests(prev => prev.map(r => r.id === fixedPayload.id ? fixedPayload : r));
      })
      .subscribe();

    // 5. Lắng nghe LƯỢT TRUY CẬP (SITE STATS)
    const statsChannel = supabase.channel('realtime-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_stats' }, (payload) => {
        if (payload.new && payload.new.views !== undefined) {
          setVisitorCount(payload.new.views);
        }
      })
      .subscribe();

    // Lắng nghe TRANSACTIONS MỚI (Để Admin nhận realtime lịch sử vòng quay/lịch sử mua nick)
    const transactionsChannel = supabase.channel('realtime-transactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';

        // Tạo biến nhận diện user giống hệt cách webhook lưu
        const myIdentifier = me?.name || me?.phone || 'Khách Vô Danh';

        // CƠ CHẾ DỰ PHÒNG: Nếu có giao dịch nạp tiền thành công của user này, tắt luôn QR PayOS
        if (payload.new.type === 'deposit_auto' && payload.new.user === myIdentifier) {
          setPayosPaymentData(null);
          setPayosSuccess(true);
          setDepositAmount('');
          setVoucherInput('');
          showToast("Thanh toán tự động thành công!", "success");
          setTimeout(() => setPayosSuccess(false), 5000);

          // Tự động cập nhật trạng thái trong depositRequests nội bộ để giao diện đồng bộ
          setDepositRequests(prev => prev.map(req => {
            if (req.type === 'banking' && req.status !== 'Thành công' && req.status !== 'Đã hủy') {
              return { ...req, status: 'Thành công' };
            }
            return req;
          }));
        }

        // Khách chỉ thấy của mình, Admin thấy hết (User name is used in transactions)
        if (!isAdmin && payload.new.user !== myIdentifier) return;
        setTransactionsDb(prev => {
          if (prev.find(t => t.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .subscribe();

    // 5. Lắng nghe USER MỚI & CẬP NHẬT
    // FIX: Admin cập nhật bảng usersDb. Khách tự cập nhật currentUser (số dư, lượt quay) khi Telegram Bot duyệt.
    const usersChannel = supabase.channel('realtime-users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        if (!isAdmin) return; // Khách không cần biết user mới đăng ký
        setUsersDb(prev => {
          if (prev.find(u => u.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
        const me = currentUserRef.current;
        const isAdmin = me?.role?.toLowerCase() === 'admin';
        // Admin: cập nhật toàn bộ bảng users cho Panel
        if (isAdmin) {
          setUsersDb(prev => prev.map(u => u.id === payload.new.id ? payload.new : u));
        } else if (payload.new.role?.toLowerCase() === 'admin') {
          // GUEST: Cập nhật thông tin admin để lấy status online realtime
          setUsersDb(prev => {
            if (prev.find(u => u.id === payload.new.id)) {
              return prev.map(u => u.id === payload.new.id ? payload.new : u);
            }
            return [...prev, payload.new];
          });
        }
        // TẤT CẢ: Nếu data thay đổi là của chính mình → tự cập nhật số dư, lượt quay, v.v.
        // (Giải quyết bug: Duyệt qua Telegram nhưng khách phải F5 mới thấy số dư mới)
        if (payload.new.id === me?.id) {
          setCurrentUser(payload.new);
          localStorage.setItem('shop_cached_user', JSON.stringify(payload.new));
        }
      })
      .subscribe();

    const commentsChannel = supabase.channel('realtime-comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, async (payload) => {
        const { data } = await supabase.from('comments').select('*, users(name, avatar_url, role)').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(200);
        if (data) setCommentsDb(data);
      })
      .subscribe();

    // 6. Lắng nghe TÀI KHOẢN MỚI / BỊ MUA / BỊ THUÊ
    const accountsChannel = supabase.channel('realtime-accounts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const acc = payload.new;
          // Hàm chuẩn hóa data giống như lúc load ban đầu
          let fixedRentOptions = acc.rentOptions;
          if (typeof fixedRentOptions === 'string') {
            try { fixedRentOptions = JSON.parse(fixedRentOptions); } catch (e) { fixedRentOptions = []; }
          }
          if (!Array.isArray(fixedRentOptions)) fixedRentOptions = [];

          let fixedDetailImages = acc.detailImages;
          if (typeof fixedDetailImages === 'string') {
            try { fixedDetailImages = JSON.parse(fixedDetailImages); } catch (e) { fixedDetailImages = []; }
          }
          if (!Array.isArray(fixedDetailImages)) fixedDetailImages = [];

          let fixedTags = acc.tags;
          if (typeof fixedTags === 'string') {
            try {
              let parsed = JSON.parse(fixedTags);
              fixedTags = Array.isArray(parsed) ? parsed : fixedTags.split(',').map(t => t.trim());
            } catch (e) {
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
      .subscribe();

    // 7. Lắng nghe DỊCH VỤ CÀY THUÊ (Admin thêm/sửa dịch vụ)
    const boostingChannel = supabase.channel('realtime-boosting')
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

    // Dọn dẹp các đường truyền khi khách đóng trình duyệt để chống lag máy
    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(depositChannel);
      supabase.removeChannel(rentChannel);
      supabase.removeChannel(boostReqChannel);
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(accountsChannel);
      supabase.removeChannel(boostingChannel);
    };
  }, []);
  // Tự động chuyển vòng quay nếu bị trống (Chống lỗi F5)
  useEffect(() => {
    if (playMode === 'money' && wheelItemsMoneyDb.length === 0 && wheelItemsSpinDb.length > 0) {
      setPlayMode('spin');
    } else if (playMode === 'spin' && wheelItemsSpinDb.length === 0 && wheelItemsMoneyDb.length > 0) {
      setPlayMode('money');
    }
  }, [wheelItemsMoneyDb.length, wheelItemsSpinDb.length, playMode]);

  // Lấy đơn nạp tự động hiện tại để đếm ngược
  const activePendingBankingReq = depositRequests.find(d => d.userId === currentUser?.id && (d.status === 'Chờ duyệt' || d.status === 'Chờ thanh toán') && d.type !== 'card');

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
          const { data, error } = await supabase
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

  // Cập nhật trạng thái "Đang hoạt động" cho currentUser (Ping mỗi 1 phút)
  useEffect(() => {
    if (!currentUser) return;
    const updateLastActive = async () => {
      try {
        await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('id', currentUser.id);
      } catch (e) { }
    };
    updateLastActive(); // Cập nhật ngay khi load
    const interval = setInterval(updateLastActive, 60000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- HÀM XỬ LÝ HỎI/ĐÁP BÌNH LUẬN ---
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!currentUser) return showToast("Vui lòng đăng nhập để bình luận!", "error");
    if (!commentInput.trim()) return;

    try {
      const { error } = await supabase.from('comments').insert({
        user_id: currentUser.id,
        content: commentInput.trim(),
        liked_by: [],
        disliked_by: [],
        is_pinned: false,
        parent_id: replyingToId
      });
      if (error) throw error;
      setCommentInput('');
      setReplyingToId(null);
      if (commentTextareaRef.current) {
        commentTextareaRef.current.style.height = 'auto';
      }
      showToast("Đã gửi bình luận!");
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi gửi bình luận!", "error");
    }
  };

  const handleToggleLikeComment = async (commentId, type) => {
    if (!currentUser) return showToast("Vui lòng đăng nhập!", "error");
    const comment = commentsDb.find(c => c.id === commentId);
    if (!comment) return;

    let liked_by = [...(comment.liked_by || [])];
    let disliked_by = [...(comment.disliked_by || [])];
    const userId = currentUser.id;

    if (type === 'like') {
      if (liked_by.includes(userId)) {
        liked_by = liked_by.filter(id => id !== userId);
      } else {
        liked_by.push(userId);
        disliked_by = disliked_by.filter(id => id !== userId);
      }
    } else {
      if (disliked_by.includes(userId)) {
        disliked_by = disliked_by.filter(id => id !== userId);
      } else {
        disliked_by.push(userId);
        liked_by = liked_by.filter(id => id !== userId);
      }
    }

    try {
      await supabase.from('comments').update({ liked_by, disliked_by }).eq('id', commentId);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePinComment = async (commentId, is_pinned) => {
    if (currentUser?.role !== 'admin') return;
    try {
      await supabase.from('comments').update({ is_pinned: !is_pinned }).eq('id', commentId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeAvatar = async (e) => {
    if (!currentUser) return;
    const file = e.target.files[0];
    if (!file) return;

    // Check size
    if (file.size > 5 * 1024 * 1024) return showToast("Ảnh tối đa 5MB", "error");

    try {
      setIsGlobalProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const imgUrl = await uploadToImgBB(reader.result);
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
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsGlobalProcessing(false);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    if (!newContent.trim()) return;
    const comment = commentsDb.find(c => c.id === commentId);
    if (!comment || comment.content === newContent) {
      setEditingCommentId(null);
      return;
    }

    const historyItem = { content: comment.content, edited_at: new Date().toISOString() };
    const edit_history = [...(comment.edit_history || []), historyItem];

    try {
      await supabase.from('comments').update({
        content: newContent.trim(),
        is_edited: true,
        edit_history
      }).eq('id', commentId);
      setEditingCommentId(null);
      showToast("Đã cập nhật bình luận!");
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi cập nhật bình luận!", "error");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await supabase.from('comments').delete().eq('id', commentId);
      showToast("Đã xóa bình luận!");
      setShowCommentOptionsId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportComment = async (commentId) => {
    if (!currentUser) return showToast("Vui lòng đăng nhập!", "error");
    const comment = commentsDb.find(c => c.id === commentId);
    if (!comment) return;

    let reported_by = [...(comment.reported_by || [])];
    if (!reported_by.includes(currentUser.id)) {
      reported_by.push(currentUser.id);
      try {
        await supabase.from('comments').update({ reported_by }).eq('id', commentId);
        showToast("Đã báo cáo bình luận!");
      } catch (err) {
        console.error(err);
      }
    } else {
      showToast("Bạn đã báo cáo bình luận này rồi!", "error");
    }
    setShowCommentOptionsId(null);
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
      // 1. Thêm .trim() để cắt bỏ mọi khoảng trắng thừa (dấu cách) nếu khách lỡ nhập
      const contact = e.target.contact.value.trim();
      const password = e.target.password.value;

      let loginEmail = contact;

      // 2. Nếu khách nhập SĐT (toàn số), tìm email tương ứng
      if (/^\d+$/.test(contact)) {
        // Dùng maybeSingle() thay vì single() để tránh làm sập code nếu không tìm thấy
        const { data: foundUser, error } = await supabase
          .from('users')
          .select('email')
          .eq('phone', contact)
          .maybeSingle();

        if (foundUser && foundUser.email) {
          loginEmail = foundUser.email;
        } else {
          return showToast("Số điện thoại này chưa được đăng ký!", 'error');
        }
      }

      // Đăng nhập bằng Email tìm được
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) return showToast("Sai tài khoản hoặc mật khẩu!", 'error');

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
            supabase.from('deposit_requests').select('*').order('created_at', { ascending: false }).limit(300),
            supabase.from('rent_requests').select('*').order('created_at', { ascending: false }).limit(200),
            supabase.from('messages').select('*').order('timestamp', { ascending: true }).limit(500),
            supabase.from('boosting_requests').select('*').order('created_at', { ascending: false }).limit(200)
          ]);
          if (usersRes.data) { setUsersDb(usersRes.data); try { localStorage.setItem('shop_users_db', JSON.stringify(usersRes.data)); } catch (e) { } }
          if (txRes.data) { setTransactionsDb(txRes.data); try { localStorage.setItem('shop_tx_db', JSON.stringify(txRes.data)); } catch (e) { } }
          if (depRes.data) { setDepositRequests(depRes.data); try { localStorage.setItem('shop_dep_db', JSON.stringify(depRes.data)); } catch (e) { } }
          if (rentRes.data) {
            // Nhớ lọc chữ hoa/thường cho bảng Thuê Nick
            const fixedRentReqs = rentRes.data.map(r => ({
              ...r,
              accCode: r.accCode || r.acccode || '',
              userId: r.userId || r.userid || ''
            }));
            setRentRequests(fixedRentReqs);
            try { localStorage.setItem('shop_rent_db', JSON.stringify(fixedRentReqs)); } catch (e) { }
          }
          if (msgRes.data) { setMessagesDb(msgRes.data); try { localStorage.setItem('shop_msg_db', JSON.stringify(msgRes.data)); } catch (e) { } }
          if (boostReqRes.data) {
            const fixedBoostReqs = boostReqRes.data.map(r => ({
              ...r,
              boostingTitle: r.boostingTitle || r.boostingtitle || '',
              boostingId: r.boostingId || r.boostingid || ''
            }));
            setBoostingRequests(fixedBoostReqs);
            try { localStorage.setItem('shop_boost_db', JSON.stringify(fixedBoostReqs)); } catch (e) { }
          }
        }

        setCurrentView('dashboard');
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
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const name = e.target.name.value.trim();
    const phone = e.target.phone.value.trim();

    // KIỂM TRA TRÙNG LẶP TRONG DATABASE TRƯỚC
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('name, email, phone')
      .or(`email.eq.${email},phone.eq.${phone},name.eq.${name}`);

    if (existingUsers && existingUsers.length > 0) {
      const isNameExist = existingUsers.some(u => u.name.toLowerCase() === name.toLowerCase());
      const isEmailExist = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      const isPhoneExist = existingUsers.some(u => u.phone === phone);

      if (isNameExist) return showToast("Tên tài khoản này đã có người sử dụng!", "error");
      if (isEmailExist) return showToast("Email này đã được đăng ký!", "error");
      if (isPhoneExist) return showToast("Số điện thoại này đã được đăng ký!", "error");
    }

    // 1. Tạo tài khoản bảo mật trong Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return showToast("Lỗi đăng ký: " + authError.message, 'error');

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
        showToast("Lỗi tạo hồ sơ: " + dbError.message, 'error');
      } else {
        showToast("Đăng ký thành công! Hãy đăng nhập nhé.", 'success');
        setCurrentView('login');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (isRecovering) return;
    setIsRecovering(true);
    const email = e.target.email.value.trim();
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

  // Sửa hàm tiêu tiền (nếu có dùng tên)
  const calculateTotalSpent = (username) => {
    if (!username) return 0;
    return transactionsDb
      .filter(t => t.user === username && ['buy_acc', 'rent_acc', 'boosting', 'spin'].includes(t.type) && !t.isSpinCost && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
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
    } catch (err) {
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
                name: '🔗 Liên Kết OTP Game',
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
              ...(hasActiveWheelRewards ? [{ name: 'Vòng Quay May Mắn', view: 'vongquay', auth: false, icon: <Gift size={20} /> }] : []),
              { name: 'Lịch Sử Giao Dịch', view: 'lichsu', auth: true, icon: <History size={20} /> },
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
                className={`p-3.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-left ${currentView === item.view ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : item.adminOnly ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                {item.icon} <span className="flex-1">{item.name}</span>
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
          ...(hasActiveWheelRewards ? [{ id: 'vongquay', name: 'Vòng quay', icon: <Gift size={22} />, auth: false }] : []),
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
              ...(hasActiveWheelRewards ? [{ name: 'Vòng Quay', view: 'vongquay', auth: false }] : []),
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
                className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${currentView === item.view ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {item.name}
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
                  {/* Phím tắt Liên Kết OTP hoặc Túi Đồ / Chợ Xu */}
                  {bossPlayerSummary ? (
                    <div className="hidden md:flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          requireAuth('bossgame');
                          setCurrentView('bossgame');
                          setShowBagModal(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-purple-300 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                        title="Bấm để mở Túi Đồ & Trang Bị"
                      >
                        <Package size={14} className="text-purple-400" />
                        <span>🎒 Túi Đồ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          requireAuth('bossgame');
                          setCurrentView('bossgame');
                          fetchAuctionMarketData();
                          setShowAuctionModal(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                        title="Bấm để mở Sàn Đấu Giá"
                      >
                        <span>🏛️ Chợ Xu</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        requireAuth('bossgame');
                        setCurrentView('bossgame');
                        handleGenerateLinkOtp();
                      }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse transition-all hover:scale-105 shrink-0 cursor-pointer"
                      title="Bấm để nhận mã OTP liên kết với nhân vật game"
                    >
                      <Zap size={14} className="text-yellow-300" />
                      <span>🔗 Liên Kết OTP Game</span>
                    </button>
                  )}

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

                  {/* Lượt quay */}
                  {hasActiveWheelRewards && (
                    <div
                      onClick={() => setCurrentView('vongquay')}
                      className="flex items-center gap-1.5 sm:gap-2 bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/60 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 transition-all shadow-[0_0_15px_rgba(244,63,94,0.05)] cursor-pointer shrink-0"
                      title="Lượt quay"
                    >
                      <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" />
                      <span className="text-rose-400 font-extrabold text-[12px] sm:text-[15px] whitespace-nowrap">
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
                          <Link size={16} className="text-amber-400" /> {bossPlayerSummary ? `Game: @${bossPlayerSummary.user_id}` : '🔗 Liên Kết OTP Game'}
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
                        <button onClick={() => { setShowUserDropdown(false); setConfirmDialog({ title: 'Đăng xuất', message: 'Bạn có chắc muốn đăng xuất?', onConfirm: async () => { await supabase.auth.signOut(); localStorage.removeItem('shop_cached_user'); localStorage.removeItem('shop_user_id'); localStorage.removeItem('shop_boss_target_id'); localStorage.removeItem('shop_linked_game_player'); setBossPlayerSummary(null); setBossTargetId(''); setCurrentUser(null); setCurrentView('dashboard'); showToast('Đã đăng xuất an toàn!'); } }); }} className="w-full px-4 py-3 text-left text-sm font-semibold text-rose-400 hover:bg-rose-600/20 hover:text-rose-300 transition-colors flex items-center gap-3">
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
            <p className="text-slate-400 text-sm text-center mb-6">Nhập Email bạn đã đăng ký, chúng tôi sẽ gửi mã xác thực gồm 6 số.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input name="email" type="email" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none focus:border-blue-500" placeholder="Nhập Email của bạn..." />
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
              <label className="block text-sm text-slate-400 mb-1">Tài khoản (Tên/SĐT/Email)</label>
              <input name="contact" type="text" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 focus:border-blue-500 outline-none" placeholder="Nhập tài khoản..." />
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
          <input name="name" type="text" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none" placeholder="Họ và tên" />
          <input name="phone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none" placeholder="Số điện thoại (10-11 số)" title="Vui lòng nhập đúng 10 đến 11 số" />
          <input name="email" type="email" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none" placeholder="Email" />
          <div className="relative">
            <input name="password" type={showPassword ? "text" : "password"} required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none pr-10" placeholder="Mật khẩu" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
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

  const renderComment = (comment, isReply = false) => {
    const isLiked = comment.liked_by?.includes(currentUser?.id);
    const isDisliked = comment.disliked_by?.includes(currentUser?.id);
    const replies = commentsDb.filter(c => c.parent_id === comment.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const isExpanded = expandedReplies[comment.id];
    const displayedReplies = isExpanded ? replies : replies.slice(0, 1);

    return (
      <div key={comment.id} className={`${isReply ? 'mt-3 ml-8 border-l-2 border-slate-700 pl-3' : 'p-3 rounded-xl border transition-colors ' + (comment.is_pinned ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#0B1120] border-slate-800 hover:border-slate-700')}`}>
        <div className="flex gap-3">
          <img src={comment.users?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.users?.name || 'K')}&background=151D2F&color=fff`} alt="avatar" className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover border border-slate-700 shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 relative">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="font-bold text-sm text-white truncate max-w-[100px]">{comment.users?.name || 'Khách'}</span>
                {comment.users?.role === 'admin' && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-black shrink-0">ADMIN</span>
                )}
                {!isReply && comment.is_pinned && (
                  <span className="text-rose-500 text-[10px] font-bold flex items-center gap-0.5 shrink-0"><Flame size={12} /> Ghim</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-500">{new Date(comment.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                {currentUser && (
                  <div className="relative">
                    <button onClick={() => setShowCommentOptionsId(showCommentOptionsId === comment.id ? null : comment.id)} className="text-slate-500 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition-colors">
                      <MoreVertical size={14} />
                    </button>
                    {showCommentOptionsId === comment.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowCommentOptionsId(null)}></div>
                        <div className="absolute right-0 top-full mt-1 bg-[#1A233A] border border-slate-700 rounded shadow-xl z-20 py-1 min-w-[120px] overflow-hidden animate-fade-in text-xs">
                          {currentUser.id === comment.user_id ? (
                            <>
                              <button onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content); setShowCommentOptionsId(null); }} className="w-full text-left px-3 py-2 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2">
                                <Edit size={12} /> Chỉnh sửa
                              </button>
                              <button onClick={() => handleDeleteComment(comment.id)} className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2">
                                <Trash2 size={12} /> Xóa bình luận
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleReportComment(comment.id)} className="w-full text-left px-3 py-2 text-yellow-500 hover:bg-yellow-500/10 flex items-center gap-2">
                              <AlertTriangle size={12} /> Báo cáo
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {editingCommentId === comment.id ? (
              <div className="mb-2 mt-1 relative">
                <textarea
                  value={editCommentContent}
                  onChange={(e) => {
                    setEditCommentContent(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  className="w-full bg-[#151D2F] border border-blue-500/50 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none custom-scrollbar"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Hủy</button>
                  <button onClick={() => handleUpdateComment(comment.id, editCommentContent)} disabled={!editCommentContent.trim() || editCommentContent === comment.content} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-lg transition-colors shadow-md shadow-blue-600/20">Lưu</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300 mb-2 break-words whitespace-pre-wrap">{comment.content}</p>
            )}
            <div className="flex items-center gap-4">
              <button onClick={() => handleToggleLikeComment(comment.id, 'like')} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isLiked ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={isLiked ? 'scale-110' : ''}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                {comment.liked_by?.length || 0}
              </button>
              <button onClick={() => handleToggleLikeComment(comment.id, 'dislike')} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isDisliked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isDisliked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={isDisliked ? 'scale-110' : ''}><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                {comment.disliked_by?.length || 0}
              </button>
              <button onClick={() => {
                if (!currentUser) return showToast("Vui lòng đăng nhập để phản hồi!", "error");
                const replyText = `@${comment.users?.name || 'Khách'}: `;
                setReplyingToId(isReply ? comment.parent_id : comment.id);
                setCommentInput(prev => prev.includes(replyText) ? prev : prev ? `${prev}\n${replyText}` : replyText);
                setTimeout(() => {
                  if (commentTextareaRef.current) {
                    commentTextareaRef.current.focus();
                    commentTextareaRef.current.style.height = 'auto';
                    commentTextareaRef.current.style.height = `${commentTextareaRef.current.scrollHeight}px`;
                  }
                }, 50);
              }} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-400 transition-colors">
                Phản hồi
              </button>
              {comment.is_edited && (
                <button onClick={() => setShowEditHistoryId(comment.id)} className="text-[10px] text-slate-400 hover:text-blue-400 italic hover:underline transition-colors ml-auto" title="Xem lịch sử chỉnh sửa">
                  (Đã chỉnh sửa)
                </button>
              )}
              {!isReply && currentUser?.role === 'admin' && (
                <button onClick={() => handlePinComment(comment.id, comment.is_pinned)} className={`text-[11px] font-bold text-yellow-500 hover:text-yellow-400 transition-colors ${comment.is_edited ? 'ml-3' : 'ml-auto'}`}>
                  {comment.is_pinned ? 'Bỏ ghim' : 'Ghim'}
                </button>
              )}
            </div>

            {/* Render Replies */}
            {!isReply && replies.length > 0 && (
              <div className="mt-2">
                {displayedReplies.map(reply => renderComment(reply, true))}
                {!isExpanded && replies.length > 1 && (
                  <button onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: true }))} className="mt-2 ml-8 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1">
                    <ChevronDown size={14} /> Xem thêm {replies.length - 1} câu trả lời
                  </button>
                )}
                {isExpanded && replies.length > 1 && (
                  <button onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: false }))} className="mt-2 ml-8 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1">
                    <ChevronUp size={14} /> Ẩn bớt
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderBoostingCard = (b, index) => {
    let gName = b.game || '';
    let gAvatar = null;
    try {
      const parsed = JSON.parse(b.game);
      gName = parsed.name || '';
      gAvatar = parsed.avatar || null;
    } catch (e) { }

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
              isFeatured={(() => { try { return JSON.parse(b.game).isFeatured; } catch (e) { return false; } })()}
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
        const { data: dbPlayer } = await supabase
          .from('game_players')
          .select('*')
          .or(`user_id.ilike.${cleanId},nickname.ilike.${cleanId}`)
          .maybeSingle();

        if (dbPlayer) {
          let wp = null, ar = null, nk = null, rg = null, pt = null;
          try { wp = dbPlayer.weapon ? (typeof dbPlayer.weapon === 'string' ? JSON.parse(dbPlayer.weapon) : dbPlayer.weapon) : null; } catch (e) { wp = { name: dbPlayer.weapon }; }
          try { ar = dbPlayer.armor ? (typeof dbPlayer.armor === 'string' ? JSON.parse(dbPlayer.armor) : dbPlayer.armor) : null; } catch (e) { ar = { name: dbPlayer.armor }; }
          try { nk = dbPlayer.necklace ? (typeof dbPlayer.necklace === 'string' ? JSON.parse(dbPlayer.necklace) : dbPlayer.necklace) : null; } catch (e) { nk = { name: dbPlayer.necklace }; }
          try { rg = dbPlayer.ring ? (typeof dbPlayer.ring === 'string' ? JSON.parse(dbPlayer.ring) : dbPlayer.ring) : null; } catch (e) { rg = { name: dbPlayer.ring }; }
          try { pt = dbPlayer.pet ? (typeof dbPlayer.pet === 'string' ? JSON.parse(dbPlayer.pet) : dbPlayer.pet) : null; } catch (e) { pt = { name: dbPlayer.pet }; }

          foundPlayer = {
            exists: true,
            user_id: dbPlayer.user_id,
            nickname: dbPlayer.nickname || dbPlayer.user_id,
            level: dbPlayer.level || 1,
            cp: dbPlayer.cp || 0,
            bonus_attacks: dbPlayer.bonus_attacks || 0,
            royal_chests: dbPlayer.royal_chests || 0,
            boss_chests: dbPlayer.boss_chests || 0,
            avatar_url: dbPlayer.avatar_url,
            weapon: wp,
            armor: ar,
            pet: pt,
            ring: rg,
            necklace: nk,
            exp: wp?.player_exp || 0,
            bonus_coins: wp?.player_coins || dbPlayer.bonus_coins || dbPlayer.coins || 0,
            total_dmg: wp?.total_dmg || 0,
            has_x2_rate: wp?.has_x2_rate || false,
            platform: wp?.platform || 'tiktok',
            inventory: (() => {
              const raw = wp?.inventory || dbPlayer?.inventory;
              if (Array.isArray(raw)) return raw;
              if (typeof raw === 'string') {
                try {
                  const pJson = JSON.parse(raw);
                  if (Array.isArray(pJson)) return pJson;
                } catch (e) { }
              }
              return [];
            })()
          };
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
    } catch (e) { }
  }, []);

  // Tự động đồng bộ và duy trì thông tin nhân vật game của tài khoản đã liên kết
  useEffect(() => {
    if (!currentUser?.id) {
      setBossPlayerSummary(null);
      setBossTargetId('');
      return;
    }
    let isSubscribed = true;
    (async () => {
      try {
        // Luôn xác thực trực tiếp với Supabase Cloud để lấy đúng nhân vật liên kết, loại bỏ cache cũ sai lệch
        const { data: pastOrders } = await supabase
          .from('game_orders')
          .select('result, user_id, web_user, rewards')
          .eq('package_id', 'account_link_otp')
          .eq('status', 'completed')
          .or(`web_user.eq."${currentUser.name || currentUser.id}",rewards->>web_user_id.eq."${currentUser.id}"`)
          .order('completed_at', { ascending: false })
          .limit(1);

        if (isSubscribed && pastOrders && pastOrders.length > 0) {
          const ord = pastOrders[0];
          const uid = ord.result?.game_user_id || ord.user_id;
          if (uid) {
            localStorage.setItem(`shop_linked_game_id_${currentUser.id}`, uid);
            setCurrentUser(prev => prev && prev.linked_game_id !== uid ? ({ ...prev, linked_game_id: uid }) : prev);
            setBossTargetId(uid);
            handleCheckBossPlayer(uid);
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

  // --- HÀM TẠO MÃ OTP LIÊN KẾT TÀI KHOẢN (REALTIME + POLLING + TAB FOCUS) ---
  const handleGenerateLinkOtp = async () => {
    if (!currentUser) return requireAuth('login');
    setIsGeneratingOtp(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const orderId = `OTP_${Date.now()}_${code}`;
      const expiresAt = Date.now() + 2 * 60 * 1000;

      const { error } = await supabase.from('game_orders').insert([{
        id: orderId,
        user_id: code,
        nickname: currentUser.name || 'Khách Web',
        web_user: currentUser.name || currentUser.id,
        package_id: 'account_link_otp',
        package_name: 'Liên kết tài khoản game qua OTP',
        price: 0,
        rewards: {
          otp_code: code,
          web_user_id: currentUser.id,
          web_user_name: currentUser.name,
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

        if (currentUser?.id) {
          localStorage.setItem(`shop_linked_game_id_${currentUser.id}`, linkedUid);
        }
        setCurrentUser(prev => prev ? ({ ...prev, linked_game_id: linkedUid }) : prev);
        setBossTargetId(linkedUid);

        // Hiển thị ngay profile nhân vật tạm thời để UI cập nhật tức thì 100% không bị treo
        setBossPlayerSummary({
          exists: true,
          user_id: linkedUid,
          nickname: res.game_nickname || linkedUid,
          level: res.level || 1,
          cp: res.cp || 0,
          bonus_attacks: 0,
          royal_chests: 0,
          boss_chests: 0,
          avatar_url: res.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(linkedUid)}`,
          weapon: null,
          armor: null,
          pet: null,
          ring: null,
          necklace: null,
          exp: 0,
          bonus_coins: 0,
          total_dmg: 0,
          has_x2_rate: false,
          platform: res.platform || 'discord',
          inventory: []
        });

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
        } catch (e) { }
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

  // --- HÀM THỰC HIỆN HÀNH ĐỘNG TRÊN TÚI ĐỒ (TRANG BỊ / XÓA ĐỒ / DỌN RÁC) ---
  const handleExecuteBagAction = async (actionType, item = null, itemIndex = null) => {
    if (!currentUser) return requireAuth('login');
    if (!bossPlayerSummary) {
      showToast("Vui lòng liên kết tài khoản trước khi quản lý túi đồ!", "error");
      return;
    }
    if (isPerformingBagAction) return;

    if (actionType === 'delete' && item) {
      if (!window.confirm(`Bạn có chắc muốn xóa/phân giải món [${item.name}] không? Bạn sẽ nhận lại lượt đánh boss tương ứng.`)) {
        return;
      }
    }
    if (actionType === 'dismantle_all') {
      if (!window.confirm("Bạn có chắc muốn Dọn Sạch Đồ Rác không? Hệ thống sẽ giữ lại đồ đang mặc, đồ cùng loại để up sao và đồ phẩm cao, chỉ phân giải đồ rác để nhận lượt đánh.")) {
        return;
      }
    }

    setIsPerformingBagAction(true);
    setBagActionLoadingItem(item ? (item.id || item.name || itemIndex) : 'all');

    const actionId = `ACT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const targetUid = bossPlayerSummary.user_id;

    try {
      const { error } = await supabase.from('game_orders').insert([{
        id: actionId,
        user_id: targetUid,
        nickname: bossPlayerSummary.nickname,
        web_user: currentUser.name || currentUser.id,
        package_id: `game_action_${actionType}`,
        package_name: actionType === 'equip' ? `Trang bị ${item?.name || ''}` : (actionType === 'delete' ? `Xóa ${item?.name || ''}` : 'Dọn sạch đồ rác'),
        price: 0,
        rewards: {
          action: actionType,
          item_index: itemIndex,
          item_name: item?.name,
          item_category: item?.category,
          item: item
        },
        status: 'pending'
      }]);

      if (error) throw error;

      showToast("Đang gửi yêu cầu vào game, vui lòng đợi giây lát...", "info");

      let attempts = 0;
      const pollAction = setInterval(async () => {
        attempts++;
        try {
          const { data: checkAct } = await supabase
            .from('game_orders')
            .select('*')
            .eq('id', actionId)
            .maybeSingle();

          if (checkAct && checkAct.status === 'completed') {
            clearInterval(pollAction);
            setIsPerformingBagAction(false);
            setBagActionLoadingItem(null);

            const msg = checkAct.result?.message || (actionType === 'equip' ? 'Đã trang bị thành công!' : 'Đã thực thi thành công!');
            showToast(`✨ ${msg}`, "success");

            await handleCheckBossPlayer(targetUid);
          } else if (attempts >= 15) {
            clearInterval(pollAction);
            setIsPerformingBagAction(false);
            setBagActionLoadingItem(null);
            await handleCheckBossPlayer(targetUid);
          }
        } catch (e) {
          console.error("Lỗi poll action:", e);
        }
      }, 1500);

    } catch (err) {
      console.error("Lỗi gửi hành động túi đồ:", err);
      showToast("Có lỗi xảy ra khi thực hiện, vui lòng thử lại!", "error");
      setIsPerformingBagAction(false);
      setBagActionLoadingItem(null);
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
        } catch (e) { }
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

  // --- HÀM THỰC HIỆN HÀNH ĐỘNG SÀN ĐẤU GIÁ (TREO BÁN / THU HỒI / MUA ĐỒ) ---
  const handleExecuteAuctionAction = async (actionType, payload = {}) => {
    if (!currentUser) return requireAuth('login');
    if (!bossPlayerSummary) {
      showToast("Vui lòng liên kết tài khoản trước khi tham gia Sàn Đấu Giá!", "error");
      return;
    }
    if (isPerformingBagAction) return;

    const targetUid = bossPlayerSummary.user_id;

    if (actionType === 'buy_auction') {
      const listing = payload.listing;
      if (!listing) return;
      if (String(listing.seller_id).toLowerCase() === String(targetUid).toLowerCase()) {
        showToast("Bạn không thể tự mua đồ của chính mình! Hãy dùng nút 'Thu Hồi'.", "error");
        return;
      }
      const myCoins = Number(bossPlayerSummary.bonus_coins || 0);
      if (myCoins < Number(listing.price || 0)) {
        showToast(`Bạn không đủ xu để mua! Cần ${Number(listing.price).toLocaleString()} xu, bạn có ${myCoins.toLocaleString()} xu.`, "error");
        return;
      }
      if (!window.confirm(`Xác nhận mua [${listing.item?.name}] với giá ${Number(listing.price).toLocaleString()} xu?`)) {
        return;
      }
    }

    if (actionType === 'cancel_auction') {
      const listing = payload.listing;
      if (!listing) return;
      if (!window.confirm(`Xác nhận thu hồi [${listing.item?.name}] về lại túi đồ?`)) {
        return;
      }
    }

    setIsPerformingBagAction(true);
    setBagActionLoadingItem(payload.auction_id || payload.itemIndex || 'auction');

    const actionId = `AUC_ACT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
      const rewardsPayload = {
        action: actionType,
        ...payload
      };

      let pkgName = 'Hành động đấu giá';
      if (actionType === 'list_auction') pkgName = `Treo bán ${payload.item_name || ''} (${payload.price} xu)`;
      if (actionType === 'cancel_auction') pkgName = `Thu hồi đấu giá #${payload.auction_id || ''}`;
      if (actionType === 'buy_auction') pkgName = `Mua đấu giá #${payload.auction_id || ''} (${payload.price} xu)`;

      const { error } = await supabase.from('game_orders').insert([{
        id: actionId,
        user_id: targetUid,
        nickname: bossPlayerSummary.nickname,
        web_user: currentUser.name || currentUser.id,
        package_id: `game_action_${actionType}`,
        package_name: pkgName,
        price: 0,
        rewards: rewardsPayload,
        status: 'pending'
      }]);

      if (error) throw error;

      showToast("Đang gửi yêu cầu tới Sàn Đấu Giá...", "info");

      let attempts = 0;
      const pollAction = setInterval(async () => {
        attempts++;
        try {
          const { data: checkAct } = await supabase
            .from('game_orders')
            .select('*')
            .eq('id', actionId)
            .maybeSingle();

          if (checkAct && checkAct.status === 'completed') {
            clearInterval(pollAction);
            setIsPerformingBagAction(false);
            setBagActionLoadingItem(null);

            const msg = checkAct.result?.message || 'Giao dịch thành công!';
            showToast(`🏛️ ${msg}`, checkAct.result?.success ? "success" : "error");

            await handleCheckBossPlayer(targetUid);
            await fetchAuctionMarketData();
            setShowListItemModal(false);
          } else if (attempts >= 15) {
            clearInterval(pollAction);
            setIsPerformingBagAction(false);
            setBagActionLoadingItem(null);
            await handleCheckBossPlayer(targetUid);
            await fetchAuctionMarketData();
          }
        } catch (e) {
          console.error("Lỗi poll auction action:", e);
        }
      }, 1500);

    } catch (err) {
      console.error("Lỗi gửi action đấu giá:", err);
      showToast("Có lỗi xảy ra khi thực hiện, vui lòng thử lại!", "error");
      setIsPerformingBagAction(false);
      setBagActionLoadingItem(null);
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

    const orderDetails = {
      order_id: orderId,
      user_id: targetUid,
      nickname: bossPlayerSummary?.nickname || bossTargetId.trim(),
      package_id: pkg.id,
      package_name: pkg.name,
      price: pkg.price,
      rewards: {
        attacks: pkg.attacks || 0,
        royal_chests: pkg.royalChests || 0,
        boss_chests: 0,
        coins: pkg.coins || 0,
        has_x2_rate: Boolean(pkg.hasX2Rate),
        items: pkg.items || []
      },
      web_user: currentUser.name || currentUser.id
    };

    const txPayload = {
      id: orderId,
      user: currentUser.name,
      action: `Nạp ${pkg.name} [${bossTargetId.trim()}]`,
      amount: pkg.price,
      date: dateStr,
      status: 'Đã hoàn tất',
      type: 'boss_game_topup',
      isSpinCost: false,
      accDetails: orderDetails
    };

    try {
      // 1. Trừ tiền ví web qua RPC hoặc update bảng users
      let spendSuccess = false;
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('rpc_client_spend', {
          p_amount: pkg.price,
          p_fund_amount: 0,
          p_tx_data: txPayload
        });
        if (!rpcErr && rpcRes?.success) {
          spendSuccess = true;
        }
      } catch (e) { }

      if (!spendSuccess) {
        const newBal = (currentUser.balance || 0) - pkg.price;
        const { error: updErr } = await supabase.from('users').update({ balance: newBal }).eq('id', currentUser.id);
        if (updErr) throw updErr;
        await supabase.from('transactions').insert([txPayload]);
        spendSuccess = true;
      }

      // 2. Lưu đơn hàng vào Supabase (game_orders hoặc deposit_requests)
      try {
        const { error: insErr } = await supabase.from('game_orders').insert([{
          id: orderId,
          user_id: targetUid,
          nickname: bossPlayerSummary?.nickname || bossTargetId.trim(),
          web_user: currentUser.name,
          package_id: pkg.id,
          package_name: pkg.name,
          price: pkg.price,
          rewards: orderDetails.rewards,
          status: 'pending'
        }]);
        if (insErr) {
          await supabase.from('deposit_requests').insert([{
            id: orderId,
            user: currentUser.name,
            userId: currentUser.id,
            amount: pkg.price,
            status: 'pending',
            date: dateStr,
            type: 'boss_game_topup',
            details: JSON.stringify(orderDetails)
          }]);
        }
      } catch (e) { }

      // 3. Đơn nạp tự động lưu vào Supabase Cloud (game_orders), máy chủ game sẽ tự động đọc và duyệt realtime

      // 4. Cập nhật state client
      const updatedUser = { ...currentUser, balance: (currentUser.balance || 0) - pkg.price };
      setCurrentUser(updatedUser);
      localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
      setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));
      setTransactionsDb([txPayload, ...transactionsDb]);

      setSelectedBossPackage(null);
      setBossSuccessModal({
        pkg,
        targetId: bossTargetId.trim(),
        orderId
      });
      showToast(`Nạp ${pkg.name} thành công! Vật phẩm đang được chuyển tự động vào game.`);
      sendAdminAlert('NẠP GAME BOSS MỘNG THIÊN HUYỄN', `Khách ${currentUser.name} vừa nạp ${pkg.name} (${new Intl.NumberFormat('vi-VN').format(pkg.price)}đ) cho ID: ${bossTargetId.trim()}`);

    } catch (err) {
      showToast("Lỗi khi thanh toán: " + (err.message || err), "error");
    } finally {
      setIsBuyingBossPackage(false);
    }
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
                          Nạp Xu Game, Rương Hoàng Kim, Lượt Đánh Boss & Nhẫn Thần Binh. Tự động chuyển quà vào acc ngay sau 1 giây!
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

  const renderSecurityScreen = () => {
    if (!currentUser) return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-300">
        <AlertCircle size={60} className="text-yellow-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-4">Phiên đăng nhập đã hết hạn</h2>
        <p className="text-slate-400 mb-6">Vui lòng đăng nhập lại để xem thông tin cá nhân của bạn.</p>
        <button onClick={() => setCurrentView('login')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20">
          Đi Trở Về Form Đăng Nhập
        </button>
      </div>
    );

    // ... tất cả code còn lại của hàm giữ nguyên ...
    const handleUpdateInfo = async (e) => {
      e.preventDefault();
      const newEmail = e.target.email.value;
      const newPhone = e.target.phone.value;
      const newName = e.target.name.value;

      // 1. Cập nhật bảng 'users' trước để giao diện hiện đúng
      const updatePayload = { name: newName, phone: newPhone, email: newEmail };

      // Nếu đổi email → reset trạng thái xác thực
      if (newEmail !== currentUser.email) {
        updatePayload.is_email_verified = false;
      }

      const { error: dbError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', currentUser?.id);

      if (dbError) return showToast("Lỗi cập nhật bảng: " + dbError.message, 'error');

      // 2. Nếu đổi email, phải báo cho hệ thống Auth
      if (newEmail !== currentUser.email) {
        const { error: authErr } = await supabase.auth.updateUser({ email: newEmail });
        if (authErr) {
          return showToast("Lỗi Auth: " + authErr.message, 'error');
        }
        showToast("Đã đổi Email! Bạn cần xác thực lại Email mới.", 'success');
      } else {
        showToast("Đã cập nhật thông tin thành công!");
      }

      // Cập nhật lại state cục bộ để web không bị treo
      const updatedUser = {
        ...currentUser,
        name: newName,
        phone: newPhone,
        email: newEmail,
        ...(newEmail !== currentUser.email ? { is_email_verified: false } : {})
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
      setUsersDb(usersDb.map(u => u.id === currentUser?.id ? updatedUser : u));
    };

    const handleChangePassword = async (e) => {
      e.preventDefault();
      const newPass = e.target.newPass.value;
      if (e.target.newPass.value !== e.target.confirmPass.value) return showToast("Mật khẩu xác nhận không khớp!", 'error');

      // 1. Cập nhật mật khẩu THẬT trong hệ thống đăng nhập
      const { error: authErr } = await supabase.auth.updateUser({ password: newPass });
      if (authErr) return showToast("Lỗi: " + authErr.message, 'error');

      // 2. Cập nhật mật khẩu trong bảng users (để Admin quản lý nếu cần)
      await supabase.from('users').update({ password: newPass }).eq('id', currentUser?.id);

      setCurrentUser({ ...currentUser, password: newPass });
      showToast("Đổi mật khẩu đăng nhập thành công!");
      e.target.reset();
    };

    const handleSendMessage = async (e) => {
      e.preventDefault();
      const input = e.target.message.value.trim();
      if (!input || !currentUser) return;

      // Tìm ID của Admin thật trong hệ thống
      let adminId = null;
      if (usersDb && usersDb.length > 0) {
        const adminUser = usersDb.find(u => u.role?.toLowerCase() === 'admin');
        if (adminUser) adminId = adminUser.id;
      }

      // Nếu không có trong RAM (Khách không load usersDb), tự động gọi DB để tìm Admin
      if (!adminId) {
        const { data } = await supabase.from('users').select('id, role');
        if (data) {
          const foundAdmin = data.find(u => u.role?.toLowerCase() === 'admin');
          if (foundAdmin) adminId = foundAdmin.id;
        }
      }

      if (!adminId) return showToast("Hiện tại không có Admin trực tuyến!", "error");

      const newMsg = {
        id: `MSG${Date.now()}`,
        senderId: currentUser?.id,
        receiverId: adminId, // Gửi đến đúng ID Admin
        content: input,
        timestamp: Date.now(),
        isRead: false
      };

      // Optimistic update để hiện ngay lên màn hình
      setMessagesDb(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      await supabase.from('messages').insert([newMsg]);
      e.target.reset();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      sendAdminAlert('TIN NHẮN HỖ TRỢ', `Khách ${currentUser?.name} vừa nhắn: "${input}"`);
    };

    const userMessages = messagesDb.filter(m => m.senderId === currentUser?.id || m.receiverId === currentUser?.id);

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
        {renderNavbar()}
        <main className="w-full max-w-[1400px] mx-auto px-4 lg:pr-28 pt-4 md:pt-6 mt-4">
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-800 scrollbar-hide">
            <button onClick={() => setProfileTab('info')} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 ${profileTab === 'info' ? 'bg-blue-600 text-white' : 'bg-[#151D2F] text-slate-400 hover:text-white'}`}><User size={18} /> Quản lý chung</button>
            <button onClick={() => setProfileTab('transfer')} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 ${profileTab === 'transfer' ? 'bg-emerald-600 text-white' : 'bg-[#151D2F] text-slate-400 hover:text-white'}`}><ArrowLeftRight size={18} /> Chuyển tiền</button>
            <button onClick={() => setProfileTab('vip')} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 ${profileTab === 'vip' ? 'bg-yellow-600 text-white' : 'bg-[#151D2F] text-slate-400 hover:text-white'}`}><Sparkles size={18} /> VIP</button>
            {currentUser?.role !== 'admin' && (
              <button onClick={() => setProfileTab('inbox')} className={`px-4 py-2 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 relative ${profileTab === 'inbox' ? 'bg-rose-600 text-white' : 'bg-[#151D2F] text-slate-400 hover:text-white'}`}>
                <MessageCircle size={18} /> Hộp thư hỗ trợ
                {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>}
              </button>
            )}
          </div>

          {profileTab === 'info' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Thông tin cá nhân</h3>
                <form className="space-y-4" onSubmit={handleUpdateInfo}>
                  <div><label className="text-xs text-slate-400 mb-1 block">Tên hiển thị</label><input name="name" defaultValue={currentUser?.name} className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none text-white" required /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-400 mb-1 block">Số điện thoại</label><input name="phone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} defaultValue={currentUser?.phone} className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 outline-none text-white" required title="Nhập 10-11 số" /></div>
                    <div><div>
                      <div className="flex justify-between items-end mb-1">
                        <label className="text-xs text-slate-400 block">Email</label>
                        {currentUser?.is_email_verified ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={12} /> Đã xác thực</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendVerification}
                            disabled={verifyCooldown > 0}
                            className={`text-[10px] text-white font-bold px-2 py-0.5 rounded shadow-lg transition-colors flex items-center gap-1 ${verifyCooldown > 0 ? 'bg-slate-600 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'}`}
                          >
                            {verifyCooldown > 0 ? <><Clock size={12} className="animate-pulse" /> Gửi lại sau {verifyCooldown}s</> : 'Chưa xác thực (Bấm để xác nhận)'}
                          </button>)}
                      </div>
                      <input name="email" type="email" defaultValue={currentUser?.email} className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 outline-none text-white" required />
                    </div></div>
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg w-full md:w-auto">Lưu thông tin</button>
                </form>
              </div>

              <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2"><Key size={18} className="text-rose-500" /> Đổi mật khẩu</h3>
                <form className="space-y-4" onSubmit={handleChangePassword}>
                  <div className="relative">
                    <input name="oldPass" type={showOldPass ? "text" : "password"} placeholder="Mật khẩu hiện tại" className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none text-white pr-12" required />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-[14px] text-slate-500 hover:text-white transition-colors">
                      {showOldPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <input name="newPass" type={showNewPass ? "text" : "password"} placeholder="Mật khẩu mới" className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none text-white pr-12" required />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-[14px] text-slate-500 hover:text-white transition-colors">
                        {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input name="confirmPass" type={showConfirmPass ? "text" : "password"} placeholder="Nhập lại mật khẩu mới" className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none text-white pr-12" required />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-[14px] text-slate-500 hover:text-white transition-colors">
                        {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg w-full md:w-auto">Cập nhật mật khẩu</button>
                </form>
              </div>
              <button onClick={() => {
                setConfirmDialog({
                  title: 'Đăng xuất', message: 'Bạn có chắc muốn đăng xuất khỏi hệ thống?',
                  onConfirm: async () => {
                    await supabase.auth.signOut();
                    localStorage.removeItem('shop_cached_user'); // <--- Hủy hoàn toàn phiên đăng nhập ngầm
                    localStorage.removeItem('shop_user_id');
                    setCurrentUser(null);
                    setCurrentView('dashboard');
                    showToast("Đã đăng xuất an toàn!");
                  }
                });
              }} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-xl flex items-center justify-center gap-2 border border-red-500/20 font-bold transition-colors">
                <LogOut size={18} /> Đăng xuất tài khoản
              </button>
            </div>
          )}

          {profileTab === 'transfer' && (() => {
            const senderIsVip = calculateTotalRecharged(currentUser?.id) >= 3000000;
            const TRANSFER_FEE_RATE = 0.025; // 2.5%
            return (
              <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
                <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><ArrowLeftRight size={20} className="text-emerald-500" /> Chuyển tiền cho người khác</h3>
                  <p className="text-xs text-slate-400 mb-4">Chuyển số dư chính (không bao gồm Quỹ Bảo Lưu) sang tài khoản khác trong hệ thống. Nhập SĐT người nhận để tìm kiếm.</p>

                  {/* THÔNG BÁO PHÍ CHUYỂN TIỀN */}
                  {senderIsVip ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                      <Sparkles size={20} className="text-yellow-500 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-sm font-bold text-yellow-400">Đặc quyền VIP: Miễn phí chuyển tiền!</p>
                        <p className="text-[11px] text-yellow-500/70">Bạn được miễn toàn bộ phí giao dịch chuyển tiền.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                      <AlertCircle size={20} className="text-rose-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-rose-400">Phí chuyển tiền: 2.5%</p>
                        <p className="text-[11px] text-rose-400/70">Nâng cấp VIP (nạp tích lũy 3 triệu) để được miễn phí chuyển tiền.</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const phone = e.target.receiverPhone.value.trim();
                    const amount = parseInt(e.target.transferAmount.value);

                    if (!phone || !amount || amount <= 0) return showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
                    if (amount < 1000) return showToast('Số tiền chuyển tối thiểu là 1.000đ!', 'error');

                    // Tính phí chuyển tiền (VIP miễn phí)
                    const fee = senderIsVip ? 0 : Math.ceil(amount * TRANSFER_FEE_RATE);
                    const totalDeduct = amount + fee;

                    if (currentUser.balance < totalDeduct) return showToast(`Số dư không đủ! Cần ${new Intl.NumberFormat('vi-VN').format(totalDeduct)}đ (gồm phí ${new Intl.NumberFormat('vi-VN').format(fee)}đ). Bạn chỉ có ${new Intl.NumberFormat('vi-VN').format(currentUser.balance)}đ.`, 'error');

                    // Tìm người nhận theo SĐT
                    const receiver = usersDb.find(u => u.phone === phone);
                    if (!receiver) {
                      // Nếu không có trong RAM, thử gọi DB
                      const { data: dbUser } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('phone', phone).single();
                      if (!dbUser) return showToast('Không tìm thấy tài khoản với SĐT này!', 'error');
                      // Tìm thấy trên DB
                      handleTransferMoney(dbUser, amount, fee, totalDeduct, e.target);
                    } else {
                      if (receiver.id === currentUser.id) return showToast('Không thể chuyển tiền cho chính mình!', 'error');
                      handleTransferMoney(receiver, amount, fee, totalDeduct, e.target);
                    }

                    async function handleTransferMoney(receiver, amount, fee, totalDeduct, formEl) {
                      if (receiver.id === currentUser.id) return showToast('Không thể chuyển tiền cho chính mình!', 'error');
                      if (currentUser.balance < totalDeduct) return showToast(`Số dư không đủ! Cần ${new Intl.NumberFormat('vi-VN').format(totalDeduct)}đ.`, 'error');

                      const feeText = fee > 0
                        ? `\n\nPhí chuyển tiền (2.5%): ${new Intl.NumberFormat('vi-VN').format(fee)}đ\nTổng trừ: ${new Intl.NumberFormat('vi-VN').format(totalDeduct)}đ`
                        : '\n\n✨ VIP: Miễn phí chuyển tiền!';

                      setConfirmDialog({
                        title: 'Xác nhận chuyển tiền',
                        message: `Chuyển ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho "${receiver.name}" (SĐT: ${receiver.phone})?${feeText}\n\nSố dư sau giao dịch: ${new Intl.NumberFormat('vi-VN').format(currentUser.balance - totalDeduct)}đ`,
                        onConfirm: async () => {
                          // 1. Lấy dữ liệu sống từ DB
                          const { data: liveSender } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', currentUser.id).single();
                          const { data: liveReceiver } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', receiver.id).single();
                          if (!liveSender || !liveReceiver) return showToast('Lỗi hệ thống!', 'error');
                          if (liveSender.balance < totalDeduct) return showToast('Số dư không đủ (đã tính phí)!', 'error');

                          // 2. Ghi lịch sử giao dịch cho CẢ HAI
                          const now = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN');
                          const feeNote = fee > 0 ? ` (Phí: ${new Intl.NumberFormat('vi-VN').format(fee)}đ)` : ' (VIP miễn phí)';

                          const txSender = {
                            id: `TF${Date.now()}S`, user: liveSender.name,
                            action: `Chuyển tiền cho ${liveReceiver.name} (${liveReceiver.phone})${feeNote}`,
                            amount: -totalDeduct, date: now, status: 'Thành công', type: 'transfer_out',
                            accDetails: { balanceAfter: liveSender.balance - totalDeduct, fundAfter: liveSender.rentFund || 0, fee: fee, originalAmount: amount }
                          };
                          const txReceiver = {
                            id: `TF${Date.now()}R`, user: liveReceiver.name,
                            action: `Nhận tiền từ ${liveSender.name} (${liveSender.phone})`,
                            amount: amount, date: now, status: 'Thành công', type: 'transfer_in',
                            accDetails: { balanceAfter: liveReceiver.balance + amount, fundAfter: liveReceiver.rentFund || 0 }
                          };

                          // 3. Gọi RPC an toàn trên Backend
                          const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_transfer_money', {
                            p_receiver_phone: receiver.phone,
                            p_amount: amount,
                            p_fee: fee,
                            p_tx_sender: txSender,
                            p_tx_receiver: txReceiver
                          });

                          if (rpcError || !rpcData?.success) {
                            return showToast(rpcError?.message || rpcData?.message || 'Lỗi chuyển tiền!', 'error');
                          }

                          // 5. Cập nhật giao diện
                          const updatedSender = { ...currentUser, balance: liveSender.balance - totalDeduct };
                          setCurrentUser(updatedSender);
                          localStorage.setItem('shop_cached_user', JSON.stringify(updatedSender));
                          setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedSender : u.id === receiver.id ? { ...u, balance: liveReceiver.balance + amount } : u));

                          formEl.reset();
                          const successMsg = fee > 0
                            ? `Đã chuyển ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho ${liveReceiver.name}! (Phí: ${new Intl.NumberFormat('vi-VN').format(fee)}đ)`
                            : `Đã chuyển ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho ${liveReceiver.name} thành công!`;
                          showToast(successMsg);
                          sendAdminAlert('CHUYỂN TIỀN', `${liveSender.name} vừa chuyển ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho ${liveReceiver.name}.${fee > 0 ? ` Phí: ${new Intl.NumberFormat('vi-VN').format(fee)}đ.` : ' (VIP miễn phí)'}`);
                        }
                      });
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">SĐT người nhận</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input name="receiverPhone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} required placeholder="Nhập số điện thoại..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-emerald-500 outline-none text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Số tiền chuyển (VNĐ)</label>
                      <div className="relative">
                        <Wallet size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input name="transferAmount" type="number" min="1000" required placeholder="Nhập số tiền..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B1120] border border-slate-700 focus:border-emerald-500 outline-none text-white" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Số dư hiện có: <strong className="text-emerald-400">{new Intl.NumberFormat('vi-VN').format(currentUser.balance)}đ</strong> (Quỹ thuê không được tính)</p>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2">
                      <ArrowLeftRight size={18} /> Chuyển tiền
                    </button>
                  </form>
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                    <div className="text-xs text-slate-400 space-y-1">
                      <p className="text-yellow-400 font-bold">Lưu ý quan trọng:</p>
                      <p>• Phí chuyển tiền: <strong className="text-rose-400">2.5%</strong> trên số tiền chuyển. Khách hàng <strong className="text-yellow-400">VIP được miễn phí</strong>.</p>
                      <p>• Chỉ chuyển được <strong className="text-white">Số dư chính</strong>, không chuyển được Quỹ Bảo Lưu Thuê.</p>
                      <p>• Giao dịch chuyển tiền <strong className="text-white">không thể hoàn tác</strong>. Hãy kiểm tra kỹ SĐT trước khi xác nhận.</p>
                      <p>• Mọi giao dịch đều được ghi lại trong Lịch sử và thông báo cho Admin.</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {profileTab === 'vip' && (
            <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
              {/* BANNER VIP */}
              <div className="w-full bg-gradient-to-br from-yellow-600/20 to-amber-900/20 border border-yellow-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                <Sparkles size={50} className="text-yellow-500 mb-3 animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-black text-white mb-1 uppercase tracking-tighter">Khách Hàng VIP</h2>
                <p className="text-yellow-500/80 font-medium text-sm">Nâng tầm trải nghiệm - Khẳng định đẳng cấp</p>
              </div>

              {/* THANH TIẾN TRÌNH */}
              <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tiến trình VIP</span>
                  <span className="text-sm font-black text-yellow-500">
                    {new Intl.NumberFormat('vi-VN').format(calculateTotalRecharged(currentUser?.id))} / 3.000.000đ
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.4)] transition-all duration-1000 rounded-full"
                    style={{ width: `${Math.min((calculateTotalRecharged(currentUser?.id) / 3000000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  {calculateTotalRecharged(currentUser?.id) >= 3000000
                    ? '🎉 Chúc mừng! Bạn đã đạt hạng VIP và được hưởng đầy đủ đặc quyền!'
                    : `Cần nạp thêm ${new Intl.NumberFormat('vi-VN').format(3000000 - calculateTotalRecharged(currentUser?.id))}đ để lên VIP`}
                </p>
              </div>

              {/* ĐẶC QUYỀN VIP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#151D2F] border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <h3 className="text-base font-bold text-yellow-500 mb-4 flex items-center gap-2"><Target size={18} /> Cách thức lên VIP</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                      <span>Tổng tiền nạp tích lũy đạt từ <strong className="text-white">3.000.000 VNĐ</strong> trở lên.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></div>
                      <span>Hệ thống tự động nâng cấp ngay khi bạn đủ điều kiện.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-[#151D2F] border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <h3 className="text-base font-bold text-rose-500 mb-4 flex items-center gap-2"><ShieldCheck size={18} /> Đặc quyền VIP</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><ShieldCheck size={16} /></div>
                      <span><strong className="text-white">MIỄN CCCD:</strong> Thuê acc không cần chụp giấy tờ.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><Wallet size={16} /></div>
                      <span><strong className="text-white">MIỄN CỌC:</strong> Không bị thu 500k tiền cọc an toàn.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500"><ArrowLeftRight size={16} /></div>
                      <span><strong className="text-white">MIỄN PHÍ CHUYỂN TIỀN:</strong> Không mất phí 2.5% khi chuyển tiền.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {profileTab === 'inbox' && (
            <div className="bg-[#151D2F] border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[calc(100vh-280px)] md:h-[60vh] min-h-[350px] max-h-[800px]">
              <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#0B1120] rounded-t-2xl">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center"><Gamepad2 size={20} /></div>
                <div>
                  <h3 className="font-bold text-white">Admin Hệ Thống Shop</h3>
                  {(() => {
                    const adminUser = usersDb.find(u => u.role?.toLowerCase() === 'admin');
                    const status = getActiveStatus(adminUser?.last_active);
                    return (
                      <p className={`text-[10px] flex items-center gap-1 ${status.isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                        <span className={`w-2 h-2 rounded-full block ${status.isOnline ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                        {status.isOnline ? 'Đang trực tuyến' : (status.text === 'Ngoại tuyến' ? 'Ngoại tuyến' : `Hoạt động: ${status.text}`)}
                      </p>
                    );
                  })()}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                {userMessages.length === 0 ? <p className="text-center text-slate-500 mt-10 text-sm">Chưa có tin nhắn nào. Hãy gửi lời chào đến Admin!</p> : (
                  userMessages.sort((a, b) => a.timestamp - b.timestamp).map(m => {
                    const isMine = m.senderId === currentUser?.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                          <p className="text-sm">{m.content}</p>
                          <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(m.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 md:p-4 border-t border-slate-800 bg-[#0B1120] rounded-b-2xl">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                  <input name="message" type="text" placeholder="Nhập tin nhắn..." className="flex-1 bg-[#151D2F] border border-slate-700 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" autoComplete="off" />
                  <button type="submit" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 shrink-0 transition-colors"><Send size={18} /></button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    );
  };

  const renderNaptienScreen = () => {
    // 1. TẠO BIẾN KIỂM TRA LỆNH ĐANG CHỜ DUYỆT
    const hasPendingRequest = depositRequests.some(d => d.userId === currentUser?.id && d.status === 'Chờ duyệt');
    const activePendingBankingReq = depositRequests.find(d => d.userId === currentUser?.id && d.status === 'Chờ duyệt' && d.type !== 'card');

    const removeAccents = (str) => {
      return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D') : '';
    }
    // Thay thế đoạn transferContent cũ bằng đoạn này
    const transferContent = `NAP ${currentUser?.phone}`;
    const displayAmount = activePendingBankingReq ? activePendingBankingReq.amount : pendingDeposit?.amount;

    const handleCreatePayosLink = async (e) => {
      e.preventDefault();
      if (hasPendingRequest) {
        return showToast("Bạn đang có lệnh nạp chờ duyệt. Vui lòng đợi Admin xử lý!", "error");
      }
      const parsedAmount = parseInt(depositAmount.toString().replace(/\D/g, ''));
      if (!parsedAmount || parsedAmount < 10000) return showToast("Số tiền tối thiểu 10.000đ", 'error');

      let bonusAmount = 0;
      let bonusSpins = 0;
      let appliedVoucher = null;

      if (voucherInput.trim() !== '') {
        const validVoucher = vouchersDb.find(v => v.code === voucherInput.trim().toUpperCase() && v.isActive);
        if (!validVoucher) {
          setIsGlobalProcessing(false);
          return showToast("Mã voucher không hợp lệ hoặc đã bị vô hiệu hóa!", 'error');
        }
        bonusAmount = (parsedAmount * (validVoucher.percent || 0)) / 100;
        bonusSpins = validVoucher.bonusSpins || 0;
        appliedVoucher = validVoucher.code;
      }

      if (isGlobalProcessing) return;
      setIsGlobalProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke('payos-create-payment', {
          body: {
            amount: parsedAmount,
            userId: currentUser.id,
            phone: currentUser.phone || currentUser.name,
            bonusAmount: bonusAmount,
            voucherSpins: bonusSpins,
            voucherCode: appliedVoucher,
            returnUrl: window.location.origin + '/?tab=history' // Quay về trang lịch sử
          }
        });

        if (error) throw new Error(error.message);
        if (data && data.checkoutUrl) {
          setPayosPaymentData(data);
          // Cập nhật giao diện Lịch sử nạp ngay lập tức
          const newDraft = {
            id: `PAYOS_${data.orderCode}`,
            userId: currentUser.id,
            amount: parsedAmount,
            bonusAmount: bonusAmount,
            voucherCode: appliedVoucher,
            status: 'Chờ duyệt',
            type: 'banking',
            created_at: new Date().toISOString()
          };
          setDepositRequests(prev => [newDraft, ...prev]);
        } else {
          showToast("Không thể tạo link thanh toán, vui lòng thử lại sau.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Lỗi hệ thống khi gọi PayOS", "error");
      } finally {
        setIsGlobalProcessing(false);
      }
    };

    const handleCreateDepositDraft = (e) => {
      e.preventDefault();

      // 2. CHẶN TẠO LỆNH NẾU ĐANG CÓ LỆNH CHỜ
      if (hasPendingRequest) {
        return showToast("Bạn đang có lệnh nạp chờ duyệt. Vui lòng đợi Admin xử lý!", "error");
      }

      const parsedAmount = parseInt(depositAmount.toString().replace(/\D/g, ''));
      if (!parsedAmount || parsedAmount < 10000) return showToast("Số tiền tối thiểu 10.000đ", 'error');

      let bonusAmount = 0;
      let bonusSpins = 0;
      let appliedVoucher = null;

      if (voucherInput.trim() !== '') {
        const validVoucher = vouchersDb.find(v => v.code === voucherInput.trim().toUpperCase() && v.isActive);
        if (!validVoucher) {
          return showToast("Mã voucher không hợp lệ hoặc đã bị vô hiệu hóa!", 'error');
        }
        bonusAmount = (parsedAmount * (validVoucher.percent || 0)) / 100;
        bonusSpins = validVoucher.bonusSpins || 0;
        appliedVoucher = validVoucher.code;
      }

      setPendingDeposit({
        amount: parsedAmount,
        bonusAmount: bonusAmount,
        voucherSpins: bonusSpins, // Lưu thêm lượt quay
        voucherCode: appliedVoucher
      });
      setDepositStep(2); // Chuyển sang bước quét QR
    };

    const handleConfirmTransfer = async () => {
      if (!pendingDeposit) return;
      if (isDepositing) return;

      setIsDepositing(true);

      // CHẶN BẤM ĐÚP XÁC NHẬN KHI ĐÃ CÓ LỆNH CHỜ
      if (hasPendingRequest) {
        setDepositStep(1);
        setPendingDeposit(null);
        setIsDepositing(false);
        return showToast("Bạn đã gửi 1 lệnh nạp trước đó rồi. Vui lòng chờ Admin duyệt!", "error");
      }

      const newReq = {
        id: Date.now(),
        user: currentUser.name,
        userId: currentUser.id,
        amount: pendingDeposit.amount,
        bonusAmount: pendingDeposit.bonusAmount,
        voucherSpins: pendingDeposit.voucherSpins || 0, // <--- Đẩy lên Supabase
        voucherCode: pendingDeposit.voucherCode,
        status: 'Chờ duyệt',
        date: new Date().toLocaleDateString('vi-VN')
      };

      // ĐẨY YÊU CẦU LÊN SUPABASE
      const { data: insertedData, error } = await supabase.from('deposit_requests').insert([newReq]).select().single();

      if (error) {
        setIsDepositing(false);
        showToast("Lỗi gửi yêu cầu nạp tiền: " + error.message, 'error');
        return;
      }

      if (insertedData) {
        setDepositRequests([insertedData, ...depositRequests]);

        // Gọi Function báo Telegram
        await supabase.functions.invoke('telegram-bot', {
          body: { type: 'new_request', requestId: insertedData.id }
        });
      }

      // THÊM DÒNG NÀY VÀO ĐỂ BÁO EMAIL KHI KHÁCH BÁO NẠP TIỀN
      sendAdminAlert('YÊU CẦU NẠP TIỀN', `Khách ${currentUser.name} vừa báo đã chuyển khoản ${new Intl.NumberFormat('vi-VN').format(pendingDeposit.amount)}đ. Hãy vào kiểm tra và duyệt!`);

      if (pendingDeposit.bonusAmount > 0) {
        showToast(`Đã ghi nhận! Áp dụng mã ${pendingDeposit.voucherCode} (+${new Intl.NumberFormat('vi-VN').format(pendingDeposit.bonusAmount)}đ). Chờ duyệt!`);
      } else {
        // ... (code cũ giữ nguyên)
        showToast("Đã ghi nhận lệnh nạp! Vui lòng chờ Admin duyệt.");
      }

      // Reset về trạng thái ban đầu
      setDepositAmount('');
      setVoucherInput('');
      setPendingDeposit(null);
      setDepositStep(1);
      setIsDepositing(false);
    };

    const handleCancelDepositClient = async (id) => {
      setConfirmDialog({
        title: 'Hủy đơn nạp',
        message: 'Bạn có chắc chắn muốn hủy đơn nạp tiền này không?',
        onConfirm: async () => {
          const { error } = await supabase.from('deposit_requests').update({ status: 'Đã hủy' }).eq('id', id);
          if (error) {
            showToast("Lỗi khi hủy đơn: " + error.message, 'error');
          } else {
            setDepositRequests(depositRequests.map(req => req.id === id ? { ...req, status: 'Đã hủy' } : req));
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

    const handleCardSubmit = async (e) => {
      e.preventDefault();
      if (isDepositing || window.isSubmittingCard) return;
      window.isSubmittingCard = true;
      setLiveCardError(null);

      if (!cardCode.trim() || !cardSerial.trim()) {
        window.isSubmittingCard = false;
        return showToast("Vui lòng nhập đầy đủ Mã thẻ và Số Serial!", "error");
      }

      setIsDepositing(true);
      try {
        const { data, error } = await supabase.functions.invoke('submit-card', {
          body: {
            telco: cardTelco,
            amount: parseInt(cardAmount),
            code: cardCode,
            serial: cardSerial,
            userId: currentUser.id
          }
        });

        if (error) throw error;

        if (data.success) {
          showToast("Gửi thẻ thành công! Vui lòng chờ hệ thống xử lý trong ít phút.", "success");
          setCardCode('');
          setCardSerial('');
          // Add to local state to reflect UI immediately
          setDepositRequests(prev => [{
            id: data.requestId,
            userId: currentUser.id,
            amount: parseInt(cardAmount),
            status: 'Chờ duyệt',
            type: 'card',
            details: `Nạp thẻ ${cardTelco} - Mã: ${cardCode} - Seri: ${cardSerial}`,
            created_at: new Date().toISOString()
          }, ...prev]);

          sendAdminAlert('NẠP THẺ CÀO', `Khách ${currentUser.name} vừa nạp thẻ ${cardTelco} mệnh giá ${new Intl.NumberFormat('vi-VN').format(cardAmount)}đ. Thẻ đang được xử lý.`);
        } else {
          showToast(data.message || "Lỗi khi gửi thẻ. Vui lòng kiểm tra lại!", "error");
        }
      } catch (err) {
        console.error("Lỗi gửi thẻ:", err);
        showToast("Lỗi kết nối máy chủ nạp thẻ!", "error");
      } finally {
        setIsDepositing(false);
        window.isSubmittingCard = false;
      }
    };

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
        {renderNavbar()}
        <div className="w-full max-w-[1500px] mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-[1fr_1fr_350px] xl:grid-cols-[1fr_1fr_400px] gap-6">

          {/* CỘT 1: MÃ QR */}
          <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden h-fit">

            {/* OVERLAY THÀNH CÔNG */}
            {payosSuccess && (
              <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <Check size={40} className="text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl text-white font-bold mb-3 uppercase tracking-wider">Thành Công!</h3>
                <p className="text-sm md:text-base text-emerald-100 mb-6">Số tiền đã được cộng vào tài khoản của bạn.</p>
                <button onClick={() => setPayosSuccess(false)} className="px-6 py-2 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg">Đóng</button>
              </div>
            )}

            {!payosPaymentData && !payosSuccess && (
              <div className="absolute inset-0 bg-[#151D2F]/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
                <QrCode size={48} className="text-slate-500 mb-4" />
                <h3 className="text-white font-bold mb-2">{activePendingBankingReq ? "Đang có lệnh chờ" : "Chưa có mã QR"}</h3>
                <p className="text-sm text-slate-400">{activePendingBankingReq ? "Vui lòng hủy lệnh chờ ở bảng bên cạnh để tạo mã mới." : "Vui lòng điền số tiền ở Form bên cạnh và bấm Tạo lệnh để lấy mã quét."}</p>
              </div>
            )}

            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2"><QrCode className="text-blue-500" /> {payosPaymentData ? "Thanh Toán Tự Động" : "Nạp Tiền Chuyển Khoản"}</h2>
            {payosPaymentData && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4 mb-4 text-center shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/50">
                <p className="text-xs md:text-sm text-red-400 font-bold uppercase animate-pulse flex items-center justify-center gap-1.5">
                  <AlertCircle size={18} className="shrink-0" /> Cảnh báo: KHÔNG tải lại hoặc tắt trang web trong quá trình nạp để tránh phát sinh lỗi !!!
                </p>
              </div>
            )}
            <div className="mb-6 flex flex-col items-center justify-center">
              <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden border-2 border-white flex items-center justify-center w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
                {payosPaymentData ? (
                  <img src={`https://img.vietqr.io/image/${payosPaymentData.bin}-${payosPaymentData.accountNumber}-qr_only.png?amount=${payosPaymentData.amount}&addInfo=${encodeURIComponent(payosPaymentData.description)}&accountName=${encodeURIComponent(payosPaymentData.accountName)}`} alt="QR Code" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <QrCode size={48} className="text-slate-300" />
                  </div>
                )}
              </div>
              {payosPaymentData && (
                <div className="mt-4 bg-[#0B1120] px-5 py-2 rounded-full border border-rose-500/30 text-rose-500 font-black text-xl md:text-2xl tracking-[0.2em] font-mono shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  {formatPayosTime(payosTimeLeft)}
                </div>
              )}
            </div>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Ngân hàng:</span><span className="font-bold text-white">{payosPaymentData ? ({ '970416': 'ACB (Ngân hàng Á Châu)', '970436': 'Vietcombank', '970422': 'MBBank', '970415': 'VietinBank', '970418': 'BIDV', '970407': 'Techcombank', '970423': 'TPBank' }[payosPaymentData.bin] || payosPaymentData.bin) : "..."}</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Số tài khoản:</span><span className="font-bold text-emerald-400 flex items-center gap-2">{payosPaymentData ? payosPaymentData.accountNumber : "..."} <button onClick={() => copyToClipboard(payosPaymentData ? payosPaymentData.accountNumber : '')} className="relative z-20"><Copy size={14} className="text-slate-500 hover:text-white" /></button></span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Chủ tài khoản:</span><span className="font-bold text-white uppercase text-right ml-2 line-clamp-1">{payosPaymentData ? payosPaymentData.accountName : "..."}</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Nội dung CK:</span><span className="font-bold text-rose-400 flex items-center justify-end gap-2 ml-2 text-right">{payosPaymentData ? payosPaymentData.description : "..."} <button onClick={() => copyToClipboard(payosPaymentData ? payosPaymentData.description : '')} className="relative z-20 shrink-0"><Copy size={14} className="text-slate-500 hover:text-white" /></button></span></div>
              {(payosPaymentData || activePendingBankingReq || (depositStep === 2 && pendingDeposit)) && (
                <div className="flex justify-between border-b border-slate-800 pb-2 bg-emerald-500/10 p-2 rounded mt-2"><span className="text-slate-400 font-bold">Số tiền:</span><span className="font-black text-emerald-400">{new Intl.NumberFormat('vi-VN').format(payosPaymentData ? payosPaymentData.amount : displayAmount)} đ</span></div>
              )}
            </div>
            <p className="text-[10px] md:text-xs text-yellow-500 flex gap-1"><AlertCircle size={14} className="shrink-0" /> Vui lòng chuyển đúng Số tiền và Nội dung để được duyệt tự động.</p>
          </div>

          {/* CỘT 2: FORM */}
          <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 h-fit shadow-xl">
            <div className="flex gap-2 mb-4 p-1 bg-[#0B1120] rounded-xl border border-slate-800">
              <button
                onClick={() => setDepositMethod('banking')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${depositMethod === 'banking' || depositMethod === 'payos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Chuyển Khoản
              </button>
              <button
                onClick={() => setDepositMethod('card')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${depositMethod === 'card' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Thẻ Cào
              </button>
            </div>

            {depositMethod === 'banking' || depositMethod === 'payos' ? (
              <>
                <h3 className="font-bold text-white mb-4 text-lg">Nạp Tiền Chuyển Khoản</h3>
                {activePendingBankingReq ? (
                  <div className="text-center bg-[#0B1120] p-4 md:p-6 rounded-xl border border-indigo-500/30 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                      <QrCode size={30} className="text-indigo-400" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">Đang chờ thanh toán</h4>
                    <p className="text-sm text-slate-400 mb-6">Bạn đang có một lệnh nạp <strong className="text-indigo-400">{new Intl.NumberFormat('vi-VN').format(activePendingBankingReq.amount)}đ</strong> chờ xử lý. Hãy quét mã QR hoặc hủy lệnh để tạo mới.</p>

                    <button onClick={() => {
                      handleCancelDepositClient(activePendingBankingReq.id);
                    }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 md:py-4 rounded-xl font-bold transition-colors text-sm">Hủy / Tạo lệnh mới</button>
                  </div>
                ) : payosPaymentData ? (
                  <div className="text-center bg-[#0B1120] p-4 md:p-6 rounded-xl border border-indigo-500/30 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                      <QrCode size={30} className="text-indigo-400" />
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">Đang chờ thanh toán</h4>
                    <p className="text-sm text-slate-400 mb-6">Hãy sử dụng App Ngân hàng quét mã QR bên cạnh để chuyển số tiền <strong className="text-indigo-400">{new Intl.NumberFormat('vi-VN').format(payosPaymentData.amount)}đ</strong>.</p>

                    <button onClick={() => {
                      handleCancelDepositClient(`PAYOS_${payosPaymentData.orderCode}`);
                    }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 md:py-4 rounded-xl font-bold transition-colors text-sm">Hủy / Tạo lệnh mới</button>
                  </div>
                ) : (
                  <form onSubmit={handleCreatePayosLink}>
                    <p className="text-sm text-slate-400 mb-4">Hệ thống sẽ tạo mã QR chuyển khoản tự động. Tiền sẽ được cộng ngay lập tức sau khi chuyển thành công.</p>
                    <div className="mb-4">
                      <label className="text-xs text-slate-400 font-bold mb-1 block">Số tiền cần nạp (Tối thiểu 10.000đ)</label>
                      <input type="text" value={depositAmount} onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val) {
                          setDepositAmount(new Intl.NumberFormat('vi-VN').format(val));
                        } else {
                          setDepositAmount('');
                        }
                      }} placeholder="VD: 10.000" className="w-full p-4 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:border-indigo-500 outline-none text-lg font-bold" required />
                    </div>

                    <div className="mb-4">
                      <label className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><Ticket size={14} className="text-rose-400" /> Mã Khuyến Mãi (Nếu có)</label>
                      <input type="text" value={voucherInput} onChange={e => setVoucherInput(e.target.value.toUpperCase())} placeholder="Nhập mã voucher..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-rose-400 focus:border-rose-500 outline-none text-base font-bold uppercase" />
                    </div>

                    <button type="submit" disabled={isGlobalProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white transition-colors shadow-lg shadow-blue-600/20 text-base md:text-lg flex items-center justify-center gap-2">
                      {isGlobalProcessing ? <RefreshCw className="animate-spin" size={20} /> : "Tạo Mã QR Nạp"}
                    </button>
                  </form>
                )}
              </>
            ) : (

              <form onSubmit={handleCardSubmit} className="space-y-4">
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg text-rose-400 text-xs md:text-sm leading-relaxed">
                  <strong>Lưu ý quan trọng:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Nạp thẻ cào chịu phí cố định <strong>20%</strong> (Thẻ 100k nhận 80k).</li>
                    <li><strong className="text-red-500">CHỌN SAI MỆNH GIÁ SẼ BỊ TRỪ 50% GIÁ TRỊ THẺ HOẶC MẤT THẺ.</strong></li>
                  </ul>
                </div>

                {liveCardError && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 animate-fade-in shadow-sm">
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                    <span className="text-red-500 text-sm font-bold">{getCustomerFriendlyError(liveCardError)}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold mb-1 block">Nhà mạng</label>
                    <select value={cardTelco} onChange={e => setCardTelco(e.target.value)} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white outline-none">
                      <option value="VIETTEL">Viettel</option>
                      <option value="VINAPHONE">Vinaphone</option>
                      <option value="ZING">Zing</option>
                      <option value="VCOIN">Vcoin</option>
                      <option value="GARENA">Garena</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold mb-1 block">Mệnh giá</label>
                    <select value={cardAmount} onChange={e => setCardAmount(e.target.value)} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white outline-none">
                      <option value="10000">10.000 đ</option>
                      <option value="20000">20.000 đ</option>
                      <option value="50000">50.000 đ</option>
                      <option value="100000">100.000 đ</option>
                      <option value="200000">200.000 đ</option>
                      <option value="500000">500.000 đ</option>
                      <option value="1000000">1.000.000 đ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold mb-1 block">Số Serial</label>
                  <input type="text" value={cardSerial} onChange={e => setCardSerial(e.target.value)} placeholder="Nhập số seri..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold mb-1 block">Mã Thẻ (PIN)</label>
                  <input type="text" value={cardCode} onChange={e => setCardCode(e.target.value)} placeholder="Nhập mã thẻ..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none" required />
                </div>

                <button type="submit" disabled={isDepositing} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-4 rounded-xl font-bold text-white transition-colors shadow-lg shadow-emerald-600/20 text-base md:text-lg flex items-center justify-center gap-2">
                  {isDepositing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Nạp Thẻ Ngay'}
                </button>
              </form>
            )}

            <div className="mt-8 border-t border-slate-800 pt-4">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><History size={16} /> Lịch sử lệnh nạp của bạn</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar" onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.target;
                if (scrollTop + clientHeight >= scrollHeight - 10) setVisibleDepsClient(prev => prev + 5);
              }}>
                {depositRequests.filter(d => d.userId === currentUser?.id).length === 0 ? <p className="text-xs text-slate-500 italic">Chưa có lệnh nạp nào.</p> :
                  depositRequests.filter(d => d.userId === currentUser?.id).slice(0, visibleDepsClient).map(d => (
                    <div key={d.id} className="flex justify-between items-center text-sm bg-[#0B1120] p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="font-bold text-white block">
                          {(d.type === 'card' || (d.details && d.details.toLowerCase().includes('thẻ')) || String(d.id).startsWith('CARD')) ? '💳 Thẻ cào: ' : '🏦 Chuyển khoản: '}
                          {new Intl.NumberFormat('vi-VN').format(d.amount)}đ
                        </span>
                        {d.bonusAmount > 0 && <span className="text-[10px] text-rose-400 font-bold">+{new Intl.NumberFormat('vi-VN').format(d.bonusAmount)}đ (Mã: {d.voucherCode})</span>}
                        {d.status === 'Thất bại' && d.details && getCustomerFriendlyError(d.details) && (
                          <span className="text-[10px] text-red-400 block mt-0.5 leading-tight">{getCustomerFriendlyError(d.details)}</span>
                        )}
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {new Date(getRecordTime(d) || Date.now()).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 items-end whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold ${d.status === 'Thành công' ? 'bg-emerald-500/10 text-emerald-400' : d.status === 'Từ chối' || d.status === 'Thất bại' || d.status === 'Đã hủy' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{d.status === 'Chờ duyệt' && d.type === 'banking' ? 'Chờ thanh toán' : d.status}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* CỘT 3: ĐẶC QUYỀN NẠP */}
          <div className="bg-gradient-to-br from-[#151D2F] to-[#1e1423] p-5 rounded-2xl border border-pink-500/30 h-fit shadow-lg shadow-pink-500/5">
            <div className="flex items-center gap-4 mb-5 border-b border-slate-800/80 pb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-[#0B1120] rounded-xl flex items-center justify-center border border-pink-500/40 z-10 relative shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                  <Gift size={24} className="text-pink-400" />
                </div>
                <div className="absolute inset-0 bg-pink-500/20 blur-md rounded-xl"></div>
              </div>
              <div>
                <h3 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 text-lg uppercase tracking-wide">Đặc Quyền Nạp</h3>
                <p className="text-[11px] text-slate-400 font-medium">Chỉ dành cho bạn hôm nay</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="group bg-[#0B1120]/60 hover:bg-[#0B1120] transition-colors p-4 rounded-xl border border-slate-800/80 hover:border-pink-500/30 flex items-start gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-bl-full -z-0"></div>
                <Ticket size={22} className="text-pink-400 shrink-0 relative z-10 mt-0.5" />
                <div className="relative z-10">
                  <p className="text-sm text-slate-300">Nhận ngay <strong className="text-pink-400 text-base">1 Lượt Quay</strong> cho mỗi <strong className="text-white">20.000đ</strong> nạp vào.</p>
                  <p className="text-[11px] text-pink-500/80 mt-1.5 flex items-center gap-1 font-medium"><CheckCircle2 size={12} /> Tích lũy không giới hạn</p>
                </div>
              </div>

              <div className="group bg-[#0B1120]/60 hover:bg-[#0B1120] transition-colors p-4 rounded-xl border border-slate-800/80 hover:border-yellow-500/30 flex items-start gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-bl-full -z-0"></div>
                <Flame size={22} className="text-yellow-400 shrink-0 relative z-10 mt-0.5" />
                <div className="relative z-10">
                  <p className="text-sm text-slate-300">Thử vận may với giải thưởng cực khủng lên đến:</p>
                  <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mt-1 drop-shadow-sm">500.000 VNĐ</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        {renderFooter()}
      </div>
    );
  };

  const renderLichsuScreen = () => {
    // Bộ lọc dữ liệu siêu chuẩn cho từng Tab
    const myTransactions = transactionsDb.filter(t => t.user === currentUser?.name);

    const historyBuy = myTransactions.filter(t => t.type === 'buy_acc' && !t.action.includes('Cày thuê') && !t.action.includes('cày thuê'));
    const historyBossGame = myTransactions.filter(t => t.type === 'boss_game_topup');
    const historyRent = myTransactions.filter(t => t.type?.includes('rent') || t.type?.includes('fund') || t.type === 'deposit_refund' || t.action?.toLowerCase().includes('thuê nick') || t.action?.toLowerCase().includes('quy đổi') || t.action?.toLowerCase().includes('hoàn cọc'));
    const historySpin = myTransactions.filter(t => t.type === 'spin_win' && t.amount !== 0 && !t.isSpinCost);
    const historyBoost = boostingRequests.filter(r => r.user === currentUser?.name);
    const historyDeposit = depositRequests.filter(d => d.userId === currentUser?.id);
    const historyTransfer = myTransactions.filter(t => t.type === 'transfer_out' || t.type === 'transfer_in');

    // Cấu hình các Tab
    const tabs = [
      { id: 'buy', name: 'Mua Acc', icon: <Gamepad2 size={16} />, data: historyBuy },
      { id: 'bossgame', name: 'Nạp Game Boss', icon: <Swords size={16} />, data: historyBossGame },
      { id: 'rent', name: 'Thuê Acc', icon: <Clock size={16} />, data: historyRent },
      { id: 'spin', name: 'Vòng Quay', icon: <Gift size={16} />, data: historySpin },
      { id: 'boost', name: 'Cày Thuê', icon: <Target size={16} />, data: historyBoost },
      { id: 'deposit', name: 'Nạp Tiền', icon: <Wallet size={16} />, data: historyDeposit },
      { id: 'transfer', name: 'Chuyển Tiền', icon: <ArrowLeftRight size={16} />, data: historyTransfer }
    ];

    const currentData = [...(tabs.find(t => t.id === historyTab)?.data || [])].sort((a, b) => getRecordTime(b) - getRecordTime(a));
    const visibleData = currentData.slice(0, visibleHistoryCount); // Chỉ cắt lấy số lượng đang hiển thị

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
        {renderNavbar()}
        <div className="w-full max-w-5xl mx-auto mt-4 md:mt-10 p-4 md:p-8 bg-[#151D2F] rounded-2xl border border-slate-800 text-center flex flex-col items-center shadow-xl">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 mb-4 md:mb-6 shadow-inner"><History className="w-8 h-8 md:w-10 md:h-10" /></div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 uppercase tracking-wider">Lịch Sử Giao Dịch</h2>

          {/* MENU CÁC TAB LỊCH SỬ */}
          <div className="flex gap-2 overflow-x-auto w-full pb-3 mb-6 border-b border-slate-800 scrollbar-hide justify-start md:justify-center">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setHistoryTab(tab.id); setVisibleHistoryCount(5); setExpandedTx(null); }} // Reset về 5 khi đổi tab
                className={`px-4 py-2.5 font-bold rounded-lg whitespace-nowrap flex items-center gap-2 text-sm transition-all ${historyTab === tab.id ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500' : 'bg-[#0B1120] text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800'}`}
              >
                {tab.icon} {tab.name} <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full">{tab.data.length}</span>
              </button>
            ))}
          </div>

          {/* KHUNG DANH SÁCH & CUỘN VÔ HẠN */}
          <div
            className="w-full text-left bg-[#0B1120] rounded-xl overflow-auto max-h-[500px] border border-slate-800 custom-scrollbar relative"
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.target;
              if (scrollTop + clientHeight >= scrollHeight - 20) setVisibleHistoryCount(prev => prev + 5); // Kéo xuống đáy nảy thêm 5 dòng
            }}
          >
            {visibleData.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center text-slate-500 h-full min-h-[200px]">
                <AlertCircle size={40} className="mb-3 opacity-30" />
                <p>Chưa có giao dịch nào ở mục này.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* 1. RENDER LỊCH SỬ MUA ACC (CÓ TÍNH NĂNG MỞ RỘNG XEM PASS) */}
                {historyTab === 'bossgame' && visibleData.map(tx => {
                  const details = tx.accDetails || {};
                  return (
                    <div key={tx.id} className="bg-[#1A233A] border border-slate-700/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          <Swords size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{tx.action}</h4>
                          <p className="text-xs text-slate-400">{tx.date} • Mã đơn: <span className="font-mono text-slate-300">{tx.id}</span></p>
                          {details.rewards && (
                            <p className="text-xs text-amber-400 font-semibold mt-1">
                              Quà: {details.rewards.attacks ? `+${new Intl.NumberFormat('vi-VN').format(details.rewards.attacks)} lượt` : ''}
                              {details.rewards.royal_chests ? ` • +${details.rewards.royal_chests} Rương HK` : ''}
                              {details.rewards.coins ? ` • +${new Intl.NumberFormat('vi-VN').format(details.rewards.coins)} Xu` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-rose-400 font-black text-base">-{new Intl.NumberFormat('vi-VN').format(tx.amount)}đ</span>
                        <div className="mt-1">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {tx.status || 'Thành công'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {historyTab === 'buy' && visibleData.map(tx => (
                  <div key={tx.id} className="border-b border-slate-800 flex flex-col">
                    <div
                      className="p-4 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors cursor-pointer"
                      onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm md:text-base">{tx.action}</p>
                          {expandedTx === tx.id ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-500 mt-1">{tx.date}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-black text-base md:text-lg text-rose-500">-{new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ</p>
                        <p className="text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 text-emerald-500 bg-emerald-500/10">Thành công</p>
                      </div>
                    </div>
                    {expandedTx === tx.id && tx.accDetails && (
                      <div className="bg-slate-900/80 p-4 border-t border-slate-800 animate-fade-in text-sm">
                        <p className="text-emerald-400 font-bold mb-3 flex items-center gap-2"><CheckCircle2 size={16} /> Thông tin tài khoản bạn đã mua (Mã: #{tx.accDetails.code}):</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-400 text-xs font-bold">Tài khoản Game:</span>
                              <div className="flex items-center">
                                <input readOnly value={tx.accDetails.username} className="w-full bg-[#0B1120] text-white p-2 rounded-l border border-slate-700 outline-none font-mono" />
                                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.accDetails.username); }} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r border border-slate-700 transition-colors"><Copy size={16} /></button>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-400 text-xs font-bold">Mật khẩu Game:</span>
                              <div className="flex items-center">
                                <input readOnly value={tx.accDetails.password} className="w-full bg-[#0B1120] text-white p-2 rounded-l border border-slate-700 outline-none font-mono" />
                                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.accDetails.password); }} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r border border-slate-700 transition-colors"><Copy size={16} /></button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-400 text-xs font-bold">Email đăng ký:</span>
                              <div className="flex items-center">
                                <input readOnly value={tx.accDetails.email} className="w-full bg-[#0B1120] text-white p-2 rounded-l border border-slate-700 outline-none font-mono" />
                                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.accDetails.email); }} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r border border-slate-700 transition-colors"><Copy size={16} /></button>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-400 text-xs font-bold">SĐT xác minh:</span>
                              <div className="flex items-center">
                                <input readOnly value={tx.accDetails.phone} className="w-full bg-[#0B1120] text-white p-2 rounded-l border border-slate-700 outline-none font-mono" />
                                <button onClick={(e) => { e.stopPropagation(); copyToClipboard(tx.accDetails.phone); }} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-r border border-slate-700 transition-colors"><Copy size={16} /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {copiedText && <p className="text-emerald-400 text-xs mt-3 italic animate-pulse text-center bg-emerald-500/10 py-1 rounded">Đã copy vào khay nhớ tạm!</p>}
                      </div>
                    )}
                  </div>
                ))}

                {/* 2. RENDER LỊCH SỬ THUÊ ACC */}
                {historyTab === 'rent' && visibleData.map(tx => (
                  <div key={tx.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                    <div>
                      <p className="font-bold text-white text-sm md:text-base">{tx.action}</p>
                      <p className="text-[10px] md:text-xs text-slate-500 mt-1">{tx.date}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className={`font-black text-base md:text-lg ${tx.amount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {tx.amount > 0 ? '-' : '+'}{new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ
                      </p>
                      <p className={`text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 
                        ${tx.status.includes('+') || tx.status === 'Thành công' ? 'text-emerald-500 bg-emerald-500/10'
                          : tx.status.includes('cọc') ? 'text-yellow-500 bg-yellow-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                        {tx.status}
                      </p>
                      {tx.accDetails && tx.accDetails.balanceAfter !== undefined && (
                        <div className="mt-1.5 flex flex-col md:items-end text-[10px]">
                          <p className="text-slate-400">Dư ví: <span className="font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.balanceAfter)}đ</span></p>
                          {tx.accDetails.fundAfter !== undefined && (
                            <p className="text-slate-400">Dư quỹ: <span className="font-bold text-yellow-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.fundAfter)}đ</span></p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* 3. RENDER LỊCH SỬ VÒNG QUAY (TRÚNG THƯỞNG) */}
                {historyTab === 'spin' && visibleData.map(tx => (
                  <div key={tx.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                    <div>
                      <p className="font-bold text-white text-sm md:text-base"><Gift size={14} className="inline mr-1 text-rose-500" /> {tx.action}</p>
                      <p className="text-[10px] md:text-xs text-slate-500 mt-1">{tx.date}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-black text-base md:text-lg text-emerald-400">
                        {tx.isSpinCost ? `+${Math.abs(tx.amount)} Lượt` : `+${new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ`}
                      </p>
                      <p className="text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 text-emerald-500 bg-emerald-500/10">{tx.status}</p>
                    </div>
                  </div>
                ))}

                {/* 4. RENDER LỊCH SỬ CÀY THUÊ */}
                {historyTab === 'boost' && visibleData.map(req => (
                  <div key={req.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded shadow-sm">GÓI ĐẶT</span>
                        <p className="font-bold text-white text-sm md:text-base">{req.boostingTitle}</p>
                      </div>
                      {req.info?.username && (
                        <p className="text-[10px] md:text-xs text-slate-400 mt-1">
                          {req.info.loginMethod === 'Không Cần' ? (
                            <>Mã sự kiện / Link: <span className="font-mono text-white">{req.info.username}</span></>
                          ) : (
                            <>TK: <span className="font-mono text-white">{req.info.username}</span> | Nền tảng: <span className="text-white">{req.info.loginMethod}</span></>
                          )}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-500 mt-1.5">{req.date}</p>
                    </div>
                    <div className="text-left md:text-right">
                      {req.status === 'Đã hủy' && req.info?.amount > 0 && (
                        <p className="text-xs text-emerald-400 font-bold mb-1">Đã hoàn +{new Intl.NumberFormat('vi-VN').format(req.info.amount)}đ</p>
                      )}
                      <p className={`text-xs font-bold inline-block px-3 py-1 rounded mt-1 
                        ${req.status === 'Hoàn thành' ? 'text-emerald-500 bg-emerald-500/10' : req.status === 'Đang cày' ? 'text-blue-400 bg-blue-500/10' : req.status === 'Đã hủy' ? 'text-rose-400 bg-rose-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                        {req.status === 'Hoàn thành' ? <CheckCircle2 size={12} className="inline mr-1" /> : req.status === 'Đang cày' ? <RefreshCw size={12} className="inline mr-1 animate-spin" /> : req.status === 'Đã hủy' ? <RotateCcw size={12} className="inline mr-1" /> : <Clock size={12} className="inline mr-1" />}
                        {req.status || 'Chờ xử lý'}
                      </p>
                    </div>
                  </div>
                ))}

                {/* 5. RENDER LỊCH SỬ NẠP TIỀN */}
                {historyTab === 'deposit' && visibleData.map(d => (
                  <div key={d.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                    <div>
                      <p className="font-bold text-white text-sm md:text-base"><Wallet size={14} className="inline mr-1 text-emerald-500" /> Nạp tiền chuyển khoản</p>
                      <p className="text-[10px] md:text-xs text-slate-500 mt-1">{new Date(d.id).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-black text-base md:text-lg text-emerald-400">
                        +{new Intl.NumberFormat('vi-VN').format(d.amount)}đ
                      </p>
                      {d.bonusAmount > 0 && <p className="text-[10px] text-rose-400 font-bold mb-1">+ {new Intl.NumberFormat('vi-VN').format(d.bonusAmount)}đ (Voucher)</p>}
                      <p className={`text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 
                        ${d.status === 'Thành công' ? 'text-emerald-500 bg-emerald-500/10' : d.status === 'Từ chối' || d.status === 'Đã hủy' ? 'text-rose-400 bg-rose-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                        {d.status}
                      </p>
                      {d.status === 'Chờ duyệt' && (
                        <button onClick={() => handleCancelDepositClient(d.id)} className="text-[10px] text-rose-400 hover:text-rose-300 underline font-bold ml-2 block md:inline-block">Hủy đơn</button>
                      )}
                    </div>
                  </div>
                ))}

                {/* 6. RENDER LỊCH SỬ CHUYỂN TIỀN */}
                {historyTab === 'transfer' && visibleData.map(tx => (
                  <div key={tx.id} className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center hover:bg-slate-800/50 gap-2 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${tx.type === 'transfer_out' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                          <ArrowLeftRight size={14} className={tx.type === 'transfer_out' ? 'text-rose-400' : 'text-emerald-400'} />
                        </span>
                        <p className="font-bold text-white text-sm md:text-base">{tx.action}</p>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-500 mt-1 ml-9">{tx.date}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className={`font-black text-base md:text-lg ${tx.type === 'transfer_out' ? 'text-rose-500' : 'text-emerald-400'}`}>
                        {tx.type === 'transfer_out' ? '-' : '+'}{new Intl.NumberFormat('vi-VN').format(tx.amount)}đ
                      </p>
                      <p className="text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 text-emerald-500 bg-emerald-500/10">{tx.status}</p>
                      {tx.accDetails && tx.accDetails.balanceAfter !== undefined && (
                        <div className="mt-1.5 flex flex-col md:items-end text-[10px]">
                          <p className="text-slate-400">Dư ví: <span className="font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.balanceAfter)}đ</span></p>
                          {tx.accDetails.fee > 0 && (
                            <p className="text-slate-400">Phí: <span className="font-bold text-rose-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.fee)}đ</span></p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  };
  const renderCayThueScreen = () => {
    const boostingTabs = [
      { id: 'rank', label: 'Cày Rank' },
      { id: 'event', label: 'Cày Sự Kiện' }
    ];

    // Hàm Helper lấy tên game thật
    const getGameName = (gameStr) => {
      if (!gameStr) return '';
      try { return JSON.parse(gameStr).name || gameStr; } catch (e) { return gameStr; }
    };

    // Tìm danh sách Game duy nhất cho Tab hiện tại
    const currentTabGames = ['Tất cả', ...new Set(boostingDb.filter(b => (b.type || 'rank') === activeBoostingTab).map(b => getGameName(b.game)))];

    const filteredBoosting = boostingDb.filter(b => {
      const type = b.type || 'rank'; // Mặc định là rank nếu không có type
      const matchType = type === activeBoostingTab;
      const gName = getGameName(b.game);
      const matchGame = activeBoostingGameClient === 'Tất cả' || gName === activeBoostingGameClient;
      return matchType && matchGame;
    }).sort((a, b) => {
      let aFeatured = false, bFeatured = false;
      try { aFeatured = JSON.parse(a.game).isFeatured || false; } catch (e) { }
      try { bFeatured = JSON.parse(b.game).isFeatured || false; } catch (e) { }
      return (bFeatured === true) - (aFeatured === true);
    });

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
        {renderNavbar()}
        {/* Đã mở rộng max-w và thêm lề phải (pr-24) để né 3 nút liên hệ */}
        <div className="w-full max-w-[1400px] mx-auto mt-8 px-4 md:px-6 lg:pr-24">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center gap-2"><Target className="text-blue-500" /> Dịch Vụ Cày Thuê</h2>
            <p className="text-slate-400 mt-2 text-sm md:text-base">Uy tín, tốc độ, bảo mật tuyệt đối. Giá tốt nhất thị trường.</p>
          </div>

          {/* --- KHU VỰC CHỌN LỌC GAME VÀ THỂ LOẠI --- */}
          <div className="flex flex-col items-center justify-center gap-3 mb-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {boostingTabs.map(tab => (
                <button key={tab.id} onClick={() => { setActiveBoostingTab(tab.id); setActiveBoostingGameClient('Tất cả'); }} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${activeBoostingTab === tab.id ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {currentTabGames.map(game => {
                let gAvatar = null;
                if (game !== 'Tất cả') {
                  const matchedItem = boostingDb.find(b => getGameName(b.game) === game);
                  if (matchedItem) {
                    try { gAvatar = JSON.parse(matchedItem.game).avatar; } catch (e) { }
                  }
                }
                return (
                  <button key={game} onClick={() => setActiveBoostingGameClient(game)} className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${activeBoostingGameClient === game ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
                    {gAvatar && <img src={gAvatar} alt={game} className="w-4 h-4 rounded-full object-cover shrink-0" />}
                    {game === 'Tất cả' ? 'Tất cả Game' : game}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tự động chia lên 4 cột trên màn hình rộng (xl) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredBoosting.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#151D2F] shadow-lg">
                <Target size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">Đang cập nhật các gói dịch vụ cho mục này...</p>
              </div>
            ) : filteredBoosting.map((b, index) => {
              let gName = b.game || '';
              let gAvatar = null;
              try {
                const parsed = JSON.parse(b.game);
                gName = parsed.name || '';
                gAvatar = parsed.avatar || null;
              } catch (e) { }

              return renderBoostingCard(b, index);
            })}
          </div>
          {/* LỊCH SỬ CÀY THUÊ CHO BẠN */}
          <div className="mt-16 border-t border-slate-800 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <History size={24} className="text-blue-500" />
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Đơn cày thuê của bạn</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {boostingRequests.filter(r => r.user === currentUser?.name).length === 0 ? (
                <div className="bg-[#151D2F] p-10 rounded-2xl border border-slate-800 text-center text-slate-500 border-dashed">
                  <Target size={40} className="mx-auto mb-3 opacity-20" />
                  <p>Bạn chưa đặt đơn cày thuê nào ở shop.</p>
                </div>
              ) : (
                boostingRequests.filter(r => r.user === currentUser?.name).map(req => (
                  <div key={req.id} className="bg-[#151D2F] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center hover:border-blue-500/30 transition-colors shadow-lg">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-lg shadow-lg shadow-blue-600/20">{req.boostingTitle}</span>
                        <span className="text-xs text-slate-500 font-medium">{req.date}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-slate-300">Tài khoản: <span className="text-white font-mono font-bold bg-[#0B1120] px-2 py-0.5 rounded">{req.info.username}</span></p>
                        <p className="text-[11px] text-slate-500">Hình thức: <span className="text-slate-400 font-bold">{req.info.loginMethod}</span></p>
                      </div>
                    </div>

                    <div className="w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 flex items-center justify-between md:justify-end gap-6">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Trạng thái đơn</p>
                        <div className={`flex items-center gap-1.5 font-black text-sm ${req.status === 'Hoàn thành' ? 'text-emerald-400' : req.status === 'Đang cày' ? 'text-blue-400' : 'text-yellow-500'}`}>
                          {req.status === 'Hoàn thành' ? <CheckCircle2 size={16} /> : req.status === 'Đang cày' ? <RefreshCw size={16} className="animate-spin" /> : <Clock size={16} />}
                          {req.status || 'Chờ xử lý'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  };

  const renderVongQuay = () => {
    // CHỈ LẤY NHỮNG QUÀ CÓ SỐ LƯỢNG LỚN HƠN 0
    let activeDb = (playMode === 'money' ? wheelItemsMoneyDb : wheelItemsSpinDb).filter(item => item.quantity === undefined || item.quantity > 0);
    // 1. Chống sập khi F5 (Đang tải dữ liệu) hoặc Admin chưa cài bất kỳ quà nào
    if (wheelItemsMoneyDb.length === 0 && wheelItemsSpinDb.length === 0) {
      return (
        <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans flex flex-col">
          {renderNavbar()}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pb-20">
            <Gift size={64} className="text-slate-700 mb-4 animate-bounce" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Vòng Quay Đang Bảo Trì</h2>
            <p className="text-slate-400 max-w-md">Dữ liệu đang tải hoặc Admin chưa cài phần thưởng. Vui lòng quay lại sau nhé!</p>
            <button onClick={() => setCurrentView('dashboard')} className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg">Về Trang Chủ</button>
          </div>
        </div>
      );
    }

    // 2. Nếu khách chọn quay Tiền mà Tiền trống (nhưng Lượt có quà), thì lấy tạm Lượt để không sập web
    if (activeDb.length === 0) {
      activeDb = playMode === 'money' ? wheelItemsSpinDb : wheelItemsMoneyDb;
    }

    const handleSpin = async () => {
      if (!currentUser) {
        showToast("Vui lòng đăng nhập tài khoản để tham gia Vòng Quay!", 'error');
        setCurrentView('login');
        return;
      }

      if (isSpinning) return;
      setIsSpinning(true); // Khóa nút bấm ngay lập tức

      const isUsingMoney = playMode === 'money';
      const requiredCost = isUsingMoney ? wheelConfig.moneyCost : wheelConfig.spinCost;

      // Mở nhạc vòng quay
      const spinAudio = document.getElementById('spinSound');
      if (spinAudio) {
        spinAudio.currentTime = 0; spinAudio.volume = 0.5;
        spinAudio.play().catch(e => console.log("Trình duyệt chặn:", e));
      }

      // 1. GIAO MỌI QUYỀN SINH SÁT CHO SERVER (Trừ tiền + Quay quà + Phát thưởng diễn ra trong 0.1s)
      const { data, error } = await supabase.rpc('m_spin_wheel', {
        khach_id: currentUser.id,
        p_wheel_type: playMode,
        p_cost: requiredCost
      });

      // Nếu khách hack code sửa giá tiền thành 0, Server sẽ từ chối và báo lỗi
      if (error || !data.success) {
        setIsSpinning(false);
        if (spinAudio) spinAudio.pause();
        return showToast(error?.message || data?.message || "Lỗi vòng quay!", 'error');
      }

      // 2. ĐỌC KẾT QUẢ TỪ SERVER TRẢ VỀ ĐỂ DỰNG HIỆU ỨNG (Animation)
      const winningIndex = activeDb.findIndex(item => item.id === data.item_id);
      if (winningIndex === -1) {
        setIsSpinning(false);
        return showToast("Lỗi đồng bộ vòng quay!", 'error');
      }

      const winningItem = activeDb[winningIndex];

      // Tính góc quay sao cho kim chỉ đúng vào ô trúng
      const N = activeDb.length;
      const sliceAngle = 360 / N;
      const centerAngle = winningIndex * sliceAngle + (sliceAngle / 2);
      const currentBase = rotation % 360;
      const randomOffset = (Math.random() * sliceAngle * 0.6) - (sliceAngle * 0.3);
      const targetRotation = rotation + (360 - currentBase) + 1800 + (360 - centerAngle) + randomOffset;

      setRotation(targetRotation); // Bắt đầu xoay hình ảnh

      // Đợi 4 giây cho hình ảnh xoay xong thì tung Pop-up chúc mừng
      setTimeout(async () => {
        setIsSpinning(false);
        if (spinAudio) { spinAudio.pause(); spinAudio.currentTime = 0; }

        const winAudio = document.getElementById('winSound');
        const loseAudio = document.getElementById('loseSound');
        if (winningItem.type !== 'none') {
          if (winAudio) { winAudio.currentTime = 0; winAudio.volume = 0.8; winAudio.play().catch(e => { }); }
        } else {
          if (loseAudio) { loseAudio.currentTime = 0; loseAudio.volume = 0.8; loseAudio.play().catch(e => { }); }
        }

        // Đồng bộ lại tiền từ Server trả về lên giao diện Web
        const updatedUser = {
          ...currentUser,
          balance: data.new_balance,
          spins: data.new_spins,
          rentFund: data.new_fund
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
        setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));

        // Kéo 2 dòng lịch sử mới nhất (Vé quay & Trúng thưởng) để hiển thị bên phải
        const { data: newTxs } = await supabase.from('transactions').select('*').eq('user', currentUser.name).order('created_at', { ascending: false }).limit(2);
        if (newTxs) {
          setTransactionsDb(prev => {
            const filtered = prev.filter(p => !newTxs.find(n => n.id === p.id));
            return [...newTxs, ...filtered];
          });
        }

        // Hiển thị bảng chúc mừng
        setGiftModalData({
          item: winningItem,
          prizeValue: Number(winningItem.value) || 0,
          prizeType: winningItem.type,
          isLost: winningItem.type === 'none'
        });
        setIsGiftOpened(true);
      }, 4000);
    };
    const colors = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b'];
    const conicStops = activeDb.map((item, idx) => {
      const startAngle = (idx * 360) / activeDb.length;
      const endAngle = ((idx + 1) * 360) / activeDb.length;
      // Ưu tiên màu Admin chọn, nếu lỗi thì lấy màu mặc định
      const sliceColor = item.color || colors[idx % colors.length];
      return `${sliceColor} ${startAngle}deg ${endAngle}deg`;
    }).join(', ');

    // LỌC RA 5 NGƯỜI QUAY TRÚNG MỚI NHẤT ĐỂ CHẠY CHỮ
    // LỌC RA 5 NGƯỜI QUAY TRÚNG (BỎ TRƯỢT VÀ BỎ TRÚNG LƯỢT QUAY)
    const recentWinners = transactionsDb.filter(t =>
      t.type === 'spin_win' &&
      t.amount !== 0 &&       // Bỏ các ô Trượt (có giá trị = 0)
      !t.isSpinCost           // Bỏ các giải trúng Lượt quay
    ).slice(0, 5);

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10 overflow-hidden relative">        {renderNavbar()}
        <div className="w-full max-w-[1400px] mx-auto px-3 md:px-4 lg:pr-28 mt-2 md:mt-8 text-center relative z-10">

          {/* BỐ CỤC CHIA CỘT TRÊN MÁY TÍNH (VÒNG QUAY TRÁI - LỊCH SỬ PHẢI) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 mb-12 items-start">

            {/* CỘT TRÁI: CHỨA VÒNG QUAY (Chiếm 2 phần) */}
            <div className="lg:col-span-2 flex flex-col items-center">

              {/* TIÊU ĐỀ NẰM NGAY ĐẦU CỘT TRÁI, CÂN ĐỐI VỚI VÒNG QUAY */}
              <h2 className="text-xl md:text-4xl font-black text-white flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]"><Gift className="text-rose-500 w-6 h-6 md:w-9 md:h-9" /> VÒNG QUAY NHÂN PHẨM</h2>

              <div className="flex bg-[#151D2F] p-1 md:p-1.5 rounded-xl border border-slate-800 shadow-lg mx-auto w-fit mb-4 md:mb-8 relative z-20">
                {wheelItemsMoneyDb.length > 0 && (
                  <button onClick={() => setPlayMode('money')} className={`px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${playMode === 'money' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><Wallet size={16} /> Tiền VNĐ</button>
                )}
                {wheelItemsSpinDb.length > 0 && (
                  <button onClick={() => setPlayMode('spin')} className={`px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${playMode === 'spin' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><Ticket size={16} /> Lượt Quay</button>
                )}
              </div>

              {/* THANH THÔNG BÁO NGƯỜI TRÚNG THƯỞNG (MARQUEE) */}
              {recentWinners.length > 0 && (
                <div className="w-full max-w-xl mx-auto overflow-hidden bg-rose-950/20 border border-rose-500/30 rounded-full py-2 mb-6 relative flex items-center shadow-inner group">
                  <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-r from-[#0B1120] to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-12 md:w-16 bg-gradient-to-l from-[#0B1120] to-transparent z-10 pointer-events-none"></div>
                  <div className="flex whitespace-nowrap animate-marquee w-max group-hover:pause">
                    {recentWinners.map((tx, idx) => {
                      const dateTime = tx.date;

                      // Dùng Regex "tận diệt" mọi chữ dư thừa (Cả lịch sử cũ và mới)
                      const cleanPrizeName = tx.action
                        .replace(/Trúng phần thưởng:/gi, '')
                        .replace(/Trúng thưởng:/gi, '')
                        .replace(/Cộng/gi, '')
                        .trim();

                      return (
                        <span key={idx} className="text-white text-xs md:text-sm mx-6 flex items-center gap-2">
                          <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                          <span className="text-slate-400">[{dateTime}]</span>
                          <span className="font-bold text-blue-400">{tx.user}</span> vừa trúng phần thưởng
                          <span className="font-black text-rose-400">{cleanPrizeName}</span>
                        </span>
                      )
                    })}
                    {recentWinners.map((tx, idx) => {
                      const dateTime = tx.date;
                      const cleanPrizeName = tx.action
                        .replace(/Trúng phần thưởng:/gi, '')
                        .replace(/Trúng thưởng:/gi, '')
                        .replace(/Cộng/gi, '')
                        .trim();

                      return (
                        <span key={`dup-${idx}`} className="text-white text-xs md:text-sm mx-6 flex items-center gap-2">
                          <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                          <span className="text-slate-400">[{dateTime}]</span>
                          <span className="font-bold text-blue-400">{tx.user}</span> vừa trúng phần thưởng
                          <span className="font-black text-rose-400">{cleanPrizeName}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* KHUNG VÒNG QUAY */}
              <div className="relative shrink-0 w-[260px] h-[260px] md:w-[380px] md:h-[380px] mx-auto flex items-center justify-center p-2 md:p-6 mb-6 md:mb-12 mt-2 md:mt-4">
                <div className="absolute inset-0 rounded-full blur-[40px] md:blur-[50px] opacity-60 animate-pulse-slow bg-gradient-to-br from-emerald-500 via-blue-600 to-rose-500" style={{ transform: 'scale(1.1)' }}></div>
                <div className="absolute inset-0 md:inset-2 rounded-full border-[4px] md:border-[6px] border-slate-800 shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                  style={{
                    backgroundImage: 'conic-gradient(from 0deg, #34d399, #60a5fa, #f43f5e, #34d399)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'destination-out',
                    maskComposite: 'exclude',
                    animation: 'rotate360 4s linear infinite'
                  }}></div>

                <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-3 h-3 md:w-4 md:h-4 bg-emerald-400 rounded-full opacity-50 blur-[2px] animate-float"></div>
                <div className="absolute top-1/2 -right-6 md:-right-10 w-2 h-2 md:w-3 md:h-3 bg-rose-400 rounded-full opacity-60 blur-[2px] animate-float-delayed"></div>
                <div className="absolute -bottom-6 left-1/4 w-4 h-4 md:w-5 md:h-5 bg-blue-400 rounded-full opacity-40 blur-[2px] animate-float"></div>
                <div className="absolute -bottom-2 -right-1 md:-bottom-4 md:-right-2 w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full opacity-50 blur-[2px] animate-float-delayed"></div>

                {/* MŨI TÊN */}
                <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 z-40 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="animate-bounce md:w-[50px] md:h-[50px]">
                    <path d="M12 22 L2 2 h20 Z" />
                  </svg>
                </div>

                {/* VÒNG QUAY CHÍNH */}
                <div className="w-full h-full relative rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] border-[5px] md:border-[10px] border-slate-700 bg-[#0B1120] z-20"
                  style={{
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                    transform: `rotate(${rotation}deg)`
                  }}>
                  <div className="absolute inset-0 rounded-full border-[4px] border-slate-700 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden" style={{ background: `conic-gradient(${conicStops})` }}>
                    {activeDb.map((w, idx) => {
                      const angle = (idx * 360) / activeDb.length + (180 / activeDb.length);
                      let shortLabel = w.name;
                      if (w.type === 'none') shortLabel = 'TRƯỢT';
                      else if (w.type === 'money') shortLabel = `+${w.value >= 1000 ? w.value / 1000 + 'K' : w.value} VNĐ`;
                      else if (w.type === 'spin') shortLabel = `+${w.value} LƯỢT`;
                      else if (w.type === 'fund') shortLabel = `+${w.value >= 1000 ? w.value / 1000 + 'K' : w.value} QUỸ`;

                      return (
                        <div key={w.id} className="absolute top-1/2 left-1/2 flex items-center justify-end"
                          style={{ width: '50%', height: '30px', marginTop: '-15px', transformOrigin: 'left center', transform: `rotate(${angle - 90}deg)` }}>
                          {w.image ? (
                            <img src={w.image} className="w-8 h-8 md:w-10 md:h-10 rounded-md object-contain mr-3 md:mr-4 shadow-lg drop-shadow-lg" style={{ transform: 'rotate(90deg)' }} alt="prize" />
                          ) : (
                            <div className="absolute right-4 md:right-6 text-white font-black text-[10px] md:text-[13px] uppercase drop-shadow-lg text-center whitespace-nowrap"
                              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)', transform: 'rotate(90deg)' }} title={w.name}>
                              {shortLabel}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CỤC TRUNG TÂM */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-full border-[4px] md:border-[6px] border-slate-700 flex items-center justify-center z-30 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  <Gamepad2 className="text-rose-500 animate-pulse w-5 h-5 md:w-7 md:h-7" />
                </div>
              </div>

              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 md:px-12 py-4 md:py-4 rounded-full font-black text-xl md:text-2xl shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all w-full max-w-sm mx-auto block ${isSpinning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:from-rose-500 hover:to-pink-500 hover:scale-105'}`}
              >
                {isSpinning ? 'ĐANG QUAY...' : `QUAY NGAY (${playMode === 'money' ? new Intl.NumberFormat('vi-VN').format(wheelConfig.moneyCost) + 'đ' : wheelConfig.spinCost + ' Lượt'})`}
              </button>
            </div>

            {/* CỘT PHẢI: LỊCH SỬ QUAY (Chiếm 1 phần, có thanh cuộn dọc) */}
            <div className="lg:col-span-1 flex flex-col bg-[#151D2F] rounded-2xl border border-slate-800 overflow-hidden shadow-xl h-[350px] md:h-[550px] w-full mt-4 lg:mt-[110px]">
              <div className="p-4 border-b border-slate-800 bg-[#0B1120] shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History size={18} className="text-blue-400" /> Lịch sử Vòng quay
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2" onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.target;
                if (scrollTop + clientHeight >= scrollHeight - 10) setVisibleSpinsClient(prev => prev + 5);
              }}>
                {transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-slate-500 text-sm p-4">Bạn chưa có lịch sử quay nào.</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).slice(0, visibleSpinsClient).map((tx, idx) => {
                      // Chuẩn hóa text cho các bản ghi cũ không có dấu tiếng Việt
                      let displayAction = tx.action;
                      displayAction = displayAction.replace(/Quay vong quay - Khong trung/gi, 'Chúc may mắn lần sau');
                      displayAction = displayAction.replace(/Quay vòng quay - Không trúng/gi, 'Chúc may mắn lần sau');
                      displayAction = displayAction.replace(/Trung phan thuong:/gi, 'Trúng phần thưởng:');
                      displayAction = displayAction.replace(/Trung thuong:/gi, 'Trúng thưởng:');
                      displayAction = displayAction.replace(/Cong /gi, 'Cộng ');
                      displayAction = displayAction.replace(/Luot/gi, 'Lượt');

                      const isWin = displayAction.includes('Trúng');

                      // Xác định nhãn kết quả hiển thị bên phải
                      let resultLabel = null;
                      let resultColor = '';
                      if (tx.amount === 0) {
                        resultLabel = 'Trượt';
                        resultColor = 'text-slate-500';
                      } else if (tx.isSpinCost) {
                        resultLabel = `+${Math.abs(tx.amount)} Lượt`;
                        resultColor = 'text-cyan-400';
                      } else {
                        resultLabel = `+${new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ`;
                        resultColor = 'text-emerald-400';
                      }

                      return (
                        <div key={idx} className="p-3 bg-[#0B1120] rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors text-left">
                          <div className="flex-1 pr-2">
                            <p className={`font-bold text-sm line-clamp-1 ${isWin ? 'text-white' : 'text-slate-400'}`}>
                              {isWin
                                ? <span className="inline mr-1.5 -mt-0.5 text-base">🎁</span>
                                : <Gift size={14} className="inline mr-1.5 -mt-0.5 text-slate-600" />
                              }
                              {displayAction}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">{tx.date}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-black text-sm ${resultColor}`}>
                              {resultLabel}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* BẢNG GIẢI THƯỞNG (Nằm dưới cùng, dàn ngang full màn hình) */}
          <div className="mt-4 border-t border-slate-800 pt-8 text-left">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 pb-2">
              Bảng Giải Thưởng ({playMode === 'money' ? 'Vòng Quay Tiền' : 'Vòng Quay Lượt'}):
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {activeDb.map((w, idx) => (
                <div key={w.id} className="bg-[#151D2F] border border-slate-800 p-3 md:p-4 rounded-xl text-center hover:border-blue-500/30 transition-colors flex flex-col items-center shadow-lg">
                  <div className="relative mb-2 md:mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] border-2 border-slate-600" style={{ backgroundColor: w.color || colors[idx % colors.length] }}></div>
                    {w.image && <img src={w.image} className="absolute inset-0 w-full h-full object-contain drop-shadow-md scale-125" />}
                  </div>
                  <p className="font-bold text-white text-xs md:text-base line-clamp-1">{w.name}</p>
                  <p className="text-[10px] md:text-xs bg-slate-800 inline-block px-2 py-0.5 md:py-1 rounded-full mt-1.5 md:mt-2 text-blue-400 font-bold border border-slate-700">Tỉ lệ: {w.rate}</p>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-1 font-bold bg-[#0B1120] px-2 py-0.5 rounded border border-slate-700 inline-block ml-1">Còn: {w.quantity ?? 999}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {giftModalData && isGiftOpened && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden p-4">
            {!giftModalData.isLost && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="absolute text-3xl animate-confetti" style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animationDelay: `${Math.random() * 1.5}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}>
                    {['🎉', '✨', '🎊', '💰', '🔥', '💥'][Math.floor(Math.random() * 6)]}
                  </div>
                ))}
              </div>
            )}

            <div className={`w-full max-w-sm rounded-3xl p-6 md:p-8 text-center animate-zoom-in relative z-10 border-4 shadow-2xl ${giftModalData.isLost ? 'bg-[#151D2F] border-slate-700 shadow-slate-900' : 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.3)]'}`}>

              <div className={`w-28 h-28 md:w-32 md:h-32 mx-auto -mt-20 md:-mt-24 mb-6 rounded-full flex items-center justify-center border-4 border-[#0B1120] relative ${giftModalData.isLost ? 'bg-slate-700 shadow-xl' : 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_50px_rgba(234,179,8,0.8)]'}`}>
                {giftModalData.item.image && !giftModalData.isLost ? (
                  <img src={giftModalData.item.image} className="w-16 h-16 md:w-20 md:h-20 object-contain animate-bounce" />
                ) : (
                  <Gift className={`text-white w-14 h-14 md:w-[60px] md:h-[60px] ${giftModalData.isLost ? 'opacity-50' : 'animate-pulse'}`} />
                )}
                {!giftModalData.isLost && <div className="absolute inset-0 rounded-full border-4 border-yellow-300/30 animate-ping"></div>}
              </div>

              <h3 className={`text-3xl md:text-4xl font-black mb-2 uppercase text-shadow-sm ${giftModalData.isLost ? 'text-slate-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 animate-bounce'}`}>
                {giftModalData.isLost ? 'RẤT TIẾC!' : 'CHÚC MỪNG!'}
              </h3>

              <p className="text-slate-300 font-bold mb-5 md:mb-6 text-sm md:text-lg">
                {giftModalData.isLost ? 'Bạn mở hộp và nhận được...' : 'Bạn đã mở hộp quà và trúng'}
              </p>

              <div className={`border rounded-2xl p-4 md:p-6 mb-6 md:mb-8 relative shadow-inner ${giftModalData.isLost ? 'bg-slate-800/50 border-slate-700' : 'bg-yellow-900/30 border-yellow-500/50'}`}>
                <p className={`text-2xl md:text-3xl font-black ${giftModalData.isLost ? 'text-slate-400' : 'text-white'}`}>{giftModalData.item.name}</p>
                {giftModalData.prizeValue > 0 && giftModalData.prizeType === 'money' && (
                  <p className="text-yellow-400 font-black text-xl md:text-2xl mt-2">+ {new Intl.NumberFormat('vi-VN').format(giftModalData.prizeValue)}đ (Ví)</p>
                )}
                {giftModalData.prizeValue > 0 && giftModalData.prizeType === 'fund' && (
                  <p className="text-yellow-400 font-black text-xl md:text-2xl mt-2">+ {new Intl.NumberFormat('vi-VN').format(giftModalData.prizeValue)}đ (Quỹ Thuê)</p>
                )}
                {giftModalData.prizeValue > 0 && giftModalData.prizeType === 'spin' && (
                  <p className="text-rose-400 font-black text-xl md:text-2xl mt-2">+ {giftModalData.prizeValue} Lượt Quay</p>
                )}
              </div>

              <button onClick={() => {
                // Đã phát thưởng trong DB lúc bấm quay rồi, giờ chỉ việc đóng bảng lại
                setGiftModalData(null);
                setIsGiftOpened(false);
              }} className={`w-full font-black text-lg md:text-xl py-3 md:py-4 rounded-xl transition-all uppercase ${giftModalData.isLost ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-[#0B1120] shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105'}`}>
                {giftModalData.isLost ? 'ĐÓNG LẠI' : 'NHẬN QUÀ XONG'}
              </button>
            </div>
          </div>
        )}
        {renderFooter()}
      </div>
    );
  };


  // Helpers cho Modal Profile & Trang bị Mộng Thiên Huyễn
  const getRingSkillProcStr = (item) => {
    if (!item) return '0.1%';
    const lvl = Number(item.skill_level || 0);
    const rateMap = { 1: '0.2%', 2: '0.4%', 3: '0.8%', 4: '1.6%', 5: '3.2%', 6: '6.4%', 7: '12.8%', 8: '25.6%', 9: '50%' };
    if (lvl > 0 && rateMap[lvl]) return rateMap[lvl];
    if (item.skill_proc_rate) {
      const p = Number(item.skill_proc_rate) * 100;
      return p >= 1 ? `${p.toFixed(1).replace(/\.0$/, '')}%` : `${p.toFixed(1)}%`;
    }
    return '0.1%';
  };

  const isEnhancementStone = (itemOrTier, optionalItem) => {
    const it = (typeof itemOrTier === 'object' && itemOrTier !== null)
      ? itemOrTier
      : (typeof optionalItem === 'object' && optionalItem !== null ? optionalItem : null);
    const str = (typeof itemOrTier === 'string' ? itemOrTier : '').toLowerCase();
    const itName = it ? String(it.name || it.id || '').toLowerCase() : '';
    const itCat = it ? String(it.category || '').toLowerCase() : '';

    const textToMatch = `${str} ${itName} ${itCat}`;
    return (
      textToMatch.includes('đá tinh hoa') ||
      textToMatch.includes('da tinh hoa') ||
      textToMatch.includes('tinh thể cường hóa') ||
      textToMatch.includes('tinh the cuong hoa') ||
      textToMatch.includes('đá cường hóa') ||
      textToMatch.includes('da cuong hoa') ||
      textToMatch.includes('item_essence_stone') ||
      textToMatch.includes('item_ring_crystal') ||
      textToMatch.includes('tinh hoa') ||
      textToMatch.includes('tinh thể') ||
      textToMatch.includes('tinh the') ||
      itCat === 'material' ||
      itCat === 'crystal'
    );
  };

  const getBossTierStyle = (tierStr, item) => {
    if (isEnhancementStone(tierStr, item)) {
      return { color: '#ff00ff', border: '#ff00ff', bg: 'rgba(255, 0, 255, 0.15)', label: 'THƯỢNG CỔ' };
    }
    const t = (typeof tierStr === 'string' ? tierStr : (item && item.tier) || '').toLowerCase();
    if (t.includes('thượng cổ')) return { color: '#ff00ff', border: '#ff00ff', bg: 'rgba(255, 0, 255, 0.15)', label: 'THƯỢNG CỔ' };
    if (t.includes('cổ đại')) return { color: '#00ffaa', border: '#00ffaa', bg: 'rgba(0, 255, 170, 0.15)', label: 'CỔ ĐẠI' };
    if (t.includes('tối thượng')) return { color: '#ff3366', border: '#ff3366', bg: 'rgba(255, 51, 102, 0.15)', label: 'TỐI THƯỢNG' };
    if (t.includes('thần thoại')) return { color: '#ffaa00', border: '#ffaa00', bg: 'rgba(255, 170, 0, 0.15)', label: 'THẦN THOẠI' };
    if (t.includes('huyền thoại')) return { color: '#ffcc00', border: '#ffcc00', bg: 'rgba(255, 204, 0, 0.15)', label: 'HUYỀN THOẠI' };
    if (t.includes('sử thi') || t.includes('epic')) return { color: '#a855f7', border: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', label: 'SỬ THI' };
    if (t.includes('hiếm') || t.includes('rare')) return { color: '#38bdf8', border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', label: 'HIẾM' };
    return { color: '#94a3b8', border: '#475569', bg: 'rgba(148, 163, 184, 0.15)', label: 'THƯỜNG' };
  };

  const getItemTierWeight = (item) => {
    if (!item) return 0;
    if (isEnhancementStone(null, item)) return 900; // Tất cả đá dùng để cường hóa đều là Tier Thượng Cổ (trọng số cao nhất 900)!

    const rawTier = String(item.tier || '').toLowerCase();
    if (rawTier.includes('thượng cổ')) return 900;
    if (rawTier.includes('cổ đại')) return 800;
    if (rawTier.includes('tối thượng')) return 700;
    if (rawTier.includes('thần thoại')) return 600;
    if (rawTier.includes('huyền thoại')) return 550;
    if (rawTier.includes('cực phẩm')) return 500;
    if (rawTier.includes('sử thi') || rawTier.includes('epic')) return 400;
    if (rawTier.includes('hiếm') || rawTier.includes('rare')) return 300;
    if (rawTier.includes('thường') || rawTier.includes('common')) return 100;

    const numTier = Number(item.tier);
    if (!isNaN(numTier) && numTier > 0) {
      return numTier * 100;
    }

    const name = String(item.name || '').toLowerCase();
    if (name.includes('thượng cổ') || name.includes('bát hoang') || name.includes('nữ oa') || name.includes('bá vương') || name.includes('tinh hoa') || name.includes('tinh thể') || name.includes('đá')) return 900;
    if (name.includes('cổ đại') || name.includes('chaos') || name.includes('long vương')) return 800;
    if (name.includes('tối thượng') || name.includes('vô cực') || name.includes('phượng hoàng') || name.includes('hắc ma vương') || name.includes('hắc ám ma vương')) return 700;
    if (name.includes('thần thoại') || name.includes('diệt tộc') || name.includes('kim cương') || name.includes('rồng thần tí hon') || name.includes('hoàng kim')) return 600;
    if (name.includes('sử thi') || name.includes('hỏa thần') || name.includes('thánh quang') || name.includes('rồng con') || name.includes('tử tinh') || name.includes('huyết ma')) return 400;
    if (name.includes('hiếm') || name.includes('trảm ma') || name.includes('giáp rồng') || name.includes('cáo tuyết') || name.includes('lam ngọc')) return 300;
    if (name.includes('gỗ') || name.includes('sắt') || name.includes('mèo') || name.includes('bạc') || name.includes('hắc thiết')) return 100;

    return 0;
  };

  const ITEM_CANONICAL_ASSETS = {
    // Vũ khí (Weapons)
    "kiếm gỗ": "/game-assets/weapon_wooden_sword.png",
    "trảm ma kiếm": "/game-assets/weapon_tram_ma.png",
    "song đao hỏa thần": "/game-assets/weapon_song_dao.png",
    "song đao hoả thần": "/game-assets/weapon_song_dao.png",
    "thần đao diệt tộc": "/game-assets/weapon_than_dao.png",
    "huyền thoại ma vương": "/game-assets/weapon_ma_vuong.png",
    "ma vương": "/game-assets/weapon_ma_vuong.png",
    "thần kiếm cổ đại chaos": "/game-assets/weapon_chaos.png",
    "thần kiếm chaos": "/game-assets/weapon_chaos.png",
    "bá vương thần đao thượng cổ": "/game-assets/weapon_ba_vuong.png",
    "bá vương thần đao": "/game-assets/weapon_ba_vuong.png",

    // Áo giáp (Armors)
    "giáp sắt": "/game-assets/armor_giap_sat.png",
    "giáp rồng": "/game-assets/armor_giap_rong.png",
    "giáp thánh quang": "/game-assets/armor_thanh_quang.png",
    "giáp kim cương": "/game-assets/armor_kim_cuong.png",
    "giáp vô cực tối thượng": "/game-assets/armor_vo_cuc.png",
    "giáp vô cực": "/game-assets/armor_vo_cuc.png",
    "giáp cổ đại long vương": "/game-assets/armor_long_vuong.png",
    "giáp long vương": "/game-assets/armor_long_vuong.png",
    "thần giáp thượng cổ nữ oa": "/game-assets/armor_nu_oa.png",
    "thần giáp nữ oa": "/game-assets/armor_nu_oa.png",
    "giáp nữ oa": "/game-assets/armor_nu_oa.png",

    // Linh thú (Pets)
    "mèo béo": "/game-assets/pet_meo_beo.png",
    "cáo tuyết": "/game-assets/pet_cao_tuyet.png",
    "rồng con": "/game-assets/pet_rong_con.png",
    "rồng thần tí hon": "/game-assets/pet_rong_than.png",
    "phượng hoàng tối thượng": "/game-assets/pet_phuong_hoang.png",
    "phượng hoàng": "/game-assets/pet_phuong_hoang.png",
    "thần rồng cổ đại chaos": "/game-assets/pet_rong_chaos.png",
    "thần rồng chaos": "/game-assets/pet_rong_chaos.png",
    "bát hoang thần rồng thượng cổ": "/game-assets/pet_rong_thuong_co.png",
    "bát hoang thần rồng": "/game-assets/pet_rong_thuong_co.png",
    "rồng thượng cổ": "/game-assets/pet_rong_thuong_co.png",

    // Dây chuyền (Necklaces)
    "dây chuyền bạc": "/game-assets/necklace_thuong.png",
    "dây chuyền lam ngọc": "/game-assets/necklace_hiem.png",
    "dây chuyền tử tinh": "/game-assets/necklace_epic.png",
    "dây chuyền hoàng kim": "/game-assets/necklace_thanthoai.png",
    "dây chuyền hắc ma vương": "/game-assets/necklace_toithuong.png",
    "dây chuyền cổ đại chaos": "/game-assets/necklace_codai.png",
    "dây chuyền chaos": "/game-assets/necklace_codai.png",
    "thần dây chuyền thượng cổ vô cực": "/game-assets/necklace_thuongco.png",
    "thần dây chuyền vô cực": "/game-assets/necklace_thuongco.png",

    // Nhẫn (Rings)
    "nhẫn hắc thiết": "/game-assets/ring_thuong.png",
    "nhẫn lam ngọc tinh": "/game-assets/ring_hiem.png",
    "nhẫn huyết ma thạch": "/game-assets/ring_epic.png",
    "nhẫn hoàng kim diệt thế": "/game-assets/ring_thanthoai.png",
    "nhẫn hắc ám ma vương": "/game-assets/ring_toithuong.png",
    "nhẫn thần long chaos": "/game-assets/ring_codai.png",
    "nhẫn chaos": "/game-assets/ring_codai.png",
    "bát hoang thần giới vô cực": "/game-assets/ring_thuongco.png",
    "nhẫn bát hoang thần giới vô cực": "/game-assets/ring_thuongco.png",
    "nhẫn bát hoang": "/game-assets/ring_thuongco.png",

    // Nguyên liệu (Materials)
    "tinh thể cường hóa": "/game-assets/ring_crystal.png",
    "tinh thể cường hoá": "/game-assets/ring_crystal.png",
    "tinh thể": "/game-assets/ring_crystal.png",
    "đá tinh hoa": "/game-assets/da_tinh_hoa.png",
    "bùa reset boss": "/game-assets/item_reset_boss.png",
    "bình huyết dược": "/game-assets/item_health_potion.png",
    "bình máu": "/game-assets/item_health_potion.png",
    "item_health_potion": "/game-assets/item_health_potion.png",
    "bùa phục sinh": "/game-assets/item_revive_amulet.png",
    "bùa hồi sinh": "/game-assets/item_revive_amulet.png",
    "item_revive_amulet": "/game-assets/item_revive_amulet.png"
  };

  const getBossItemAsset = (itemOrName, maybeCategory) => {
    let name = '';
    let category = '';
    let directImg = '';

    if (itemOrName && typeof itemOrName === 'object') {
      name = itemOrName.name || '';
      category = itemOrName.category || maybeCategory || '';
      directImg = itemOrName.image || '';
    } else {
      name = String(itemOrName || '');
      category = String(maybeCategory || '');
    }

    // 0. Nếu item đã có ảnh định danh trực tiếp hợp lệ
    if (directImg && typeof directImg === 'string') {
      const cleanImg = directImg.split('/').pop().split('?')[0];
      if (cleanImg && !cleanImg.includes('none') && cleanImg.endsWith('.png')) {
        return `/game-assets/${cleanImg}`;
      }
    }

    const rawName = (name || '').trim();
    // Bỏ qua cấp cường hóa như +1, +2, +15 nếu nằm trong chuỗi tên
    const n = rawName.replace(/\s*\+\d+$/, '').trim().toLowerCase();
    
    // 1. Tra cứu chính xác theo tên chuẩn (Canonical SSOT)
    if (ITEM_CANONICAL_ASSETS[n]) {
      return ITEM_CANONICAL_ASSETS[n];
    }

    // 2. Tra cứu từ khóa đặc trưng (Keyword Pattern Matching)
    // Thần Dược Máu & Bùa Phục Sinh
    if (n.includes('huyết dược') || n.includes('bình máu') || n.includes('binh mau') || n.includes('health_potion') || n.includes('potion')) return '/game-assets/item_health_potion.png';
    if (n.includes('phục sinh') || n.includes('hồi sinh') || n.includes('revive_amulet') || n.includes('amulet') || n.includes('revive')) return '/game-assets/item_revive_amulet.png';

    // Nguyên liệu
    if (n.includes('tinh hoa') || n.includes('essence') || n.includes('da_tinh_hoa')) return '/game-assets/da_tinh_hoa.png';
    if (n.includes('tinh thể') || n.includes('tinh the') || n.includes('crystal') || n.includes('ring_crystal')) return '/game-assets/ring_crystal.png';
    if (n.includes('reset') || n.includes('bùa reset')) return '/game-assets/item_reset_boss.png';
    if (category === 'material') {
      if (n.includes('tinh hoa') || n.includes('essence')) return '/game-assets/da_tinh_hoa.png';
      return '/game-assets/ring_crystal.png';
    }

    // Linh thú (Pets) - Ưu tiên chim Phượng Hoàng, Cáo, Mèo trước Rồng
    if (category === 'pet' || n.includes('phượng') || n.includes('phuong') || n.includes('cáo') || n.includes('cao') || n.includes('mèo') || n.includes('meo') || n.includes('rồng') || n.includes('rong') || n.includes('linh thú')) {
      if (n.includes('phượng') || n.includes('phuong')) return '/game-assets/pet_phuong_hoang.png';
      if (n.includes('cáo') || n.includes('cao')) return '/game-assets/pet_cao_tuyet.png';
      if (n.includes('mèo') || n.includes('meo')) return '/game-assets/pet_meo_beo.png';
      if (n.includes('bát hoang') || n.includes('bat hoang') || n.includes('thuong co') || n.includes('thượng cổ')) return '/game-assets/pet_rong_thuong_co.png';
      if (n.includes('chaos') || n.includes('cổ đại') || n.includes('co dai')) return '/game-assets/pet_rong_chaos.png';
      if (n.includes('tí hon') || n.includes('ti hon') || n.includes('thần') || n.includes('than')) return '/game-assets/pet_rong_than.png';
      if (n.includes('con')) return '/game-assets/pet_rong_con.png';
      return '/game-assets/pet_rong_chaos.png';
    }

    // Áo giáp (Armors)
    if (category === 'armor' || n.includes('giáp') || n.includes('giap') || n.includes('armor')) {
      if (n.includes('nữ oa') || n.includes('nu oa')) return '/game-assets/armor_nu_oa.png';
      if (n.includes('vô cực') || n.includes('vo cuc')) return '/game-assets/armor_vo_cuc.png';
      if (n.includes('long vương') || n.includes('long vuong')) return '/game-assets/armor_long_vuong.png';
      if (n.includes('kim cương') || n.includes('kim cuong')) return '/game-assets/armor_kim_cuong.png';
      if (n.includes('thánh quang') || n.includes('thanh quang')) return '/game-assets/armor_thanh_quang.png';
      if (n.includes('giáp rồng') || n.includes('giap rong')) return '/game-assets/armor_giap_rong.png';
      if (n.includes('giáp sắt') || n.includes('giap sat')) return '/game-assets/armor_giap_sat.png';
      if (n.includes('thượng cổ')) return '/game-assets/armor_nu_oa.png';
      if (n.includes('cổ đại')) return '/game-assets/armor_long_vuong.png';
      if (n.includes('tối thượng')) return '/game-assets/armor_vo_cuc.png';
      return '/game-assets/armor_long_vuong.png';
    }

    // Vũ khí (Weapons)
    if (category === 'weapon' || n.includes('kiếm') || n.includes('kiem') || n.includes('đao') || n.includes('dao') || n.includes('vũ khí')) {
      if (n.includes('bá vương') || n.includes('ba vuong')) return '/game-assets/weapon_ba_vuong.png';
      if (n.includes('chaos') || n.includes('cổ đại')) return '/game-assets/weapon_chaos.png';
      if (n.includes('ma vương') || n.includes('huyền thoại')) return '/game-assets/weapon_ma_vuong.png';
      if (n.includes('thần đao') || n.includes('diệt tộc')) return '/game-assets/weapon_than_dao.png';
      if (n.includes('song đao') || n.includes('hỏa thần') || n.includes('hoả thần')) return '/game-assets/weapon_song_dao.png';
      if (n.includes('trảm ma')) return '/game-assets/weapon_tram_ma.png';
      if (n.includes('kiếm gỗ') || n.includes('kiem go')) return '/game-assets/weapon_wooden_sword.png';
      if (n.includes('thượng cổ')) return '/game-assets/weapon_ba_vuong.png';
      return '/game-assets/weapon_tram_ma.png';
    }

    // Nhẫn (Rings)
    if (category === 'ring' || n.includes('nhẫn') || n.includes('nhan') || n.includes('ring')) {
      if (n.includes('bát hoang') || n.includes('thượng cổ')) return '/game-assets/ring_thuongco.png';
      if (n.includes('thần long') || n.includes('chaos') || n.includes('cổ đại')) return '/game-assets/ring_codai.png';
      if (n.includes('hắc ám') || n.includes('ma vương') || n.includes('tối thượng')) return '/game-assets/ring_toithuong.png';
      if (n.includes('hoàng kim') || n.includes('thần thoại')) return '/game-assets/ring_thanthoai.png';
      if (n.includes('huyết ma') || n.includes('epic')) return '/game-assets/ring_epic.png';
      if (n.includes('lam ngọc') || n.includes('hiếm')) return '/game-assets/ring_hiem.png';
      return '/game-assets/ring_thuong.png';
    }

    // Dây chuyền (Necklaces)
    if (category === 'necklace' || n.includes('dây chuyền') || n.includes('chuyền') || n.includes('necklace')) {
      if (n.includes('thần dây chuyền') || n.includes('thượng cổ')) return '/game-assets/necklace_thuongco.png';
      if (n.includes('chaos') || n.includes('cổ đại')) return '/game-assets/necklace_codai.png';
      if (n.includes('hắc ma') || n.includes('tối thượng')) return '/game-assets/necklace_toithuong.png';
      if (n.includes('hoàng kim') || n.includes('thần thoại')) return '/game-assets/necklace_thanthoai.png';
      if (n.includes('tử tinh') || n.includes('epic')) return '/game-assets/necklace_epic.png';
      if (n.includes('lam ngọc') || n.includes('hiếm')) return '/game-assets/necklace_hiem.png';
      return '/game-assets/necklace_thuong.png';
    }

    return '/game-assets/ring_crystal.png';
  };

  const getCategoryOfItem = (item) => {
    if (!item) return 'weapon';
    if (item.category) return item.category;
    if (item.type) {
      const t = String(item.type).toLowerCase();
      if (['material', 'ring', 'necklace', 'armor', 'weapon', 'pet'].includes(t)) {
        return t;
      }
    }
    const n = (item.name || '').toLowerCase();
    if (n.includes('huyết dược') || n.includes('bình máu') || n.includes('potion')) return 'potion';
    if (n.includes('phục sinh') || n.includes('hồi sinh') || n.includes('amulet') || n.includes('revive')) return 'revive';
    if (n.includes('tinh hoa') || n.includes('tinh thể') || n.includes('essence') || n.includes('crystal') || n.includes('đá')) return 'material';
    if (n.includes('nhẫn') || n.includes('ring')) return 'ring';
    if (n.includes('dây chuyền') || n.includes('necklace')) return 'necklace';
    if (n.includes('giáp') || n.includes('armor')) return 'armor';
    if (n.includes('rồng') || n.includes('phượng') || n.includes('pet') || n.includes('thú')) return 'pet';
    return 'weapon';
  };

  // --- HÀM TÍNH TOÁN VỊ TRÍ & ĐIỀU KHIỂN POPUP TOOLTIP CHI TIẾT VẬT PHẨM THÔNG MINH ---
  const calculateTooltipPosition = (clientX, clientY) => {
    if (typeof window === 'undefined') {
      return { x: clientX, topStyle: `${clientY}px`, bottomStyle: undefined, isAbove: false, maxHeight: 500 };
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const isMobile = winW < 640;
    const tooltipWidth = isMobile ? Math.min(winW - 24, 340) : 350;

    // 1. Tính toán tọa độ X (Ngang) - tự động lật sang trái nếu sát mép phải
    let posX = clientX + 16;
    if (posX + tooltipWidth > winW - 12) {
      posX = clientX - tooltipWidth - 16;
    }
    if (posX < 12) {
      posX = 12;
    }
    if (posX + tooltipWidth > winW - 12) {
      posX = Math.max(12, winW - tooltipWidth - 12);
    }

    // 2. Tính toán Y (Dọc): Tự động lật lên trên (Flip-Up) nếu không gian phía dưới bị hẹp
    const spaceBelow = winH - clientY - 16;
    const spaceAbove = clientY - 16;
    const neededHeight = 460; // Chiều cao thoải mái để hiển thị cả thông số & hướng dẫn chi tiết

    // Nếu phía dưới nhỏ hơn 460px và phía trên thoáng hơn -> LẬT LÊN TRÊN
    const isAbove = spaceBelow < neededHeight && spaceAbove > spaceBelow;

    let maxHeight = 500;
    let topStyle = undefined;
    let bottomStyle = undefined;

    if (isAbove) {
      // Đáy của popup cách con trỏ chuột 12px về phía trên (tính từ đáy viewport)
      const bottomPx = winH - clientY + 12;
      bottomStyle = `${bottomPx}px`;
      // Giới hạn chiều cao tối đa không vượt qua mép trên màn hình (để lề 16px)
      maxHeight = Math.max(220, clientY - 28);
    } else {
      // Đỉnh của popup cách con trỏ chuột 14px về phía dưới (tính từ đỉnh viewport)
      const topPx = clientY + 14;
      topStyle = `${topPx}px`;
      // Giới hạn chiều cao tối đa không vượt qua mép dưới màn hình (để lề 16px)
      maxHeight = Math.max(220, winH - topPx - 16);
    }

    return {
      x: posX,
      topStyle,
      bottomStyle,
      isAbove,
      maxHeight
    };
  };

  // --- HÀM LOẠI BỎ ICON LẶP THỪA TRONG THUỘC TÍNH PHỤ ---
  const formatSubStatText = (sub) => {
    if (!sub) return '';
    let str = String(sub).trim();
    // Loại bỏ các icon ✨ đứng trước một emoji khác (ví dụ: "✨ ⚡" -> "⚡", "✨ 💥" -> "💥")
    str = str.replace(/^(?:✨\s*)+(?=[\p{Extended_Pictographic}\u2600-\u27bf])/u, '').trim();
    return str;
  };

  // --- HỆ THỐNG BỘ TRANG BỊ & KÍCH HOẠT HIỆU ỨNG SET (SET BONUSES) ---
  const SET_DEFINITIONS = {
    thuong_co: {
      name: 'Bộ Thần Trang Thượng Cổ',
      tier: 'Thượng Cổ',
      color: '#ff00ff',
      icon: '👑',
      badge: 'CỰC PHẨM THƯỢNG CỔ',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Bá Vương Thần Đao Thượng Cổ', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Thần Giáp Thượng Cổ Nữ Oa', slotIcon: '🛡️' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Thần Dây Chuyền Thượng Cổ Vô Cực', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Bát Hoang Thần Giới Vô Cực', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Bát Hoang Thần Rồng Thượng Cổ', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '+15% Tổng Sát Thương & +10% Bạo Kích' },
        { count: 3, desc: '+30% Sinh Lực (HP) & +25% Phòng Thủ (DEF)' },
        { count: 4, desc: '+25% Sát Thương Boss & +15% Xuyên Giáp' },
        { count: 5, desc: '+50% Toàn Thuộc Tính & Tuyệt Kỹ: Nộ Long Thượng Cổ (Bạo Kích x3.0)' }
      ]
    },
    co_dai: {
      name: 'Bộ Chiến Binh Cổ Đại',
      tier: 'Cổ Đại',
      color: '#00ffaa',
      icon: '🐉',
      badge: 'CHIẾN BINH CỔ ĐẠI',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Thần Kiếm Cổ Đại Chaos', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Cổ Đại Long Vương', slotIcon: '🛡️' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Cổ Đại Chaos', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Thần Long Chaos', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Thần Rồng Cổ Đại Chaos', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '+12% Tổng Sát Thương' },
        { count: 3, desc: '+20% Sinh Lực (HP) & +20% Phòng Thủ (DEF)' },
        { count: 4, desc: '+20% Sát Thương Bạo Kích & +10% Xuyên Giáp' },
        { count: 5, desc: '+35% Toàn Thuộc Tính & Giảm 25% Sát Thương Boss' }
      ]
    },
    toi_thuong: {
      name: 'Bộ Hắc Ma Tối Thượng',
      tier: 'Tối Thượng',
      color: '#ff3366',
      icon: '🌌',
      badge: 'HẮC MA TỐI THƯỢNG',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Huyền Thoại Ma Vương', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Vô Cực Tối Thượng', slotIcon: '🛡️' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Hắc Ma Vương', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Hắc Ám Ma Vương', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Phượng Hoàng Tối Thượng', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '+10% Tổng Sát Thương' },
        { count: 3, desc: '+15% Sinh Lực (HP) & +15% Phòng Thủ (DEF)' },
        { count: 4, desc: '+15% Sát Thương Bạo Kích & +10% Xuyên Giáp' },
        { count: 5, desc: '+25% Toàn Thuộc Tính & Hút Máu 10%' }
      ]
    },
    than_thoai: {
      name: 'Bộ Hoàng Kim Thần Thoại',
      tier: 'Thần Thoại',
      color: '#ffaa00',
      icon: '✨',
      badge: 'HOÀNG KIM THẦN THOẠI',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Thần Đao Diệt Tộc', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Kim Cương', slotIcon: '🛡️' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Hoàng Kim', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Hoàng Kim Diệt Thế', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Rồng Thần Tí Hon', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '+8% Tổng Sát Thương' },
        { count: 3, desc: '+12% Sinh Lực (HP) & +12% Phòng Thủ (DEF)' },
        { count: 4, desc: '+12% Sát Thương Bạo Kích' },
        { count: 5, desc: '+20% Toàn Thuộc Tính & Hộ Thể Kim Cương' }
      ]
    },
    epic: {
      name: 'Bộ Thánh Quang Sử Thi',
      tier: 'Epic',
      color: '#a855f7',
      icon: '🌟',
      badge: 'THÁNH QUANG SỬ THI',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Song Đao Hỏa Thần', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Thánh Quang', slotIcon: '🛡️' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Tử Tinh', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Huyết Ma Thạch', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Rồng Con', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '+5% Tổng Sát Thương' },
        { count: 3, desc: '+8% Sinh Lực (HP) & +8% Phòng Thủ (DEF)' },
        { count: 4, desc: '+15% Toàn Thuộc Tính' }
      ]
    },
    hiem: {
      name: 'Bộ Hiếm Lam Tinh',
      tier: 'Hiếm',
      color: '#38bdf8',
      icon: '🔷',
      badge: 'LAM TINH HIẾM',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Trảm Ma Kiếm', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Rồng', slotIcon: '🛡️' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Lam Ngọc', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Lam Ngọc Tinh', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Cáo Tuyết', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '+3% Tổng Sát Thương' },
        { count: 3, desc: '+5% Sinh Lực & +5% Phòng Thủ' },
        { count: 4, desc: '+8% Toàn Thuộc Tính' }
      ]
    },
    thuong: {
      name: 'Bộ Tân Thủ Thường',
      tier: 'Thường',
      color: '#94a3b8',
      icon: '🗡️',
      badge: 'TÂN THỦ CƠ BẢN',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Kiếm Gỗ', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Sắt', slotIcon: '🛡️' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Bạc', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Hắc Thiết', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Mèo Béo', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '+2% Tổng Sát Thương' },
        { count: 3, desc: '+5% Sinh Lực & +5% Phòng Thủ' },
        { count: 4, desc: '+5% Toàn Thuộc Tính' }
      ]
    }
  };

  const getItemSetInfo = (it) => {
    if (!it) return null;
    const cat = String(it.category || '').toLowerCase();
    if (cat === 'material' || cat === 'nguyenlieu' || cat === 'crystal') return null;
    const name = String(it.name || '').toLowerCase();
    const tier = String(it.tier || '').toLowerCase();

    // Bỏ qua nếu là nguyên liệu đá
    if (name.includes('tinh hoa') || name.includes('tinh thể') || name.includes('đá') || name.includes('bùa')) return null;

    let setKey = null;
    if (tier.includes('thượng cổ') || name.includes('thượng cổ') || name.includes('bá vương') || name.includes('nữ oa') || name.includes('bát hoang')) {
      setKey = 'thuong_co';
    } else if (tier.includes('cổ đại') || name.includes('cổ đại') || name.includes('long vương') || name.includes('chaos')) {
      setKey = 'co_dai';
    } else if (tier.includes('tối thượng') || name.includes('tối thượng') || name.includes('ma vương')) {
      setKey = 'toi_thuong';
    } else if (tier.includes('thần thoại') || name.includes('thần thoại') || name.includes('diệt tộc') || name.includes('kim cương') || name.includes('hoàng kim')) {
      setKey = 'than_thoai';
    } else if (tier.includes('epic') || tier.includes('sử thi') || name.includes('hỏa thần') || name.includes('thánh quang') || name.includes('tử tinh')) {
      setKey = 'epic';
    } else if (tier.includes('hiếm') || tier.includes('rare') || name.includes('trảm ma') || name.includes('giáp rồng') || name.includes('lam ngọc') || name.includes('cáo tuyết')) {
      setKey = 'hiem';
    } else if (tier.includes('thường') || tier.includes('common') || name.includes('kiếm gỗ') || name.includes('giáp sắt') || name.includes('bạc') || name.includes('hắc thiết') || name.includes('mèo béo')) {
      setKey = 'thuong';
    }

    if (!setKey || !SET_DEFINITIONS[setKey]) return null;
    return { setKey, ...SET_DEFINITIONS[setKey] };
  };

  const getEquippedSetStatus = (setKey, playerSummary) => {
    if (!setKey || !playerSummary) return { equippedCount: 0, equippedSlots: [] };
    const slots = ['weapon', 'armor', 'necklace', 'ring', 'pet'];
    let count = 0;
    const equippedSlots = [];
    slots.forEach(slotKey => {
      const eq = playerSummary[slotKey];
      if (eq && eq.name) {
        const eqSet = getItemSetInfo(eq);
        if (eqSet && eqSet.setKey === setKey) {
          count++;
          equippedSlots.push({ slot: slotKey, item: eq });
        }
      }
    });
    return { equippedCount: count, equippedSlots };
  };

  const showItemTooltip = (item, e, customCat, isPinned = false) => {
    if (!item) return;
    if (hideTooltipTimerRef.current) clearTimeout(hideTooltipTimerRef.current);
    const cat = customCat || getCategoryOfItem(item);
    const clientX = e?.clientX ?? (e?.touches?.[0]?.clientX || (typeof window !== 'undefined' ? window.innerWidth / 2 : 200));
    const clientY = e?.clientY ?? (e?.touches?.[0]?.clientY || (typeof window !== 'undefined' ? window.innerHeight / 2 : 200));
    const pos = calculateTooltipPosition(clientX, clientY);

    setActiveItemTooltip({
      item,
      category: cat,
      x: pos.x,
      topStyle: pos.topStyle,
      bottomStyle: pos.bottomStyle,
      isAbove: pos.isAbove,
      maxHeight: pos.maxHeight,
      isPinned
    });
  };

  const updateItemTooltipPos = (e) => {
    if (!activeItemTooltip || activeItemTooltip.isPinned) return;
    const clientX = e?.clientX;
    const clientY = e?.clientY;
    if (clientX == null || clientY == null) return;
    const pos = calculateTooltipPosition(clientX, clientY);
    setActiveItemTooltip(prev => prev ? {
      ...prev,
      x: pos.x,
      topStyle: pos.topStyle,
      bottomStyle: pos.bottomStyle,
      isAbove: pos.isAbove,
      maxHeight: pos.maxHeight
    } : null);
  };

  const hideItemTooltip = () => {
    if (activeItemTooltip && activeItemTooltip.isPinned) return;
    if (hideTooltipTimerRef.current) clearTimeout(hideTooltipTimerRef.current);
    hideTooltipTimerRef.current = setTimeout(() => {
      setActiveItemTooltip(null);
    }, 140);
  };

  // --- HÀM BẤM TRỰC TIẾP VÀO Ô ĐỒ ĐỂ GHIM / MỞ POPUP CHI TIẾT ---
  const handleItemCardClick = (item, e, customCat) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!item) return;

    // Nếu popup đang mở và đang ghim (pinned) chính món này -> bấm lần nữa để đóng (toggle)
    if (activeItemTooltip && activeItemTooltip.isPinned && (
      (activeItemTooltip.item?.id && item.id && activeItemTooltip.item?.id === item.id) ||
      (activeItemTooltip.item?.name && activeItemTooltip.item?.name === item.name)
    )) {
      setActiveItemTooltip(null);
      return;
    }

    // Mở và ghim popup chi tiết (isPinned = true)
    showItemTooltip(item, e, customCat, true);
  };

  // Tự động đóng popup đã ghim khi bấm ra ngoài khoảng trống
  useEffect(() => {
    if (!activeItemTooltip || !activeItemTooltip.isPinned) return;
    const handleOutsideClick = (e) => {
      const tooltipEl = document.getElementById('active-item-tooltip-popup');
      if (tooltipEl && tooltipEl.contains(e.target)) return;
      setActiveItemTooltip(null);
    };

    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
      window.addEventListener('touchstart', handleOutsideClick);
    }, 60);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [activeItemTooltip]);

  // --- RENDER POPUP CHI TIẾT VẬT PHẨM (TOOLTIP / HOVER CARD) ---
  const renderItemDetailedTooltip = () => {
    if (!activeItemTooltip || !activeItemTooltip.item) return null;
    const { item, category: rawCat, x, topStyle, bottomStyle, maxHeight: activeMaxH, isPinned } = activeItemTooltip;
    const category = rawCat || getCategoryOfItem(item);
    const tier = getBossTierStyle(item.tier);
    const img = getBossItemAsset(item, category);
    const isMaterial = category === 'material';
    const starsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
    const stars = '⭐'.repeat(starsCount);
    const plusVal = Number(item.plus || 0);

    const itemName = String(item.name || '').trim();
    const lowerName = itemName.toLowerCase();
    const itemId = String(item.id || '').toLowerCase();

    // DÀNH CHO NGUYÊN LIỆU (MATERIAL)
    let matInfo = null;
    if (isMaterial) {
      if (itemId === 'item_essence_stone' || lowerName.includes('tinh hoa') || lowerName.includes('essence')) {
        matInfo = {
          title: 'Đá Tinh Hoa Thần Binh',
          badge: 'ĐÁ THƯỢNG CỔ',
          badgeColor: '#ff00ff',
          badgeBg: 'rgba(255, 0, 255, 0.15)',
          badgeBorder: '#ff00ff',
          icon: '💎',
          purpose: [
            'Nâng cấp Level Kỹ Năng Nhẫn Thần Binh (từ Lv.1 lên tối đa Lv.9 tối thượng).',
            'Tăng vọt tỉ lệ phát động đòn đánh chém % Máu Tối Đa Boss (từ 0.2% lên đến 50.0% HP Boss mỗi đòn đánh!).',
            'Gia tăng chỉ số Lực Chiến (CP) toàn diện và kích hoạt hiệu ứng chém Boss màu Thần Binh trên Overlay live stream.'
          ],
          howToUse: [
            'Gõ lệnh [/dap nhan] trên livestream TikTok khi đang có Đá Tinh Hoa trong túi đồ.',
            'Hệ thống tự động ưu tiên nâng cấp Level Kỹ Năng Nhẫn trước khi người chơi có đủ đá.',
            'Cơ chế Bảo Hiểm Pity: Không bao giờ bị rớt cấp kỹ năng khi thất bại. Xịt càng nhiều lần thì lần sau tỉ lệ thành công càng tăng (đạt 100% khi đủ mốc).',
            'Có thể bấm nút [Treo Đấu Giá] ở Túi Đồ để bán lấy Xu từ người chơi khác.'
          ],
          whereToGet: 'Săn Boss Thế Giới Lv50+ / Mở Rương Hoàng Kim / Mua tại Shop Xu (/shop) / Mua lại trên Sàn Đấu Giá.'
        };
      } else if (itemId === 'item_ring_crystal' || lowerName.includes('tinh thể') || lowerName.includes('crystal')) {
        matInfo = {
          title: 'Tinh Thể Cường Hóa',
          badge: 'ĐÁ THƯỢNG CỔ',
          badgeColor: '#ff00ff',
          badgeBg: 'rgba(255, 0, 255, 0.15)',
          badgeBorder: '#ff00ff',
          icon: '🔮',
          purpose: [
            'Cường hóa nâng Sao cho Nhẫn Thần Binh (từ 1⭐ lên tối đa 5⭐).',
            'Đột phá Bậc Nhẫn lên phẩm cấp cao hơn: Thường ➔ Hiếm ➔ Sử Thi ➔ Thần Thoại ➔ Tối Thượng ➔ Thượng Cổ.',
            'Nhân bội % Sát Thương Toàn Bộ của Nhẫn và mở khóa thêm các dòng thuộc tính ẩn (Sub-stats).'
          ],
          howToUse: [
            'Gõ lệnh [/dap nhan] trên livestream TikTok khi đang đeo Nhẫn Thần Binh.',
            'Hệ thống tự động ưu tiên tiêu Tinh Thể trong túi đồ (hoặc dùng nhẫn trùng cùng loại thay thế).',
            'Nếu thiếu Tinh Thể, có thể quy đổi trực tiếp 20 Xu = 1 Tinh Thể.',
            'Có thể treo bán lấy Xu trên Sàn Đấu Giá cho người chơi khác.'
          ],
          whereToGet: 'Rơi từ Boss Thế Giới / Mở Rương Boss & Hoàng Kim / Mua tại Shop Xu (/shop 20 xu) / Mua trên Sàn Đấu Giá.'
        };
      } else if (itemId === 'royal_chest' || lowerName.includes('hoàng kim') || lowerName.includes('royal')) {
        matInfo = {
          title: 'Rương Hoàng Kim',
          badge: 'RƯƠNG BÁU VẬT THẦN THOẠI',
          badgeColor: '#facc15',
          badgeBg: 'rgba(250, 204, 21, 0.15)',
          badgeBorder: '#eab308',
          icon: '👑',
          purpose: [
            'Mở nhận các trang bị cực phẩm Thần Thoại & Tối Thượng (Vũ Khí, Áo Giáp, Dây Chuyền, Nhẫn, Linh Thú).',
            'Cơ hội nhận Đá Tinh Hoa, Tinh Thể Cường Hóa, Lượng lớn Xu và Lượt Đánh Boss tích lũy.'
          ],
          howToUse: [
            'Mở trực tiếp trên Website ở mục Rương Báu hoặc gõ lệnh [/mohop] trên livestream TikTok.',
            'Có thể mở lẻ từng rương hoặc mở nhiều rương cùng lúc để gom trang bị khủng.'
          ],
          whereToGet: 'Nạp Gói Ưu Đãi Chiến Thần trên web / Đạt Top Donate / Thưởng sự kiện Boss.'
        };
      } else if (itemId === 'boss_chest' || lowerName.includes('rương boss') || lowerName.includes('rương')) {
        matInfo = {
          title: 'Rương Chiến Lợi Phẩm Boss',
          badge: 'RƯƠNG CHIẾN LỢI PHẨM',
          badgeColor: '#fb923c',
          badgeBg: 'rgba(251, 146, 60, 0.15)',
          badgeBorder: '#f97316',
          icon: '📦',
          purpose: [
            'Mở nhận trang bị ngẫu nhiên (từ Thường đến Sử Thi) để tăng lực chiến hoặc làm phôi ghép sao.',
            'Nhận Xu và Lượt đánh miễn phí để tiếp tục săn Boss.'
          ],
          howToUse: [
            'Mở ngay trên Website hoặc gõ lệnh [/mohop] trên live TikTok.'
          ],
          whereToGet: 'Tiêu diệt Boss Thế Giới trên livestream / Thưởng mốc sát thương Boss.'
        };
      } else {
        matInfo = {
          title: itemName || 'Nguyên Liệu Đặc Biệt',
          badge: 'NGUYÊN LIỆU VẬT PHẨM',
          badgeColor: '#38bdf8',
          badgeBg: 'rgba(56, 189, 248, 0.15)',
          badgeBorder: '#0284c7',
          icon: '💎',
          purpose: [
            'Vật phẩm hỗ trợ nâng cấp sức mạnh, cường hóa trang bị hoặc tham gia tính năng đặc biệt.',
            'Có thể lưu giữ trong Túi Đồ hoặc niêm yết bán lấy Xu trên Sàn Đấu Giá.'
          ],
          howToUse: [
            'Sử dụng theo các lệnh tương ứng trên livestream TikTok hoặc quản lý tại Túi Đồ.',
            'Bấm [Treo Đấu Giá] để bán lại cho người chơi khác kiếm Xu.'
          ],
          whereToGet: 'Săn Boss / Sự Kiện / Sàn Đấu Giá.'
        };
      }
    }

    // DÀNH CHO TRANG BỊ (EQUIPMENT)
    const getArmorStats = (it) => {
      if (it?.base_hp !== undefined && it?.base_def !== undefined) {
        return { baseHp: Number(it.base_hp), baseDef: Number(it.base_def) };
      }
      const n = (it?.name || '').toLowerCase();
      const t = (it?.tier || '').toLowerCase();
      if (n.includes('nữ oa') || t.includes('thượng cổ')) return { baseHp: 150000, baseDef: 15000 };
      if (n.includes('long vương') || t.includes('cổ đại')) return { baseHp: 60000, baseDef: 6000 };
      if (n.includes('vô cực') || t.includes('tối thượng')) return { baseHp: 25000, baseDef: 2500 };
      if (n.includes('kim cương') || t.includes('thần thoại')) return { baseHp: 10000, baseDef: 1000 };
      if (n.includes('thánh quang') || t.includes('epic')) return { baseHp: 4000, baseDef: 400 };
      if (n.includes('giáp rồng') || t.includes('hiếm')) return { baseHp: 1500, baseDef: 150 };
      return { baseHp: 500, baseDef: 50 };
    };

    const armorStats = getArmorStats(item);
    const starMultMath = Math.pow(2, Math.max(0, starsCount - 1));
    const totalEstHp = Math.round(armorStats.baseHp * (1 + 0.25 * plusVal) * starMultMath);
    const totalEstDef = Math.round(armorStats.baseDef * (1 + 0.20 * plusVal) * starMultMath);
    const estDmgReduc = Math.min(80, Math.round((totalEstDef / (totalEstDef + 2500)) * 100));

    const baseDmg = Number(item.base_dmg || 0);
    const plusBonus = Math.round(baseDmg * plusVal * 0.25);
    const totalBasePlus = baseDmg + plusBonus;
    const starMult = (starsCount === 5 ? 2.5 : (starsCount === 4 ? 2.0 : (starsCount === 3 ? 1.6 : (starsCount === 2 ? 1.3 : 1.0))));
    const totalEstDmg = Math.round(totalBasePlus * starMult);
    const bonusDmg = Number(item.bonus_dmg || 0);
    const dmgPercent = Number(item.dmg_percent || 0);
    const baseDmgPercent = Number(item.base_dmg_percent || 0);
    const skillPct = Number(item.skill_pct || 0);
    const skillLevel = Number(item.skill_level || 0);
    const skillProcStr = getRingSkillProcStr(item);
    const petLevel = Number(item.level || 1);

    const rawSub1 = Array.isArray(item?.sub_stats) ? item.sub_stats : (typeof item?.sub_stats === 'string' ? [item.sub_stats] : []);
    const rawSub2 = Array.isArray(item?.star_sub_stats) ? item.star_sub_stats : (typeof item?.star_sub_stats === 'string' ? [item.star_sub_stats] : []);
    const allSubStats = Array.from(new Set([...rawSub1, ...rawSub2].filter(Boolean)));

    const getCatBadgeInfo = () => {
      if (category === 'weapon') return { label: 'VŨ KHÍ TẤN CÔNG', icon: '⚔️', color: '#10b981', border: '#059669', bg: 'rgba(16, 185, 129, 0.15)' };
      if (category === 'armor') return { label: 'ÁO GIÁP PHÒNG HỘ', icon: '🛡️', color: '#06b6d4', border: '#0891b2', bg: 'rgba(6, 182, 212, 0.15)' };
      if (category === 'necklace') return { label: 'DÂY CHUYỀN THẦN LỰC', icon: '📿', color: '#f59e0b', border: '#d97706', bg: 'rgba(245, 158, 11, 0.15)' };
      if (category === 'ring') return { label: 'NHẪN THẦN BINH TUYỆT KỸ', icon: '💍', color: '#a855f7', border: '#9333ea', bg: 'rgba(168, 85, 247, 0.15)' };
      if (category === 'pet') return { label: 'LINH THÚ TRỢ CHIẾN', icon: '🐾', color: '#f43f5e', border: '#e11d48', bg: 'rgba(244, 63, 94, 0.15)' };
      return { label: 'TRANG BỊ', icon: '🛡️', color: '#38bdf8', border: '#0ea5e9', bg: 'rgba(56, 189, 248, 0.15)' };
    };

    const catBadge = getCatBadgeInfo();

    const maxHeight = activeMaxH || 480;

    return (
      <div
        id="active-item-tooltip-popup"
        className="fixed z-[999999] pointer-events-auto"
        style={{
          left: `${x}px`,
          top: topStyle,
          bottom: bottomStyle,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          if (hideTooltipTimerRef.current) clearTimeout(hideTooltipTimerRef.current);
        }}
        onMouseLeave={() => {
          if (!isPinned) hideItemTooltip();
        }}
      >
        <div
          className="w-[360px] sm:w-[440px] max-w-[95vw] overflow-y-auto custom-scrollbar rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#0F172A] via-[#0B1120] to-[#060913] border-2 text-slate-200 shadow-2xl backdrop-blur-2xl animate-fade-in relative"
          style={{
            borderColor: isMaterial ? matInfo.badgeBorder : tier.border,
            boxShadow: `0 0 25px ${isMaterial ? matInfo.badgeBorder : tier.color}40, 0 20px 40px rgba(0,0,0,0.9)`,
            maxHeight: `${maxHeight}px`
          }}
        >
          {/* Nút đóng nếu là chế độ Pinned (mobile/click) */}
          {isPinned && (
            <button
              type="button"
              onClick={() => setActiveItemTooltip(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer border border-slate-700 z-20 shadow-md"
              title="Đóng popup"
            >
              ✕
            </button>
          )}

          {/* HEADER VẬT PHẨM */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center relative shrink-0 overflow-hidden bg-black/60 shadow-inner"
              style={{
                border: `1.5px solid ${isMaterial ? matInfo.badgeBorder : tier.color}`,
                boxShadow: `inset 0 0 12px ${isMaterial ? matInfo.badgeBorder : tier.color}30`
              }}
            >
              {img ? (
                <img src={img} alt={item.name} className="w-11 h-11 object-contain filter drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]" />
              ) : (
                <span className="text-2xl">{isMaterial ? matInfo.icon : catBadge.icon}</span>
              )}
              {!isMaterial && (
                <div className="absolute bottom-0.5 text-center text-[7.5px] text-amber-300 font-bold">
                  {stars}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="font-black text-sm text-white truncate leading-tight">
                {item.name}{plusVal > 0 ? <span className="text-yellow-400 font-black"> +{plusVal}</span> : ''}
              </div>

              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {isMaterial ? (
                  <>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0"
                      style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}
                    >
                      {tier.label}
                    </span>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-md border uppercase shrink-0"
                      style={{ color: matInfo.badgeColor, background: matInfo.badgeBg, borderColor: matInfo.badgeBorder }}
                    >
                      {matInfo.badge}
                    </span>
                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                      x{Number(item.quantity || 1).toLocaleString()} {itemId === 'item_essence_stone' || lowerName.includes('tinh hoa') ? 'Viên' : (itemId === 'item_ring_crystal' || lowerName.includes('tinh thể') ? 'Tinh Thể' : 'Cái')}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0"
                      style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}
                    >
                      {tier.label}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0"
                      style={{ color: catBadge.color, background: catBadge.bg, borderColor: catBadge.border }}
                    >
                      {catBadge.icon} {catBadge.label}
                    </span>
                    {starsCount > 0 && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        {starsCount}⭐
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* NỘI DUNG CHI TIẾT */}
          {isMaterial ? (
            /* --- NGUYÊN LIỆU: MÔ TẢ DÙNG ĐỂ LÀM GÌ & CÁCH SỬ DỤNG --- */
            <div className="mt-2.5 space-y-2 text-xs">
              {/* PHẦN 1: DÙNG ĐỂ LÀM GÌ */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5">
                <div className="text-[11px] font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wide mb-1">
                  <span>📖</span> Dùng để làm gì?
                </div>
                <ul className="space-y-1 text-[10.5px] text-slate-300 leading-snug">
                  {matInfo.purpose.map((p, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PHẦN 2: CÁCH SỬ DỤNG NHƯ THẾ NÀO */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5">
                <div className="text-[11px] font-black text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide mb-1">
                  <span>💡</span> Cách sử dụng như thế nào?
                </div>
                <ul className="space-y-1 text-[10.5px] text-slate-300 leading-snug">
                  {matInfo.howToUse.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PHẦN 3: NGUỒN GỐC & CÁCH SỞ HỮU */}
              <div className="text-[10px] text-slate-400 bg-black/40 border border-slate-800/60 rounded-xl p-2 flex items-start gap-1.5">
                <span className="text-purple-400 font-bold shrink-0">🏷️ Nguồn kiếm:</span>
                <span className="text-slate-300">{matInfo.whereToGet}</span>
              </div>
            </div>
          ) : (
            /* --- TRANG BỊ: BẢNG THÔNG SỐ CHI TIẾT --- */
            <div className="mt-3 space-y-2.5 text-xs">
              {/* CHỈ SỐ CHÍNH (PRIMARY STATS) */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5">
                <div className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide mb-2">
                  <span>⚡</span> Thông Số Chiến Đấu Chi Tiết
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {category === 'weapon' && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Sát thương gốc (Base DMG):</span>
                        <span className="font-bold text-white">+{baseDmg.toLocaleString()} DMG</span>
                      </div>
                      {plusVal > 0 && (
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                          <span className="text-yellow-400">Cường hóa (+{plusVal}):</span>
                          <span className="font-bold text-yellow-300">+{plusBonus.toLocaleString()} DMG (+{plusVal * 25}%)</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-amber-400">Hệ số Sao ({starsCount}⭐):</span>
                        <span className="font-bold text-amber-300">x{starMult.toFixed(2)} Sức Mạnh</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-emerald-400 font-bold">Tổng Sát Thương Dự Tính:</span>
                        <span className="font-black text-emerald-300 text-xs">+{totalEstDmg.toLocaleString()} DMG ⚡</span>
                      </div>
                    </>
                  )}

                  {category === 'armor' && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Sinh lực gốc (Base HP):</span>
                        <span className="font-bold text-emerald-400">+{armorStats.baseHp.toLocaleString()} HP</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Phòng thủ gốc (Base DEF):</span>
                        <span className="font-bold text-cyan-400">+{armorStats.baseDef.toLocaleString()} DEF</span>
                      </div>
                      {plusVal > 0 && (
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                          <span className="text-yellow-400">Cường hóa (+{plusVal}):</span>
                          <span className="font-bold text-yellow-300">+{plusVal * 25}% HP • +{plusVal * 20}% DEF</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-amber-400">Hệ số Sao ({starsCount}⭐):</span>
                        <span className="font-bold text-amber-300">x{starMultMath} Chỉ Số</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-emerald-400 font-bold">Tổng Sinh Lực (HP):</span>
                        <span className="font-black text-emerald-300 text-xs">+{totalEstHp.toLocaleString()} HP ❤️</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-cyan-400 font-bold">Tổng Phòng Thủ (DEF):</span>
                        <span className="font-black text-cyan-300 text-xs">+{totalEstDef.toLocaleString()} DEF (Giảm ~{estDmgReduc}% ST Boss) 🛡️</span>
                      </div>
                    </>
                  )}

                  {category === 'necklace' && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Khuếch đại sát thương:</span>
                        <span className="font-bold text-amber-300 text-xs">+{dmgPercent}% DMG Toàn Bộ</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-amber-400">Hiệu quả Sao ({starsCount}⭐):</span>
                        <span className="font-bold text-amber-300">x{starMult.toFixed(2)} Khuếch Đại</span>
                      </div>
                      <div className="text-[10px] text-slate-400 italic pt-0.5">
                        * Tăng trực tiếp phần trăm sát thương cho tất cả các đòn đánh chém Boss.
                      </div>
                    </>
                  )}

                  {category === 'ring' && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Sát thương cơ bản:</span>
                        <span className="font-bold text-purple-300">+{baseDmgPercent}% DMG</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-purple-400 font-bold">Tuyệt kỹ rút máu Boss:</span>
                        <span className="font-black text-purple-300">⚡ Rút {skillPct}% Máu Tối Đa</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-amber-400 font-bold">Cấp Kỹ Năng Tuyệt Kỹ:</span>
                        <span className="font-bold text-amber-300">Lv.{skillLevel} / 9</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-amber-300">Tỉ lệ kích hoạt mỗi đòn:</span>
                        <span className="font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">
                          ⚡ {skillProcStr}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-slate-400">Giới hạn sát thương (Cap):</span>
                        <span className="font-bold text-slate-300">x{item.cap_mult || 100} Sát Thương Gốc</span>
                      </div>
                    </>
                  )}

                  {category === 'pet' && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Sát thương Linh Thú:</span>
                        <span className="font-bold text-rose-300">+{bonusDmg.toLocaleString()} DMG</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-rose-400 font-bold">Cấp độ Linh Thú:</span>
                        <span className="font-bold text-rose-300">Cấp {petLevel} / 100</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-amber-400">Tỉ lệ Chí Mạng Linh Thú:</span>
                        <span className="font-bold text-amber-300">+{starsCount * 3}% Crit</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* DÒNG THUỘC TÍNH PHỤ (SUB-STATS) */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5">
                <div className="text-[11px] font-black text-purple-300 flex items-center justify-between uppercase tracking-wide mb-1.5">
                  <span className="flex items-center gap-1.5"><span>✨</span> Thuộc Tính Phụ & Dòng Sao</span>
                  <span className="text-[9.5px] font-normal text-slate-400">({allSubStats.length} Dòng)</span>
                </div>

                {allSubStats.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allSubStats.map((sub, sIdx) => {
                      const cleanSub = formatSubStatText(sub);
                      return (
                        <span
                          key={sIdx}
                          className="text-[10px] font-bold text-slate-200 bg-purple-950/40 border border-purple-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                          <span>{cleanSub}</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic py-1">
                    Chưa mở khóa dòng phụ. Nâng sao hoặc đột phá bậc để mở khóa các dòng ẩn cực mạnh!
                  </div>
                )}
              </div>

              {/* HIỆU ỨNG BỘ TRANG BỊ (SET BONUS) */}
              {(() => {
                const setInfo = getItemSetInfo(item);
                if (!setInfo) return null;
                const { equippedCount, equippedSlots } = getEquippedSetStatus(setInfo.setKey, bossPlayerSummary);
                const totalPieces = setInfo.pieces.length;
                const isSetFull = equippedCount >= totalPieces;

                return (
                  <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2.5">
                    {/* Header Bộ */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60 mb-2">
                      <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wide" style={{ color: setInfo.color }}>
                        <span>{setInfo.icon}</span>
                        <span>{setInfo.name}</span>
                      </div>
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                        equippedCount >= 2
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                      }`}>
                        Kích hoạt: {equippedCount}/{totalPieces} món
                      </span>
                    </div>

                    {/* Danh sách các món trong bộ */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {setInfo.pieces.map((piece, pIdx) => {
                        const isEquipped = equippedSlots.some(s => s.slot === piece.slot);
                        return (
                          <span
                            key={pIdx}
                            className={`text-[9.5px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                              isEquipped
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]'
                                : 'bg-black/40 border border-dashed border-slate-800/80 text-slate-500 opacity-70'
                            }`}
                          >
                            <span className="text-xs shrink-0">{piece.slotIcon}</span>
                            <span className="break-words whitespace-normal leading-tight">{piece.name}</span>
                            {isEquipped && <span className="text-emerald-400 font-black shrink-0">✓</span>}
                          </span>
                        );
                      })}
                    </div>

                    {/* Các mốc kích hoạt thuộc tính Set */}
                    <div className="space-y-2">
                      <div className="text-[10.5px] font-black text-slate-400 flex items-center justify-between">
                        <span>Thuộc tính kích hoạt bộ:</span>
                        {isSetFull && <span className="text-[9.5px] text-amber-300 font-black">✨ ĐÃ ĐỦ TRỌN BỘ!</span>}
                      </div>

                      {setInfo.bonuses.map((bonus, bIdx) => {
                        const isUnlocked = equippedCount >= bonus.count;
                        return (
                          <div
                            key={bIdx}
                            className={`p-2.5 rounded-xl border text-[11px] transition-all flex flex-col gap-1.5 ${
                              isUnlocked
                                ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                : 'bg-slate-950/60 border-dashed border-slate-800 text-slate-400'
                            }`}
                          >
                            {/* Dòng 1: Mốc kích hoạt & Trạng thái */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs shrink-0 ${isUnlocked ? 'text-amber-400 font-black' : 'text-slate-500'}`}>
                                  {isUnlocked ? '✅' : '🔒'}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                                  isUnlocked
                                    ? 'bg-amber-500/30 border-amber-500/60 text-amber-300 shadow-sm'
                                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
                                }`}>
                                  Bộ [{bonus.count} Món]
                                </span>
                              </div>

                              {isUnlocked ? (
                                <span className="text-[9px] bg-amber-500/30 text-amber-300 font-black px-2 py-0.5 rounded-md border border-amber-500/50 uppercase tracking-wide shrink-0">
                                  ✨ Đã kích hoạt
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-500 font-mono shrink-0">
                                  (Chưa đủ)
                                </span>
                              )}
                            </div>

                            {/* Dòng 2: Nội dung thuộc tính XUỐNG HÀNG riêng biệt, tự do xuống dòng và KHÔNG BAO GIỜ bị cắt khúc */}
                            <div className="pl-5 text-[11.5px] leading-relaxed break-words whitespace-normal">
                              <span className={isUnlocked ? 'text-amber-100 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'text-slate-300 font-medium'}>
                                {bonus.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* HƯỚNG DẪN & TÍNH NĂNG */}
              <div className="bg-black/40 border border-slate-800/60 rounded-xl p-2.5 space-y-1.5 text-[10px] text-slate-300">
                <div className="font-black text-cyan-300 flex items-center gap-1 uppercase tracking-wide">
                  <span>💡</span> Hướng dẫn sử dụng:
                </div>
                <div>• Bấm nút <strong>[Mặc Vào]</strong> ở Túi Đồ để trang bị trực tiếp vào nhân vật.</div>
                {category === 'weapon' ? (
                  <div>• Gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold font-mono">/dap kiem</code> (hoặc <code>mdap kiem</code> / <code>/cuonghoa</code>) trên <strong>Live TikTok</strong> hoặc <strong>Discord</strong> để cường hóa tăng cấp (+plus).</div>
                ) : category === 'armor' ? (
                  <div>• Gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold font-mono">/dap giap</code> (hoặc <code>mdap giap</code> / <code>/cuonghoa</code>) trên <strong>Live TikTok</strong> hoặc <strong>Discord</strong> để cường hóa tăng cấp (+plus).</div>
                ) : category === 'necklace' ? (
                  <div>• Gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold font-mono">/dap chuyen</code> (hoặc <code>mdap chuyen</code> / <code>/cuonghoa</code>) trên <strong>Live TikTok</strong> hoặc <strong>Discord</strong> để cường hóa tăng cấp (+plus).</div>
                ) : category === 'ring' ? (
                  <div>• Dùng <strong>Tinh Thể & Xu</strong>, gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-bold font-mono">/dap nhan</code> (hoặc <code>mdap nhan</code> / <code>/cuonghoa</code>) trên <strong>Live TikTok</strong> hoặc <strong>Discord</strong> để nâng Cấp Tuyệt Kỹ & Đột phá Sao.</div>
                ) : category === 'pet' ? (
                  <div>• Dùng Lượt đánh, gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 font-bold font-mono">/feed</code> (hoặc <code>/feed &lt;số lượt&gt;</code>, <code>mfeed</code>, <code>/nuoi</code>) trên <strong>Live TikTok</strong> hoặc <strong>Discord</strong> để cho ăn tăng cấp (Level) và tăng sức mạnh Linh Thú.</div>
                ) : (
                  <div>• Gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold font-mono">/dap</code> (hoặc <code>/cuonghoa</code>) trên <strong>Live TikTok</strong> hoặc <strong>Discord</strong> để cường hóa tăng cấp.</div>
                )}
                <div>• Có thể bấm nút <strong>[Treo Đấu Giá]</strong> để bán lấy Xu trên Sàn Đấu Giá.</div>
              </div>
            </div>
          )}

          {/* FOOTER TIP */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
            <span>Mộng Thiên Huyễn • Hệ Thống Vật Phẩm</span>
            <span className="text-amber-400/80 font-mono">ID: #{String(item.id || item.name || '').slice(-6)}</span>
          </div>
        </div>
      </div>
    );
  };

  // =============================================================================
  // MÀN HÌNH NẠP GAME MỘNG THIÊN HUYỄN (ĐẠI CHIẾN BOSS)
  // =============================================================================
  const renderBossGameScreen = () => {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-16">
        {renderNavbar()}

        <main className="w-full max-w-7xl mx-auto px-4 lg:px-6 pt-6">
          {/* BANNER ĐỈNH CAO */}
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#151D2F] via-[#1A233A] to-[#0F172A] p-6 md:p-10 mb-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] text-center">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles size={14} className="animate-spin text-yellow-400" /> KÊNH NẠP TỰ ĐỘNG REALTIME 24/7
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-3">
              ⚔️ NẠP GAME <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400">MỘNG THIÊN HUYỄN</span>
            </h1>
            <p className="text-slate-300 max-w-3xl mx-auto text-sm md:text-base leading-relaxed mb-6">
              Hệ thống tự động chuyển thẳng <strong className="text-amber-400">Lượt Đánh, Rương Hoàng Kim, Xu Nâng Cấp & Trang Bị Thần Binh</strong> vào tài khoản game của bạn ngay khi bấm Mua. Loa Livestream sẽ tự động đọc tên cảm ơn và hiệu ứng nạp VIP sẽ phát sáng rực rỡ!
            </p>

            {/* KHU VỰC LIÊN KẾT TÀI KHOẢN & THÔNG TIN NHÂN VẬT GAME (BỎ KIỂM TRA ID) */}
            <div className="max-w-3xl mx-auto">
              {bossPlayerSummary ? (
                /* 1. KHÁCH ĐÃ LIÊN KẾT: THÔNG TIN NHÂN VẬT + NÚT TÚI ĐỒ & PROFILE (KHÔNG CÓ NÚT ĐỔI TÀI KHOẢN THEO CHỈ THỊ) */
                <div className="bg-gradient-to-r from-[#0B1120] via-[#151D2F] to-[#0B1120] border-2 border-emerald-500/50 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-md text-left animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-2 bg-gradient-to-l from-emerald-500/20 to-transparent w-48 h-16 pointer-events-none blur-xl"></div>

                  {/* Badge Đã liên kết vĩnh viễn */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>✓ ĐÃ LIÊN KẾT TÀI KHOẢN GAME VĨNH VIỄN</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Tự động nạp vào nhân vật này 24/7
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    {/* Thông tin nhân vật */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={bossPlayerSummary.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(bossPlayerSummary.user_id)}`}
                          alt="Avatar"
                          onClick={() => setShowBossProfileModal(true)}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-400 object-cover shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer hover:scale-105 transition-transform"
                          title="👉 Bấm để xem chi tiết Profile & Trang bị"
                        />
                        <div className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md border border-blue-400 shadow">
                          Lv.{bossPlayerSummary.level || 1}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => setShowBossProfileModal(true)}
                            className="text-white font-black text-lg sm:text-xl truncate drop-shadow cursor-pointer hover:text-amber-400 transition-colors"
                            title="👉 Bấm để xem chi tiết Profile & Trang bị"
                          >
                            {bossPlayerSummary.nickname}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          ID: <span className="text-amber-400 font-bold">@{bossPlayerSummary.user_id}</span>
                        </p>

                        {/* Chỉ số Lực chiến, Xu, Lượt, Rương */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs font-bold">
                          <span className="text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            ⚔️ <span className="text-white">{new Intl.NumberFormat('vi-VN').format(bossPlayerSummary.cp || 0)} CP</span>
                          </span>
                          <span className="text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-lg">
                            🪙 {new Intl.NumberFormat('vi-VN').format(bossPlayerSummary.bonus_coins || 0)} Xu
                          </span>
                          <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                            ⚡ {new Intl.NumberFormat('vi-VN').format(bossPlayerSummary.bonus_attacks || 0)} Lượt
                          </span>
                          <span className="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                            👑 {new Intl.NumberFormat('vi-VN').format(bossPlayerSummary.royal_chests || 0)} Rương VIP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Các Nút hành động: Túi Đồ, Sàn Đấu Giá & Xem Profile */}
                    <div className="flex flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          fetchAuctionMarketData();
                          setShowAuctionModal(true);
                        }}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
                      >
                        <span className="text-base leading-none">🏛️</span>
                        <span>Sàn Đấu Giá (Chợ Đồ)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowBagModal(true)}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/40"
                      >
                        <span className="text-base leading-none">🎒</span>
                        <span>Túi Đồ & Trang Bị</span>
                      </button>

                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          type="button"
                          onClick={() => setShowBossStatModal(true)}
                          className="flex-1 md:flex-none px-3.5 py-2.5 bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-cyan-600/30 hover:from-emerald-500/40 hover:to-cyan-500/40 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          title="Xem bảng chi tiết thuộc tính chiến đấu (HP, Công, Thủ, Crit)"
                        >
                          <BarChart2 size={15} />
                          <span>Xem Bảng Stat</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowBossProfileModal(true)}
                          className="flex-1 md:flex-none px-3.5 py-2.5 bg-[#1A233A] hover:bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          title="Xem 5 món trang bị, linh thú, nhẫn thần binh"
                        >
                          <Eye size={15} />
                          <span>Xem Profile</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. KHÁCH CHƯA LIÊN KẾT: HIỆN THÔNG BÁO BẮT BUỘC LIÊN KẾT ĐỂ NẠP DỄ DÀNG */
                <div className="bg-gradient-to-br from-[#151D2F] via-[#1A233A] to-[#0B1120] border-2 border-amber-500/60 rounded-2xl p-6 md:p-8 shadow-[0_0_35px_rgba(245,158,11,0.2)] backdrop-blur-md text-center animate-fade-in relative overflow-hidden">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
                    <Zap size={32} />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white mb-2 tracking-tight">
                    ⚠️ BẠN CHƯA LIÊN KẾT TÀI KHOẢN GAME!
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
                    Hãy liên kết tài khoản web với nhân vật game qua <strong className="text-amber-400">mã OTP an toàn</strong>. Sau khi liên kết, bạn sẽ nạp tự động 1-chạm không cần nhập ID, đồng thời có thể <strong className="text-purple-400">mở túi đồ, thay trang bị & xóa đồ rác</strong> trực tiếp trên web!
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleGenerateLinkOtp}
                      disabled={isGeneratingOtp}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingOtp ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-yellow-300" />}
                      <span>🔗 LẤY MÃ OTP ĐỂ LIÊN KẾT NGAY</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-4">
                    🔒 Chỉ cần xác nhận 1 lần duy nhất bằng cách bình luận mã trên <strong className="text-slate-200">TikTok Live</strong> hoặc gõ lệnh trên <strong className="text-slate-200">Discord</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TIÊU ĐỀ DANH SÁCH GÓI NẠP */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase text-white flex items-center gap-2">
                <Crown className="text-amber-400" size={24} /> BẢNG GÓI NẠP MỘNG THIÊN HUYỄN
              </h2>
              <p className="text-slate-400 text-xs md:text-sm">Chọn gói quà phù hợp để tăng cường sức mạnh, chém boss nhận rương báu khủng!</p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151D2F] border border-emerald-500/30 text-xs font-bold text-slate-300">
                <span>Số dư ví của bạn:</span>
                <span className="text-emerald-400 font-black text-sm">{new Intl.NumberFormat('vi-VN').format(currentUser.balance || 0)}đ</span>
              </div>
            )}
          </div>

          {/* GRID 8 GÓI NẠP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BOSS_GAME_PACKAGES.map((pkg) => {
              const isAffordable = currentUser ? (currentUser.balance || 0) >= pkg.price : false;
              const hasRing = pkg.items && pkg.items.length > 0;

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl bg-[#151D2F] border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1.5 ${hasRing
                      ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]'
                      : 'border-slate-800 hover:border-slate-600 shadow-xl'
                    }`}
                >
                  {/* BADGE KHUYẾN MÃI / LOẠI GÓI */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${pkg.badgeColor} shadow-md`}>
                      {pkg.badge}
                    </span>
                  </div>

                  <div className="p-5 text-left flex-1 flex flex-col">
                    {/* HÌNH ẢNH VẬT PHẨM ĐẠI DIỆN */}
                    <div className="w-full h-36 flex items-center justify-center relative my-2">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent rounded-full blur-xl pointer-events-none"></div>
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className={`max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] ${hasRing ? 'max-h-28 pb-1' : 'max-h-32'
                          }`}
                      />

                      {/* SỐ SAO BÊN DƯỚI CHÂN NHẪN & SỐ LƯỢNG x1 Ở GÓC NGOÀI (GÓI 7 & 8) */}
                      {hasRing && (
                        <>
                          {/* SỐ SAO BÊN DƯỚI CHÂN NHẪN */}
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center px-2.5 py-0.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.4)] z-20 whitespace-nowrap">
                            <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
                              {Array.from({ length: pkg.items[0].stars || 1 }).map((_, i) => (
                                <span key={i} className="drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]">⭐</span>
                              ))}
                            </div>
                          </div>

                          {/* SỐ LƯỢNG x1 NẰM Ở GÓC NGOÀI (GÓC DƯỚI BÊN PHẢI CỦA KHUNG ẢNH) */}
                          <div className="absolute bottom-0 right-1 px-2 py-0.5 rounded-lg bg-slate-950/95 backdrop-blur-md border border-amber-400/60 shadow-[0_0_10px_rgba(0,0,0,0.8)] z-20">
                            <span className="text-xs font-black text-amber-300 tracking-wider drop-shadow">
                              x1
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* TÊN GÓI & GIÁ */}
                    <h3 className="text-base font-black text-white mb-1 group-hover:text-amber-400 transition-colors">
                      {pkg.name}
                    </h3>
                    <div className="mb-3">
                      <span className="text-2xl font-black text-emerald-400">
                        {new Intl.NumberFormat('vi-VN').format(pkg.price)}
                        <span className="text-xs font-bold ml-1 text-emerald-500">VNĐ</span>
                      </span>
                    </div>

                    {/* CHI TIẾT CÁC PHẦN QUÀ NHẬN ĐƯỢC */}
                    <div className="space-y-2.5 py-3 border-t border-slate-800 text-xs flex-1">
                      {/* DÒNG XU NỔI BẬT NHẤT */}
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-left shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                        <div className="flex items-center gap-2">
                          <span className="text-xl shrink-0 leading-none">🪙</span>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-amber-300/80 block leading-tight tracking-wider">TIỀN TỆ MUA ĐỒ SHOP</span>
                            <span className="text-base font-black text-amber-300 drop-shadow">
                              +{new Intl.NumberFormat('vi-VN').format(pkg.coins)} XU GAME
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-amber-200 bg-amber-500/30 px-2 py-0.5 rounded-md border border-amber-400/30 whitespace-nowrap">
                          VIP
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-200 font-semibold px-1">
                        <Crown size={15} className="text-yellow-400 shrink-0" />
                        <span>+{pkg.royalChests} Rương Hoàng Kim VIP</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200 font-semibold px-1">
                        <Swords size={15} className="text-rose-400 shrink-0" />
                        <span>+{new Intl.NumberFormat('vi-VN').format(pkg.attacks)} Lượt Đánh Boss</span>
                      </div>
                      {hasRing && (
                        <div className="flex items-start gap-2 text-amber-300 font-black pt-2 border-t border-amber-500/30 px-1">
                          <Sparkles size={15} className="text-yellow-400 shrink-0 mt-0.5" />
                          <span>Tặng: x1 {pkg.items[0].name} ({pkg.items[0].stars}⭐)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NÚT MUA GÓI */}
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) return requireAuth('login');
                        if (!bossPlayerSummary) {
                          showToast("Vui lòng liên kết tài khoản game trước khi nạp!", "info");
                          handleGenerateLinkOtp();
                          return;
                        }
                        setSelectedBossPackage(pkg);
                      }}
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${hasRing
                          ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white shadow-amber-500/20'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                        }`}
                    >
                      <Zap size={14} />
                      <span>Nạp Ngay Bằng Ví</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* QUY TRÌNH & LƯU Ý */}
          <div className="mt-12 bg-[#151D2F] border border-slate-800 rounded-2xl p-6 text-left">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck size={18} /> Quy Trình Nạp & Bảo Đảm Tự Động:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                <p className="font-bold text-white mb-1">1. Liên Kết 1-Chạm</p>
                <p>Tài khoản đã liên kết vĩnh viễn với nick game của bạn. Không cần nhập ID mỗi lần nạp.</p>
              </div>
              <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                <p className="font-bold text-white mb-1">2. Trừ Tiền & Chuyển Quà</p>
                <p>Hệ thống trừ trực tiếp số dư ví web, bot game tự động cộng Lượt đánh, Rương và Trang bị trong 1 giây.</p>
              </div>
              <div className="p-3 bg-[#0B1120] rounded-xl border border-slate-800">
                <p className="font-bold text-white mb-1">3. Đọc Loa Trên Livestream</p>
                <p>Kênh livestream sẽ tự động phát âm thanh Ting Ting và đọc to câu cảm ơn vinh danh bạn trước toàn thể phòng live!</p>
              </div>
            </div>
          </div>
        </main>

        {/* MODAL XÁC NHẬN THANH TOÁN GÓI */}
        {selectedBossPackage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#151D2F] border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-up text-left">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#1A233A]">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Swords size={18} className="text-amber-400" /> Xác Nhận Mua Gói Nạp
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedBossPackage(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Thông tin người nhận */}
                <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Tài khoản nhận quà trong game:</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-black text-sm">{bossPlayerSummary?.nickname || bossTargetId}</span>
                      <span className="text-slate-400 text-xs ml-2 font-mono">(@{bossPlayerSummary?.user_id || bossTargetId.trim().replace(/^@/, '')})</span>
                    </div>
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Đã liên kết vĩnh viễn
                    </span>
                  </div>
                </div>

                {/* Thông tin gói */}
                <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 font-bold text-sm">{selectedBossPackage.name}</span>
                    <span className="text-emerald-400 font-black text-sm">
                      {new Intl.NumberFormat('vi-VN').format(selectedBossPackage.price)}đ
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5">
                    <p className="text-amber-300 font-black text-sm pb-1 border-b border-amber-500/20 flex items-center gap-2">
                      <span className="text-base leading-none">🪙</span>
                      <span>+{new Intl.NumberFormat('vi-VN').format(selectedBossPackage.coins)} Xu Game (Tiền Tệ Quý Mua Đồ Shop)</span>
                    </p>
                    <p>• +{selectedBossPackage.royalChests} Rương Hoàng Kim VIP</p>
                    <p>• +{new Intl.NumberFormat('vi-VN').format(selectedBossPackage.attacks)} Lượt Đánh Boss</p>
                    {selectedBossPackage.items && selectedBossPackage.items.length > 0 && (
                      <p className="text-amber-300 font-bold">• 💥 Tặng kèm: x1 {selectedBossPackage.items[0].name} ({selectedBossPackage.items[0].stars}⭐)</p>
                    )}
                  </div>
                </div>

                {/* Kiểm tra số dư */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Số dư hiện tại của bạn:</span>
                    <span className="font-bold text-white">{new Intl.NumberFormat('vi-VN').format(currentUser?.balance || 0)}đ</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Số tiền cần thanh toán:</span>
                    <span className="font-bold text-rose-400">-{new Intl.NumberFormat('vi-VN').format(selectedBossPackage.price)}đ</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold">
                    <span>Số dư còn lại:</span>
                    <span className={(currentUser?.balance || 0) >= selectedBossPackage.price ? 'text-emerald-400' : 'text-rose-400'}>
                      {new Intl.NumberFormat('vi-VN').format((currentUser?.balance || 0) - selectedBossPackage.price)}đ
                    </span>
                  </div>
                </div>

                {(currentUser?.balance || 0) < selectedBossPackage.price && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center justify-between">
                    <span>Số dư không đủ để thanh toán!</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBossPackage(null);
                        setCurrentView('naptien');
                      }}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                    >
                      Nạp Tiền Ngay
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-800 bg-[#1A233A] flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBossPackage(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={isBuyingBossPackage || (currentUser?.balance || 0) < selectedBossPackage.price}
                  onClick={() => executeBuyBossPackage(selectedBossPackage)}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black uppercase rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBuyingBossPackage ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>Xác Nhận Thanh Toán</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL NẠP THÀNH CÔNG RỰC RỠ */}
        {bossSuccessModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#151D2F] border-2 border-amber-500/60 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-scale-up text-center p-6 sm:p-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-4 animate-bounce">
                <Sparkles size={36} />
              </div>

              <h3 className="text-2xl font-black uppercase text-white mb-2">
                🎉 NẠP GÓI THÀNH CÔNG!
              </h3>
              <p className="text-amber-400 font-extrabold text-sm mb-4">
                {bossSuccessModal.pkg.name} ({new Intl.NumberFormat('vi-VN').format(bossSuccessModal.pkg.price)}đ)
              </p>

              <div className="bg-[#0B1120] p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1.5 mb-6 text-left">
                <p className="text-slate-400">ID Người nhận: <strong className="text-white">@{bossSuccessModal.targetId}</strong></p>
                <p className="text-slate-400">Mã giao dịch: <strong className="text-amber-400 font-mono">{bossSuccessModal.orderId}</strong></p>
                <div className="border-t border-slate-800 pt-2 text-emerald-400 font-bold">
                  ✓ Vật phẩm đã được chuyển trực tiếp vào tài khoản trong game. Loa livestream đang phát thông báo vinh danh bạn!
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBossSuccessModal(null);
                    setHistoryTab('bossgame');
                    setCurrentView('lichsu');
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Xem Lịch Sử
                </button>
                <button
                  type="button"
                  onClick={() => setBossSuccessModal(null)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black uppercase rounded-xl transition-all shadow-lg"
                >
                  Tiếp Tục Nạp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PROFILE & TRANG BỊ NGƯỜI CHƠI (GIỐNG DASHBOARD ADMIN) */}
        {showBossProfileModal && bossPlayerSummary && (() => {
          const p = bossPlayerSummary;
          const lvl = Number(p.level || 1);
          const exp = Number(p.exp || 0);
          const expNeeded = Math.floor(500 * Math.pow(2, Math.max(0, lvl - 1)));
          const expPct = Math.min(100, Math.max(0, (exp / Math.max(1, expNeeded)) * 100));

          // Tính toán All DMG
          const baseUserDmg = 100 + (lvl * 25);
          let wpDmg = 0;
          if (p.weapon) {
            const wpBase = Number(p.weapon.base_dmg || 0);
            const wpPlus = Number(p.weapon.plus || 0);
            const wpStars = Math.max(1, Math.min(5, Number(p.weapon.stars || 1)));
            wpDmg = Math.round(wpBase * (1.0 + wpPlus * 0.25) * Math.pow(2, wpStars - 1));
          }
          let arDmg = 0;
          if (p.armor) {
            const arBase = Number(p.armor.base_dmg || 0);
            const arPlus = Number(p.armor.plus || 0);
            const arStars = Math.max(1, Math.min(5, Number(p.armor.stars || 1)));
            arDmg = Math.round(arBase * (1.0 + arPlus * 0.25) * Math.pow(2, arStars - 1));
          }
          let petDmg = 0;
          if (p.pet) {
            const pBase = Number(p.pet.bonus_dmg || 0);
            const pStars = Math.max(1, Math.min(5, Number(p.pet.stars || 1)));
            petDmg = Math.round(pBase * Math.pow(2, pStars - 1));
          }
          let baseTotalDmg = baseUserDmg + wpDmg + arDmg + petDmg;
          let nkPct = 0;
          if (p.necklace) {
            const bPct = Number(p.necklace.dmg_percent || 0);
            const uPct = Math.max(Number(p.necklace.plus || 0), Math.round(bPct * (p.necklace.plus || 0) * 0.20));
            const nStars = Math.max(1, Math.min(5, Number(p.necklace.stars || 1)));
            nkPct = (bPct + uPct) * Math.pow(2, nStars - 1);
          }
          let ringDmgPct = 0;
          if (p.ring) {
            const rBase = Number(p.ring.base_dmg_percent || 0);
            const rS = Math.max(1, Math.min(5, Number(p.ring.stars || 1)));
            ringDmgPct = Math.round(rBase * Math.pow(3, rS - 1));
          }
          const allAttack = Math.round(baseTotalDmg * (1.0 + (nkPct / 100.0)) * (1.0 + (ringDmgPct / 100.0)));

          const renderEquipSlot = (item, category, defaultIcon, defaultTitle) => {
            if (!item || !item.name) {
              return (
                <div className="bg-[#0F172A]/70 border border-dashed border-slate-700/80 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-dashed border-slate-600 flex items-center justify-center text-xl shrink-0 text-slate-500">
                    {defaultIcon}
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-bold">{defaultTitle}</div>
                    <div className="text-slate-600 text-[11px] italic">Chưa trang bị</div>
                  </div>
                </div>
              );
            }

            const tier = getBossTierStyle(item.tier);
            const imgUrl = getBossItemAsset(item, category);
            const plusText = (item.plus && item.plus > 0) ? ` +${item.plus}` : '';
            const starsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
            const stars = '⭐'.repeat(starsCount);

            return (
              <div
                className="rounded-2xl p-3 sm:p-3.5 flex items-start gap-3 sm:gap-3.5 relative transition-all duration-200 cursor-pointer hover:border-cyan-400/70 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(20, 28, 48, 0.92))',
                  border: `1.5px solid ${tier.border}`,
                  boxShadow: `0 4px 15px rgba(0,0,0,0.4)`
                }}
                onMouseEnter={(e) => showItemTooltip(item, e, category)}
                onMouseMove={updateItemTooltipPos}
                onMouseLeave={hideItemTooltip}
                onClick={(e) => handleItemCardClick(item, e, category)}
              >
                {/* Thumbnail vuông chuẩn tỉ lệ, không bị kéo dãn trên mobile */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-xl flex items-center justify-center relative shrink-0 self-start overflow-hidden shadow-inner"
                  style={{
                    border: `2px solid ${tier.color}`,
                    background: '#060913',
                    boxShadow: `0 0 12px ${tier.border}`
                  }}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      style={{ filter: `drop-shadow(0 0 6px ${tier.color})` }}
                    />
                  ) : (
                    <span className="text-2xl">{defaultIcon}</span>
                  )}
                  <div className="absolute bottom-0.5 left-0 right-0 text-center text-[9px] text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {stars}
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-start">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-xs sm:text-sm leading-snug" style={{ color: tier.color }} title={item.name}>
                      {item.name}{plusText}
                    </span>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0"
                      style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}
                    >
                      {tier.label}
                    </span>
                    {category === 'pet' && item.level && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-sm shrink-0">
                        Lv.{item.level}
                      </span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px]">
                    {category === 'weapon' && (
                      <>
                        <span className="font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                          {Number(item.base_dmg || 0).toLocaleString()} DMG
                        </span>
                        {item.plus > 0 && (
                          <span className="font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1.5 py-0.5 rounded">
                            +{Math.round(Number(item.base_dmg || 0) * item.plus * 0.25).toLocaleString()} Cường Hóa
                          </span>
                        )}
                      </>
                    )}
                    {category === 'armor' && (() => {
                      const bHp = Number(item.base_hp || (item.tier?.toLowerCase().includes('thượng cổ') ? 150000 : (item.tier?.toLowerCase().includes('cổ đại') ? 60000 : (item.tier?.toLowerCase().includes('tối thượng') ? 25000 : (item.tier?.toLowerCase().includes('thần thoại') ? 10000 : (item.tier?.toLowerCase().includes('epic') ? 4000 : 1500))))));
                      const bDef = Number(item.base_def || (item.tier?.toLowerCase().includes('thượng cổ') ? 15000 : (item.tier?.toLowerCase().includes('cổ đại') ? 6000 : (item.tier?.toLowerCase().includes('tối thượng') ? 2500 : (item.tier?.toLowerCase().includes('thần thoại') ? 1000 : (item.tier?.toLowerCase().includes('epic') ? 400 : 150))))));
                      const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                      const totHp = Math.round(bHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                      const totDef = Math.round(bDef * (1 + 0.20 * (item.plus || 0)) * sMult);
                      return (
                        <>
                          <span className="font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                            ❤️ +{totHp.toLocaleString()} HP
                          </span>
                          <span className="font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded">
                            🛡️ +{totDef.toLocaleString()} DEF
                          </span>
                        </>
                      );
                    })()}
                    {category === 'necklace' && (
                      <span className="font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded">
                        +{Number(item.dmg_percent || 0)}% DMG
                      </span>
                    )}
                    {category === 'ring' && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-purple-400 bg-purple-400/10 border border-purple-400/30 px-1.5 py-0.5 rounded">
                          +{Number(item.base_dmg_percent || 0)}% DMG {item.skill_pct ? `• ⚡ ${item.skill_pct}% HP` : ''}
                        </span>
                        {/* Luôn hiển thị thông tin phát động Kỹ Năng */}
                        <span className="font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 rounded text-[10px]">
                          ⚡ {item.skill_level > 0 ? `Kỹ Năng Lv.${item.skill_level} (${getRingSkillProcStr(item)})` : `Tỉ Lệ: ${getRingSkillProcStr(item)}`}
                        </span>
                      </div>
                    )}
                    {category === 'pet' && (
                      <span className="font-bold text-rose-400 bg-rose-400/10 border border-rose-400/30 px-1.5 py-0.5 rounded">
                        +{Number(item.bonus_dmg || 0).toLocaleString()} DMG
                      </span>
                    )}
                  </div>

                  {/* Sub-stats */}
                  {(() => {
                    const allSubs = Array.from(new Set([
                      ...(Array.isArray(item.sub_stats) ? item.sub_stats : []),
                      ...(Array.isArray(item.star_sub_stats) ? item.star_sub_stats : [])
                    ].filter(Boolean)));
                    if (allSubs.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {allSubs.slice(0, 3).map((sub, sIdx) => {
                          const cleanSub = formatSubStatText(sub);
                          return (
                            <span
                              key={sIdx}
                              className="text-[9px] font-bold text-slate-300 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded whitespace-nowrap"
                            >
                              {cleanSub}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          };

          return (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
              onClick={(e) => { if (e.target === e.currentTarget) setShowBossProfileModal(false); }}
            >
              <div className="bg-gradient-to-br from-[#0d1326] via-[#0b101d] to-[#060913] border-2 border-cyan-400 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-[0_0_50px_rgba(0,229,255,0.35)] p-5 sm:p-6 flex flex-col relative text-white animate-zoom-in overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-cyan-500/20 pb-4 mb-4 shrink-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.user_id)}`}
                      alt="Avatar"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[2.5px] border-yellow-400 shadow-[0_0_16px_rgba(255,215,0,0.7)] object-cover bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-lg sm:text-xl text-white tracking-wide truncate max-w-[200px] sm:max-w-[280px]">
                          {p.nickname}
                        </span>
                        <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/15 border border-yellow-400/40 rounded px-2 py-0.5">
                          ⚔️ Chiến Thần
                        </span>
                      </div>
                      <div className="text-xs text-cyan-400 font-mono mt-0.5 truncate">
                        @{p.user_id}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-rose-600 to-red-600 text-white">
                          TikTok Live [TT]
                        </span>
                        {p.has_x2_rate && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                            👑 x2 TỈ LỆ VIP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setShowBossProfileModal(false); setShowBossStatModal(true); }}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl border border-emerald-400/50 shadow flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                      title="Chuyển sang xem Bảng Stat Thuộc Tính Chiến Đấu"
                    >
                      <BarChart2 size={14} />
                      <span className="hidden sm:inline">Xem Stat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBossProfileModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3.5 flex-1">
                  {/* Level & EXP Bar */}
                  <div className="bg-[#0B101B]/80 border border-slate-800 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="font-extrabold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-2 py-0.5 rounded">
                        Cấp {lvl}
                      </span>
                      <span className="font-bold text-slate-400 font-mono text-[11px]">
                        {exp.toLocaleString()} / {expNeeded.toLocaleString()} EXP ({expPct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_#00e5ff] transition-all duration-500"
                        style={{ width: `${expPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Fiery CP Box */}
                  <div className="bg-gradient-to-r from-orange-600/20 via-amber-500/20 to-orange-600/10 border border-orange-500/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-[0_0_20px_rgba(255,100,0,0.25)]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl animate-bounce">🔥</span>
                      <div>
                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Lực Chiến (CP)</div>
                        <div className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,69,0,0.8)] font-sans">
                          {Number(p.cp || 0).toLocaleString()} CP
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                      Bảng Xếp Hạng Server
                    </span>
                  </div>

                  {/* Mini Stats Grid */}
                  <div>
                    <div className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      📊 Chỉ Số Chiến Đấu & Tài Nguyên
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">⚔️ Sát Thương (DMG)</div>
                        <div className="text-sm font-black text-emerald-400 mt-0.5">
                          {allAttack > 0 ? allAttack.toLocaleString() : '0'} DMG
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">⚡ Lượt Đánh Khả Dụng</div>
                        <div className="text-sm font-black text-cyan-400 mt-0.5">
                          {Number(p.bonus_attacks || 0).toLocaleString()} Lượt
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">🪙 Xu</div>
                        <div className="text-sm font-black text-amber-400 mt-0.5">
                          {Number(p.bonus_coins || 0).toLocaleString()} Xu
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">👑 Rương Hoàng Kim</div>
                        <div className="text-sm font-black text-yellow-400 mt-0.5">
                          {Number(p.royal_chests || 0).toLocaleString()} Rương
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Section (5 Slots) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                        🛡️ Trang Bị & Thần Binh Đang Mặc (5 Ô)
                      </span>
                      <span className="text-[10.5px] text-slate-500 italic hidden sm:inline">
                        Chi tiết sao, cường hóa, nhẫn & thuộc tính phụ
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {renderEquipSlot(p.weapon, 'weapon', '⚔️', 'Vũ Khí')}
                      {renderEquipSlot(p.armor, 'armor', '🛡️', 'Áo Giáp')}
                      {renderEquipSlot(p.necklace, 'necklace', '📿', 'Dây Chuyền')}
                      {renderEquipSlot(p.ring, 'ring', '💍', 'Nhẫn Thần Binh')}
                      <div className="sm:col-span-2">
                        {renderEquipSlot(p.pet, 'pet', '🐾', 'Linh Thú')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center shrink-0 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowBossProfileModal(false); setShowBossStatModal(true); }}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <BarChart2 size={14} />
                      <span>Xem Bảng Stat Thuộc Tính</span>
                    </button>
                    <span className="text-[11px] text-emerald-400 font-bold hidden sm:flex items-center gap-1">
                      <CheckCircle2 size={13} /> Sẵn sàng nhận quà
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBossProfileModal(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL STAT CHI TIẾT THUỘC TÍNH CHIẾN ĐẤU (HP, CÔNG, THỦ, CRIT) */}
        {showBossStatModal && bossPlayerSummary && (() => {
          const p = bossPlayerSummary;
          const lvl = Number(p.level || 1);

          // 1. MÁU (HP) & PHÒNG THỦ (DEF)
          const baseHp = 1000 + lvl * 150;
          let armorHp = 0;
          let armorDef = 0;
          if (p.armor) {
            const getArmorStats = (it) => {
              if (it?.base_hp !== undefined && it?.base_def !== undefined) {
                return { baseHp: Number(it.base_hp), baseDef: Number(it.base_def) };
              }
              const n = (it?.name || '').toLowerCase();
              const t = (it?.tier || '').toLowerCase();
              if (n.includes('nữ oa') || t.includes('thượng cổ')) return { baseHp: 150000, baseDef: 15000 };
              if (n.includes('long vương') || t.includes('cổ đại')) return { baseHp: 60000, baseDef: 6000 };
              if (n.includes('vô cực') || t.includes('tối thượng')) return { baseHp: 25000, baseDef: 2500 };
              if (n.includes('kim cương') || t.includes('thần thoại')) return { baseHp: 10000, baseDef: 1000 };
              if (n.includes('thánh quang') || t.includes('epic')) return { baseHp: 4000, baseDef: 400 };
              if (n.includes('giáp rồng') || t.includes('hiếm')) return { baseHp: 1500, baseDef: 150 };
              return { baseHp: 500, baseDef: 50 };
            };
            const aStats = getArmorStats(p.armor);
            const aPlus = Number(p.armor.plus || 0);
            const aStars = Math.max(1, Math.min(5, Number(p.armor.stars || 1)));
            const starMultMath = Math.pow(2, Math.max(0, aStars - 1));
            armorHp = Math.round(aStats.baseHp * (1 + 0.25 * aPlus) * starMultMath);
            armorDef = Math.round(aStats.baseDef * (1 + 0.20 * aPlus) * starMultMath);
          }

          const maxHp = Number(p.max_hp !== undefined ? p.max_hp : (baseHp + armorHp));
          const currentHp = Number(p.current_hp !== undefined ? p.current_hp : maxHp);
          const hpPct = Math.min(100, Math.max(0, (currentHp / Math.max(1, maxHp)) * 100));
          const totalDef = Number(p.total_def !== undefined ? p.total_def : armorDef);
          const dmgReducPct = Number(p.dmg_reduction_pct !== undefined ? p.dmg_reduction_pct : (totalDef > 0 ? (totalDef / (totalDef + 2500) * 100) : 0));
          const isDead = Boolean(p.is_dead);
          const respawnTime = Number(p.respawn_seconds_left || 0);

          // 2. TẤN CÔNG (ATK / ALL DMG)
          const baseUserDmg = 100 + (lvl * 25);
          let wpDmg = 0;
          if (p.weapon) {
            const wpBase = Number(p.weapon.base_dmg || 0);
            const wpPlus = Number(p.weapon.plus || 0);
            const wpStars = Math.max(1, Math.min(5, Number(p.weapon.stars || 1)));
            wpDmg = Math.round(wpBase * (1.0 + wpPlus * 0.25) * Math.pow(2, wpStars - 1));
          }
          let arDmg = 0;
          if (p.armor) {
            const arBase = Number(p.armor.base_dmg || 0);
            const arPlus = Number(p.armor.plus || 0);
            const arStars = Math.max(1, Math.min(5, Number(p.armor.stars || 1)));
            arDmg = Math.round(arBase * (1.0 + arPlus * 0.25) * Math.pow(2, arStars - 1));
          }
          let petDmg = 0;
          if (p.pet) {
            const pBase = Number(p.pet.bonus_dmg || 0);
            const pStars = Math.max(1, Math.min(5, Number(p.pet.stars || 1)));
            petDmg = Math.round(pBase * Math.pow(2, pStars - 1));
          }
          let baseTotalDmg = baseUserDmg + wpDmg + arDmg + petDmg;
          let nkPct = 0;
          if (p.necklace) {
            const bPct = Number(p.necklace.dmg_percent || 0);
            const uPct = Math.max(Number(p.necklace.plus || 0), Math.round(bPct * (p.necklace.plus || 0) * 0.20));
            const nStars = Math.max(1, Math.min(5, Number(p.necklace.stars || 1)));
            nkPct = (bPct + uPct) * Math.pow(2, nStars - 1);
          }
          let ringDmgPct = 0;
          if (p.ring) {
            const rBase = Number(p.ring.base_dmg_percent || 0);
            const rS = Math.max(1, Math.min(5, Number(p.ring.stars || 1)));
            ringDmgPct = Math.round(rBase * Math.pow(3, rS - 1));
          }
          const allAttack = Number(p.total_attack || Math.round(baseTotalDmg * (1.0 + (nkPct / 100.0)) * (1.0 + (ringDmgPct / 100.0))));

          // 3. CHÍ MẠNG (CRIT & CRIT DMG TỔNG %)
          let fallbackCrit = 15;
          if (p.pet && p.pet.tier) {
            const tLow = (p.pet.tier || '').toLowerCase();
            fallbackCrit = tLow.includes('thượng cổ') ? 50 : (tLow.includes('cổ đại') ? 35 : (tLow.includes('tối thượng') ? 25 : (tLow.includes('thần thoại') ? 20 : (tLow.includes('epic') ? 15 : 10))));
          }
          const critRate = Number((p.crit_chance !== undefined && p.crit_chance > 0) ? p.crit_chance : fallbackCrit);
          const critMul = Number(p.crit_multiplier !== undefined ? p.crit_multiplier : 1.8);
          const critTotalPct = Math.round(critMul * 100);

          const ringProcStr = p.ring ? getRingSkillProcStr(p.ring) : 'Chưa mở khóa';

          return (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
              onClick={(e) => { if (e.target === e.currentTarget) setShowBossStatModal(false); }}
            >
              <div className="bg-gradient-to-br from-[#090e1c] via-[#0b1224] to-[#04060c] border-2 border-cyan-400 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-[0_0_55px_rgba(0,229,255,0.4)] p-5 sm:p-6 flex flex-col relative text-white animate-zoom-in overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-cyan-500/25 pb-4 mb-4 shrink-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.user_id)}`}
                      alt="Avatar"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[2.5px] border-cyan-400 shadow-[0_0_16px_rgba(0,229,255,0.7)] object-cover bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-lg sm:text-xl text-white tracking-wide truncate max-w-[200px] sm:max-w-[280px]">
                          {p.nickname}
                        </span>
                        <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/15 border border-cyan-400/40 rounded px-2 py-0.5">
                          Cấp {lvl}
                        </span>
                        <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/15 border border-yellow-400/40 rounded px-2 py-0.5">
                          ⚔️ Chiến Thần
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                        @{p.user_id}
                      </div>
                      <div className="text-[11px] text-cyan-300 font-bold mt-1 flex items-center gap-1">
                        📊 BẢNG THUỘC TÍNH CHIẾN ĐẤU (HP, CÔNG, THỦ, CRIT)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setShowBossStatModal(false); setShowBossProfileModal(true); }}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl border border-indigo-400/50 shadow flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                      title="Xem Profile & Trang Bị"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">Xem Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBossStatModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3.5 flex-1">
                  {/* Highlight Bar: Trạng Thái Sinh Mệnh (HP) */}
                  <div className="bg-gradient-to-r from-rose-950/40 via-red-900/20 to-slate-900/60 border border-rose-500/50 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-[0_0_20px_rgba(244,63,94,0.2)] flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl animate-pulse">❤️</span>
                      <div>
                        <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Tình Trạng Sinh Lực (HP)</div>
                        <div className="text-xl sm:text-2xl font-black text-white font-sans drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">
                          {currentHp.toLocaleString()} <span className="text-sm font-bold text-slate-400">/ {maxHp.toLocaleString()} HP</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {isDead ? (
                        <span className="text-xs font-black text-rose-400 bg-rose-500/15 border border-rose-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                          💀 Trọng Thương ({respawnTime}s hồi sinh)
                        </span>
                      ) : (
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                          🟢 Khỏe Mạnh ({hpPct.toFixed(0)}% Máu)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 CORE COMBAT STATS (MÁU, CÔNG, THỦ, CRIT) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* CARD 1: HP */}
                    <div className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-3.5 relative overflow-hidden shadow-[0_4px_15px_rgba(244,63,94,0.1)]">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-black text-rose-400 uppercase flex items-center gap-1.5">
                          ❤️ Sinh Lực (HP)
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">Max HP</span>
                      </div>
                      <div className="text-xl font-black text-white font-sans drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                        {currentHp.toLocaleString()} / {maxHp.toLocaleString()} HP
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-2.5 border border-rose-500/30">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full shadow-[0_0_8px_#f43f5e]"
                          style={{ width: `${hpPct}%` }}
                        />
                      </div>
                    </div>

                    {/* CARD 2: TẤN CÔNG (ATK / ALL DMG) */}
                    <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-3.5 relative overflow-hidden shadow-[0_4px_15px_rgba(16,185,129,0.1)]">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                          ⚔️ Sức Tấn Công (ATK)
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">All Real DMG</span>
                      </div>
                      <div className="text-xl font-black text-emerald-300 font-sans drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                        {allAttack > 0 ? allAttack.toLocaleString() : '0'} DMG
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 font-medium">
                        Sát thương thực tế mỗi đòn chém Boss
                      </div>
                    </div>

                    {/* CARD 3: PHÒNG THỦ (DEF) */}
                    <div className="bg-sky-950/20 border border-sky-500/40 rounded-2xl p-3.5 relative overflow-hidden shadow-[0_4px_15px_rgba(14,165,233,0.1)]">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-black text-sky-400 uppercase flex items-center gap-1.5">
                          🛡️ Phòng Thủ (DEF)
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">Giảm Sát Thương</span>
                      </div>
                      <div className="text-xl font-black text-sky-300 font-sans drop-shadow-[0_0_8px_rgba(14,165,233,0.6)]">
                        {totalDef.toLocaleString()} DEF
                      </div>
                      <div className="text-[11.5px] text-sky-400 font-bold mt-2">
                        🛡️ Giảm Sát Thương Nhận Vào: {dmgReducPct.toFixed(1)}%
                      </div>
                    </div>

                    {/* CARD 4: CRIT & CRIT DMG (TỔNG %) */}
                    <div className="bg-pink-950/20 border border-pink-500/40 rounded-2xl p-3.5 relative overflow-hidden shadow-[0_4px_15px_rgba(244,63,94,0.1)]">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-black text-pink-400 uppercase flex items-center gap-1.5">
                          ⚡ Bạo Kích & Sát Thương (Crit)
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">Chí Mạng</span>
                      </div>
                      <div className="text-xl font-black text-rose-400 font-sans drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                        ⚡ {critRate.toFixed(1)}% | 💥 {critTotalPct}%
                      </div>
                      <div className="text-[11px] text-rose-300 font-bold mt-2">
                        💥 Sát Thương Chí Mạng: {critTotalPct}%
                      </div>
                    </div>
                  </div>

                  {/* KỸ NĂNG THẦN BINH & TÀI NGUYÊN */}
                  <div>
                    <div className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      🔮 Kỹ Năng Thần Binh & Tài Nguyên
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">💍 Nhẫn Thần Binh</div>
                        <div className="text-xs font-extrabold text-purple-400 mt-1 truncate">
                          {ringProcStr}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">📈 Thưởng EXP Đòn Đánh</div>
                        <div className="text-xs font-extrabold text-sky-400 mt-1">
                          +{(p.exp_bonus_multiplier || 0).toFixed(1)}% EXP
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">⚡ Lượt Đánh Khả Dụng</div>
                        <div className="text-xs font-extrabold text-cyan-400 mt-1">
                          {Number(p.bonus_attacks || 0).toLocaleString()} lượt
                        </div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">🪙 Xu Nâng Cấp Khả Dụng</div>
                        <div className="text-xs font-extrabold text-amber-400 mt-1">
                          {Number(p.bonus_coins || 0).toLocaleString()} Xu
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center shrink-0 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowBossStatModal(false); setShowBossProfileModal(true); }}
                      className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>Xem Profile & 5 Trang Bị</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowBossStatModal(false); setShowBagModal(true); }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Package size={14} />
                      <span>Mở Túi Đồ</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBossStatModal(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL OTP LIÊN KẾT TÀI KHOẢN GAME & WEB */}
        {showLinkOtpModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#151D2F] border-2 border-amber-500/70 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-scale-up text-left">
              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-[#1A233A] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      Liên Kết Tài Khoản Game
                    </h3>
                    <p className="text-[11px] text-slate-400">Xác nhận 1 lần duy nhất để nạp và quản lý đồ (Hiệu lực: 2 phút)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkOtpModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Khung mã OTP */}
                <div className={`bg-[#0B1120] border-2 border-dashed rounded-2xl p-5 text-center relative overflow-hidden transition-colors ${linkOtpCountdown > 0 ? 'border-amber-500/50' : 'border-rose-500/50'}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-widest block mb-2 ${linkOtpCountdown > 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                    {linkOtpCountdown > 0 ? 'MÃ OTP LIÊN KẾT CỦA BẠN (2 PHÚT)' : 'MÃ OTP ĐÃ HẾT HẠN'}
                  </span>
                  <div className={`text-4xl sm:text-5xl font-black font-mono tracking-[0.25em] pl-[0.25em] my-1 ${linkOtpCountdown > 0
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                      : 'text-slate-500 line-through opacity-60'
                    }`}>
                    {linkOtpCode || '------'}
                  </div>

                  <div className="flex items-center justify-center gap-3 mt-3">
                    <button
                      type="button"
                      disabled={linkOtpCountdown <= 0}
                      onClick={() => {
                        if (linkOtpCode && linkOtpCountdown > 0) {
                          navigator.clipboard.writeText(linkOtpCode);
                          showToast("Đã sao chép mã OTP!", "success");
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Copy size={13} />
                      <span>Sao Chép Mã</span>
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      ⏱️ Còn lại: <strong className={`font-bold ${linkOtpCountdown > 30 ? 'text-emerald-400' : linkOtpCountdown > 0 ? 'text-amber-400 animate-pulse' : 'text-rose-500'}`}>{Math.floor(linkOtpCountdown / 60)}:{(linkOtpCountdown % 60).toString().padStart(2, '0')}</strong>
                    </span>
                  </div>
                </div>

                {/* 2 Cách xác nhận */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Chọn 1 trong 2 cách sau để xác nhận:
                  </h4>

                  {/* Cách 1: TikTok Live */}
                  <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      TT
                    </div>
                    <div className="flex-1 min-w-0 text-xs text-slate-300">
                      <p className="font-bold text-white mb-1">Cách 1: Bình luận trên Live TikTok</p>
                      <p className="leading-relaxed">
                        Vào xem livestream đang phát, gõ bình luận chat:
                        <code className="mx-1 px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold border border-slate-700">
                          lk {linkOtpCode}
                        </code>
                        hoặc <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold">link {linkOtpCode}</code>
                      </p>
                    </div>
                  </div>

                  {/* Cách 2: Discord */}
                  <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      DC
                    </div>
                    <div className="flex-1 min-w-0 text-xs text-slate-300">
                      <p className="font-bold text-white mb-1">Cách 2: Gõ lệnh trong Discord</p>
                      <p className="leading-relaxed">
                        Vào bất kỳ kênh chat Discord của máy chủ, gõ lệnh:
                        <code className="mx-1 px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700">
                          mlink {linkOtpCode}
                        </code>
                        hoặc <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold">/link {linkOtpCode}</code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trạng thái chờ */}
                {linkOtpCountdown > 0 ? (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-2.5 text-xs text-slate-400">
                    <Loader2 size={16} className="animate-spin text-amber-400 shrink-0" />
                    <span>Hệ thống đang tự động lắng nghe và nhận diện...</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center gap-2.5 text-xs text-rose-400 font-bold animate-pulse">
                    <AlertCircle size={16} className="text-rose-400 shrink-0" />
                    <span>Mã OTP đã hết hạn (2 phút)! Vui lòng bấm "Lấy Mã Mới" bên dưới.</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-[#1A233A] flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleGenerateLinkOtp}
                  disabled={isGeneratingOtp}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${linkOtpCountdown <= 0
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-bounce'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                    }`}
                >
                  <RefreshCw size={14} className={isGeneratingOtp ? 'animate-spin' : ''} />
                  <span>{linkOtpCountdown <= 0 ? 'Lấy Mã Mới' : 'Đổi Mã Khác'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkOtpModal(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TÚI ĐỒ & QUẢN LÝ TRANG BỊ (INVENTORY) */}
        {showBagModal && bossPlayerSummary && (() => {
          const p = bossPlayerSummary;
          const rawInv = Array.isArray(p.inventory) ? p.inventory : (Array.isArray(p.weapon?.inventory) ? p.weapon.inventory : []);

          // Định danh các trang bị đang được sử dụng (mặc trên người) để không bao giờ hiển thị vào túi đồ
          const equippedIds = new Set([
            p.weapon?.id,
            p.armor?.id,
            p.pet?.id,
            p.ring?.id,
            p.necklace?.id
          ].filter(Boolean));

          // Lọc bỏ triệt để trang bị đang sử dụng (chỉ giữ lại đồ chưa mặc trong túi) và sắp xếp theo Tier từ cao tới thấp
          const unequippedInventory = rawInv.filter(item => {
            if (!item) return false;
            if (item.is_equipped || item.equipped) return false;
            if (item.id && equippedIds.has(item.id)) return false;
            return true;
          }).sort((a, b) => {
            const weightA = getItemTierWeight(a);
            const weightB = getItemTierWeight(b);
            if (weightB !== weightA) return weightB - weightA;

            const starsA = Number(a.stars || 1);
            const starsB = Number(b.stars || 1);
            if (starsB !== starsA) return starsB - starsA;

            const plusA = Number(a.plus || 0);
            const plusB = Number(b.plus || 0);
            if (plusB !== plusA) return plusB - plusA;

            const skillLvlA = Number(a.skill_level || 1);
            const skillLvlB = Number(b.skill_level || 1);
            if (skillLvlB !== skillLvlA) return skillLvlB - skillLvlA;

            const qtyA = Number(a.quantity || 1);
            const qtyB = Number(b.quantity || 1);
            if (qtyB !== qtyA) return qtyB - qtyA;

            return 0;
          });

          // Lọc danh sách theo danh mục đang chọn
          const filteredInventory = unequippedInventory.filter(item => {
            if (activeBagCategory === 'all') return true;
            return getCategoryOfItem(item) === activeBagCategory;
          });

          return (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
              onClick={(e) => { if (e.target === e.currentTarget) setShowBagModal(false); }}
            >
              <div className="bg-gradient-to-br from-[#0d1326] via-[#0b101d] to-[#060913] border-2 border-purple-500/70 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-[0_0_60px_rgba(168,85,247,0.3)] p-5 sm:p-6 flex flex-col relative text-white animate-zoom-in overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-purple-500/20 pb-4 mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                      🎒
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-lg sm:text-xl text-white tracking-wide">
                          TÚI ĐỒ & KHO TRANG BỊ
                        </h3>
                        <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 border border-purple-500/40 rounded px-2 py-0.5">
                          {p.nickname}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Trong túi: <strong className="text-amber-300 font-bold">{unequippedInventory.length}</strong> món đồ chưa mặc • Lực chiến: <strong className="text-white font-bold">{new Intl.NumberFormat('vi-VN').format(p.cp || 0)} CP</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBagModal(false);
                        fetchAuctionMarketData();
                        setShowAuctionModal(true);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black text-xs rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer border border-amber-400/40"
                    >
                      <span>🏛️ Sàn Đấu Giá</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExecuteBagAction('dismantle_all')}
                      disabled={isPerformingBagAction || unequippedInventory.length === 0}
                      className="px-3 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Phân giải các món đồ rác không dùng để nhận lượt đánh boss"
                    >
                      <Trash2 size={14} />
                      <span>Dọn Rác</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBagModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Content Scrollable - KHÔNG CÒN HIỂN THỊ PHẦN 5 Ô ĐANG MẶC THEO YÊU CẦU */}
                <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-4 flex-1">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                        {[
                          { id: 'all', label: `Tất Cả (${unequippedInventory.length})` },
                          { id: 'weapon', label: '⚔️ Vũ Khí' },
                          { id: 'armor', label: '🛡️ Áo Giáp' },
                          { id: 'necklace', label: '📿 Dây Chuyền' },
                          { id: 'ring', label: '💍 Nhẫn' },
                          { id: 'pet', label: '🐾 Linh Thú' },
                          { id: 'material', label: '💎 Nguyên Liệu' },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveBagCategory(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeBagCategory === tab.id
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                              }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
                        ⚡ Tier cao ➔ thấp
                      </span>
                    </div>

                    {/* Danh sách vật phẩm trong túi */}
                    {filteredInventory.length === 0 ? (
                      <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                        <span className="text-4xl block mb-2 opacity-50">🎒</span>
                        <p className="text-slate-400 font-bold text-sm">Không có trang bị nào trong mục này!</p>
                        <p className="text-slate-500 text-xs mt-1">Săn Boss trên Live hoặc Nạp Rương Hoàng Kim để nhận đồ khủng.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredInventory.map((item, idx) => {
                          const category = getCategoryOfItem(item);
                          const tier = getBossTierStyle(item.tier);
                          const img = getBossItemAsset(item, category);
                          const starsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
                          const stars = '⭐'.repeat(starsCount);
                          const isLoadingThis = isPerformingBagAction && (bagActionLoadingItem === (item.id || item.name || idx) || bagActionLoadingItem === 'all');

                          return (
                            <div
                              key={idx}
                              className="rounded-2xl p-3.5 bg-gradient-to-r from-slate-900/90 to-[#151D2F] border transition-all duration-200 flex flex-col justify-between hover:border-purple-400/60 shadow-lg relative group cursor-pointer"
                              style={{ borderColor: tier.border }}
                              onMouseEnter={(e) => showItemTooltip(item, e, category)}
                              onMouseMove={updateItemTooltipPos}
                              onMouseLeave={hideItemTooltip}
                              onClick={(e) => handleItemCardClick(item, e, category)}
                            >
                              <div className="flex items-start gap-3">
                                {/* Ảnh trang bị */}
                                <div
                                  className="w-14 h-14 rounded-xl flex items-center justify-center relative shrink-0 overflow-hidden"
                                  style={{
                                    border: `1.5px solid ${tier.color}`,
                                    background: '#060913'
                                  }}
                                >
                                  {img ? (
                                    <img src={img} alt={item.name} className="w-11 h-11 object-contain" />
                                  ) : (
                                    <span className="text-2xl">⚔️</span>
                                  )}
                                  <div className="absolute bottom-0.5 text-center text-[8px] text-amber-300">
                                    {stars}
                                  </div>
                                </div>

                                {/* Thông tin trang bị */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-black text-xs sm:text-sm truncate" style={{ color: tier.color }}>
                                      {item.name}{item.plus ? ` +${item.plus}` : ''}
                                    </span>
                                    <span
                                      className="text-[8px] font-black px-1 py-0.5 rounded border uppercase shrink-0"
                                      style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}
                                    >
                                      {tier.label}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleItemCardClick(item, e, category); }}
                                      className="w-4 h-4 rounded-full bg-slate-800 hover:bg-purple-600 text-slate-400 hover:text-white flex items-center justify-center text-[9px] transition-all border border-slate-700 ml-auto shrink-0 cursor-pointer"
                                      title="Xem mô tả & thông số chi tiết"
                                    >
                                      ℹ️
                                    </button>
                                  </div>

                                  {/* Stats */}
                                  <div className="text-[10px] text-slate-300 font-bold mt-1 space-y-0.5">
                                    {category === 'weapon' && (
                                      <span className="text-emerald-400 block">
                                        ⚡ +{Number(item.base_dmg || 0).toLocaleString()} DMG {item.plus ? `(+${Math.round(Number(item.base_dmg || 0) * item.plus * 0.25).toLocaleString()})` : ''}
                                      </span>
                                    )}
                                    {category === 'armor' && (() => {
                                      const bHp = Number(item.base_hp || (item.tier?.toLowerCase().includes('thượng cổ') ? 150000 : (item.tier?.toLowerCase().includes('cổ đại') ? 60000 : (item.tier?.toLowerCase().includes('tối thượng') ? 25000 : (item.tier?.toLowerCase().includes('thần thoại') ? 10000 : (item.tier?.toLowerCase().includes('epic') ? 4000 : 1500))))));
                                      const bDef = Number(item.base_def || (item.tier?.toLowerCase().includes('thượng cổ') ? 15000 : (item.tier?.toLowerCase().includes('cổ đại') ? 6000 : (item.tier?.toLowerCase().includes('tối thượng') ? 2500 : (item.tier?.toLowerCase().includes('thần thoại') ? 1000 : (item.tier?.toLowerCase().includes('epic') ? 400 : 150))))));
                                      const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                                      const totHp = Math.round(bHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                                      const totDef = Math.round(bDef * (1 + 0.20 * (item.plus || 0)) * sMult);
                                      return (
                                        <span className="text-emerald-400 block">
                                          ❤️ +{totHp.toLocaleString()} HP • 🛡️ +{totDef.toLocaleString()} DEF
                                        </span>
                                      );
                                    })()}
                                    {category === 'necklace' && (
                                      <span className="text-amber-400 block">
                                        📿 +{Number(item.dmg_percent || 0)}% DMG Toàn Bộ
                                      </span>
                                    )}
                                    {category === 'ring' && (
                                      <>
                                        <span className="text-purple-400 block">
                                          💍 +{Number(item.base_dmg_percent || 0)}% DMG {item.skill_pct ? `• ⚡ ${item.skill_pct}% HP` : ''}
                                        </span>
                                        <span className="text-amber-300 block text-[9.5px]">
                                          ⚡ {item.skill_level > 0 ? `Tuyệt Kỹ: Lv.${item.skill_level} (Tỉ lệ: ${getRingSkillProcStr(item)})` : `Tỉ lệ phát động: ${getRingSkillProcStr(item)}`}
                                        </span>
                                      </>
                                    )}
                                    {category === 'pet' && (
                                      <span className="text-rose-400 block">
                                        🐾 +{Number(item.bonus_dmg || 0).toLocaleString()} DMG {item.level ? `(Lv.${item.level})` : ''}
                                      </span>
                                    )}
                                    {category === 'material' && (
                                      <span className="text-cyan-400 block font-bold">
                                        💎 Số lượng: x{Number(item.quantity || 1).toLocaleString()} {item.id === 'item_essence_stone' || (item.name || '').toLowerCase().includes('tinh hoa') ? 'Viên' : 'Tinh Thể'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Nút hành động: Mặc & Treo Đấu Giá & Xóa */}
                              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800">
                                {category === 'material' ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isPerformingBagAction}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItemToList({ ...item, originalIndex: idx });
                                        setListingPrice(100);
                                        setListingSellQuantity(Math.min(item.quantity || 1, 1));
                                        setShowListItemModal(true);
                                      }}
                                      className="flex-1 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black text-xs rounded-xl transition-all shadow hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer border border-amber-400/40"
                                      title="Treo bán nguyên liệu này lên Sàn Đấu Giá bằng Xu (phí sàn 20%)"
                                    >
                                      <span>🏷️ Treo Đấu Giá</span>
                                    </button>
                                    <div className="py-1 px-2 bg-purple-950/40 border border-purple-500/30 rounded-xl text-center text-[10px] text-purple-300 font-bold whitespace-nowrap">
                                      /dap nhan
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isPerformingBagAction}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleExecuteBagAction('equip', item, idx);
                                      }}
                                      className="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl transition-all shadow hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                    >
                                      {isLoadingThis ? <Loader2 size={13} className="animate-spin" /> : <Swords size={13} />}
                                      <span>Mặc</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isPerformingBagAction}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItemToList({ ...item, originalIndex: idx });
                                        setListingPrice(100);
                                        setListingSellQuantity(1);
                                        setShowListItemModal(true);
                                      }}
                                      className="px-2.5 py-1.5 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-500 hover:to-yellow-500 text-amber-300 hover:text-white border border-amber-500/40 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                                      title="Treo món này lên Sàn Đấu Giá bằng Xu (phí sàn 20%)"
                                    >
                                      <span>🏷️ Treo Đấu Giá</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isPerformingBagAction}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleExecuteBagAction('delete', item, idx);
                                      }}
                                      className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                      title="Xóa trang bị và nhận lượt đánh boss tương ứng"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center shrink-0">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    ℹ️ Trang bị hoặc xóa đồ sẽ tự động đồng bộ ngay lập tức vào game
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBagModal(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng Túi Đồ
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL CON: TREO BÁN LÊN SÀN ĐẤU GIÁ */}
        {showListItemModal && selectedItemToList && (() => {
          const item = selectedItemToList;
          const category = getCategoryOfItem(item);
          const tier = getBossTierStyle(item?.tier);
          const img = getBossItemAsset(item, category);
          const numStars = Number(item?.stars);
          const starsCount = Math.max(1, Math.min(5, isNaN(numStars) || numStars < 1 ? 1 : numStars));
          const stars = '⭐'.repeat(starsCount);
          const isStackable = category === 'material' || (item?.quantity && item.quantity > 1);
          const maxQty = item?.quantity || 1;
          const safePrice = Math.max(1, Number(listingPrice) || 0);
          const feeCoins = Math.round(safePrice * 0.20);
          const netReceive = safePrice - feeCoins;

          return (
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
              onClick={(e) => { if (e.target === e.currentTarget) setShowListItemModal(false); }}
            >
              <div className="bg-gradient-to-br from-[#12192c] via-[#0e1526] to-[#080d1a] border-2 border-amber-500/70 rounded-3xl w-full max-w-md shadow-[0_0_60px_rgba(245,158,11,0.35)] p-5 sm:p-6 text-white animate-zoom-in relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg text-amber-400">
                      🏷️
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white tracking-wide">
                        TREO ĐẤU GIÁ VẬT PHẨM
                      </h3>
                      <p className="text-[11px] text-amber-300/80 font-medium">
                        Giao dịch bằng Xu • Phí sàn 20% khi khớp lệnh
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowListItemModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Card xem trước vật phẩm */}
                <div
                  className="rounded-2xl p-3 bg-gradient-to-r from-slate-900 to-[#151D2F] border flex items-center gap-3.5 mb-4 shadow-inner cursor-pointer hover:border-amber-400/60 transition-all"
                  style={{ borderColor: tier.border }}
                  onMouseEnter={(e) => showItemTooltip(item, e, category)}
                  onMouseMove={updateItemTooltipPos}
                  onMouseLeave={hideItemTooltip}
                  onClick={(e) => handleItemCardClick(item, e, category)}
                >
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-black/40 rounded-xl">
                    {img ? (
                      <img src={img} alt={item.name} className="w-12 h-12 object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                    {stars && (
                      <span className="absolute bottom-0 right-0 text-[8px] font-black text-amber-300">
                        {stars}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-sm text-white truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase"
                        style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}
                      >
                        {tier.label}
                      </span>
                      {isStackable && (
                        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                          Túi có: x{Number(maxQty).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form thiết lập giá & số lượng */}
                <div className="space-y-3.5">
                  {isStackable && maxQty > 1 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Số Lượng Treo Đấu Giá (Tối đa: {maxQty}):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={maxQty}
                        value={listingSellQuantity}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1));
                          setListingSellQuantity(v);
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Giá Treo Đấu Giá (<span className="text-amber-400">Xu</span>):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="1000000"
                        value={listingPrice}
                        onChange={(e) => setListingPrice(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-black text-base focus:border-amber-400 focus:outline-none pr-12"
                        placeholder="Nhập số xu..."
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-amber-400">
                        XU
                      </span>
                    </div>

                    {/* Nút chọn nhanh giá */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[50, 100, 200, 500, 1000, 2000].map(pVal => (
                        <button
                          key={pVal}
                          type="button"
                          onClick={() => setListingPrice(pVal)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${listingPrice === pVal
                              ? 'bg-amber-500 text-black border-amber-400 font-black'
                              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                        >
                          {pVal.toLocaleString()} xu
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bảng tính chi phí minh bạch */}
                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>🪙 Giá niêm yết:</span>
                      <strong className="text-amber-300 font-black">{safePrice.toLocaleString()} Xu</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>⚖️ Phí sàn giao dịch (20%):</span>
                      <span className="text-rose-400 font-bold">-{feeCoins.toLocaleString()} Xu</span>
                    </div>
                    <div className="border-t border-amber-500/20 pt-1.5 flex justify-between items-center">
                      <span className="font-bold text-white">💰 Thực nhận về ví (80%):</span>
                      <strong className="text-emerald-400 font-black text-sm">+{netReceive.toLocaleString()} Xu</strong>
                    </div>
                    <p className="text-[10px] text-slate-400 italic pt-1 leading-normal">
                      * Món đồ sẽ được chuyển lên sàn. Bạn có thể <strong>Thu Hồi về túi bất kỳ lúc nào</strong> nếu chưa có ai mua.
                    </p>
                  </div>
                </div>

                {/* 2 Nút hành động */}
                <div className="flex items-center gap-2.5 mt-5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowListItemModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    disabled={isPerformingBagAction || safePrice <= 0}
                    onClick={() => {
                      handleExecuteAuctionAction('list_auction', {
                        item: item,
                        item_name: item.name,
                        price: safePrice,
                        quantity: listingSellQuantity
                      });
                    }}
                    className="flex-[2] py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isPerformingBagAction ? <Loader2 size={14} className="animate-spin" /> : <span>🚀</span>}
                    <span>Treo Đấu Giá ({safePrice.toLocaleString()} Xu)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL SÀN ĐẤU GIÁ (AUCTION MARKET) */}
        {showAuctionModal && (() => {
          const rawActive = Array.isArray(auctionMarketData.active_listings) ? auctionMarketData.active_listings : [];
          const rawSold = Array.isArray(auctionMarketData.recent_sold) ? auctionMarketData.recent_sold : [];
          const myUid = (bossPlayerSummary?.user_id || '').toLowerCase();

          // Lọc danh sách chợ và sắp xếp theo Tier từ cao tới thấp
          const filteredMarketListings = rawActive.filter(l => {
            const item = l.item || {};
            const cat = getCategoryOfItem(item);
            if (auctionCategoryFilter !== 'all' && cat !== auctionCategoryFilter) return false;
            if (auctionSearchTerm.trim()) {
              const q = auctionSearchTerm.toLowerCase();
              const nameMatch = (item.name || '').toLowerCase().includes(q);
              const sellerMatch = (l.seller_name || '').toLowerCase().includes(q);
              if (!nameMatch && !sellerMatch) return false;
            }
            return true;
          }).sort((a, b) => {
            const itemA = a.item || {};
            const itemB = b.item || {};
            const weightA = getItemTierWeight(itemA);
            const weightB = getItemTierWeight(itemB);
            if (weightB !== weightA) return weightB - weightA;

            const starsA = Number(itemA.stars || 1);
            const starsB = Number(itemB.stars || 1);
            if (starsB !== starsA) return starsB - starsA;

            const plusA = Number(itemA.plus || 0);
            const plusB = Number(itemB.plus || 0);
            if (plusB !== plusA) return plusB - plusA;

            return (b.created_at || 0) - (a.created_at || 0);
          });

          // Đồ tôi đang bán (cũng sắp xếp theo Tier từ cao tới thấp)
          const myListings = rawActive
            .filter(l => String(l.seller_id).toLowerCase() === myUid)
            .sort((a, b) => {
              const weightA = getItemTierWeight(a.item || {});
              const weightB = getItemTierWeight(b.item || {});
              if (weightB !== weightA) return weightB - weightA;
              return (b.created_at || 0) - (a.created_at || 0);
            });

          return (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
              onClick={(e) => { if (e.target === e.currentTarget) setShowAuctionModal(false); }}
            >
              <div className="bg-gradient-to-br from-[#0d1326] via-[#0b101d] to-[#060913] border-2 border-amber-500/70 rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-[0_0_60px_rgba(245,158,11,0.3)] p-5 sm:p-6 flex flex-col relative text-white animate-zoom-in overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-500/20 pb-4 mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-600 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                      🏛️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-lg sm:text-xl text-white tracking-wide">
                          SÀN ĐẤU GIÁ VẬT PHẨM (CHỢ XU)
                        </h3>
                        <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 rounded px-2 py-0.5">
                          Phí Sàn 20%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Giao dịch tự do giữa người chơi bằng Xu • Người bán thực nhận 80% giá trị
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    {/* Xu của người chơi */}
                    {bossPlayerSummary && (
                      <div className="px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-1.5 text-xs font-black text-yellow-400">
                        <span>🪙</span>
                        <span>{new Intl.NumberFormat('vi-VN').format(bossPlayerSummary.bonus_coins || 0)} Xu</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={fetchAuctionMarketData}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                      title="Làm mới danh sách sàn đấu giá"
                    >
                      <RefreshCw size={13} />
                      <span>Làm mới</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAuctionModal(false)}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* 3 Tab Điều Hướng */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3 shrink-0 overflow-x-auto">
                  {[
                    { id: 'market', label: `🏛️ Chợ Toàn Server (${rawActive.length})` },
                    { id: 'my_listings', label: `📦 Đồ Tôi Đang Bán (${myListings.length})` },
                    { id: 'history', label: `📜 Lịch Sử Giao Dịch (${rawSold.length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAuctionActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${auctionActiveTab === tab.id
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  {/* Nút mở túi đồ nhanh để treo bán */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuctionModal(false);
                      setShowBagModal(true);
                    }}
                    className="ml-auto px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>🎒 Mở Túi Đồ Để Treo Bán</span>
                  </button>
                </div>

                {/* TAB 1: CHỢ TOÀN SERVER */}
                {auctionActiveTab === 'market' && (
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* Thanh lọc & tìm kiếm */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3 shrink-0">
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                        {[
                          { id: 'all', label: 'Tất Cả' },
                          { id: 'weapon', label: '⚔️ Vũ Khí' },
                          { id: 'armor', label: '🛡️ Áo Giáp' },
                          { id: 'necklace', label: '📿 Dây Chuyền' },
                          { id: 'ring', label: '💍 Nhẫn' },
                          { id: 'pet', label: '🐾 Linh Thú' },
                          { id: 'material', label: '💎 Nguyên Liệu' },
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setAuctionCategoryFilter(f.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${auctionCategoryFilter === f.id
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
                              }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
                          ⚡ Tier cao ➔ thấp
                        </span>
                        <div className="relative w-full sm:w-48 shrink-0">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={auctionSearchTerm}
                            onChange={(e) => setAuctionSearchTerm(e.target.value)}
                            placeholder="Tìm món đồ, người bán..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lưới vật phẩm chợ */}
                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                      {filteredMarketListings.length === 0 ? (
                        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 my-4">
                          <span className="text-4xl block mb-2 opacity-50">🏛️</span>
                          <p className="text-slate-300 font-bold text-sm">Chưa có vật phẩm nào phù hợp trên sàn!</p>
                          <p className="text-slate-500 text-xs mt-1">Hãy mở Túi Đồ và bấm nút "Treo Bán" để là người đầu tiên niêm yết đồ lên chợ.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredMarketListings.map((listing) => {
                            const item = listing.item || {};
                            const category = getCategoryOfItem(item);
                            const tier = getBossTierStyle(item.tier);
                            const img = getBossItemAsset(item, category);
                            const starsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
                            const stars = '⭐'.repeat(starsCount);
                            const isMine = String(listing.seller_id).toLowerCase() === myUid;
                            const isLoadingThis = isPerformingBagAction && bagActionLoadingItem === listing.id;

                            return (
                              <div
                                key={listing.id}
                                className={`rounded-2xl p-3 bg-gradient-to-r from-slate-900/90 to-[#151D2F] border flex flex-col justify-between shadow-lg relative group transition-all duration-200 hover:border-amber-400/60 cursor-pointer ${isMine ? 'ring-1 ring-amber-500/40' : ''
                                  }`}
                                style={{ borderColor: isMine ? '#f59e0b' : tier.border }}
                                onMouseEnter={(e) => showItemTooltip(item, e, category)}
                                onMouseMove={updateItemTooltipPos}
                                onMouseLeave={hideItemTooltip}
                                onClick={(e) => handleItemCardClick(item, e, category)}
                              >
                                <div>
                                  {/* Badge mã ID & thời gian */}
                                  <div className="flex items-center justify-between gap-1 text-[9px] text-slate-400 mb-1 pb-1 border-b border-slate-800/80">
                                    <span className="font-mono text-amber-400/80">#{listing.id.slice(-6)}</span>
                                    <span>{new Date(listing.created_at * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>

                                  <div className="flex items-start gap-3 mt-1">
                                    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-black/50 rounded-xl border border-slate-800">
                                      {img ? (
                                        <img src={img} alt={item.name} className="w-11 h-11 object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                                      ) : (
                                        <span className="text-xl">📦</span>
                                      )}
                                      {category !== 'material' && (
                                        <span className="absolute bottom-0 right-0 text-[8px] font-black text-amber-300">
                                          {stars}
                                        </span>
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="font-black text-xs text-white truncate flex items-center justify-between" title={item.name}>
                                        <span className="truncate">{item.name} {item.plus ? <span className="text-yellow-400">+{item.plus}</span> : ''}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); handleItemCardClick(item, e, category); }}
                                          className="w-4 h-4 rounded-full bg-slate-800 hover:bg-amber-500 text-slate-400 hover:text-black flex items-center justify-center text-[9px] transition-all border border-slate-700 ml-1 shrink-0 cursor-pointer"
                                          title="Xem mô tả & thông số chi tiết"
                                        >
                                          ℹ️
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                        <span
                                          className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase"
                                          style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}
                                        >
                                          {tier.label}
                                        </span>

                                        {item.skill_level > 0 && (
                                          <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1 rounded">
                                            Lv.{item.skill_level}
                                          </span>
                                        )}
                                      </div>

                                      {/* Stats tóm tắt */}
                                      <div className="text-[10px] text-slate-300 font-bold mt-1">
                                        {category === 'weapon' && (
                                          <span className="text-emerald-400">⚡ +{Number(item.base_dmg || 0).toLocaleString()} DMG</span>
                                        )}
                                        {category === 'armor' && (() => {
                                          const bHp = Number(item.base_hp || (item.tier?.toLowerCase().includes('thượng cổ') ? 150000 : (item.tier?.toLowerCase().includes('cổ đại') ? 60000 : (item.tier?.toLowerCase().includes('tối thượng') ? 25000 : (item.tier?.toLowerCase().includes('thần thoại') ? 10000 : (item.tier?.toLowerCase().includes('epic') ? 4000 : 1500))))));
                                          const bDef = Number(item.base_def || (item.tier?.toLowerCase().includes('thượng cổ') ? 15000 : (item.tier?.toLowerCase().includes('cổ đại') ? 6000 : (item.tier?.toLowerCase().includes('tối thượng') ? 2500 : (item.tier?.toLowerCase().includes('thần thoại') ? 1000 : (item.tier?.toLowerCase().includes('epic') ? 400 : 150))))));
                                          const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                                          const totHp = Math.round(bHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                                          const totDef = Math.round(bDef * (1 + 0.20 * (item.plus || 0)) * sMult);
                                          return (
                                            <span className="text-emerald-400">❤️ +{totHp.toLocaleString()} HP • 🛡️ +{totDef.toLocaleString()} DEF</span>
                                          );
                                        })()}
                                        {category === 'necklace' && (
                                          <span className="text-amber-400">📿 +{Number(item.dmg_percent || 0)}% DMG</span>
                                        )}
                                        {category === 'ring' && (
                                          <span className="text-purple-400">
                                            💍 +{Number(item.base_dmg_percent || 0)}% DMG {item.skill_pct ? `• ⚡${item.skill_pct}%` : ''}
                                            {item.skill_level > 0 ? ` • ⚡Lv.${item.skill_level} (${getRingSkillProcStr(item)})` : ''}
                                          </span>
                                        )}
                                        {category === 'pet' && (
                                          <span className="text-rose-400">🐾 +{Number(item.bonus_dmg || 0).toLocaleString()} DMG</span>
                                        )}
                                        {category === 'material' && (
                                          <span className="text-cyan-400">💎 x{Number(item.quantity || 1).toLocaleString()} {item.id === 'item_essence_stone' || (item.name || '').toLowerCase().includes('tinh hoa') ? 'Viên' : 'Tinh Thể'}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Người bán */}
                                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                                    <div className="w-4 h-4 rounded-full bg-slate-800 overflow-hidden shrink-0">
                                      <img
                                        src={listing.seller_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(listing.seller_id)}`}
                                        alt="Seller"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="truncate flex-1">
                                      Người bán: <strong className={isMine ? 'text-amber-300 font-black' : 'text-slate-300'}>{listing.seller_name}</strong>
                                    </span>
                                    {isMine && (
                                      <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1 rounded">Bạn</span>
                                    )}
                                  </div>
                                </div>

                                {/* Khung giá & Nút mua / thu hồi */}
                                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                                  <div>
                                    <div className="text-[9px] text-slate-400 font-medium">Giá niêm yết</div>
                                    <div className="text-sm font-black text-amber-300 flex items-center gap-1">
                                      <span>🪙</span>
                                      <span>{Number(listing.price || 0).toLocaleString()} Xu</span>
                                    </div>
                                  </div>

                                  {isMine ? (
                                    <button
                                      type="button"
                                      disabled={isPerformingBagAction}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleExecuteAuctionAction('cancel_auction', { auction_id: listing.id, listing });
                                      }}
                                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                      title="Thu hồi vật phẩm về lại túi đồ của bạn"
                                    >
                                      {isLoadingThis ? <Loader2 size={12} className="animate-spin" /> : <span>↩️</span>}
                                      <span>Thu Hồi</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={isPerformingBagAction}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleExecuteAuctionAction('buy_auction', { auction_id: listing.id, listing, price: listing.price });
                                      }}
                                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                      {isLoadingThis ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={12} />}
                                      <span>Mua Ngay</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: ĐỒ CỦA TÔI ĐANG BÁN */}
                {auctionActiveTab === 'my_listings' && (
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {myListings.length === 0 ? (
                      <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 my-4">
                        <span className="text-4xl block mb-2 opacity-50">📦</span>
                        <p className="text-slate-300 font-bold text-sm">Bạn chưa có món đồ nào đang treo bán trên sàn!</p>
                        <p className="text-slate-500 text-xs mt-1">Mở Túi Đồ và bấm nút "Treo Bán" ở bất kỳ trang bị hoặc nguyên liệu nào để bán lấy Xu.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {myListings.map(listing => {
                          const item = listing.item || {};
                          const category = getCategoryOfItem(item);
                          const tier = getBossTierStyle(item.tier);
                          const img = getBossItemAsset(item, category);
                          const safePrice = Number(listing.price || 0);
                          const feeCoins = Number(listing.fee_coins || Math.round(safePrice * 0.20));
                          const netReceive = Number(listing.net_receive || (safePrice - feeCoins));
                          const isLoadingThis = isPerformingBagAction && bagActionLoadingItem === listing.id;

                          return (
                            <div
                              key={listing.id}
                              className="rounded-2xl p-3.5 bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-amber-400/60 transition-all cursor-pointer"
                              onMouseEnter={(e) => showItemTooltip(item, e, category)}
                              onMouseMove={updateItemTooltipPos}
                              onMouseLeave={hideItemTooltip}
                              onClick={(e) => handleItemCardClick(item, e, category)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-slate-800">
                                  {img ? (
                                    <img src={img} alt={item.name} className="w-10 h-10 object-contain" />
                                  ) : (
                                    <span className="text-xl">📦</span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="font-black text-xs sm:text-sm text-white truncate">
                                    {item.name}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    <span style={{ color: tier.color }}>{tier.label}</span>
                                    <span>• Mã: #{listing.id.slice(-6)}</span>
                                    <span>• Đăng lúc: {new Date(listing.created_at * 1000).toLocaleTimeString('vi-VN')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                                <div className="text-right text-xs">
                                  <div>
                                    Giá: <strong className="text-amber-300 font-black">{safePrice.toLocaleString()} Xu</strong>
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Phí 20%: -{feeCoins.toLocaleString()} • Thực nhận: <span className="text-emerald-400 font-bold">+{netReceive.toLocaleString()} Xu</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={isPerformingBagAction}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExecuteAuctionAction('cancel_auction', { auction_id: listing.id, listing });
                                  }}
                                  className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {isLoadingThis ? <Loader2 size={13} className="animate-spin" /> : <span>↩️</span>}
                                  <span>Thu Hồi</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: LỊCH SỬ GIAO DỊCH */}
                {auctionActiveTab === 'history' && (
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {rawSold.length === 0 ? (
                      <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 my-4">
                        <span className="text-4xl block mb-2 opacity-50">📜</span>
                        <p className="text-slate-300 font-bold text-sm">Chưa có giao dịch nào hoàn tất!</p>
                        <p className="text-slate-500 text-xs mt-1">Các món đồ mua bán thành công trên sàn đấu giá sẽ được lưu lại tại đây.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rawSold.map((listing, sIdx) => {
                          const item = listing.item || {};
                          const category = getCategoryOfItem(item);
                          const tier = getBossTierStyle(item.tier);
                          const img = getBossItemAsset(item, category);
                          const soldTime = listing.sold_at ? new Date(listing.sold_at * 1000).toLocaleString('vi-VN') : 'Gần đây';

                          return (
                            <div
                              key={listing.id || sIdx}
                              className="rounded-xl p-3 bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-600 transition-all cursor-pointer"
                              onMouseEnter={(e) => showItemTooltip(item, e, category)}
                              onMouseMove={updateItemTooltipPos}
                              onMouseLeave={hideItemTooltip}
                              onClick={(e) => handleItemCardClick(item, e, category)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-slate-800">
                                  {img ? (
                                    <img src={img} alt={item.name} className="w-8 h-8 object-contain" />
                                  ) : (
                                    <span>📦</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white truncate">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Người bán: <span className="text-slate-300 font-semibold">{listing.seller_name}</span> ➔ Người mua: <span className="text-emerald-400 font-semibold">{listing.buyer_name}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-amber-300 font-black">
                                  🪙 {Number(listing.price || 0).toLocaleString()} Xu
                                </div>
                                <div className="text-[9px] text-slate-500 mt-0.5">
                                  {soldTime}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Modal */}
                <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center shrink-0">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    ℹ️ Đấu giá an toàn 100% • Mua bán realtime tự động trừ xu và nhận đồ ngay lập tức
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAuctionModal(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng Sàn Đấu Giá
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {renderFooter()}
      </div>
    );
  };

  const renderAdminScreen = () => {
    if (currentUser?.role !== 'admin') {
      return (
        <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center text-slate-300">
          <AlertCircle size={60} className="text-rose-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-6">Bạn không có quyền truy cập Panel Admin!</h2>
          <button onClick={() => setCurrentView('dashboard')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20">
            Quay Về Trang Chủ
          </button>
        </div>
      );
    }
    const handleFileUpload = async (e, isCover) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      // Tối ưu hóa: Nén ảnh chất lượng cao (WebP, Full HD, Tối đa 1MB)
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.9
      };

      try {
        if (isCover && files[0]) {
          // Bắt đầu nén ảnh
          const compressedFile = await imageCompression(files[0], options);

          const reader = new FileReader();
          reader.onloadend = () => setAdminCoverImage(reader.result);
          // Đọc file đã nén thay vì file gốc
          reader.readAsDataURL(compressedFile);

        } else if (!isCover) {
          // Xử lý nén cho danh sách ảnh phụ
          for (const file of files) {
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.onloadend = () => setAdminDetailImages(prev => [...prev, reader.result]);
            reader.readAsDataURL(compressedFile);
          }
        }
      } catch (error) {
        console.error("Lỗi nén ảnh:", error);
        showToast("Có lỗi xảy ra khi nén ảnh!", "error");
      }
    };

    const handleAccGameAvatarUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp", initialQuality: 0.9 };
        try {
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();
          reader.onloadend = () => setAdminAccGameAvatar(reader.result);
          reader.readAsDataURL(compressedFile);
        } catch (err) {
          const reader = new FileReader();
          reader.onloadend = () => setAdminAccGameAvatar(reader.result);
          reader.readAsDataURL(file);
        }
      }
    };

    const handleSaveAccount = async (e) => {
      e.preventDefault();

      if (isGlobalProcessing) return;
      setIsGlobalProcessing(true);
      setGlobalProgressText("Đang xử lý dữ liệu và hình ảnh...");
      showToast("Đang xử lý ảnh và lưu dữ liệu (có thể hơi lâu)...", "info");

      try {
        let finalCoverImage = adminCoverImage;
        if (finalCoverImage && finalCoverImage.startsWith('data:image/')) {
          finalCoverImage = await uploadToImgBB(finalCoverImage);
        }

        let finalDetailImages = [];
        for (let img of adminDetailImages) {
          if (img && img.startsWith('data:image/')) {
            const url = await uploadToImgBB(img);
            finalDetailImages.push(url);
          } else {
            finalDetailImages.push(img);
          }
        }

        const isFeatured = e.target.isFeatured?.checked || false;
        const allowQuantity = e.target.allowQuantity?.checked || false;
        const maxQuantityPerOrder = parseInt(e.target.maxQuantityPerOrder?.value) || 0;
        let finalGameStr = JSON.stringify({ name: e.target.game.value, avatar: adminAccGameAvatar || null, isFeatured, allowQuantity, maxQuantityPerOrder });
        if (adminAccGameAvatar && adminAccGameAvatar.startsWith('data:image')) {
          setGlobalProgressText("Đang tải lên Avatar Game...");
          const finalAvatar = await uploadToImgBB(adminAccGameAvatar);
          finalGameStr = JSON.stringify({ name: e.target.game.value, avatar: finalAvatar, isFeatured, allowQuantity, maxQuantityPerOrder });
        }

        const tagsString = e.target.tags.value;
        const validRentOptions = adminRentOptions.filter(opt => opt.time.trim() !== '' && opt.price !== '').map(opt => ({ time: opt.time, bonusTime: opt.bonusTime || '', price: parseInt(opt.price) }));
        // Tạo đối tượng dữ liệu. Lưu ý: BỎ trường 'id' đi để Supabase tự động sinh ID (UUID).
        const accData = {
          code: e.target.code.value,
          stock: e.target.stock?.value !== undefined ? parseInt(e.target.stock.value) : 1,
          tier: e.target.tier.value,
          game: finalGameStr,
          title: e.target.title.value,
          tags: tagsString,
          price: e.target.discountedPrice?.value ? parseInt(e.target.discountedPrice.value) : parseInt(e.target.basePrice.value),
          oldPrice: e.target.discountedPrice?.value ? parseInt(e.target.basePrice.value) : null,
          rentPricePerHour: e.target.discountedRentPrice?.value ? parseInt(e.target.discountedRentPrice.value) : (parseInt(e.target.baseRentPrice.value) || 0),
          oldRentPrice: e.target.discountedRentPrice?.value ? parseInt(e.target.baseRentPrice.value) : null,
          rentDiscountPercent: parseInt(e.target.rentDiscountPercent?.value) || 0,
          rentOptions: validRentOptions,
          rentedUntil: editingAccount ? editingAccount.rentedUntil : null,
          rentStartedAt: editingAccount ? editingAccount.rentStartedAt : null,
          currentRenterId: editingAccount ? editingAccount.currentRenterId : null,
          coverImage: finalCoverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=300',
          detailImages: finalDetailImages,
          description: e.target.desc.value,
          tagColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          accUsername: e.target.accUsername.value,
          accPassword: e.target.accPassword.value,
          accEmail: e.target.accEmail.value,
          accPhone: e.target.accPhone.value
        };

        if (editingAccount) {
          // Gửi lệnh CẬP NHẬT lên Supabase
          const { data, error } = await supabase.from('accounts').update(accData).eq('id', editingAccount.id).select();

          if (error) {
            showToast("Lỗi cập nhật: " + error.message, 'error');
          } else if (data && data.length > 0) {
            let savedAcc = { ...data[0], tags: tagsString.split(',').map(t => t.trim()) };
            setAccountsDb(accountsDb.map(a => a.id === editingAccount.id ? savedAcc : a));
            showToast("Đã lưu chỉnh sửa Nick!");
            setShowAccModal(false);
          }
        } else {
          // Gửi lệnh THÊM MỚI lên Supabase
          const newAccData = { ...accData, id: crypto.randomUUID() };
          const { data, error } = await supabase.from('accounts').insert([newAccData]).select();

          if (error) {
            showToast("Lỗi đăng bán: " + error.message, 'error');
          } else if (data && data.length > 0) {
            let newAcc = { ...data[0], tags: tagsString.split(',').map(t => t.trim()) };
            setAccountsDb([newAcc, ...accountsDb]);
            showToast("Đăng bán Nick thành công!");
            setShowAccModal(false);
          }
        }
      } catch (err) {
        showToast("Lỗi hệ thống: " + err.message, 'error');
      } finally {
        setIsGlobalProcessing(false);
        setGlobalProgressText('');
      }
    };

    const handleSaveUser = async (e) => {
      e.preventDefault();
      const userData = {
        name: e.target.name.value,
        phone: e.target.phone.value,
        email: e.target.email.value,
        balance: parseInt(e.target.balance.value),
        spins: parseInt(e.target.spins.value || 0),
        rentFund: parseInt(e.target.rentFund.value || 0),
        role: e.target.role.value,
        is_trusted: e.target.is_trusted.checked,
        is_cccd_verified: e.target.is_cccd_verified ? e.target.is_cccd_verified.checked : (editingUser.is_cccd_verified || false)
      };

      if (isGlobalProcessing) return;
      setIsGlobalProcessing(true);
      setShowUserModal(false);
      showToast("Đang xử lý thông tin người dùng...", "info");

      try {
        const { error } = await supabase.from('users').update(userData).eq('id', editingUser.id);
        if (error) {
          showToast("Lỗi cập nhật hệ thống: " + error.message, 'error');
          setShowUserModal(true);
        } else {
          const finalUser = { ...editingUser, ...userData };
          setUsersDb(usersDb.map(u => u.id === editingUser.id ? finalUser : u));
          if (currentUser && currentUser?.id === editingUser.id) setCurrentUser(finalUser);
          showToast("Cập nhật thông tin Người dùng thành công!");
        }
      } finally {
        setIsGlobalProcessing(false);
      }
    };
    const handleSaveBoosting = async (e) => {
      e.preventDefault();

      if (isGlobalProcessing) return;
      setIsGlobalProcessing(true);
      setShowBoostingModal(false);

      try {
        let finalImage = "";
        if (adminBoostingImage && adminBoostingImage.length > 0) {
          const imagesArray = adminBoostingImage;
          const uploadedImages = [];
          for (let i = 0; i < imagesArray.length; i++) {
            const img = imagesArray[i];
            setGlobalProgressText(`Đang xử lý và tải ảnh lên... (${i + 1}/${imagesArray.length})`);
            if (img.startsWith('data:image')) {
              const url = await uploadToImgBB(img);
              uploadedImages.push(url);
            } else {
              uploadedImages.push(img);
            }
          }
          finalImage = uploadedImages.join(',');
        } else {
          setGlobalProgressText("Đang lưu dịch vụ...");
        }

        let finalGameAvatarUrl = "";
        if (adminGameAvatar) {
          if (adminGameAvatar.startsWith('data:image')) {
            setGlobalProgressText("Đang tải lên Avatar Game...");
            finalGameAvatarUrl = await uploadToImgBB(adminGameAvatar);
          } else {
            finalGameAvatarUrl = adminGameAvatar;
          }
        }

        const type = e.target.boostType.value;
        let validOptions = [];
        // Hàm parse giá thông minh: hiểu '300k/200 điểm', '25k/100', '1500', '300000/200'
        const parseSmartPrice = (priceStr) => {
          if (!priceStr) return 0;
          const str = priceStr.trim().toLowerCase();
          // Format: "300k/200 điểm" hoặc "300k/200" → 300000/200 = 1500
          const kMatch = str.match(/^(\d+)k\s*\/\s*(\d+)/);
          if (kMatch) {
            const total = parseInt(kMatch[1]) * 1000;
            const pts = parseInt(kMatch[2]);
            return pts > 0 ? Math.round(total / pts) : 0;
          }
          // Format: "300000/200" → 1500
          const divMatch = str.match(/^(\d+)\s*\/\s*(\d+)/);
          if (divMatch) {
            const total = parseInt(divMatch[1]);
            const pts = parseInt(divMatch[2]);
            return pts > 0 ? Math.round(total / pts) : 0;
          }
          // Số thuần: "1500" → 1500
          return parseInt(str) || 0;
        };
        if (adminConfigType === 'points_cumulative') {
          validOptions = crossfireText.split('\n').filter(line => line.trim() !== '').map((line, idx) => {
            const parts = line.split('|').map(s => s.trim());
            let name = parts[0];
            let points = 0;
            let price = 0;
            if (parts.length === 2) {
              price = parseSmartPrice(parts[1]);
              points = idx;
            } else if (parts.length >= 3) {
              points = parseInt(parts[1]) || 0;
              price = parseSmartPrice(parts[2]);
            }
            return { rank: name, name: name, points: points, price: price };
          });
        } else {
          validOptions = adminRankOptions.filter(opt => opt.rank.trim() !== '' && opt.price !== '').map(opt => ({ rank: opt.rank, price: parseInt(opt.price), comboPrice: parseInt(opt.comboPrice) || 0, inputType: opt.inputType || 'bac', maxPoints: parseInt(opt.maxPoints) || 0, basePoints: parseInt(opt.basePoints) || 0, tierCount: parseInt(opt.tierCount) || 1 }));
        }
        const isMulti = type === 'rank' || (type === 'event' && isEventMultiPackage);

        const boostData = {
          id: editingBoosting ? editingBoosting.id : Date.now(),
          type: type,
          require_login: type === 'event' ? e.target.requireLogin?.checked : true,
          allow_quantity: type === 'event' && !isEventMultiPackage ? (e.target.allowQuantity?.checked || false) : false,
          price: isMulti && validOptions.length > 0 ? Math.min(...validOptions.map(o => o.price)) : (e.target.discountedPrice?.value ? parseInt(e.target.discountedPrice.value) : (parseInt(e.target.basePrice?.value) || 0)),
          oldPrice: isMulti && validOptions.length > 0 ? null : (e.target.discountedPrice?.value ? parseInt(e.target.basePrice.value) : null),
          discountPercent: isMulti ? (parseInt(e.target.discountPercent?.value) || 0) : 0,
          priceUnit: adminBoostingPriceUnit.trim() || '',
          rankOptions: isMulti ? validOptions : [],
          image: finalImage,
          game: JSON.stringify({ name: e.target.game?.value || '', avatar: finalGameAvatarUrl, isFeatured: e.target.isFeatured?.checked || false, maxQuantityPerOrder: parseInt(e.target.maxQuantityPerOrder?.value) || 0 }),
          title: type === 'rank' ? (e.target.title?.value || '') : (e.target.eventName?.value || ''),
          desc: type === 'rank' ? (e.target.desc?.value || '') : (e.target.amount?.value || '')
        };
        if (editingBoosting) {
          const { data, error } = await supabase.from('boosting').update(boostData).eq('id', editingBoosting.id).select();
          if (error) {
            showToast("Lỗi cập nhật: " + error.message, 'error');
            setShowBoostingModal(true);
            return;
          }
          if (data && data.length > 0) setBoostingDb(boostingDb.map(b => b.id === editingBoosting.id ? data[0] : b));
          showToast("Sửa dịch vụ thành công!");
        } else {
          const { data, error } = await supabase.from('boosting').insert([boostData]).select();
          if (error) {
            showToast("Lỗi thêm dịch vụ: " + error.message, 'error');
            setShowBoostingModal(true);
            return;
          }
          if (data && data.length > 0) setBoostingDb([data[0], ...boostingDb]);
          showToast("Thêm dịch vụ thành công!");
        }
      } finally {
        setIsGlobalProcessing(false);
        setGlobalProgressText('');
      }
    };
    const handleBoostingImageUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        // Tối ưu hóa: Nén ảnh chất lượng cao (WebP, Full HD, Tối đa 1MB)
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.9
        };
        try {
          const promises = files.map(file => new Promise(async (resolve) => {
            try {
              const compressedFile = await imageCompression(file, options);
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(compressedFile);
            } catch (err) {
              console.error("Lỗi nén ảnh, dùng ảnh gốc:", err);
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(file);
            }
          }));
          const base64s = await Promise.all(promises);
          setAdminBoostingImage(prev => [...(prev || []), ...base64s]);
        } catch (error) {
          console.error("Lỗi xử lý nén ảnh:", error);
          showToast("Có lỗi xảy ra khi nén ảnh!", "error");
        }
      }
    };
    const handleGameAvatarUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.9
        };
        try {
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();
          reader.onloadend = () => setAdminGameAvatar(reader.result);
          reader.readAsDataURL(compressedFile);
        } catch (err) {
          console.error("Lỗi nén ảnh Avatar Game:", err);
          const reader = new FileReader();
          reader.onloadend = () => setAdminGameAvatar(reader.result);
          reader.readAsDataURL(file);
        }
      }
    };
    const handleWheelImageUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Tối ưu hóa: Nén ảnh chất lượng cao (WebP, Full HD, Tối đa 1MB)
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.9
        };
        try {
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();
          reader.onloadend = () => setAdminWheelImage(reader.result);
          reader.readAsDataURL(compressedFile);
        } catch (err) {
          console.error("Lỗi nén ảnh vòng quay:", err);
          const reader = new FileReader();
          reader.onloadend = () => setAdminWheelImage(reader.result);
          reader.readAsDataURL(file);
        }
      }
    };

    const handleSaveWheel = async (e) => {
      e.preventDefault();

      if (isGlobalProcessing) return;
      setIsGlobalProcessing(true);
      setShowWheelModal(false);

      try {
        let finalImage = adminWheelImage;
        if (adminWheelImage && adminWheelImage.startsWith('data:image')) {
          showToast("Đang tải ảnh lên Server ImgBB...", "info");
          finalImage = await uploadToImgBB(adminWheelImage);
        } else {
          showToast("Đang xử lý phần thưởng...", "info");
        }

        const wheelData = {
          id: editingWheel ? editingWheel.id : `WHEEL${Date.now()}`,
          name: e.target.name.value,
          type: e.target.type.value,
          value: parseInt(e.target.value.value) || 0,
          rate: e.target.rate.value,
          quantity: parseInt(e.target.quantity.value) || 0,
          color: e.target.color.value || '#f43f5e',
          image: finalImage,
          wheel_type: adminWheelType // Phân biệt tiền hay lượt
        };
        // Đẩy lên Supabase
        let queryError = null;
        if (editingWheel) {
          const { error } = await supabase.from('wheel_items').update(wheelData).eq('id', editingWheel.id);
          queryError = error;
        } else {
          const { error } = await supabase.from('wheel_items').insert([wheelData]);
          queryError = error;
        }

        if (queryError) {
          showToast("Lỗi: " + queryError.message, 'error');
          setShowWheelModal(true);
          return;
        }

        // Cập nhật màn hình
        if (adminWheelType === 'money') {
          if (editingWheel) {
            setWheelItemsMoneyDb(wheelItemsMoneyDb.map(w => w.id === editingWheel.id ? wheelData : w));
          } else {
            setWheelItemsMoneyDb([...wheelItemsMoneyDb, wheelData]);
          }
        } else {
          if (editingWheel) {
            setWheelItemsSpinDb(wheelItemsSpinDb.map(w => w.id === editingWheel.id ? wheelData : w));
          } else {
            setWheelItemsSpinDb([...wheelItemsSpinDb, wheelData]);
          }
        }

        showToast(editingWheel ? "Sửa phần thưởng thành công!" : "Thêm phần thưởng thành công!");
      } finally {
        setIsGlobalProcessing(false);
      }
    };

    const handleSaveVoucher = async (e) => {
      e.preventDefault();

      const voucherData = {
        code: e.target.code.value.trim().toUpperCase(),
        percent: parseInt(e.target.percent.value) || 0,
        bonusSpins: parseInt(e.target.bonusSpins.value) || 0,
        usageLimit: parseInt(e.target.usageLimit.value) || 0, // <--- Hút số tổng lượt
        userLimit: parseInt(e.target.userLimit.value) || 1,   // <--- Hút số lượt/khách
        isActive: e.target.isActive.value === 'true'
      };

      if (isGlobalProcessing) return;
      setIsGlobalProcessing(true);
      setShowVoucherModal(false);
      showToast("Đang xử lý voucher...", "info");

      try {
        if (editingVoucher) {
          // Cập nhật trên Supabase
          const { data, error } = await supabase.from('vouchers').update(voucherData).eq('id', editingVoucher.id).select();
          if (error) {
            showToast("Lỗi sửa: " + error.message, 'error');
            setShowVoucherModal(true);
            return;
          }

          setVouchersDb(vouchersDb.map(v => v.id === editingVoucher.id ? data[0] : v));
          showToast("Sửa mã khuyến mãi thành công!");
        } else {
          // Thêm mới trên Supabase (Để ID tự tăng hoặc dùng Date.now nếu cột ID không tự tăng)
          const { data, error } = await supabase.from('vouchers').insert([{ ...voucherData, id: Date.now() }]).select();
          if (error) {
            showToast("Lỗi tạo: " + error.message, 'error');
            setShowVoucherModal(true);
            return;
          }

          setVouchersDb([data[0], ...vouchersDb]);
          showToast("Tạo mã khuyến mãi thành công!");
        }
      } finally {
        setIsGlobalProcessing(false);
      }
    };

    const handleAdminSendMessage = async (e) => {
      e.preventDefault();
      const input = e.target.message.value.trim();
      if (!input || !activeChatUser || !currentUser) return;

      const newMsg = {
        id: `MSG${Date.now()}`,
        senderId: currentUser?.id,
        receiverId: activeChatUser.id, // Gửi về đúng khách đang chat
        content: input,
        timestamp: Date.now(),
        isRead: false
      };

      // Optimistic update để hiện ngay lên màn hình
      setMessagesDb(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      await supabase.from('messages').insert([newMsg]);
      e.target.reset();
      setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleDeleteChatAdmin = (userId) => {
      setConfirmDialog({
        title: 'Ẩn lịch sử chat',
        message: 'Bạn có chắc muốn dọn dẹp khung chat với khách hàng này không? (Khách hàng vẫn sẽ thấy tin nhắn bình thường)',
        onConfirm: () => {
          localStorage.setItem(`admin_cleared_chat_${userId}`, Date.now().toString());
          setActiveChatUser(null);
          showToast("Đã dọn dẹp lịch sử chat thành công!", "success");
        }
      });
    };

    const totalRevenue = depositRequests
      .filter(d => d.status === 'Thành công')
      .reduce((sum, d) => sum + d.amount, 0);

    const filteredUsersList = usersDb.filter(u =>
      u.name.toLowerCase().includes(adminSearchUser.toLowerCase()) ||
      u.phone.includes(adminSearchUser) ||
      u.email.toLowerCase().includes(adminSearchUser.toLowerCase())
    );

    const currentAdminWheelDb = adminWheelType === 'money' ? wheelItemsMoneyDb : wheelItemsSpinDb;


    // Lọc danh sách những người đã gửi tin nhắn ĐẾN Admin, HOẶC Admin đã gửi cho họ
    const usersWithMessagesIds = [...new Set(messagesDb.filter(m => {
      const otherId = m.senderId === currentUser?.id ? m.receiverId : m.senderId;
      const clearedTime = parseInt(localStorage.getItem(`admin_cleared_chat_${otherId}`) || '0');
      return m.timestamp > clearedTime;
    }).map(m => m.senderId === currentUser?.id ? m.receiverId : m.senderId))];
    const chatUsersList = usersDb.filter(u => usersWithMessagesIds.includes(u.id) && u.role !== 'admin' && u.id !== currentUser?.id);

    // Tự động tìm kiếm toàn bộ khách hàng nếu Admin gõ vào ô tìm kiếm
    const displayChatUsers = adminMessageSearch.trim() !== ''
      ? usersDb.filter(u => u.role !== 'admin' && u.id !== currentUser?.id && (u.name.toLowerCase().includes(adminMessageSearch.toLowerCase()) || u.phone.includes(adminMessageSearch)))
      : chatUsersList;

    // Lọc nội dung chat giữa Admin và Khách đang chọn
    const activeMessages = activeChatUser ? messagesDb.filter(m => {
      if (!((m.senderId === activeChatUser.id && m.receiverId === currentUser?.id) || (m.senderId === currentUser?.id && m.receiverId === activeChatUser.id))) return false;
      const clearedTime = parseInt(localStorage.getItem(`admin_cleared_chat_${activeChatUser.id}`) || '0');
      return m.timestamp > clearedTime;
    }).sort((a, b) => a.timestamp - b.timestamp) : [];

    const totalUnreadAdmin = messagesDb.filter(m => {
      if (m.receiverId !== currentUser?.id || m.isRead || m.senderId === currentUser?.id) return false;
      const sender = usersDb.find(u => u.id === m.senderId);
      if (!sender || sender.role === 'admin') return false;
      const clearedTime = parseInt(localStorage.getItem(`admin_cleared_chat_${m.senderId}`) || '0');
      return m.timestamp > clearedTime;
    }).length;

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-20">
        {renderNavbar()}
        <main className="w-full max-w-[1500px] mx-auto px-4 lg:pr-28 pt-6 space-y-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-2 whitespace-nowrap"><Settings className="text-rose-500" /> PANEL ADMIN</h2>
            <div className="flex bg-[#151D2F] p-1 md:p-1.5 rounded-xl border border-slate-800 whitespace-nowrap shadow-lg overflow-x-auto scrollbar-hide w-full">
              {['users', 'messages', 'accs', 'deposits', 'rentreqs', 'boosting', 'wheel'].map(tab => {
                const labels = { users: 'Người Dùng', messages: 'Hộp Thư', accs: 'Kho Nick', deposits: 'Nạp Tiền', rentreqs: 'Thuê Nick', boosting: 'Cày Thuê', wheel: 'Vòng Quay' };
                const isHiddenOnMobile = tab === 'accs' || tab === 'wheel';
                return <button key={tab} onClick={() => setAdminTab(tab)} className={`flex-1 text-center px-1.5 md:px-4 py-1.5 md:py-2 text-[11px] md:text-sm font-bold rounded-lg transition-all relative ${isHiddenOnMobile ? 'hidden md:inline-block' : ''} ${adminTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  {labels[tab]}
                  {tab === 'messages' && totalUnreadAdmin > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{totalUnreadAdmin}</span>}
                </button>
              })}
            </div>
          </div>

          <div className="bg-[#151D2F] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* TAB NGƯỜI DÙNG */}
            {adminTab === 'users' && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500"><Users size={24} /></div>
                    <div><p className="text-xs text-slate-400 font-bold uppercase">Tổng Khách Hàng</p><p className="text-2xl font-black text-white">{usersDb.length}</p></div>
                  </div>
                  <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-500"><History size={24} /></div>
                    <div><p className="text-xs text-slate-400 font-bold uppercase">Tổng Giao Dịch</p><p className="text-2xl font-black text-white">{transactionsDb.length}</p></div>
                  </div>
                  <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500"><TrendingUp size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Tổng Doanh Thu</p>

                      <p className="text-2xl font-black text-emerald-400">
                        {new Intl.NumberFormat('vi-VN').format(totalRevenue)}đ
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500"><Eye size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Lượt Truy Cập</p>
                      <p className="text-2xl font-black text-white">{visitorCount}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex relative max-w-md flex-1 min-w-[260px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" value={adminSearchUser} onChange={(e) => { setAdminSearchUser(e.target.value); setVisibleUsersCount(10); }} placeholder="Tìm theo tên, SĐT hoặc Email..." className="w-full pl-10 pr-4 py-2 bg-[#0B1120] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <button
                    onClick={() => {
                      const id = prompt("Nhập Tên hoặc ID TikTok / User ID cần kiểm tra Stat & Thuộc tính:");
                      if (id && id.trim()) {
                        handleCheckBossPlayer(id.trim(), false).then(() => setShowBossStatModal(true));
                      }
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 border border-emerald-400/30 transition-all cursor-pointer"
                    title="Kiểm tra toàn bộ Chỉ số (Stat), HP, Tấn công, DEF, Crit của bất kỳ người chơi nào"
                  >
                    <span>📊</span> Tra Cứu Stat Game
                  </button>
                </div>

                <div
                  className="overflow-auto rounded-xl border border-slate-800 max-h-[500px] custom-scrollbar"
                  onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    // Khi Admin cuộn chuột gần chạm đáy bảng, tự động cộng thêm 10 user nữa
                    if (scrollTop + clientHeight >= scrollHeight - 20) {
                      setVisibleUsersCount(prev => prev + 10);
                    }
                  }}
                >
                  <table className="w-full text-left text-sm min-w-[700px]">
                    <thead className="bg-[#0B1120] text-slate-400 uppercase text-xs">
                      <tr><th className="p-4">Khách hàng</th><th className="p-4">Liên hệ</th><th className="p-4">Số dư</th><th className="p-4">Quỹ thuê</th><th className="p-4">Lượt quay</th><th className="p-4 text-center">Hành động</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredUsersList.slice(0, visibleUsersCount).map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2">{u.name} {u.role === 'admin' && <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 uppercase">Admin</span>} {u.isLocked && <Lock size={12} className="text-rose-500" />}</td>
                          <td className="p-4 text-blue-400">
                            <div className="text-xs"><Phone size={10} className="inline mr-1" />{u.phone}</div>
                            <div className="text-xs mt-1 flex flex-col gap-1">
                              <div className="flex items-center gap-1"><Mail size={10} className="inline" />{u.email}</div>
                              {/* DÒNG HIỂN THỊ TRẠNG THÁI XÁC THỰC EMAIL */}
                              {u.is_email_verified ? (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded w-fit flex items-center gap-0.5 border border-emerald-500/20">
                                  <CheckCircle2 size={8} /> Đã xác thực
                                </span>
                              ) : (
                                <span className="text-[9px] bg-rose-500/20 text-rose-400 font-bold px-1.5 py-0.5 rounded w-fit flex items-center gap-0.5 border border-rose-500/20">
                                  <AlertCircle size={8} /> Chưa xác thực
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-emerald-400 font-bold">{new Intl.NumberFormat('vi-VN').format(u.balance)}đ</td>
                          <td className="p-4 text-yellow-400 font-bold">{new Intl.NumberFormat('vi-VN').format(u.rentFund || 0)}đ</td>
                          <td className="p-4 text-rose-400 font-bold">
                            <div className="flex items-center gap-1">
                              <Ticket size={14} /> {u.spins || 0}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={async () => {
                                  const targetId = u.linked_game_id || u.phone || u.email || u.name;
                                  showToast(`Đang tra cứu hồ sơ game cho ${u.name}...`, 'info');
                                  await handleCheckBossPlayer(targetId, true);
                                  setShowBossProfileModal(true);
                                }}
                                className="px-2.5 py-1.5 bg-amber-500/20 text-amber-300 rounded text-xs font-bold hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-1 border border-amber-500/30 shadow-sm"
                                title="Kiểm tra Stat, Lực chiến CP & Trang bị của người này"
                              >
                                <span>📊</span> Stat
                              </button>
                              <button onClick={() => setViewUserHistory(u)} className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded text-xs font-bold hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-1" title="Lịch sử giao dịch"><History size={14} /> Lịch sử</button>
                              <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors" title="Chỉnh sửa"><Edit size={16} /></button>
                              {u.role !== 'admin' && (
                                <button onClick={() => { setActiveChatUser(u); setAdminTab('messages'); setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }} className="p-2 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500 hover:text-white transition-colors" title="Nhắn tin cho khách này"><MessageCircle size={16} /></button>
                              )}                              {u.role !== 'admin' && (
                                <>
                                  <button onClick={async () => {
                                    const newStatus = !u.is_locked;
                                    // 1. Lưu vĩnh viễn vào Supabase
                                    await supabase.from('users').update({ is_locked: newStatus }).eq('id', u.id);
                                    // 2. Lưu vào RAM để web đổi màu ngay lập tức
                                    setUsersDb(usersDb.map(user => user.id === u.id ? { ...user, is_locked: newStatus } : user));
                                    showToast(newStatus ? "Đã khoá User!" : "Đã mở khoá User!");
                                  }} className={`p-2 rounded transition-colors ${u.is_locked ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white'}`} title={u.is_locked ? 'Mở khoá' : 'Khoá'}>
                                    {u.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
                                  </button>
                                  <button onClick={() => {
                                    setConfirmDialog({
                                      title: 'Xoá User', message: `Bạn chắc chắn muốn xoá ${u.name}?`, onConfirm: async () => {
                                        await supabase.from('users').delete().eq('id', u.id);
                                        setUsersDb(usersDb.filter(x => x.id !== u.id));
                                        showToast("Đã xoá người dùng vĩnh viễn!");
                                      }
                                    })
                                  }} className="p-2 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500 hover:text-white transition-colors" title="Xoá"><Trash2 size={16} /></button>                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsersList.length === 0 && (
                        <tr><td colSpan="5" className="p-6 text-center text-slate-500">Không tìm thấy kết quả nào.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB HỘP THƯ TIN NHẮN */}
            {adminTab === 'messages' && (
              <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] md:h-[600px]">
                <div className={`w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800 bg-[#0B1120] flex flex-col ${activeChatUser ? 'hidden md:flex' : 'flex'}`}>
                  <div className="p-4 border-b border-slate-800 font-bold text-white flex items-center gap-2 shrink-0">
                    <MessageCircle size={18} className="text-blue-500" /> Chat Khách Hàng
                  </div>

                  {/* Ô TÌM KIẾM TIN NHẮN */}
                  <div className="p-3 border-b border-slate-800 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input type="text" value={adminMessageSearch} onChange={(e) => setAdminMessageSearch(e.target.value)} placeholder="Tìm khách để chat (Tên, SĐT)..." className="w-full pl-9 pr-3 py-2 bg-[#151D2F] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {displayChatUsers.length === 0 ? <p className="text-center text-slate-500 p-4 text-sm">Không tìm thấy khách hàng</p> : (
                      displayChatUsers.map(u => {
                        const unread = messagesDb.filter(m => {
                          if (m.senderId !== u.id || m.receiverId !== currentUser?.id || m.isRead) return false;
                          const clearedTime = parseInt(localStorage.getItem(`admin_cleared_chat_${u.id}`) || '0');
                          return m.timestamp > clearedTime;
                        }).length;
                        return (
                          <div key={u.id} onClick={async () => {
                            setActiveChatUser(u);
                            setMessagesDb(messagesDb.map(m => m.senderId === u.id ? { ...m, isRead: true } : m));
                            await supabase.from('messages').update({ isRead: true }).eq('senderId', u.id); // Lưu lên DB chống F5
                            setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                          }} className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors flex justify-between items-center ${activeChatUser?.id === u.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}>
                            <div className="flex items-center gap-3">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                              ) : (
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'K')}&background=151D2F&color=fff`} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                              )}
                              <div>
                                <p className="font-bold text-sm text-white">{u.name}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  {u.phone}
                                  <span className="text-[10px] opacity-50 px-1 border-l border-slate-600 ml-1">
                                    {getActiveStatus(u.last_active).isOnline ? <span className="text-emerald-400">Online</span> : getActiveStatus(u.last_active).text}
                                  </span>
                                </p>
                              </div>
                            </div>
                            {unread > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{unread}</span>}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className={`flex-1 flex flex-col bg-[#151D2F] ${activeChatUser ? 'fixed inset-0 z-[60] md:relative md:inset-auto md:z-auto' : 'hidden md:flex'}`}>
                  {activeChatUser ? (
                    <>
                      <div className="p-3 md:p-4 border-b border-slate-800 bg-[#0B1120] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setActiveChatUser(null)} className="md:hidden p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl mr-2 flex items-center gap-1 shadow transition-colors"><ArrowLeft size={18} /><span className="text-xs font-bold">Quay lại</span></button>
                          {activeChatUser.avatar_url ? (
                            <img src={activeChatUser.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                          ) : (
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChatUser.name || 'K')}&background=151D2F&color=fff`} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                          )}
                          <div>
                            <h3
                              className="font-bold text-blue-400 cursor-pointer hover:underline"
                              onClick={() => {
                                const foundUser = usersDb.find(u => u.id === activeChatUser.id);
                                if (foundUser) {
                                  setEditingUser(foundUser);
                                  setShowUserModal(true);
                                } else {
                                  showToast("Không tìm thấy thông tin chi tiết khách hàng!", "error");
                                }
                              }}
                            >
                              {activeChatUser.name}
                            </h3>
                            {(() => {
                              const status = getActiveStatus(activeChatUser.last_active);
                              return (
                                <p className={`text-xs flex items-center gap-1 ${status.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full block ${status.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                                  {status.isOnline ? 'Đang trực tuyến' : (status.text === 'Ngoại tuyến' ? 'Ngoại tuyến' : `Hoạt động: ${status.text}`)}
                                </p>
                              );
                            })()}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteChatAdmin(activeChatUser.id)} className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                          <Trash2 size={14} /> Xóa chat
                        </button>
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                        {activeMessages.map(m => {
                          const isMine = m.senderId === currentUser?.id;
                          return (
                            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                <p className="text-sm">{m.content}</p>
                                <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(m.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={chatMessagesEndRef} />
                      </div>
                      <div className="p-4 border-t border-slate-800 bg-[#0B1120]">
                        <form onSubmit={handleAdminSendMessage} className="flex gap-2">
                          <input name="message" type="text" placeholder={`Trả lời ${activeChatUser.name}...`} className="flex-1 bg-[#151D2F] border border-slate-700 rounded-full px-3 md:px-4 py-2.5 md:py-3 text-sm text-white focus:outline-none focus:border-rose-500" autoComplete="off" />
                          <button type="submit" className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center text-white hover:bg-rose-500 shrink-0 transition-colors"><Send size={18} /></button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                      <MessageCircle size={48} className="mb-4 opacity-50" />
                      <p>Chọn một khách hàng để xem tin nhắn</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB KHO ACC */}
            {adminTab === 'accs' && (
              <div className="p-6">
                <button onClick={() => { setEditingAccount(null); setAdminCoverImage(null); setAdminDetailImages([]); setAdminRentOptions([{ time: '', price: '' }]); setAdminAccGameAvatar(null); setShowAccModal(true); }} className="mb-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-emerald-600/20 transition-transform hover:scale-105"><PlusCircle size={18} /> Đăng bán Nick mới</button>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {accountsDb.map(acc => (
                    <div key={acc.id} className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex gap-4 items-center group hover:border-blue-500/50 transition-colors">
                      <img src={acc.coverImage} className="w-28 h-20 object-cover rounded-lg shadow-md" />
                      <div className="flex-1">
                        <p className="font-bold text-white line-clamp-1 mb-1">{acc.title}</p>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">Mã: {acc.code}</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Kho: {acc.stock !== undefined ? acc.stock : 1}</span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                            {getGameInfo(acc.game).avatar && <img src={getGameInfo(acc.game).avatar} className="w-3 h-3 rounded" alt="Game Avatar" />}
                            {getGameInfo(acc.game).name}
                          </span>
                          {getGameInfo(acc.game).isFeatured && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-bold">🔥 Nổi Bật</span>
                          )}
                        </div>
                        <p className="text-emerald-400 font-black text-sm">{new Intl.NumberFormat('vi-VN').format(acc.price)}đ</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => { setEditingAccount(acc); setAdminCoverImage(acc.coverImage); setAdminDetailImages(acc.detailImages || []); setAdminRentOptions(acc.rentOptions?.length > 0 ? acc.rentOptions : [{ time: '', price: '' }]); setAdminAccGameAvatar(getGameInfo(acc.game).avatar); setShowAccModal(true); }} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors" title="Chỉnh sửa"><Edit size={18} /></button>
                        <button onClick={() => {
                          setConfirmDialog({
                            title: 'Xoá Nick', message: `Xoá nick mã ${acc.code}?`, onConfirm: async () => {
                              await supabase.from('accounts').delete().eq('id', acc.id);
                              setAccountsDb(accountsDb.filter(a => a.id !== acc.id));
                              showToast("Đã xoá nick vĩnh viễn!");
                            }
                          })
                        }} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors" title="Xoá"><Trash2 size={18} /></button>                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB NẠP TIỀN & VOUCHER KHUYẾN MÃI */}
            {adminTab === 'deposits' && (
              <div className="p-4 space-y-8">

                <div className="bg-[#0B1120] border border-blue-500/30 p-5 rounded-2xl shadow-lg">
                  <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-4"><Settings2 size={18} /> Cài đặt Khuyến Mãi Nạp Tiền</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const newConfig = {
                      minAmount: parseInt(e.target.minAmount.value),
                      bonusSpins: parseInt(e.target.bonusSpins.value)
                    };
                    setDepositBonusConfig(newConfig);
                    localStorage.setItem('shop_deposit_config', JSON.stringify(newConfig));
                    supabase.from('site_config').upsert({ id: 'deposit_bonus', value: newConfig }).then(() => {
                      showToast("Lưu cài đặt khuyến mãi nạp thành công!");
                    }).catch(e => {
                      console.error(e);
                      showToast("Lưu cấu hình lỗi, nhưng đã lưu cục bộ!");
                    });
                  }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Mốc Nạp Tối Thiểu (VNĐ)</label>
                      <input name="minAmount" type="number" defaultValue={depositBonusConfig.minAmount} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-emerald-400 font-bold outline-none focus:border-emerald-500" required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Số Lượt Quay Tặng (Spin)</label>
                      <input name="bonusSpins" type="number" defaultValue={depositBonusConfig.bonusSpins} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-rose-400 font-bold outline-none focus:border-rose-500" required />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold text-sm transition-colors shadow-lg">Lưu Cài Đặt</button>
                  </form>
                  <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1"><AlertCircle size={12} className="text-yellow-500" /> Hệ thống sẽ tự động tính số lượt tặng khi duyệt lệnh nạp (VD: Cài mốc 50k tặng 1 lượt, khách nạp 100k sẽ tự động được tặng 2 lượt).</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4 border-t border-slate-800 pt-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Ticket className="text-rose-500" /> Quản lý Mã Khuyến Mãi (Voucher)</h3>
                    <button onClick={() => { setEditingVoucher(null); setShowVoucherModal(true); }} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"><PlusCircle size={16} /> Tạo Voucher</button>
                  </div>
                  {vouchersDb.length === 0 ? <p className="text-sm text-slate-500 italic">Chưa có mã khuyến mãi nào được tạo.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vouchersDb.map(v => (
                        <div key={v.id} className={`p-4 rounded-xl border flex flex-col gap-2 relative overflow-hidden ${v.isActive ? 'bg-[#0B1120] border-rose-500/30' : 'bg-slate-900 border-slate-700 opacity-60'}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-black text-rose-400 text-lg uppercase">{v.code}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${v.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{v.isActive ? 'Đang bật' : 'Đã tắt'}</span>
                          </div>
                          <p className="text-sm text-white">Tặng thêm: <span className="font-bold text-emerald-400">{v.percent}%</span> giá trị nạp</p>
                          <div className="flex gap-2 mt-2 pt-3 border-t border-slate-800">
                            <button onClick={() => { setEditingVoucher(v); setShowVoucherModal(true); }} className="flex-1 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors text-xs font-bold flex justify-center"><Edit size={14} /></button>
                            <button onClick={() => setConfirmDialog({
                              title: 'Xoá Voucher',
                              message: 'Xoá mã khuyến mãi này?',
                              onConfirm: async () => {
                                await supabase.from('vouchers').delete().eq('id', v.id);
                                setVouchersDb(vouchersDb.filter(x => x.id !== v.id));
                                showToast("Đã xóa Voucher!");
                              }
                            })} className="flex-1 py-1 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold flex justify-center"><Trash2 size={14} /></button>                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-6 overflow-auto max-h-[500px] custom-scrollbar" onScroll={(e) => {
                  const { scrollTop, scrollHeight, clientHeight } = e.target;
                  if (scrollTop + clientHeight >= scrollHeight - 20) setVisibleDepsAdmin(prev => prev + 5);
                }}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><QrCode className="text-emerald-500" /> Danh sách yêu cầu duyệt nạp</h3>
                  {depositRequests.length === 0 ? <div className="p-10 text-center text-slate-500">Chưa có yêu cầu nạp tiền nào.</div> :
                    <table className="w-full text-left text-sm min-w-[600px]">
                      <thead className="bg-[#0B1120] text-slate-400 text-xs uppercase"><tr><th className="p-4">Mã GD / Ngày</th><th className="p-4">Khách hàng</th><th className="p-4">Số tiền duyệt</th><th className="p-4 text-center">Hành động</th></tr></thead>
                      <tbody className="divide-y divide-slate-800">
                        {[...depositRequests].sort((a, b) => getRecordTime(b) - getRecordTime(a)).slice(0, visibleDepsAdmin).map(d => (
                          <tr key={d.id} className="hover:bg-slate-800/30">
                            <td className="p-4"><div className="text-slate-300 font-mono text-xs">{d.id}</div><div className="text-[10px] text-slate-500 mt-1">{new Date(getRecordTime(d) || Date.now()).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</div></td>
                            <td className="p-4 text-blue-400 font-bold">
                              <button
                                onClick={() => {
                                  const foundUser = usersDb.find(u => u.id === d.userId);
                                  if (foundUser) {
                                    setEditingUser(foundUser);
                                    setShowUserModal(true);
                                  } else {
                                    showToast("Không tìm thấy thông tin chi tiết khách hàng!");
                                  }
                                }}
                                className="hover:underline text-left font-bold"
                              >
                                {d.user}
                              </button>
                              <span className="text-[10px] text-slate-500 font-normal ml-1">(ID: {d.userId})</span>
                            </td>
                            <td className="p-4">
                              <span className="text-emerald-400 font-black text-base block">{(d.type === 'card' || (d.details && d.details.toLowerCase().includes('thẻ')) || String(d.id).startsWith('CARD')) ? '💳 Thẻ cào: ' : '🏦 Chuyển khoản: '}{new Intl.NumberFormat('vi-VN').format(d.amount)}đ</span>
                              {d.bonusAmount > 0 && <span className="text-[10px] text-rose-400 font-bold block mt-0.5">Khuyến mãi +{new Intl.NumberFormat('vi-VN').format(d.bonusAmount)}đ (Mã: {d.voucherCode})</span>}
                              {d.status === 'Thất bại' && d.details && (
                                <span className="text-[10px] text-red-400 block mt-0.5 leading-tight">{d.details}</span>
                              )}
                            </td>
                            <td className="p-4 flex justify-center gap-2">
                              {d.status === 'Chờ duyệt' ? ((d.type === 'card' || (d.details && d.details.toLowerCase().includes('thẻ')) || String(d.id).startsWith('CARD')) ? <span className="text-yellow-500 font-bold text-xs bg-yellow-500/10 px-3 py-1.5 rounded text-center">Hệ thống gạch thẻ tự động xử lý...</span> :
                                <>
                                  <button onClick={() => {
                                    setApproveDepositModal(d);
                                  }} className="bg-emerald-600 px-4 py-2 rounded-lg text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-lg">Duyệt Cộng</button>
                                  <button onClick={() => {
                                    setConfirmDialog({
                                      title: 'Từ chối Nạp', message: 'Từ chối yêu cầu này?', onConfirm: async () => {
                                        // 1. Lưu vĩnh viễn lên Supabase
                                        await supabase.from('deposit_requests').update({ status: 'Từ chối' }).eq('id', d.id);
                                        // 2. Tắt trên màn hình
                                        setDepositRequests(depositRequests.map(req => req.id === d.id ? { ...req, status: 'Từ chối' } : req));

                                        // 3. Cập nhật tin nhắn Telegram (xóa nút, đổi thành "Đã từ chối")
                                        supabase.functions.invoke('telegram-bot', {
                                          body: { type: 'web_rejected', requestId: d.id }
                                        }).catch(err => console.error("Lỗi cập nhật Telegram:", err));

                                        showToast("Đã từ chối lệnh!");
                                      }
                                    });
                                  }} className="bg-rose-500/20 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-colors">Từ chối</button>
                                </>)
                                : <span className={`px-3 py-1.5 rounded text-xs font-bold ${d.status === 'Thành công' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{d.status}</span>}
                              <button onClick={() => setConfirmDialog({ title: 'Xoá lịch sử', message: 'Xoá lịch sử nạp này?', onConfirm: () => setDepositRequests(depositRequests.filter(x => x.id !== d.id)) })} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-colors"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  }
                </div>
              </div>
            )}

            {/* TAB THUÊ NICK */}
            {adminTab === 'rentreqs' && (
              <div className="p-3 md:p-6">
                <div className="flex items-center gap-2 mb-6 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-sm">
                  <AlertCircle size={18} /> Hướng dẫn: Mở app điều khiển trên máy tính, nhập ID App & Mật khẩu của khách để điều khiển máy khách và đăng nhập nick game.
                </div>
                {rentRequests.length === 0 ? <div className="text-center text-slate-500 p-10">Chưa có yêu cầu thuê nick nào.</div> :
                  <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2" onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    if (scrollTop + clientHeight >= scrollHeight - 20) setVisibleRentsAdmin(prev => prev + 5);
                  }}>
                    {[...rentRequests].sort((a, b) => getRecordTime(b) - getRecordTime(a)).slice(0, visibleRentsAdmin).map(r => {
                      const accObj = accountsDb.find(a => a.code === r.accCode);
                      const isStillRented = accObj?.rentedUntil && accObj.rentedUntil > Date.now() && rentRequests.find(req => req.accCode === r.accCode && req.status === 'Đã giao acc')?.id === r.id;

                      return (
                        <div key={r.id} className="bg-[#0B1120] p-3 md:p-5 rounded-xl border border-slate-700 flex flex-col lg:flex-row gap-3 md:gap-6 items-start lg:items-center relative overflow-hidden group">
                          {r.status === 'Đã giao acc' && isStillRented && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">ĐANG THUÊ</div>}
                          {r.status === 'Đã giao acc' && !isStillRented && <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">ĐÃ HẾT HẠN</div>}
                          {r.status === 'Đã trả acc' && <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">ĐÃ TRẢ ACC</div>}
                          {r.status === 'Từ chối' && <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-md">ĐÃ TỪ CHỐI</div>}
                          <div className="w-full lg:w-40 h-24 md:h-28 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden border border-slate-800 shrink-0 relative">
                            {r.info?.kycMethod === 'vip' ? (
                              <div className="flex flex-col items-center text-yellow-500"><Sparkles size={28} className="mb-2" /><span className="font-black text-sm uppercase">Khách VIP</span><span className="text-[9px] text-slate-400 text-center">Miễn CCCD & Cọc</span></div>
                            ) : r.info?.kycMethod === 'khach_quen' ? (
                              <div className="flex flex-col items-center text-emerald-500"><CheckCircle2 size={28} className="mb-2" /><span className="font-black text-sm uppercase">Khách Quen</span><span className="text-[9px] text-slate-400 text-center">Đã miễn CCCD & Cọc</span></div>
                            ) : (r.info?.kycMethod === 'deposit' || r.info?.kycMethod === 'coc') ? (
                              <div className="flex flex-col items-center text-rose-500"><Wallet size={28} className="mb-2" /><span className="font-black text-sm uppercase">Đã cọc 500k</span><span className="text-[9px] text-slate-400 text-center">Sẽ hoàn khi trả nick</span></div>
                            ) : (
                              (r.info?.kycMethod === 'cccd' || r.info?.kycMethod === 'verified_cccd' || r.info?.cccdImage) ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (r.info?.cccdImage) {
                                      setFullScreenImage(r.info.cccdImage);
                                    } else {
                                      showToast("Đang tải ảnh từ máy chủ phân tán...", "info");
                                      const { data, error } = await supabase.from('users').select('cccd_image').eq('id', r.userId).single();
                                      if (data?.cccd_image) {
                                        setFullScreenImage(data.cccd_image);
                                      } else {
                                        showToast("Không tìm thấy ảnh CCCD của khách này trên hệ thống!", "error");
                                      }
                                    }
                                  }}
                                  className="w-full h-full flex flex-col items-center justify-center text-blue-400 hover:bg-blue-500/10 transition-colors group"
                                  title="Tải & Phóng to CCCD"
                                >
                                  <ImageIcon size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                                  <span className="text-[10px] font-bold border border-blue-500/50 px-2 py-1 rounded bg-blue-500/10 whitespace-nowrap shadow-sm">Hiển Thị CCCD</span>
                                </button>
                              ) : <span className="text-xs text-slate-500">Khách chưa up ảnh</span>
                            )}
                          </div>
                          <div className="flex-1 space-y-2 text-sm w-full">
                            <div className="flex flex-col md:flex-row md:justify-between border-b border-slate-800 pb-2 w-full gap-1">
                              <p className="text-xs md:text-sm">
                                <span className="text-slate-400">Khách:</span>
                                <button
                                  onClick={() => {
                                    const foundUser = usersDb.find(u => u.id === r.userId);
                                    if (foundUser) {
                                      setEditingUser(foundUser);
                                      setShowUserModal(true);
                                    } else {
                                      showToast("Không tìm thấy thông tin chi tiết khách hàng!");
                                    }
                                  }}
                                  className="text-blue-400 font-bold text-sm md:text-base ml-1 hover:underline text-left"
                                >
                                  {r.user}
                                </button>
                                {r.info?.kycMethod === 'vip' && <span className="bg-yellow-500 text-[#0B1120] text-[10px] font-black px-1.5 py-0.5 rounded ml-2 shadow-[0_0_10px_rgba(250,204,21,0.5)]">VIP</span>}
                                <span className="inline-flex md:hidden ml-2 bg-blue-600/20 px-2 py-0.5 rounded-full border border-blue-500/40 text-blue-400 font-black text-[10px] items-center gap-1"><Clock size={10} className="animate-pulse" /> {r.date}</span>
                              </p>

                              {/* Ô THỜI GIAN HIỂN THỊ - ẨN TRÊN MOBILE (đã inline ở trên) */}
                              <div className="hidden md:block bg-blue-600/20 px-4 py-1 rounded-full border border-blue-500/40 shadow-sm whitespace-nowrap self-center">
                                <p className="text-blue-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                  <Clock size={14} className="animate-pulse" /> {r.date}
                                </p>
                              </div>

                              <p className="text-xs md:text-sm">
                                <span className="text-slate-400">SĐT:</span>
                                <span className="font-bold ml-1">{r.info?.phone}</span>
                                {r.info?.kycMethod === 'cccd' && <><br className="md:hidden" /><span className="hidden md:inline"> | </span>CCCD: {r.info?.cccdNumber}</>}
                              </p>
                            </div>
                            <p>
                              <span className="text-slate-400">Thuê Nick mã:</span>
                              <span className="font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 ml-1">{r.accCode}</span>
                              <span className="text-slate-500 ml-2">({r.time})</span>
                              {/* DÒNG CHÈN THÊM NGÀY GIỜ THUÊ TẠI ĐÂY */}

                            </p>
                            <div className="bg-blue-900/20 p-2.5 md:p-3 rounded-lg border border-blue-500/30 mt-2 md:mt-3 flex items-start md:items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-blue-400 font-bold text-[10px] md:text-xs mb-1 flex items-center gap-1"><Gamepad2 size={12} /> APP ĐIỀU KHIỂN CỦA KHÁCH:</p>
                                <p className="text-xs md:text-base break-all">ID App: <span className="text-white font-mono bg-black/30 px-1.5 md:px-2 py-0.5 rounded text-xs md:text-base">{r.info?.awesunId}</span> <span className="mx-1 md:mx-2 text-slate-600">|</span> Mật khẩu: <span className="text-white font-mono bg-black/30 px-1.5 md:px-2 py-0.5 rounded text-xs md:text-base">{r.info?.awesunPass}</span></p>
                              </div>
                              <button onClick={() => copyToClipboard(`${r.info?.awesunId} ${r.info?.awesunPass}`)} className="p-2 bg-blue-500/20 rounded text-blue-400 hover:bg-blue-500 hover:text-white transition-colors shrink-0" title="Copy cả ID App & Mật khẩu"><Copy size={16} /></button>
                            </div>
                          </div>
                          <div className="flex flex-wrap lg:flex-col gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                            {r.status === 'Chờ xử lý' && (
                              <button onClick={() => {
                                setConfirmDialog({
                                  title: 'Xác nhận giao', message: 'Bạn đã đăng nhập thành công vào máy khách?', onConfirm: async () => {
                                    const parseTimeStr = (str) => {
                                      if (!str) return 0;
                                      const s = str.toLowerCase();
                                      const match = s.match(/(\d+)/);
                                      if (match) {
                                        const val = parseInt(match[1]);
                                        if (s.includes('phút') || s.includes('p')) return val * 60 * 1000;
                                        if (s.includes('giờ') || s.includes('h')) return val * 60 * 60 * 1000;
                                        if (s.includes('ngày') || s.includes('d')) return val * 24 * 60 * 60 * 1000;
                                      }
                                      return 0;
                                    };

                                    const timeStrLower = r.time.toLowerCase();
                                    const now = new Date();
                                    const bonusMs = r.info?.bonusTime ? parseTimeStr(r.info.bonusTime) : 0;
                                    let endTime;

                                    // TỰ ĐỘNG BẮT KEYWORD "COMBO" VÀ TÍNH GIỜ CHUẨN XÁC
                                    if (timeStrLower.includes('combo đêm')) {
                                      let end = new Date(now);
                                      end.setHours(8, 0, 0, 0); // Mặc định là 8h sáng
                                      if (now.getHours() >= 8) end.setDate(end.getDate() + 1); // Nếu Admin giao lúc 23h, nó sẽ tính 8h sáng hôm sau
                                      endTime = end.getTime() + bonusMs;
                                    }
                                    else if (timeStrLower.includes('combo ngày')) {
                                      let end = new Date(now);
                                      end.setHours(23, 0, 0, 0); // Mặc định là 23h đêm
                                      if (now.getHours() >= 23) end.setDate(end.getDate() + 1);
                                      endTime = end.getTime() + bonusMs;
                                    }
                                    else {
                                      // Tính theo số giờ bình thường
                                      let durationMs = parseTimeStr(r.time) + bonusMs;
                                      if (durationMs === 0) durationMs = 2 * 60 * 60 * 1000; // Lỗi chữ thì cho mặc định 2 tiếng
                                      endTime = Date.now() + durationMs;
                                    }                                 // Lưu lên Supabase: Cập nhật tài khoản đang cho thuê và trạng thái đơn
                                    // 1. Cập nhật bảng Accounts BẮT BUỘC TRẢ VỀ DỮ LIỆU
                                    const { data: accData, error: accErr } = await supabase.from('accounts')
                                      .update({
                                        rentedUntil: endTime,
                                        rentStartedAt: Date.now(),
                                        currentRenterId: r.userId
                                      })
                                      .eq('code', r.accCode)
                                      .select();

                                    if (accErr || !accData || accData.length === 0) {
                                      alert("❌ BẢNG ACCOUNTS TỪ CHỐI LƯU (0 dòng được sửa)!\n1. Hãy chắc chắn bạn đã chạy lệnh tắt RLS trong SQL.\n2. Mã acc này có thể bị sai lệch.");
                                      return; // Bị lỗi là chặn ngay, không cho web giả vờ thành công
                                    }

                                    // 2. Cập nhật bảng Rent_Requests BẮT BUỘC TRẢ VỀ DỮ LIỆU
                                    const { data: reqData, error: reqErr } = await supabase.from('rent_requests')
                                      .update({ status: 'Đã giao acc' })
                                      .eq('id', r.id)
                                      .select();

                                    if (reqErr || !reqData || reqData.length === 0) {
                                      alert("❌ BẢNG THUÊ NICK TỪ CHỐI LƯU (0 dòng được sửa)!\nHãy chạy lệnh tắt RLS cho bảng rent_requests.");
                                      return;
                                    }

                                    // 3. Vượt qua cửa ải Database thì mới cập nhật giao diện
                                    setRentRequests(rentRequests.map(req => req.id === r.id ? { ...req, status: 'Đã giao acc' } : req));
                                    setAccountsDb(accountsDb.map(a => a.code === r.accCode ? {
                                      ...a,
                                      rentedUntil: endTime,
                                      rentStartedAt: Date.now(),
                                      currentRenterId: r.userId
                                    } : a));
                                    showToast("Đã đánh dấu hoàn thành & Bắt đầu đếm ngược!");
                                  }
                                });
                              }} className="flex-1 bg-emerald-600 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-white text-xs md:text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-colors">Đã Đăng Nhập Xong</button>
                            )}
                            {r.status === 'Chờ xử lý' && (
                              <button onClick={() => {
                                setConfirmDialog({
                                  title: 'Từ chối & Hoàn trả nguồn tiền', message: 'Hệ thống sẽ hoàn Tiền Quỹ và Tiền Ví về đúng túi ban đầu của khách. Bạn chắc chắn chứ?', onConfirm: async () => {

                                    // 1. Ép kiểu an toàn cho r.info để chống lỗi mất dữ liệu
                                    let safeInfo = r.info;
                                    if (typeof safeInfo === 'string') {
                                      try { safeInfo = JSON.parse(safeInfo); } catch (e) { safeInfo = {}; }
                                    }
                                    safeInfo = safeInfo || {};

                                    // 2. Trích xuất tiền hoàn
                                    const refundFromFund = safeInfo.paidFromFund || 0;
                                    const refundFromMain = (safeInfo.paidFromMain || 0) + (safeInfo.depositAmount || 0);
                                    const totalRefund = refundFromFund + refundFromMain;

                                    // 3. Cảnh báo nếu dữ liệu nguồn tiền bị rỗng
                                    if (totalRefund === 0) {
                                      const isConfirm = window.confirm("CẢNH BÁO: Đơn này bị lỗi mất dữ liệu nguồn tiền (Hoàn = 0đ). Bạn có chắc vẫn muốn từ chối không?");
                                      if (!isConfirm) return;
                                    }

                                    // 2. HOÀN TIỀN VỀ ĐÚNG TỪNG VÍ (Lấy Data sống từ Server chống lỗi kép)
                                    const { data: targetUser } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', r.userId).single();
                                    if (targetUser) {
                                      const newBalance = targetUser.balance + refundFromMain;
                                      const newRentFund = (targetUser.rentFund || 0) + refundFromFund;

                                      // Cập nhật Supabase
                                      const { error: userErr } = await supabase.from('users').update({
                                        balance: newBalance,
                                        rentFund: newRentFund
                                      }).eq('id', r.userId);

                                      if (userErr) return alert("Lỗi hoàn tiền: " + userErr.message);

                                      // Ghi Lịch sử Giao dịch rành mạch
                                      const refundTxs = [];
                                      if (refundFromMain > 0) {
                                        refundTxs.push({
                                          id: `TX${Date.now()}_M`, user: targetUser.name,
                                          action: `Hoàn tiền thuê Mã ${r.accCode} (bị từ chối)`, amount: -refundFromMain,
                                          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                                          status: 'Thành công', type: 'refund',
                                          accDetails: { balanceAfter: newBalance, fundAfter: newRentFund }
                                        });
                                      }
                                      if (refundFromFund > 0) {
                                        refundTxs.push({
                                          id: `TX${Date.now()}_F`, user: targetUser.name,
                                          action: `Hoàn Quỹ Bảo Lưu thuê Mã ${r.accCode} (bị từ chối)`,
                                          amount: -refundFromFund,
                                          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                                          status: 'Thành công', type: 'fund_refund',

                                          // CHÈN THÊM DÒNG NÀY VÀO ĐÂY LÀ XONG
                                          accDetails: { balanceAfter: newBalance, fundAfter: newRentFund }
                                        });
                                      }

                                      if (refundTxs.length > 0) await supabase.from('transactions').insert(refundTxs);

                                      // Cập nhật State RAM
                                      setTransactionsDb(prev => [...refundTxs, ...prev]);
                                      const updatedTargetUser = { ...targetUser, balance: newBalance, rentFund: newRentFund };
                                      setUsersDb(prev => prev.map(u => u.id === r.userId ? updatedTargetUser : u));
                                      if (currentUser?.id === r.userId) setCurrentUser(updatedTargetUser);
                                    }

                                    // 3. ĐỔI TRẠNG THÁI ĐƠN & GỬI TIN NHẮN
                                    await supabase.from('rent_requests').update({ status: 'Từ chối' }).eq('id', r.id);
                                    setRentRequests(prev => prev.map(req => req.id === r.id ? { ...req, status: 'Từ chối' } : req));

                                    if (currentUser && r.userId) {
                                      const msg = {
                                        id: `MSG${Date.now()}`, senderId: currentUser.id, receiverId: r.userId,
                                        content: `⚠️ Đơn thuê ${r.accCode} bị từ chối. Đã hoàn ${new Intl.NumberFormat('vi-VN').format(refundFromMain)}đ vào Ví và ${new Intl.NumberFormat('vi-VN').format(refundFromFund)}đ vào Quỹ thuê.`,
                                        timestamp: Date.now(), isRead: false
                                      };
                                      await supabase.from('messages').insert([msg]);
                                    }

                                    showToast("Đã từ chối & Hoàn tiền về đúng ví!");
                                  }
                                });
                              }} className="flex-1 bg-rose-600/20 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-rose-500 border border-rose-500/30 text-xs md:text-sm font-bold hover:bg-rose-500 hover:text-white transition-colors">Từ Chối Đơn</button>
                            )}
                            {/* NÚT XÁC MINH CCCD NHANH */}
                            {(r.info?.kycMethod === 'cccd' || r.info?.kycMethod === 'verified_cccd') && (() => {
                              const targetUser = usersDb.find(u => u.id === r.userId);
                              return !targetUser?.is_cccd_verified ? (
                                <button onClick={async () => {
                                  const { error } = await supabase.from('users').update({ is_cccd_verified: true }).eq('id', r.userId);
                                  if (error) return showToast("Lỗi: " + error.message, 'error');
                                  setUsersDb(usersDb.map(u => u.id === r.userId ? { ...u, is_cccd_verified: true } : u));
                                  showToast(`Đã đánh dấu CCCD hợp lệ cho ${r.user}!`);
                                }} className="flex-1 bg-purple-600/20 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-purple-400 border border-purple-500/30 text-xs md:text-sm font-bold hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-1.5">
                                  <ShieldCheck size={16} /> Xác minh CCCD
                                </button>
                              ) : (
                                <div className="flex-1 bg-emerald-500/10 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-emerald-400 border border-emerald-500/30 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 cursor-default">
                                  <CheckCircle2 size={16} /> CCCD đã xác minh ✓
                                </div>
                              );
                            })()}
                            {r.status === 'Đã giao acc' && isStillRented && (
                              <button onClick={() => setEditRentModal({ req: r, acc: accObj })} className="flex-1 bg-blue-600 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-white text-xs md:text-sm font-bold hover:bg-blue-500 transition-colors flex justify-center items-center gap-1">
                                <Edit size={16} /> Sửa Thời Gian
                              </button>
                            )}
                            <button onClick={() => setConfirmDialog({ title: 'Xoá yêu cầu', message: 'Xoá yêu cầu thuê này?', onConfirm: () => setRentRequests(rentRequests.filter(x => x.id !== r.id)) })} className="px-3 md:px-4 py-2.5 md:py-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center shrink-0"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                }
              </div>
            )}

            {/* TAB CÀY THUÊ */}
            {adminTab === 'boosting' && (
              <div className="p-6">
                {/* CHÚ Ý LỆNH SET ẢNH VỀ NULL ĐỂ TRÁNH LỖI HIỂN THỊ ẢNH CŨ */}
                <button onClick={() => { setEditingBoosting(null); setAdminBoostingImage([]); setAdminBoostType('rank'); setAdminRankOptions([{ rank: '', price: '', comboPrice: '', inputType: 'diem', maxPoints: '', basePoints: '', tierCount: 1 }]); setAdminGame(''); setAdminGameAvatar(null); setCrossfireText(''); setAdminConfigType('points_cumulative'); setIsEventMultiPackage(false); setAdminBoostingPriceUnit(''); setShowBoostingModal(true); }} className="mb-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-emerald-600/20 transition-transform hover:scale-105"><PlusCircle size={18} /> Thêm dịch vụ Cày Thuê</button>
                {/* Modal Admin Thêm Cày Thuê */}
                {showBoostingModal && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#151D2F] border border-slate-700 w-full max-w-md md:max-w-3xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Target className="text-blue-500" /> {editingBoosting ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Cày Thuê'}</h3>
                        <button onClick={() => setShowBoostingModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                      </div>
                      <form onSubmit={handleSaveBoosting}>
                        <div className="md:grid md:grid-cols-2 md:gap-6">
                          {/* === CỘT TRÁI: Ảnh + Cài đặt cơ bản === */}
                          <div className="space-y-4">
                            {/* --- KHU VỰC UP ẢNH CÀY THUÊ CÓ NÚT X --- */}
                            <div>
                              <label className="text-xs text-slate-400 font-bold">Ảnh mô tả dịch vụ (Tùy chọn)</label>
                              <div className="mt-1 border border-dashed border-slate-600 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors relative group bg-[#0B1120]">
                                <input type="file" accept="image/*" multiple onChange={handleBoostingImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                {adminBoostingImage && adminBoostingImage.length > 0 ? (
                                  <div className="relative z-20 grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {adminBoostingImage.map((img, idx) => (
                                      <div key={idx} className="relative">
                                        <img src={img} className="mx-auto h-24 object-cover rounded-lg shadow-md w-full" alt="Preview" />
                                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAdminBoostingImage(prev => prev.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-lg transition-colors z-30" title="Xóa ảnh này"><X size={12} /></button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-slate-500 flex flex-col items-center"><ImageIcon size={28} className="mb-2" /><span className="text-[10px] font-bold">Bấm hoặc Kéo thả nhiều ảnh</span></div>
                                )}
                              </div>
                            </div>

                            {/* CHỌN LOẠI CÀY VÀ TÊN GAME */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-slate-400 block mb-1">Cày gì?</label>
                                <select name="boostType" value={adminBoostType} onChange={(e) => setAdminBoostType(e.target.value)} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500">
                                  <option value="rank">Cày Rank</option>
                                  <option value="event">Cày Sự Kiện</option>
                                </select>
                              </div>
                              {/* LUÔN HIỆN Ô TÊN GAME CHO CẢ 2 LOẠI */}
                              <div>
                                <label className="text-xs text-slate-400 block mb-1">Tên Game</label>
                                <input name="game" value={adminGame} onChange={(e) => setAdminGame(e.target.value)} placeholder="VD: Liên Quân, Tốc Chiến..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required />
                              </div>
                            </div>

                            <label className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg cursor-pointer transition-colors hover:bg-amber-500/20 mt-2">
                              <input type="checkbox" name="isFeatured" defaultChecked={getGameInfo(editingBoosting?.game).isFeatured || false} className="w-5 h-5 accent-amber-500 cursor-pointer" />
                              <span className="text-sm font-bold text-amber-500">🔥 Dịch vụ Nổi Bật (Ưu tiên hiển thị sảnh trang chủ)</span>
                            </label>


                            {/* Nếu chọn Cày Sự Kiện thì hiện thêm ô Tên Sự Kiện */}
                            {adminBoostType === 'event' && (
                              <div>
                                <label className="text-xs text-rose-400 font-bold block mb-1">Sự Kiện Gì?</label>
                                <input name="eventName" defaultValue={editingBoosting?.type === 'event' ? editingBoosting.title : ''} placeholder="VD: Cày Sổ Sứ Mệnh, Sự kiện Tết..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500" required />
                              </div>
                            )}

                            {adminBoostType === 'event' && (
                              <div className="mt-2 space-y-2">
                                <label className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg cursor-pointer transition-colors hover:bg-blue-500/20">
                                  <input type="checkbox" checked={isEventMultiPackage} onChange={(e) => setIsEventMultiPackage(e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
                                  <span className="text-sm font-bold text-blue-400">Bật chia nhiều Gói nhỏ (Cày nhiều mốc)</span>
                                </label>
                                {!isEventMultiPackage && (
                                  <div className="flex flex-col gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg transition-colors shadow-inner">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        name="allowQuantity"
                                        defaultChecked={editingBoosting?.allow_quantity || false}
                                        className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                      />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold text-emerald-400">Cho phép khách điền số lượng</span>
                                        <span className="text-[10px] text-slate-500">Tự động nhân giá với số lượng khách điền</span>
                                      </div>
                                    </label>
                                    <div className="flex items-center justify-between gap-2 border-t border-emerald-500/20 pt-2">
                                      <span className="text-[11px] font-bold text-slate-300">Giới hạn 1 lần mua:</span>
                                      <input type="number" name="maxQuantityPerOrder" min="0" defaultValue={getGameInfo(editingBoosting?.game).maxQuantityPerOrder || 0} placeholder="0 = Không giới hạn" className="w-24 p-1.5 bg-[#0B1120] border border-emerald-500/50 rounded text-xs text-white font-bold outline-none focus:border-emerald-400 text-center" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {adminBoostType === 'rank' ? (
                              <div className="space-y-4 mt-4">
                                <div><label className="text-xs text-slate-400 block mb-1">Tiêu đề Dịch vụ (Hiển thị to)</label><input name="title" defaultValue={editingBoosting?.title} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required /></div>
                                <div><label className="text-xs text-slate-400 block mb-1">Mô tả chi tiết</label><textarea name="desc" defaultValue={editingBoosting?.desc} rows="3" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required></textarea></div>
                                <div><label className="text-xs text-slate-400 block mb-1">Đơn vị hiển thị sau giá <span className="text-slate-600">(VD: điểm, bậc, gói...)</span></label><input name="priceUnit" value={adminBoostingPriceUnit} onChange={e => setAdminBoostingPriceUnit(e.target.value)} placeholder="Để trống nếu không cần" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" /></div>
                              </div>
                            ) : (
                              <>
                                <div><label className="text-xs text-slate-400 block mb-1">Mô tả chi tiết sự kiện</label><textarea name="amount" defaultValue={editingBoosting?.type === 'event' ? editingBoosting.desc : ''} rows="3" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required></textarea></div>
                                <div><label className="text-xs text-slate-400 block mb-1">Đơn vị hiển thị sau giá <span className="text-slate-600">(VD: điểm, bậc, gói...)</span></label><input name="priceUnit" value={adminBoostingPriceUnit} onChange={e => setAdminBoostingPriceUnit(e.target.value)} placeholder="Để trống nếu không cần" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" /></div>
                                <label className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg cursor-pointer mt-2">
                                  <input type="checkbox" name="requireLogin" defaultChecked={editingBoosting?.type === 'event' ? editingBoosting.require_login : false} className="w-5 h-5 accent-rose-500 cursor-pointer" />
                                  <span className="text-sm font-bold text-rose-400">Yêu cầu cung cấp TK/MK Game?</span>
                                </label>
                              </>
                            )}
                          </div>
                          {/* === CỘT PHẢI: Chỉ chứa Bảng giá mốc === */}
                          <div className="space-y-4 mt-4 md:mt-0">
                            {(adminBoostType === 'rank' || (adminBoostType === 'event' && isEventMultiPackage)) ? (
                              <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/30">
                                <div className="flex justify-between items-center mb-3">
                                  <label className="text-sm text-blue-400 font-bold flex items-center gap-2">
                                    <Target size={16} /> CẤU HÌNH MỐC ĐIỂM (Cộng dồn)
                                  </label>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs text-emerald-400 mb-2">Nhập danh sách theo định dạng: <span className="font-bold text-white">Tên Rank | Điểm mốc | Giá</span> (Mỗi rank 1 dòng)</p>
                                  <p className="text-[10px] text-slate-500 mb-2">Cột giá hỗ trợ: <span className="text-cyan-400">300k/200 điểm</span> (tự tính 1500đ/điểm), <span className="text-cyan-400">25k/100</span> (tự tính 250đ/điểm), hoặc số thuần <span className="text-cyan-400">1500</span></p>
                                  <textarea
                                    value={crossfireText}
                                    onChange={(e) => setCrossfireText(e.target.value)}
                                    placeholder={`Ví dụ:\nVàng | 1800 | 25k/100 điểm\nBạch Kim | 2100 | 30k/100 điểm\nHuyền Thoại | 3300 | 300k/200 điểm\nThần Thoại | 3500 | 450k/200 điểm\nTruyền Kỳ | 3700 | 0`}
                                    className="w-full h-[250px] p-3 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-mono text-sm outline-none focus:border-emerald-400"
                                    required
                                  ></textarea>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-emerald-400 block mb-1">Giá tiền gốc (VNĐ)</label><input name="basePrice" type="number" defaultValue={editingBoosting ? (editingBoosting.oldPrice || editingBoosting.price) : ''} className="w-full p-3 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-bold outline-none focus:border-emerald-500" required /></div>
                                <div><label className="text-xs text-rose-400 block mb-1">Giá đã giảm (Tùy chọn)</label><input name="discountedPrice" type="number" defaultValue={editingBoosting?.oldPrice ? editingBoosting.price : ''} className="w-full p-3 bg-[#0B1120] border border-rose-500/50 rounded-lg text-rose-400 font-bold outline-none focus:border-rose-400" /></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-6 shadow-lg shadow-blue-600/20">Lưu Dịch Vụ</button>
                      </form>
                    </div>
                  </div>
                )}
                {/* --- LỊCH SỬ ĐƠN CÀY THUÊ DÀNH CHO ADMIN --- */}
                {boostingRequests.length > 0 && (
                  <div className="mb-8 border border-blue-500/30 rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-blue-900/30 p-3 font-bold text-blue-400 border-b border-blue-500/30 text-sm flex items-center gap-2">
                      <History size={18} /> QUẢN LÝ ĐƠN KHÁCH ĐẶT CÀY THUÊ
                    </div>
                    {boostingRequests.map(req => (
                      <div key={req.id} className="p-4 bg-[#0B1120] border-b border-slate-800 text-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="font-bold text-white">
                              <span
                                className="text-blue-400 cursor-pointer hover:underline"
                                onClick={() => {
                                  const foundUser = usersDb.find(u => u.name === req.user);
                                  if (foundUser) {
                                    setEditingUser(foundUser);
                                    setShowUserModal(true);
                                  } else {
                                    showToast("Không tìm thấy thông tin chi tiết khách hàng!", "error");
                                  }
                                }}
                              >
                                {req.user}
                              </span> đặt gói: {req.boostingTitle} <span className="text-xs text-slate-500 font-normal">({req.date})</span>
                            </p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400' : req.status === 'Đang cày' ? 'bg-blue-500/20 text-blue-400' : req.status === 'Đã hủy' ? 'bg-rose-500/20 text-rose-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {req.status || 'Chờ xử lý'}
                            </span>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-400">
                              {req.info.loginMethod === 'Không Cần' ? (
                                <>Mã sự kiện / Link: <span className="text-white font-mono">{req.info.username}</span></>
                              ) : (
                                <>Nền tảng: <span className="text-white font-bold">{req.info.loginMethod}</span> | TK: <span className="text-white font-mono">{req.info.username}</span> | MK: <span className="text-white font-mono">{req.info.password}</span></>
                              )}
                            </p>
                            {req.info.note && <p className="text-xs text-yellow-500 mt-1 italic">Ghi chú: {req.info.note}</p>}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                          <select
                            value={req.status || 'Chờ xử lý'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;

                              // 1. Cập nhật trạng thái lên Database
                              await supabase.from('boosting_requests').update({ status: newStatus }).eq('id', req.id);
                              await supabase.from('transactions').update({ status: newStatus }).eq('reqId', req.id);

                              // 2. TỰ ĐỘNG BẮN TIN NHẮN THÔNG BÁO CHO KHÁCH
                              const targetUser = usersDb.find(u => u.name === req.user);
                              if (targetUser && currentUser) {
                                let msgContent = `[HỆ THỐNG] Đơn cày thuê "${req.boostingTitle}" của bạn đã chuyển sang trạng thái: ${newStatus.toUpperCase()}`;

                                // Tùy biến câu chào theo từng trạng thái cho chuyên nghiệp
                                if (newStatus === 'Hoàn thành') {
                                  msgContent = `🎉 Chúc mừng! Đơn cày thuê "${req.boostingTitle}" của bạn đã HOÀN THÀNH. Vui lòng vào game kiểm tra lại nhé! Cảm ơn bạn đã tin tưởng Shop.`;
                                } else if (newStatus === 'Đang cày') {
                                  msgContent = `🎮 Đơn cày thuê "${req.boostingTitle}" của bạn ĐANG ĐƯỢC XỬ LÝ. Vui lòng KHÔNG đăng nhập vào game trong lúc này để tránh làm văng nick người cày nhé!`;
                                }

                                const newMsg = {
                                  id: `MSG${Date.now()}`,
                                  senderId: currentUser.id,
                                  receiverId: targetUser.id,
                                  content: msgContent,
                                  timestamp: Date.now(),
                                  isRead: false
                                };

                                // Đẩy tin nhắn lên DB và cập nhật màn hình
                                await supabase.from('messages').insert([newMsg]);
                              }

                              // 3. Hiển thị trạng thái mới ra màn hình Admin
                              setBoostingRequests(boostingRequests.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
                              setTransactionsDb(transactionsDb.map(tx => tx.reqId === req.id ? { ...tx, status: newStatus } : tx));
                              showToast(`Đã chuyển trạng thái & Gửi tin nhắn tự động cho ${req.user}!`);
                            }}
                            className="flex-1 md:flex-none bg-[#151D2F] text-white text-xs p-2 rounded outline-none border border-slate-700 focus:border-blue-500 font-bold cursor-pointer"
                          >
                            <option value="Chờ xử lý">⏳ Chờ xử lý</option>
                            <option value="Đang cày">🎮 Đang cày</option>
                            <option value="Hoàn thành">✅ Hoàn thành</option>
                          </select>
                          {req.status !== 'Đã hủy' && req.status !== 'Hoàn thành' && (
                            <button onClick={() => setConfirmDialog({
                              title: 'Hủy đơn & Hoàn tiền', message: `Hủy đơn "${req.boostingTitle}" và hoàn ${new Intl.NumberFormat('vi-VN').format(req.info?.amount || 0)}đ cho ${req.user}?`, onConfirm: async () => {
                                const refundAmount = req.info?.amount || 0;
                                const targetUser = usersDb.find(u => u.name === req.user);
                                if (!targetUser) { showToast('Không tìm thấy người dùng!', 'error'); return; }

                                // Hoàn tiền cho khách (trigger cho phép admin update)
                                if (refundAmount > 0) {
                                  const { error: refundErr } = await supabase.from('users').update({ balance: (targetUser.balance || 0) + refundAmount }).eq('id', targetUser.id);
                                  if (refundErr) { showToast('Lỗi hoàn tiền: ' + refundErr.message, 'error'); return; }
                                }

                                // Cập nhật trạng thái đơn
                                await supabase.from('boosting_requests').update({ status: 'Đã hủy' }).eq('id', req.id);

                                // Ghi lịch sử hoàn tiền
                                const refundTx = {
                                  id: `RF${Date.now()}`, user: req.user, action: `Hoàn tiền hủy đơn: ${req.boostingTitle}`,
                                  amount: refundAmount, date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                                  status: 'Thành công', type: 'boosting'
                                };
                                await supabase.from('transactions').insert([refundTx]);

                                // Gửi tin nhắn cho khách
                                if (targetUser && currentUser) {
                                  const msg = {
                                    id: `MSG${Date.now()}`, senderId: currentUser.id, receiverId: targetUser.id,
                                    content: `💰 Đơn cày thuê "${req.boostingTitle}" đã bị HỦY. Bạn đã được hoàn ${new Intl.NumberFormat('vi-VN').format(refundAmount)}đ vào số dư.`,
                                    timestamp: Date.now(), isRead: false
                                  };
                                  await supabase.from('messages').insert([msg]);
                                }

                                // Cập nhật UI
                                setBoostingRequests(boostingRequests.map(r => r.id === req.id ? { ...r, status: 'Đã hủy' } : r));
                                setUsersDb(usersDb.map(u => u.id === targetUser.id ? { ...u, balance: (u.balance || 0) + refundAmount } : u));
                                setTransactionsDb([refundTx, ...transactionsDb]);
                                showToast(`Đã hủy đơn & hoàn ${new Intl.NumberFormat('vi-VN').format(refundAmount)}đ cho ${req.user}!`);
                              }
                            })} className="p-2 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white flex items-center justify-center text-xs transition-colors font-bold gap-1 whitespace-nowrap">
                              <RotateCcw size={14} /> <span className="hidden md:inline">Hủy & Hoàn tiền</span><span className="md:hidden">Hủy đơn</span>
                            </button>
                          )}
                          {req.status === 'Đã hủy' && (
                            <span className="px-2 py-1 bg-rose-500/10 text-rose-400 rounded text-[10px] font-bold">ĐÃ HỦY</span>
                          )}
                          <button onClick={() => setConfirmDialog({
                            title: 'Xoá đơn', message: 'Bạn có chắc chắn muốn xoá đơn cày thuê này không?', onConfirm: async () => {
                              await supabase.from('boosting_requests').delete().eq('id', req.id);
                              setBoostingRequests(boostingRequests.filter(x => x.id !== req.id));
                              showToast("Đã xóa đơn cày thuê khỏi Database!");
                            }
                          })} className="p-2 bg-rose-500/10 text-rose-500 rounded hover:bg-rose-500 hover:text-white flex items-center justify-center text-xs transition-colors font-bold"><Trash2 size={14} className="md:mr-0 mr-1" /> <span className="md:hidden">Xóa đơn</span></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* -------------------------------------------------- */}
                {/* ADMIN FILTER CHO DANH SÁCH CÀY THUÊ */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 border-b border-slate-800 pb-6">
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => { setAdminBoostingCategoryFilter('rank'); setAdminBoostingGameFilter('Tất cả'); }} className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-xl transition-all ${adminBoostingCategoryFilter === 'rank' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-[#151D2F] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'}`}>Cày Rank</button>
                    <button onClick={() => { setAdminBoostingCategoryFilter('event'); setAdminBoostingGameFilter('Tất cả'); }} className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-xl transition-all ${adminBoostingCategoryFilter === 'event' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-[#151D2F] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'}`}>Cày Sự Kiện</button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto max-w-full hide-scrollbar snap-x snap-mandatory">
                    {['Tất cả', ...new Set(boostingDb.filter(b => (b.type || 'rank') === adminBoostingCategoryFilter).map(b => { try { return JSON.parse(b.game).name || b.game; } catch (e) { return b.game; } }))].map(game => (
                      <button key={game} onClick={() => setAdminBoostingGameFilter(game)} className={`px-3 py-1.5 whitespace-nowrap text-xs font-bold rounded-lg flex-shrink-0 transition-all border snap-start ${adminBoostingGameFilter === game ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>{game === 'Tất cả' ? 'Tất cả Game' : game}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boostingDb.filter(b => { const gn = (() => { try { return JSON.parse(b.game).name || b.game; } catch (e) { return b.game; } })(); return (b.type || 'rank') === adminBoostingCategoryFilter && (adminBoostingGameFilter === 'Tất cả' || gn === adminBoostingGameFilter); }).map(b => {
                    const adminGN = (() => { try { return JSON.parse(b.game).name || b.game; } catch (e) { return b.game; } })();
                    return (
                      <div key={b.id} className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex flex-col group hover:border-blue-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{adminGN}</span>
                            {(() => {
                              let isFeatured = false;
                              try { isFeatured = JSON.parse(b.game).isFeatured; } catch (e) { }
                              return isFeatured && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">🔥 Nổi Bật</span>;
                            })()}
                          </div>
                          <span className="text-rose-400 font-black text-lg">{new Intl.NumberFormat('vi-VN').format(b.price)}đ{b.priceUnit && <span className="text-slate-400 font-bold text-xs">/{b.priceUnit}</span>}</span>
                        </div>
                        <span className="text-white font-bold mb-2 line-clamp-2">{b.title}</span>
                        <p className="text-xs text-slate-500 mb-4 flex-1 line-clamp-2">{b.desc}</p>
                        <div className="flex gap-2 border-t border-slate-800 pt-3">
                          <button onClick={() => {
                            let gName = b.game || '';
                            let gAvatar = null;
                            try { const p = JSON.parse(b.game); gName = p.name || ''; gAvatar = p.avatar || null; } catch (e) { }
                            setEditingBoosting(b); setAdminBoostingImage(b.image ? b.image.split(',') : []); setAdminBoostType(b.type || 'rank'); setAdminRankOptions(b.rankOptions?.length > 0 ? b.rankOptions.map(o => ({ rank: o.rank || '', price: o.price || '', comboPrice: o.comboPrice || '', inputType: 'diem', maxPoints: o.maxPoints || '', basePoints: o.basePoints || '', tierCount: o.tierCount || 1 })) : [{ rank: '', price: '', comboPrice: '', inputType: 'diem', maxPoints: '', basePoints: '', tierCount: 1 }]); setAdminGame(gName); setAdminGameAvatar(gAvatar); setCrossfireText(b.rankOptions?.map(opt => `${opt.name || opt.rank} | ${opt.points || 0} | ${opt.price || 0}`).join('\n') || ''); setAdminConfigType('points_cumulative'); setIsEventMultiPackage(b.type === 'event' && b.rankOptions?.length > 0); setAdminBoostingPriceUnit(b.priceUnit || ''); setShowBoostingModal(true);
                          }} className="flex-1 py-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors text-xs font-bold flex justify-center items-center gap-1"><Edit size={14} /> Sửa</button>
                          <button onClick={() => setConfirmDialog({
                            title: 'Xoá dịch vụ', message: 'Xoá dịch vụ cày thuê này?', onConfirm: async () => {
                              await supabase.from('boosting').delete().eq('id', b.id);
                              setBoostingDb(boostingDb.filter(x => x.id !== b.id));
                              showToast("Đã xóa dịch vụ vĩnh viễn!");
                            }
                          })} className="flex-1 py-1.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold flex justify-center items-center gap-1"><Trash2 size={14} /> Xoá</button>                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB VÒNG QUAY */}
            {adminTab === 'wheel' && (
              <div className="p-6">
                <div className="bg-[#0B1120] border border-blue-500/30 p-5 rounded-2xl mb-8 shadow-lg">
                  <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-4"><Settings2 size={18} /> Cài đặt chi phí Vòng Quay</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const newConfig = {
                      moneyCost: parseInt(e.target.moneyCost.value),
                      spinCost: parseInt(e.target.spinCost.value)
                    };
                    setWheelConfig(newConfig);
                    localStorage.setItem('shop_wheel_config', JSON.stringify(newConfig)); // Ghi vào bộ nhớ trình duyệt để chống F5
                    showToast("Lưu cài đặt vòng quay thành công!");
                  }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Giá Quay Bằng Tiền (VNĐ)</label>
                      <input name="moneyCost" type="number" defaultValue={wheelConfig.moneyCost} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-emerald-400 font-bold outline-none focus:border-emerald-500" required />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Giá Quay Bằng Lượt (Spin)</label>
                      <input name="spinCost" type="number" defaultValue={wheelConfig.spinCost} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-rose-400 font-bold outline-none focus:border-rose-500" required />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold text-sm transition-colors shadow-lg">Lưu Cài Đặt</button>
                  </form>
                </div>

                {/* TAB CHỌN LOẠI VÒNG QUAY ĐỂ SỬA */}
                <div className="flex border-b border-slate-800 mb-6 gap-2">
                  <button onClick={() => setAdminWheelType('money')} className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${adminWheelType === 'money' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Cấu Hình Vòng Quay Tiền</button>
                  <button onClick={() => setAdminWheelType('spin')} className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${adminWheelType === 'spin' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Cấu Hình Vòng Quay Lượt</button>
                </div>

                <button onClick={() => { setEditingWheel(null); setAdminWheelImage(null); setShowWheelModal(true); }} className="mb-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-emerald-600/20 transition-transform hover:scale-105"><PlusCircle size={18} /> Thêm Phần thưởng ({adminWheelType === 'money' ? 'Vòng Quay Tiền' : 'Vòng Quay Lượt'})</button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  {currentAdminWheelDb.map(w => (
                    <div key={w.id} className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-slate-800 border border-slate-600`}>
                          {w.image ? <img src={w.image} className="w-full h-full object-cover" /> : <Gift size={24} className="text-slate-500" />}
                        </div>
                        <div>
                          <p className="text-white font-bold">{w.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase flex gap-2">
                            <span>Loại: {w.type === 'money' ? 'Tiền' : w.type === 'spin' ? 'Lượt' : w.type === 'fund' ? 'Quỹ Thuê' : w.type === 'other' ? 'Khác' : 'Trượt'}</span>                               {w.value > 0 && <span className="text-emerald-400 font-bold">Giá trị: {new Intl.NumberFormat('vi-VN').format(w.value)}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <div className="flex-1 bg-slate-900 px-2 py-1.5 rounded text-xs text-blue-400 font-bold border border-slate-800 text-center">Tỉ lệ: {w.rate}</div>
                        <div className="flex-1 bg-slate-900 px-2 py-1.5 rounded text-xs text-emerald-400 font-bold border border-slate-800 text-center">Còn: {w.quantity ?? 999}</div>
                      </div>                        <div className="flex gap-2">
                        <button onClick={() => { setEditingWheel(w); setAdminWheelImage(w.image || null); setShowWheelModal(true); }} className="flex-1 py-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors"><Edit size={14} className="mx-auto" /></button>
                        <button onClick={() => {
                          setConfirmDialog({
                            title: 'Xoá phần thưởng', message: 'Xoá vật phẩm này khỏi vòng quay?', onConfirm: async () => {
                              // 1. Xóa trên Supabase
                              await supabase.from('wheel_items').delete().eq('id', w.id);

                              // 2. Xóa trên màn hình
                              if (adminWheelType === 'money') {
                                setWheelItemsMoneyDb(wheelItemsMoneyDb.filter(x => x.id !== w.id));
                              } else {
                                setWheelItemsSpinDb(wheelItemsSpinDb.filter(x => x.id !== w.id));
                              }
                              showToast("Đã xóa vật phẩm khỏi hệ thống!");
                            }
                          })
                        }} className="flex-1 py-1.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500 hover:text-white transition-colors"><Trash2 size={14} className="mx-auto" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-8 overflow-x-auto">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><History className="text-blue-500" /> Lịch Sử Khách Quay Trúng Thưởng</h3>
                  <div className="bg-[#0B1120] rounded-xl border border-slate-800 overflow-auto max-h-[500px] custom-scrollbar" onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    if (scrollTop + clientHeight >= scrollHeight - 20) setVisibleSpinsAdmin(prev => prev + 5);
                  }}>
                    {transactionsDb.filter(t => t.type === 'spin_win').length === 0 ? (
                      <div className="p-8 text-center text-slate-500">Chưa có ai quay trúng thưởng.</div>
                    ) : (
                      <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                          <tr><th className="p-4">Thời gian</th><th className="p-4">Khách hàng</th><th className="p-4">Phần thưởng trúng</th><th className="p-4 text-right">Giá trị quy đổi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {[...transactionsDb].filter(t => t.type === 'spin_win').sort((a, b) => getRecordTime(b) - getRecordTime(a)).slice(0, visibleSpinsAdmin).map((tx, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                              <td className="p-4 text-xs text-slate-400 font-mono">{tx.date}</td>
                              <td className="p-4 font-bold text-blue-400">{tx.user}</td>
                              <td className="p-4 text-white font-bold flex items-center gap-2"><Gift size={16} className="text-rose-500" /> {tx.action.replace('Trúng thưởng: ', '')}</td>
                              <td className="p-4 text-right font-black text-emerald-400">
                                {tx.amount === 0
                                  ? tx.status
                                  : (tx.isSpinCost ? `+${Math.abs(tx.amount)} Lượt` : `+${new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ`)
                                }
                              </td></tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* --- ADMIN MODALS --- */}

          {approveDepositModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm py-10">
              <div className="bg-[#151D2F] border border-emerald-500/50 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><CheckCircle2 /> Duyệt Lệnh Nạp</h3>
                  <button onClick={() => setApproveDepositModal(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="mb-4 text-sm text-slate-300 bg-[#0B1120] p-3 rounded-lg border border-slate-700">
                  <p>Khách: <strong className="text-white">{approveDepositModal.user}</strong></p>
                  <p>Số tiền báo: <strong className="text-blue-400">{new Intl.NumberFormat('vi-VN').format(approveDepositModal.amount)}đ</strong></p>
                  {approveDepositModal.bonusAmount > 0 && <p className="text-rose-400">Khuyến mãi voucher: +{new Intl.NumberFormat('vi-VN').format(approveDepositModal.bonusAmount)}đ</p>}
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (isProcessingAction) return;
                  isProcessingAction = true;
                  try {
                    const finalAmount = parseInt(e.target.finalAmount.value);
                    const bonusSpins = parseInt(e.target.bonusSpins.value || 0);
                    const targetModal = approveDepositModal;
                    setApproveDepositModal(null);

                    // Lấy Data sống của khách từ Database trước khi cộng tiền nạp
                    const { data: userToUpdate } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', targetModal.userId).single();
                    if (!userToUpdate) {
                      showToast("Lỗi: Không tìm thấy khách hàng!", "error");
                      return;
                    }

                    const newBalance = userToUpdate.balance + finalAmount;
                    const newSpins = (userToUpdate.spins || 0) + bonusSpins;

                    // 1. CỘNG TIỀN VÀO BẢNG USERS
                    const { error: userError } = await supabase
                      .from('users')
                      .update({ balance: newBalance, spins: newSpins })
                      .eq('id', targetModal.userId);

                    if (userError) {
                      showToast("Lỗi hệ thống khi cộng tiền: " + userError.message, 'error');
                      return;
                    }

                    // 2. SỬA TRẠNG THÁI ĐƠN NẠP THÀNH 'Thành công' TRÊN BẢNG deposit_requests
                    await supabase
                      .from('deposit_requests')
                      .update({ status: 'Thành công' })
                      .eq('id', targetModal.id);

                    // Cập nhật lại giao diện web
                    setDepositRequests(depositRequests.map(req => req.id === targetModal.id ? { ...req, status: 'Thành công' } : req));

                    // GHI LỊCH SỬ GIAO DỊCH
                    const newTx = {
                      id: `TX_WEB_${Date.now()}`,
                      user: userToUpdate.name || userToUpdate.phone || 'Khách Vô Danh',
                      action: `Nạp tiền (Duyệt qua Web)`,
                      amount: -Math.abs(finalAmount),
                      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                      status: 'Thành công',
                      type: 'deposit_manual',
                      accDetails: { balanceAfter: newBalance, fundAfter: userToUpdate.rentFund || 0 }
                    };
                    await supabase.from('transactions').insert([newTx]);
                    setTransactionsDb(prev => [newTx, ...prev]);

                    const updatedUsers = usersDb.map(u =>
                      u.id === targetModal.userId ? { ...u, balance: newBalance, spins: newSpins } : u
                    );
                    setUsersDb(updatedUsers);

                    if (currentUser && currentUser?.id === targetModal.userId) {
                      setCurrentUser({ ...currentUser, balance: newBalance, spins: newSpins });
                    }
                    // --- GỌI HÀM GỬI MAIL TỰ ĐỘNG CHO KHÁCH ---
                    if (userToUpdate && userToUpdate.email) {
                      sendDepositSuccessEmail(userToUpdate.email, userToUpdate.name, finalAmount);
                    }
                    // -----------------------------------------

                    // --- CẬP NHẬT TIN NHẮN TELEGRAM (Xóa nút Duyệt/Từ chối, đổi thành "Đã duyệt") ---
                    supabase.functions.invoke('telegram-bot', {
                      body: { type: 'web_approved', requestId: targetModal.id }
                    }).catch(err => console.error("Lỗi cập nhật Telegram:", err));
                    // ---------------------------------------------------------------------------------

                    showToast(`Đã cộng ${new Intl.NumberFormat('vi-VN').format(finalAmount)}đ và ${bonusSpins} lượt quay!`);
                  } finally { isProcessingAction = false; }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs text-emerald-400 font-bold block mb-1">Số Tiền Thực Cộng (VNĐ)</label>
                    <input name="finalAmount" type="number" defaultValue={approveDepositModal.amount + (approveDepositModal.bonusAmount || 0)} className="w-full p-3 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-bold outline-none focus:border-emerald-400" required />
                  </div>
                  <div>
                    <label className="text-xs text-rose-400 font-bold block mb-1">Thưởng thêm Lượt Quay (Tự động tính + Voucher)</label>
                    <input name="bonusSpins" type="number" defaultValue={Math.floor(approveDepositModal.amount / depositBonusConfig.minAmount) * depositBonusConfig.bonusSpins + (approveDepositModal.voucherSpins || 0)} className="w-full p-3 bg-[#0B1120] border border-rose-500/50 rounded-lg text-rose-400 font-bold outline-none focus:border-rose-400" />
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      Gợi ý: Mốc nạp tặng {Math.floor(approveDepositModal.amount / depositBonusConfig.minAmount) * depositBonusConfig.bonusSpins} lượt
                      {approveDepositModal.voucherSpins > 0 ? ` + Voucher tặng ${approveDepositModal.voucherSpins} lượt` : ''}.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setApproveDepositModal(null)} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors">Hủy</button>
                    <button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors">Xác Nhận Cộng</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Edit Rent Time (ADMIN) */}
          {editRentModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#151D2F] border border-blue-500/50 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="text-blue-500" /> Sửa Thời Gian Thuê</h3>
                  <button onClick={() => setEditRentModal(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="mb-4 text-sm bg-[#0B1120] p-3 rounded-lg border border-slate-700">
                  <p className="text-slate-400">Khách thuê: <strong className="text-white">{editRentModal.req.user}</strong></p>
                  <p className="text-slate-400 mt-1">Nick mã: <strong className="text-rose-400">{editRentModal.req.accCode}</strong></p>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (isProcessingAction) return;
                  isProcessingAction = true;
                  try {
                    const action = e.target.actionType.value;
                    const targetModal = editRentModal;
                    setEditRentModal(null);
                    if (action === 'stop') {
                      const acc = targetModal.acc;
                      const currentReq = targetModal.req;

                      // 1. Lấy Data sống từ Database để tính toán số dư chính xác
                      const { data: targetUser } = await supabase.from('users').select('id, name, phone, email, balance, spins, rentFund, role, is_trusted, is_cccd_verified, is_email_verified, avatar_url, last_active, is_locked, cccd_number, created_at').eq('id', currentReq.userId).single();
                      if (!targetUser) return showToast("Lỗi: Không tìm thấy data khách hàng để hoàn tiền!", "error");

                      const nowTime = Date.now();
                      const startTime = acc.rentStartedAt || nowTime;
                      const endTime = acc.rentedUntil;

                      // 2. CÔNG THỨC QUY ĐỔI GIỜ (Y hệt sảnh khách)
                      const totalHours = (endTime - startTime) / 3600000;
                      const usedHours = (nowTime - startTime) / 3600000;
                      const deducted = Math.max(2, usedHours); // Khấu trừ tối thiểu 2h
                      let savedHours = totalHours - deducted;
                      if (savedHours < 0) savedHours = 0;

                      // 3. Tính tiền quỹ hoàn trả
                      const refundAmount = currentReq.info?.depositAmount || 0;
                      const selectedOption = acc.rentOptions?.find(opt => opt.time === currentReq.time);
                      const paidPrice = selectedOption ? selectedOption.price : (acc.rentPricePerHour * totalHours);
                      const effectiveHourlyRate = totalHours > 0 ? (paidPrice / totalHours) : 0;
                      const savedMoney = Math.floor(savedHours * effectiveHourlyRate);

                      // 4. Cập nhật DATABASE (Supabase)
                      // - Trả Acc về trạng thái trống
                      await supabase.from('accounts').update({ rentedUntil: null, rentStartedAt: null, currentRenterId: null }).eq('id', acc.id);
                      // - Đổi trạng thái đơn thuê
                      await supabase.from('rent_requests').update({ status: 'Đã trả acc' }).eq('id', currentReq.id);
                      // - Hoàn tiền vào Quỹ và Ví cho khách
                      const newFund = (targetUser.rentFund || 0) + savedMoney;
                      const newBalance = targetUser.balance + refundAmount;
                      await supabase.from('users').update({ rentFund: newFund, balance: newBalance }).eq('id', targetUser.id);

                      // 5. Ghi Lịch sử Giao dịch cho khách dễ theo dõi
                      const newTxs = [];
                      if (refundAmount > 0) {
                        newTxs.push({
                          id: `TX${Date.now()}1`, user: targetUser.name,
                          action: `Admin thu hồi & Hoàn cọc nick ${acc.code}`, amount: -refundAmount,
                          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                          status: 'Thành công', type: 'deposit_refund'
                        });
                      }
                      if (savedMoney > 0) {
                        newTxs.push({
                          id: `TX${Date.now()}2`, user: targetUser.name,
                          action: `Admin quy đổi ${savedHours.toFixed(1)}h dư (Nick ${acc.code}) vào Quỹ Thuê`, amount: -savedMoney,
                          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                          status: 'Thành công', type: 'fund_add',
                          accDetails: { balanceAfter: newBalance, fundAfter: newFund }
                        });
                      }
                      if (newTxs.length > 0) {
                        await supabase.from('transactions').insert(newTxs);
                        setTransactionsDb(prev => [...newTxs, ...prev]);
                      }

                      // 6. Cập nhật GIAO DIỆN (RAM)
                      setAccountsDb(accountsDb.map(a => a.id === acc.id ? { ...a, rentedUntil: null, currentRenterId: null, rentStartedAt: null } : a));
                      setRentRequests(rentRequests.map(r => r.id === currentReq.id ? { ...r, status: 'Đã trả acc' } : r));
                      setUsersDb(usersDb.map(u => u.id === targetUser.id ? { ...u, rentFund: newFund, balance: newBalance } : u));

                      // Nếu Admin đang dùng acc Admin để test thuê luôn
                      if (currentUser.id === targetUser.id) {
                        setCurrentUser({ ...currentUser, rentFund: newFund, balance: newBalance });
                      }

                      showToast(`Đã thu hồi & Hoàn ${new Intl.NumberFormat('vi-VN').format(savedMoney)}đ vào quỹ cho khách!`);
                    } else {
                      const addHours = parseInt(e.target.addHours.value) || 0;
                      const addMins = parseInt(e.target.addMins.value) || 0;
                      const extraMs = (addHours * 3600000) + (addMins * 60000);
                      const newRentedUntil = (targetModal.acc.rentedUntil || Date.now()) + extraMs;

                      // Lưu lên Supabase
                      await supabase.from('accounts').update({ rentedUntil: newRentedUntil }).eq('id', targetModal.acc.id);

                      // Cập nhật UI
                      setAccountsDb(accountsDb.map(a => a.id === targetModal.acc.id ? { ...a, rentedUntil: newRentedUntil } : a));
                      showToast(`Đã cộng thêm ${addHours} giờ ${addMins} phút vào thời gian thuê!`);
                    }
                  } catch (e) { console.error(e); } finally { isProcessingAction = false; }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-2">Hành động</label>
                    <select name="actionType" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500 font-bold"
                      onChange={(e) => { document.getElementById('timeInputGroup').style.display = e.target.value === 'add' ? 'flex' : 'none'; }}
                    >
                      <option value="add">Thuê tiếp (Cộng thêm thời gian)</option>
                      <option value="stop">Ngừng thuê (Kết thúc ngay lập tức)</option>
                    </select>
                  </div>
                  <div id="timeInputGroup" className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 font-bold block mb-1">Cộng thêm Giờ</label>
                      <input name="addHours" type="number" defaultValue="0" min="-24" max="24" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 font-bold block mb-1">Cộng thêm Phút</label>
                      <input name="addMins" type="number" defaultValue="0" min="-60" max="60" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Lưu Thay Đổi</button>
                </form>
              </div>
            </div>
          )}

          {/* Modal User Edit */}
          {showUserModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><User className="text-blue-500" /> Thông tin khách hàng</h3>
                    {editingUser && (
                      <button type="button" onClick={() => { setShowUserModal(false); setActiveChatUser(editingUser); setAdminTab('messages'); setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }} className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors shadow-sm border border-emerald-500/30" title="Nhắn tin cho khách này">
                        <MessageCircle size={14} /> Nhắn tin
                      </button>
                    )}
                  </div>
                  <button type="button" onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
                  <form onSubmit={handleSaveUser} className="space-y-4">
                    <div><label className="text-xs text-slate-400">Tên</label><input name="name" defaultValue={editingUser?.name} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white" required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs text-slate-400">Số ĐT</label><input name="phone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} defaultValue={editingUser?.phone} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white" title="Nhập 10-11 số" required /></div>
                      <div><label className="text-xs text-slate-400">Mật khẩu (Đã bảo mật)</label><input type="password" disabled value="********" className="w-full mt-1 p-3 bg-[#0B1120]/50 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed" title="Chuẩn bảo mật: Admin không thể xem hoặc sửa mật khẩu của khách" /></div>                  </div>
                    <div><label className="text-xs text-slate-400">Email</label><input name="email" defaultValue={editingUser?.email} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white" required />
                      {/* --- KHU VỰC HIỂN THỊ CCCD CỦA KHÁCH --- */}
                      <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 mt-4">
                        <label className="block text-sm font-medium text-slate-400 mb-3"><ShieldCheck size={16} className="inline text-emerald-400 mb-1" /> Ảnh CCCD xác minh</label>

                        {editingUser?.is_cccd_verified || editingUser?.cccd_number ? (
                          <div className="flex flex-col items-center gap-4">
                            <button
                              type="button"
                              onClick={async () => {
                                showToast('Đang tải ảnh từ máy chủ...', 'info');
                                const { data } = await supabase.from('users').select('cccd_image').eq('id', editingUser.id).single();
                                if (data?.cccd_image) setFullScreenImage(data.cccd_image);
                                else showToast('Khách hàng này chưa tải ảnh CCCD!', 'error');
                              }}
                              className="w-full py-3 bg-rose-600/20 text-rose-400 font-bold border border-rose-600/30 rounded hover:bg-rose-600/30 transition-colors flex items-center justify-center gap-2 shadow-inner"
                            >
                              <ImageIcon size={18} /> Xem ảnh CCCD gốc
                            </button>

                            {/* Nút tùy chọn để Admin đánh dấu đã duyệt */}
                            <div className="flex items-center gap-3 mt-1 w-full p-3 bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
                              <input
                                type="checkbox"
                                name="is_cccd_verified"
                                defaultChecked={editingUser.is_cccd_verified || false}
                                className="w-5 h-5 rounded cursor-pointer accent-blue-500"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm text-slate-300 font-bold">Đánh dấu đã xác minh CCCD hợp lệ</span>
                                <span className="text-[10px] text-slate-500">Khách sẽ không phải up ảnh ở các lần thuê sau.</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed border-slate-700 bg-slate-900 rounded-lg">
                            <p className="text-sm text-slate-500 italic">Người dùng này chưa cập nhật CCCD.</p>
                          </div>
                        )}
                      </div></div>
                    <div className="grid grid-cols-4 gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                      <div>
                        <label className="text-[10px] text-emerald-400 font-bold block mb-1">Số Dư (VNĐ)</label>
                        <input name="balance" type="number" defaultValue={editingUser?.balance} className="w-full p-2 bg-[#0B1120] border border-slate-600 rounded text-emerald-400 font-bold outline-none" required />
                      </div>
                      <div>
                        <label className="text-[10px] text-rose-400 font-bold block mb-1">Lượt quay</label>
                        <input name="spins" type="number" defaultValue={editingUser?.spins || 0} className="w-full p-2 bg-[#0B1120] border border-slate-600 rounded text-rose-400 font-bold outline-none" required />
                      </div>
                      {/* BẮT ĐẦU ĐOẠN CODE THÊM MỚI */}
                      <div>
                        <label className="text-[10px] text-yellow-400 font-bold block mb-1">Quỹ Thuê</label>
                        <input name="rentFund" type="number" defaultValue={editingUser?.rentFund || 0} className="w-full p-2 bg-[#0B1120] border border-slate-600 rounded text-yellow-400 font-bold outline-none" required />
                      </div>
                      {/* KẾT THÚC ĐOẠN CODE THÊM MỚI */}
                      <div>
                        <label className="text-[10px] text-blue-400 font-bold block mb-1">Quyền</label>
                        <select name="role" defaultValue={editingUser?.role} className="w-full p-2 bg-[#0B1120] border border-slate-600 rounded text-blue-400 font-bold outline-none">
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      {/* TÍCH CHỌN KHÁCH QUEN NẰM Ở ĐÂY */}
                      <div className="col-span-4 mt-1 border-t border-slate-700 pt-2">
                        <label className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg cursor-pointer hover:bg-emerald-500/20 transition-colors shadow-inner">
                          <input type="checkbox" name="is_trusted" defaultChecked={editingUser?.is_trusted} className="w-5 h-5 accent-emerald-500 cursor-pointer" />
                          <span className="text-sm font-bold text-emerald-400">Đánh dấu là Khách Quen (Miễn nạp cọc & CCCD)</span>
                        </label>
                      </div>
                    </div>                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(15,23,42,0.8)]">Lưu Thay Đổi</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Modal Account */}
          {showAccModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm py-10">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0 bg-[#151D2F] z-10">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Gamepad2 className="text-blue-500" /> {editingAccount ? 'Chỉnh sửa Nick' : 'Đăng bán Nick mới'}</h3>
                  <button onClick={() => setShowAccModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  <form onSubmit={handleSaveAccount} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-xs text-slate-400 font-bold">Tên Game</label><input name="game" defaultValue={getGameInfo(editingAccount?.game).name} placeholder="VD: Liên Quân, Valorant..." className="w-full mt-1.5 p-3 bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none rounded-lg text-white" required /></div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold">Avatar Game (Không bắt buộc)</label>
                      <div className="flex gap-2 items-center mt-1.5">
                        {adminAccGameAvatar && <img src={adminAccGameAvatar} className="w-10 h-10 rounded shadow-md object-cover border border-slate-600 shrink-0" />}
                        <input type="file" accept="image/*" onChange={handleAccGameAvatarUpload} className="w-full p-2 bg-[#0B1120] border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <div><label className="text-xs text-slate-400 font-bold">Mã Nick</label><input name="code" defaultValue={editingAccount?.code} placeholder="VD: 12345" className="w-full mt-1.5 p-3 bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none rounded-lg text-white" required /></div>
                    <div><label className="text-xs text-slate-400 font-bold">Số lượng tồn kho</label><input name="stock" type="number" min="0" defaultValue={editingAccount?.stock !== undefined ? editingAccount.stock : 1} placeholder="VD: 1" className="w-full mt-1.5 p-3 bg-[#0B1120] border border-slate-700 focus:border-emerald-500 outline-none rounded-lg text-emerald-400 font-bold" required /></div>

                    {/* CHÈN THÊM Ô PHÂN LOẠI ACC (TIER) Ở ĐÂY */}
                    <div className="md:col-span-2">
                      <label className="text-xs text-slate-400 font-bold">Phân loại Đẳng cấp (Tier)</label>
                      <select name="tier" defaultValue={editingAccount?.tier || 'VIP'} className="w-full mt-1.5 p-3 bg-[#0B1120] border border-yellow-500/50 focus:border-yellow-400 outline-none rounded-lg text-yellow-500 font-bold">
                        <option value="VIP">Tài khoản VIP (Thường)</option>
                        <option value="SVIP">Tài khoản SUPER VIP (Cao cấp)</option>
                        <option value="ULVIP">Tài khoản ULTRA VIP (Đỉnh cao)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2"><label className="text-xs text-slate-400 font-bold">Tiêu đề (Giật tít)</label><textarea name="title" defaultValue={editingAccount?.title} placeholder="Đột Kích Mã 02&#10;(Chuyên Zombie & C4)" rows="2" className="w-full mt-1.5 p-3 bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none rounded-lg text-white resize-none" required></textarea></div>
                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
                      <label className="flex-1 flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg cursor-pointer transition-colors hover:bg-amber-500/20 shadow-inner">
                        <input type="checkbox" name="isFeatured" defaultChecked={getGameInfo(editingAccount?.game).isFeatured || false} className="w-5 h-5 accent-amber-500 cursor-pointer" />
                        <span className="text-sm font-bold text-amber-500">🔥 Dịch vụ Nổi Bật</span>
                      </label>
                      <div className="flex-1 flex flex-col gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg shadow-inner">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" name="allowQuantity" defaultChecked={getGameInfo(editingAccount?.game).allowQuantity || false} className="w-5 h-5 accent-blue-500 cursor-pointer" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-blue-400">Cho phép mua nhiều</span>
                            <span className="text-[10px] text-slate-400">Khách tự điền số lượng mua</span>
                          </div>
                        </label>
                        <div className="flex items-center justify-between gap-2 border-t border-blue-500/20 pt-2">
                          <span className="text-[11px] font-bold text-slate-300">Giới hạn 1 lần mua:</span>
                          <input type="number" name="maxQuantityPerOrder" min="0" defaultValue={getGameInfo(editingAccount?.game).maxQuantityPerOrder || 0} placeholder="0 = Tối đa Tồn Kho" className="w-24 p-1.5 bg-[#0B1120] border border-blue-500/50 rounded text-xs text-white font-bold outline-none focus:border-blue-400 text-center" />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2"><label className="text-xs text-slate-400 font-bold">Tags nổi bật (Cách bằng dấu phẩy)</label><input name="tags" defaultValue={Array.isArray(editingAccount?.tags) ? editingAccount.tags.join(', ') : (editingAccount?.tags || '')} placeholder="VD: Rank Cao Thủ, Trắng TT, 120 Skin" className="w-full mt-1.5 p-3 bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none rounded-lg text-white" required /></div>

                    {/* UPLOAD ẢNH */}
                    <div className="md:col-span-2 bg-slate-800/30 p-5 rounded-xl border border-slate-700 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2"><Upload size={16} className="text-blue-400" /> Quản lý Hình ảnh</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-dashed border-slate-500 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors relative group">
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          {adminCoverImage ? <div className="relative"><img src={adminCoverImage} className="w-full h-32 object-cover rounded-lg mb-2 shadow-md" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-bold transition-opacity rounded-lg">Đổi Ảnh Khác</div></div> : <div className="h-32 flex flex-col items-center justify-center text-slate-400 mb-2 bg-slate-900 rounded-lg"><ImageIcon size={30} className="mb-2 text-slate-500" /><span className="text-xs">Bấm để tải Ảnh Bìa lên</span></div>}
                          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-500/20">Ảnh Bìa Chính (1 ảnh)</span>
                        </div>
                        <div className="border border-dashed border-slate-500 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors relative">
                          <input type="file" accept="image/*" multiple onChange={(e) => handleFileUpload(e, false)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Tải ảnh phụ" />
                          {adminDetailImages.length > 0 ? (
                            <div className="flex gap-2 h-32 overflow-x-auto custom-scrollbar mb-2 relative z-20 pb-2">
                              {adminDetailImages.map((img, i) => (
                                <div key={i} className="relative flex-shrink-0 w-32 h-full group">
                                  <img src={img} className="w-full h-full object-cover rounded-lg shadow-md" />
                                  <button type="button" onClick={() => setAdminDetailImages(adminDetailImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full z-30 hover:bg-rose-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                </div>
                              ))}
                              <div className="flex-shrink-0 w-20 h-full border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-500 pointer-events-none bg-slate-900/50"><Plus size={24} /></div>
                            </div>
                          ) : <div className="h-32 flex flex-col items-center justify-center text-slate-400 mb-2 bg-slate-900 rounded-lg"><ImageIcon size={30} className="mb-2 text-slate-500" /><span className="text-xs">Bấm để tải nhiều Ảnh Phụ</span></div>}
                          <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">Ảnh Phụ (nhiều ảnh)</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-3 bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20 h-fit shadow-xl">
                        <div>
                          <label className="text-[11px] text-emerald-400 font-bold mb-2 flex items-center gap-1 whitespace-nowrap"><Wallet size={14} /> GIÁ BÁN GỐC</label>
                          <input name="basePrice" type="number" defaultValue={editingAccount ? (editingAccount.oldPrice || editingAccount.price) : ''} placeholder="Ví dụ: 500000" className="w-full p-3 bg-[#0B1120] border border-emerald-500/50 focus:border-emerald-400 outline-none rounded-lg text-emerald-400 font-black text-sm shadow-inner" required />
                        </div>
                        <div>
                          <label className="text-[11px] text-rose-400 font-bold mb-2 flex items-center gap-1 whitespace-nowrap"><Wallet size={14} /> GIÁ BÁN GIẢM</label>
                          <input name="discountedPrice" type="number" defaultValue={editingAccount?.oldPrice ? editingAccount.price : ''} placeholder="Giá giảm..." className="w-full p-3 bg-[#0B1120] border border-rose-500/50 focus:border-rose-400 outline-none rounded-lg text-rose-400 font-black text-sm shadow-inner" />
                        </div>
                        <div className="col-span-2 border-t border-emerald-500/20 my-1"></div>
                        <div>
                          <label className="text-[11px] text-blue-400 font-bold mb-2 flex items-center gap-1 whitespace-nowrap"><Clock size={14} /> GIÁ THUÊ/GIỜ</label>
                          <input id="baseRentPriceInput" name="baseRentPrice" type="number" defaultValue={editingAccount ? (editingAccount.oldRentPrice || editingAccount.rentPricePerHour) : 0} placeholder="Ví dụ: 10000" className="w-full p-3 bg-[#0B1120] border border-blue-500/50 focus:border-blue-400 outline-none rounded-lg text-blue-400 font-black text-sm shadow-inner transition-colors" onChange={(e) => {
                            const baseVal = parseFloat(e.target.value) || 0;
                            const percentInput = document.getElementById('rentDiscountPercentInput');
                            const discountInput = document.getElementById('discountedRentPriceInput');
                            if (percentInput && discountInput) {
                              const percent = parseFloat(percentInput.value) || 0;
                              if (percent > 0 && baseVal > 0) {
                                discountInput.value = baseVal - Math.floor(baseVal * (percent / 100));
                              }
                            }
                          }} />
                        </div>
                        <div>
                          <label className="text-[11px] text-rose-400 font-bold mb-2 flex items-center gap-1 whitespace-nowrap"><Clock size={14} /> GIÁ THUÊ GIẢM</label>
                          <input id="discountedRentPriceInput" name="discountedRentPrice" type="number" defaultValue={editingAccount?.oldRentPrice ? editingAccount.rentPricePerHour : ''} placeholder="Giá giảm..." className="w-full p-3 bg-[#0B1120] border border-rose-500/50 focus:border-rose-400 outline-none rounded-lg text-rose-400 font-black text-sm shadow-inner transition-colors" />
                        </div>
                        <div className="col-span-2 border-t border-emerald-500/20 my-1"></div>
                        <div className="col-span-2">
                          <label className="text-[11px] text-rose-400 font-bold mb-2 uppercase flex items-center gap-1"><Wallet size={14} /> Giảm giá các gói thuê chung (%)</label>
                          <input id="rentDiscountPercentInput" name="rentDiscountPercent" type="number" min="0" max="100" defaultValue={editingAccount?.rentDiscountPercent || ''} placeholder="VD: 10 (Sẽ giảm 10% cho MỌI gói thuê bên dưới)" className="w-full p-3 bg-[#0B1120] border border-rose-500/50 focus:border-rose-400 outline-none rounded-lg text-rose-400 font-black text-sm shadow-inner transition-colors" onChange={(e) => {
                            const percent = parseFloat(e.target.value) || 0;
                            const baseInput = document.getElementById('baseRentPriceInput');
                            const discountInput = document.getElementById('discountedRentPriceInput');
                            if (baseInput && discountInput) {
                              const baseVal = parseFloat(baseInput.value) || 0;
                              if (percent > 0 && baseVal > 0) {
                                discountInput.value = baseVal - Math.floor(baseVal * (percent / 100));
                              } else if (percent === 0) {
                                discountInput.value = '';
                              }
                            }
                          }} />
                        </div>
                      </div>
                      <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/30">
                        <div className="flex justify-between items-center mb-3 border-b border-blue-500/20 pb-2">
                          <label className="text-sm text-blue-400 font-bold flex items-center gap-2"><Clock size={16} /> CÁC GÓI THUÊ</label>
                          <button type="button" onClick={() => setAdminRentOptions([...adminRentOptions, { time: '', bonusTime: '', price: '' }])} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors"><Plus size={14} /> Thêm gói</button>
                        </div>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {adminRentOptions.map((opt, index) => (
                            <div key={index} className="flex gap-2 items-center bg-[#0B1120] p-2 rounded-lg border border-slate-700">
                              <input type="text" placeholder="Giờ thuê" value={opt.time} onChange={e => { const n = [...adminRentOptions]; n[index].time = e.target.value; setAdminRentOptions(n) }} className="w-[30%] p-2 bg-transparent outline-none text-xs text-white" title="VD: 2 Giờ" />
                              <div className="w-[1px] h-6 bg-slate-700"></div>
                              <input type="text" placeholder="Tặng thêm" value={opt.bonusTime || ''} onChange={e => { const n = [...adminRentOptions]; n[index].bonusTime = e.target.value; setAdminRentOptions(n) }} className="w-[30%] p-2 bg-transparent outline-none text-xs text-emerald-400" title="VD: 30 Phút hoặc 1 Giờ" />
                              <div className="w-[1px] h-6 bg-slate-700"></div>
                              <input type="number" placeholder="Giá (đ)" value={opt.price} onChange={e => { const n = [...adminRentOptions]; n[index].price = e.target.value; setAdminRentOptions(n) }} className="w-[30%] p-2 bg-transparent outline-none text-xs text-white font-bold" />
                              <button type="button" onClick={() => setAdminRentOptions(adminRentOptions.filter((_, i) => i !== index))} className="w-[10%] text-slate-500 hover:text-rose-500 flex justify-center transition-colors"><X size={18} /></button>
                            </div>
                          ))}
                          {adminRentOptions.length === 0 && <p className="text-xs text-slate-500 italic text-center py-2">Không có gói thuê nào. Nick chỉ được bán đứt.</p>}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-rose-900/10 p-5 rounded-xl border border-rose-500/30">
                      <p className="text-sm font-bold text-rose-400 mb-4 flex items-center gap-2"><Key size={16} /> Tài khoản & Mật khẩu Game (Bảo mật)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-400 mb-1 block">Tài khoản đăng nhập</label>
                          <input name="accUsername" defaultValue={editingAccount?.accUsername} placeholder="Tài khoản..." className="w-full p-3 bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none rounded-lg text-white font-mono" required />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 mb-1 block">Mật khẩu</label>
                          <input name="accPassword" defaultValue={editingAccount?.accPassword} placeholder="Mật khẩu..." className="w-full p-3 bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none rounded-lg text-white font-mono" required />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 mb-1 block">Email (Nếu có)</label>
                          <input name="accEmail" defaultValue={editingAccount?.accEmail} placeholder="VD: lienquan@gmail.com" className="w-full p-3 bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none rounded-lg text-white font-mono" />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 mb-1 block">SĐT (Nếu có)</label>
                          <input name="accPhone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} defaultValue={editingAccount?.accPhone} placeholder="VD: 0912345678" className="w-full p-3 bg-[#0B1120] border border-slate-700 focus:border-rose-500 outline-none rounded-lg text-white font-mono" />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2"><label className="text-xs text-slate-400 font-bold block mb-1">Mô tả chi tiết</label><textarea name="desc" defaultValue={editingAccount?.description} placeholder="Viết vài dòng mô tả chi tiết về nick này để khách dễ chọn..." rows="4" className="w-full p-3 bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none rounded-xl text-white resize-none" required></textarea></div>

                    <div className="md:col-span-2 flex gap-4 mt-6">
                      <button type="button" onClick={() => setShowAccModal(false)} disabled={isGlobalProcessing} className={`w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors ${isGlobalProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>Hủy Bỏ</button>
                      <button type="submit" disabled={isGlobalProcessing} className={`w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2 ${isGlobalProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {isGlobalProcessing ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {isGlobalProcessing ? 'Đang lưu dữ liệu...' : 'Hoàn Tất Lưu'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {showVoucherModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Ticket className="text-rose-500" /> {editingVoucher ? 'Sửa Voucher' : 'Tạo Voucher Khuyến Mãi'}</h3>
                  <button onClick={() => setShowVoucherModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveVoucher} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Mã Voucher (Ghi Liền, Không Dấu)</label>
                    <input name="code" defaultValue={editingVoucher?.code} placeholder="VD: TET2024" className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-rose-400 font-bold uppercase outline-none focus:border-rose-500" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Phần Trăm Khuyến Mãi (%)</label>
                    <input name="percent" type="number" defaultValue={editingVoucher ? editingVoucher.percent : 0} placeholder="VD: 0" min="0" max="100" className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500" required />
                  </div><div>
                    <label className="text-xs text-slate-400 font-bold">Tặng thêm Lượt Quay (Spins)</label>
                    <input name="bonusSpins" type="number" defaultValue={editingVoucher?.bonusSpins || 0} placeholder="VD: 5" min="0" className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500" required />
                  </div>
                  {/* --- 2 Ô GIỚI HẠN VOUCHER THÊM VÀO ĐÂY --- */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Tổng lượt (0 = Vô hạn)</label>
                      <input name="usageLimit" type="number" defaultValue={editingVoucher?.usageLimit || 0} min="0" className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500" required />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold">Lượt / 1 Khách</label>
                      <input name="userLimit" type="number" defaultValue={editingVoucher?.userLimit || 1} min="1" className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Trạng thái</label>
                    <select name="isActive" defaultValue={editingVoucher ? editingVoucher.isActive : 'true'} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500">
                      <option value="true">Đang Bật (Hoạt động)</option>
                      <option value="false">Tắt (Ngưng dùng)</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Lưu Voucher</button>
                </form>
              </div>
            </div>
          )}

          {viewUserHistory && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0B1120] rounded-t-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><History className="text-indigo-500" /> Lịch sử khách: {viewUserHistory.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">SĐT: {viewUserHistory.phone} - Email: {viewUserHistory.email}</p>
                  </div>
                  <button onClick={() => setViewUserHistory(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={20} /></button>
                </div>
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                  {transactionsDb.filter(t => t.user === viewUserHistory.name && !t.isSpinCost && !(t.type === 'spin_win' && t.amount === 0)).length === 0 ? (
                    <div className="text-center text-slate-500 py-10">Khách hàng chưa có giao dịch bằng tiền nào.</div>
                  ) : (
                    <div className="space-y-3">
                      {transactionsDb.filter(t => t.user === viewUserHistory.name && !t.isSpinCost && !(t.type === 'spin_win' && t.amount === 0)).map((tx, idx) => (
                        <div key={idx} className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                          <div className="flex justify-between items-start md:items-center w-full">
                            <div>
                              <p className="font-bold text-white text-sm">{tx.action}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{tx.date}</p>

                              {/* --- THÊM ĐOẠN NÀY CHO ADMIN XEM SỐ DƯ --- */}
                              {tx.accDetails && tx.accDetails.balanceAfter !== undefined && (
                                <div className="flex items-center gap-1.5 mt-1 bg-slate-800/40 w-fit px-2 py-0.5 rounded border border-slate-700/50">
                                  <span className="text-[9px] text-slate-400">Số dư:</span>
                                  <span className="text-[9px] font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.balanceAfter)}đ</span>
                                  {tx.accDetails.fundAfter !== undefined && (
                                    <>
                                      <span className="text-slate-600 ml-1">|</span>
                                      <span className="text-[9px] text-slate-400 ml-1">Quỹ:</span>
                                      <span className="text-[9px] font-bold text-yellow-400">{new Intl.NumberFormat('vi-VN').format(tx.accDetails.fundAfter)}đ</span>
                                    </>
                                  )}
                                </div>
                              )}
                              {/* ----------------------------------------- */}
                            </div>
                            <div className="text-left md:text-right">
                              <p className={`font-black text-sm ${tx.amount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {tx.isSpinCost ?
                                  `${tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount)} Lượt`
                                  :
                                  `${tx.amount > 0 ? '-' : '+'}${new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ`
                                }
                              </p>
                              <div className="flex items-center justify-start md:justify-end gap-2 mt-1">
                                <p className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded 
                                   ${tx.status.includes('Hoàn tác') ? 'text-slate-400 bg-slate-800 border border-slate-700'
                                    : tx.status.includes('+') || tx.status === 'Thành công' || tx.status === 'Hoàn thành' ? 'text-emerald-500 bg-emerald-500/10'
                                      : tx.status === 'Đang cày' ? 'text-blue-400 bg-blue-500/10'
                                        : tx.status === 'Chờ xử lý' ? 'text-yellow-500 bg-yellow-500/10'
                                          : 'text-blue-400 bg-blue-500/10'}`}>
                                  {tx.status}
                                </p>

                                {/* NÚT HOÀN TÁC */}
                                {!tx.status.includes('Hoàn tác') && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleUndoTransaction(tx, viewUserHistory); }}
                                    className="text-[10px] bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 font-bold border border-rose-500/20 shadow-sm"
                                    title="Hoàn trả tiền/lượt của GD này"
                                  >
                                    <RefreshCw size={10} /> Hoàn tác
                                  </button>
                                )}
                              </div>                             </div>
                          </div>

                          {tx.type === 'buy_acc' && tx.accDetails && (
                            <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs bg-slate-900/50 p-2 rounded-lg">
                              <div><span className="text-slate-500">TK Game:</span> <span className="text-emerald-400 font-mono font-bold">{tx.accDetails.username}</span></div>
                              <div><span className="text-slate-500">MK Game:</span> <span className="text-emerald-400 font-mono font-bold">{tx.accDetails.password}</span></div>
                              <div><span className="text-slate-500">Email:</span> <span className="text-white">{tx.accDetails.email}</span></div>
                              <div><span className="text-slate-500">SĐT:</span> <span className="text-white">{tx.accDetails.phone}</span></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showBoostingModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-md md:max-w-3xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Target className="text-blue-500" /> {editingBoosting ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Cày Thuê'}</h3>
                  <button onClick={() => setShowBoostingModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveBoosting}>
                  <div className="md:grid md:grid-cols-2 md:gap-6">
                    {/* === CỘT TRÁI === */}
                    <div className="space-y-4">
                      {/* --- KHU VỰC UP ẢNH CÀY THUÊ CÓ NÚT X --- */}
                      <div>
                        <label className="text-xs text-slate-400 font-bold">Ảnh mô tả dịch vụ (Tùy chọn)</label>
                        <div className="mt-1 border border-dashed border-slate-600 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors relative group bg-[#0B1120]">
                          <input type="file" accept="image/*" multiple onChange={handleBoostingImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          {adminBoostingImage && adminBoostingImage.length > 0 ? (
                            <div className="relative z-20 grid grid-cols-2 md:grid-cols-3 gap-2">
                              {adminBoostingImage.map((img, idx) => (
                                <div key={idx} className="relative">
                                  <img src={img} className="mx-auto h-24 object-cover rounded-lg shadow-md w-full" alt="Preview" />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAdminBoostingImage(prev => prev.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-lg transition-colors z-30" title="Xóa ảnh này"><X size={12} /></button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-500 flex flex-col items-center"><ImageIcon size={28} className="mb-2" /><span className="text-[10px] font-bold">Bấm hoặc Kéo thả nhiều ảnh</span></div>
                          )}
                        </div>
                      </div>

                      {/* CHỌN LOẠI CÀY VÀ TÊN GAME */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Cày gì?</label>
                          <select name="boostType" value={adminBoostType} onChange={(e) => setAdminBoostType(e.target.value)} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500">
                            <option value="rank">Cày Rank</option>
                            <option value="event">Cày Sự Kiện</option>
                          </select>
                        </div>
                        {/* LUÔN HIỆN Ô TÊN GAME CHO CẢ 2 LOẠI */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Tên Game</label>
                          <input name="game" value={adminGame} onChange={(e) => setAdminGame(e.target.value)} placeholder="VD: Liên Quân, Tốc Chiến..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required />
                        </div>
                        {/* ẢNH AVATAR GAME */}
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Avatar Game (Icon)</label>
                          <div className="flex gap-2 items-center">
                            {adminGameAvatar && <img src={adminGameAvatar} className="w-10 h-10 rounded shadow-md object-cover border border-slate-600 shrink-0" />}
                            <input type="file" accept="image/*" onChange={handleGameAvatarUpload} className="w-full p-2 bg-[#0B1120] border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-blue-500" />
                          </div>
                        </div>
                      </div>

                      <label className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg cursor-pointer transition-colors hover:bg-amber-500/20 mt-4 mb-2 shadow-inner">
                        <input type="checkbox" name="isFeatured" defaultChecked={getGameInfo(editingBoosting?.game).isFeatured || false} className="w-5 h-5 accent-amber-500 cursor-pointer" />
                        <span className="text-sm font-bold text-amber-500">🔥 Dịch vụ Nổi Bật (Ưu tiên hiển thị sảnh trang chủ)</span>
                      </label>

                      {/* Nếu chọn Cày Sự Kiện thì hiện thêm ô Tên Sự Kiện */}
                      {adminBoostType === 'event' && (
                        <div>
                          <label className="text-xs text-rose-400 font-bold block mb-1">Sự Kiện Gì?</label>
                          <input name="eventName" defaultValue={editingBoosting?.type === 'event' ? editingBoosting.title : ''} placeholder="VD: Cày Sổ Sứ Mệnh, Sự kiện Tết..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500" required />
                        </div>
                      )}
                      {/* 1. HIỆN Ô TÍCH CHỌN KHI LÀ CÀY SỰ KIỆN */}
                      {adminBoostType === 'event' && (
                        <>
                          <label className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg cursor-pointer mb-4 transition-colors hover:bg-blue-500/20 shadow-inner">
                            <input
                              type="checkbox"
                              checked={isEventMultiPackage}
                              onChange={(e) => setIsEventMultiPackage(e.target.checked)}
                              className="w-5 h-5 accent-blue-500 cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-blue-400">Bật chia nhiều Gói nhỏ</span>
                              <span className="text-[10px] text-slate-500">Tích vào nếu muốn khách chọn mốc (VD: Mốc 1, Mốc 2...)</span>
                            </div>
                          </label>
                          {!isEventMultiPackage && (
                            <div className="flex flex-col gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-4 shadow-inner">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="allowQuantity"
                                  defaultChecked={editingBoosting?.allow_quantity || false}
                                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-emerald-400">Cho phép khách điền số lượng</span>
                                  <span className="text-[10px] text-slate-500">Tự động nhân giá với số lượng khách điền</span>
                                </div>
                              </label>
                              <div className="flex items-center justify-between gap-2 border-t border-emerald-500/20 pt-2">
                                <span className="text-[11px] font-bold text-slate-300">Giới hạn 1 lần mua:</span>
                                <input type="number" name="maxQuantityPerOrder" min="0" defaultValue={getGameInfo(editingBoosting?.game).maxQuantityPerOrder || 0} placeholder="0 = Không giới hạn" className="w-24 p-1.5 bg-[#0B1120] border border-emerald-500/50 rounded text-xs text-white font-bold outline-none focus:border-emerald-400 text-center" />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {adminBoostType === 'rank' ? (
                        <>
                          <div><label className="text-xs text-slate-400 block mb-1">Tiêu đề Gói</label><input name="title" defaultValue={editingBoosting?.title} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required /></div>
                          <div><label className="text-xs text-slate-400 block mb-1">Mô tả chi tiết</label><textarea name="desc" defaultValue={editingBoosting?.desc} rows="3" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required></textarea></div>
                          <div><label className="text-xs text-slate-400 block mb-1">Đơn vị hiển thị sau giá <span className="text-slate-600">(VD: điểm, bậc, gói...)</span></label><input name="priceUnit" value={adminBoostingPriceUnit} onChange={e => setAdminBoostingPriceUnit(e.target.value)} placeholder="Để trống nếu không cần" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" /></div>
                        </>
                      ) : (
                        <>
                          <div><label className="text-xs text-slate-400 block mb-1">Số lượng / Mô tả chi tiết</label><textarea name="amount" defaultValue={editingBoosting?.type === 'event' ? editingBoosting.desc : ''} rows="3" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required></textarea></div>
                          <div><label className="text-xs text-slate-400 block mb-1">Đơn vị hiển thị sau giá <span className="text-slate-600">(VD: điểm, bậc, gói...)</span></label><input name="priceUnit" value={adminBoostingPriceUnit} onChange={e => setAdminBoostingPriceUnit(e.target.value)} placeholder="Để trống nếu không cần" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" /></div>
                          <label className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg cursor-pointer">
                            <input type="checkbox" name="requireLogin" defaultChecked={editingBoosting?.type === 'event' ? editingBoosting.require_login : false} className="w-5 h-5 accent-rose-500 cursor-pointer" />
                            <span className="text-sm font-bold text-rose-400">Yêu cầu cung cấp TK/MK?</span>
                          </label>
                        </>
                      )}
                    </div>
                    {/* === CỘT PHẢI: Chỉ chứa Bảng giá mốc === */}
                    <div className="space-y-4 mt-4 md:mt-0">
                      {(adminBoostType === 'rank' || (adminBoostType === 'event' && isEventMultiPackage)) ? (
                        <div>
                          <div className="mb-4 bg-rose-900/10 p-4 rounded-xl border border-rose-500/30">
                            <label className="text-xs text-rose-400 font-bold block mb-1">Giảm Giá Chung (%) (Tùy chọn)</label>
                            <input name="discountPercent" type="number" min="0" max="100" defaultValue={editingBoosting?.discountPercent || ''} placeholder="VD: 10 (Sẽ trừ thẳng 10% khi khách thanh toán)" className="w-full p-3 bg-[#0B1120] border border-rose-500/50 rounded-lg text-rose-400 font-bold outline-none focus:border-rose-400" />
                          </div>
                          <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/30">
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-sm text-blue-400 font-bold flex items-center gap-2">
                                <Target size={16} /> CẤU HÌNH MỐC ĐIỂM (Cộng dồn)
                              </label>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-emerald-400 mb-2">Nhập danh sách theo định dạng: <span className="font-bold text-white">Tên Rank | Điểm mốc | Giá</span> (Mỗi rank 1 dòng)</p>
                              <p className="text-[10px] text-slate-500 mb-2">Cột giá hỗ trợ: <span className="text-cyan-400">300k/200 điểm</span> (tự tính 1500đ/điểm), <span className="text-cyan-400">25k/100</span> (tự tính 250đ/điểm), hoặc số thuần <span className="text-cyan-400">1500</span></p>
                              <textarea
                                value={crossfireText}
                                onChange={(e) => setCrossfireText(e.target.value)}
                                placeholder={`Ví dụ:\nVàng | 1800 | 25k/100 điểm\nBạch Kim | 2100 | 30k/100 điểm\nHuyền Thoại | 3300 | 300k/200 điểm\nThần Thoại | 3500 | 450k/200 điểm\nTruyền Kỳ | 3700 | 0`}
                                className="w-full h-[250px] p-3 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-mono text-sm outline-none focus:border-emerald-400"
                                required
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* HIỆN Ô NHẬP GIÁ TRỌN GÓI NẾU KHÔNG TÍCH Ô CHIA GÓI */
                        <div className="mb-4 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-emerald-400 block mb-1">Giá tiền gốc (VNĐ)</label>
                            <input name="basePrice" type="number" defaultValue={editingBoosting ? (editingBoosting.oldPrice || editingBoosting.price) : ''} className="w-full p-3 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-bold outline-none focus:border-emerald-500" required />
                          </div>
                          <div>
                            <label className="text-xs text-rose-400 block mb-1">Giá đã giảm (Tùy chọn)</label>
                            <input name="discountedPrice" type="number" defaultValue={editingBoosting?.oldPrice ? editingBoosting.price : ''} className="w-full p-3 bg-[#0B1120] border border-rose-500/50 rounded-lg text-rose-400 font-bold outline-none focus:border-rose-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-6 shadow-lg shadow-blue-600/20">Lưu Dịch Vụ</button>
                </form>
              </div>
            </div>
          )}

          {showWheelModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Gift className="text-rose-500" /> {editingWheel ? 'Sửa Phần Thưởng' : 'Thêm Phần Thưởng'}</h3>
                  <button onClick={() => setShowWheelModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveWheel} className="space-y-4">
                  <div className="bg-slate-800/50 p-2 rounded-lg text-center text-xs text-emerald-400 font-bold border border-emerald-500/30">
                    Đang thêm vào: {adminWheelType === 'money' ? 'VÒNG QUAY TIỀN' : 'VÒNG QUAY LƯỢT'}
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Ảnh vật phẩm (Tùy chọn)</label>
                    <div className="mt-1 border border-dashed border-slate-600 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors relative group bg-[#0B1120]">
                      <input type="file" accept="image/*" onChange={handleWheelImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {adminWheelImage ? (
                        <div className="relative">
                          <img src={adminWheelImage} className="mx-auto h-20 object-contain rounded-lg shadow-md" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity rounded-lg">Đổi Ảnh Khác</div>
                        </div>
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center"><ImageIcon size={28} className="mb-2" /><span className="text-[10px] font-bold">Bấm để tải Ảnh lên</span></div>
                      )}
                    </div>
                  </div>
                  <div><label className="text-xs text-slate-400 font-bold">Tên Quà</label><input name="name" defaultValue={editingWheel?.name} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>{/* Ô CHỌN MÀU SẮC */}
                      <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700">
                        <label className="text-xs text-slate-400 font-bold flex items-center gap-1"><Flame size={14} /> Màu sắc nền của Ô quà này</label>
                        <div className="flex items-center gap-3 mt-2">
                          <input name="color" type="color" defaultValue={editingWheel?.color || '#f43f5e'} className="w-12 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                          <span className="text-[10px] text-slate-500">Mã màu sẽ hiển thị trực tiếp lên Vòng Quay của khách</span>
                        </div>
                      </div>
                      <label className="text-xs text-slate-400 font-bold">Loại</label>
                      <select name="type" defaultValue={editingWheel?.type || 'none'} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500">
                        <option value="money">Tiền VNĐ (Ví chính)</option>
                        <option value="spin">Lượt Quay</option>
                        <option value="fund">Cộng Tiền Quỹ Thuê</option> {/* <--- THÊM DÒNG NÀY */}
                        <option value="other">Vật Phẩm</option>
                        <option value="none">Trượt</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold">Giá trị</label>
                      <input name="value" type="number" defaultValue={editingWheel?.value || 0} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div><div><label className="text-xs text-slate-400 font-bold">Số lượng còn lại (0 = Ẩn)</label><input name="quantity" type="number" defaultValue={editingWheel?.quantity ?? 999} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required /></div><label className="text-xs text-slate-400 font-bold">Tỉ Lệ Trúng (VD: 5%)</label><input name="rate" defaultValue={editingWheel?.rate} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required /></div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4 transition-colors shadow-lg">Lưu Lại</button>
                </form>
              </div>
            </div>
          )}

        </main>
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
        {currentView === 'security' && renderSecurityScreen()}
        {currentView === 'admin' && renderAdminScreen()}
        {currentView === 'naptien' && renderNaptienScreen()}
        {currentView === 'lichsu' && renderLichsuScreen()}
        {currentView === 'caythue' && renderCayThueScreen()}
        {currentView === 'vongquay' && renderVongQuay()}
        {currentView === 'bossgame' && renderBossGameScreen()}
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
                  if (isProcessingAction || isConfirmProcessing) return;
                  isProcessingAction = true;
                  setIsConfirmProcessing(true);
                  const action = confirmDialog.onConfirm;
                  try { await action(); } catch (e) { console.error(e); } finally {
                    isProcessingAction = false;
                    setIsConfirmProcessing(false);
                    setConfirmDialog(null);
                  }
                }} className={`flex-1 p-4 font-bold transition-colors ${isConfirmProcessing ? 'text-slate-600 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-600 hover:text-white'}`}>{isConfirmProcessing ? 'Đang xử lý...' : 'Đồng Ý'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Viewer Phóng to ảnh */}
        {fullScreenImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
            <button onClick={() => setFullScreenImage(null)} className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-rose-600 rounded-full text-white transition-colors z-[101]">
              <X size={28} />
            </button>
            <img src={fullScreenImage} className="max-w-full max-h-[90vh] w-auto h-auto object-contain shadow-2xl border border-slate-800 rounded" alt="Full Screen" />
          </div>
        )}

        {/* POPUP CHI TIẾT TÀI KHOẢN */}
        {viewingAcc && (() => {
          const viewingAllImages = [viewingAcc.coverImage, ...(viewingAcc.detailImages || [])];
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
                      className="relative w-full shrink-0 rounded-xl overflow-hidden border border-slate-800 bg-black cursor-zoom-in group"
                      onClick={() => setFullScreenImage(viewingAllImages[selectedImageIndex])}
                    >
                      <img src={viewingAllImages[selectedImageIndex]} className="w-full h-auto block" alt="Main View" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="bg-black/60 p-3 rounded-full text-white flex items-center gap-2"><ZoomIn size={24} /></div>
                      </div>
                    </div>
                    {viewingAllImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto custom-scrollbar py-2 shrink-0">
                        {viewingAllImages.map((img, idx) => (
                          <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-blue-500' : 'border-transparent opacity-50 hover:opacity-100'}`}>
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
                  if (isProcessingAction) return;
                  isProcessingAction = true;

                  const targetForm = e.target;
                  // Bắt thẳng giá trị từ DOM để chống React làm mất dữ liệu
                  const capturedPhone = targetForm.phone?.value || '';
                  const capturedAwesunId = targetForm.awesunId?.value || '';
                  const capturedAwesunPass = targetForm.awesunPass?.value || '';
                  const capturedCccd = targetForm.cccd?.value || '';
                  const useFundCheckbox = targetForm.useFundCheckbox?.checked || false;

                  const { acc, opt } = rentModalData;
                  const fileInput = e.target.querySelector('input[type="file"]');

                  const processRent = async (imgBase64) => {
                    try {
                      let finalImgBase64 = imgBase64;
                      // ĐÃ XÓA logic đẩy CCCD lên ImgBB ở đây để bảo mật tuyệt đối dữ liệu cá nhân của khách hàng.
                      // Toàn bộ ảnh CCCD (Base64) được lưu thẳng vào Supabase Database như cũ thay vì sang Server bên thứ 3.

                      // KIỂM TRA: Mỗi tài khoản chỉ được thuê 1 nick trong 1 lúc
                      const alreadyRenting = accountsDb.find(a => a.currentRenterId === currentUser.id && a.rentedUntil && a.rentedUntil > Date.now());
                      if (alreadyRenting) {
                        isProcessingAction = false;
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

                      // Tự động lưu CCCD vào profile theo yêu cầu nếu khách có cung cấp
                      if (!skipKyc && rentKycMethod === 'cccd' && finalImgBase64) {
                        const { error: cccdErr } = await supabase.from('users').update({
                          cccd_image: finalImgBase64,
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
                    } finally { isProcessingAction = false; }
                  };

                  // Bắt buộc ảnh CCCD chỉ khi là Khách Thường VÀ chọn up CCCD
                  if (!skipKyc && rentKycMethod === 'cccd' && !currentUser.is_cccd_verified) {
                    if (!fileInput?.files[0]) {
                      isProcessingAction = false;
                      return showToast("Vui lòng tải lên ảnh CCCD!", "error");
                    }
                    const reader = new FileReader();
                    reader.onload = () => processRent(reader.result);
                    reader.readAsDataURL(fileInput.files[0]);
                  } else {
                    // VIP hoặc Khách chọn cọc 500k -> Bỏ qua khâu file ảnh
                    processRent(null);
                  }
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
                            <p className="text-sm text-slate-400 mt-1">Hệ thống đã lưu lại, bạn có thể ấn Thanh toán ngay mà không cần chụp lại ảnh.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 animate-fade-in mb-4">
                            <div className="col-span-2 grid grid-cols-1 gap-3">
                              {/* Ô MẶT TRƯỚC CCCD */}
                              <div className="relative border border-dashed border-slate-600 rounded-lg p-3 text-center hover:bg-slate-800/50 transition-colors min-h-[100px] flex items-center justify-center overflow-hidden">
                                <input type="file" accept="image/*" onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) { const reader = new FileReader(); reader.onload = () => setKycImagePreview(reader.result); reader.readAsDataURL(file); }
                                  else { setKycImagePreview(null); }
                                }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Tải ảnh mặt trước CCCD" required />
                                {kycImagePreview ? (<img src={kycImagePreview} className="absolute inset-0 w-full h-full object-cover rounded-lg z-0" />) : (
                                  <div className="text-slate-500 pointer-events-none flex flex-col items-center justify-center relative z-0">
                                    <Upload size={20} className="mb-1 text-slate-400" />
                                    <span className="text-[10px] font-bold">Up ảnh CCCD</span>
                                  </div>
                                )}
                              </div>
                            </div>                            <div className="col-span-2"><input name="cccd" placeholder="Nhập số CCCD" className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white outline-none" required /></div>
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
                      <div className="col-span-2"><input name="phone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} placeholder="SĐT liên hệ (10-11 số)" className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white outline-none" required /></div>
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
      {renderItemDetailedTooltip()}
    </>
  );
};

export default App;