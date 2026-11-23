import React, { lazy, Suspense } from 'react';
import {
  User, Lock, Phone, Mail, ShieldCheck, CheckCircle2, Key, Wallet, Search,
  Gamepad2, X, Clock, Flame, Settings, Edit, Trash2, PlusCircle,
  Image as ImageIcon, History, Target, Gift, Save, Upload, Plus, Unlock,
  QrCode, Copy, AlertCircle, RefreshCw, Sparkles, TrendingUp, Users, Ticket,
  Settings2, MessageCircle, Send, Eye, EyeOff, RotateCcw, ArrowLeft, Loader2,
  Zap, Shield, Link, Bell, Globe
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { LEGENDARY_SHOES_IMG, getShoesImage } from '../shoesAsset';
const WizardAdminPanel = lazy(() => import('../components/WizardAdminPanel'));
import {
  compressImageFile, uploadToImgBB, getWheelNotifyFallback, saveWheelNotifyFallback,
  formatDateTimeLocal, getRecordTime, getActiveStatus, enforceNumberInput
} from '../utils/shopHelpers';
import { IN_GAME_REWARD_CATALOG, isLegendaryShoes } from '../utils/wheelHelpers';

const AdminScreen = ({
  renderNavbar, currentUser, setCurrentUser, setCurrentView, showToast,
  accountsDb, setAccountsDb, usersDb, setUsersDb, transactionsDb, setTransactionsDb,
  boostingDb, setBoostingDb, boostingRequests, setBoostingRequests,
  depositRequests, setDepositRequests, rentRequests, setRentRequests,
  vouchersDb, setVouchersDb, messagesDb, setMessagesDb,
  wheelItemsMoneyDb, setWheelItemsMoneyDb, wheelItemsSpinDb, setWheelItemsSpinDb,
  wheelConfig, setWheelConfig, wheelCountdown,
  wizardEventConfig, setWizardEventConfig, wizardCardItems, setWizardCardItems,
  mtcGameConfig, mtcServerRegistry, isMtcGameOpen, isMtcWebPlayPublic,
  handleSaveMtcGameConfig, handleRefreshMtcTunnel,
  depositBonusConfig, setDepositBonusConfig, visitorCount,
  adminTab, setAdminTab, adminGame, setAdminGame,
  adminAccGameAvatar, setAdminAccGameAvatar, adminCoverImage, setAdminCoverImage,
  adminDetailImages, setAdminDetailImages, adminRentOptions, setAdminRentOptions,
  adminBoostType, setAdminBoostType, adminBoostingImage, setAdminBoostingImage,
  adminBoostingPriceUnit, setAdminBoostingPriceUnit, adminGameAvatar, setAdminGameAvatar,
  adminRankOptions, setAdminRankOptions, adminBoostingCategoryFilter, setAdminBoostingCategoryFilter,
  adminBoostingGameFilter, setAdminBoostingGameFilter,
  adminWheelType, setAdminWheelType, adminWheelImage, setAdminWheelImage,
  adminWheelRewardType, setAdminWheelRewardType, adminWheelNotify, setAdminWheelNotify,
  adminConfigType, setAdminConfigType, adminSearchUser, setAdminSearchUser,
  adminMessageSearch, setAdminMessageSearch, activeChatUser, setActiveChatUser,
  chatMessagesEndRef, editingAccount, setEditingAccount, editingBoosting, setEditingBoosting,
  editingUser, setEditingUser, editingVoucher, setEditingVoucher, editingWheel, setEditingWheel,
  showAccModal, setShowAccModal, showBoostingModal, setShowBoostingModal,
  showUserModal, setShowUserModal, showVoucherModal, setShowVoucherModal,
  showWheelModal, setShowWheelModal, approveDepositModal, setApproveDepositModal,
  editRentModal, setEditRentModal, viewUserHistory, setViewUserHistory,
  visibleDepsAdmin, setVisibleDepsAdmin, visibleRentsAdmin, setVisibleRentsAdmin,
  visibleSpinsAdmin, setVisibleSpinsAdmin, visibleUsersCount, setVisibleUsersCount,
  isEventMultiPackage, setIsEventMultiPackage, crossfireText, setCrossfireText,
  isGlobalProcessing, setIsGlobalProcessing, setGlobalProgressText,
  setConfirmDialog, setFullScreenImage, setShowBossProfileModal, setShowBossStatModal,
  handleCheckBossPlayer, getGameInfo, copyToClipboard, sendDepositSuccessEmail,
  handleUndoTransaction, isProcessingActionRef
}) => {
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

    // Tối ưu hóa: Nén ảnh chất lượng cao (WebP, 1440px, Tối đa 0.35MB)
    const options = {
      maxSizeMB: 0.35,
      maxWidthOrHeight: 1440,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.85
    };

    try {
      if (isCover && files[0]) {
        // Bắt đầu nén ảnh
        const compressedFile = await compressImageFile(files[0], options);

        const reader = new FileReader();
        reader.onloadend = () => setAdminCoverImage(reader.result);
        // Đọc file đã nén thay vì file gốc
        reader.readAsDataURL(compressedFile);

      } else if (!isCover) {
        // Xử lý nén cho danh sách ảnh phụ
        for (const file of files) {
          const compressedFile = await compressImageFile(file, options);
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
      const options = { maxSizeMB: 0.35, maxWidthOrHeight: 1440, useWebWorker: true, fileType: "image/webp", initialQuality: 0.85 };
      try {
        const compressedFile = await compressImageFile(file, options);
        const reader = new FileReader();
        reader.onloadend = () => setAdminAccGameAvatar(reader.result);
        reader.readAsDataURL(compressedFile);
      } catch {
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
        finalCoverImage = await uploadToImgBB(finalCoverImage, 'accounts');
      }

      let finalDetailImages = [];
      for (let img of adminDetailImages) {
        if (img && img.startsWith('data:image/')) {
          const url = await uploadToImgBB(img, 'accounts');
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
        const finalAvatar = await uploadToImgBB(adminAccGameAvatar, 'accounts');
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
            const url = await uploadToImgBB(img, 'boosting');
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
          finalGameAvatarUrl = await uploadToImgBB(adminGameAvatar, 'boosting');
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
      // Tối ưu hóa: Nén ảnh chất lượng cao (WebP, 1440px, Tối đa 0.35MB)
      const options = {
        maxSizeMB: 0.35,
        maxWidthOrHeight: 1440,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85
      };
      try {
        const promises = files.map(async (file) => {
          let targetFile = file;
          try {
            targetFile = await compressImageFile(file, options);
          } catch (err) {
            console.error("Lỗi nén ảnh, dùng ảnh gốc:", err);
          }
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(targetFile);
          });
        });
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
        maxSizeMB: 0.35,
        maxWidthOrHeight: 1440,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85
      };
      try {
        const compressedFile = await compressImageFile(file, options);
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
      // Tối ưu hóa: Nén ảnh chất lượng cao (WebP, 1440px, Tối đa 0.35MB)
      const options = {
        maxSizeMB: 0.35,
        maxWidthOrHeight: 1440,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.85
      };
      try {
        const compressedFile = await compressImageFile(file, options);
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
        showToast("Đang tối ưu & tải ảnh phần thưởng lên CDN...", "info");
        finalImage = await uploadToImgBB(adminWheelImage, 'wheel');
      } else {
        showToast("Đang xử lý phần thưởng...", "info");
      }

      if (!finalImage) {
        const checkType = e.target.type.value;
        const checkName = (e.target.name.value || '').toLowerCase();
        if (checkType === 'game_coins' || checkName.includes('xu')) {
          finalImage = '/game-assets/gold_coin.png';
        } else if (checkType === 'game_attacks' || checkName.includes('lượt đánh')) {
          finalImage = '/game-assets/weapon_song_dao.png';
        }
      }

      const isNotifyChecked = Boolean(adminWheelNotify);
      const wheelData = {
        id: editingWheel ? editingWheel.id : `WHEEL${Date.now()}`,
        name: e.target.name.value,
        type: e.target.type.value,
        value: parseInt(e.target.value.value) || 0,
        rate: e.target.rate.value,
        quantity: parseInt(e.target.quantity.value) || 0,
        color: e.target.color.value || '#f43f5e',
        image: finalImage,
        wheel_type: adminWheelType, // Phân biệt tiền hay lượt
        notify_on_win: isNotifyChecked
      };
      // Lưu cấu hình fallback ngay để đảm bảo dù db có hay chưa có cột thì app vẫn hoạt động 100%
      saveWheelNotifyFallback(wheelData.id, isNotifyChecked);

      // Đẩy lên Supabase
      let queryError = null;
      if (editingWheel) {
        const { error } = await supabase.from('wheel_items').update(wheelData).eq('id', editingWheel.id);
        queryError = error;
      } else {
        const { error } = await supabase.from('wheel_items').insert([wheelData]);
        queryError = error;
      }

      // Tự động bỏ qua lỗi nếu database Supabase chưa kịp chạy lệnh thêm cột notify_on_win
      if (queryError && queryError.message && (queryError.message.includes('notify_on_win') || queryError.code === '42703')) {
        const safeWheelData = { ...wheelData };
        delete safeWheelData.notify_on_win;
        if (editingWheel) {
          const { error: errRetry } = await supabase.from('wheel_items').update(safeWheelData).eq('id', editingWheel.id);
          queryError = errRetry;
        } else {
          const { error: errRetry } = await supabase.from('wheel_items').insert([safeWheelData]);
          queryError = errRetry;
        }
      }

      if (queryError) {
        showToast("Lỗi: " + queryError.message, 'error');
        setShowWheelModal(true);
        return;
      }

      // Cập nhật màn hình
      if (adminWheelType === 'money') {
        const nextList = editingWheel 
          ? wheelItemsMoneyDb.map(w => w.id === editingWheel.id ? wheelData : w)
          : [...wheelItemsMoneyDb, wheelData];
        setWheelItemsMoneyDb(nextList);
        try { localStorage.setItem('shop_wheel_money', JSON.stringify(nextList)); } catch { /* ignore */ }
      } else {
        const nextList = editingWheel 
          ? wheelItemsSpinDb.map(w => w.id === editingWheel.id ? wheelData : w)
          : [...wheelItemsSpinDb, wheelData];
        setWheelItemsSpinDb(nextList);
        try { localStorage.setItem('shop_wheel_spin', JSON.stringify(nextList)); } catch { /* ignore */ }
      }

      showToast(editingWheel ? "Sửa phần thưởng thành công!" : "Thêm phần thưởng thành công!");
    } finally {
      setIsGlobalProcessing(false);
    }
  };

  const handleToggleWheelNotify = async (item) => {
    const currentVal = Boolean(item.notify_on_win ?? getWheelNotifyFallback(item.id));
    const nextVal = !currentVal;
    saveWheelNotifyFallback(item.id, nextVal);
    const updatedItem = { ...item, notify_on_win: nextVal };

    if (adminWheelType === 'money') {
      const nextList = wheelItemsMoneyDb.map(w => w.id === item.id ? updatedItem : w);
      setWheelItemsMoneyDb(nextList);
      try { localStorage.setItem('shop_wheel_money', JSON.stringify(nextList)); } catch { /* ignore */ }
    } else {
      const nextList = wheelItemsSpinDb.map(w => w.id === item.id ? updatedItem : w);
      setWheelItemsSpinDb(nextList);
      try { localStorage.setItem('shop_wheel_spin', JSON.stringify(nextList)); } catch { /* ignore */ }
    }

    try {
      const { error } = await supabase.from('wheel_items').update({ notify_on_win: nextVal }).eq('id', item.id);
      if (error) {
        if (error.message && (error.message.includes('notify_on_win') || error.code === '42703')) {
          showToast(nextVal ? `Đã bật thông báo cho "${item.name}"!` : `Đã tắt thông báo cho "${item.name}"!`, "info");
          return;
        }
        console.warn("Lỗi update notify_on_win:", error);
      }
      showToast(nextVal ? `🔔 Đã bật thông báo Discord cho "${item.name}"!` : `🔕 Đã tắt thông báo Discord cho "${item.name}"!`, "success");
    } catch {
      showToast(nextVal ? `Đã bật thông báo cho "${item.name}"!` : `Đã tắt thông báo cho "${item.name}"!`, "info");
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
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-white flex items-center gap-2 whitespace-nowrap"><Settings className="text-rose-500" /> PANEL ADMIN</h2>
            <button
              type="button"
              onClick={() => handleSaveMtcGameConfig(
                { ...mtcGameConfig, status: isMtcGameOpen ? 'hidden' : 'public' },
                isMtcGameOpen ? 'Đã ẨN cổng Mộng Thiên Cửu H5 khỏi khách thường!' : 'Đã HIỆN CÔNG KHAI cổng Mộng Thiên Cửu H5!'
              )}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${isMtcGameOpen ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25' : 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'}`}
              title="Bấm để Ẩn / Hiện nhanh menu Mộng Thiên Cửu H5 ngoài trang chủ"
            >
              {isMtcGameOpen ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>🐉 Mộng Thiên Cửu: {isMtcGameOpen ? 'Đang Hiện (Bấm Ẩn)' : 'Đang Ẩn (Bấm Hiện)'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveMtcGameConfig(
                { ...mtcGameConfig, webPlayStatus: isMtcWebPlayPublic ? 'hidden' : 'public' },
                isMtcWebPlayPublic ? 'Đã ẨN nút Chơi Trên Web (chỉ nội bộ Admin dùng)!' : 'Đã HIỆN CÔNG KHAI nút Chơi Trên Web cho mọi người!'
              )}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${isMtcWebPlayPublic ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25' : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'}`}
              title="Bấm để Ẩn / Hiện chế độ Chơi Trên Web (/play/) cho khách"
            >
              {isMtcWebPlayPublic ? <Globe size={14} /> : <Lock size={14} />}
              <span>🌐 Chơi Web MTC: {isMtcWebPlayPublic ? 'Đang Mở (Bấm Ẩn Nội Bộ)' : 'Đang Ẩn Nội Bộ (Bấm Mở)'}</span>
            </button>
          </div>
          <div className="flex bg-[#151D2F] p-1 md:p-1.5 rounded-xl border border-slate-800 whitespace-nowrap shadow-lg overflow-x-auto scrollbar-hide w-full">
            {['users', 'messages', 'accs', 'deposits', 'rentreqs', 'boosting', 'wheel', 'wizard', 'mtc'].map(tab => {
              const labels = { users: 'Người Dùng', messages: 'Hộp Thư', accs: 'Kho Nick', deposits: 'Nạp Tiền', rentreqs: 'Thuê Nick', boosting: 'Cày Thuê', wheel: 'Vòng Quay', wizard: '🃏 Lật Thẻ Phù Thủy', mtc: '🐉 Mộng Thiên Cửu' };
              const isHiddenOnMobile = tab === 'accs';
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
                        <td className="p-4 font-bold text-white flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{u.name}</span>
                            {u.role === 'admin' && <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 uppercase">Admin</span>}
                            {u.isLocked && <Lock size={12} className="text-rose-500" />}
                          </div>
                          {u.linked_game_id && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shadow-sm" title={`Nick Game liên kết: ${u.linked_game_id}`}>
                              🎮 {String(u.linked_game_id).startsWith('discord_') ? 'DC: ' + u.linked_game_id.replace('discord_', '') : '@' + u.linked_game_id}
                            </span>
                          )}
                        </td>
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
                <form
                  key={`${depositBonusConfig.minAmount}_${depositBonusConfig.bonusSpins}`}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const minVal = parseInt(e.target.minAmount.value) || 0;
                    const spinsVal = parseInt(e.target.bonusSpins.value) || 0;
                    const newConfig = {
                      minAmount: minVal,
                      bonusSpins: spinsVal
                    };
                    setDepositBonusConfig(newConfig);
                    localStorage.setItem('shop_deposit_config', JSON.stringify(newConfig));
                    
                    try {
                      const { error } = await supabase
                        .from('site_config')
                        .upsert({ id: 'deposit_bonus', value: newConfig, updated_at: new Date().toISOString() });
                      
                      if (error) {
                        console.warn("Cảnh báo lưu site_config:", error);
                        showToast("Đã lưu cài đặt khuyến mãi thành công!", "success");
                      } else {
                        showToast("Lưu cài đặt khuyến mãi nạp thành công!", "success");
                      }
                    } catch (err) {
                      console.error(err);
                      showToast("Đã lưu cài đặt khuyến mãi nạp!", "success");
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                >
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Mốc Nạp Tối Thiểu (VNĐ)</label>
                    <input name="minAmount" type="number" defaultValue={depositBonusConfig.minAmount} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-emerald-400 font-bold outline-none focus:border-emerald-500" required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Số Lượt Quay Tặng (Spin)</label>
                    <input name="bonusSpins" type="number" defaultValue={depositBonusConfig.bonusSpins} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-rose-400 font-bold outline-none focus:border-rose-500" required />
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold text-sm transition-colors shadow-lg cursor-pointer">Lưu Cài Đặt</button>
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
                          <td className="p-4 flex items-center justify-center gap-2">
                            {d.status === 'Chờ duyệt' ? (
                              <>
                                {(d.type === 'card' || (d.details && d.details.toLowerCase().includes('thẻ')) || String(d.id).startsWith('CARD')) && (
                                  <span className="text-yellow-400 font-bold text-[11px] bg-yellow-400/10 border border-yellow-400/20 px-2 py-1.5 rounded flex items-center gap-1 whitespace-nowrap">⚡ Đang gạch thẻ</span>
                                )}
                                <button onClick={() => {
                                  setApproveDepositModal(d);
                                }} className="bg-emerald-600 px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-lg whitespace-nowrap cursor-pointer">Duyệt Cộng</button>
                                <button onClick={() => {
                                  setConfirmDialog({
                                    title: 'Từ chối Nạp', message: `Từ chối yêu cầu nạp #${d.id} của khách ${d.user || ''}?`, onConfirm: async () => {
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
                                }} className="bg-rose-500/20 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer">Từ chối</button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2.5 py-1 rounded text-xs font-bold ${d.status === 'Thành công' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{d.status}</span>
                                {d.status !== 'Thành công' && (
                                  <button
                                    onClick={() => setApproveDepositModal(d)}
                                    className="bg-emerald-600/80 px-2 py-1 rounded text-white text-[11px] font-bold hover:bg-emerald-500 transition-colors shadow whitespace-nowrap cursor-pointer"
                                    title="Duyệt cộng bù tiền cho khách nếu đơn bị thất bại ngoài ý muốn"
                                  >
                                    Duyệt Bù
                                  </button>
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => setConfirmDialog({
                                title: 'Xoá Đơn Nạp',
                                message: `Bạn có chắc chắn muốn xoá vĩnh viễn đơn nạp #${d.id} (${d.user || ''}) khỏi hệ thống?`,
                                onConfirm: async () => {
                                  try {
                                    const { error } = await supabase.from('deposit_requests').delete().eq('id', d.id);
                                    if (error) {
                                      console.error("Lỗi xoá đơn nạp:", error);
                                      showToast("Lỗi CSDL khi xoá đơn: " + (error.message || "vui lòng thử lại!"), "error");
                                      return;
                                    }
                                    setDepositRequests(prev => prev.filter(x => String(x.id) !== String(d.id)));
                                    if (d.telegram_message_id) {
                                      supabase.functions.invoke('telegram-bot', {
                                        body: { type: 'delete_request', requestId: d.id }
                                      }).catch(err => console.error("Lỗi cập nhật Telegram:", err));
                                    }
                                    showToast("Đã xoá đơn nạp vĩnh viễn thành công!", "success");
                                  } catch (err) {
                                    console.error("Lỗi xoá đơn:", err);
                                    showToast("Có lỗi xảy ra khi xoá đơn!", "error");
                                  }
                                }
                              })}
                              className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Xoá vĩnh viễn đơn nạp này"
                            >
                              <Trash2 size={16} />
                            </button>
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
                            (r.info?.kycMethod === 'cccd' || r.info?.kycMethod === 'verified_cccd' || r.info?.cccdNumber || r.info?.cccd_number) ? (
                              <div className="flex flex-col items-center justify-center p-2 text-blue-400 text-center">
                                <span className="text-[10px] text-slate-400">Số CCCD:</span>
                                <span className="text-xs font-bold text-white font-mono mt-0.5">{r.info?.cccdNumber || r.info?.cccd_number || 'Đã xác minh'}</span>
                                <span className="text-[9px] text-emerald-400 mt-1">Đã duyệt (Miễn cọc)</span>
                              </div>
                            ) : <span className="text-xs text-slate-500">Khách chưa xác minh</span>
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
                                    try { safeInfo = JSON.parse(safeInfo); } catch { safeInfo = {}; }
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
                  {['Tất cả', ...new Set(boostingDb.filter(b => (b.type || 'rank') === adminBoostingCategoryFilter).map(b => { try { return JSON.parse(b.game).name || b.game; } catch { return b.game; } }))].map(game => (
                    <button key={game} onClick={() => setAdminBoostingGameFilter(game)} className={`px-3 py-1.5 whitespace-nowrap text-xs font-bold rounded-lg flex-shrink-0 transition-all border snap-start ${adminBoostingGameFilter === game ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-[#151D2F] text-slate-400 border-slate-800 hover:bg-slate-800'}`}>{game === 'Tất cả' ? 'Tất cả Game' : game}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boostingDb.filter(b => { const gn = (() => { try { return JSON.parse(b.game).name || b.game; } catch { return b.game; } })(); return (b.type || 'rank') === adminBoostingCategoryFilter && (adminBoostingGameFilter === 'Tất cả' || gn === adminBoostingGameFilter); }).map(b => {
                  const adminGN = (() => { try { return JSON.parse(b.game).name || b.game; } catch { return b.game; } })();
                  return (
                    <div key={b.id} className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex flex-col group hover:border-blue-500/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{adminGN}</span>
                          {(() => {
                            let isFeatured = false;
                            try { isFeatured = JSON.parse(b.game).isFeatured; } catch { /* ignore */ }
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
                          try { const p = JSON.parse(b.game); gName = p.name || ''; gAvatar = p.avatar || null; } catch { /* ignore */ }
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
              {/* 1. KHỐI CẤU HÌNH TRẠNG THÁI, THỜI GIAN & MỐC NỔ BẢO HIỂM VQMM */}
              <div className="bg-gradient-to-br from-[#0B1120] via-[#0e1629] to-[#070b14] border border-amber-500/40 p-5 sm:p-6 rounded-2xl mb-8 shadow-2xl space-y-6">
                {/* HEADER & TRẠNG THÁI REALTIME */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      🎡
                    </div>
                    <div>
                      <h3 className="text-white font-black text-lg sm:text-xl flex items-center gap-2 tracking-wide">
                        Cấu Hình Sự Kiện & Quản Lý Vòng Quay May Mắn (VQMM)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Quản lý ẩn/mở sự kiện toàn website, hẹn giờ bắt đầu - kết thúc, mốc nổ bảo hiểm Giày Thần Tốc và chi phí quay.
                      </p>
                    </div>
                  </div>

                  {/* BADGE TRẠNG THÁI HIỆN TẠI & ĐỒNG HỒ ĐẾM NGƯỢC */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {wheelConfig.status === 'hidden' ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.35)]">
                        <EyeOff size={14} /> SỰ KIỆN ĐANG ẨN (CHỈ ADMIN TEST)
                      </span>
                    ) : wheelConfig.status === 'closed' ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-500/20 text-slate-400 border border-slate-600/50 flex items-center gap-1.5">
                        <AlertCircle size={14} /> SỰ KIỆN ĐÃ ĐÓNG / TẠM DỪNG
                      </span>
                    ) : wheelConfig.status === 'auto' ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        <Clock size={14} /> TỰ ĐỘNG THEO LỊCH TRÌNH
                      </span>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] animate-pulse">
                        <CheckCircle2 size={14} /> SỰ KIỆN ĐANG MỞ (CÔNG KHAI)
                      </span>
                    )}

                    {/* Đếm ngược / Hạn hiệu lực */}
                    <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-900/80 text-amber-400 border border-amber-500/30">
                      ⏳ {wheelCountdown.isExpired ? 'Đã hết hạn' : wheelCountdown.isUpcoming ? `Mở sau: ${wheelCountdown.days}N ${wheelCountdown.hours}:${wheelCountdown.minutes}:${wheelCountdown.seconds}` : `Còn: ${wheelCountdown.days}N ${wheelCountdown.hours}:${wheelCountdown.minutes}:${wheelCountdown.seconds}`}
                    </span>
                  </div>
                </div>

                {/* THANH THAO TÁC NHANH 1-CHẠM (QUICK ACTION BUTTONS) */}
                <div className="bg-slate-950/70 p-3 sm:p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Thao tác nhanh 1 chạm:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const newConfig = { ...wheelConfig, status: 'active', updated_at: new Date().toISOString() };
                        setWheelConfig(newConfig);
                        localStorage.setItem('shop_wheel_config', JSON.stringify(newConfig));
                        try {
                          await supabase.from('site_config').upsert({ id: 'wheel_config', value: newConfig });
                        } catch { /* ignore */ }
                        showToast("Đã MỞ sự kiện Vòng Quay May Mắn công khai cho toàn bộ khách hàng!", "success");
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        wheelConfig.status === 'active'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400 scale-105'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      <Eye size={14} /> 🟢 Mở Sự Kiện (Hiện Toàn Web)
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const newConfig = { ...wheelConfig, status: 'hidden', updated_at: new Date().toISOString() };
                        setWheelConfig(newConfig);
                        localStorage.setItem('shop_wheel_config', JSON.stringify(newConfig));
                        try {
                          await supabase.from('site_config').upsert({ id: 'wheel_config', value: newConfig });
                        } catch { /* ignore */ }
                        showToast("Đã ẨN sự kiện Vòng Quay May Mắn (Chỉ Admin thấy để test)!", "info");
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        wheelConfig.status === 'hidden'
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400 scale-105'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      <EyeOff size={14} /> 🔴 Ẩn Sự Kiện (Chỉ Admin Thấy)
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const newConfig = { ...wheelConfig, status: 'auto', updated_at: new Date().toISOString() };
                        setWheelConfig(newConfig);
                        localStorage.setItem('shop_wheel_config', JSON.stringify(newConfig));
                        try {
                          await supabase.from('site_config').upsert({ id: 'wheel_config', value: newConfig });
                        } catch { /* ignore */ }
                        showToast("Đã chuyển sang chế độ TỰ ĐỘNG THEO LỊCH (Bắt đầu & Kết thúc)!", "success");
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        wheelConfig.status === 'auto'
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-400 scale-105'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      <Clock size={14} /> ⏰ Chế Độ Tự Động Theo Giờ
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const newConfig = { ...wheelConfig, status: 'closed', updated_at: new Date().toISOString() };
                        setWheelConfig(newConfig);
                        localStorage.setItem('shop_wheel_config', JSON.stringify(newConfig));
                        try {
                          await supabase.from('site_config').upsert({ id: 'wheel_config', value: newConfig });
                        } catch { /* ignore */ }
                        showToast("Đã TẮT / ĐÓNG hẳn sự kiện Vòng Quay May Mắn trên toàn website!", "info");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        wheelConfig.status === 'closed'
                          ? 'bg-slate-700 text-white ring-2 ring-slate-400'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <X size={13} /> ⛔ Đóng Sự Kiện
                    </button>
                  </div>
                </div>

                {/* FORM CẤU HÌNH CHI TIẾT */}
                <form
                  key={wheelConfig.updated_at || wheelConfig.status || 'wheel-form'}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const rawStart = form.startTime.value;
                    const rawEnd = form.endTime.value;

                    const formattedStartTime = rawStart ? (rawStart.includes('+') ? rawStart : `${rawStart}:00+07:00`) : (wheelConfig.startTime || '2026-10-15T00:00:00+07:00');
                    const formattedEndTime = rawEnd ? (rawEnd.includes('+') ? rawEnd : `${rawEnd}:00+07:00`) : (wheelConfig.endTime || '2026-10-31T23:59:59+07:00');

                    const newConfig = {
                      ...wheelConfig,
                      status: form.status.value,
                      startTime: formattedStartTime,
                      endTime: formattedEndTime,
                      pityTarget: Math.max(1, parseInt(form.pityTarget.value) || 120),
                      moneyCost: Math.max(1000, parseInt(form.moneyCost.value) || 20000),
                      spinCost: Math.max(1, parseInt(form.spinCost.value) || 1),
                      ticketPrice: Math.max(1000, parseInt(form.ticketPrice?.value) || 20000),
                      updated_at: new Date().toISOString()
                    };

                    setWheelConfig(newConfig);
                    localStorage.setItem('shop_wheel_config', JSON.stringify(newConfig));
                    try {
                      await supabase.from('site_config').upsert({ id: 'wheel_config', value: newConfig });
                    } catch (err) {
                      console.warn("Lỗi lưu site_config wheel_config:", err);
                    }
                    showToast("Lưu toàn bộ cài đặt Vòng Quay May Mắn thành công!", "success");
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* TRƯỜNG 1: TRẠNG THÁI SỰ KIỆN */}
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Settings size={14} className="text-amber-400" />
                          Trạng Thái Sự Kiện
                        </span>
                      </label>
                      <select
                        name="status"
                        defaultValue={wheelConfig.status || 'closed'}
                        className="w-full p-3 bg-[#151D2F] border border-amber-500/40 rounded-xl text-sm font-bold text-amber-300 outline-none focus:border-amber-400 transition-colors"
                      >
                        <option value="active">🟢 Luôn Mở (Khách quay bình thường)</option>
                        <option value="hidden">🔴 Đang Ẩn (Chỉ Admin thấy để test)</option>
                        <option value="auto">⏰ Tự Động (Theo giờ Bắt đầu & Kết thúc)</option>
                        <option value="closed">⛔ Đã Kết Thúc (Tắt hẳn toàn web)</option>
                      </select>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Nút ẩn/mở sự kiện toàn website
                      </span>
                    </div>

                    {/* TRƯỜNG 2: THỜI GIAN BẮT ĐẦU */}
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-blue-400" />
                          Thời Gian Bắt Đầu (UTC+7)
                        </span>
                      </label>
                      <input
                        name="startTime"
                        type="datetime-local"
                        defaultValue={formatDateTimeLocal(wheelConfig.startTime || '2026-10-15T00:00:00+07:00')}
                        className="w-full p-3 bg-[#151D2F] border border-blue-500/40 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-400 transition-colors"
                        required
                      />
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Thời điểm chính thức mở sự kiện
                      </span>
                    </div>

                    {/* TRƯỜNG 3: THỜI GIAN KẾT THÚC */}
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-rose-400" />
                          Thời Gian Kết Thúc (UTC+7)
                        </span>
                      </label>
                      <input
                        name="endTime"
                        type="datetime-local"
                        defaultValue={formatDateTimeLocal(wheelConfig.endTime || '2026-10-31T23:59:59+07:00')}
                        className="w-full p-3 bg-[#151D2F] border border-rose-500/40 rounded-xl text-sm font-bold text-white outline-none focus:border-rose-400 transition-colors"
                        required
                      />
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Hạn chót đếm ngược kết thúc sự kiện
                      </span>
                    </div>

                    {/* TRƯỜNG 4: MỐC NỔ BẢO HIỂM */}
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Shield size={14} className="text-yellow-400" />
                          Mốc Nổ Bảo Hiểm (Số Lượt)
                        </span>
                        <span className="text-[11px] text-amber-400 font-mono font-bold">Lần {Number(wheelConfig.pityTarget || 120) + 1} nổ 100%</span>
                      </label>
                      <input
                        name="pityTarget"
                        type="number"
                        min="1"
                        max="1000"
                        defaultValue={wheelConfig.pityTarget || 120}
                        className="w-full p-3 bg-[#151D2F] border border-yellow-500/40 rounded-xl text-sm font-bold text-yellow-300 outline-none focus:border-yellow-400 transition-colors"
                        required
                      />
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Quay đủ {wheelConfig.pityTarget || 120} lượt chưa ra đồ hiếm -&gt; Lần {(wheelConfig.pityTarget || 120) + 1} nổ Giày Thần Tốc
                      </span>
                    </div>
                  </div>

                  {/* HÀNG 2: CHI PHÍ QUAY & NÚT LƯU */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Giá Quay Tiền (VNĐ/lần)</label>
                      <input
                        name="moneyCost"
                        type="number"
                        step="1000"
                        defaultValue={wheelConfig.moneyCost || 20000}
                        className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-xl text-sm text-emerald-400 font-bold outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Giá Quay Lượt (Số vé/lần)</label>
                      <input
                        name="spinCost"
                        type="number"
                        min="1"
                        defaultValue={wheelConfig.spinCost || 1}
                        className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-xl text-sm text-rose-400 font-bold outline-none focus:border-rose-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Giá Mua Vé Lẻ (VNĐ/vé)</label>
                      <input
                        name="ticketPrice"
                        type="number"
                        step="1000"
                        defaultValue={wheelConfig.ticketPrice || 20000}
                        className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-xl text-sm text-indigo-400 font-bold outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white p-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        <Save size={16} /> Lưu Cài Đặt Vòng Quay
                      </button>
                    </div>
                  </div>
                </form>

                {/* LIVE PREVIEW THÔNG TIN TÓM TẮT DÀNH CHO ADMIN */}
                <div className="bg-[#070b14]/90 p-3.5 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 font-bold">Tóm tắt cấu hình:</span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-md text-amber-300 font-bold">
                      Bảo hiểm: Mốc {wheelConfig.pityTarget || 120} lượt (Lần {(wheelConfig.pityTarget || 120) + 1} nổ 100%)
                    </span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-md text-emerald-400 font-bold">
                      Bắt đầu: {wheelConfig.startTime ? new Date(wheelConfig.startTime).toLocaleString('vi-VN') : '15/10/2026'}
                    </span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-md text-rose-400 font-bold">
                      Kết thúc: {wheelConfig.endTime ? new Date(wheelConfig.endTime).toLocaleString('vi-VN') : '31/10/2026'}
                    </span>
                  </div>
                  <div className="text-slate-400 italic">
                    💡 Mọi thay đổi sẽ đồng bộ ngay lập tức cho toàn bộ người chơi trên website.
                  </div>
                </div>
              </div>

              {/* TAB CHỌN LOẠI VÒNG QUAY ĐỂ SỬA */}
              <div className="flex border-b border-slate-800 mb-6 gap-2">
                <button onClick={() => setAdminWheelType('money')} className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${adminWheelType === 'money' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Cấu Hình Vòng Quay Tiền</button>
                <button onClick={() => setAdminWheelType('spin')} className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${adminWheelType === 'spin' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Cấu Hình Vòng Quay Lượt</button>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <button onClick={() => { setEditingWheel(null); setAdminWheelImage(null); setAdminWheelNotify(false); setAdminWheelRewardType(adminWheelType === 'spin' ? 'game_attacks' : 'money'); setShowWheelModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-emerald-600/20 transition-transform hover:scale-105"><PlusCircle size={18} /> Thêm Phần thưởng ({adminWheelType === 'money' ? 'Vòng Quay Tiền' : 'Vòng Quay Lượt'})</button>
                {adminWheelType === 'spin' && (
                  <button
                    onClick={() => {
                      const targetPity = Number(wheelConfig?.pityTarget) || 120;
                      setConfirmDialog({
                        title: 'Cài Đặt Mẫu Quà In-Game & Giày Huyền Thoại',
                        message: `Bạn có muốn tự động cài đặt 8 phần thưởng chuẩn cho Vòng Quay Lượt gồm: Giày Thần Tốc (Huyền Thoại 0.5% - Bảo hiểm ${targetPity + 1}), Đá Tinh Hoa (10%), Viên Tinh Thể (10%), Lượt Đánh Boss (15%), Hòm Boss (20%), Hòm Hoàng Kim (5%), 20 Xu Nâng Cấp (5%), và Trượt (34.5%) không? (Mặc định chỉ Giày Thần Tốc mới bật thông báo Discord, các món còn lại tắt thông báo để tránh spam).`,
                        onConfirm: async () => {
                          const sampleItems = [
                            { id: `WHEEL_SHOES_${Date.now()}`, name: 'Giày Thần Tốc (Huyền Thoại)', type: 'game_shoes_legendary', value: 1, rate: '0.5%', quantity: 999, color: '#f59e0b', image: LEGENDARY_SHOES_IMG, wheel_type: 'spin', notify_on_win: true },
                            { id: `WHEEL_STONE_${Date.now() + 1}`, name: '+5 Đá Tinh Hoa', type: 'game_essence_stone', value: 5, rate: '10%', quantity: 999, color: '#a855f7', image: '/game-assets/da_tinh_hoa.png', wheel_type: 'spin', notify_on_win: false },
                            { id: `WHEEL_CRYSTAL_${Date.now() + 2}`, name: '+10 Viên Tinh Thể', type: 'game_ring_crystal', value: 10, rate: '10%', quantity: 999, color: '#ec4899', image: '/game-assets/ring_crystal.png', wheel_type: 'spin', notify_on_win: false },
                            { id: `WHEEL_ATK_${Date.now() + 3}`, name: '+50.000 Lượt Đánh Boss', type: 'game_attacks', value: 50000, rate: '15%', quantity: 999, color: '#3b82f6', image: '/game-assets/weapon_song_dao.png', wheel_type: 'spin', notify_on_win: false },
                            { id: `WHEEL_CHEST_B_${Date.now() + 4}`, name: '+3 Hòm Boss', type: 'game_boss_chests', value: 3, rate: '20%', quantity: 999, color: '#10b981', image: '/game-assets/mystery_box_closed.png', wheel_type: 'spin', notify_on_win: false },
                            { id: `WHEEL_CHEST_R_${Date.now() + 5}`, name: '+1 Hòm Hoàng Kim', type: 'game_royal_chests', value: 1, rate: '5%', quantity: 999, color: '#8b5cf6', image: '/game-assets/royal_chest.png', wheel_type: 'spin', notify_on_win: false },
                            { id: `WHEEL_COINS_${Date.now() + 6}`, name: '+20 Xu Nâng Cấp', type: 'game_coins', value: 20, rate: '5%', quantity: 999, color: '#eab308', image: '/game-assets/gold_coin.png', wheel_type: 'spin', notify_on_win: false },
                            { id: `WHEEL_NONE_${Date.now() + 7}`, name: 'Chúc may mắn lần sau', type: 'none', value: 0, rate: '34.5%', quantity: 999, color: '#475569', image: null, wheel_type: 'spin', notify_on_win: false }
                          ];

                          sampleItems.forEach(it => saveWheelNotifyFallback(it.id, it.notify_on_win));

                          try {
                            try {
                              await supabase.from('wheel_items').delete().eq('wheel_type', 'spin');
                            } catch { /* ignore */ }
                            const { error } = await supabase.from('wheel_items').insert(sampleItems);
                            if (error) {
                              if (error.message && (error.message.includes('notify_on_win') || error.code === '42703')) {
                                const safeSample = sampleItems.map((it) => {
                                  const copy = { ...it };
                                  delete copy.notify_on_win;
                                  return copy;
                                });
                                await supabase.from('wheel_items').insert(safeSample);
                              } else {
                                showToast("Lỗi khi thêm mẫu: " + error.message, 'error');
                                return;
                              }
                            }
                            setWheelItemsSpinDb(sampleItems);
                            localStorage.setItem('shop_wheel_spin', JSON.stringify(sampleItems));
                            showToast("Đã cài đặt 8 phần thưởng mẫu In-Game & Giày Huyền Thoại thành công!", "success");
                          } catch (err) {
                            showToast("Lỗi: " + err.message, 'error');
                          }
                        }
                      });
                    }}
                    className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-amber-600/20 transition-transform hover:scale-105"
                  >
                    <Sparkles size={18} /> Cài Mẫu Quà In-Game & Giày Huyền Thoại
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {currentAdminWheelDb.map(w => {
                  const isNotified = Boolean(w.notify_on_win ?? getWheelNotifyFallback(w.id));
                  return (
                  <div key={w.id} className="bg-[#0B1120] p-4 rounded-xl border border-slate-700 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-slate-800 border border-slate-600`}>
                        {w.image ? (
                          <img
                            src={isLegendaryShoes(w) ? getShoesImage(w.image) : w.image}
                            className="w-full h-full object-cover"
                            alt={w.name}
                            onError={(e) => {
                              if (isLegendaryShoes(w)) {
                                e.target.src = LEGENDARY_SHOES_IMG;
                              } else if (w.type === 'game_essence_stone' || w.name?.toLowerCase().includes('tinh hoa')) {
                                e.target.src = '/game-assets/da_tinh_hoa.png';
                              } else if (w.type === 'game_ring_crystal' || w.name?.toLowerCase().includes('tinh thể')) {
                                e.target.src = '/game-assets/ring_crystal.png';
                              } else if (w.type === 'game_coins' || w.name?.toLowerCase().includes('xu')) {
                                e.target.src = '/game-assets/gold_coin.png';
                              } else if (w.type === 'game_attacks' || w.name?.toLowerCase().includes('lượt đánh')) {
                                e.target.src = '/game-assets/weapon_song_dao.png';
                              } else {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        ) : (w.type === 'game_coins' || w.name?.toLowerCase().includes('xu')) ? (
                          <img src="/game-assets/gold_coin.png" className="w-full h-full object-cover" alt={w.name} />
                        ) : (w.type === 'game_attacks' || w.name?.toLowerCase().includes('lượt đánh')) ? (
                          <img src="/game-assets/weapon_song_dao.png" className="w-full h-full object-cover" alt={w.name} />
                        ) : (
                          <Gift size={24} className="text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-bold">{w.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase flex flex-wrap gap-2">
                          <span className="font-bold text-amber-400">{
                            w.type === 'game_shoes_legendary' ? `👟 Giày HT (Pity ${(Number(wheelConfig?.pityTarget) || 120) + 1})` :
                            w.type === 'game_essence_stone' ? '💎 Đá Tinh Hoa' :
                            w.type === 'game_ring_crystal' ? '🔮 Viên Tinh Thể' :
                            w.type === 'game_attacks' ? '⚔️ Lượt Đánh' :
                            w.type === 'game_boss_chests' ? '📦 Hòm Boss' :
                            w.type === 'game_royal_chests' ? '👑 Hòm HK' :
                            w.type === 'game_coins' ? '🪙 Xu Game' :
                            w.type === 'money' ? 'Tiền' :
                            w.type === 'spin' ? 'Lượt' :
                            w.type === 'fund' ? 'Quỹ Thuê' :
                            w.type === 'other' ? 'Khác' : 'Trượt'
                          }</span>
                          {w.value > 0 && (
                            <span className="text-emerald-400 font-bold">
                              {w.type === 'game_attacks' ? `Số lượng: ${new Intl.NumberFormat('vi-VN').format(w.value)} Lượt` :
                               w.type === 'game_essence_stone' ? `Số lượng: ${w.value} Viên` :
                               w.type === 'game_ring_crystal' ? `Số lượng: ${w.value} Viên` :
                               w.type === 'game_boss_chests' ? `Số lượng: ${w.value} Hòm` :
                               w.type === 'game_royal_chests' ? `Số lượng: ${w.value} Hòm HK` :
                               w.type === 'game_coins' ? `Số lượng: ${new Intl.NumberFormat('vi-VN').format(w.value)} Xu` :
                               w.type === 'game_shoes_legendary' ? `Số lượng: ${w.value} Đôi` :
                               w.type === 'spin' ? `Số lượng: +${w.value} Vé` :
                               w.type === 'money' ? `Số tiền: ${new Intl.NumberFormat('vi-VN').format(w.value)}đ` :
                               w.type === 'fund' ? `Quỹ: ${new Intl.NumberFormat('vi-VN').format(w.value)}đ` :
                               `Số lượng: ${new Intl.NumberFormat('vi-VN').format(w.value)}`}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1 bg-slate-900 px-2 py-1.5 rounded text-xs text-blue-400 font-bold border border-slate-800 text-center">Tỉ lệ: {w.rate}</div>
                      <div className="flex-1 bg-slate-900 px-2 py-1.5 rounded text-xs text-emerald-400 font-bold border border-slate-800 text-center">Còn: {w.quantity ?? 999}</div>
                    </div>

                    {/* Nút tích chọn / chuyển đổi thông báo trực tiếp trên thẻ */}
                    <div className="flex items-center justify-between mb-3 px-2.5 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                        <Bell size={12} className={isNotified ? "text-amber-400" : "text-slate-600"} />
                        Thông báo trúng:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleWheelNotify(w)}
                        title="Bấm để bật/tắt nhanh thông báo Discord khi quay trúng món này"
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                          isNotified
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-400'
                        }`}
                      >
                        {isNotified ? '🔔 Có Báo' : '🔕 Không Báo'}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => {
                        let editImg = w.image;
                        if (!editImg) {
                          if (w.type === 'game_coins' || (w.name && w.name.toLowerCase().includes('xu'))) editImg = '/game-assets/gold_coin.png';
                          else if (w.type === 'game_attacks' || (w.name && w.name.toLowerCase().includes('lượt đánh'))) editImg = '/game-assets/weapon_song_dao.png';
                        }
                        setEditingWheel(w);
                        setAdminWheelImage(editImg || null);
                        setAdminWheelNotify(Boolean(w.notify_on_win ?? getWheelNotifyFallback(w.id)));
                        setAdminWheelRewardType(w.type || (adminWheelType === 'spin' ? 'game_attacks' : 'money'));
                        setShowWheelModal(true);
                      }} className="flex-1 py-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition-colors"><Edit size={14} className="mx-auto" /></button>
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
                );
              })}
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

          {/* TAB LẬT THẺ PHÙ THỦY */}
          {adminTab === 'wizard' && (
            <Suspense fallback={<div className="py-16 text-center text-slate-400 text-sm">Đang tải...</div>}>
              <WizardAdminPanel
                wizardEventConfig={wizardEventConfig}
                config={wizardEventConfig}
                setWizardEventConfig={setWizardEventConfig}
                onSaveConfig={async (newCfg) => {
                  setWizardEventConfig(newCfg);
                  localStorage.setItem('shop_wizard_event_config', JSON.stringify(newCfg));
                  try {
                    await supabase.from('site_config').upsert({ id: 'wizard_event_config', value: newCfg });
                  } catch (e) {
                    console.warn("Lỗi lưu wizard_event_config:", e);
                  }
                  showToast("Lưu cấu hình Sự Kiện Phù Thủy thành công!");
                }}
                wizardItems={wizardCardItems}
                rewards={wizardCardItems}
                setWizardItems={setWizardCardItems}
                onSaveRewards={async (newRewards) => {
                  setWizardCardItems(newRewards);
                  localStorage.setItem('shop_wizard_card_items', JSON.stringify(newRewards));
                  try {
                    await supabase.from('site_config').upsert({ id: 'wizard_card_items', value: newRewards });
                  } catch (e) {
                    console.warn("Lỗi lưu wizard_card_items:", e);
                  }
                  showToast("Cập nhật danh sách phần thưởng Lật Thẻ thành công!");
                }}
                showToast={showToast}
              />
            </Suspense>
          )}

          {/* TAB MỘNG THIÊN CỬU H5 (ẨN/HIỆN & CẤU HÌNH CẦU NỐI TẢI + NẠP) */}
          {adminTab === 'mtc' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1120] border border-amber-500/30 p-5 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="text-amber-400" size={20} />
                    <h3 className="text-lg font-black text-white">Quản Lý Cổng Game Mộng Thiên Cửu H5</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${isMtcGameOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                      {isMtcGameOpen ? '🌐 Đang Công Khai' : '🔒 Đang Ẩn (Chỉ Admin Thấy)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Khi đặt ở chế độ <strong>Ẩn</strong>, chỉ tài khoản <strong className="text-amber-400">Admin</strong> nhìn thấy nút &quot;🐉 Mộng Thiên Cửu&quot; trên menu để tải APK và test nạp. Bật <strong>Công Khai</strong> khi sẵn sàng mở cho tất cả người chơi!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSaveMtcGameConfig({ ...mtcGameConfig, status: isMtcGameOpen ? 'hidden' : 'public' }, isMtcGameOpen ? 'Đã ẨN cổng Mộng Thiên Cửu H5 khỏi khách thường!' : 'Đã HIỆN CÔNG KHAI cổng Mộng Thiên Cửu H5!')}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${isMtcGameOpen ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                  >
                    {isMtcGameOpen ? <><EyeOff size={16} /> Ẩn Khỏi Khách</> : <><Eye size={16} /> Bật Hiện Công Khai</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('mongthiencuu')}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Gamepad2 size={16} /> Mở Trang Game
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1120] border border-cyan-500/30 p-5 rounded-2xl">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Globe className="text-cyan-400" size={20} />
                    <h3 className="text-base sm:text-lg font-black text-white">Chế Độ Chơi Trên Web (<span className="font-mono text-cyan-300">shoptiengaming.com/play</span>)</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${isMtcWebPlayPublic ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                      {isMtcWebPlayPublic ? '🌐 Đang Mở Công Khai' : '🔒 Chỉ Nội Bộ (Đang ẩn khỏi khách)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Khi đặt ở chế độ <strong className="text-amber-300">Chỉ Nội Bộ</strong>, nút &quot;Chơi Ngay Trên Web&quot; và link <span className="font-mono text-slate-300">/play/</span> bị ẩn khỏi khách thường (khách chỉ thấy nút tải APK Android), còn Admin vẫn dùng bình thường để test nội bộ.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSaveMtcGameConfig(
                      { ...mtcGameConfig, webPlayStatus: isMtcWebPlayPublic ? 'hidden' : 'public' },
                      isMtcWebPlayPublic ? 'Đã ẨN nút Chơi Trên Web (chỉ nội bộ Admin dùng)!' : 'Đã HIỆN CÔNG KHAI nút Chơi Trên Web cho mọi người!'
                    )}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${isMtcWebPlayPublic ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                  >
                    {isMtcWebPlayPublic ? <><Lock size={16} /> Ẩn Chơi Trên Web (Chỉ Nội Bộ)</> : <><Globe size={16} /> Mở Chơi Web Công Khai</>}
                  </button>
                  <a
                    href="/play/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    🎮 Vào Chơi Web Nội Bộ (/play/)
                  </a>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveMtcGameConfig({
                    ...mtcGameConfig,
                    webPlayStatus: mtcGameConfig?.webPlayStatus === 'public' ? 'public' : 'hidden',
                    apkUrl: e.target.apkUrl.value.trim() || '/download/MongThienCuu_s0_beta_online.apk',
                    webPlayUrl: e.target.webPlayUrl.value.trim() || 'https://shoptiengaming.com/play/',
                    version: e.target.version.value.trim() || '2.6.0-s0-beta',
                    notice: e.target.notice.value.trim()
                  });
                }}
                className="bg-[#0B1120] border border-slate-800 p-5 rounded-2xl space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2"><Settings2 size={16} /> Cấu Hình Đường Dẫn Tải APK Cố Định &amp; Web H5</h4>
                  <button
                    type="button"
                    onClick={() => handleRefreshMtcTunnel(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={13} /> Đồng Bộ Link Tunnel Live
                  </button>
                </div>
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-300">🌐 Địa chỉ chơi Web cố định: </span>
                    <a href="/play/" target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-white underline decoration-emerald-400/60 hover:text-emerald-200">
                      https://shoptiengaming.com/play/
                    </a>
                    <span className="text-slate-300 ml-2">(tự động nối Tunnel đang live: <span className="font-mono text-cyan-300">{mtcServerRegistry?.server_url || mtcServerRegistry?.base_url || 'Đang chờ đồng bộ'}</span>)</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Link Tải APK Cố Định</label>
                    <input name="apkUrl" type="text" defaultValue={mtcGameConfig.apkUrl || '/download/MongThienCuu_s0_beta_online.apk'} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-emerald-400 font-mono outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Địa Chỉ Chơi Web Cố Định (Tự nối Tunnel đang live: {mtcServerRegistry?.server_url || 'Chưa đồng bộ'})</label>
                    <input name="webPlayUrl" type="text" defaultValue={mtcGameConfig.webPlayUrl || 'https://shoptiengaming.com/play/'} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-cyan-300 font-mono outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Phiên Bản Hiển Thị</label>
                    <input name="version" type="text" defaultValue={mtcGameConfig.version || '2.6.0-s0-beta'} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Thông Báo Nhanh Ngoài Cổng Game</label>
                    <input name="notice" type="text" defaultValue={mtcGameConfig.notice || ''} className="w-full p-3 bg-[#151D2F] border border-slate-700 rounded-lg text-sm text-amber-300 outline-none focus:border-amber-500" />
                  </div>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer flex items-center gap-2">
                  <Save size={16} /> Lưu Cấu Hình
                </button>
              </form>

              <div className="bg-[#0B1120] border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2"><History size={16} className="text-amber-400" /> Lịch Sử Nạp Ví Game Mộng Thiên Cửu H5</h4>
                  <span className="text-xs text-slate-400">Tổng: {transactionsDb.filter(t => t.type === 'mtc_game_topup').length} đơn</span>
                </div>
                <div className="overflow-x-auto max-h-[360px] custom-scrollbar">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="bg-slate-900 text-slate-400 uppercase">
                      <tr><th className="p-3">Mã Đơn</th><th className="p-3">Khách Web</th><th className="p-3">Chi Tiết Gói</th><th className="p-3">Thời Gian</th><th className="p-3 text-right">Số Tiền</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {transactionsDb.filter(t => t.type === 'mtc_game_topup').length === 0 ? (
                        <tr><td colSpan="5" className="p-6 text-center text-slate-500 italic">Chưa có đơn nạp Mộng Thiên Cửu H5 nào.</td></tr>
                      ) : transactionsDb.filter(t => t.type === 'mtc_game_topup').map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-amber-400">{tx.id}</td>
                          <td className="p-3 font-bold text-white">{tx.user}</td>
                          <td className="p-3 text-slate-300">{tx.action}</td>
                          <td className="p-3 text-slate-400">{tx.date}</td>
                          <td className="p-3 text-right font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(tx.amount)}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                if (isProcessingActionRef.current) return;
                isProcessingActionRef.current = true;
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
                } finally { isProcessingActionRef.current = false; }
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
                if (isProcessingActionRef.current) return;
                isProcessingActionRef.current = true;
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
                } catch (e) { console.error(e); } finally { isProcessingActionRef.current = false; }
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
            <div className="bg-[#151D2F] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-700/60">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Gift className="text-rose-500" /> {editingWheel ? 'Sửa Phần Thưởng' : 'Thêm Phần Thưởng'}
                </h3>
                <button onClick={() => setShowWheelModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form key={editingWheel ? editingWheel.id : 'new_' + adminWheelType} onSubmit={handleSaveWheel} className="space-y-4">
                {/* Badge hiển thị loại vòng quay đang chỉnh */}
                <div className="flex items-center justify-between bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700 text-xs">
                  <span className="text-slate-400 font-medium">Đang cấu hình:</span>
                  <span className={`font-black px-2.5 py-1 rounded-lg ${adminWheelType === 'money' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                    {adminWheelType === 'money' ? '💰 VÒNG QUAY TIỀN' : '🎮 VÒNG QUAY LƯỢT (QUÀ IN-GAME)'}
                  </span>
                </div>

                {/* 1. LOẠI PHẦN THƯỞNG (Đặt lên đầu để admin chọn đúng loại trước) */}
                <div>
                  <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5 mb-1.5">
                    <span>Loại phần thưởng trao thưởng</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="type"
                    value={adminWheelRewardType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setAdminWheelRewardType(newType);
                      const preset = IN_GAME_REWARD_CATALOG[newType];
                      const form = e.target.form;
                      if (preset) {
                        setAdminWheelImage(preset.image);
                        if (form && !editingWheel) {
                          if (form.name) form.name.value = preset.name;
                          if (form.value) form.value.value = preset.defaultValue;
                          if (form.rate) form.rate.value = preset.defaultRate;
                          if (form.color) form.color.value = preset.defaultColor;
                        }
                      } else if (newType === 'spin') {
                        setAdminWheelImage('/game-assets/spin_ticket.png');
                        if (form && !editingWheel) {
                          if (form.name) form.name.value = '+1 Lượt Quay';
                          if (form.value) form.value.value = 1;
                          if (form.rate) form.rate.value = '10%';
                          if (form.color) form.color.value = '#ec4899';
                        }
                      } else if (newType === 'money') {
                        setAdminWheelImage(null);
                        if (form && !editingWheel) {
                          if (form.name) form.name.value = '+50.000 VNĐ';
                          if (form.value) form.value.value = 50000;
                          if (form.rate) form.rate.value = '10%';
                          if (form.color) form.color.value = '#10b981';
                        }
                      } else if (newType === 'fund') {
                        setAdminWheelImage(null);
                        if (form && !editingWheel) {
                          if (form.name) form.name.value = '+20.000đ Quỹ Thuê';
                          if (form.value) form.value.value = 20000;
                          if (form.rate) form.rate.value = '10%';
                          if (form.color) form.color.value = '#06b6d4';
                        }
                      } else if (newType === 'none') {
                        setAdminWheelImage(null);
                        if (form && !editingWheel) {
                          if (form.name) form.name.value = 'Chúc may mắn lần sau';
                          if (form.value) form.value.value = 0;
                          if (form.rate) form.rate.value = '34.5%';
                          if (form.color) form.color.value = '#475569';
                        }
                      }
                    }}
                    className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white text-sm font-medium outline-none focus:border-blue-500 transition-colors"
                  >
                    <optgroup label="🎮 VẬT PHẨM TRONG GAME (MỘNG THIÊN HUYỄN)">
                      <option value="game_attacks">⚔️ Lượt Đánh Boss (In-Game)</option>
                      <option value="game_essence_stone">💎 Đá Tinh Hoa (Nâng Cấp Kỹ Năng Nhẫn)</option>
                      <option value="game_ring_crystal">🔮 Viên Tinh Thể (Nâng Sao Nhẫn Thần Binh)</option>
                      <option value="game_boss_chests">📦 Hòm Boss Thường (In-Game)</option>
                      <option value="game_royal_chests">👑 Hòm Hoàng Kim (In-Game)</option>
                      <option value="game_coins">🪙 Xu Nâng Cấp Boss (In-Game)</option>
                      <option value="game_shoes_legendary">👟 Giày Thần Tốc (Huyền Thoại - Bảo Hiểm {(Number(wheelConfig?.pityTarget) || 120) + 1})</option>
                    </optgroup>
                    <optgroup label="🌐 TÀI KHOẢN WEB">
                      <option value="spin">🎟️ Lượt / Vé Quay Web</option>
                      <option value="money">💵 Tiền VNĐ (Cộng Ví Chính)</option>
                      <option value="fund">🏦 Cộng Tiền Quỹ Thuê Acc</option>
                      <option value="none">❌ Trượt (Chúc may mắn lần sau)</option>
                      <option value="other">🎁 Vật Phẩm Khác</option>
                    </optgroup>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {adminWheelRewardType === 'game_attacks' && '⚔️ Tự động cộng số lượt đánh Boss vào nhân vật game (vĩnh viễn).'}
                    {adminWheelRewardType === 'game_essence_stone' && '💎 Đá Tinh Hoa tự động cộng vào túi đồ nhân vật game để nâng cấp Level Kỹ Năng Nhẫn Thần Binh.'}
                    {adminWheelRewardType === 'game_ring_crystal' && '🔮 Viên Tinh Thể tự động cộng vào túi đồ nhân vật game để cường hóa, tăng sao và đột phá Nhẫn Thần Binh.'}
                    {adminWheelRewardType === 'game_boss_chests' && '📦 Tự động gửi Hòm Boss thường vào túi đồ nhân vật game.'}
                    {adminWheelRewardType === 'game_royal_chests' && '👑 Tự động gửi Hòm Hoàng Kim cao cấp vào túi đồ nhân vật game.'}
                    {adminWheelRewardType === 'game_coins' && '🪙 Tự động cộng Xu Nâng Cấp Boss vào nhân vật game.'}
                    {adminWheelRewardType === 'game_shoes_legendary' && `👟 Trang bị Huyền Thoại (+300 Tốc độ). Áp dụng cơ chế Bảo hiểm ${(Number(wheelConfig?.pityTarget) || 120) + 1} lần quay.`}
                    {adminWheelRewardType === 'spin' && '🎟️ Tự động cộng thêm lượt quay Vòng Quay cho tài khoản web.'}
                    {adminWheelRewardType === 'money' && '💵 Tự động cộng tiền VNĐ vào số dư ví chính trên web.'}
                    {adminWheelRewardType === 'fund' && '🏦 Tự động cộng tiền vào Quỹ Thuê Acc trên web.'}
                    {adminWheelRewardType === 'none' && '❌ Ô trượt: Người chơi không nhận được phần thưởng khi quay vào ô này.'}
                    {adminWheelRewardType === 'other' && '🎁 Phần thưởng tùy biến khác do Admin tự đặt.'}
                  </p>
                </div>

                {/* 2. TÊN PHẦN THƯỞNG */}
                <div>
                  <label className="text-xs text-slate-300 font-bold flex items-center justify-between mb-1.5">
                    <span>Tên Quà (Hiển thị trên Vòng Quay)</span>
                    <span className="text-slate-500 font-normal text-[11px]">Hiển thị công khai cho khách</span>
                  </label>
                  <input
                    name="name"
                    defaultValue={editingWheel?.name || (
                      adminWheelRewardType === 'game_attacks' ? '+50.000 Lượt Đánh Boss' :
                      adminWheelRewardType === 'game_essence_stone' ? '+5 Đá Tinh Hoa' :
                      adminWheelRewardType === 'game_ring_crystal' ? '+10 Viên Tinh Thể' :
                      adminWheelRewardType === 'game_boss_chests' ? '+3 Hòm Boss' :
                      adminWheelRewardType === 'game_royal_chests' ? '+1 Hòm Hoàng Kim' :
                      adminWheelRewardType === 'game_coins' ? '+20 Xu Nâng Cấp' :
                      adminWheelRewardType === 'game_shoes_legendary' ? 'Giày Thần Tốc (Huyền Thoại)' :
                      adminWheelRewardType === 'spin' ? '+1 Lượt Quay' :
                      adminWheelRewardType === 'money' ? '+50.000 VNĐ' :
                      adminWheelRewardType === 'fund' ? '+20.000đ Quỹ Thuê' :
                      adminWheelRewardType === 'none' ? 'Chúc may mắn lần sau' : 'Vật Phẩm May Mắn'
                    )}
                    placeholder="VD: +5 Đá Tinh Hoa, +10 Viên Tinh Thể..."
                    className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 transition-colors font-medium"
                    required
                  />
                </div>

                {/* 3. SỐ LƯỢNG QUÀ NHẬN VÀ TỈ LỆ TRÚNG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-emerald-400 font-bold flex items-center gap-1 mb-1.5">
                      <span>
                        {adminWheelRewardType === 'game_attacks' ? 'Số lượng lượt đánh tặng' :
                         adminWheelRewardType === 'game_essence_stone' ? 'Số lượng Đá Tinh Hoa tặng' :
                         adminWheelRewardType === 'game_ring_crystal' ? 'Số lượng Tinh Thể tặng' :
                         adminWheelRewardType === 'game_boss_chests' ? 'Số lượng Hòm Boss tặng' :
                         adminWheelRewardType === 'game_royal_chests' ? 'Số lượng Hòm HK tặng' :
                         adminWheelRewardType === 'game_coins' ? 'Số lượng Xu Nâng Cấp tặng' :
                         adminWheelRewardType === 'game_shoes_legendary' ? 'Số lượng Giày tặng' :
                         adminWheelRewardType === 'money' ? 'Số tiền VNĐ cộng ví' :
                         adminWheelRewardType === 'spin' ? 'Số vé / lượt quay tặng' :
                         adminWheelRewardType === 'fund' ? 'Số tiền quỹ cộng' :
                         adminWheelRewardType === 'none' ? 'Số lượng (Trượt = 0)' : 'Số lượng quà nhận'}
                      </span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      name="value"
                      type="number"
                      defaultValue={editingWheel?.value ?? (
                        adminWheelRewardType === 'game_attacks' ? 50000 :
                        adminWheelRewardType === 'game_essence_stone' ? 5 :
                        adminWheelRewardType === 'game_ring_crystal' ? 10 :
                        adminWheelRewardType === 'game_boss_chests' ? 3 :
                        adminWheelRewardType === 'game_royal_chests' ? 1 :
                        adminWheelRewardType === 'game_coins' ? 20 :
                        adminWheelRewardType === 'game_shoes_legendary' ? 1 :
                        adminWheelRewardType === 'spin' ? 1 :
                        adminWheelRewardType === 'money' ? 50000 :
                        adminWheelRewardType === 'fund' ? 20000 : 0
                      )}
                      disabled={adminWheelRewardType === 'none'}
                      placeholder="VD: 5, 3, 20..."
                      className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {adminWheelRewardType === 'game_attacks' ? 'Người chơi trúng sẽ nhận đúng số lượt này.' :
                       adminWheelRewardType === 'game_essence_stone' ? 'Số lượng Đá Tinh Hoa gửi thẳng vào túi đồ game.' :
                       adminWheelRewardType === 'game_ring_crystal' ? 'Số lượng Tinh Thể gửi thẳng vào túi đồ game.' :
                       adminWheelRewardType === 'game_boss_chests' || adminWheelRewardType === 'game_royal_chests' ? 'Số lượng rương gửi thẳng vào túi đồ.' :
                       adminWheelRewardType === 'game_coins' ? 'Số xu cộng vào tài khoản game.' :
                       adminWheelRewardType === 'game_shoes_legendary' ? 'Mặc định 1 đôi Giày Huyền Thoại.' :
                       adminWheelRewardType === 'money' ? 'Số tiền cộng vào tài khoản (đ).' :
                       adminWheelRewardType === 'spin' ? 'Số lượt quay cộng thêm.' : 'Số lượng trao thưởng mỗi lần trúng.'}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-blue-400 font-bold flex items-center justify-between mb-1.5">
                      <span>Tỉ Lệ Trúng Vòng Quay</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      name="rate"
                      defaultValue={editingWheel?.rate || (
                        adminWheelRewardType === 'game_shoes_legendary' ? '0.5%' :
                        adminWheelRewardType === 'game_essence_stone' ? '10%' :
                        adminWheelRewardType === 'game_ring_crystal' ? '10%' :
                        adminWheelRewardType === 'game_attacks' ? '15%' :
                        adminWheelRewardType === 'game_boss_chests' ? '20%' :
                        adminWheelRewardType === 'game_royal_chests' ? '5%' :
                        adminWheelRewardType === 'game_coins' ? '5%' :
                        adminWheelRewardType === 'none' ? '34.5%' : '10%'
                      )}
                      placeholder="VD: 20% hoặc 5%"
                      className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 font-bold"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Tỉ lệ xuất hiện khi quay (VD: 20%, 5%, 0.5%).</span>
                  </div>
                </div>

                {/* 4. KHO QUÀ VÀ MÀU SẮC Ô QUÀ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1.5">
                      Kho quà còn lại (0 = Ẩn/Hết)
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      defaultValue={editingWheel?.quantity ?? 999}
                      placeholder="VD: 999"
                      className="w-full p-3 bg-[#0B1120] border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-blue-500 font-medium"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Nhập 999 để không giới hạn; nhập 0 sẽ tạm ẩn.</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-bold flex items-center gap-1 mb-1.5">
                      <Flame size={14} className="text-amber-400" /> Màu sắc ô trên vòng quay
                    </label>
                    <div className="flex items-center gap-2.5 p-1.5 bg-[#0B1120] border border-slate-700 rounded-xl h-[46px]">
                      <input
                        name="color"
                        type="color"
                        defaultValue={editingWheel?.color || (
                          adminWheelRewardType === 'game_shoes_legendary' ? '#f59e0b' :
                          adminWheelRewardType === 'game_essence_stone' ? '#a855f7' :
                          adminWheelRewardType === 'game_ring_crystal' ? '#ec4899' :
                          adminWheelRewardType === 'game_attacks' ? '#3b82f6' :
                          adminWheelRewardType === 'game_boss_chests' ? '#10b981' :
                          adminWheelRewardType === 'game_royal_chests' ? '#8b5cf6' :
                          adminWheelRewardType === 'game_coins' ? '#eab308' :
                          adminWheelRewardType === 'none' ? '#475569' : '#f43f5e'
                        )}
                        className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                      <span className="text-[11px] text-slate-400">Mã màu nan quạt trên Vòng Quay</span>
                    </div>
                  </div>
                </div>

                {/* 5. ẢNH VẬT PHẨM (TÙY CHỌN HOẶC DÙNG MẪU GAME CÓ SẴN) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-300 font-bold">Ảnh đại diện vật phẩm (Tùy chọn)</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setAdminWheelImage(LEGENDARY_SHOES_IMG)}
                        className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 transition-colors"
                      >👟 Giày</button>
                      <button
                        type="button"
                        onClick={() => setAdminWheelImage('/game-assets/gold_coin.png')}
                        className="text-[10px] bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30 transition-colors"
                      >🪙 Xu</button>
                      <button
                        type="button"
                        onClick={() => setAdminWheelImage('/game-assets/weapon_song_dao.png')}
                        className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 transition-colors"
                      >⚔️ Lượt Đánh</button>
                      <button
                        type="button"
                        onClick={() => setAdminWheelImage('/game-assets/da_tinh_hoa.png')}
                        className="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 transition-colors"
                      >💎 Đá Tinh Hoa</button>
                      <button
                        type="button"
                        onClick={() => setAdminWheelImage('/game-assets/ring_crystal.png')}
                        className="text-[10px] bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded border border-pink-500/30 transition-colors"
                      >🔮 Tinh Thể</button>
                      <button
                        type="button"
                        onClick={() => setAdminWheelImage('/game-assets/mystery_box_closed.png')}
                        className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 transition-colors"
                      >📦 Hòm Boss</button>
                      <button
                        type="button"
                        onClick={() => setAdminWheelImage('/game-assets/royal_chest.png')}
                        className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30 transition-colors"
                      >👑 Hòm HK</button>
                      {adminWheelImage && (
                        <button
                          type="button"
                          onClick={() => setAdminWheelImage(null)}
                          className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30 transition-colors"
                        >Xóa ảnh</button>
                      )}
                    </div>
                  </div>

                  <div className="border border-dashed border-slate-600 rounded-xl p-3 text-center hover:bg-slate-800/40 transition-colors relative group bg-[#0B1120]">
                    <input type="file" accept="image/*" onChange={handleWheelImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {adminWheelImage ? (
                      <div className="relative flex items-center justify-center gap-3">
                        <img src={adminWheelImage} className="h-16 object-contain rounded-lg shadow-md" alt="Preview" />
                        <div className="text-left text-xs text-slate-300">
                          <p className="font-bold text-emerald-400">Đã chọn ảnh</p>
                          <p className="text-[11px] text-slate-500">Bấm hoặc kéo thả để đổi ảnh khác</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center py-2">
                        <ImageIcon size={24} className="mb-1" />
                        <span className="text-xs font-medium">Bấm để tải ảnh lên (hoặc bấm chọn nhanh ở trên)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. TÙY CHỌN THÔNG BÁO DISCORD KHI QUAY TRÚNG */}
                <div className="bg-[#0B1120] border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${adminWheelNotify ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        Thông Báo Discord Khi Trúng
                        {adminWheelNotify ? (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1">
                            🔔 Đang Bật
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-semibold flex items-center gap-1">
                            🔕 Đang Tắt
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tích chọn để Bot Discord tự động gửi thông báo khi người chơi quay dính món này. Bỏ tích sẽ không thông báo để tránh spam chat.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      name="notify_on_win"
                      checked={adminWheelNotify}
                      onChange={(e) => setAdminWheelNotify(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl mt-4 transition-all shadow-lg shadow-blue-600/30 text-sm flex items-center justify-center gap-2"
                >
                  <Gift size={18} /> Lưu Cài Đặt Phần Thưởng
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminScreen;
