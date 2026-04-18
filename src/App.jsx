import React, { useState, useEffect, useRef } from 'react';
import {
  User, Lock, Phone, Mail, ShieldCheck, ArrowRight, CheckCircle2,
  LogOut, Key, Wallet, Search, Gamepad2, X, Menu, Clock, Flame,
  Settings, Edit, Trash2, PlusCircle, Image as ImageIcon,
  History, Target, Gift, Save, Upload, Plus, Unlock, QrCode,
  Download, Copy, Check, AlertCircle, RefreshCw, ChevronDown, ChevronUp, ZoomIn,
  Sparkles, TrendingUp, Users, Ticket, Settings2, MessageCircle, Send, Eye, EyeOff
} from 'lucide-react';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';
// --- COMPONENT LOGO TÙY CHỈNH ---
const CustomLogo = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className} cursor-pointer`}>
    <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-rose-600 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-white/20">
      <Gamepad2 size={24} className="text-white relative z-10" />
      <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
    </div>
    <div className="flex flex-col">
      <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-rose-400 tracking-wider leading-none drop-shadow-sm">
        TIẾN
      </span>
      <span className="text-[10px] md:text-xs font-bold text-white tracking-widest leading-none mt-0.5">
        GAMING
      </span>
    </div>
  </div>
);

// --- COMPONENT NÚT LIÊN HỆ NỔI ---
// --- COMPONENT NÚT LIÊN HỆ NỔI ---
const FloatingContact = ({ currentUser, unreadCount, onOpenInbox }) => (
  <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-3 transition-all duration-300">

    {/* Nút Hộp Thư Mới */}
    {currentUser && (
      <button onClick={onOpenInbox} className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-transform group relative">
        <MessageCircle size={22} className="text-emerald-400" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#151D2F] animate-pulse">{unreadCount}</span>}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Hộp thư hỗ trợ</span>
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

const App = () => {

  // --- BỘ ĐÀM GỬI EMAIL BÁO CHO ADMIN ---
  const sendAdminAlert = (actionName, detailMessage) => {
    const templateParams = {
      action: actionName,
      details: detailMessage,
    };

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

  const [usersDb, setUsersDb] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [accountsDb, setAccountsDb] = useState([]);
  // Tự động nhớ vị trí màn hình hiện tại
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('shop_current_view') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('shop_current_view', currentView);
  }, [currentView]);
  // Lấy data tạm từ RAM lên ngay lập tức lúc F5 để web không bị trống
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('shop_cached_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [viewingAcc, setViewingAcc] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeBoostingTab, setActiveBoostingTab] = useState('Tất cả');
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
  const [showSpinNotice, setShowSpinNotice] = useState(false);
  // --- HỆ THỐNG THÔNG BÁO & GIAO DIỆN RESPONSIVE ---
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State quản lý menu trên điện thoại

  // --- STATE MODALS ---
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
  const [historyTab, setHistoryTab] = useState('buy'); // Quản lý Tab đang mở
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(5); // Số lượng hiển thị mỗi lần cuộn
  const [visibleUsersCount, setVisibleUsersCount] = useState(8); // Ban đầu chỉ hiện 10 user
  const [visibleDepsClient, setVisibleDepsClient] = useState(5); // Nạp tiền (Khách)
  const [visibleDepsAdmin, setVisibleDepsAdmin] = useState(5);   // Nạp tiền (Admin)
  const [visibleRentsAdmin, setVisibleRentsAdmin] = useState(5); // Thuê nick (Admin)
  const [visibleSpinsClient, setVisibleSpinsClient] = useState(6); // Vòng quay (Khách)
  const [visibleSpinsAdmin, setVisibleSpinsAdmin] = useState(5);   // Vòng quay (Admin)
  const [adminMessageSearch, setAdminMessageSearch] = useState('');
  const [wheelConfig, setWheelConfig] = useState({ moneyCost: 20000, spinCost: 1 });



  const [transactionsDb, setTransactionsDb] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [rentRequests, setRentRequests] = useState([]);
  const [boostingRequests, setBoostingRequests] = useState([]);
  const [approveDepositModal, setApproveDepositModal] = useState(null);

  // HỘP THƯ (TIN NHẮN) DB
  const [messagesDb, setMessagesDb] = useState([
    { id: 1, senderId: 2, receiverId: 1, content: 'Chào bạn, chúc bạn mua sắm vui vẻ tại hệ thống!', timestamp: Date.now() - 3600000, isRead: false }
  ]);

  const [boostingDb, setBoostingDb] = useState([
    { id: 1, game: 'Liên Quân', title: 'Cày từ Kim Cương lên Cao Thủ', price: 150000, desc: 'Thời gian hoàn thành: 1-2 ngày. Đảm bảo uy tín.' },
    { id: 2, game: 'Valorant', title: 'Cày rank từ Gold lên Diamond', price: 300000, desc: 'Người cày là Radianite, an toàn tuyệt đối.' }
  ]);

  const [wheelItemsMoneyDb, setWheelItemsMoneyDb] = useState([]);
  const [wheelItemsSpinDb, setWheelItemsSpinDb] = useState([]);


  // --- LIFTED STATES TỪ CÁC TAB ĐỂ TRÁNH MẤT FOCUS KHI COMPONENT RENDER LẠI ---
  const [profileTab, setProfileTab] = useState('info');
  const messagesEndRef = useRef(null);

  const [depositStep, setDepositStep] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [voucherInput, setVoucherInput] = useState('');
  const [pendingDeposit, setPendingDeposit] = useState(null);

  const [expandedTx, setExpandedTx] = useState(null);

  const [adminTab, setAdminTab] = useState('users');
  const [adminWheelType, setAdminWheelType] = useState('money');
  const [showAccModal, setShowAccModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [adminCoverImage, setAdminCoverImage] = useState(null);
  const [adminDetailImages, setAdminDetailImages] = useState([]);
  const [adminRentOptions, setAdminRentOptions] = useState([{ time: '', price: '' }]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewUserHistory, setViewUserHistory] = useState(null);
  const [showBoostingModal, setShowBoostingModal] = useState(false);
  const [editingBoosting, setEditingBoosting] = useState(null);
  const [adminBoostType, setAdminBoostType] = useState('rank');
  const [adminBoostingImage, setAdminBoostingImage] = useState(null);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [editingWheel, setEditingWheel] = useState(null);
  const [adminWheelImage, setAdminWheelImage] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [editRentModal, setEditRentModal] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const chatMessagesEndRef = useRef(null);

  // CCCD Preview cho form thuê
  const [kycImagePreview, setKycImagePreview] = useState(null);
  // --- ĐOẠN NÀY ĐỂ HÚT DỮ LIỆU TỪ MÁY CHỦ SUPABASE ---
  // Tự động kiểm tra mỗi khi khách chuyển trang
  // STATE: Ghi nhớ việc khách bấm "Không hiển thị lại" (Lưu trên RAM, F5 là tự reset về false)
  const [dismissNotice, setDismissNotice] = useState(false);
  const [showSpinRules, setShowSpinRules] = useState(false);
  const [dismissSpinRules, setDismissSpinRules] = useState(false);

  // 1. Kích hoạt bảng Trang Chủ (Sảnh chính)
  useEffect(() => {
    if (currentView === 'dashboard' && !dismissNotice) {
      // Đợi 0.3s cho web load xong giao diện rồi mới nảy bảng lên (Tránh bị React nuốt lệnh)
      const timer = setTimeout(() => setShowSpinNotice(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowSpinNotice(false); // Chuyển sang tab khác là tự động dọn dẹp (tắt bảng)
    }
  }, [currentView, dismissNotice]);

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
      // --- TÍNH NĂNG TỰ ĐỘNG ĐĂNG XUẤT SAU 1 TIẾNG (3.600.000 ms) ---
      const lastActive = localStorage.getItem('shop_last_active');
      if (lastActive && (Date.now() - parseInt(lastActive)) > 3600000) {
        await supabase.auth.signOut();
        localStorage.removeItem('shop_cached_user');
        localStorage.removeItem('shop_last_active');
        setCurrentUser(null);
        showToast("Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.", "error");
        setCurrentView('login');
      }
      // -------------------------------------------------------------

      // 1. TẢI CÁC DỮ LIỆU CÔNG KHAI NGAY LẬP TỨC

      // 1. TẢI CÁC DỮ LIỆU CÔNG KHAI NGAY LẬP TỨC
      const [accRes, boostRes, wheelRes, voucherRes, boostReqRes] = await Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('boosting').select('*').order('id', { ascending: false }),
        supabase.from('wheel_items').select('*'),
        supabase.from('vouchers').select('*'),
        supabase.from('boosting_requests').select('*').order('id', { ascending: false }) // Hút đơn Cày Thuê
      ]);

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
      }
      if (boostRes.data) setBoostingDb(boostRes.data);
      if (wheelRes.data) {
        setWheelItemsMoneyDb(wheelRes.data.filter(w => w.wheel_type === 'money'));
        setWheelItemsSpinDb(wheelRes.data.filter(w => w.wheel_type === 'spin'));
      }
      if (voucherRes.data) setVouchersDb(voucherRes.data);
      if (boostReqRes.data) {
        const fixedBoostReqs = boostReqRes.data.map(r => ({
          ...r,
          boostingTitle: r.boostingTitle || r.boostingtitle || '',
          boostingId: r.boostingId || r.boostingid || ''
        }));
        setBoostingRequests(fixedBoostReqs);
      }

      const savedDepositConfig = localStorage.getItem('shop_deposit_config');
      if (savedDepositConfig) setDepositBonusConfig(JSON.parse(savedDepositConfig));

      // 2. KIỂM TRA ĐĂNG NHẬP NGẦM & TẢI DỮ LIỆU THEO CHỨC VỤ
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Tìm xem ai đang đăng nhập
        const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single();

        if (user && !user.is_locked) {
          setCurrentUser(user);
          localStorage.setItem('shop_cached_user', JSON.stringify(user));

          // GIẢI QUYẾT LỖI MẤT QUYỀN ADMIN (Chữ Hoa/Thường)
          const role = (user.role || 'user').toLowerCase();

          if (role === 'admin') {
            // QUYỀN ADMIN: TẢI TOÀN BỘ DATABASE VỀ PANEL
            const [usersRes, txRes, depRes, rentRes, msgRes, boostReqRes] = await Promise.all([
              supabase.from('users').select('*').order('id', { ascending: false }),
              supabase.from('transactions').select('*').order('id', { ascending: false }),
              supabase.from('deposit_requests').select('*').order('id', { ascending: false }),
              supabase.from('rent_requests').select('*').order('id', { ascending: false }),
              supabase.from('messages').select('*').order('timestamp', { ascending: true }),
              supabase.from('boosting_requests').select('*').order('id', { ascending: false })
            ]);

            if (usersRes.data) setUsersDb(usersRes.data);
            if (txRes.data) setTransactionsDb(txRes.data);
            if (depRes.data) setDepositRequests(depRes.data);
            if (msgRes.data) setMessagesDb(msgRes.data);
            if (boostReqRes.data) {
              const fixedBoostReqs = boostReqRes.data.map(r => ({
                ...r,
                boostingTitle: r.boostingTitle || r.boostingtitle || '',
                boostingId: r.boostingId || r.boostingid || ''
              }));
              setBoostingRequests(fixedBoostReqs);
            }
            if (rentRes.data) {
              const fixedRentReqs = rentRes.data.map(r => ({
                ...r,
                accCode: r.accCode || r.acccode || '',
                userId: r.userId || r.userid || ''
              }));
              setRentRequests(fixedRentReqs);
            }
          } else {
            // QUYỀN KHÁCH: CHỈ TẢI CỦA KHÁCH
            const [myTx, myDep, myRent, myMsg, myBoostReq] = await Promise.all([
              supabase.from('transactions').select('*').eq('user', user.name).order('id', { ascending: false }),
              supabase.from('deposit_requests').select('*').eq('userId', session.user.id).order('id', { ascending: false }),
              supabase.from('rent_requests').select('*').eq('userId', session.user.id).order('id', { ascending: false }),
              supabase.from('messages').select('*').or(`senderId.eq.${session.user.id},receiverId.eq.${session.user.id}`).order('timestamp', { ascending: true }),
              supabase.from('boosting_requests').select('*').eq('user', user.name).order('id', { ascending: false }) // <--- Đã thêm lệnh lấy Cày Thuê
            ]);

            if (myTx.data) setTransactionsDb(myTx.data);
            if (myDep.data) setDepositRequests(myDep.data);
            if (myMsg.data) setMessagesDb(myMsg.data);
            if (myRent.data) {
              const fixedRentReqs = myRent.data.map(r => ({
                ...r,
                accCode: r.accCode || r.acccode || '',
                userId: r.userId || r.userid || ''
              }));
              setRentRequests(fixedRentReqs);
            }
            // Lọc và hiển thị Cày Thuê cho khách
            if (myBoostReq.data) {
              const fixedBoostReqs = myBoostReq.data.map(r => ({
                ...r,
                boostingTitle: r.boostingTitle || r.boostingtitle || '',
                boostingId: r.boostingId || r.boostingid || ''
              }));
              setBoostingRequests(fixedBoostReqs);
            }
          }
        }
      }
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
      // Lưu lại thời gian cuối cùng khách còn online
      if (localStorage.getItem('shop_cached_user')) {
        localStorage.setItem('shop_last_active', Date.now().toString());
      }
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
    const depositChannel = supabase.channel('realtime-deposits')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deposit_requests' }, (payload) => {
        setDepositRequests(prev => {
          // BỘ LỌC CHỐNG TRÙNG LẶP CHO ĐƠN NẠP
          if (prev.find(d => d.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'deposit_requests' }, (payload) => {
        setDepositRequests(prev => prev.map(req => req.id === payload.new.id ? payload.new : req));
      })
      .subscribe();

    // 3. Lắng nghe ĐƠN THUÊ NICK MỚI & CẬP NHẬT TRẠNG THÁI
    const rentChannel = supabase.channel('realtime-rents')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rent_requests' }, (payload) => {
        setRentRequests(prev => {
          // BỘ LỌC CHỐNG TRÙNG LẶP CHO ĐƠN THUÊ
          if (prev.find(r => r.id === payload.new.id)) return prev;
          return [payload.new, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rent_requests' }, (payload) => {
        setRentRequests(prev => prev.map(req => req.id === payload.new.id ? payload.new : req));
      })
      .subscribe();

    // 4. Lắng nghe LƯỢT TRUY CẬP (SITE STATS)
    const statsChannel = supabase.channel('realtime-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_stats' }, (payload) => {
        if (payload.new && payload.new.views !== undefined) {
          setVisitorCount(payload.new.views);
        }
      })
      .subscribe();

    // Dọn dẹp các đường truyền khi khách đóng trình duyệt để chống lag máy
    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(depositChannel);
      supabase.removeChannel(rentChannel);
      supabase.removeChannel(statsChannel);
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

  // Xử lý Check In Hộp Thư Tự Động (Lọc để tránh loop)
  useEffect(() => {
    if (currentView === 'security' && profileTab === 'inbox') {
      const hasUnread = messagesDb.some(m => m.receiverId === currentUser?.id && !m.isRead);
      if (hasUnread) {
        const updatedMsgs = messagesDb.map(m => m.receiverId === currentUser?.id ? { ...m, isRead: true } : m);
        setMessagesDb(updatedMsgs);
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentView, profileTab, messagesDb, currentUser]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- HÀM XỬ LÝ LÕI ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const contact = e.target.contact.value;
    const password = e.target.password.value;

    let loginEmail = contact;

    // Nếu khách nhập SĐT (toàn số), tìm email tương ứng
    if (/^\d+$/.test(contact)) {
      const { data: foundUser } = await supabase
        .from('users')
        .select('email')
        .eq('phone', contact)
        .single();

      if (foundUser) {
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

    // Lấy thông tin user để hiển thị lên web
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userData) {
      if (userData.is_locked) {
        await supabase.auth.signOut();
        localStorage.removeItem('shop_cached_user');
        return showToast("Tài khoản của bạn đã bị khóa!", 'error');
      }
      setCurrentUser(userData);
      localStorage.setItem('shop_cached_user', JSON.stringify(userData));

      // XÚC DỮ LIỆU ADMIN NGAY KHI ĐĂNG NHẬP ĐỂ KHÔNG BỊ TRỐNG PANEL
      const role = (userData.role || 'user').toLowerCase();
      if (role === 'admin') {
        const [usersRes, txRes, depRes, rentRes, msgRes, boostReqRes] = await Promise.all([
          supabase.from('users').select('*').order('id', { ascending: false }),
          supabase.from('transactions').select('*').order('id', { ascending: false }),
          supabase.from('deposit_requests').select('*').order('id', { ascending: false }),
          supabase.from('rent_requests').select('*').order('id', { ascending: false }),
          supabase.from('messages').select('*').order('timestamp', { ascending: true }),
          supabase.from('boosting_requests').select('*').order('id', { ascending: false }) // Phải kéo cái này về
        ]);
        if (usersRes.data) setUsersDb(usersRes.data);
        if (txRes.data) setTransactionsDb(txRes.data);
        if (depRes.data) setDepositRequests(depRes.data);
        if (rentRes.data) {
          // Nhớ lọc chữ hoa/thường cho bảng Thuê Nick
          const fixedRentReqs = rentRes.data.map(r => ({
            ...r,
            accCode: r.accCode || r.acccode || '',
            userId: r.userId || r.userid || ''
          }));
          setRentRequests(fixedRentReqs);
        }
        if (msgRes.data) setMessagesDb(msgRes.data);
        if (boostReqRes.data) {
          const fixedBoostReqs = boostReqRes.data.map(r => ({
            ...r,
            boostingTitle: r.boostingTitle || r.boostingtitle || '',
            boostingId: r.boostingId || r.boostingid || ''
          }));
          setBoostingRequests(fixedBoostReqs);
        }
      }

      setCurrentView('dashboard');
      showToast(`Chào mừng ${userData.name} quay trở lại!`, 'success');
    } else {
      showToast("Lỗi: Tài khoản Auth tồn tại nhưng không tìm thấy Data trong bảng Users!", 'error');
    }
  }; const handleRegister = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const name = e.target.name.value;
    const phone = e.target.phone.value;

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
      const handleForgotPassword = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) return showToast("Lỗi: " + error.message, 'error');
        showToast("Đã gửi link khôi phục mật khẩu vào Email của bạn!", 'success');
        setCurrentView('login');
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
    if (!currentUser.is_email_verified) return showToast("Vui lòng vào mục Cá nhân để xác thực Email trước khi giao dịch!", "error");
    if (currentUser.balance < acc.price) {
      showToast("Số dư không đủ! Vui lòng nạp thêm tiền.", 'error');
      setCurrentView('naptien');
      return;
    }

    setConfirmDialog({
      title: 'Xác nhận Mua Đứt',
      message: `Bạn có chắc chắn muốn mua nick #${acc.code} với giá ${new Intl.NumberFormat('vi-VN').format(acc.price)}đ không?`,
      onConfirm: async () => {
        // 1. Trừ tiền thật trên Supabase
        const newBalance = currentUser.balance - acc.price;
        await supabase.from('users').update({ balance: newBalance }).eq('id', currentUser?.id);

        // 2. Lưu Lịch sử giao dịch lên Database
        const newTx = {
          id: `TX${Date.now()}`,
          user: currentUser.name,
          action: `Đặt cày thuê: ${boostingModalData.title}`,
          amount: boostingModalData.price,
          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
          status: 'Thành công',
          type: 'boosting',
          accDetails: {
            balanceAfter: newBalance,
            fundAfter: currentUser.rentFund || 0
          }
        };
        const { data: txData } = await supabase.from('transactions').insert([newTx]).select();

        // 3. Cập nhật lại giao diện Web
        const updatedUser = { ...currentUser, balance: newBalance };
        setCurrentUser(updatedUser);
        localStorage.setItem('shop_cached_user', JSON.stringify(userData));
        setUsersDb(usersDb.map(u => u.id === currentUser?.id ? updatedUser : u));
        if (txData) setTransactionsDb([txData[0], ...transactionsDb]);

        // 1. Cập nhật trạng thái "Đã bán" lên Supabase
        await supabase.from('accounts').update({ is_sold: true, rentedUntil: null, rentStartedAt: null, currentRenterId: null }).eq('id', acc.id);

        // 2. Gỡ tài khoản khỏi giao diện (Lọc bỏ nick vừa mua ra khỏi danh sách)
        setAccountsDb(accountsDb.filter(a => a.id !== acc.id));
        setViewingAcc(null);
        setSuccessTxData({ type: 'buy', title: 'Mua Tài Khoản Thành Công!', acc: acc });
        sendAdminAlert('MUA NICK', `Khách ${currentUser.name} vừa mua đứt nick #${acc.code} với giá ${new Intl.NumberFormat('vi-VN').format(acc.price)}đ.`);
      }
    });
  };

  const initiateRent = (acc, opt) => {
    if (!currentUser) return requireAuth('login');
    if (!currentUser.is_email_verified) return showToast("Vui lòng vào mục Cá nhân để xác thực Email trước khi giao dịch!", "error");

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
    setCurrentUser({ ...currentUser, is_email_verified: true });
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
        localStorage.setItem('shop_cached_user', JSON.stringify(userData));
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
        const { data: liveUser } = await supabase.from('users').select('*').eq('id', userObj.id).single();
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
        localStorage.setItem('shop_cached_user', JSON.stringify(userData));

        setTransactionsDb(transactionsDb.map(t => t.id === tx.id ? { ...t, status: 'Đã hoàn tác' } : t));

        // Cập nhật luôn màn hình Lịch sử đang mở để Admin thấy tiền khách nhảy ngay lập tức
        setViewUserHistory(updatedUser);

        showToast("Hoàn tác thành công! Đã xử lý xong tài sản của khách.");
      }
    });
  };
  const unreadCount = currentUser ? messagesDb.filter(m => m.receiverId === currentUser?.id && !m.isRead).length : 0;

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
              { name: 'Dịch Vụ Cày Thuê', view: 'caythue', auth: false, icon: <Target size={20} /> },
              ...(wheelItemsMoneyDb.length > 0 || wheelItemsSpinDb.length > 0 ? [{ name: 'Vòng Quay May Mắn', view: 'vongquay', auth: false, icon: <Gift size={20} /> }] : []),
              { name: 'Lịch Sử Giao Dịch', view: 'lichsu', auth: true, icon: <History size={20} /> },
              ...(currentUser?.role === 'admin' ? [{ name: 'Panel Quản Trị Hệ Thống', view: 'admin', auth: true, icon: <Settings size={20} />, adminOnly: true }] : [])
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (item.auth) requireAuth(item.view); else setCurrentView(item.view);
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
          { id: 'caythue', name: 'Cày thuê', icon: <Target size={22} />, auth: false },
          { id: 'naptien', name: 'Nạp tiền', icon: <Wallet size={22} />, auth: true },
          ...(wheelItemsMoneyDb.length > 0 || wheelItemsSpinDb.length > 0 ? [{ id: 'vongquay', name: 'Vòng quay', icon: <Gift size={22} />, auth: false }] : []),
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
    <header className="bg-[#151D2F] border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-300 hover:text-white p-2 -ml-2 bg-slate-800/50 rounded-lg transition-colors"><Menu size={24} /></button>
          <div onClick={() => setCurrentView('dashboard')}>
            <CustomLogo className="hidden sm:flex" />
            <div className="sm:hidden flex items-center gap-2 cursor-pointer">
              <div className="bg-gradient-to-br from-blue-600 to-rose-600 text-white p-1.5 rounded-lg shadow-lg"><Gamepad2 size={20} /></div>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { name: 'Mua Nick', view: 'dashboard', auth: false },
            { name: 'Nạp Tiền', view: 'naptien', auth: true },
            { name: 'Cày Thuê', view: 'caythue', auth: false },
            ...(wheelItemsMoneyDb.length > 0 || wheelItemsSpinDb.length > 0 ? [{ name: 'Vòng Quay', view: 'vongquay', auth: false }] : []),
            { name: 'Lịch Sử', view: 'lichsu', auth: true }
          ].map((item, idx) => (
            <button key={idx} onClick={() => item.auth ? requireAuth(item.view) : setCurrentView(item.view)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${currentView === item.view ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {item.name}
            </button>
          ))}
          {currentUser?.role === 'admin' && (
            <button onClick={() => setCurrentView('admin')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 relative ${currentView === 'admin' ? 'bg-rose-600 text-white' : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'}`}>
              <Settings size={16} /> Admin
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{unreadCount}</span>}
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {/* --- KHU VỰC HIỂN THỊ SỐ DƯ ĐÃ CHỈNH RESPONSIVE (GIỮ NGUYÊN CHỮ) --- */}
              <div className="flex items-center gap-1.5 sm:gap-3 bg-[#0B1120] border border-slate-700 rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 cursor-pointer hover:border-slate-500 transition-colors overflow-hidden max-w-full">

                <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap" title="Số dư">
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-bold text-[10px] sm:text-sm">{new Intl.NumberFormat('vi-VN').format(currentUser.balance)} đ</span>
                </div>

                <div className="w-[1px] h-3 sm:h-4 bg-slate-700 shrink-0"></div>

                <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap" title="Quỹ tiền thuê bảo lưu">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 shrink-0" />
                  <span className="text-yellow-400 font-bold text-[10px] sm:text-sm">{new Intl.NumberFormat('vi-VN').format(currentUser.rentFund || 0)} đ</span>
                </div>

                <div className="w-[1px] h-3 sm:h-4 bg-slate-700 shrink-0"></div>

                <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap" title="Lượt quay">
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-400 font-bold text-[10px] sm:text-sm">{currentUser.spins || 0} Lượt</span>
                </div>

              </div>
              {/* Nút cá nhân ẩn bớt trên màn hình cực nhỏ vì đã có bottom nav */}
              <button onClick={() => setCurrentView('security')} className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-[#0B1120] p-2 rounded-full sm:rounded-lg sm:px-3 sm:py-2 border border-slate-700 relative">
                <User size={18} />
                <div className="hidden sm:flex items-center gap-1.5 transition-opacity">
                  <span className="text-sm font-semibold">{currentUser.name}</span>
                  {calculateTotalRecharged(currentUser?.id) >= 3000000 && (
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-[#0B1120] text-[9px] px-1.5 py-0.5 rounded font-black shadow-[0_0_10px_rgba(250,204,21,0.5)]">VIP</span>
                  )}
                </div>
                {currentUser.role !== 'admin' && unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{unreadCount}</span>}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentView('login')} className="text-slate-300 hover:text-white text-xs sm:text-sm font-semibold px-2 sm:px-4 py-2 transition-colors">Đăng Nhập</button>
              <button onClick={() => setCurrentView('register')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg shadow-blue-600/20 transition-colors">Đăng Ký</button>            </>
          )}
        </div>
      </div>
    </header>
  );
  const renderForgotPasswordScreen = () => (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#151D2F] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Khôi phục mật khẩu</h2>
        <p className="text-slate-400 text-sm text-center mb-6">Nhập Email bạn đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input name="email" type="email" required className="w-full px-4 py-3 bg-[#0B1120] text-white rounded-lg border border-slate-700 outline-none focus:border-blue-500" placeholder="Nhập Email của bạn..." />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-colors">Gửi Link Khôi Phục</button>
        </form>
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
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mt-6 shadow-lg">Đăng nhập</button>
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

  const renderDashboardScreen = () => {
    // Chỉ lấy những tài khoản chưa bị đánh dấu Đã Bán
    const availableAccounts = accountsDb.filter(acc => !acc.is_sold);

    const gameTabs = ['Tất cả', ...new Set(availableAccounts.map(acc => acc.game))];
    const filteredAccounts = activeTab === 'Tất cả' ? availableAccounts : availableAccounts.filter(acc => acc.game === activeTab);
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-20">
        {renderNavbar()}
        <main className="w-full max-w-[1500px] mx-auto px-4 lg:pr-28 pt-6 space-y-8">
          <section className="relative rounded-2xl border border-slate-800 overflow-hidden shadow-2xl min-h-[350px] flex items-center bg-[#0f172a]">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000&h=800" alt="Gaming Banner" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/90 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-left">
                <div className="inline-block px-4 py-1 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-full border border-rose-500/30 mb-4 backdrop-blur-sm shadow-[0_0_10px_rgba(225,29,72,0.3)]">🔥 UY TÍN - TỐC ĐỘ - BẢO MẬT</div>
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

              <div className="hidden xl:flex flex-col justify-center bg-[#151D2F]/80 backdrop-blur-md border border-slate-700 p-5 rounded-2xl shadow-xl hover:border-blue-500/50 transition-all group w-64 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <Download size={120} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                  <Gamepad2 className="text-blue-500" size={20} /> Tải Awesun
                </h3>
                <p className="text-xs text-slate-400 mb-4 relative z-10">Tải phần mềm điều khiển xa để chuẩn bị sẵn sàng trước khi thuê tài khoản game.</p>
                <button
                  type="button"
                  onClick={() => {
                    window.open('https://down.aweray.com/awesun/windows/Aweray_Remote_2.0.0.45399_x64.exe', '_self');
                    setAwesunGuideType('outside');
                  }}
                  className="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-blue-500/30 shadow-sm relative z-10"
                >
                  <Download size={16} /> Tải xuống ngay
                </button>
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
                <h3 className="text-xl font-bold text-white uppercase">{activeTab === 'Tất cả' ? 'Tất cả tài khoản' : `Tài khoản ${activeTab}`}</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 scrollbar-hide">
                {gameTabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${activeTab === tab ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredAccounts.map(acc => {
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
                  <div key={acc.id} className="bg-[#151D2F] rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col group shadow-lg hover:-translate-y-1 relative">
                    <div className="relative h-44 w-full bg-slate-900 cursor-pointer overflow-hidden" onClick={() => { setViewingAcc(acc); setSelectedImageIndex(0); }}>
                      <img src={acc.coverImage} alt={acc.game} className={`w-full h-full object-cover transition-all duration-500 ${isRented ? 'opacity-50 grayscale hover:grayscale-0' : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'}`} />
                      <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-lg backdrop-blur-md bg-opacity-90 z-30">Mã: {acc.code}</div>
                      {/* TAG TIER GÓC PHẢI - DÁN VÀO DƯỚI DÒNG MÃ ACC */}
                      <span className={`absolute top-2 right-2 text-[10px] font-black px-2.5 py-1 rounded shadow-lg uppercase z-30 ${acc.tier === 'ULVIP' ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white' : acc.tier === 'SVIP' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0B1120]' : 'bg-blue-600 text-white'}`}>
                        {acc.tier || 'VIP'}
                      </span>
                      {isRented && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] z-20 hover:backdrop-blur-0 transition-all pointer-events-none">
                          <span className="text-white font-black text-xs tracking-wider bg-black/80 px-3 py-1 rounded-full mb-1 border border-yellow-500/50">ĐANG CHO THUÊ</span>
                          <span className="text-yellow-400 font-mono font-bold text-sm tracking-widest drop-shadow-md">{timeStr}</span>
                        </div>
                      )}

                    </div>
                    <div className="p-4 flex-1 flex flex-col relative z-10 bg-[#151D2F]">
                      <div className={`w-fit text-xs font-bold px-2 py-0.5 rounded-md mb-2 border ${acc.tagColor}`}>{acc.game}</div>
                      <h4 className="text-sm font-bold text-white mb-3 line-clamp-2 cursor-pointer hover:text-blue-400" title={acc.title} onClick={() => { setViewingAcc(acc); setSelectedImageIndex(0); }}>{acc.title}</h4>
                      <div className="mt-auto border-t border-slate-800 pt-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5 uppercase">MUA ĐỨT</p>
                            <p className="text-base md:text-lg font-black text-rose-500">{new Intl.NumberFormat('vi-VN').format(acc.price)}<span className="text-[10px] md:text-xs opacity-70 ml-0.5">đ</span></p>
                          </div>

                          {acc.rentPricePerHour > 0 && (
                            <div className="text-right border-l border-slate-700 pl-3">
                              <p className="text-[10px] text-slate-500 font-bold mb-0.5 uppercase">THUÊ / GIỜ</p>
                              <p className="text-base md:text-lg font-black text-blue-400">{new Intl.NumberFormat('vi-VN').format(acc.rentPricePerHour)}<span className="text-[10px] md:text-xs opacity-70 ml-0.5">đ</span></p>
                            </div>
                          )}
                        </div>

                        {/* XỬ LÝ NÚT NGOÀI MẶT TIỀN: Phân biệt Chủ Thuê, Khách Vãng Lai và Gói Combo */}
                        {isRented && currentUser?.id === acc.currentRenterId ? (
                          (() => {
                            // Dò xem khách đang thuê gói gì
                            const activeReq = rentRequests.find(r => r.accCode === acc.code && r.status === 'Đã giao acc');
                            const isCombo = activeReq && (activeReq.time.toLowerCase().includes('combo đêm') || activeReq.time.toLowerCase().includes('combo ngày'));

                            return isCombo ? (
                              <button disabled className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-slate-700 text-slate-400 cursor-not-allowed shadow-inner border border-slate-600">
                                <Clock size={16} /> ĐANG THUÊ GÓI COMBO
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStopRent(acc); }}
                                className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-95"
                              >
                                <Clock size={16} className="animate-pulse" /> NGƯNG THUÊ & BẢO LƯU
                              </button>
                            );
                          })()
                        ) : (
                          <button
                            onClick={() => { setViewingAcc(acc); setSelectedImageIndex(0); }}
                            className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${isRented ? 'bg-slate-800 text-yellow-500 border border-slate-700 hover:bg-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'}`}
                          >
                            {isRented ? 'XEM ACC ĐANG THUÊ' : <>XEM CHI TIẾT <ArrowRight size={16} /></>}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </main>
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
      const { error: dbError } = await supabase
        .from('users')
        .update({ name: newName, phone: newPhone, email: newEmail })
        .eq('id', currentUser?.id);

      if (dbError) return showToast("Lỗi cập nhật bảng: " + dbError.message, 'error');

      // 2. Nếu đổi email, phải báo cho hệ thống Auth
      if (newEmail !== currentUser.email) {
        const { error: authErr } = await supabase.auth.updateUser({ email: newEmail });
        if (authErr) {
          return showToast("Lỗi Auth: " + authErr.message, 'error');
        }
        // NẾU ĐỔI EMAIL THÌ ĐẶT LẠI TRẠNG THÁI XÁC THỰC VỀ FALSE
        updatedData.is_email_verified = false;
        showToast("Đã đổi Email! Bạn cần xác thực lại Email mới.", 'success');
      }

      // Cập nhật lại state cục bộ để web không bị treo
      // Cập nhật lại state cục bộ để web không bị treo
      const updatedUser = { ...currentUser, name: newName, phone: newPhone, email: newEmail };
      setCurrentUser(updatedUser);
      localStorage.setItem('shop_cached_user', JSON.stringify(userData));
      setUsersDb(usersDb.map(u => u.id === currentUser?.id ? updatedUser : u)); // Bổ sung dòng này;
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

      // Tự động tìm ID của Admin thật trong hệ thống
      const adminUser = usersDb.find(u => u.role === 'admin');
      if (!adminUser) return showToast("Hiện tại không có Admin trực tuyến!", "error");

      const newMsg = {
        id: `MSG${Date.now()}`,
        senderId: currentUser?.id,
        receiverId: adminUser.id, // Gửi đến đúng ID Admin
        content: input,
        timestamp: Date.now(),
        isRead: false
      };

      await supabase.from('messages').insert([newMsg]);
      setMessagesDb([...messagesDb, newMsg]);
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
              {/* THANH TIẾN TRÌNH LÊN VIP */}
              <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tiến trình VIP</span>
                  <span className="text-sm font-black text-yellow-500">
                    {new Intl.NumberFormat('vi-VN').format(calculateTotalRecharged(currentUser?.id))} / 3.000.000đ
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.4)] transition-all duration-1000"
                    style={{ width: `${Math.min((calculateTotalRecharged(currentUser?.id) / 3000000) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  {calculateTotalRecharged(currentUser?.id) >= 3000000
                    ? "🎉 Chúc mừng! Bạn đã đạt VIP. Nhấn nút bên dưới để xem đặc quyền!"
                    : `Cần nạp thêm ${new Intl.NumberFormat('vi-VN').format(3000000 - calculateTotalRecharged(currentUser?.id))}đ để lên VIP`}
                </p>
                <button onClick={() => setCurrentView('vip_info')} className="w-full mt-4 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 py-2 rounded-lg font-bold text-sm transition-colors border border-yellow-500/20">Xem Đặc Quyền VIP</button>
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

          {profileTab === 'inbox' && (
            <div className="bg-[#151D2F] border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[60vh] min-h-[400px] max-h-[800px]">
              <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#0B1120] rounded-t-2xl">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center"><Gamepad2 size={20} /></div>
                <div>
                  <h3 className="font-bold text-white">Admin Hệ Thống Shop</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 block"></span> Luôn sẵn sàng hỗ trợ</p>
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
                          <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
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

    const removeAccents = (str) => {
      return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D') : '';
    }
    // Thay thế đoạn transferContent cũ bằng đoạn này
    const transferContent = `NAP ${currentUser?.phone}`;
    const qrUrl = pendingDeposit?.amount ? `https://img.vietqr.io/image/tpbank-10002973552-compact2.png?amount=${pendingDeposit.amount}&addInfo=${encodeURIComponent(transferContent)}` : `https://img.vietqr.io/image/tpbank-10002973552-compact2.png`;

    const handleCreateDepositDraft = (e) => {
      e.preventDefault();

      // 2. CHẶN TẠO LỆNH NẾU ĐANG CÓ LỆNH CHỜ
      if (hasPendingRequest) {
        return showToast("Bạn đang có lệnh nạp chờ duyệt. Vui lòng đợi Admin xử lý!", "error");
      }

      const parsedAmount = parseInt(depositAmount);
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

      // CHẶN BẤM ĐÚP XÁC NHẬN KHI ĐÃ CÓ LỆNH CHỜ
      if (hasPendingRequest) {
        setDepositStep(1);
        setPendingDeposit(null);
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
    };

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
        {renderNavbar()}
        <div className="w-full max-w-[1400px] mx-auto mt-8 px-4 lg:pr-28 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            {depositStep === 1 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <QrCode size={48} className="text-slate-500 mb-4" />
                <h3 className="text-white font-bold mb-2">Chưa có mã QR</h3>
                <p className="text-sm text-slate-400">Vui lòng điền số tiền ở Form bên cạnh và bấm Tạo lệnh để lấy mã quét.</p>
              </div>
            )}

            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2"><QrCode className="text-blue-500" /> Nạp Tiền Chuyển Khoản</h2>
            <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 mb-6 flex justify-center bg-white shadow-inner">
              <img src={qrUrl} alt="QR Code" className="max-w-[200px] rounded-lg" />
            </div>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Ngân hàng:</span><span className="font-bold text-white">TPBank</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Số tài khoản:</span><span className="font-bold text-emerald-400 flex items-center gap-2">10002973552 <button onClick={() => copyToClipboard('10002973552')} className="relative z-20"><Copy size={14} className="text-slate-500 hover:text-white" /></button></span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Chủ tài khoản:</span><span className="font-bold text-white uppercase text-right ml-2 line-clamp-1">NHAM GIA TIEN</span></div>
              <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-400">Nội dung CK:</span><span className="font-bold text-rose-400 flex items-center justify-end gap-2 ml-2 text-right">{transferContent} <button onClick={() => copyToClipboard(transferContent)} className="relative z-20 shrink-0"><Copy size={14} className="text-slate-500 hover:text-white" /></button></span></div>
              {depositStep === 2 && pendingDeposit && (
                <div className="flex justify-between border-b border-slate-800 pb-2 bg-emerald-500/10 p-2 rounded mt-2"><span className="text-slate-400 font-bold">Số tiền:</span><span className="font-black text-emerald-400">{new Intl.NumberFormat('vi-VN').format(pendingDeposit.amount)} đ</span></div>
              )}
            </div>
            <p className="text-[10px] md:text-xs text-yellow-500 flex gap-1"><AlertCircle size={14} className="shrink-0" /> Vui lòng chuyển đúng Số tiền và Nội dung để được duyệt tự động.</p>
          </div>

          <div className="bg-[#151D2F] p-6 rounded-2xl border border-slate-800 h-fit shadow-xl">
            <h3 className="font-bold text-white mb-4 text-lg">Tạo Lệnh Nạp</h3>

            {depositStep === 1 ? (
              <form onSubmit={handleCreateDepositDraft}>
                <p className="text-sm text-slate-400 mb-4">Nhập số tiền để hệ thống tạo mã quét QR thanh toán nhanh cho bạn.</p>
                <div className="mb-4">
                  <label className="text-xs text-slate-400 font-bold mb-1 block">Số tiền cần nạp (Bội số 10.000đ)</label>
                  <input type="number" step="10000" min="10000" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="Nhập số tiền..." className="w-full p-4 bg-[#0B1120] border border-slate-700 rounded-xl text-white focus:border-emerald-500 outline-none text-lg font-bold" required />
                </div>

                <div className="mb-4">
                  <label className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><Ticket size={14} className="text-rose-400" /> Mã Khuyến Mãi (Nếu có)</label>
                  <input type="text" value={voucherInput} onChange={e => setVoucherInput(e.target.value.toUpperCase())} placeholder="Nhập mã voucher..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-rose-400 focus:border-rose-500 outline-none text-base font-bold uppercase" />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white transition-colors shadow-lg shadow-blue-600/20 text-base md:text-lg flex items-center justify-center gap-2">Tạo Mã QR Nạp</button>
              </form>
            ) : (
              <div className="text-center bg-[#0B1120] p-4 md:p-6 rounded-xl border border-emerald-500/30">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <QrCode size={30} className="text-emerald-400" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Đang chờ thanh toán</h4>
                <p className="text-sm text-slate-400 mb-6">Hãy sử dụng App Ngân hàng quét mã QR bên cạnh để chuyển số tiền <strong className="text-emerald-400">{new Intl.NumberFormat('vi-VN').format(pendingDeposit.amount)}đ</strong>. Sau khi chuyển xong, hãy nhấn nút bên dưới.</p>

                <div className="flex gap-2">
                  <button onClick={() => { setDepositStep(1); setPendingDeposit(null); }} className="w-1/3 bg-slate-800 hover:bg-slate-700 py-3 md:py-4 rounded-xl font-bold text-white transition-colors text-xs md:text-sm">Hủy Bỏ</button>
                  <button onClick={handleConfirmTransfer} className="w-2/3 bg-emerald-600 hover:bg-emerald-500 py-3 md:py-4 rounded-xl font-bold text-white transition-colors shadow-lg shadow-emerald-600/20 text-xs md:text-sm flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Đã Chuyển Khoản</button>
                </div>
              </div>
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
                        <span className="font-bold text-white block">{new Intl.NumberFormat('vi-VN').format(d.amount)}đ</span>
                        {d.bonusAmount > 0 && <span className="text-[10px] text-rose-400 font-bold">+{new Intl.NumberFormat('vi-VN').format(d.bonusAmount)}đ (Mã: {d.voucherCode})</span>}
                        <span className="text-[10px] text-slate-500 block mt-0.5">{d.date}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold ${d.status === 'Thành công' ? 'bg-emerald-500/10 text-emerald-400' : d.status === 'Từ chối' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{d.status}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLichsuScreen = () => {
    // Bộ lọc dữ liệu siêu chuẩn cho từng Tab
    const myTransactions = transactionsDb.filter(t => t.user === currentUser?.name);

    const historyBuy = myTransactions.filter(t => t.type === 'buy_acc' && !t.action.includes('Cày thuê') && !t.action.includes('cày thuê'));
    const historyRent = myTransactions.filter(t => t.type?.includes('rent') || t.type?.includes('fund') || t.type?.includes('deposit_') || t.action?.toLowerCase().includes('thuê nick') || t.action?.toLowerCase().includes('quy đổi') || t.action?.toLowerCase().includes('hoàn cọc'));
    const historySpin = myTransactions.filter(t => t.type === 'spin_win' && t.amount !== 0 && !t.isSpinCost);
    const historyBoost = boostingRequests.filter(r => r.user === currentUser?.name);
    const historyDeposit = depositRequests.filter(d => d.userId === currentUser?.id);

    // Cấu hình các Tab
    const tabs = [
      { id: 'buy', name: 'Mua Acc', icon: <Gamepad2 size={16} />, data: historyBuy },
      { id: 'rent', name: 'Thuê Acc', icon: <Clock size={16} />, data: historyRent },
      { id: 'spin', name: 'Vòng Quay', icon: <Gift size={16} />, data: historySpin },
      { id: 'boost', name: 'Cày Thuê', icon: <Target size={16} />, data: historyBoost },
      { id: 'deposit', name: 'Nạp Tiền', icon: <Wallet size={16} />, data: historyDeposit }
    ];

    const currentData = tabs.find(t => t.id === historyTab)?.data || [];
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
                      <p className="text-[10px] md:text-xs text-slate-400 mt-1">TK: <span className="font-mono text-white">{req.info.username}</span> | Nền tảng: <span className="text-white">{req.info.loginMethod}</span></p>
                      <p className="text-[10px] text-slate-500 mt-1.5">{req.date}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className={`text-xs font-bold inline-block px-3 py-1 rounded mt-1 
                        ${req.status === 'Hoàn thành' ? 'text-emerald-500 bg-emerald-500/10' : req.status === 'Đang cày' ? 'text-blue-400 bg-blue-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                        {req.status === 'Hoàn thành' ? <CheckCircle2 size={12} className="inline mr-1" /> : req.status === 'Đang cày' ? <RefreshCw size={12} className="inline mr-1 animate-spin" /> : <Clock size={12} className="inline mr-1" />}
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
                      <p className="text-[10px] md:text-xs text-slate-500 mt-1">{d.date}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-black text-base md:text-lg text-emerald-400">
                        +{new Intl.NumberFormat('vi-VN').format(d.amount)}đ
                      </p>
                      {d.bonusAmount > 0 && <p className="text-[10px] text-rose-400 font-bold mb-1">+ {new Intl.NumberFormat('vi-VN').format(d.bonusAmount)}đ (Voucher)</p>}
                      <p className={`text-[10px] md:text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 
                        ${d.status === 'Thành công' ? 'text-emerald-500 bg-emerald-500/10' : d.status === 'Từ chối' ? 'text-rose-400 bg-rose-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                        {d.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderCayThueScreen = () => {
    const uniqueBoostingGames = ['Tất cả', ...new Set(boostingDb.map(b => b.game))];
    const filteredBoosting = activeBoostingTab === 'Tất cả' ? boostingDb : boostingDb.filter(b => b.game === activeBoostingTab);

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-10">
        {renderNavbar()}
        {/* Đã mở rộng max-w và thêm lề phải (pr-24) để né 3 nút liên hệ */}
        <div className="w-full max-w-[1400px] mx-auto mt-8 px-4 md:px-6 lg:pr-24">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center gap-2"><Target className="text-blue-500" /> Dịch Vụ Cày Thuê</h2>
            <p className="text-slate-400 mt-2 text-sm md:text-base">Uy tín, tốc độ, bảo mật tuyệt đối. Giá tốt nhất thị trường.</p>
          </div>

          {/* --- KHU VỰC CHỌN LỌC GAME --- */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {uniqueBoostingGames.map(tab => (
              <button key={tab} onClick={() => setActiveBoostingTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors border ${activeBoostingTab === tab ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>
                {tab === 'Tất cả' ? 'Tất cả dịch vụ' : tab}
              </button>
            ))}
          </div>

          {/* Tự động chia lên 4 cột trên màn hình rộng (xl) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredBoosting.length === 0 ? (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#151D2F] shadow-lg">
                <Target size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">Đang cập nhật các gói dịch vụ cho {activeBoostingTab}...</p>
              </div>
            ) : filteredBoosting.map(b => (
              <div key={b.id} className="bg-[#151D2F] border border-slate-800 rounded-2xl p-5 md:p-6 hover:border-blue-500/50 transition-colors shadow-xl group flex flex-col overflow-hidden">

                {/* --- ẢNH HIỂN THỊ Ở TRANG KHÁCH (TỰ MỞ RỘNG & PHÓNG TO ĐƯỢC) --- */}
                {b.image && (
                  <div
                    className="w-full mb-4 rounded-xl overflow-hidden shrink-0 border border-slate-700/50 shadow-inner relative group/img cursor-zoom-in bg-black/40"
                    onClick={() => setFullScreenImage(b.image)}
                    title="Bấm để phóng to ảnh"
                  >
                    <img
                      src={b.image}
                      className="w-full h-auto object-contain transition-transform duration-500 group-hover/img:scale-105"
                      alt={b.title}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="bg-black/60 p-2 rounded-full text-white flex items-center gap-1 text-xs font-bold">
                        <ZoomIn size={16} /> Phóng to
                      </div>
                    </div>
                  </div>
                )}
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-md inline-block mb-3 w-fit">{b.game}</span>
                <h3 className="text-base md:text-lg font-bold text-white mb-2 leading-tight">{b.title}</h3>
                {/* Giữ nguyên các phần mô tả và giá tiền bên dưới... */}              <p className="text-xs md:text-sm text-slate-400 mb-6 h-12 line-clamp-2">{b.desc}</p>
                <div className="flex justify-between items-end border-t border-slate-800 pt-4">
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1 font-bold">GIÁ TỪ</p>
                    <p className="text-rose-500 font-black text-lg md:text-xl">{new Intl.NumberFormat('vi-VN').format(b.price)}đ</p>
                  </div>
                  <button onClick={() => {
                    if (!currentUser) return requireAuth('login');
                    if (!currentUser.is_email_verified) return showToast("Vui lòng vào mục Cá nhân để xác thực Email trước khi giao dịch!", "error");
                    setBoostingModalData(b);
                  }} className="bg-blue-600 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 md:group-hover:-translate-y-1 transition-transform">Đặt Lịch</button>
                </div>
              </div>
            ))}
          </div>
          {/* LỊCH SỬ CÀY THUÊ RIÊNG CHO BẠN */}
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
      // 1. Chặn khách vãng lai (Chưa đăng nhập mà đòi quay)
      if (!currentUser) {
        showToast("Vui lòng đăng nhập tài khoản để tham gia Vòng Quay!", 'error');
        setCurrentView('login');
        return;
      }

      const isUsingMoney = playMode === 'money';
      const requiredCost = isUsingMoney ? wheelConfig.moneyCost : wheelConfig.spinCost;

      if (isUsingMoney) {
        if (currentUser.balance < requiredCost) return showToast(`Số dư của bạn không đủ (cần ${new Intl.NumberFormat('vi-VN').format(requiredCost)}đ)!`, 'error');
      } else {
        if ((currentUser.spins || 0) < requiredCost) return showToast(`Bạn không đủ lượt quay (cần ${requiredCost} lượt)!`, 'error');
      }

      if (isSpinning) return;

      const updatedUser = { ...currentUser };
      if (isUsingMoney) {
        updatedUser.balance -= requiredCost;
      } else {
        updatedUser.spins -= requiredCost;
      }

      // =========================================================
      // LẤY CÁI LOA Ở DƯỚI CÙNG TRANG WEB LÊN ĐỂ PHÁT NHẠC QUAY
      // =========================================================
      const spinAudio = document.getElementById('spinSound');
      if (spinAudio) {
        spinAudio.currentTime = 0;
        spinAudio.volume = 0.5;
        spinAudio.play().catch(e => console.log("Trình duyệt chặn:", e));
      }

      // Gọi máy chủ xử lý
      await supabase.from('users').update({ balance: updatedUser.balance, spins: updatedUser.spins }).eq('id', currentUser.id);

      setCurrentUser(updatedUser);
      localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
      setUsersDb(usersDb.map(u => u.id === currentUser?.id ? updatedUser : u));

      const newSpinTx = {
        id: `TX${Date.now()}`, user: currentUser.name,
        action: `Quay Vòng Quay (${isUsingMoney ? 'Tiền' : 'Lượt'})`, amount: requiredCost,
        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'), status: 'Thành công',
        type: 'spin',
        isSpinCost: !isUsingMoney,
        // --- SỬA LẠI THÀNH updatedUser NHƯ SAU ---
        accDetails: { balanceAfter: updatedUser.balance, fundAfter: updatedUser.rentFund || 0 }
        // -----------------------------------------
      };

      await supabase.from('transactions').insert([newSpinTx]);
      setTransactionsDb([newSpinTx, ...transactionsDb]);

      setIsSpinning(true);

      let rand = Math.random() * 100;
      let cumulative = 0;
      let winningIndex = 0;

      for (let i = 0; i < activeDb.length; i++) {
        let rateNum = parseFloat(activeDb[i].rate);
        cumulative += rateNum;
        if (rand <= cumulative) {
          winningIndex = i;
          break;
        }
      }

      const winningItem = activeDb[winningIndex];

      const N = activeDb.length;
      const sliceAngle = 360 / N;
      const centerAngle = winningIndex * sliceAngle + (sliceAngle / 2);
      const currentBase = rotation % 360;
      const randomOffset = (Math.random() * sliceAngle * 0.6) - (sliceAngle * 0.3);
      const targetRotation = rotation + (360 - currentBase) + 1800 + (360 - centerAngle) + randomOffset;

      setRotation(targetRotation);

      setTimeout(() => {
        setIsSpinning(false);
        if (spinAudio) {
          spinAudio.pause(); // Tắt nhạc quay
          spinAudio.currentTime = 0;
        }

        // =========================================================
        // LẤY LOA Ở DƯỚI CÙNG LÊN ĐỂ PHÁT TIẾNG TRÚNG/TRƯỢT
        // =========================================================
        const winAudio = document.getElementById('winSound');
        const loseAudio = document.getElementById('loseSound');

        if (winningItem.type !== 'none') {
          if (winAudio) { winAudio.currentTime = 0; winAudio.volume = 0.8; winAudio.play().catch(e => { }); }
        } else {
          if (loseAudio) { loseAudio.currentTime = 0; loseAudio.volume = 0.8; loseAudio.play().catch(e => { }); }
        }

        const prizeValue = Number(winningItem.value) || 0;

        if (winningItem.type === 'money') {
          setGiftModalData({ item: winningItem, prizeValue: prizeValue, prizeType: 'money', updatedUser: updatedUser });
        } else if (winningItem.type === 'spin') {
          setGiftModalData({ item: winningItem, prizeValue: prizeValue, prizeType: 'spin', updatedUser: updatedUser });
        } else if (winningItem.type === 'fund') {
          setGiftModalData({ item: winningItem, prizeValue: prizeValue, prizeType: 'fund', updatedUser: updatedUser });
        } else if (winningItem.type === 'other') {
          setGiftModalData({ item: winningItem, prizeValue: 0, prizeType: 'other', updatedUser: updatedUser });
        } else {
          setGiftModalData({ item: winningItem, prizeValue: 0, prizeType: 'none', updatedUser: updatedUser, isLost: true });
        }
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
        <div className="w-full max-w-[1400px] mx-auto px-4 lg:pr-28 mt-4 md:mt-8 text-center relative z-10">

          {/* BỐ CỤC CHIA CỘT TRÊN MÁY TÍNH (VÒNG QUAY TRÁI - LỊCH SỬ PHẢI) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 mb-12 items-start">

            {/* CỘT TRÁI: CHỨA VÒNG QUAY (Chiếm 2 phần) */}
            <div className="lg:col-span-2 flex flex-col items-center">

              {/* TIÊU ĐỀ NẰM NGAY ĐẦU CỘT TRÁI, CÂN ĐỐI VỚI VÒNG QUAY */}
              <h2 className="text-2xl md:text-4xl font-black text-white flex items-center justify-center gap-2 md:gap-3 mb-6 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]"><Gift className="text-rose-500 w-8 h-8 md:w-9 md:h-9" /> VÒNG QUAY NHÂN PHẨM</h2>

              <div className="flex bg-[#151D2F] p-1 md:p-1.5 rounded-xl border border-slate-800 shadow-lg mx-auto w-fit mb-8 relative z-20">
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
                      const timeOnly = tx.date.split(' ').pop();

                      // Dùng Regex "tận diệt" mọi chữ dư thừa (Cả lịch sử cũ và mới)
                      const cleanPrizeName = tx.action
                        .replace(/Trúng phần thưởng:/gi, '')
                        .replace(/Trúng thưởng:/gi, '')
                        .replace(/Cộng/gi, '')
                        .trim();

                      return (
                        <span key={idx} className="text-white text-xs md:text-sm mx-6 flex items-center gap-2">
                          <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                          <span className="text-slate-400">[{timeOnly}]</span>
                          <span className="font-bold text-blue-400">{tx.user}</span> vừa trúng phần thưởng
                          <span className="font-black text-rose-400">{cleanPrizeName}</span>
                        </span>
                      )
                    })}
                    {recentWinners.map((tx, idx) => {
                      const timeOnly = tx.date.split(' ').pop();
                      const cleanPrizeName = tx.action
                        .replace(/Trúng phần thưởng:/gi, '')
                        .replace(/Trúng thưởng:/gi, '')
                        .replace(/Cộng/gi, '')
                        .trim();

                      return (
                        <span key={`dup-${idx}`} className="text-white text-xs md:text-sm mx-6 flex items-center gap-2">
                          <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                          <span className="text-slate-400">[{timeOnly}]</span>
                          <span className="font-bold text-blue-400">{tx.user}</span> vừa trúng phần thưởng
                          <span className="font-black text-rose-400">{cleanPrizeName}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* KHUNG VÒNG QUAY */}
              <div className="relative w-full max-w-[320px] md:max-w-[380px] mx-auto aspect-square flex items-center justify-center p-4 md:p-6 mb-8 md:mb-12 mt-4">
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
                <div className="w-full h-full relative rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] border-[6px] md:border-[10px] border-slate-700 bg-[#0B1120] z-20"
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
            <div className="lg:col-span-1 flex flex-col bg-[#151D2F] rounded-2xl border border-slate-800 overflow-hidden shadow-xl h-[450px] md:h-[550px] w-full mt-6 lg:mt-[110px]">
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
                      const isWin = tx.action.includes('Trúng');
                      return (
                        <div key={idx} className="p-3 bg-[#0B1120] rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors text-left">
                          <div className="flex-1 pr-2">
                            <p className={`font-bold text-sm line-clamp-1 ${isWin ? 'text-white' : 'text-slate-400'}`}>
                              <Gift size={14} className={`inline mr-1.5 -mt-0.5 ${isWin ? "text-rose-500" : "text-slate-600"}`} />
                              {tx.action}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">{tx.date}</p>

                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-black text-sm text-emerald-400">
                              {tx.amount === 0
                                ? <span className="text-slate-500 text-xs">Trượt</span>
                                : (tx.isSpinCost ? `+${Math.abs(tx.amount)} Lượt` : `+${new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ`)
                              }
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

              <button onClick={async () => {
                let winUser = { ...giftModalData.updatedUser };
                // Phân loại chữ ghi vào lịch sử: Trúng hay Trượt
                let actionText = giftModalData.isLost ? `Quay vào ô: ${giftModalData.item.name || 'Trượt'}` : `Trúng phần thưởng: ${giftModalData.item.name}`;
                let txAmount = 0;
                let isSpin = false;

                // Nếu Trúng quà thì mới thực hiện cộng tiền và trừ kho
                if (!giftModalData.isLost && (giftModalData.prizeType === 'money' || giftModalData.prizeType === 'spin' || giftModalData.prizeType === 'fund' || giftModalData.prizeType === 'other')) {

                  if (giftModalData.prizeType === 'money' && giftModalData.prizeValue > 0) {
                    winUser.balance += giftModalData.prizeValue;
                    txAmount = -giftModalData.prizeValue;
                  } else if (giftModalData.prizeType === 'spin' && giftModalData.prizeValue > 0) {
                    winUser.spins = (winUser.spins || 0) + giftModalData.prizeValue;
                    txAmount = -giftModalData.prizeValue;
                    isSpin = true;
                  } else if (giftModalData.prizeType === 'fund' && giftModalData.prizeValue > 0) {
                    winUser.rentFund = (winUser.rentFund || 0) + giftModalData.prizeValue;
                    txAmount = -giftModalData.prizeValue;
                  }

                  // Cập nhật Số dư/Lượt quay/Quỹ lên Supabase
                  await supabase.from('users').update({
                    balance: winUser.balance,
                    spins: winUser.spins,
                    rentFund: winUser.rentFund
                  }).eq('id', winUser.id);

                  // Trừ số lượng quà trong kho
                  const newQuantity = (giftModalData.item.quantity || 999) - 1;
                  await supabase.from('wheel_items').update({ quantity: Math.max(0, newQuantity) }).eq('id', giftModalData.item.id);

                  // Cập nhật lại số lượng rớt xuống trên màn hình khách
                  const updateWheelState = (prevDb) => prevDb.map(w => w.id === giftModalData.item.id ? { ...w, quantity: Math.max(0, newQuantity) } : w);
                  if (giftModalData.item.wheel_type === 'money') {
                    setWheelItemsMoneyDb(updateWheelState(wheelItemsMoneyDb));
                  } else {
                    setWheelItemsSpinDb(updateWheelState(wheelItemsSpinDb));
                  }
                }

                // GHI LỊCH SỬ CHO CẢ TRÚNG VÀ TRƯỢT LÊN DATABASE
                const newTx = {
                  id: `TX${Date.now()}`,
                  user: winUser.name,
                  action: actionText,
                  amount: txAmount,
                  date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                  status: 'Thành công',
                  type: 'spin_win',
                  isSpinCost: isSpin,
                  // CHÈN SỐ DƯ CHO VÒNG QUAY Ở ĐÂY LÀ CHUẨN NHẤT:
                  accDetails: { balanceAfter: winUser.balance, fundAfter: winUser.rentFund || 0 }
                };
                const { data: txData } = await supabase.from('transactions').insert([newTx]).select();

                // Cập nhật lại giao diện Web
                setCurrentUser(winUser);
                setUsersDb(usersDb.map(u => u.id === winUser.id ? winUser : u));
                if (txData) setTransactionsDb([txData[0], ...transactionsDb]);

                // Đóng hộp quà
                setGiftModalData(null);
                setIsGiftOpened(false);
              }} className={`w-full font-black text-lg md:text-xl py-3 md:py-4 rounded-xl transition-all uppercase ${giftModalData.isLost ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-[#0B1120] shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105'}`}>
                {giftModalData.isLost ? 'ĐÓNG LẠI' : 'NHẬN QUÀ NGAY'}
              </button>
            </div>
          </div>
        )}
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
    const handleFileUpload = (e, isCover) => {
      const files = Array.from(e.target.files);
      if (isCover && files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => setAdminCoverImage(reader.result);
        reader.readAsDataURL(files[0]);
      } else if (!isCover) {
        files.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => setAdminDetailImages(prev => [...prev, reader.result]);
          reader.readAsDataURL(file);
        });
      }
    };

    const handleSaveAccount = async (e) => {
      e.preventDefault();

      if (isGlobalProcessing) return;
      setIsGlobalProcessing(true);
      setShowAccModal(false);
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

        const tagsString = e.target.tags.value;
        const validRentOptions = adminRentOptions.filter(opt => opt.time.trim() !== '' && opt.price !== '').map(opt => ({ time: opt.time, bonusTime: opt.bonusTime || '', price: parseInt(opt.price) }));
        // Tạo đối tượng dữ liệu. Lưu ý: BỎ trường 'id' đi để Supabase tự động sinh ID (UUID).
        const accData = {
          code: e.target.code.value,
          tier: e.target.tier.value,
          game: e.target.game.value,
          title: e.target.title.value,
          tags: tagsString,
          price: parseInt(e.target.price.value),
          rentPricePerHour: parseInt(e.target.rentPricePerHour.value) || 0,
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
            setShowAccModal(true); // Mở lại nếu lỗi
          } else if (data && data.length > 0) {
            let savedAcc = { ...data[0], tags: tagsString.split(',').map(t => t.trim()) };
            setAccountsDb(accountsDb.map(a => a.id === editingAccount.id ? savedAcc : a));
            showToast("Đã lưu chỉnh sửa Nick!");
          }
        } else {
          // Gửi lệnh THÊM MỚI lên Supabase
          const { data, error } = await supabase.from('accounts').insert([accData]).select();

          if (error) {
            showToast("Lỗi đăng bán: " + error.message, 'error');
            setShowAccModal(true); // Mở lại nếu lỗi
          } else if (data && data.length > 0) {
            let newAcc = { ...data[0], tags: tagsString.split(',').map(t => t.trim()) };
            setAccountsDb([newAcc, ...accountsDb]);
            showToast("Đăng bán Nick thành công!");
          }
        }
      } catch (err) {
        showToast("Lỗi hệ thống: " + err.message, 'error');
        setShowAccModal(true);
      } finally {
        setIsGlobalProcessing(false);
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
        let finalImage = adminBoostingImage;
        if (adminBoostingImage && adminBoostingImage.startsWith('data:image')) {
          showToast("Đang tải ảnh lên Server ImgBB...", "info");
          finalImage = await uploadToImgBB(adminBoostingImage);
        } else {
          showToast("Đang xử lý dịch vụ...", "info");
        }

        const type = e.target.boostType.value;
        const boostData = {
          id: editingBoosting ? editingBoosting.id : Date.now(),
          type: type,
          require_login: type === 'event' ? e.target.requireLogin.checked : true,
          price: parseInt(e.target.price.value),
          image: finalImage,
          game: e.target.game?.value || '', // <--- Đã mở khóa: Bắt buộc lấy Tên Game cho cả Sự kiện
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
      }
    };
    const handleBoostingImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setAdminBoostingImage(reader.result);
        reader.readAsDataURL(file);
      }
    };
    const handleWheelImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setAdminWheelImage(reader.result);
        reader.readAsDataURL(file);
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

      await supabase.from('messages').insert([newMsg]);
      setMessagesDb([...messagesDb, newMsg]);
      e.target.reset();
      setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
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
    const usersWithMessagesIds = [...new Set(messagesDb.map(m => m.senderId === currentUser?.id ? m.receiverId : m.senderId))];
    const chatUsersList = usersDb.filter(u => usersWithMessagesIds.includes(u.id));

    // Tự động tìm kiếm toàn bộ khách hàng nếu Admin gõ vào ô tìm kiếm
    const displayChatUsers = adminMessageSearch.trim() !== ''
      ? usersDb.filter(u => u.role !== 'admin' && (u.name.toLowerCase().includes(adminMessageSearch.toLowerCase()) || u.phone.includes(adminMessageSearch)))
      : chatUsersList;

    // Lọc nội dung chat giữa Admin và Khách đang chọn
    const activeMessages = activeChatUser ? messagesDb.filter(m =>
      (m.senderId === activeChatUser.id && m.receiverId === currentUser?.id) ||
      (m.senderId === currentUser?.id && m.receiverId === activeChatUser.id)
    ).sort((a, b) => a.timestamp - b.timestamp) : [];

    const totalUnreadAdmin = messagesDb.filter(m => m.receiverId === currentUser?.id && !m.isRead).length;

    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-20">
        {renderNavbar()}
        <main className="w-full max-w-[1500px] mx-auto px-4 lg:pr-28 pt-6 space-y-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <h2 className="text-2xl font-black text-white flex items-center gap-2 whitespace-nowrap"><Settings className="text-rose-500" /> PANEL ADMIN</h2>
            <div className="flex bg-[#151D2F] p-1.5 rounded-xl border border-slate-800 whitespace-nowrap shadow-lg">
              {['users', 'accs', 'deposits', 'rentreqs', 'boosting', 'wheel', 'messages'].map(tab => {
                const labels = { users: 'Người Dùng', accs: 'Kho Nick', deposits: 'Nạp Tiền', rentreqs: 'Thuê Nick', boosting: 'Cày Thuê', wheel: 'Vòng Quay', messages: 'Hộp Thư' };
                return <button key={tab} onClick={() => setAdminTab(tab)} className={`px-3 md:px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all relative ${adminTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
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

                <div className="mb-4 flex relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" value={adminSearchUser} onChange={(e) => { setAdminSearchUser(e.target.value); setVisibleUsersCount(10); }} placeholder="Tìm theo tên, SĐT hoặc Email..." className="w-full pl-10 pr-4 py-2 bg-[#0B1120] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
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
              <div className="flex flex-col md:flex-row h-[600px]">
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800 bg-[#0B1120] flex flex-col">
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
                        const unread = messagesDb.filter(m => m.senderId === u.id && !m.isRead).length;
                        return (
                          <div key={u.id} onClick={async () => {
                            setActiveChatUser(u);
                            setMessagesDb(messagesDb.map(m => m.senderId === u.id ? { ...m, isRead: true } : m));
                            await supabase.from('messages').update({ isRead: true }).eq('senderId', u.id); // Lưu lên DB chống F5
                            setTimeout(() => chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                          }} className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors flex justify-between items-center ${activeChatUser?.id === u.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400"><User size={20} /></div>
                              <div>
                                <p className="font-bold text-sm text-white">{u.name}</p>
                                <p className="text-xs text-slate-500">{u.phone}</p>
                              </div>
                            </div>
                            {unread > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{unread}</span>}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#151D2F]">
                  {activeChatUser ? (
                    <>
                      <div className="p-4 border-b border-slate-800 bg-[#0B1120] flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center"><User size={20} /></div>
                        <div>
                          <h3 className="font-bold text-white">{activeChatUser.name}</h3>
                          <p className="text-xs text-slate-500">Đang hỗ trợ khách hàng</p>
                        </div>
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                        {activeMessages.map(m => {
                          const isMine = m.senderId === currentUser?.id;
                          return (
                            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? 'bg-rose-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                <p className="text-sm">{m.content}</p>
                                <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-rose-200' : 'text-slate-400'}`}>{new Date(m.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={chatMessagesEndRef} />
                      </div>
                      <div className="p-4 border-t border-slate-800 bg-[#0B1120]">
                        <form onSubmit={handleAdminSendMessage} className="flex gap-2">
                          <input name="message" type="text" placeholder={`Trả lời ${activeChatUser.name}...`} className="flex-1 bg-[#151D2F] border border-slate-700 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500" autoComplete="off" />
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
                <button onClick={() => { setEditingAccount(null); setAdminCoverImage(null); setAdminDetailImages([]); setAdminRentOptions([{ time: '', price: '' }]); setShowAccModal(true); }} className="mb-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-emerald-600/20 transition-transform hover:scale-105"><PlusCircle size={18} /> Đăng bán Nick mới</button>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {accountsDb.map(acc => (
                    <div key={acc.id} className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 flex gap-4 items-center group hover:border-blue-500/50 transition-colors">
                      <img src={acc.coverImage} className="w-28 h-20 object-cover rounded-lg shadow-md" />
                      <div className="flex-1">
                        <p className="font-bold text-white line-clamp-1 mb-1">{acc.title}</p>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">Mã: {acc.code}</span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">{acc.game}</span>
                        </div>
                        <p className="text-emerald-400 font-black text-sm">{new Intl.NumberFormat('vi-VN').format(acc.price)}đ</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => { setEditingAccount(acc); setAdminCoverImage(acc.coverImage); setAdminDetailImages(acc.detailImages || []); setAdminRentOptions(acc.rentOptions?.length > 0 ? acc.rentOptions : [{ time: '', price: '' }]); setShowAccModal(true); }} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors" title="Chỉnh sửa"><Edit size={18} /></button>
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
                    showToast("Lưu cài đặt khuyến mãi nạp thành công!");
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
                        {depositRequests.slice(0, visibleDepsAdmin).map(d => (
                          <tr key={d.id} className="hover:bg-slate-800/30">
                            <td className="p-4"><div className="text-slate-300 font-mono text-xs">{d.id}</div><div className="text-[10px] text-slate-500 mt-1">{d.date}</div></td>
                            <td className="p-4 text-blue-400 font-bold">{d.user} <span className="text-[10px] text-slate-500 font-normal ml-1">(ID: {d.userId})</span></td>
                            <td className="p-4">
                              <span className="text-emerald-400 font-black text-base block">{new Intl.NumberFormat('vi-VN').format(d.amount)}đ</span>
                              {d.bonusAmount > 0 && <span className="text-[10px] text-rose-400 font-bold block mt-0.5">Khuyến mãi +{new Intl.NumberFormat('vi-VN').format(d.bonusAmount)}đ (Mã: {d.voucherCode})</span>}
                            </td>
                            <td className="p-4 flex justify-center gap-2">
                              {d.status === 'Chờ duyệt' ?
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
                                        showToast("Đã từ chối lệnh!");
                                      }
                                    });
                                  }} className="bg-rose-500/20 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-colors">Từ chối</button>
                                </>
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
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6 text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-sm">
                  <AlertCircle size={18} /> Hướng dẫn: Mở phần mềm Awesun trên máy tính, nhập ID & Passcode của khách để điều khiển máy khách và đăng nhập nick game.
                </div>
                {rentRequests.length === 0 ? <div className="text-center text-slate-500 p-10">Chưa có yêu cầu thuê nick nào.</div> :
                  <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2" onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    if (scrollTop + clientHeight >= scrollHeight - 20) setVisibleRentsAdmin(prev => prev + 5);
                  }}>
                    {rentRequests.slice(0, visibleRentsAdmin).map(r => {
                      const accObj = accountsDb.find(a => a.code === r.accCode);
                      const isStillRented = accObj?.rentedUntil && accObj.rentedUntil > Date.now();

                      return (
                        <div key={r.id} className="bg-[#0B1120] p-5 rounded-xl border border-slate-700 flex flex-col lg:flex-row gap-6 items-start lg:items-center relative overflow-hidden group">
                          {r.status === 'Đã giao acc' && isStillRented && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">ĐANG THUÊ</div>}
                          {r.status === 'Đã trả acc' && <div className="absolute top-0 right-0 bg-slate-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">ĐÃ TRẢ ACC</div>}
                          {r.status === 'Từ chối' && <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-md">ĐÃ TỪ CHỐI</div>}
                          <div className="w-full lg:w-40 h-28 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden border border-slate-800 shrink-0 relative">
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
                            <div className="flex justify-between border-b border-slate-800 pb-2 w-full relative">
                              <p>
                                <span className="text-slate-400">Khách:</span>
                                <span className="text-blue-400 font-bold text-base ml-1">{r.user}</span>
                                {r.info?.kycMethod === 'vip' && <span className="bg-yellow-500 text-[#0B1120] text-[10px] font-black px-1.5 py-0.5 rounded ml-2 shadow-[0_0_10px_rgba(250,204,21,0.5)]">VIP</span>}
                              </p>

                              {/* Ô THỜI GIAN HIỂN THỊ CHÍNH GIỮA */}
                              <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-blue-600/20 px-4 py-1 rounded-full border border-blue-500/40 shadow-sm whitespace-nowrap">
                                <p className="text-blue-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                  <Clock size={14} className="animate-pulse" /> {r.date}
                                </p>
                              </div>

                              <p>
                                <span className="text-slate-400">SĐT:</span>
                                <span className="font-bold ml-1">{r.info?.phone}</span>
                                {r.info?.kycMethod === 'cccd' && <> | CCCD: {r.info?.cccdNumber}</>}
                              </p>
                            </div>
                            <p>
                              <span className="text-slate-400">Thuê Nick mã:</span>
                              <span className="font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 ml-1">{r.accCode}</span>
                              <span className="text-slate-500 ml-2">({r.time})</span>
                              {/* DÒNG CHÈN THÊM NGÀY GIỜ THUÊ TẠI ĐÂY */}

                            </p>
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 mt-3 flex items-center justify-between">
                              <div>
                                <p className="text-blue-400 font-bold text-xs mb-1 flex items-center gap-1"><Gamepad2 size={12} /> AWESUN CỦA KHÁCH:</p>
                                <p className="text-base">ID: <span className="text-white font-mono bg-black/30 px-2 py-0.5 rounded">{r.info?.awesunId}</span> <span className="mx-2 text-slate-600">|</span> Pass: <span className="text-white font-mono bg-black/30 px-2 py-0.5 rounded">{r.info?.awesunPass}</span></p>
                              </div>
                              <button onClick={() => copyToClipboard(`${r.info?.awesunId} ${r.info?.awesunPass}`)} className="p-2 bg-blue-500/20 rounded text-blue-400 hover:bg-blue-500 hover:text-white transition-colors" title="Copy cả ID & Pass"><Copy size={16} /></button>
                            </div>
                          </div>
                          <div className="flex lg:flex-col gap-2 w-full lg:w-auto mt-4 lg:mt-0">
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
                              }} className="flex-1 bg-emerald-600 px-4 py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-colors">Đã Đăng Nhập Xong</button>
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
                                    const { data: targetUser } = await supabase.from('users').select('*').eq('id', r.userId).single();
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
                                      setMessagesDb(prev => [...prev, msg]);
                                    }

                                    showToast("Đã từ chối & Hoàn tiền về đúng ví!");
                                  }
                                });
                              }} className="flex-1 bg-rose-600/20 px-4 py-3 rounded-xl text-rose-500 border border-rose-500/30 text-sm font-bold hover:bg-rose-500 hover:text-white transition-colors">Từ Chối Đơn</button>
                            )}                    {r.status === 'Đã giao acc' && isStillRented && (
                              <button onClick={() => setEditRentModal({ req: r, acc: accObj })} className="flex-1 bg-blue-600 px-4 py-3 rounded-xl text-white text-sm font-bold hover:bg-blue-500 transition-colors flex justify-center items-center gap-1"><Edit size={16} /> Sửa Thời Gian</button>
                            )}
                            <button onClick={() => setConfirmDialog({ title: 'Xoá yêu cầu', message: 'Xoá yêu cầu thuê này?', onConfirm: () => setRentRequests(rentRequests.filter(x => x.id !== r.id)) })} className="px-4 py-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center"><Trash2 size={18} /></button>
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
                <button onClick={() => { setEditingBoosting(null); setAdminBoostingImage(null); setAdminBoostType('rank'); setShowBoostingModal(true); }} className="mb-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-emerald-600/20 transition-transform hover:scale-105"><PlusCircle size={18} /> Thêm dịch vụ Cày Thuê</button>
                {/* Modal Admin Thêm Cày Thuê */}
                {showBoostingModal && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#151D2F] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Target className="text-blue-500" /> {editingBoosting ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Cày Thuê'}</h3>
                        <button onClick={() => setShowBoostingModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                      </div>
                      <form onSubmit={handleSaveBoosting} className="space-y-4">
                        {/* --- KHU VỰC UP ẢNH CÀY THUÊ CÓ NÚT X --- */}
                        <div>
                          <label className="text-xs text-slate-400 font-bold">Ảnh mô tả dịch vụ (Tùy chọn)</label>
                          <div className="mt-1 border border-dashed border-slate-600 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors relative group bg-[#0B1120]">
                            <input type="file" accept="image/*" onChange={handleBoostingImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            {adminBoostingImage ? (
                              <div className="relative z-20">
                                <img src={adminBoostingImage} className="mx-auto h-24 object-cover rounded-lg shadow-md w-full" alt="Preview" />
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAdminBoostingImage(null); }} className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full shadow-lg transition-colors z-30" title="Xóa ảnh này"><X size={14} /></button>
                              </div>
                            ) : (
                              <div className="text-slate-500 flex flex-col items-center"><ImageIcon size={28} className="mb-2" /><span className="text-[10px] font-bold">Bấm để tải Ảnh lên</span></div>
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
                            <input name="game" defaultValue={editingBoosting?.game && editingBoosting.game !== 'Cày Sự Kiện' ? editingBoosting.game : ''} placeholder="VD: Liên Quân, Tốc Chiến..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required />
                          </div>
                        </div>

                        {/* Nếu chọn Cày Sự Kiện thì hiện thêm ô Tên Sự Kiện */}
                        {adminBoostType === 'event' && (
                          <div>
                            <label className="text-xs text-rose-400 font-bold block mb-1">Sự Kiện Gì?</label>
                            <input name="eventName" defaultValue={editingBoosting?.type === 'event' ? editingBoosting.title : ''} placeholder="VD: Cày Sổ Sứ Mệnh, Sự kiện Tết..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500" required />
                          </div>
                        )}

                        <div><label className="text-xs text-slate-400 block mb-1">Giá tiền (VNĐ)</label><input name="price" type="number" defaultValue={editingBoosting?.price} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white font-bold outline-none focus:border-blue-500" required /></div>

                        {adminBoostType === 'rank' ? (
                          <>
                            <div><label className="text-xs text-slate-400 block mb-1">Tiêu đề Gói</label><input name="title" defaultValue={editingBoosting?.title} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required /></div>
                            <div><label className="text-xs text-slate-400 block mb-1">Mô tả chi tiết</label><textarea name="desc" defaultValue={editingBoosting?.desc} rows="3" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required></textarea></div>
                          </>
                        ) : (
                          <>
                            <div><label className="text-xs text-slate-400 block mb-1">Số lượng / Mô tả chi tiết</label><textarea name="amount" defaultValue={editingBoosting?.type === 'event' ? editingBoosting.desc : ''} rows="3" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required></textarea></div>
                            <label className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg cursor-pointer">
                              <input type="checkbox" name="requireLogin" defaultChecked={editingBoosting?.type === 'event' ? editingBoosting.require_login : false} className="w-5 h-5 accent-rose-500 cursor-pointer" />
                              <span className="text-sm font-bold text-rose-400">Yêu cầu cung cấp TK/MK?</span>
                            </label>
                          </>
                        )}
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
                            <p className="font-bold text-white"><span className="text-blue-400">{req.user}</span> đặt gói: {req.boostingTitle} <span className="text-xs text-slate-500 font-normal">({req.date})</span></p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.status === 'Hoàn thành' ? 'bg-emerald-500/20 text-emerald-400' : req.status === 'Đang cày' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {req.status || 'Chờ xử lý'}
                            </span>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-400">Nền tảng: <span className="text-white font-bold">{req.info.loginMethod}</span> | TK: <span className="text-white font-mono">{req.info.username}</span> | MK: <span className="text-white font-mono">{req.info.password}</span></p>
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
                                setMessagesDb(prev => [...prev, newMsg]);
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boostingDb.map(b => (
                    <div key={b.id} className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex flex-col group hover:border-blue-500/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{b.game}</span>
                        <span className="text-rose-400 font-black text-lg">{new Intl.NumberFormat('vi-VN').format(b.price)}đ</span>
                      </div>
                      <span className="text-white font-bold mb-2 line-clamp-2">{b.title}</span>
                      <p className="text-xs text-slate-500 mb-4 flex-1 line-clamp-2">{b.desc}</p>
                      <div className="flex gap-2 border-t border-slate-800 pt-3">
                        <button onClick={() => { setEditingBoosting(b); setAdminBoostingImage(b.image || null); setAdminBoostType(b.type || 'rank'); setShowBoostingModal(true); }} className="flex-1 py-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors text-xs font-bold flex justify-center items-center gap-1"><Edit size={14} /> Sửa</button>
                        <button onClick={() => setConfirmDialog({
                          title: 'Xoá dịch vụ', message: 'Xoá dịch vụ cày thuê này?', onConfirm: async () => {
                            await supabase.from('boosting').delete().eq('id', b.id);
                            setBoostingDb(boostingDb.filter(x => x.id !== b.id));
                            showToast("Đã xóa dịch vụ vĩnh viễn!");
                          }
                        })} className="flex-1 py-1.5 bg-rose-500/10 text-rose-400 rounded hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold flex justify-center items-center gap-1"><Trash2 size={14} /> Xoá</button>                        </div>
                    </div>
                  ))}
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
                          {transactionsDb.filter(t => t.type === 'spin_win').slice(0, visibleSpinsAdmin).map((tx, idx) => (
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
                    const { data: userToUpdate } = await supabase.from('users').select('*').eq('id', targetModal.userId).single();
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
                      const { data: targetUser } = await supabase.from('users').select('*').eq('id', currentReq.userId).single();
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
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><User className="text-blue-500" /> Sửa Thông Tin User</h3>
                  <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveUser} className="space-y-4">
                  <div><label className="text-xs text-slate-400">Tên</label><input name="name" defaultValue={editingUser?.name} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-400">Số ĐT</label><input name="phone" type="tel" pattern="[0-9]{10,11}" maxLength="11" onInput={enforceNumberInput} defaultValue={editingUser?.phone} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white" title="Nhập 10-11 số" required /></div>
                    <div><label className="text-xs text-slate-400">Mật khẩu (Đã bảo mật)</label><input type="password" disabled value="********" className="w-full mt-1 p-3 bg-[#0B1120]/50 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed" title="Chuẩn bảo mật: Admin không thể xem hoặc sửa mật khẩu của khách" /></div>                  </div>
                  <div><label className="text-xs text-slate-400">Email</label><input name="email" defaultValue={editingUser?.email} className="w-full mt-1 p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white" required />
                    {/* --- KHU VỰC HIỂN THỊ CCCD CỦA KHÁCH --- */}
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700 mt-4">
                      <label className="block text-sm font-medium text-slate-400 mb-3"><ShieldCheck size={16} className="inline text-emerald-400 mb-1" /> Ảnh CCCD xác minh</label>

                      {editingUser?.cccd_image ? (
                        <div className="flex flex-col items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setFullScreenImage(editingUser.cccd_image)}
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
                  </div>                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4">Lưu Thay Đổi</button>
                </form>
              </div>
            </div>
          )}

          {/* Modal Account */}
          {showAccModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm py-10">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-3xl rounded-2xl p-6 shadow-2xl max-h-full overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#151D2F] pb-4 border-b border-slate-800 z-10">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Gamepad2 className="text-blue-500" /> {editingAccount ? 'Chỉnh sửa Nick' : 'Đăng bán Nick mới'}</h3>
                  <button onClick={() => setShowAccModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveAccount} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="text-xs text-slate-400 font-bold">Tên Game</label><input name="game" defaultValue={editingAccount?.game} placeholder="VD: Liên Quân, Valorant..." className="w-full mt-1.5 p-3 bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none rounded-lg text-white" required /></div>
                  <div><label className="text-xs text-slate-400 font-bold">Mã Nick</label><input name="code" defaultValue={editingAccount?.code} placeholder="VD: 12345" className="w-full mt-1.5 p-3 bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none rounded-lg text-white" required /></div>

                  {/* CHÈN THÊM Ô PHÂN LOẠI ACC (TIER) Ở ĐÂY */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 font-bold">Phân loại Đẳng cấp (Tier)</label>
                    <select name="tier" defaultValue={editingAccount?.tier || 'VIP'} className="w-full mt-1.5 p-3 bg-[#0B1120] border border-yellow-500/50 focus:border-yellow-400 outline-none rounded-lg text-yellow-500 font-bold">
                      <option value="VIP">Tài khoản VIP (Thường)</option>
                      <option value="SVIP">Tài khoản SUPER VIP (Cao cấp)</option>
                      <option value="ULVIP">Tài khoản ULTRA VIP (Đỉnh cao)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2"><label className="text-xs text-slate-400 font-bold">Tiêu đề (Giật tít)</label><input name="title" defaultValue={editingAccount?.title} placeholder="Acc vip full tướng, trắng thông tin..." className="w-full mt-1.5 p-3 bg-[#0B1120] border border-slate-700 focus:border-blue-500 outline-none rounded-lg text-white" required /></div>
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
                    <div className="grid grid-cols-2 gap-3 bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20">
                      <div>
                        <label className="text-[11px] text-emerald-400 font-bold mb-2 flex items-center gap-1"><Wallet size={14} /> GIÁ BÁN ĐỨT (VNĐ)</label>
                        <input name="price" type="number" defaultValue={editingAccount?.price} placeholder="Ví dụ: 500000" className="w-full p-3 bg-[#0B1120] border border-emerald-500/50 focus:border-emerald-400 outline-none rounded-lg text-emerald-400 font-black text-lg shadow-inner" required />
                      </div>
                      <div>
                        <label className="text-[11px] text-blue-400 font-bold mb-2 flex items-center gap-1"><Clock size={14} /> GIÁ THUÊ / GIỜ</label>
                        <input name="rentPricePerHour" type="number" defaultValue={editingAccount?.rentPricePerHour || 0} placeholder="Ví dụ: 10000" className="w-full p-3 bg-[#0B1120] border border-blue-500/50 focus:border-blue-400 outline-none rounded-lg text-blue-400 font-black text-lg shadow-inner" />
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
                    <button type="button" onClick={() => setShowAccModal(false)} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors">Hủy Bỏ</button>
                    <button type="submit" className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2"><Save size={20} /> Hoàn Tất Lưu</button>
                  </div>
                </form>
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
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><Target className="text-blue-500" /> {editingBoosting ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ Cày Thuê'}</h3>
                  <button onClick={() => setShowBoostingModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveBoosting} className="space-y-4">
                  {/* --- KHU VỰC UP ẢNH CÀY THUÊ CÓ NÚT X --- */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold">Ảnh mô tả dịch vụ (Tùy chọn)</label>
                    <div className="mt-1 border border-dashed border-slate-600 rounded-xl p-4 text-center hover:bg-slate-800/50 transition-colors relative group bg-[#0B1120]">
                      <input type="file" accept="image/*" onChange={handleBoostingImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      {adminBoostingImage ? (
                        <div className="relative z-20">
                          <img src={adminBoostingImage} className="mx-auto h-24 object-cover rounded-lg shadow-md w-full" alt="Preview" />
                          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAdminBoostingImage(null); }} className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full shadow-lg transition-colors z-30" title="Xóa ảnh này"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center"><ImageIcon size={28} className="mb-2" /><span className="text-[10px] font-bold">Bấm để tải Ảnh lên</span></div>
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
                      <input name="game" defaultValue={editingBoosting?.game && editingBoosting.game !== 'Cày Sự Kiện' ? editingBoosting.game : ''} placeholder="VD: Liên Quân, Tốc Chiến..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required />
                    </div>
                  </div>

                  {/* Nếu chọn Cày Sự Kiện thì hiện thêm ô Tên Sự Kiện */}
                  {adminBoostType === 'event' && (
                    <div>
                      <label className="text-xs text-rose-400 font-bold block mb-1">Sự Kiện Gì?</label>
                      <input name="eventName" defaultValue={editingBoosting?.type === 'event' ? editingBoosting.title : ''} placeholder="VD: Cày Sổ Sứ Mệnh, Sự kiện Tết..." className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-rose-500" required />
                    </div>
                  )}

                  <div><label className="text-xs text-slate-400 block mb-1">Giá tiền (VNĐ)</label><input name="price" type="number" defaultValue={editingBoosting?.price} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white font-bold outline-none focus:border-blue-500" required /></div>

                  {adminBoostType === 'rank' ? (
                    <>
                      <div><label className="text-xs text-slate-400 block mb-1">Tiêu đề Gói</label><input name="title" defaultValue={editingBoosting?.title} className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required /></div>
                      <div><label className="text-xs text-slate-400 block mb-1">Mô tả chi tiết</label><textarea name="desc" defaultValue={editingBoosting?.desc} rows="3" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required></textarea></div>
                    </>
                  ) : (
                    <>
                      <div><label className="text-xs text-slate-400 block mb-1">Số lượng / Mô tả chi tiết</label><textarea name="amount" defaultValue={editingBoosting?.type === 'event' ? editingBoosting.desc : ''} rows="3" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500" required></textarea></div>
                      <label className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg cursor-pointer">
                        <input type="checkbox" name="requireLogin" defaultChecked={editingBoosting?.type === 'event' ? editingBoosting.require_login : false} className="w-5 h-5 accent-rose-500 cursor-pointer" />
                        <span className="text-sm font-bold text-rose-400">Yêu cầu cung cấp TK/MK?</span>
                      </label>
                    </>
                  )}
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
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-down">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${toast.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-white' : 'bg-emerald-900/90 border-emerald-500/50 text-white'}`}>
              {toast.type === 'error' ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle2 size={20} className="text-emerald-400" />}
              <p className="font-bold text-sm whitespace-nowrap">{toast.message}</p>
            </div>
          </div>
        )}
        {/* Modal Hướng dẫn cài Awesun */}
        {awesunGuideType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-blue-500/50 w-full max-w-md rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0B1120]">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Download className="text-blue-500" /> Hướng dẫn lấy mã Awesun</h3>
                <button onClick={() => setAwesunGuideType(null)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-4 text-base md:text-lg text-slate-300">
                <p className="text-blue-400 font-bold mb-2">Trình duyệt của bạn đang tải phần mềm xuống. Hãy làm theo các bước sau:</p>

                <div className="flex gap-3 items-start">
                  <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">1</span>
                  <p>Bấm tổ hợp phím <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">CTRL + J</strong> trên trình duyệt web của bạn.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">2</span>
                  <p>Mở file Awesun vừa mới tải lên.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">3</span>
                  <p>Bấm chữ <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">Install Now</strong> cho phần mềm chạy cài đặt.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">4</span>
                  <p>Sau khi cài xong, mở ứng dụng ra bạn sẽ thấy 2 dòng là <strong className="text-white">Mã ID</strong> và <strong className="text-white">Passcode</strong>.</p>
                </div>

                {awesunGuideType === 'inside' && (
                  <div className="flex gap-3 items-start mt-2 pt-4 border-t border-slate-800">
                    <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shrink-0"><CheckCircle2 size={18} /></span>
                    <p className="text-emerald-400 font-bold">Quay lại đây, ghi Mã ID và Passcode vào ô trống yêu cầu để hoàn tất.</p>
                  </div>
                )}

                <button onClick={() => setAwesunGuideType(null)} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg text-lg">Đã Hiểu & Đóng Lại</button>
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
                    Nạp <strong className="text-rose-400 text-lg">20k VNĐ</strong> tặng ngay <strong className="text-rose-400 text-lg">1 Lượt Quay</strong>
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
                  <p className="pt-0.5 leading-relaxed">Cứ mỗi <strong className="text-rose-400 text-lg drop-shadow-sm">20k VNĐ</strong> nạp vào website sẽ được tặng <strong className="text-rose-400 text-lg drop-shadow-sm">1 lượt quay</strong> miễn phí ở vòng quay này.</p>
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
        {/* Global Confirm Dialog */}
        {confirmDialog && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#151D2F] border border-slate-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                  <AlertCircle size={30} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h3>
                <p className="text-sm text-slate-400">{confirmDialog.message}</p>
              </div>
              <div className="flex border-t border-slate-800 bg-[#0B1120]">
                <button onClick={() => setConfirmDialog(null)} className="flex-1 p-4 font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Hủy</button>
                <div className="w-[1px] bg-slate-800"></div>
                <button onClick={async () => {
                  if (isProcessingAction) return;
                  isProcessingAction = true;
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  try { await action(); } catch (e) { console.error(e); } finally { isProcessingAction = false; }
                }} className="flex-1 p-4 font-bold text-blue-500 hover:bg-blue-600 hover:text-white transition-colors">Đồng Ý</button>
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
            <img src={fullScreenImage} className="max-w-full max-h-[90vh] object-contain shadow-2xl border border-slate-800 rounded" alt="Full Screen" />
          </div>
        )}

        {/* POPUP CHI TIẾT TÀI KHOẢN */}
        {viewingAcc && (() => {
          const viewingAllImages = [viewingAcc.coverImage, ...(viewingAcc.detailImages || [])];
          const isCurrentlyRented = viewingAcc.rentedUntil && viewingAcc.rentedUntil > Date.now();

          return (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
              <div className="bg-[#151D2F] border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-auto max-h-[90vh]">

                <div className="w-full md:w-1/2 bg-[#0B1120] p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                  <div
                    className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center cursor-zoom-in group"
                    onClick={() => setFullScreenImage(viewingAllImages[selectedImageIndex])}
                  >
                    <img src={viewingAllImages[selectedImageIndex]} className="max-w-full max-h-full object-contain" alt="Main View" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="bg-black/60 p-3 rounded-full text-white flex items-center gap-2"><ZoomIn size={24} /></div>
                    </div>
                  </div>
                  {viewingAllImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar py-2">
                      {viewingAllImages.map((img, idx) => (
                        <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-blue-500' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                          <img src={img} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex gap-2 items-center mb-2">
                        <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">Mã: {viewingAcc.code}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${viewingAcc.tagColor}`}>{viewingAcc.game}</span>

                        {/* HIỂN THỊ TAG ĐẲNG CẤP MỚI TẠI ĐÂY */}
                        <span className={`text-xs font-black px-2 py-1 rounded shadow-md uppercase ${viewingAcc.tier === 'ULVIP' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : viewingAcc.tier === 'SVIP' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0B1120]' : 'bg-blue-600 text-white'}`}>
                          {viewingAcc.tier || 'VIP'}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white leading-snug">{viewingAcc.title}</h2>
                    </div>
                    <button onClick={() => setViewingAcc(null)} className="p-2 bg-[#0B1120] rounded-full text-slate-400 hover:text-white transition-colors border border-slate-800"><X size={20} /></button>
                  </div>

                  <p className="text-sm text-slate-400 mb-6 bg-[#0B1120] p-4 rounded-xl border border-slate-800 leading-relaxed">{viewingAcc.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {viewingAcc.tags.map((tag, i) => (
                      <div key={i} className="bg-[#0B1120] border border-slate-800 p-2.5 rounded-lg text-sm text-slate-300 font-medium flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-blue-500 shrink-0" /> <span className="line-clamp-1">{tag}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto space-y-3">
                    {currentUser && (
                      <div className="flex justify-between text-sm mb-2 px-1">
                        <span className="text-slate-400">Số dư ví của bạn:</span>
                        <span className="text-emerald-400 font-bold">{new Intl.NumberFormat('vi-VN').format(currentUser.balance)}đ</span>
                      </div>
                    )}

                    <button onClick={() => handleBuyAccount(viewingAcc)} className="w-full bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-xl flex items-center justify-between transition-colors shadow-lg hover:-translate-y-1">
                      <div className="text-left">
                        <p className="font-bold text-lg">Mua Đứt Tài Khoản</p>
                        <p className="text-xs text-rose-200">Giao acc ngay, có thông tin TK/MK</p>
                      </div>
                      <span className="text-2xl font-black">{new Intl.NumberFormat('vi-VN').format(viewingAcc.price)}đ</span>
                    </button>

                    {viewingAcc.rentOptions && viewingAcc.rentOptions.length > 0 && (
                      <div className="pt-2">

                        {/* HIỂN THỊ QUỸ THUÊ BẢO LƯU */}
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
                        {/* NÚT NGƯNG THUÊ DÀNH RIÊNG CHO NGƯỜI ĐANG THUÊ */}
                        {isCurrentlyRented && currentUser?.id === viewingAcc.currentRenterId && (
                          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl mb-4 shadow-[0_0_15px_rgba(225,29,72,0.1)]">
                            <div className="flex items-center gap-2 text-rose-500 mb-3">
                              <Clock size={18} className="animate-pulse" />
                              <span className="font-bold text-sm uppercase">Bạn đang trong phiên thuê</span>
                            </div>

                            {(() => {
                              const activeReqModal = rentRequests.find(r => r.accCode === viewingAcc.code && r.status === 'Đã giao acc');
                              const isComboModal = activeReqModal && (activeReqModal.time.toLowerCase().includes('combo đêm') || activeReqModal.time.toLowerCase().includes('combo ngày'));

                              return isComboModal ? (
                                <button disabled className="w-full bg-slate-700 text-slate-400 font-black py-3 rounded-xl transition-all cursor-not-allowed border border-slate-600">
                                  ĐANG THUÊ GÓI COMBO (KHÔNG HỖ TRỢ NGƯNG)
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStopRent(viewingAcc)}
                                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-xl transition-all shadow-lg active:scale-95"
                                  >
                                    NGƯNG THUÊ & BẢO LƯU GIỜ
                                  </button>
                                  <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                                    * Lưu ý: Hệ thống khấu trừ tối thiểu 2 giờ chơi cho mỗi lần ngưng thuê.
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {viewingAcc.rentOptions.map((opt, idx) => (
                            <button
                              key={idx}
                              disabled={isCurrentlyRented}
                              onClick={() => initiateRent(viewingAcc, opt)}
                              className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center text-center gap-1 animate-fade-in shadow-inner w-full ${isCurrentlyRented ? 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed' : 'border-slate-800 bg-[#0B1120] hover:border-blue-500 hover:bg-blue-900/20 cursor-pointer'}`}
                            >
                              {/* PHẦN TRÊN: Số giờ thuê chính & Nhãn tặng */}
                              <div className="flex flex-col items-center gap-1.5 w-full mb-1">
                                <p className="font-black text-xl text-white">Thuê {opt.time}</p>
                                {opt.bonusTime && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap font-bold shadow-sm">
                                    + Tặng {opt.bonusTime}
                                  </span>
                                )}
                              </div>

                              {/* PHẦN DƯỚI: Giá tiền */}
                              <div className="flex items-center justify-center gap-1.5 text-blue-400 mt-2 border-t border-slate-800 w-full pt-3">
                                <Wallet size={16} className="text-blue-500" />
                                <p className="font-black text-lg">
                                  {new Intl.NumberFormat('vi-VN').format(opt.price)}
                                  <span className="text-xs ml-0.5">đ</span>
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
                    <p><strong className="text-rose-400">TUYỆT ĐỐI KHÔNG ĐƯỢC TẮT APP AWESUN</strong><br /><span className="text-slate-400 text-xs mt-0.5 block">(Phát hiện tắt: Xóa sạch tiền thuê và kick ra khỏi acc)</span></p>
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

                      const updatePayload = {
                        balance: newBalance,
                        rentFund: newFund
                      };

                      // Tự động lưu CCCD vào profile theo yêu cầu nếu khách có cung cấp
                      if (!skipKyc && rentKycMethod === 'cccd' && finalImgBase64) {
                        updatePayload.cccd_image = finalImgBase64;
                        updatePayload.cccd_number = capturedCccd;
                      }

                      const { error: userErr } = await supabase.from('users').update(updatePayload).eq('id', currentUser.id);

                      if (userErr) return showToast("Lỗi trừ tiền: " + userErr.message, 'error');

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
                      await supabase.from('transactions').insert(txs);

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
                      <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2"><Gamepad2 size={16} /> Cung cấp Awesun & SĐT</h4>
                      <button
                        type="button"
                        onClick={() => {
                          window.open('https://down.aweray.com/awesun/windows/Aweray_Remote_2.0.0.45399_x64.exe', '_self');
                          setAwesunGuideType('inside');
                        }}
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-blue-500/30 shadow-sm"
                      >
                        <Download size={14} /> Tải Awesun
                      </button>
                    </div>

                    {/* Mới thêm: Ô tải Awesun lớn trong khối cung cấp thông tin */}
                    <div className="flex flex-col justify-center bg-[#151D2F] border border-blue-500/30 p-5 rounded-xl shadow-inner mb-4 relative overflow-hidden group">
                      <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Download size={100} />
                      </div>
                      <h3 className="text-white font-bold text-base mb-1 relative z-10 flex items-center gap-2">
                        <Gamepad2 className="text-blue-500" size={18} /> Bạn chưa có Awesun?
                      </h3>
                      <p className="text-xs text-slate-400 mb-3 relative z-10">Tải phần mềm điều khiển xa để chuẩn bị sẵn sàng trước khi thuê tài khoản game.</p>
                      <button
                        type="button"
                        onClick={() => {
                          window.open('https://down.aweray.com/awesun/windows/Aweray_Remote_2.0.0.45399_x64.exe', '_self');
                          setAwesunGuideType('inside');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm relative z-10"
                      >
                        <Download size={16} /> Tải xuống ngay
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div><input name="awesunId" placeholder="Mã Awesun ID" className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white font-mono outline-none" required /></div>
                      <div><input name="awesunPass" placeholder="Passcode" className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white font-mono outline-none" required /></div>
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
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Target className="text-blue-500" /> Đặt Lịch Cày Thuê</h3>
                <button onClick={() => setBoostingModalData(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6">
                <div className="mb-4 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
                  <p className="text-sm text-slate-300">Gói dịch vụ: <strong className="text-white">{boostingModalData.title}</strong></p>
                  <p className="text-sm text-slate-300 mt-1">Phí cày thuê: <strong className="text-rose-500 text-lg">{new Intl.NumberFormat('vi-VN').format(boostingModalData.price)}đ</strong></p>
                  <p className="text-xs text-slate-400 mt-2">Số dư của bạn: <span className="text-emerald-400 font-bold">{new Intl.NumberFormat('vi-VN').format(currentUser?.balance || 0)}đ</span></p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (isProcessingAction) return;
                  isProcessingAction = true;
                  try {
                    // LẤY DỮ LIỆU AN TOÀN CHỐNG CRASH NGẦM
                    const loginMethod = e.target.loginMethod ? e.target.loginMethod.value : 'Không Cần';
                    const username = e.target.username ? e.target.username.value : (e.target.eventCode ? e.target.eventCode.value : '');
                    const password = e.target.password ? e.target.password.value : 'Bảo Mật Bằng Mã';
                    const note = e.target.note ? e.target.note.value : '';

                    const targetModal = boostingModalData;
                    setBoostingModalData(null); // Đóng ngay lập tức để làm khách hài lòng

                    if (currentUser.balance < targetModal.price) {
                      showToast("Số dư không đủ! Vui lòng nạp thêm tiền.", 'error');
                      setCurrentView('naptien');
                      return;
                    }

                    const reqId = `BST${Date.now()}`;
                    const newBalance = currentUser.balance - boostingModalData.price;

                    // 1. Trừ tiền trên Database
                    await supabase.from('users').update({ balance: newBalance }).eq('id', currentUser.id);

                    // 2. Lưu Lịch sử giao dịch lên Database
                    // 2. Lưu Lịch sử giao dịch lên Database
                    const newTx = {
                      id: `TX${Date.now()}`,
                      user: currentUser.name,
                      action: `Đặt cày thuê: ${boostingModalData.title}`,
                      amount: boostingModalData.price,
                      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                      status: 'Thành công',
                      type: 'boost',
                      accDetails: {
                        balanceAfter: newBalance,
                        fundAfter: currentUser.rentFund || 0
                      }
                    };
                    await supabase.from('transactions').insert([newTx]);

                    // 3. Lưu Đơn Cày Thuê lên Database (Đã gỡ bỏ userId gây lỗi)
                    const dbPayload = {
                      id: reqId,
                      user: currentUser.name,
                      boostingId: boostingModalData.id,
                      boostingTitle: boostingModalData.title,
                      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                      status: 'Chờ xử lý',
                      info: {
                        loginMethod: loginMethod,
                        username: username,
                        password: password,
                        note: note
                      }
                    };

                    // Chặn và báo lỗi ngay lập tức nếu Supabase từ chối
                    const { error: insertErr } = await supabase.from('boosting_requests').insert([dbPayload]);
                    if (insertErr) {
                      showToast("Lỗi Database: " + insertErr.message, "error");
                      return;
                    }

                    // Tạo bản sao cho React hiển thị
                    const newBoostReq = { ...dbPayload };
                    // Cập nhật Giao diện
                    const updatedUser = { ...currentUser, balance: newBalance };
                    setCurrentUser(updatedUser);
                    localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
                    setUsersDb(usersDb.map(u => u.id === currentUser?.id ? updatedUser : u));

                    setTransactionsDb([newTx, ...transactionsDb]);
                    setBoostingRequests([newBoostReq, ...boostingRequests]);

                    showToast("Đặt lịch thành công! Admin sẽ sớm xử lý.");
                    sendAdminAlert('ĐẶT CÀY THUÊ', `Khách ${currentUser.name} vừa đặt đơn cày ${targetModal.title}.`);
                    setCurrentView('lichsu');
                  } finally { isProcessingAction = false; }
                }}>
                  <div className="space-y-4">
                    {/* Kiểm tra xem gói này có bắt buộc TK/MK không */}
                    {boostingModalData.type === 'event' && boostingModalData.require_login === false ? (
                      <div>
                        <label className="text-xs font-bold text-emerald-400 block mb-1">Nhập Mã Sự Kiện / Link Liên Kết</label>
                        <input name="eventCode" type="text" placeholder="VD: SGH-123456..." className="w-full p-3 bg-[#0B1120] border border-emerald-500/50 rounded-lg text-emerald-400 font-mono outline-none focus:border-emerald-400 shadow-inner" required />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-400 block mb-1">Hình thức đăng nhập</label>
                          <select name="loginMethod" className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500">
                            <option value="Garena">Garena</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Riot Games">Riot Games</option>
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
                  <button type="submit" className="w-full mt-6 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-600/20 transition-colors flex items-center justify-center gap-2">
                    Thanh toán {new Intl.NumberFormat('vi-VN').format(boostingModalData.price)}đ
                  </button>
                </form>
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
        {/* --- COMPONENT LIÊN HỆ GÓC DƯỚI --- */}
        <FloatingContact
          currentUser={currentUser}
          unreadCount={unreadCount}
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