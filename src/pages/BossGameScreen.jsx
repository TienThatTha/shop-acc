import React, { useState, useEffect, useRef } from 'react';
import {
  Lock, ShieldCheck, ArrowRight, CheckCircle2, Wallet, Search, X, Clock,
  Flame, Trash2, Copy, Check, AlertCircle, RefreshCw, Sparkles, Eye,
  Loader2, Swords, Crown, Zap, Package, Link, BarChart2
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getHatImage } from '../hatAsset';
import masterItemsConfig from '../master_items.json';
import { toShopCdnUrl } from '../utils/cdnAsset';
import { DISCORD_INVITE_URL, DiscordIcon } from '../components/DiscordIcon';

const BOSS_GAME_PACKAGES = [
  {
    id: 'pack_1',
    name: 'Gói 1: Tân Thủ Khởi Đầu',
    price: 20000,
    badge: 'Tân Thủ',
    badgeColor: 'from-emerald-500 to-teal-500',
    coins: 200,
    royalChests: 2,
    bossChests: 200,
    attacks: 200000,
    extraDesc: '200 Xu + 2 Rương Hoàng Kim + 200 Rương Boss + 200.000 Lượt Đánh',
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
    bossChests: 500,
    attacks: 500000,
    extraDesc: '500 Xu + 5 Rương Hoàng Kim + 500 Rương Boss + 500.000 Lượt Đánh',
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
    bossChests: 1000,
    attacks: 1000000,
    extraDesc: '1.000 Xu + 10 Rương Hoàng Kim + 1.000 Rương Boss + 1.000.000 Lượt Đánh',
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
    bossChests: 2000,
    attacks: 2000000,
    extraDesc: '2.000 Xu + 20 Rương Hoàng Kim + 2.000 Rương Boss + 2.000.000 Lượt Đánh',
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
    bossChests: 6000,
    attacks: 6000000,
    extraDesc: '6.000 Xu Game VIP + 60 Rương Hoàng Kim + 6.000 Rương Boss + 6.000.000 Lượt Đánh (KM +20%)',
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
    bossChests: 13000,
    attacks: 13000000,
    extraDesc: '13.000 Xu Game VIP + 130 Rương Hoàng Kim + 13.000 Rương Boss + 13.000.000 Lượt Đánh (KM +30%)',
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
    bossChests: 20000,
    attacks: 20000000,
    extraDesc: '20.000 Xu + 200 Rương HK + 20.000 Rương Boss + 20.000.000 Lượt + 💥 1x Nhẫn Cổ Đại 5⭐',
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
    bossChests: 37500,
    attacks: 37500000,
    extraDesc: '37.500 Xu + 375 Rương HK + 37.500 Rương Boss + 37.500.000 Lượt + 🌌 1x Nhẫn Thượng Cổ 1⭐',
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

// Sự kiện 11.11: x2 tài nguyên gói nạp (chỉ HIỂN THỊ — server mới là nơi cộng thật). Không x2 nhẫn.
const EVENT_1111_START_MS = 1794330000000;
const EVENT_1111_END_MS = 1794589200000;
const EVENT_1111_MULT = 2;

const BossGameScreen = ({
  renderNavbar, renderFooter, currentUser, requireAuth, showToast, setCurrentView, setHistoryTab,
  bossTargetId, bossPlayerSummary, setBossPlayerSummary, showBossProfileModal, setShowBossProfileModal,
  showBossStatModal, setShowBossStatModal, selectedBossPackage, setSelectedBossPackage,
  isBuyingBossPackage, executeBuyBossPackage, bossSuccessModal, setBossSuccessModal,
  showLinkOtpModal, setShowLinkOtpModal, linkOtpCode, linkOtpCountdown, isGeneratingOtp,
  linkOtpTarget, isDiscordLinked, isTikTokLinked, handleGenerateLinkOtp, handleCheckBossPlayer,
  showBagModal, setShowBagModal, activeBagCategory, setActiveBagCategory,
  bagVisibleCount, setBagVisibleCount, isPerformingBagAction, setIsPerformingBagAction,
  bagActionLoadingItem, setBagActionLoadingItem, showAuctionModal, setShowAuctionModal,
  auctionMarketData, fetchAuctionMarketData, auctionActiveTab, setAuctionActiveTab,
  auctionCategoryFilter, setAuctionCategoryFilter, auctionSearchTerm, setAuctionSearchTerm,
  showListItemModal, setShowListItemModal, selectedItemToList, setSelectedItemToList,
  listingPrice, setListingPrice, listingSellQuantity, setListingSellQuantity,
  listingPassword, setListingPassword, buyingLockedListing, setBuyingLockedListing,
  buyPasscodePrompt, setBuyPasscodePrompt, showForgeModal, setShowForgeModal,
  selectedForgeItemA, setSelectedForgeItemA, selectedForgeItemB, setSelectedForgeItemB,
  showForgeSelectModal, setShowForgeSelectModal, forgeFilterCategory, setForgeFilterCategory,
  forgeFilterLocation, setForgeFilterLocation, forgeSearchQuery, setForgeSearchQuery,
  isHammerStriking, setIsHammerStriking, isPerformingForgeAction, setIsPerformingForgeAction,
  forgeSuccessModal, setForgeSuccessModal
}) => {
  const [event1111Now, setEvent1111Now] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setEvent1111Now(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- STATE ITEM HOVER / INSPECT TOOLTIP ---
  const [activeItemTooltip, setActiveItemTooltip] = useState(null);
  const hideTooltipTimerRef = useRef(null);

  // --- HÀM THỰC HIỆN HÀNH ĐỘNG TRÊN TÚI ĐỒ (TRANG BỊ / XÓA ĐỒ / DỌN RÁC) ---
  const handleExecuteBagAction = async (actionType, item = null, itemIndex = null) => {
    if (!currentUser) return requireAuth('login');
    if (!bossPlayerSummary) {
      showToast("Vui lòng liên kết tài khoản trước khi quản lý túi đồ!", "error");
      return;
    }
    if (isPerformingBagAction) return;

    if (actionType === 'delete' && item) {
      const itemPlus = parseInt(item.plus || 0);
      const itemStars = parseInt(item.stars || 1);
      const itemSkill = parseInt(item.skill_level || 0);
      const isRing = item.category === 'ring' || (item.name && item.name.toLowerCase().includes('nhẫn'));
      const isEnhanced = itemPlus > 0 || (isRing && (itemStars > 1 || itemSkill > 0));
      if (isEnhanced) {
        showToast(`Trang bị [${item.name}] đã được cường hóa${itemPlus > 0 ? ` (+${itemPlus})` : ''}, không thể phân giải hay xóa!`, "error");
        return;
      }
      if (!window.confirm(`Bạn có chắc muốn xóa/phân giải món [${item.name}] không? Bạn sẽ nhận lại lượt đánh boss tương ứng.`)) {
        return;
      }
    }
    if (actionType === 'dismantle_all') {
      if (!window.confirm("Bạn có chắc muốn Dọn Sạch Đồ Rác không? Hệ thống sẽ bảo vệ toàn bộ đồ đã cường hóa, đồ đang mặc, đồ cùng loại để up sao và đồ phẩm cao, chỉ phân giải đồ rác để nhận lượt đánh.")) {
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
        web_user: currentUser.id,
        package_id: `game_action_${actionType}`,
        package_name: actionType === 'equip' ? `Trang bị ${item?.name || ''}` : (actionType === 'unequip' ? `Tháo ${item?.name || itemIndex || ''}` : (actionType === 'delete' ? `Xóa ${item?.name || ''}` : 'Dọn sạch đồ rác')),
        price: 0,
        rewards: {
          action: actionType,
          item_index: (typeof itemIndex === 'number' && itemIndex >= 0) ? itemIndex : (item?._rawIndex ?? null),
          item_name: item?.name,
          item_id: item?.id,
          item_tier: item?.tier,
          item_stars: item?.stars,
          item_plus: item?.plus,
          item_category: item?.category || getCategoryOfItem(item),
          slot: actionType === 'unequip' ? (itemIndex || item?.category || getCategoryOfItem(item)) : (item?.category || getCategoryOfItem(item)),
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

            const msg = checkAct.result?.message || (actionType === 'equip' ? 'Đã trang bị thành công!' : (actionType === 'unequip' ? 'Đã tháo trang bị cất về túi đồ!' : 'Đã thực thi thành công!'));
            if (checkAct.result && checkAct.result.success === false) {
              showToast(`⚠️ ${msg}`, "error");
            } else {
              showToast(`✨ ${msg}`, "success");
            }

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
        web_user: currentUser.id,
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

          if (checkAct && (checkAct.status === 'completed' || checkAct.status === 'error')) {
            clearInterval(pollAction);
            setIsPerformingBagAction(false);
            setBagActionLoadingItem(null);

            const isOk = checkAct.status === 'completed' && (checkAct.result?.success !== false);
            const msg = checkAct.result?.message || (isOk ? 'Giao dịch thành công!' : (checkAct.result?.error || 'Giao dịch không thành công!'));
            showToast(`🏛️ ${msg}`, isOk ? "success" : "error");

            await handleCheckBossPlayer(targetUid);
            await fetchAuctionMarketData();
            if (isOk) {
              setShowListItemModal(false);
            }
          } else if (attempts >= 15) {
            clearInterval(pollAction);
            setIsPerformingBagAction(false);
            setBagActionLoadingItem(null);
            showToast("Hệ thống đang xử lý, vui lòng tải lại trang để kiểm tra kết quả!", "info");
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

  // --- ÂM THANH TIẾNG ĐE & BÚA RÈN (WEB AUDIO API TỰ ĐỘNG CHUẨN XÁC) ---
  const playAnvilClankSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Tiếng chuông đe ngân vang kim loại
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1150, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(760, ctx.currentTime + 0.35);
      gain1.gain.setValueAtTime(0.4, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Tiếng búa thép nện uy lực xuống mặt đe
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(280, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.28);
      gain2.gain.setValueAtTime(0.65, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.38);

      // Tiếng xèo tia lửa điện nổ rực lửa
      const bufferSize = Math.floor(ctx.sampleRate * 0.16);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3400;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime);
    } catch (e) {
      console.warn("Audio clank error:", e);
    }
  };

  // --- HÀM TỔNG HỢP TOÀN BỘ TRANG BỊ CHO LÒ RÈN (ĐANG MẶC + TRONG TÚI ĐỒ) ---
  const getAllForgeSelectableItems = (mode = 'A') => {
    if (!bossPlayerSummary) return [];
    const items = [];
    const slotNamesVi = {
      weapon: 'Vũ Khí',
      armor: 'Áo Giáp',
      pants: 'Quần',
      shoes: 'Giày',
      necklace: 'Dây Chuyền',
      ring: 'Nhẫn',
      pet: 'Linh Thú'
    };

    // 1. Quét các món đang mặc
    ['weapon', 'armor', 'pants', 'shoes', 'necklace', 'ring', 'pet'].forEach(s => {
      const it = bossPlayerSummary[s];
      if (it && typeof it === 'object' && it.name) {
        items.push({
          ...it,
          _isEquipped: true,
          _sourceSlot: s,
          slot: s,
          _locationLabel: `Đang Mặc (${slotNamesVi[s] || s})`
        });
      }
    });

    // 2. Quét các món trong túi đồ
    const inv = Array.isArray(bossPlayerSummary.inventory)
      ? bossPlayerSummary.inventory
      : (Array.isArray(bossPlayerSummary.weapon?.inventory) ? bossPlayerSummary.weapon.inventory : []);

    inv.forEach((it, idx) => {
      if (it && typeof it === 'object' && it.name) {
        const cat = it.category || getCategoryOfItem(it);
        // Loại bỏ các vật phẩm không thể cường hóa như máu, phù, đá... trừ khi có sẵn cấp plus > 0
        if (!['potion', 'revive', 'material'].includes(cat) || Number(it.plus || 0) > 0) {
          items.push({
            ...it,
            _isEquipped: false,
            _rawIndex: idx,
            _sourceIndex: idx,
            _locationLabel: `Túi Đồ (Ô ${idx + 1})`
          });
        }
      }
    });

    if (mode === 'A') {
      // Slot A: Chỉ hiển thị những món CÓ CẤP CƯỜNG HÓA (+1 trở lên)
      return items.filter(it => Number(it.plus || 0) > 0);
    } else {
      // Slot B: Phải khác món A và có cấp cường hóa thấp hơn món A
      const plusA = Number(selectedForgeItemA?.plus || 0);
      return items.filter(it => {
        if (selectedForgeItemA) {
          if (selectedForgeItemA._isEquipped && it._isEquipped && selectedForgeItemA._sourceSlot === it._sourceSlot) return false;
          if (!selectedForgeItemA._isEquipped && !it._isEquipped && selectedForgeItemA._rawIndex === it._rawIndex) return false;
          if (selectedForgeItemA.id && it.id && selectedForgeItemA.id === it.id && selectedForgeItemA.name === it.name) return false;
        }
        const itPlus = Number(it.plus || 0);
        return selectedForgeItemA ? itPlus < plusA : true;
      });
    }
  };

  // --- HÀM THỰC THI CHUYỂN CẤP LÒ RÈN LONG TỘC ---
  const handleExecuteForgeTransfer = async () => {
    if (!currentUser) return requireAuth('login');
    if (!bossPlayerSummary) {
      showToast("Vui lòng liên kết tài khoản trước khi dùng Lò Rèn!", "error");
      return;
    }
    if (!selectedForgeItemA) {
      showToast("Vui lòng chọn Món Đồ Nguồn A (có Cường Hóa) trước!", "error");
      return;
    }
    if (!selectedForgeItemB) {
      showToast("Vui lòng chọn Món Đồ Đích B nhận cấp!", "error");
      return;
    }
    const plusA = Number(selectedForgeItemA.plus || 0);
    const plusB = Number(selectedForgeItemB.plus || 0);
    if (plusA <= 0) {
      showToast(`Món Đồ A [${selectedForgeItemA.name}] chưa có Cấp Cường Hóa (+1 trở lên) để chuyển!`, "error");
      return;
    }
    if (plusB >= plusA) {
      showToast(`Món Đồ B [${selectedForgeItemB.name}] đã có Cường Hóa (+${plusB}) cao hơn hoặc bằng Món A (+${plusA})!`, "error");
      return;
    }
    const currentCoins = Number(bossPlayerSummary.bonus_coins || 0);
    if (currentCoins < 100) {
      showToast(`Đại hiệp không đủ 100 Xu! (Hiện có: ${currentCoins.toLocaleString()} Xu). Cần tối thiểu 100 Xu.`, "error");
      return;
    }

    if (isPerformingForgeAction) return;

    // Kích hoạt hiệu ứng gõ búa 3D & âm thanh đe kenggg rực lửa
    setIsHammerStriking(true);
    playAnvilClankSound();
    setIsPerformingForgeAction(true);

    const actionId = `FORGE_ACT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const targetUid = bossPlayerSummary.user_id;

    try {
      const { error } = await supabase.from('game_orders').insert([{
        id: actionId,
        user_id: targetUid,
        nickname: bossPlayerSummary.nickname,
        web_user: currentUser.id,
        package_id: 'game_action_forge_transfer',
        package_name: `Chuyển cấp lò rèn [${selectedForgeItemA.name} +${plusA}] ➔ [${selectedForgeItemB.name}]`,
        price: 0,
        rewards: {
          action: 'forge_transfer',
          item_a: selectedForgeItemA,
          item_b: selectedForgeItemB,
          item_a_ref: selectedForgeItemA,
          item_b_ref: selectedForgeItemB,
          item_a_name: selectedForgeItemA.name,
          item_b_name: selectedForgeItemB.name,
          transfer_plus: plusA
        },
        status: 'pending'
      }]);

      if (error) throw error;

      showToast("🔥 Long Tộc Thợ Rèn đang vung búa rèn chuyển cấp...", "info");

      let attempts = 0;
      const pollAction = setInterval(async () => {
        attempts++;
        try {
          const { data: checkAct } = await supabase
            .from('game_orders')
            .select('*')
            .eq('id', actionId)
            .maybeSingle();

          if (checkAct && (checkAct.status === 'completed' || checkAct.status === 'error')) {
            clearInterval(pollAction);
            setIsPerformingForgeAction(false);
            setTimeout(() => setIsHammerStriking(false), 800);

            const isOk = checkAct.status === 'completed' && (checkAct.result?.success !== false);
            if (isOk) {
              playAnvilClankSound(); // Âm vang ăn mừng thắng lợi
              const resMsg = checkAct.result?.message || `Chuyển cấp thành công! [${selectedForgeItemB.name}] nhận +${plusA}!`;
              showToast(`🎉 ${resMsg}`, "success");

              // Mở modal chúc mừng chuyển cấp thành công
              setForgeSuccessModal({
                itemA: { ...selectedForgeItemA, oldPlus: plusA, newPlus: 0 },
                itemB: { ...selectedForgeItemB, oldPlus: plusB, newPlus: plusA },
                coinsSpent: 100
              });

              // Cập nhật state cục bộ ngay lập tức để không độ trễ
              setBossPlayerSummary(prev => {
                if (!prev) return prev;
                const updated = { ...prev };
                updated.bonus_coins = Math.max(0, Number(prev.bonus_coins || 0) - 100);

                if (selectedForgeItemA._isEquipped && selectedForgeItemA._sourceSlot) {
                  if (updated[selectedForgeItemA._sourceSlot]) {
                    updated[selectedForgeItemA._sourceSlot] = { ...updated[selectedForgeItemA._sourceSlot], plus: 0 };
                  }
                }
                if (selectedForgeItemB._isEquipped && selectedForgeItemB._sourceSlot) {
                  if (updated[selectedForgeItemB._sourceSlot]) {
                    updated[selectedForgeItemB._sourceSlot] = { ...updated[selectedForgeItemB._sourceSlot], plus: plusA };
                  }
                }

                if (Array.isArray(updated.inventory)) {
                  updated.inventory = updated.inventory.map((invItem, idx) => {
                    if (!invItem) return invItem;
                    if (!selectedForgeItemA._isEquipped && (selectedForgeItemA._rawIndex === idx || selectedForgeItemA.id === invItem.id)) {
                      return { ...invItem, plus: 0 };
                    }
                    if (!selectedForgeItemB._isEquipped && (selectedForgeItemB._rawIndex === idx || selectedForgeItemB.id === invItem.id)) {
                      return { ...invItem, plus: plusA };
                    }
                    return invItem;
                  });
                }
                return updated;
              });

              // Reset lựa chọn
              setSelectedForgeItemA(null);
              setSelectedForgeItemB(null);

              // Tải lại dữ liệu đầy đủ từ Supabase
              await handleCheckBossPlayer(targetUid);
            } else {
              const errMsg = checkAct.result?.error || checkAct.result?.message || 'Chuyển cấp thất bại, vui lòng kiểm tra lại!';
              showToast(`❌ ${errMsg}`, "error");
            }
          } else if (attempts >= 15) {
            clearInterval(pollAction);
            setIsPerformingForgeAction(false);
            setIsHammerStriking(false);
            showToast("Đang đồng bộ dữ liệu lò rèn, vui lòng tải lại trang!", "info");
            await handleCheckBossPlayer(targetUid);
          }
        } catch (e) {
          console.error("Lỗi poll forge transfer:", e);
        }
      }, 1500);

    } catch (err) {
      console.error("Lỗi gửi yêu cầu chuyển cấp:", err);
      showToast("Có lỗi xảy ra khi thực hiện chuyển cấp, vui lòng thử lại!", "error");
      setIsPerformingForgeAction(false);
      setIsHammerStriking(false);
    }
  };

  // --- RENDER MODAL XƯỞNG RÈN LONG TỘC (CHUYỂN CẤP CƯỜNG HÓA) ---
  const renderDragonForgeModal = () => {
    if (!showForgeModal) return null;
    const isLinked = Boolean(bossPlayerSummary);
    const currentCoins = Number(bossPlayerSummary?.bonus_coins || 0);
    const hasEnoughCoins = isLinked && currentCoins >= 100;
    const plusA = Number(selectedForgeItemA?.plus || 0);
    const plusB = Number(selectedForgeItemB?.plus || 0);

    return (
      <div
        className="fixed inset-0 z-[105] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) setShowForgeModal(false); }}
      >
        <div className="bg-gradient-to-br from-[#0c1322] via-[#121c2f] to-[#080d18] border-2 border-amber-500/80 rounded-3xl w-full max-w-5xl shadow-[0_0_80px_rgba(245,158,11,0.45)] p-4 sm:p-6 md:p-7 relative overflow-hidden my-auto text-white animate-zoom-in">
          {/* Hiệu ứng hào quang rực lửa nền */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Đốm tàn tro bay lơ lửng */}
          <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] pointer-events-none animate-ember-1"></div>
          <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-orange-400 blur-[0.5px] pointer-events-none animate-ember-2"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-yellow-300 blur-[0.5px] pointer-events-none animate-ember-3"></div>

          {/* HEADER MODAL */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.45)]">
                <Flame size={22} className="animate-pulse text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 tracking-wide flex items-center gap-2">
                  <span>🔥 XƯỞNG RÈN LONG TỘC</span>
                  <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
                    TỶ LỆ 100% THÀNH CÔNG
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Chuyển toàn bộ cấp Cường Hóa từ Món Nguồn [A] sang Món Đích [B]
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowForgeModal(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Đóng Lò Rèn"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* NỘI DUNG 2 CỘT MODAL: TRÁI (3D ANIMATED NPC) + PHẢI (BÀN RÈN 2 ĐE & NÚT GÕ BÚA) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* CỘT TRÁI (COL-5): 3D DRAGON BLACKSMITH NPC STAGE */}
            <div className="lg:col-span-5 flex flex-col bg-gradient-to-b from-[#090e1b] via-[#101726] to-[#070b14] border border-amber-500/40 rounded-2xl p-2.5 sm:p-3 shadow-inner relative overflow-hidden">
              {/* SÂN KHẤU 3D NHÂN VẬT THẬT (CỬ ĐỘNG THỞ, TỎA NHIỆT, VUNG BÚA) */}
              <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[460px] rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.3)] bg-[#04060c] flex items-center justify-center group">
                {/* Lớp phủ điện ảnh trên dưới */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none"></div>

                {/* Hạt lửa tàn tro bay lơ lửng trong sân khấu */}
                <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] pointer-events-none animate-ember-1 z-10"></div>
                <div className="absolute top-2/3 right-1/3 w-2 h-2 rounded-full bg-orange-400 blur-[0.5px] pointer-events-none animate-ember-2 z-10"></div>

                {/* Video hỗ trợ phát loop realtime nếu có file video, tự fallback sang ảnh cinematic */}
                <video
                  src="/dragon_blacksmith.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-300 select-none ${
                    isHammerStriking ? 'animate-npc-3d-strike' : 'animate-npc-3d-idle'
                  }`}
                  onError={(e) => {
                    // Nếu chưa có file video mp4, ẩn video và hiển thị ảnh tĩnh
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Hình nhân vật 3D cử động idle breathing hoặc strike */}
                <img
                  src="/dragon_blacksmith.jpg"
                  alt="Thần Búa Long Hỏa 3D"
                  className={`w-full h-full object-cover object-center transition-all duration-300 select-none ${
                    isHammerStriking ? 'animate-npc-3d-strike' : 'animate-npc-3d-idle'
                  }`}
                />

                {/* Sparks bay khi gõ búa */}
                {isHammerStriking && (
                  <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-anvil-sparks">
                    <div className="w-full h-full bg-gradient-to-r from-amber-500/50 via-yellow-300/60 to-orange-500/50 mix-blend-screen flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-black text-amber-200 drop-shadow-[0_0_25px_#f59e0b] tracking-widest animate-bounce">
                        ⚡ KENGGG! ⚡
                      </span>
                    </div>
                  </div>
                )}

                {/* Badge định danh đính đáy video */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 bg-slate-950/80 backdrop-blur-md border border-amber-400/40 rounded-xl px-3 py-1.5 flex items-center justify-between shadow-lg">
                  <div>
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Lò Luyện Thần Binh</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">LONG TỘC</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Đúc rèn &bull; Chuyển cấp bảo toàn món</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">100% SUCCESS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (COL-7): BÀN RÈN 2 CÁI ĐE & ĐIỀU KHIỂN CHUYỂN CẤP */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              {/* KHU VỰC BÀN RÈN: 2 CÁI ĐE VÀ MŨI TÊN TRUYỀN NĂNG LƯỢNG */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#070b14] via-[#0b1120] to-[#070b14] border border-amber-500/30 p-4 sm:p-5 overflow-hidden shadow-inner flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-11 gap-2.5 items-center">
                  {/* CỘT TRÁI (COL-5): ĐE NGUỒN (A) */}
                  <div className="col-span-5 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs font-black uppercase text-amber-400">Đe Nguồn (A)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                        Chuyển Đi
                      </span>
                    </div>

                    {!selectedForgeItemA ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLinked) {
                            showToast("Vui lòng liên kết tài khoản game qua mã OTP trước khi sử dụng Lò Rèn!", "info");
                            setShowForgeModal(false);
                            handleGenerateLinkOtp('all');
                            return;
                          }
                          setForgeFilterCategory('all');
                          setForgeFilterLocation('all');
                          setForgeSearchQuery('');
                          setShowForgeSelectModal('A');
                        }}
                        className="w-full h-36 sm:h-40 rounded-2xl border-2 border-dashed border-amber-400/60 bg-gradient-to-b from-amber-500/10 via-[#101726]/80 to-[#0c1220] hover:bg-amber-500/20 hover:border-amber-300 flex flex-col items-center justify-center gap-2 text-amber-300 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.2)] group cursor-pointer relative overflow-hidden"
                      >
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none bg-center bg-cover"
                          style={{ backgroundImage: `url('${toShopCdnUrl('/dragon_anvil.jpg')}')` }}
                        ></div>
                        <div className="w-11 h-11 rounded-full bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300 text-2xl font-black group-hover:scale-110 group-hover:bg-amber-500/40 transition-all shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                          +
                        </div>
                        <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide">Đặt Đồ Nguồn A</span>
                        <span className="text-[10px] text-amber-400/80 font-medium">Cường Hóa &ge; +1</span>
                      </button>
                    ) : (
                      <div className="w-full h-36 sm:h-40 rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-950/30 via-[#101726] to-[#0c1220] p-3 flex flex-col justify-between shadow-[0_0_25px_rgba(245,158,11,0.35)] relative group">
                        <button
                          type="button"
                          onClick={() => setSelectedForgeItemA(null)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs z-10 cursor-pointer"
                          title="Gỡ món A"
                        >
                          ✕
                        </button>

                        <div className="flex items-center gap-2.5">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2" style={{ borderColor: getBossTierStyle(selectedForgeItemA.tier).color }}>
                            <img
                              src={getBossItemAsset(selectedForgeItemA, getCategoryOfItem(selectedForgeItemA))}
                              alt={selectedForgeItemA.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 right-0 bg-amber-500 text-black font-black text-[10px] px-1.5 rounded-bl">
                              +{selectedForgeItemA.plus}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 pr-4">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate" title={selectedForgeItemA.name}>
                              {selectedForgeItemA.name}
                            </h4>
                            <div className="text-[11px] text-amber-400 font-bold tracking-widest">
                              {'★'.repeat(Math.max(1, Math.min(5, Number(selectedForgeItemA.stars || 1))))}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {selectedForgeItemA._locationLabel}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-black text-rose-400">
                            Sau chuyển: <strong className="text-white">+0</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setForgeFilterCategory('all');
                              setForgeFilterLocation('all');
                              setForgeSearchQuery('');
                              setShowForgeSelectModal('A');
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold transition-colors cursor-pointer"
                          >
                            Đổi Món
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CỘT GIỮA (COL-1): MŨI TÊN TRUYỀN NĂNG LƯỢNG */}
                  <div className="col-span-1 flex flex-col items-center justify-center gap-1.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse">
                      <ArrowRight size={18} className="text-amber-400 animate-transfer-beam" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-tighter text-center leading-none">
                      {selectedForgeItemA ? `+${plusA}` : '100%'}
                    </span>
                  </div>

                  {/* CỘT PHẢI (COL-5): ĐE ĐÍCH (B) */}
                  <div className="col-span-5 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs font-black uppercase text-cyan-400">Đe Đích (B)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">
                        Nhận Cấp
                      </span>
                    </div>

                    {!selectedForgeItemB ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLinked) {
                            showToast("Vui lòng liên kết tài khoản game qua mã OTP trước khi sử dụng Lò Rèn!", "info");
                            setShowForgeModal(false);
                            handleGenerateLinkOtp('all');
                            return;
                          }
                          if (!selectedForgeItemA) {
                            showToast("Mẹo: Hãy chọn Món Đồ Nguồn A trước để lọc danh sách món B chính xác!", "info");
                          }
                          setForgeFilterCategory('all');
                          setForgeFilterLocation('all');
                          setForgeSearchQuery('');
                          setShowForgeSelectModal('B');
                        }}
                        className="w-full h-36 sm:h-40 rounded-2xl border-2 border-dashed border-cyan-400/60 bg-gradient-to-b from-cyan-500/10 via-[#101726]/80 to-[#0c1220] hover:bg-cyan-500/20 hover:border-cyan-300 flex flex-col items-center justify-center gap-2 text-cyan-300 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.2)] group cursor-pointer relative overflow-hidden"
                      >
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none bg-center bg-cover"
                          style={{ backgroundImage: `url('${toShopCdnUrl('/dragon_anvil.jpg')}')` }}
                        ></div>
                        <div className="w-11 h-11 rounded-full bg-cyan-500/25 border border-cyan-400/50 flex items-center justify-center text-cyan-300 text-2xl font-black group-hover:scale-110 group-hover:bg-cyan-500/40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                          +
                        </div>
                        <span className="text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-wide">Đặt Đồ Đích B</span>
                        <span className="text-[10px] text-cyan-400/80 font-medium">
                          {selectedForgeItemA ? `Cường Hóa < +${plusA}` : 'Nhận Cấp'}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full h-36 sm:h-40 rounded-2xl border-2 border-cyan-500/80 bg-gradient-to-b from-cyan-950/30 via-[#101726] to-[#0c1220] p-3 flex flex-col justify-between shadow-[0_0_25px_rgba(6,182,212,0.35)] relative group">
                        <button
                          type="button"
                          onClick={() => setSelectedForgeItemB(null)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs z-10 cursor-pointer"
                          title="Gỡ món B"
                        >
                          ✕
                        </button>

                        <div className="flex items-center gap-2.5">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2" style={{ borderColor: getBossTierStyle(selectedForgeItemB.tier).color }}>
                            <img
                              src={getBossItemAsset(selectedForgeItemB, getCategoryOfItem(selectedForgeItemB))}
                              alt={selectedForgeItemB.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 right-0 bg-cyan-500 text-black font-black text-[10px] px-1.5 rounded-bl">
                              +{plusB}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 pr-4">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate" title={selectedForgeItemB.name}>
                              {selectedForgeItemB.name}
                            </h4>
                            <div className="text-[11px] text-cyan-400 font-bold tracking-widest">
                              {'★'.repeat(Math.max(1, Math.min(5, Number(selectedForgeItemB.stars || 1))))}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {selectedForgeItemB._locationLabel}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-black text-emerald-400">
                            Đột phá: <strong className="text-amber-300 font-extrabold animate-pulse">+{plusA || '?'}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setForgeFilterCategory('all');
                              setForgeFilterLocation('all');
                              setForgeSearchQuery('');
                              setShowForgeSelectModal('B');
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold transition-colors cursor-pointer"
                          >
                            Đổi Món
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER ĐIỀU KHIỂN: CHI PHÍ & NÚT GÕ BÚA */}
              <div className="bg-[#080d19]/90 border border-slate-800 rounded-2xl p-4 shadow">
                <div className="flex items-center justify-between gap-2 text-xs mb-3">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-yellow-400">🪙 Phí Chuyển Cấp:</span>
                    <span className="px-2.5 py-0.8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-black">
                      100 Xu
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Số dư ví: <strong className={!isLinked ? 'text-amber-300 font-bold' : hasEnoughCoins ? 'text-emerald-400 font-black' : 'text-rose-400 font-bold'}>
                      {!isLinked ? 'Chưa liên kết' : `${currentCoins.toLocaleString()} Xu`}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={!isLinked ? () => { setShowForgeModal(false); handleGenerateLinkOtp('all'); } : handleExecuteForgeTransfer}
                  disabled={isLinked && (!selectedForgeItemA || !selectedForgeItemB || isPerformingForgeAction || !hasEnoughCoins)}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                    !isLinked
                      ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white border border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:scale-[1.02] active:scale-[0.98]'
                      : !selectedForgeItemA || !selectedForgeItemB || !hasEnoughCoins
                      ? 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white border border-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {!isLinked ? (
                    <>
                      <Link size={16} />
                      <span>LIÊN KẾT TÀI KHOẢN ĐỂ DÙNG LÒ RÈN (OTP)</span>
                    </>
                  ) : isPerformingForgeAction ? (
                    <>
                      <Sparkles size={16} className="animate-spin text-amber-300" />
                      <span>Đang Gõ Búa Chuyển Cấp...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🔨</span>
                      <span>GÕ BÚA CHUYỂN CẤP (TIÊU HAO 100 XU)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center mt-2.5 leading-relaxed">
                  * Món B nhận toàn bộ cấp Cường Hóa của Món A. Món A sau khi chuyển trở về +0 (không bị mất trang bị).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cấu hình Bậc Rank PvP và Giao diện
  const PVP_RANKS_CONFIG = [
    { tier_name: "Đồng", color: "#cd7f32", icon: "🥉", sub_tiers: ["V", "IV", "III", "II", "I"] },
    { tier_name: "Bạc", color: "#cbd5e1", icon: "🥈", sub_tiers: ["V", "IV", "III", "II", "I"] },
    { tier_name: "Vàng", color: "#ffd700", icon: "🥇", sub_tiers: ["V", "IV", "III", "II", "I"] },
    { tier_name: "Kim Cương", color: "#38bdf8", icon: "💎", sub_tiers: ["V", "IV", "III", "II", "I"] },
    { tier_name: "Cao Thủ", color: "#a855f7", icon: "🔮", sub_tiers: ["V", "IV", "III", "II", "I"] },
    { tier_name: "Đại Cao Thủ", color: "#f43f5e", icon: "🔥", sub_tiers: ["V", "IV", "III", "II", "I"] }
  ];

  const calculatePvpRank = (points) => {
    const pts = Math.max(0, Number(points !== undefined && points !== null ? points : 500));
    let curBase = 500;
    const ranks = [];
    for (const t of PVP_RANKS_CONFIG) {
      for (const sub of t.sub_tiers) {
        ranks.push({
          tier_name: t.tier_name,
          sub_tier: sub,
          full_name: `${t.tier_name} ${sub}`,
          base: curBase,
          color: t.color,
          icon: t.icon
        });
        curBase += 1000;
      }
    }
    const vodichRank = {
      tier_name: "Vô Địch",
      sub_tier: "",
      full_name: "Vô Địch",
      base: curBase,
      color: "#ff0055",
      icon: "👑"
    };

    if (pts >= vodichRank.base) {
      return {
        tier_name: vodichRank.tier_name,
        tier: vodichRank.tier_name,
        name: vodichRank.full_name,
        sub_tier: "",
        full_name: vodichRank.full_name,
        badge_color: vodichRank.color,
        icon: vodichRank.icon,
        points: pts,
        next_rank_points: null,
        points_in_tier: pts - vodichRank.base,
        tier_span: 1000,
        pct: 100
      };
    }

    if (pts < ranks[0].base) {
      const first = ranks[0];
      const span = first.base;
      return {
        tier_name: first.tier_name,
        tier: first.tier_name,
        name: first.full_name,
        sub_tier: first.sub_tier,
        full_name: first.full_name,
        badge_color: first.color,
        icon: first.icon,
        points: pts,
        next_rank_points: ranks[1].base,
        points_in_tier: pts,
        tier_span: span,
        pct: Math.min(100, Math.max(0, (pts / span) * 100))
      };
    }

    let currentRank = ranks[0];
    let nextThreshold = ranks[1].base;
    for (let i = 0; i < ranks.length; i++) {
      if (pts >= ranks[i].base) {
        currentRank = ranks[i];
        nextThreshold = (i + 1 < ranks.length) ? ranks[i + 1].base : vodichRank.base;
      } else {
        break;
      }
    }

    const rankBase = currentRank.base;
    const ptsInRank = pts - rankBase;
    const tierSpan = Math.max(1, nextThreshold - rankBase);
    const pct = Math.min(100, Math.max(0, (ptsInRank / tierSpan) * 100));

    return {
      tier_name: currentRank.tier_name,
      tier: currentRank.tier_name,
      name: currentRank.full_name,
      sub_tier: currentRank.sub_tier,
      full_name: currentRank.full_name,
      badge_color: currentRank.color,
      icon: currentRank.icon,
      points: pts,
      next_rank_points: nextThreshold,
      points_in_tier: ptsInRank,
      tier_span: tierSpan,
      pct: pct
    };
  };

  const getPvpRankTheme = (pvpInfo) => {
    const tier = (pvpInfo && (pvpInfo.tier_name || pvpInfo.tier)) || "Đồng";
    const rankImgMap = {
      "Đồng": "rank_dong.png",
      "Bạc": "rank_bac.png",
      "Vàng": "rank_vang.png",
      "Kim Cương": "rank_kimcuong.png",
      "Cao Thủ": "rank_caothu.png",
      "Đại Cao Thủ": "rank_daicaothu.png",
      "Vô Địch": "rank_vodich.png"
    };

    const themes = {
      "Đồng": {
        card_bg: "radial-gradient(circle at 25% 50%, rgba(205, 127, 50, 0.28) 0%, rgba(18, 12, 10, 0.95) 70%)",
        border: "1.8px solid #cd7f32",
        box_shadow: "0 0 18px rgba(205, 127, 50, 0.5), inset 0 0 14px rgba(205, 127, 50, 0.25)",
        emblem_filter: "drop-shadow(0 0 10px rgba(205, 127, 50, 0.9)) drop-shadow(0 0 16px rgba(0, 0, 0, 0.95))",
        title_style: "color: #ffffff; text-shadow: 0 2px 4px #000, 0 0 10px #f59e0b, 0 0 20px #b45309;",
        rank_title: (pvpInfo && pvpInfo.full_name) || "ĐỒNG",
        tag_label: "⚔️ RANK PVP",
        tag_style: "background: rgba(0, 0, 0, 0.65); border: 1.2px solid #cd7f32; color: #fbbf24;",
        bar_gradient: "linear-gradient(90deg, #b45309, #f59e0b)",
        bar_glow: "0 0 8px rgba(245, 158, 11, 0.8)"
      },
      "Bạc": {
        card_bg: "radial-gradient(circle at 25% 50%, rgba(203, 213, 225, 0.28) 0%, rgba(15, 20, 32, 0.95) 70%)",
        border: "1.8px solid #cbd5e1",
        box_shadow: "0 0 22px rgba(203, 213, 225, 0.5), inset 0 0 14px rgba(255, 255, 255, 0.2)",
        emblem_filter: "drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 20px rgba(56, 189, 248, 0.6))",
        title_style: "color: #ffffff; text-shadow: 0 2px 4px #000, 0 0 10px #cbd5e1, 0 0 20px #38bdf8;",
        rank_title: (pvpInfo && pvpInfo.full_name) || "BẠC",
        tag_label: "⚔️ RANK PVP",
        tag_style: "background: rgba(0, 0, 0, 0.65); border: 1.2px solid #cbd5e1; color: #f8fafc;",
        bar_gradient: "linear-gradient(90deg, #64748b, #cbd5e1)",
        bar_glow: "0 0 8px rgba(226, 232, 240, 0.8)"
      },
      "Vàng": {
        card_bg: "radial-gradient(circle at 25% 50%, rgba(255, 215, 0, 0.3) 0%, rgba(25, 18, 5, 0.95) 70%)",
        border: "1.8px solid #ffd700",
        box_shadow: "0 0 26px rgba(255, 215, 0, 0.6), inset 0 0 16px rgba(255, 215, 0, 0.3)",
        emblem_filter: "drop-shadow(0 0 12px #ffd700) drop-shadow(0 0 24px rgba(245, 158, 11, 0.7))",
        title_style: "color: #ffffff; text-shadow: 0 2px 4px #000, 0 0 10px #ffd700, 0 0 22px #d97706;",
        rank_title: (pvpInfo && pvpInfo.full_name) || "HOÀNG KIM",
        tag_label: "⚔️ RANK PVP",
        tag_style: "background: rgba(0, 0, 0, 0.65); border: 1.2px solid #ffd700; color: #ffd700;",
        bar_gradient: "linear-gradient(90deg, #d97706, #ffd700)",
        bar_glow: "0 0 8px rgba(255, 215, 0, 0.9)"
      },
      "Kim Cương": {
        card_bg: "radial-gradient(circle at 25% 50%, rgba(0, 229, 255, 0.3) 0%, rgba(8, 20, 42, 0.95) 70%)",
        border: "2px solid #00f0ff",
        box_shadow: "0 0 28px rgba(0, 240, 255, 0.75), inset 0 0 16px rgba(0, 229, 255, 0.35)",
        emblem_filter: "drop-shadow(0 0 14px #00f0ff) drop-shadow(0 0 26px rgba(56, 189, 248, 0.9))",
        title_style: "color: #ffffff; text-shadow: 0 2px 4px #000, 0 0 10px #00f0ff, 0 0 22px #0284c7;",
        rank_title: (pvpInfo && pvpInfo.full_name) || "KIM CƯƠNG",
        tag_label: "⚔️ RANK PVP",
        tag_style: "background: rgba(0, 0, 0, 0.65); border: 1.2px solid #00e5ff; color: #38bdf8;",
        bar_gradient: "linear-gradient(90deg, #0284c7, #00f0ff)",
        bar_glow: "0 0 8px rgba(0, 240, 255, 0.9)"
      },
      "Cao Thủ": {
        card_bg: "radial-gradient(circle at 25% 50%, rgba(168, 85, 247, 0.32) 0%, rgba(25, 8, 45, 0.95) 70%)",
        border: "2px solid #c084fc",
        box_shadow: "0 0 30px rgba(168, 85, 247, 0.8), inset 0 0 18px rgba(192, 132, 252, 0.4)",
        emblem_filter: "drop-shadow(0 0 14px #c084fc) drop-shadow(0 0 30px rgba(168, 85, 247, 0.95))",
        title_style: "color: #ffffff; text-shadow: 0 2px 4px #000, 0 0 12px #c084fc, 0 0 24px #9333ea;",
        rank_title: (pvpInfo && pvpInfo.full_name) || "CAO THỦ",
        tag_label: "⚔️ RANK PVP",
        tag_style: "background: rgba(0, 0, 0, 0.65); border: 1.2px solid #c084fc; color: #e879f9;",
        bar_gradient: "linear-gradient(90deg, #9333ea, #e879f9)",
        bar_glow: "0 0 8px rgba(232, 121, 249, 0.9)"
      },
      "Đại Cao Thủ": {
        card_bg: "radial-gradient(circle at 25% 50%, rgba(244, 63, 94, 0.35) 0%, rgba(35, 8, 16, 0.95) 70%)",
        border: "2px solid #ff0055",
        box_shadow: "0 0 34px rgba(255, 0, 85, 0.85), inset 0 0 20px rgba(244, 63, 94, 0.45)",
        emblem_filter: "drop-shadow(0 0 14px #ff0055) drop-shadow(0 0 32px rgba(239, 68, 68, 0.95))",
        title_style: "color: #ffffff; text-shadow: 0 2px 4px #000, 0 0 12px #ff0055, 0 0 24px #dc2626;",
        rank_title: (pvpInfo && pvpInfo.full_name) || "ĐẠI CAO THỦ",
        tag_label: "⚔️ RANK PVP",
        tag_style: "background: rgba(0, 0, 0, 0.65); border: 1.2px solid #ff0055; color: #ff6b8b;",
        bar_gradient: "linear-gradient(90deg, #dc2626, #ff0055)",
        bar_glow: "0 0 8px rgba(255, 0, 85, 0.9)"
      },
      "Vô Địch": {
        card_bg: "radial-gradient(circle at 25% 50%, rgba(255, 0, 85, 0.38) 0%, rgba(28, 8, 35, 0.96) 70%)",
        border: "2.2px solid #ffd700",
        box_shadow: "0 0 38px rgba(255, 0, 85, 0.9), 0 0 22px rgba(255, 215, 0, 0.8), inset 0 0 22px rgba(255, 215, 0, 0.4)",
        emblem_filter: "drop-shadow(0 0 16px #ffd700) drop-shadow(0 0 32px #ff0055)",
        title_style: "color: #ffffff; text-shadow: 0 2px 4px #000, 0 0 12px #ffd700, 0 0 24px #ff0055;",
        rank_title: "VÔ ĐỊCH",
        tag_label: "👑 ĐỈNH PHONG",
        tag_style: "background: rgba(0, 0, 0, 0.7); border: 1.2px solid #ffd700; color: #ffd700; font-weight: 900;",
        bar_gradient: "linear-gradient(90deg, #ff0055, #ffd700, #00f0ff)",
        bar_glow: "0 0 10px rgba(255, 215, 0, 0.9)"
      }
    };

    const theme = (themes[tier] || themes["Đồng"]);
    return {
      ...theme,
      img_file: rankImgMap[tier] || "rank_dong.png",
      pct: (pvpInfo && pvpInfo.pct !== undefined) ? pvpInfo.pct : 100
    };
  };

  const renderPvpRankHeaderBadge = (playerObj) => {
    if (!playerObj) return null;
    const pvpPts = Number(playerObj.pvp_points !== undefined ? playerObj.pvp_points : 500);
    const pvpInfo = calculatePvpRank(pvpPts);
    const rankThm = getPvpRankTheme(pvpInfo);
    return (
      <div
        className="flex items-center gap-2 sm:gap-2.5 rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 shrink-0 backdrop-blur-md relative overflow-hidden"
        style={{
          background: rankThm.card_bg,
          border: rankThm.border,
          boxShadow: rankThm.box_shadow
        }}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <img
            src={`/${rankThm.img_file}`}
            alt={pvpInfo.full_name}
            className="w-8 h-6 sm:w-10 sm:h-8 object-contain shrink-0"
            style={{ filter: rankThm.emblem_filter }}
          />
        </div>
        <div className="flex flex-col justify-center gap-0.5 text-right min-w-[70px] sm:min-w-[85px]">
          <div className="flex items-center justify-end">
            <span
              className="text-[7.5px] sm:text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase leading-none whitespace-nowrap"
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
                border: rankThm.border,
                color: '#fbbf24'
              }}
            >
              {rankThm.tag_label || '⚔️ RANK PVP'}
            </span>
          </div>
          <div
            className="text-xs sm:text-[13px] font-black tracking-wide uppercase whitespace-nowrap leading-tight"
            style={{
              color: '#ffffff',
              textShadow: '0 1px 3px #000, 0 0 10px rgba(245, 158, 11, 0.8)'
            }}
          >
            {rankThm.rank_title || pvpInfo.full_name}
          </div>
          <div className="flex items-center justify-end gap-1 whitespace-nowrap">
            <span className="text-[11px] sm:text-xs font-black text-white drop-shadow">
              {pvpPts.toLocaleString()}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-300">Điểm</span>
            {pvpInfo.next_rank_points ? (
              <div
                className="w-7 sm:w-9 h-1 sm:h-1.5 bg-black/65 rounded-full overflow-hidden border border-white/20 ml-0.5"
                title={`Tiến trình Rank: ${pvpInfo.pct.toFixed(0)}%`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, pvpInfo.pct))}%`,
                    background: rankThm.bar_gradient,
                    boxShadow: rankThm.bar_glow
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
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
    if (t.includes('huyền thoại') || t.includes('legendary') || t.includes('thần tốc')) return { color: '#ffd700', border: '#ffd700', bg: 'rgba(255, 215, 0, 0.2)', label: '🌈 HUYỀN THOẠI 🌈' };
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
    "quần thiết giáp": "/game-assets/pants_thuong.png",
    "quần lam ngọc": "/game-assets/pants_hiem.png",
    "quần thánh quang": "/game-assets/pants_epic.png",
    "quần kim cương": "/game-assets/pants_thanthoai.png",
    "quần vô cực tối thượng": "/game-assets/pants_toithuong.png",
    "quần cổ đại long vương": "/game-assets/pants_codai.png",
    "thần quần thượng cổ nữ oa": "/game-assets/pants_thuongco.png",
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
    "item_revive_amulet": "/game-assets/item_revive_amulet.png",

    // Bảo Vật Đôi Giày (Shoes)
    "giày thần tốc": "/game-assets/shoes_huyen_thoai.png",
    "giày huyền thoại": "/game-assets/shoes_huyen_thoai.png",
    "giày huyền thoại thần tốc": "/game-assets/shoes_huyen_thoai.png",
    "giày thần tốc (huyền thoại)": "/game-assets/shoes_huyen_thoai.png",
    "giày da": "/game-assets/shoes_thuong.png",
    "giày thường": "/game-assets/shoes_thuong.png"
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

    // 0. NGUYÊN TẮC DNA TỰ THÂN: Nếu item đã có trường image hợp lệ trong database -> DÙNG NGAY 100%!
    if (directImg && typeof directImg === 'string') {
      const cleanImg = directImg.split('/').pop().split('?')[0];
      if (cleanImg && !cleanImg.includes('none') && (cleanImg.endsWith('.png') || cleanImg.endsWith('.jpg'))) {
        return `/game-assets/${cleanImg}`;
      }
    }

    const rawName = (name || '').trim();
    // Bỏ qua cấp cường hóa như +1, +2, +15, sao và ngoặc đơn
    const n = rawName.replace(/[⭐★]/g, '').replace(/\s*\([^)]*\).*$/, '').replace(/\s*\[[^\]]*\].*$/, '').replace(/\s*\+\d+$/, '').trim().toLowerCase();
    
    // 1. Tra cứu trực tiếp từ Master Items Registry (Đồng bộ từ configs/game_items.json)
    if (masterItemsConfig && masterItemsConfig[n] && masterItemsConfig[n].image) {
      return `/game-assets/${masterItemsConfig[n].image}`;
    }

    // 2. Tra cứu từ điển tên chuẩn (Canonical SSOT)
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

    // Quần Chiến (Pants)
    if (category === 'pants' || n.includes('quần') || n.includes('quan') || n.includes('giáp chân') || n.includes('pants')) {
      if (n.includes('nữ oa') || n.includes('thượng cổ') || n.includes('vô cực')) return '/game-assets/pants_thuongco.png';
      if (n.includes('long vương') || n.includes('chaos') || n.includes('cổ đại')) return '/game-assets/pants_codai.png';
      if (n.includes('hắc ma') || n.includes('tối thượng')) return '/game-assets/pants_toithuong.png';
      if (n.includes('kim cương') || n.includes('hoàng kim') || n.includes('thần thoại')) return '/game-assets/pants_thanthoai.png';
      if (n.includes('thánh quang') || n.includes('tử tinh') || n.includes('epic')) return '/game-assets/pants_epic.png';
      if (n.includes('lam ngọc') || n.includes('hiếm')) return '/game-assets/pants_hiem.png';
      return '/game-assets/pants_thuong.png';
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

    // Nón (Hats)
    if (category === 'hat' || n.includes('nón') || n.includes('non') || n.includes('mũ') || n.includes('mu') || n.includes('hat')) {
      return getHatImage(directImg) || '/game-assets/hat_huyen_thoai.png';
    }

    // Giày (Shoes)
    const tierStr = String(itemOrName?.tier || '').toLowerCase();
    if (category === 'shoes' || n.includes('giày') || n.includes('giay') || n.includes('shoes') || n.includes('boot')) {
      if (
        tierStr.includes('huyền thoại') ||
        tierStr.includes('legendary') ||
        n.includes('huyền thoại') ||
        n.includes('legendary') ||
        n.includes('thần tốc') ||
        n.includes('thất sắc') ||
        n.includes('cầu vồng') ||
        n.includes('bảo vật') ||
        n.includes('tối thượng') ||
        n.includes('thượng cổ')
      ) {
        return '/game-assets/shoes_huyen_thoai.png';
      }
      return '/game-assets/shoes_thuong.png';
    }

    return '/game-assets/ring_crystal.png';
  };

  const getCategoryOfItem = (item) => {
    if (!item) return 'weapon';
    if (item.category) return item.category;
    if (item.type) {
      const t = String(item.type).toLowerCase();
      if (['material', 'ring', 'necklace', 'pants', 'armor', 'weapon', 'pet', 'shoes', 'hat'].includes(t)) {
        return t;
      }
    }
    const n = (item.name || '').toLowerCase();
    if (n.includes('huyết dược') || n.includes('bình máu') || n.includes('potion')) return 'potion';
    if (n.includes('phục sinh') || n.includes('hồi sinh') || n.includes('amulet') || n.includes('revive')) return 'revive';
    if (n.includes('tinh hoa') || n.includes('tinh thể') || n.includes('essence') || n.includes('crystal') || n.includes('đá')) return 'material';
    if (n.includes('quần') || n.includes('pants') || n.includes('giáp chân') || n.includes('giap chan')) return 'pants';
    if (n.includes('nhẫn') || n.includes('ring')) return 'ring';
    if (n.includes('dây chuyền') || n.includes('necklace')) return 'necklace';
    if (n.includes('giáp') || n.includes('armor')) return 'armor';
    if (n.includes('giày') || n.includes('giay') || n.includes('shoes')) return 'shoes';
    if (n.includes('nón') || n.includes('non') || n.includes('mũ') || n.includes('mu') || n.includes('hat')) return 'hat';
    if (n.includes('rồng') || n.includes('phượng') || n.includes('pet') || n.includes('thú')) return 'pet';
    return 'weapon';
  };

  // --- RENDER THUMBNAIL TRANG BỊ ĐỒNG BỘ 100% VỚI DISCORD PROFILE RENDERER ---
  const renderUniversalItemThumb = (item, category, options = {}) => {
    if (!item) return null;
    const cat = category || getCategoryOfItem(item);
    const isShoes = (cat === 'shoes') || String(item.category || '').toLowerCase() === 'shoes' || String(item.name || '').toLowerCase().includes('giày');
    const isHat = (cat === 'hat') || String(item.category || '').toLowerCase() === 'hat' || String(item.name || '').toLowerCase().includes('nón') || String(item.name || '').toLowerCase().includes('mũ');
    const isRing = (cat === 'ring') || String(item.category || '').toLowerCase() === 'ring' || String(item.name || '').toLowerCase().includes('nhẫn');
    const isPet = (cat === 'pet') || String(item.category || '').toLowerCase() === 'pet';
    const isWeapon = (cat === 'weapon') || String(item.category || '').toLowerCase() === 'weapon';
    const isMaterial = cat === 'material' || (typeof isEnhancementStone === 'function' && isEnhancementStone(null, item));

    const tierStr = String(item.tier || '').toLowerCase();
    const isHT = (isShoes || isHat) && (tierStr.includes('huyền thoại') || tierStr.includes('legendary') || String(item.name || '').toLowerCase().includes('thần tốc') || String(item.name || '').toLowerCase().includes('nón'));
    const isThuongCo = !isMaterial && (tierStr.includes('thượng cổ') || String(item.name || '').toLowerCase().includes('bá vương') || String(item.name || '').toLowerCase().includes('nữ oa') || String(item.name || '').toLowerCase().includes('bát hoang') || String(item.name || '').toLowerCase().includes('vô cực'));

    const sizeClass = options.sizeClass || 'w-14 h-14 sm:w-16 sm:h-16';
    const imgSizeClass = options.imgSizeClass || 'w-10 h-10 sm:w-12 sm:h-12';

    let boxBg = '#060913';
    let boxBorder = '2px solid #334155';
    let boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    let imgFilter = 'drop-shadow(0 0 4px rgba(255,255,255,0.3))';

    if (isThuongCo) {
      boxBg = 'radial-gradient(circle at 70% 30%, #ec4899 0%, #8b5cf6 40%, #3b82f6 70%, #1e1b4b 100%)';
      boxBorder = '2.5px solid #ffffff';
      boxShadow = '0 0 18px rgba(236, 72, 153, 0.7), 0 0 30px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.4)';
      imgFilter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.85))';
    } else if (isHT) {
      boxBg = 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.28) 0%, rgba(236, 72, 153, 0.35) 32%, rgba(99, 102, 241, 0.3) 65%, #060216 100%)';
      boxBorder = '2.5px solid #ffd700';
      boxShadow = '0 0 22px rgba(255, 215, 0, 0.85), 0 0 35px rgba(217, 70, 239, 0.65), inset 0 0 10px rgba(255, 215, 0, 0.35)';
      imgFilter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 16px rgba(236, 72, 153, 0.7))';
    } else if (tierStr.includes('cổ đại')) {
      boxBg = 'radial-gradient(circle at 70% 30%, #00ffaa 0%, #0d9488 45%, #134e4a 80%, #0f172a 100%)';
      boxBorder = '2.5px solid #00ffaa';
      boxShadow = '0 0 18px rgba(0, 255, 170, 0.8), inset 0 0 10px rgba(0, 255, 170, 0.35)';
      imgFilter = 'drop-shadow(0 0 8px #00ffaa)';
    } else if (tierStr.includes('tối thượng')) {
      boxBg = 'radial-gradient(circle at 70% 30%, #ff0055 0%, #be123c 45%, #881337 80%, #1a050d 100%)';
      boxBorder = '2.5px solid #ff0055';
      boxShadow = '0 0 18px rgba(255, 0, 85, 0.8), inset 0 0 10px rgba(255, 0, 85, 0.35)';
      imgFilter = 'drop-shadow(0 0 8px #ff0055)';
    } else if (tierStr.includes('thần thoại')) {
      boxBg = 'radial-gradient(circle at 70% 30%, #ffd700 0%, #d97706 45%, #78350f 80%, #1c0d02 100%)';
      boxBorder = '2.5px solid #ffd700';
      boxShadow = '0 0 18px rgba(255, 215, 0, 0.8), inset 0 0 10px rgba(255, 215, 0, 0.35)';
      imgFilter = 'drop-shadow(0 0 8px #ffd700)';
    } else if (tierStr.includes('epic') || tierStr.includes('sử thi')) {
      boxBg = 'radial-gradient(circle at 70% 30%, #a855f7 0%, #7e22ce 45%, #581c87 80%, #150524 100%)';
      boxBorder = '2.5px solid #a855f7';
      boxShadow = '0 0 16px rgba(168, 85, 247, 0.7)';
      imgFilter = 'drop-shadow(0 0 8px #a855f7)';
    } else if (tierStr.includes('hiếm') || tierStr.includes('rare')) {
      boxBg = 'radial-gradient(circle at 70% 30%, #38bdf8 0%, #0284c7 45%, #0369a1 80%, #041b2d 100%)';
      boxBorder = '2.5px solid #38bdf8';
      boxShadow = '0 0 16px rgba(56, 189, 248, 0.7)';
      imgFilter = 'drop-shadow(0 0 8px #38bdf8)';
    }

    // 1. CỘT SAO DỌC: TUYỆT ĐỐI KHÔNG HIỂN THỊ SAO NẾU LÀ GIÀY, NÓN HOẶC NGUYÊN LIỆU
    const starsCount = (!isShoes && !isHat && !isMaterial) ? Math.max(0, Number(item.stars != null ? item.stars : 1)) : 0;

    // 2. CHỮ BẬC Ở ĐÁY KHUNG: TUYỆT ĐỐI KHÔNG CÓ BẬC NẾU LÀ GIÀY, NÓN HOẶC NGUYÊN LIỆU
    const showBac = (!isShoes && !isHat && !isMaterial);
    const tierStep = Number(item.tier_step || 0);

    // 3. MÁC GÓC TRÊN BÊN PHẢI (Top-right badge)
    let badgeLabel = '';
    let badgeBg = '';
    let badgeGlow = '';

    if (isRing) {
      const rLvl = Number(item.skill_level || 0);
      if (rLvl > 0) {
        badgeLabel = `Lv.${rLvl}`;
        const isMax = (rLvl >= 9);
        badgeBg = isMax ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #00f2fe 100%)' : 'linear-gradient(135deg, #a855f7, #6366f1)';
        badgeGlow = '0 0 12px rgba(168,85,247,0.95), 0 0 6px rgba(0,242,254,0.9), 0 2px 4px rgba(0,0,0,0.8)';
      }
    } else if (isPet) {
      const pLvl = Number(item.level || 1);
      if (pLvl > 0) {
        badgeLabel = (pLvl >= 100) ? 'MAX' : `Lv.${pLvl}`;
        const isMax = (pLvl >= 100);
        badgeBg = isMax ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #f59e0b 100%)' : 'linear-gradient(135deg, #10b981, #059669)';
        badgeGlow = '0 0 12px rgba(16,185,129,0.95), 0 0 6px rgba(6,182,212,0.9), 0 2px 4px rgba(0,0,0,0.8)';
      }
    } else {
      const plusVal = Number(item.plus || 0);
      if (plusVal > 0) {
        badgeLabel = `+${plusVal}`;
        const isMax = (plusVal >= 20);
        if (isHT) {
          badgeBg = 'linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ec4899 100%)';
          badgeGlow = '0 0 12px rgba(255,215,0,0.95), 0 2px 4px rgba(0,0,0,0.8)';
        } else if (isMax) {
          badgeBg = 'linear-gradient(135deg, #ff007f 0%, #a855f7 50%, #00f2fe 100%)';
          badgeGlow = '0 0 12px rgba(255,0,127,0.95), 0 0 6px rgba(0,242,254,0.9), 0 2px 4px rgba(0,0,0,0.8)';
        } else {
          badgeBg = 'linear-gradient(135deg, #ffd700, #ff8c00)';
          badgeGlow = '0 0 10px rgba(255,215,0,0.9), 0 2px 4px rgba(0,0,0,0.8)';
        }
      }
    }

    // 4. MÁC KỸ NĂNG GÓC DƯỚI BÊN PHẢI (Bottom-right badge - Dành riêng cho Kỹ năng Miễn Nhiễm của Nón, giống mác Lv.9 của Nhẫn)
    let hatSkillBadgeLabel = '';
    let hatSkillBadgeBg = '';
    let hatSkillBadgeGlow = '';

    if (isHat) {
      let hSkillLvl = Number(item.skill_level || 0);
      if (!hSkillLvl && (isHT || Number(item.skill_proc_rate || 0) > 0)) {
        hSkillLvl = 1;
      }
      if (hSkillLvl > 0) {
        hatSkillBadgeLabel = `Lv.${hSkillLvl}`;
        const isMaxH = (hSkillLvl >= 9);
        hatSkillBadgeBg = isMaxH ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #00f2fe 100%)' : 'linear-gradient(135deg, #a855f7, #6366f1)';
        hatSkillBadgeGlow = '0 0 12px rgba(168,85,247,0.95), 0 0 6px rgba(0,242,254,0.9), 0 2px 4px rgba(0,0,0,0.8)';
      }
    }

    const imgUrl = getBossItemAsset(item, cat);
    const rotStyle = isWeapon ? { transform: 'rotate(15deg) scale(1.12)' } : {};
    const gradId = `goldGrad_web_${cat}_${Math.abs(String(item.name || '').split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)) % 10000}`;

    return (
      <div
        className={`${sizeClass} aspect-square rounded-xl flex items-center justify-center relative shrink-0 self-start shadow-inner select-none`}
        style={{
          background: boxBg,
          border: boxBorder,
          boxShadow: boxShadow
        }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.name}
            className={`${imgSizeClass} object-contain`}
            style={{ ...rotStyle, filter: imgFilter }}
          />
        ) : (
          <span className="text-2xl">{options.defaultIcon || '📦'}</span>
        )}

        {/* CỘT SAO DỌC THANH THOÁT - KHOẢNG CÁCH RÕ RÀNG, TẬN DỤNG KHÔNG GIAN DỌC */}
        {starsCount > 0 && (() => {
          const isLargeBox = sizeClass.includes('w-16') || sizeClass.includes('w-18') || sizeClass.includes('w-20') || sizeClass.includes('70px') || sizeClass.includes('72px');
          const isSmallBox = sizeClass.includes('w-10') || sizeClass.includes('w-12');

          // Kích thước ngôi sao & khoảng cách chuẩn: cách đều thoáng đãng, tận dụng tối đa chiều dọc khung
          const starSz = isLargeBox ? 8.6 : (isSmallBox ? 5.8 : 7.2);
          const starGap = isLargeBox ? 4.2 : (isSmallBox ? 2.4 : 3.4);
          const starTop = isLargeBox ? 3.2 : (isSmallBox ? 2.0 : 2.6);
          const starLeft = isLargeBox ? 3.5 : (isSmallBox ? 2.0 : 2.8);

          return (
            <div 
              className="absolute z-10 pointer-events-none flex flex-col"
              style={{ 
                top: `${starTop}px`, 
                left: `${starLeft}px`, 
                gap: `${starGap}px`,
                filter: 'drop-shadow(0 1.5px 2px rgba(0,0,0,0.95)) drop-shadow(0 0 3px rgba(250,204,21,0.6))' 
              }}
            >
              {Array.from({ length: starsCount }).map((_, sI) => (
                <svg 
                  key={sI} 
                  width={starSz} 
                  height={starSz} 
                  viewBox="0 0 24 24" 
                  className="shrink-0"
                >
                  <path 
                    fill="#fde047" 
                    stroke="#1a0800" 
                    strokeWidth="1.3" 
                    strokeLinejoin="round" 
                    d="M 12.00,1.50 L 15.20,7.80 L 22.20,8.80 L 17.10,13.75 L 18.30,20.70 L 12.00,17.40 L 5.70,20.70 L 6.90,13.75 L 1.80,8.80 L 8.80,7.80 Z"
                  />
                </svg>
              ))}
            </div>
          );
        })()}

        {/* CHỮ {tier_step} BẬC Ở ĐÁY KHUNG */}
        {showBac && (
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-15 whitespace-nowrap pointer-events-none"
            style={{ filter: 'drop-shadow(0 1.5px 2px rgba(0,0,0,0.95)) drop-shadow(0 0 3px rgba(245,158,11,0.85))' }}
          >
            <svg width="48" height="16" viewBox="0 0 48 16" className="overflow-visible">
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#fffbde" />
                  <stop offset="70%" stopColor="#ffd700" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <text
                x="24"
                y="12"
                textAnchor="middle"
                fontFamily="'Segoe UI', 'Arial Black', sans-serif"
                fontWeight="900"
                fontSize="11"
                fill={`url(#${gradId})`}
                stroke="#1a0800"
                strokeWidth="1.2"
                strokeLinejoin="round"
                paintOrder="stroke fill"
              >
                {tierStep} Bậc
              </text>
            </svg>
          </div>
        )}

        {/* MÁC GÓC TRÊN BÊN PHẢI (CƯỜNG HÓA HOẶC LEVEL NHẪN/PET) */}
        {badgeLabel && (
          <div
            className="absolute -top-1.5 -right-1.5 z-25 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-md leading-none border border-white whitespace-nowrap"
            style={{
              background: badgeBg,
              boxShadow: badgeGlow,
              letterSpacing: '0.2px',
              textShadow: '0 1px 2px #000'
            }}
          >
            {badgeLabel}
          </div>
        )}

        {/* MÁC KỸ NĂNG MIỄN NHIỄM GÓC DƯỚI BÊN PHẢI (CHO BẢO VẬT NÓN - GIỐNG MÁC NHẪN) */}
        {hatSkillBadgeLabel && (
          <div
            className="absolute -bottom-1.5 -right-1.5 z-25 text-white text-[9.5px] font-black px-1.5 py-0.5 rounded-md leading-none border border-white whitespace-nowrap pointer-events-none"
            style={{
              background: hatSkillBadgeBg,
              boxShadow: hatSkillBadgeGlow,
              letterSpacing: '0.2px',
              textShadow: '0 1px 2px #000'
            }}
          >
            {hatSkillBadgeLabel}
          </div>
        )}

        {/* VƯƠNG MIỆN CÁNH KIM RIÊNG CHO GIÀY & NÓN HUYỀN THOẠI */}
        {isHT && (
          <img
            src="/game-assets/frame_banana_wings_slim.png"
            className="absolute -top-1.5 -left-1 w-[calc(100%+8px)] h-[calc(100%+8px)] max-w-none pointer-events-none z-20 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.85)] drop-shadow-[0_0_15px_rgba(217,70,239,0.65)]"
            alt="Winged Frame"
          />
        )}
      </div>
    );
  };

  // --- BẢNG THÔNG SỐ CHUẨN CỦA VẬT PHẨM (ĐỒNG BỘ 100% VỚI CONFIGS/GAME_ITEMS.JSON) ---
  const getWeaponStats = (it) => {
    let baseDmg = (it?.base_dmg != null && Number(it.base_dmg) > 0) ? Number(it.base_dmg) : 0;
    if (baseDmg < 500) {
      const n = (it?.name || '').toLowerCase();
      const t = (it?.tier || '').toLowerCase();
      if (n.includes('bá vương') || t.includes('thượng cổ')) baseDmg = 150000;
      else if (n.includes('chaos') || t.includes('cổ đại')) baseDmg = 60000;
      else if (n.includes('ma vương') || t.includes('tối thượng')) baseDmg = 30000;
      else if (n.includes('thần đao') || t.includes('thần thoại')) baseDmg = 15000;
      else if (n.includes('song đao') || t.includes('epic')) baseDmg = 5000;
      else if (n.includes('trảm ma') || t.includes('hiếm')) baseDmg = 2000;
      else baseDmg = 500;
    }
    return { baseDmg };
  };

  const getArmorStats = (it) => {
    let baseHp = (it?.base_hp != null && Number(it.base_hp) > 0) ? Number(it.base_hp) : 0;
    let baseDef = (it?.base_def != null && Number(it.base_def) > 0) ? Number(it.base_def) : 0;
    if (!baseHp || !baseDef) {
      const n = (it?.name || '').toLowerCase();
      const t = (it?.tier || '').toLowerCase();
      if (n.includes('nữ oa') || t.includes('thượng cổ')) { baseHp = 450000; baseDef = 45000; }
      else if (n.includes('long vương') || t.includes('cổ đại')) { baseHp = 180000; baseDef = 18000; }
      else if (n.includes('vô cực') || t.includes('tối thượng')) { baseHp = 75000; baseDef = 7500; }
      else if (n.includes('kim cương') || t.includes('thần thoại')) { baseHp = 30000; baseDef = 3000; }
      else if (n.includes('thánh quang') || t.includes('epic')) { baseHp = 12000; baseDef = 1200; }
      else if (n.includes('giáp rồng') || t.includes('hiếm')) { baseHp = 4500; baseDef = 450; }
      else { baseHp = 1500; baseDef = 150; }
    }
    return { baseHp, baseDef };
  };

  const getPantsStats = (it) => {
    let baseHp = (it?.base_hp != null && Number(it.base_hp) > 0) ? Number(it.base_hp) : 0;
    let baseDef = (it?.base_def != null && Number(it.base_def) > 0) ? Number(it.base_def) : 0;
    let hpPercent = (it?.hp_percent != null && Number(it.hp_percent) > 0) ? Number(it.hp_percent) : 0;
    let defPercent = (it?.def_percent != null && Number(it.def_percent) > 0) ? Number(it.def_percent) : 0;

    const n = (it?.name || '').toLowerCase();
    const t = (it?.tier || '').toLowerCase();

    if (!baseHp || !baseDef) {
      if (n.includes('nữ oa') || t.includes('thượng cổ')) { baseHp = 240000; baseDef = 24000; }
      else if (n.includes('long vương') || t.includes('cổ đại')) { baseHp = 105000; baseDef = 10500; }
      else if (n.includes('vô cực') || t.includes('tối thượng')) { baseHp = 45000; baseDef = 4500; }
      else if (n.includes('kim cương') || t.includes('thần thoại')) { baseHp = 18000; baseDef = 1800; }
      else if (n.includes('thánh quang') || t.includes('epic')) { baseHp = 7500; baseDef = 750; }
      else if (n.includes('lam ngọc') || t.includes('hiếm')) { baseHp = 3000; baseDef = 300; }
      else { baseHp = 900; baseDef = 90; }
    }

    if (!hpPercent || !defPercent) {
      if (n.includes('nữ oa') || t.includes('thượng cổ')) { hpPercent = 900; defPercent = 900; }
      else if (n.includes('long vương') || t.includes('cổ đại')) { hpPercent = 450; defPercent = 450; }
      else if (n.includes('vô cực') || t.includes('tối thượng')) { hpPercent = 270; defPercent = 270; }
      else if (n.includes('kim cương') || t.includes('thần thoại')) { hpPercent = 150; defPercent = 150; }
      else if (n.includes('thánh quang') || t.includes('epic')) { hpPercent = 75; defPercent = 75; }
      else if (n.includes('lam ngọc') || t.includes('hiếm')) { hpPercent = 36; defPercent = 36; }
      else { hpPercent = 15; defPercent = 15; }
    }
    return { baseHp, baseDef, hpPercent, defPercent };
  };

  const getNecklaceStats = (it) => {
    let dmgPercent = (it?.dmg_percent != null && Number(it.dmg_percent) > 0) ? Number(it.dmg_percent) : 0;
    if (!dmgPercent) {
      const n = (it?.name || '').toLowerCase();
      const t = (it?.tier || '').toLowerCase();
      if (n.includes('vô cực') || t.includes('thượng cổ')) dmgPercent = 300;
      else if (n.includes('chaos') || t.includes('cổ đại')) dmgPercent = 150;
      else if (n.includes('hắc ma') || t.includes('tối thượng')) dmgPercent = 90;
      else if (n.includes('hoàng kim') || t.includes('thần thoại')) dmgPercent = 50;
      else if (n.includes('tử tinh') || t.includes('epic')) dmgPercent = 25;
      else if (n.includes('lam ngọc') || t.includes('hiếm')) dmgPercent = 12;
      else dmgPercent = 5;
    }
    return { dmgPercent };
  };

  const getRingStats = (it) => {
    let baseDmgPercent = (it?.base_dmg_percent != null && Number(it.base_dmg_percent) > 0) ? Number(it.base_dmg_percent) : 0;
    let baseHpPercent = (it?.base_hp_percent != null && Number(it.base_hp_percent) > 0) ? Number(it.base_hp_percent) : (it?.hp_percent != null && Number(it.hp_percent) > 0 ? Number(it.hp_percent) : 0);
    let baseDefPercent = (it?.base_def_percent != null && Number(it.base_def_percent) > 0) ? Number(it.base_def_percent) : (it?.def_percent != null && Number(it.def_percent) > 0 ? Number(it.def_percent) : 0);
    let skillPct = (it?.skill_pct != null && Number(it.skill_pct) > 0) ? Number(it.skill_pct) : 0;
    let capMult = (it?.cap_mult != null && Number(it.cap_mult) > 0) ? Number(it.cap_mult) : 0;

    if (!baseDmgPercent) {
      const n = (it?.name || '').toLowerCase();
      const t = (it?.tier || '').toLowerCase();
      if (n.includes('bát hoang') || n.includes('vô cực') || t.includes('thượng cổ')) { baseDmgPercent = 150; skillPct = 50.0; capMult = 2000; }
      else if (n.includes('thần long') || n.includes('chaos') || t.includes('cổ đại')) { baseDmgPercent = 80; skillPct = 40.0; capMult = 1000; }
      else if (n.includes('hắc ám') || n.includes('ma vương') || t.includes('tối thượng')) { baseDmgPercent = 50; skillPct = 30.0; capMult = 500; }
      else if (n.includes('hoàng kim') || t.includes('thần thoại')) { baseDmgPercent = 30; skillPct = 25.0; capMult = 400; }
      else if (n.includes('huyết ma') || t.includes('epic')) { baseDmgPercent = 18; skillPct = 20.0; capMult = 300; }
      else if (n.includes('lam ngọc') || t.includes('hiếm')) { baseDmgPercent = 10; skillPct = 15.0; capMult = 200; }
      else { baseDmgPercent = 5; skillPct = 10.0; capMult = 100; }
    }
    if (!baseHpPercent) baseHpPercent = baseDmgPercent;
    if (!baseDefPercent) baseDefPercent = baseDmgPercent;

    return {
      baseDmgPercent,
      baseHpPercent,
      baseDefPercent,
      skillPct: skillPct || Number(it?.skill_pct || 10.0),
      capMult: capMult || Number(it?.cap_mult || 100)
    };
  };

  const getPetStats = (it) => {
    let bonusDmg = (it?.bonus_dmg != null && Number(it.bonus_dmg) > 0) ? Number(it.bonus_dmg) : 0;
    let baseHp = (it?.base_hp != null && Number(it.base_hp) > 0) ? Number(it.base_hp) : (it?.bonus_hp != null && Number(it.bonus_hp) > 0 ? Number(it.bonus_hp) : 0);
    let baseDef = (it?.base_def != null && Number(it.base_def) > 0) ? Number(it.base_def) : (it?.bonus_def != null && Number(it.bonus_def) > 0 ? Number(it.bonus_def) : 0);
    let critRate = (it?.crit_rate != null && Number(it.crit_rate) > 0) ? Number(it.crit_rate) : 0;

    if (bonusDmg < 400 || !baseHp) {
      const n = (it?.name || '').toLowerCase();
      const t = (it?.tier || '').toLowerCase();
      if (n.includes('bát hoang') || t.includes('thượng cổ')) { bonusDmg = 80000; baseHp = 2000000; baseDef = 200000; critRate = 0.5; }
      else if (n.includes('thần rồng') || n.includes('chaos') || t.includes('cổ đại')) { bonusDmg = 35000; baseHp = 800000; baseDef = 80000; critRate = 0.35; }
      else if (n.includes('phượng hoàng') || t.includes('tối thượng')) { bonusDmg = 18000; baseHp = 360000; baseDef = 36000; critRate = 0.25; }
      else if (n.includes('rồng thần') || t.includes('thần thoại')) { bonusDmg = 8000; baseHp = 150000; baseDef = 15000; critRate = 0.2; }
      else if (n.includes('rồng con') || t.includes('epic')) { bonusDmg = 3500; baseHp = 60000; baseDef = 6000; critRate = 0.15; }
      else if (n.includes('cáo tuyết') || t.includes('hiếm')) { bonusDmg = 1200; baseHp = 20000; baseDef = 2000; critRate = 0.1; }
      else { bonusDmg = 400; baseHp = 6000; baseDef = 600; critRate = 0.05; }
    }
    return { bonusDmg, baseHp, baseDef, critRate: critRate || 0.05 };
  };

  // --- CHỈ SỐ HIỂN THỊ LINH THÚ CHUẨN DISCORD /profile (SSOT: display_stats do server game_core tính) ---
  const PET_GROWTH_JS = [
    ['thượng cổ', { dmg: 15000, hp: 35000, def: 9750, cdmg: 0.03, every: 2, crit: 0.50, tcdmg: 0.45 }],
    ['cổ đại', { dmg: 7000, hp: 15000, def: 4550, cdmg: 0.025, every: 3, crit: 0.35, tcdmg: 0.15 }],
    ['tối thượng', { dmg: 3500, hp: 7000, def: 2275, cdmg: 0.02, every: 4, crit: 0.25, tcdmg: 0 }],
    ['thần thoại', { dmg: 1500, hp: 3000, def: 975, cdmg: 0.015, every: 5, crit: 0.20, tcdmg: 0 }],
    ['epic', { dmg: 600, hp: 1200, def: 390, cdmg: 0.01, every: 6, crit: 0.15, tcdmg: 0 }],
    ['hiếm', { dmg: 250, hp: 450, def: 165, cdmg: 0.008, every: 8, crit: 0.10, tcdmg: 0 }],
  ];
  const getPetDisplay = (it) => {
    if (!it) return null;
    const ds = it.display_stats;
    if (ds && ds.dmg != null) {
      const lv = Math.min(100, Math.max(1, Number(ds.level || it.level || 1)));
      return {
        dmg: Number(ds.dmg || 0), hp: Number(ds.hp || 0), def: Number(ds.def || 0),
        critPct: Number(ds.crit_pct || 0), critDmgPct: Number(ds.crit_dmg_pct || 0),
        level: lv, isMax: lv >= 100, exp: Number(ds.exp || it.exp || 0),
        reqExp: Number(ds.req_exp || (lv < 100 ? Math.floor(50 * Math.pow(lv, 1.3)) : 0))
      };
    }
    // Fallback (bản ghi cũ chưa có display_stats): sao chép công thức game_core.get_pet_display_stats
    const t = String(it.tier || '').toLowerCase();
    const g = (PET_GROWTH_JS.find(([k]) => t.includes(k)) || [null, { dmg: 100, hp: 150, def: 65, cdmg: 0.005, every: 10, crit: 0.05, tcdmg: 0 }])[1];
    const lv = Math.min(100, Math.max(1, Number(it.level || 1)));
    const extra = lv - 1;
    const stars = Math.min(5, Math.max(1, Number(it.stars || 1)));
    const starMult = 1 + (stars - 1) * 0.5;
    const stepMult = 1 + Math.max(0, Number(it.tier_step || 0));
    const base = getPetStats(it);
    const baseDmg = Number(it.bonus_dmg || 0) >= 400 ? Number(it.bonus_dmg) : base.bonusDmg;
    const baseHp = Number(it.base_hp || 0) >= 6000 ? Number(it.base_hp) : base.baseHp;
    const baseDef = Number(it.base_hp || 0) >= 6000 ? Number(it.base_def || Math.floor(Number(it.base_hp) / 10)) : base.baseDef;
    let crit = g.crit + (stars - 1) * 0.03 + Math.floor(extra / g.every) * 0.01;
    if (Number(it.crit_rate || 0) > 0) crit = Math.max(crit, Number(it.crit_rate));
    return {
      dmg: Math.round(baseDmg * starMult * stepMult + Math.floor(extra * g.dmg * starMult)),
      hp: Math.round(baseHp * starMult * stepMult + Math.floor(extra * g.hp * starMult)),
      def: Math.round(baseDef * starMult * stepMult + Math.floor(extra * g.def * starMult)),
      critPct: Math.round(crit * 100),
      critDmgPct: Math.round((g.tcdmg + extra * g.cdmg) * 100),
      level: lv, isMax: lv >= 100, exp: Number(it.exp || 0),
      reqExp: lv < 100 ? Math.floor(50 * Math.pow(lv, 1.3)) : 0
    };
  };

  // Badge chỉ số Linh Thú dùng chung (Profile / Túi Đồ / Sàn Đấu Giá) - y hệt ảnh /profile Discord
  const renderPetStatBadges = (item, opts = {}) => {
    const d = getPetDisplay(item);
    if (!d) return null;
    const cls = opts.small ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5';
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/30 rounded ${cls}`}>⚔️ +{d.dmg.toLocaleString()} DMG</span>
        <span className={`font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded ${cls}`}>❤️ +{d.hp.toLocaleString()} HP</span>
        <span className={`font-bold text-sky-400 bg-sky-400/10 border border-sky-400/30 rounded ${cls}`}>🛡️ +{d.def.toLocaleString()} DEF</span>
        <span className={`font-bold text-orange-400 bg-orange-400/10 border border-orange-400/30 rounded ${cls}`}>🎯 +{d.critPct.toLocaleString()}% Crit</span>
        {d.critDmgPct > 0 && (
          <span className={`font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded ${cls}`}>💥 +{d.critDmgPct.toLocaleString()}% ST Crit</span>
        )}
        {!d.isMax && (
          <span className={`font-bold text-emerald-200 bg-emerald-500/15 border border-emerald-500/30 rounded ${cls}`}>EXP: {d.exp.toLocaleString()}/{d.reqExp.toLocaleString()}</span>
        )}
      </div>
    );
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
    // Rút gọn "Tốc Độ Đôi Giày" -> "Tốc Độ" cho ngắn gọn, đồng bộ thẩm mỹ
    str = str.replace(/Tốc\s*Độ\s*Đôi\s*Giày/gi, 'Tốc Độ');
    return str;
  };

  // --- HỆ THỐNG BỘ TRANG BỊ & KÍCH HOẠT HIỆU ỨNG SET (SET BONUSES 2 - 4 - 6) ĐỒNG BỘ 100% VỚI GAME_CORE.PY ---
  const SET_TIER_RANKS = {
    thuong_co: 70,
    co_dai: 60,
    toi_thuong: 50,
    than_thoai: 40,
    epic: 30,
    hiem: 20,
    thuong: 10
  };

  const SET_DEFINITIONS = {
    thuong_co: {
      name: 'Bộ Thần Trang Thượng Cổ',
      tier: 'Thượng Cổ',
      color: '#ff0055',
      icon: '👑',
      badge: 'CỰC PHẨM THƯỢNG CỔ',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Bá Vương Thần Đao Thượng Cổ', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Thần Giáp Thượng Cổ Nữ Oa', slotIcon: '🛡️' },
        { slot: 'pants', label: 'Quần Chiến', name: 'Thần Quần Thượng Cổ Nữ Oa', slotIcon: '👖' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Thần Dây Chuyền Thượng Cổ Vô Cực', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Bát Hoang Thần Nhẫn Thượng Cổ', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Bát Hoang Thần Rồng Thượng Cổ', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '🛡️ Set 2 Món: +75% Máu (HP) & +50% Phòng Thủ (DEF)' },
        { count: 4, desc: '⚔️ Set 4 Món: +160% Máu (HP), +110% Phòng Thủ (DEF) & +50% Sát Thương (ATK)' },
        { count: 6, desc: '👑 Full Set 6 Món: +280% HP, +180% DEF, +90% ATK, +220% Sát Thương Bạo Kích, Kháng 20% Phản Đòn & 🌈 +60% ALL THUỘC TÍNH' }
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
        { slot: 'pants', label: 'Quần Chiến', name: 'Quần Cổ Đại Long Vương', slotIcon: '👖' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Cổ Đại Chaos', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Thần Long Chaos', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Thần Rồng Cổ Đại Chaos', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '🛡️ Set 2 Món: +40% Máu (HP) & +30% Phòng Thủ (DEF)' },
        { count: 4, desc: '⚔️ Set 4 Món: +85% Máu (HP), +55% Phòng Thủ (DEF) & +30% Sát Thương (ATK)' },
        { count: 6, desc: '👑 Full Set 6 Món: +140% HP, +95% DEF, +45% ATK, +120% Sát Thương Bạo Kích, Kháng 12% Phản Đòn & 🌈 +40% ALL THUỘC TÍNH' }
      ]
    },
    toi_thuong: {
      name: 'Bộ Hắc Ma Tối Thượng',
      tier: 'Tối Thượng',
      color: '#e53e3e',
      icon: '🌌',
      badge: 'HẮC MA TỐI THƯỢNG',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Huyền Thoại Ma Vương', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Vô Cực Tối Thượng', slotIcon: '🛡️' },
        { slot: 'pants', label: 'Quần Chiến', name: 'Quần Vô Cực Tối Thượng', slotIcon: '👖' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Hắc Ma Vương', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Hắc Ám Ma Vương', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Phượng Hoàng Tối Thượng', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '🛡️ Set 2 Món: +30% Máu (HP) & +20% Phòng Thủ (DEF)' },
        { count: 4, desc: '⚔️ Set 4 Món: +60% Máu (HP), +40% Phòng Thủ (DEF) & +22% Sát Thương (ATK)' },
        { count: 6, desc: '👑 Full Set 6 Món: +100% HP, +65% DEF, +35% ATK, +80% Sát Thương Bạo Kích, Kháng 8% Phản Đòn & 🌈 +25% ALL THUỘC TÍNH' }
      ]
    },
    than_thoai: {
      name: 'Bộ Hoàng Kim Thần Thoại',
      tier: 'Thần Thoại',
      color: '#d69e2e',
      icon: '✨',
      badge: 'HOÀNG KIM THẦN THOẠI',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Thần Đao Diệt Tộc', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Kim Cương', slotIcon: '🛡️' },
        { slot: 'pants', label: 'Quần Chiến', name: 'Quần Kim Cương', slotIcon: '👖' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Hoàng Kim', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Hoàng Kim Diệt Thế', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Rồng Thần Tí Hon', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '🛡️ Set 2 Món: +20% Máu (HP) & +15% Phòng Thủ (DEF)' },
        { count: 4, desc: '⚔️ Set 4 Món: +40% Máu (HP), +28% Phòng Thủ (DEF) & +18% Sát Thương (ATK)' },
        { count: 6, desc: '👑 Full Set 6 Món: +65% HP, +45% DEF, +25% ATK, +50% Sát Thương Bạo Kích, Kháng 4% Phản Đòn & 🌈 +15% ALL THUỘC TÍNH' }
      ]
    },
    epic: {
      name: 'Bộ Thánh Quang Sử Thi',
      tier: 'Epic',
      color: '#805ad5',
      icon: '🌟',
      badge: 'THÁNH QUANG SỬ THI',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Song Đao Hỏa Thần', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Thánh Quang', slotIcon: '🛡️' },
        { slot: 'pants', label: 'Quần Chiến', name: 'Quần Thánh Quang', slotIcon: '👖' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Tử Tinh', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Huyết Ma Thạch', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Rồng Con', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '🛡️ Set 2 Món: +15% Máu (HP) & +10% Phòng Thủ (DEF)' },
        { count: 4, desc: '⚔️ Set 4 Món: +28% Máu (HP), +18% Phòng Thủ (DEF) & +12% Sát Thương (ATK)' },
        { count: 6, desc: '👑 Full Set 6 Món: +45% HP, +30% DEF, +20% ATK, +35% Sát Thương Bạo Kích & 🌈 +10% ALL THUỘC TÍNH' }
      ]
    },
    hiem: {
      name: 'Bộ Lam Tinh Hiếm',
      tier: 'Hiếm',
      color: '#3182ce',
      icon: '🔷',
      badge: 'LAM TINH HIẾM',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Trảm Ma Kiếm', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Rồng', slotIcon: '🛡️' },
        { slot: 'pants', label: 'Quần Chiến', name: 'Quần Lam Ngọc', slotIcon: '👖' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Lam Ngọc', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Lam Ngọc Tinh', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Cáo Tuyết', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '🛡️ Set 2 Món: +10% Máu (HP) & +6% Phòng Thủ (DEF)' },
        { count: 4, desc: '⚔️ Set 4 Món: +20% Máu (HP), +12% Phòng Thủ (DEF) & +8% Sát Thương (ATK)' },
        { count: 6, desc: '👑 Full Set 6 Món: +30% HP, +20% DEF, +15% ATK, +20% Sát Thương Bạo Kích & 🌈 +5% ALL THUỘC TÍNH' }
      ]
    },
    thuong: {
      name: 'Bộ Tân Thủ Cơ Bản',
      tier: 'Thường',
      color: '#a0aec0',
      icon: '🗡️',
      badge: 'TÂN THỦ CƠ BẢN',
      pieces: [
        { slot: 'weapon', label: 'Vũ Khí', name: 'Kiếm Gỗ', slotIcon: '⚔️' },
        { slot: 'armor', label: 'Áo Giáp', name: 'Giáp Sắt', slotIcon: '🛡️' },
        { slot: 'pants', label: 'Quần Chiến', name: 'Quần Thiết Giáp', slotIcon: '👖' },
        { slot: 'necklace', label: 'Dây Chuyền', name: 'Dây Chuyền Bạc', slotIcon: '📿' },
        { slot: 'ring', label: 'Nhẫn Thần', name: 'Nhẫn Hắc Thiết', slotIcon: '💍' },
        { slot: 'pet', label: 'Linh Thú', name: 'Mèo Béo', slotIcon: '🐾' }
      ],
      bonuses: [
        { count: 2, desc: '🛡️ Set 2 Món: +5% Máu (HP) & +5% Phòng Thủ (DEF)' },
        { count: 4, desc: '⚔️ Set 4 Món: +10% Máu (HP), +10% DEF & +5% Sát Thương (ATK)' },
        { count: 6, desc: '👑 Full Set 6 Món: +15% Máu (HP), +15% DEF, +10% ATK & 🌈 +3% ALL THUỘC TÍNH' }
      ]
    }
  };

  const getItemSetInfo = (it) => {
    if (!it) return null;
    const cat = String(it.category || '').toLowerCase();
    if (cat === 'material' || cat === 'nguyenlieu' || cat === 'crystal' || cat === 'shoes') return null;
    const name = String(it.name || '').toLowerCase();
    if (name.includes('giày') || name.includes('bảo vật')) return null;
    const tier = String(it.tier || '').toLowerCase();

    // Bỏ qua nếu là nguyên liệu đá
    if (name.includes('tinh hoa') || name.includes('tinh thể') || name.includes('đá') || name.includes('bùa')) return null;

    let setKey = null;
    if (tier.includes('thượng cổ') || name.includes('thượng cổ') || name.includes('bá vương') || name.includes('nữ oa') || name.includes('bát hoang') || tier.includes('huyền thoại') || name.includes('huyền thoại') || tier.includes('legendary')) {
      setKey = 'thuong_co';
    } else if (tier.includes('cổ đại') || name.includes('cổ đại') || name.includes('long vương') || name.includes('chaos')) {
      setKey = 'co_dai';
    } else if (tier.includes('tối thượng') || name.includes('tối thượng') || name.includes('ma vương') || name.includes('vô cực')) {
      setKey = 'toi_thuong';
    } else if (tier.includes('thần thoại') || name.includes('thần thoại') || name.includes('diệt tộc') || name.includes('kim cương') || name.includes('hoàng kim')) {
      setKey = 'than_thoai';
    } else if (tier.includes('epic') || tier.includes('sử thi') || name.includes('hỏa thần') || name.includes('thánh quang') || name.includes('tử tinh')) {
      setKey = 'epic';
    } else if (tier.includes('hiếm') || tier.includes('rare') || name.includes('trảm ma') || name.includes('giáp rồng') || name.includes('lam ngọc') || name.includes('cáo tuyết')) {
      setKey = 'hiem';
    } else if (tier.includes('thường') || tier.includes('common') || name.includes('kiếm gỗ') || name.includes('giáp sắt') || name.includes('thiết giáp') || name.includes('bạc') || name.includes('hắc thiết') || name.includes('mèo béo')) {
      setKey = 'thuong';
    }

    if (!setKey || !SET_DEFINITIONS[setKey]) return null;
    return { setKey, ...SET_DEFINITIONS[setKey] };
  };

  const getEquippedSetStatus = (setKey, playerSummary) => {
    if (!setKey || !playerSummary) return { equippedCount: 0, equippedSlots: [] };
    const slots = ['weapon', 'armor', 'pants', 'necklace', 'ring', 'pet'];
    let count = 0;
    const equippedSlots = [];
    const targetRank = SET_TIER_RANKS[setKey] || 0;

    slots.forEach(slotKey => {
      const eq = playerSummary[slotKey] || playerSummary[`boss_${slotKey}`];
      if (eq && (eq.name || eq.tier)) {
        const eqSet = getItemSetInfo(eq);
        if (eqSet) {
          const eqRank = SET_TIER_RANKS[eqSet.setKey] || 0;
          if (eqRank >= targetRank) {
            count++;
            equippedSlots.push({ slot: slotKey, item: eq });
          }
        }
      }
    });
    return { equippedCount: count, equippedSlots };
  };

  const getPlayerActiveSets = (playerSummary) => {
    if (!playerSummary) return [];
    const slots = ['weapon', 'armor', 'pants', 'necklace', 'ring', 'pet'];
    const validItems = [];
    slots.forEach(s => {
      const eq = playerSummary[s] || playerSummary[`boss_${s}`];
      if (eq && (eq.name || eq.tier)) {
        const eqSet = getItemSetInfo(eq);
        if (eqSet) {
          validItems.push({ ...eq, setKey: eqSet.setKey, rank: SET_TIER_RANKS[eqSet.setKey] || 0 });
        }
      }
    });

    const activeList = [];
    const tierKeys = ['thuong_co', 'co_dai', 'toi_thuong', 'than_thoai', 'epic', 'hiem'];

    // 1. Full Set 6 món cao nhất
    let best6Rank = 0;
    for (const key of tierKeys) {
      const r = SET_TIER_RANKS[key];
      const count = validItems.filter(it => it.rank >= r).length;
      if (count >= 6) {
        best6Rank = r;
        const setDef = SET_DEFINITIONS[key];
        const b6 = setDef?.bonuses?.find(b => b.count === 6);
        if (b6) activeList.push({ key, name: setDef.name, tier: setDef.tier, color: setDef.color, count: 6, desc: b6.desc });
        break;
      }
    }

    // 2. Set 4 món cao hơn
    let best4Rank = 0;
    for (const key of tierKeys) {
      const r = SET_TIER_RANKS[key];
      if (r <= best6Rank) break;
      const count = validItems.filter(it => it.rank >= r).length;
      if (count >= 4) {
        best4Rank = r;
        const setDef = SET_DEFINITIONS[key];
        const b4 = setDef?.bonuses?.find(b => b.count === 4);
        if (b4) activeList.push({ key, name: setDef.name, tier: setDef.tier, color: setDef.color, count: 4, desc: b4.desc });
        break;
      }
    }

    // 3. Set 2 món cao hơn
    const minRankFor2 = Math.max(best6Rank, best4Rank);
    for (const key of tierKeys) {
      const r = SET_TIER_RANKS[key];
      if (minRankFor2 > 0 && r <= minRankFor2) break;
      const count = validItems.filter(it => it.rank >= r).length;
      if (count >= 2) {
        const setDef = SET_DEFINITIONS[key];
        const b2 = setDef?.bonuses?.find(b => b.count === 2);
        if (b2) activeList.push({ key, name: setDef.name, tier: setDef.tier, color: setDef.color, count: 2, desc: b2.desc });
        break;
      }
    }

    return activeList;
  };

  // SSOT: TÍNH TOÁN FULL THUỘC TÍNH CHIẾN ĐẤU & SÁT THƯƠNG CHUẨN DISCORD / GAME_CORE (KHÔNG BỊ PHÔ TRƯƠNG)
  const calculatePlayerFullStats = (p) => {
    if (!p) return {
      totalAttack: 150,
      displayCp: 0,
      calculatedCp: 0,
      maxHp: 1000,
      currentHp: 1000,
      hpPct: 100,
      totalDef: 0,
      rawGearReducPct: '0.0',
      effectiveGearReducPct: 0,
      rawCritPct: 15,
      effectiveCritPct: 15,
      critDamageMultiplier: 1.8,
      critTotalPct: 180,
      armorPenDisplay: '0.0',
      rawCritResPctDisplay: '0.0',
      effectiveCritResPct: 0,
      totalAgility: 80,
      dodgePct: '0.0',
      ringSkillProcRate: 0.001
    };

    const lvl = Number(p.level || 1);
    const getStarMult = (stars) => 1.0 + (Math.max(1, Math.min(5, Number(stars || 1))) - 1) * 0.50;
    const getRingStarMult = (stars) => Math.pow(3, Math.max(1, Math.min(5, Number(stars || 1))) - 1);
    const getPlusMult = (plus) => 1.0 + (Number(plus || 0) * 0.25);
    const getStepMult = (it) => 1.0 + ((Number(it?.tier_step || it?.step || 0) || 0) * 0.10);

    const baseUserDmg = 100 + (lvl * 25);
    const baseUserHp = 1000 + (lvl * 150);

    let gearDmgPctBonus = 0.0;
    let critDamageMultiplier = 1.8;
    let gearCritChanceBonus = 0.0;
    let armorPenPct = 0.0;
    let extraGearHpPct = 0.0;
    let extraGearDefPct = 0.0;
    let rawGearDmgReduc = 0.0;
    let rawCritResPct = 0.0;
    let necklaceCpMult = 1.0;
    let armorCpMult = 1.0;
    let ringCpMult = 1.0;
    let hatCpMult = 1.0;
    let gearCpMult = 0.0;

    const parseSubs = (it) => {
      if (!it) return [];
      let subs = [];
      if (Array.isArray(it.sub_stats)) subs.push(...it.sub_stats);
      else if (typeof it.sub_stats === 'string' && it.sub_stats.trim()) {
        try { const j = JSON.parse(it.sub_stats); if (Array.isArray(j)) subs.push(...j); else subs.push(it.sub_stats); } catch { subs.push(it.sub_stats); }
      }
      if (Array.isArray(it.star_sub_stats)) subs.push(...it.star_sub_stats);
      else if (typeof it.star_sub_stats === 'string' && it.star_sub_stats.trim()) {
        try { const j = JSON.parse(it.star_sub_stats); if (Array.isArray(j)) subs.push(...j); else subs.push(it.star_sub_stats); } catch { subs.push(it.star_sub_stats); }
      }
      return subs.filter(Boolean);
    };

    // 1. WEAPON
    let weaponDmg = 0;
    const w = p.weapon || p.boss_weapon;
    if (w && w.name) {
      const wStats = getWeaponStats(w);
      const wBase = Number(w.base_dmg || wStats.baseDmg || 300000);
      const wStarMult = getStarMult(w.stars);
      const wStepMult = getStepMult(w);
      const wPlusMult = getPlusMult(w.plus);
      weaponDmg = Math.round(wBase * wPlusMult * wStarMult * wStepMult);
      const wTier = String(w.tier || '').toLowerCase();
      if (wTier.includes('thượng cổ')) {
        gearDmgPctBonus += 60.0;
        critDamageMultiplier = 2.5;
      } else if (wTier.includes('cổ đại')) {
        gearDmgPctBonus += 20.0;
      }
      parseSubs(w).forEach(sub => {
        const m = String(sub).match(/\+(\d+)%/);
        const val = m ? parseInt(m[1], 10) : 20;
        const sLow = String(sub).toLowerCase();
        if (sLow.includes('st chí mạng') || sLow.includes('st bạo kích') || sLow.includes('sát thương bạo kích') || sLow.includes('sát thương chí mạng')) {
          critDamageMultiplier += val / 100.0;
        } else if (sLow.includes('chí mạng') || sLow.includes('bạo kích') || sLow.includes('crit')) {
          gearCritChanceBonus += val / 100.0;
        } else if (sLow.includes('xuyên giáp') || sLow.includes('phá giáp')) {
          gearDmgPctBonus += val;
          armorPenPct += val / 100.0;
        } else {
          gearDmgPctBonus += val;
        }
      });
    }

    // 2. ARMOR
    let armorDmg = 0;
    let armorHp = 0;
    let armorDef = 0;
    const a = p.armor || p.boss_armor;
    if (a && a.name) {
      const aStats = getArmorStats(a);
      const aBaseDmg = Number(a.base_dmg || 30);
      const aBaseHp = Number(a.base_hp || aStats.baseHp || (String(a.tier || '').toLowerCase().includes('thượng cổ') ? 900000 : 30000));
      const aBaseDef = Number(a.base_def || aStats.baseDef || (String(a.tier || '').toLowerCase().includes('thượng cổ') ? 90000 : 3000));
      const aStarMult = getStarMult(a.stars);
      const aStepMult = getStepMult(a);
      const aPlusMult = getPlusMult(a.plus);
      armorDmg = Math.round(aBaseDmg * aPlusMult * aStarMult * aStepMult);
      armorHp = Math.round(aBaseHp * aPlusMult * aStarMult * aStepMult);
      armorDef = Math.round(aBaseDef * aPlusMult * aStarMult * aStepMult);
      const aTier = String(a.tier || '').toLowerCase();
      if (aTier.includes('thượng cổ')) {
        gearDmgPctBonus += 50.0;
      } else if (aTier.includes('cổ đại')) {
        gearDmgPctBonus += 15.0;
      }
      parseSubs(a).forEach(sub => {
        const m = String(sub).match(/\+(\d+)%/);
        const val = m ? parseInt(m[1], 10) : 20;
        const sLow = String(sub).toLowerCase();
        if (sLow.includes('giảm sát thương') || sLow.includes('giảm st') || sLow.includes('kháng phản đòn')) {
          rawGearDmgReduc += val / 100.0;
        } else if (sLow.includes('phòng thủ') || sLow.includes('def') || sLow.includes('giáp') || sLow.includes('kim cang')) {
          extraGearDefPct += val / 100.0;
        } else if (sLow.includes('sinh lực') || sLow.includes('hp') || sLow.includes('máu')) {
          extraGearHpPct += val / 100.0;
        } else if (sLow.includes('kháng sát thương bạo kích') || sLow.includes('kháng bạo kích') || sLow.includes('kháng chí mạng')) {
          rawCritResPct += val / 100.0;
        } else if (sLow.includes('sát thương') || sLow.includes('công phá') || sLow.includes('phản kích')) {
          gearDmgPctBonus += val;
        }
      });
    }

    // 3. PANTS
    let pantsHp = 0;
    let pantsDef = 0;
    let pantsHpPct = 0.0;
    let pantsDefPct = 0.0;
    const pn = p.pants || p.boss_pants;
    if (pn && pn.name) {
      const pStats = getPantsStats(pn);
      const pnBaseHp = Number(pn.base_hp || pStats.baseHp || (String(pn.tier || '').toLowerCase().includes('thượng cổ') ? 480000 : 20000));
      const pnBaseDef = Number(pn.base_def || pStats.baseDef || (String(pn.tier || '').toLowerCase().includes('thượng cổ') ? 48000 : 2000));
      const pnStarMult = getStarMult(pn.stars);
      const pnStepMult = getStepMult(pn);
      const pnPlusMult = getPlusMult(pn.plus);
      pantsHp = Math.round(pnBaseHp * pnPlusMult * pnStarMult * pnStepMult);
      pantsDef = Math.round(pnBaseDef * pnPlusMult * pnStarMult * pnStepMult);
      const pnBaseHpPct = Number(pn.base_hp_percent || pn.hp_percent || pStats.hpPercent || (String(pn.tier || '').toLowerCase().includes('thượng cổ') ? 200 : 15));
      const pnBaseDefPct = Number(pn.base_def_percent || pn.def_percent || pStats.defPercent || (String(pn.tier || '').toLowerCase().includes('thượng cổ') ? 200 : 15));
      pantsHpPct = pnBaseHpPct * pnPlusMult * pnStarMult * pnStepMult;
      pantsDefPct = pnBaseDefPct * pnPlusMult * pnStarMult * pnStepMult;
      parseSubs(pn).forEach(sub => {
        const m = String(sub).match(/\+(\d+)%/);
        const val = m ? parseInt(m[1], 10) : 20;
        const sLow = String(sub).toLowerCase();
        if (sLow.includes('giảm sát thương') || sLow.includes('giảm st')) {
          rawGearDmgReduc += val / 100.0;
        } else if (sLow.includes('phòng thủ') || sLow.includes('def')) {
          extraGearDefPct += val / 100.0;
        } else if (sLow.includes('sinh lực') || sLow.includes('hp') || sLow.includes('máu')) {
          extraGearHpPct += val / 100.0;
        } else if (sLow.includes('kháng sát thương bạo kích') || sLow.includes('kháng bạo kích') || sLow.includes('kháng chí mạng')) {
          rawCritResPct += val / 100.0;
        }
      });
    }

    // 4. PET
    let petDmg = 0;
    let petHp = 0;
    let petDef = 0;
    let petCritBonus = 0.0;
    let petLevelCritDmg = 0.0;
    let petLevelCp = 0;
    const pt = p.pet || p.boss_pet;
    if (pt && pt.name) {
      // SSOT: dùng chỉ số hiển thị chuẩn Discord (display_stats từ server, fallback công thức game_core)
      const pd = getPetDisplay(pt);
      const ptTierLow = String(pt.tier || '').toLowerCase();
      const ptLvl = pd.level;
      const ptTierCdmg = ptTierLow.includes('thượng cổ') ? 0.45 : (ptTierLow.includes('cổ đại') ? 0.15 : 0);
      const ptCpPerLvl = ptTierLow.includes('thượng cổ') ? 1500 : ptTierLow.includes('cổ đại') ? 700 : ptTierLow.includes('tối thượng') ? 350 : ptTierLow.includes('thần thoại') ? 150 : ptTierLow.includes('epic') ? 60 : ptTierLow.includes('hiếm') ? 20 : 10;

      petDmg = pd.dmg;
      petHp = pd.hp;
      petDef = pd.def;
      petCritBonus = pd.critPct / 100;
      petLevelCritDmg = Math.max(0, pd.critDmgPct / 100 - ptTierCdmg); // phần nội tại Tier được cộng riêng bên dưới
      petLevelCp = Number(pt.level_bonus_cp || ((ptLvl - 1) * ptCpPerLvl));

      const ptTier = String(pt.tier || '').toLowerCase();
      if (ptTier.includes('thượng cổ')) {
        critDamageMultiplier += 0.45;
        rawCritResPct += 0.25;
      } else if (ptTier.includes('cổ đại')) {
        critDamageMultiplier += 0.15;
        rawCritResPct += 0.15;
      }
      parseSubs(pt).forEach(sub => {
        const m = String(sub).match(/\+(\d+)%/);
        const val = m ? parseInt(m[1], 10) : 20;
        const sLow = String(sub).toLowerCase();
        if (sLow.includes('st chí mạng') || sLow.includes('st bạo kích') || sLow.includes('sát thương bạo kích') || sLow.includes('sát thương chí mạng')) {
          if ((ptTier.includes('thượng cổ') && val === 45) || (ptTier.includes('cổ đại') && val === 15)) {
            // Đã tính ở nội tại tier
          } else {
            critDamageMultiplier += val / 100.0;
          }
        } else if (sLow.includes('kháng sát thương bạo kích') || sLow.includes('kháng bạo kích') || sLow.includes('kháng chí mạng') || sLow.includes('kháng crit')) {
          if ((ptTier.includes('thượng cổ') && val === 25) || (ptTier.includes('cổ đại') && val === 15)) {
            // Đã tính ở nội tại tier
          } else {
            rawCritResPct += val / 100.0;
          }
        } else if (sLow.includes('chí mạng') || sLow.includes('bạo kích') || sLow.includes('crit')) {
          gearCritChanceBonus += val / 100.0;
        } else if (sLow.includes('xuyên giáp') || sLow.includes('phá giáp')) {
          gearDmgPctBonus += val;
          armorPenPct += val / 100.0;
        } else if (sLow.includes('exp') || sLow.includes('kinh nghiệm')) {
          // Bỏ qua chỉ số EXP khi tính sát thương (tránh cộng nhầm vào gearDmgPctBonus)
        } else {
          gearDmgPctBonus += val;
        }
      });
    }
    critDamageMultiplier += petLevelCritDmg;

    // 5. NECKLACE
    let necklaceDmgPct = 0;
    let necklaceHpPct = 0;
    let necklaceDefPct = 0;
    const nk = p.necklace || p.boss_necklace;
    if (nk && nk.name) {
      const nStats = getNecklaceStats(nk);
      const nStarMult = getStarMult(nk.stars);
      const nStepMult = getStepMult(nk);
      const nPlus = Number(nk.plus || 0);
      const nBasePct = Number(nk.dmg_percent || nStats.dmgPercent || (String(nk.tier || '').toLowerCase().includes('thượng cổ') ? 300 : 50));
      const baseUpgradePct = nBasePct + Math.max(nPlus, Math.round(nBasePct * (getPlusMult(nPlus) - 1.0)));
      necklaceDmgPct = Math.round(baseUpgradePct * nStarMult * nStepMult);
      necklaceHpPct = necklaceDmgPct;
      necklaceDefPct = necklaceDmgPct;
      const nTier = String(nk.tier || '').toLowerCase();
      if (nTier.includes('thượng cổ')) {
        critDamageMultiplier = Math.max(critDamageMultiplier, 3.0);
        necklaceCpMult += 0.35;
      } else if (nTier.includes('cổ đại')) {
        critDamageMultiplier = Math.max(critDamageMultiplier, 2.2);
        necklaceCpMult += 0.20;
      }
      parseSubs(nk).forEach(sub => {
        const m = String(sub).match(/\+(\d+)%/);
        const val = m ? parseInt(m[1], 10) : 20;
        const sLow = String(sub).toLowerCase();
        if (sLow.includes('st chí mạng') || sLow.includes('st bạo kích') || sLow.includes('sát thương bạo kích') || sLow.includes('sát thương chí mạng')) {
          critDamageMultiplier += val / 100.0;
        } else if (sLow.includes('chí mạng') || sLow.includes('bạo kích') || sLow.includes('crit')) {
          gearCritChanceBonus += val / 100.0;
        } else if (sLow.includes('xuyên giáp') || sLow.includes('phá giáp')) {
          necklaceDmgPct += val;
          armorPenPct += val / 100.0;
        } else if (sLow.includes('lực chiến cp')) {
          necklaceCpMult += val / 100.0;
        } else {
          necklaceDmgPct += val;
        }
      });
    }

    // 6. RING
    let ringDmgPct = 0;
    let ringHpPct = 0;
    let ringDefPct = 0;
    let ringSkillProcRate = 0.001;
    const rg = p.ring || p.boss_ring;
    if (rg && rg.name) {
      const rStats = getRingStats(rg);
      const rStarMult = getRingStarMult(rg.stars);
      const rStep = Number(rg.tier_step || rg.step || 0) || 0;
      const rBasePct = Number(rg.base_dmg_percent || rStats.baseDmgPercent || (String(rg.tier || '').toLowerCase().includes('thượng cổ') ? 150 : 30));
      ringDmgPct = Math.round(rBasePct * rStarMult) + (rStep * 1000);
      ringHpPct = ringDmgPct;
      ringDefPct = ringDmgPct;
      ringSkillProcRate = Number(rg.skill_proc_rate || (rg.skill_level ? rg.skill_level * 0.05 : 0.5));
      const rTier = String(rg.tier || '').toLowerCase();
      if (rTier.includes('thượng cổ')) ringCpMult += 0.50;
      else if (rTier.includes('cổ đại')) ringCpMult += 0.30;
      else if (rTier.includes('tối thượng')) ringCpMult += 0.20;

      parseSubs(rg).forEach(sub => {
        const m = String(sub).match(/\+(\d+)%/);
        const val = m ? parseInt(m[1], 10) : 20;
        const sLow = String(sub).toLowerCase();
        if (sLow.includes('st chí mạng') || sLow.includes('st bạo kích') || sLow.includes('sát thương bạo kích') || sLow.includes('sát thương chí mạng')) {
          critDamageMultiplier += val / 100.0;
        } else if (sLow.includes('chí mạng') || sLow.includes('bạo kích') || sLow.includes('crit')) {
          gearCritChanceBonus += val / 100.0;
        } else if (sLow.includes('xuyên giáp') || sLow.includes('phá giáp')) {
          ringDmgPct += val;
          armorPenPct += val / 100.0;
        } else if (sLow.includes('lực chiến cp')) {
          ringCpMult += val / 100.0;
        } else if (!sLow.includes('sinh lực') && !sLow.includes('hp') && !sLow.includes('phòng thủ') && !sLow.includes('def') && !sLow.includes('kháng')) {
          ringDmgPct += val;
        }
      });
    }

    // 7. SHOES (Bảo Vật Đôi Giày)
    let totalAgility = 80;
    let shoeBonusPct = 0.0;
    const sh = p.shoes || p.boss_shoes;
    if (sh && sh.name) {
      const sPlus = Number(sh.plus || 0);
      const shBaseAgi = Number(sh.base_agility || (String(sh.tier || '').toLowerCase().includes('huyền thoại') ? 300 : 80));
      parseSubs(sh).forEach(sub => {
        const m = String(sub).match(/\+(\d+)%/);
        if (m) shoeBonusPct += parseFloat(m[1]);
      });
      const agiPlusMult = getPlusMult(sPlus);
      const sStepMult = getStepMult(sh);
      totalAgility = Math.round(shBaseAgi * agiPlusMult * (1.0 + (shoeBonusPct / 100.0)) * sStepMult);
    }

    // 8. HAT (Bảo Vật Nón)
    const ht = p.hat || p.boss_hat;
    if (ht && ht.name) {
      const hPlus = Number(ht.plus || 0);
      const basePen = Number(ht.base_armor_pen_pct || 300.0);
      armorPenPct += (basePen / 100.0) * getPlusMult(hPlus);
      hatCpMult += 0.50;
      parseSubs(ht).forEach(sub => {
        const m = String(sub).match(/\+(\d+)%/);
        const val = m ? parseInt(m[1], 10) : 20;
        const sLow = String(sub).toLowerCase();
        if (sLow.includes('st chí mạng') || sLow.includes('st bạo kích') || sLow.includes('sát thương bạo kích') || sLow.includes('sát thương chí mạng')) {
          critDamageMultiplier += val / 100.0;
        } else if (sLow.includes('chí mạng') || sLow.includes('bạo kích') || sLow.includes('crit')) {
          gearCritChanceBonus += val / 100.0;
        } else if (sLow.includes('xuyên giáp') || sLow.includes('phá giáp')) {
          gearDmgPctBonus += val;
          armorPenPct += val / 100.0;
        } else {
          gearDmgPctBonus += val;
        }
      });
    }

    // 9. SET BONUSES
    let setAtkPct = 0.0;
    let setHpPct = 0.0;
    let setDefPct = 0.0;
    let setCritDmgPct = 0.0;
    let allStatsBonus = 0.0;

    const slots6 = [w, a, pn, nk, rg, pt];
    const tcCount = slots6.filter(it => it && String(it.tier || '').toLowerCase().includes('thượng cổ')).length;
    if (tcCount >= 6) {
      setAtkPct = 0.90;
      setHpPct = 2.80;
      setDefPct = 1.80;
      setCritDmgPct = 2.20;
      allStatsBonus = 0.60;
    } else if (tcCount >= 4) {
      setAtkPct = 0.50;
      setHpPct = 1.60;
      setDefPct = 1.10;
    } else if (tcCount >= 2) {
      setHpPct = 0.75;
      setDefPct = 0.50;
    }
    critDamageMultiplier += setCritDmgPct;

    // 10. CÔNG THỨC SÁT THƯƠNG BUFF MỚI (ADDITIVE)
    const rawGearDmg = weaponDmg + armorDmg + petDmg;
    const totalDmgPct = (gearDmgPctBonus / 100.0)
      + (necklaceDmgPct / 100.0)
      + (ringDmgPct / 100.0)
      + setAtkPct
      + allStatsBonus;

    const totalGearMultiplier = 1.0 + totalDmgPct;
    const effectiveGearDmg = rawGearDmg * totalGearMultiplier;
    let totalAttack = baseUserDmg + Math.round(effectiveGearDmg);
    if (p.has_buff) totalAttack *= 2;

    // 11. CRIT & CRIT DMG
    const rawCritChance = 0.15 + petCritBonus + gearCritChanceBonus;
    const effectiveCritChance = Math.min(0.95, Math.max(0.05, rawCritChance));
    const rawCritPct = Math.round(rawCritChance * 1000) / 10;
    const effectiveCritPct = Math.round(effectiveCritChance * 1000) / 10;
    const critTotalPct = Math.round(critDamageMultiplier * 100);

    // 12. XUYÊN GIÁP
    const effectiveArmorPen = Math.min(0.70, Math.max(0.0, armorPenPct));
    const armorPenDisplay = (Math.round(effectiveArmorPen * 1000) / 10).toFixed(1);

    // 13. HP & DEF
    const totalHpBonusPct = (extraGearHpPct / 100.0) + (pantsHpPct / 100.0) + (necklaceHpPct / 100.0) + (ringHpPct / 100.0) + setHpPct + allStatsBonus;
    const totalDefBonusPct = (extraGearDefPct / 100.0) + (pantsDefPct / 100.0) + (necklaceDefPct / 100.0) + (ringDefPct / 100.0) + setDefPct + allStatsBonus;
    const rawHp = baseUserHp + armorHp + pantsHp + petHp;
    const rawDef = armorDef + pantsDef + petDef;
    const maxHp = Number(p.max_hp !== undefined && p.max_hp > 0 ? p.max_hp : Math.round(rawHp * (1.0 + totalHpBonusPct)));
    const totalDef = Number(p.total_def !== undefined && p.total_def > 0 ? p.total_def : Math.round(rawDef * (1.0 + totalDefBonusPct)));
    const currentHp = Number(p.current_hp !== undefined ? p.current_hp : maxHp);
    const hpPct = Math.min(100, Math.max(0, (currentHp / Math.max(1, maxHp)) * 100));

    // Giảm ST
    const effectiveGearReducPct = Math.min(80.0, Math.round(rawGearDmgReduc * 1000) / 10);
    const rawGearReducPct = (Math.round(rawGearDmgReduc * 1000) / 10).toFixed(1);

    // Kháng chí mạng
    const effectiveCritResPct = Math.min(95.0, Math.round(rawCritResPct * 1000) / 10);
    const rawCritResPctDisplay = (Math.round(rawCritResPct * 1000) / 10).toFixed(1);

    // Tốc độ & Né đòn
    const dodgeRate = totalAgility > 0 ? Math.min(0.60, totalAgility / (totalAgility + 800.0)) : 0.0;
    const dodgePct = (Math.round(dodgeRate * 1000) / 10).toFixed(1);

    // 14. LỰC CHIẾN (CP)
    const cpBonusMult = 1.0
      + Math.max(0.0, necklaceCpMult - 1.0)
      + Math.max(0.0, armorCpMult - 1.0)
      + Math.max(0.0, ringCpMult - 1.0)
      + Math.max(0.0, hatCpMult - 1.0)
      + gearCpMult;
    const atkCp = Math.round(totalAttack * (1.0 + effectiveCritChance) * cpBonusMult) + petLevelCp;
    const critResCpMult = 1.0 + (effectiveCritResPct / 100.0);
    const defCp = Math.round((maxHp * 0.5 + totalDef * 3.0) * critResCpMult);
    const agiCp = Math.round(totalAgility * 6.0);
    const calculatedCp = atkCp + defCp + agiCp;
    const displayCp = (p.cp && Number(p.cp) > 0) ? Number(p.cp) : calculatedCp;

    return {
      totalAttack,
      displayCp,
      calculatedCp,
      maxHp,
      currentHp,
      hpPct,
      totalDef,
      rawGearReducPct,
      effectiveGearReducPct,
      rawCritPct,
      effectiveCritPct,
      critDamageMultiplier,
      critTotalPct,
      armorPenDisplay,
      rawCritResPctDisplay,
      effectiveCritResPct,
      totalAgility,
      dodgePct,
      ringSkillProcRate
    };
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
    const isMaterial = category === 'material';
    const starsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
    const plusVal = Number(item.plus || 0);

    const itemName = String(item.name || '').trim();
    const lowerName = itemName.toLowerCase();
    const itemId = String(item.id || '').toLowerCase();
    const isShoes = (category === 'shoes') || String(item.category || '').toLowerCase() === 'shoes' || lowerName.includes('giày');
    const isHat = (category === 'hat') || String(item.category || '').toLowerCase() === 'hat' || lowerName.includes('nón') || lowerName.includes('mũ');

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
            'Dùng lệnh [/cuonghoa mon_do:✨ Kỹ Năng Nhẫn] hoặc [mcuonghoa nhan skill] trên Discord/TikTok.',
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
    const armorStats = getArmorStats(item);
    const pantsStats = getPantsStats(item);
    const necklaceStats = getNecklaceStats(item);
    const ringStats = getRingStats(item);
    const petStats = getPetStats(item);
    const weaponStats = getWeaponStats(item);

    const starMultMath = Math.pow(2, Math.max(0, starsCount - 1));
    const totalEstHp = Math.round(armorStats.baseHp * (1 + 0.25 * plusVal) * starMultMath);
    const totalEstDef = Math.round(armorStats.baseDef * (1 + 0.25 * plusVal) * starMultMath);
    const estDmgReduc = Math.min(80, Math.round((totalEstDef / (totalEstDef + 2500)) * 100));

    const totalEstPantsHp = Math.round(pantsStats.baseHp * (1 + 0.25 * plusVal) * starMultMath);
    const totalEstPantsDef = Math.round(pantsStats.baseDef * (1 + 0.25 * plusVal) * starMultMath);
    const estPantsDmgReduc = Math.min(80, Math.round((totalEstPantsDef / (totalEstPantsDef + 2500)) * 100));

    const baseDmg = weaponStats.baseDmg;
    const plusBonus = Math.round(baseDmg * plusVal * 0.25);
    const totalBasePlus = baseDmg + plusBonus;
    const starMult = (starsCount === 5 ? 2.5 : (starsCount === 4 ? 2.0 : (starsCount === 3 ? 1.6 : (starsCount === 2 ? 1.3 : 1.0))));
    const totalEstDmg = Math.round(totalBasePlus * starMult);
    const petDisp = (category === 'pet') ? (getPetDisplay(item) || {}) : {};
    const bonusDmg = Number(petDisp.dmg ?? petStats.bonusDmg);
    const petHp = Number(petDisp.hp ?? petStats.baseHp);
    const petDef = Number(petDisp.def ?? petStats.baseDef);
    const critRatePct = Number(petDisp.critPct ?? Math.round(petStats.critRate * 100));
    const petCritDmgPct = Number(petDisp.critDmgPct || 0);
    const dmgPercent = necklaceStats.dmgPercent;
    const baseDmgPercent = ringStats.baseDmgPercent;
    const baseHpPercent = ringStats.baseHpPercent || baseDmgPercent;
    const baseDefPercent = ringStats.baseDefPercent || baseDmgPercent;
    const ringStarsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
    const ringStarMult = Math.pow(3, ringStarsCount - 1);
    const totalEstRingDmg = Math.round(baseDmgPercent * ringStarMult);
    const totalEstRingHp = Math.round(baseHpPercent * ringStarMult);
    const totalEstRingDef = Math.round(baseDefPercent * ringStarMult);
    const skillPct = ringStats.skillPct;
    const skillLevel = Number(item.skill_level || 0);
    const skillProcStr = getRingSkillProcStr(item);
    const petLevel = Number(item.level || 1);

    const rawSub1 = Array.isArray(item?.sub_stats) ? item.sub_stats : (typeof item?.sub_stats === 'string' ? [item.sub_stats] : []);
    const rawSub2 = Array.isArray(item?.star_sub_stats) ? item.star_sub_stats : (typeof item?.star_sub_stats === 'string' ? [item.star_sub_stats] : []);
    const allSubStats = Array.from(new Set([...rawSub1, ...rawSub2].filter(Boolean)));

    const getCatBadgeInfo = () => {
      if (category === 'weapon') return { label: 'VŨ KHÍ TẤN CÔNG', icon: '⚔️', color: '#10b981', border: '#059669', bg: 'rgba(16, 185, 129, 0.15)' };
      if (category === 'armor') return { label: 'ÁO GIÁP PHÒNG HỘ', icon: '🛡️', color: '#06b6d4', border: '#0891b2', bg: 'rgba(6, 182, 212, 0.15)' };
      if (category === 'pants') return { label: 'QUẦN CHIẾN BẢO HỘ', icon: '👖', color: '#10b981', border: '#059669', bg: 'rgba(16, 185, 129, 0.15)' };
      if (category === 'necklace') return { label: 'DÂY CHUYỀN THẦN LỰC', icon: '📿', color: '#f59e0b', border: '#d97706', bg: 'rgba(245, 158, 11, 0.15)' };
      if (category === 'ring') return { label: 'NHẪN THẦN BINH TUYỆT KỸ', icon: '💍', color: '#a855f7', border: '#9333ea', bg: 'rgba(168, 85, 247, 0.15)' };
      if (category === 'pet') return { label: 'LINH THÚ TRỢ CHIẾN', icon: '🐾', color: '#f43f5e', border: '#e11d48', bg: 'rgba(244, 63, 94, 0.15)' };
      if (category === 'shoes') return { label: 'GIÀY THẦN TỐC', icon: '👟', color: '#ec4899', border: '#db2777', bg: 'rgba(236, 72, 153, 0.15)' };
      if (category === 'hat') return { label: 'BẢO VẬT NÓN', icon: '👑', color: '#ffd700', border: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' };
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
            {renderUniversalItemThumb(item, category, {
              sizeClass: 'w-14 h-14',
              imgSizeClass: 'w-11 h-11',
              defaultIcon: isMaterial ? matInfo.icon : catBadge.icon
            })}

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
                    {!isShoes && !isHat && starsCount > 0 && (
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

                  {category === 'pants' && (
                    <>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-emerald-400 font-bold">Chỉ Số Tăng % Máu:</span>
                        <span className="font-black text-emerald-300 text-xs">+{pantsStats.hpPercent}% HP ❤️</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-cyan-400 font-bold">Chỉ Số Tăng % Thủ:</span>
                        <span className="font-black text-cyan-300 text-xs">+{pantsStats.defPercent}% DEF 🛡️</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Sinh lực gốc (Base HP):</span>
                        <span className="font-bold text-emerald-400">+{pantsStats.baseHp.toLocaleString()} HP</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Phòng thủ gốc (Base DEF):</span>
                        <span className="font-bold text-cyan-400">+{pantsStats.baseDef.toLocaleString()} DEF</span>
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
                        <span className="text-emerald-400 font-bold">Tổng Sinh Lực Thêm:</span>
                        <span className="font-black text-emerald-300 text-xs">+{totalEstPantsHp.toLocaleString()} HP ❤️</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-cyan-400 font-bold">Tổng Phòng Thủ Thêm:</span>
                        <span className="font-black text-cyan-300 text-xs">+{totalEstPantsDef.toLocaleString()} DEF (Giảm ~{estPantsDmgReduc}% ST Boss) 🛡️</span>
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
                        <span className="text-slate-400">Chỉ số gốc (1⭐):</span>
                        <span className="font-bold text-slate-300">+{baseDmgPercent}% DMG • +{baseHpPercent}% HP • +{baseDefPercent}% DEF</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-amber-400">Hệ số Sao ({ringStarsCount}⭐):</span>
                        <span className="font-bold text-amber-300">x{ringStarMult} Khuếch Đại (x3/sao)</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-purple-400 font-bold">Tổng Sát Thương Dự Tính:</span>
                        <span className="font-black text-purple-300 text-xs">+{totalEstRingDmg.toLocaleString()}% DMG ⚡</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-emerald-400 font-bold">Tổng Sinh Lực (HP) Dự Tính:</span>
                        <span className="font-black text-emerald-300 text-xs">+{totalEstRingHp.toLocaleString()}% HP ❤️</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-cyan-400 font-bold">Tổng Giáp Thủ (DEF) Dự Tính:</span>
                        <span className="font-black text-cyan-300 text-xs">+{totalEstRingDef.toLocaleString()}% DEF 🛡️</span>
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
                        <span className="text-slate-400">Sinh lực Linh Thú:</span>
                        <span className="font-bold text-emerald-400">+{petHp.toLocaleString()} HP ❤️</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-slate-400">Phòng thủ Linh Thú:</span>
                        <span className="font-bold text-cyan-400">+{petDef.toLocaleString()} DEF 🛡️</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-rose-400 font-bold">Cấp độ Linh Thú:</span>
                        <span className="font-bold text-rose-300">{petLevel >= 100 ? 'MAX' : `Cấp ${petLevel} / 100`}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                        <span className="text-amber-400">Tỉ lệ Chí Mạng Linh Thú:</span>
                        <span className="font-bold text-amber-300">+{critRatePct}% Crit 🎯</span>
                      </div>
                      {petCritDmgPct > 0 && (
                        <div className="flex justify-between items-center pt-0.5">
                          <span className="text-red-400">Sát thương Chí Mạng Linh Thú:</span>
                          <span className="font-bold text-red-300">+{petCritDmgPct.toLocaleString()}% ST Crit 💥</span>
                        </div>
                      )}
                    </>
                  )}

                  {category === 'shoes' && (() => {
                    const agi = Number(item.agility || item.base_agility || 300);
                    return (
                      <>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                          <span className="text-slate-400">Tốc độ đánh Boss:</span>
                          <span className="font-bold text-pink-300 text-xs">+{agi.toLocaleString()} Tốc Độ ⚡</span>
                        </div>
                        <div className="text-[10px] text-slate-400 italic pt-0.5">
                          * Giúp người chơi xuất chiêu cực nhanh, chiếm ưu thế đòn đánh khi săn Boss Thế Giới!
                        </div>
                      </>
                    );
                  })()}

                  {category === 'hat' && (() => {
                    const hPlus = Number(item.plus || 0);
                    const hEnhMult = 1.0 + 0.25 * hPlus;
                    const basePen = Number(item.base_armor_pen_pct || 300);
                    const baseReduc = Number(item.base_dmg_reduction_pct || 300);
                    const baseDefPct = Number(item.base_def_pct || 3000);
                    const totPen = Math.round(basePen * hEnhMult);
                    const totReduc = Math.round(baseReduc * hEnhMult);
                    const totDefPct = Math.round(baseDefPct * hEnhMult);
                    const hSkillLvl = Number(item.skill_level || 0) || (item.tier?.toLowerCase().includes('huyền thoại') ? 1 : 0);
                    const hSkillProc = Number(item.skill_proc_rate || 0) || (item.tier?.toLowerCase().includes('huyền thoại') ? 0.01 : 0);
                    const hSkillPct = Math.round(hSkillProc * 100);
                    return (
                      <>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                          <span className="text-slate-400">Xuyên Giáp & Giảm ST:</span>
                          <span className="font-bold text-rose-300 text-xs">+{totPen.toLocaleString()}% / +{totReduc.toLocaleString()}%</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                          <span className="text-slate-400">Tăng Phòng Thủ (DEF):</span>
                          <span className="font-bold text-cyan-300 text-xs">+{totDefPct.toLocaleString()}% DEF</span>
                        </div>
                        {(hSkillPct > 0 || hSkillLvl > 0) && (
                          <div className="flex justify-between items-center py-0.5 border-b border-slate-800/50">
                            <span className="text-amber-400 font-bold">Kỹ Năng Miễn Nhiễm:</span>
                            <span className="font-black text-amber-300 text-xs">Lv.{hSkillLvl || 1} (Tỉ lệ: {hSkillPct || 1}%) 🛡️</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 italic pt-0.5">
                          * Bảo vật nón tối thượng mang lại khả năng miễn nhiễm sát thương và phòng thủ siêu cấp!
                        </div>
                      </>
                    );
                  })()}
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
                ) : category === 'pants' ? (
                  <div>• Gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-bold font-mono">/dap quan</code> (hoặc <code>mdap quan</code> / <code>/cuonghoa</code>) trên <strong>Live TikTok</strong> hoặc <strong>Discord</strong> để cường hóa tăng cấp (+plus).</div>
                ) : category === 'necklace' ? (
                  <div>• Gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold font-mono">/dap chuyen</code> (hoặc <code>mdap chuyen</code> / <code>/cuonghoa</code>) trên <strong>Live TikTok</strong> hoặc <strong>Discord</strong> để cường hóa tăng cấp (+plus).</div>
                ) : category === 'ring' ? (
                  <div>• Dùng <strong>Viên Tăng Bậc & Xu</strong>, gõ lệnh <code className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-bold font-mono">/dap nhan</code> (hoặc <code>mdap nhan</code> / <code>/cuonghoa</code>) để Tăng Sao & Tăng Bậc. Để nâng Kỹ Năng nhẫn, dùng <strong>Đá Nâng Kĩ Năng</strong> gõ <code className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-bold font-mono">/cuonghoa nhan skill</code>.</div>
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

  const renderBossBody = () => {
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
            Hệ thống tự động chuyển thẳng <strong className="text-amber-400">Lượt Đánh, Rương Hoàng Kim, Rương Boss, Xu Nâng Cấp & Trang Bị Thần Binh</strong> vào tài khoản game của bạn ngay khi bấm Mua. Loa Livestream sẽ tự động đọc tên cảm ơn và hiệu ứng nạp VIP sẽ phát sáng rực rỡ!
          </p>

          {/* KHU VỰC LIÊN KẾT TÀI KHOẢN & THÔNG TIN NHÂN VẬT GAME */}
          <div className="w-full max-w-3xl mx-auto">
            {bossPlayerSummary ? (
              /* 1. KHÁCH ĐÃ LIÊN KẾT: HÌNH 1 (THÔNG TIN NHÂN VẬT + NÚT TÚI ĐỒ & PROFILE) */
              <div className="bg-gradient-to-r from-[#0B1120] via-[#151D2F] to-[#0B1120] border-2 border-emerald-500/50 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-md text-left animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-2 bg-gradient-to-l from-emerald-500/20 to-transparent w-48 h-16 pointer-events-none blur-xl"></div>

                {/* Badge Đã liên kết theo nền tảng & Dãy nút hành động */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                  {/* Badge trạng thái liên kết động theo từng mảng */}
                  {isDiscordLinked && isTikTokLinked ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>✓ ĐÃ LIÊN KẾT CẢ DISCORD & TIKTOK LIVE VĨNH VIỄN</span>
                    </div>
                  ) : isDiscordLinked ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/50 text-[#9bb0ff] font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(88,101,242,0.3)]">
                      <CheckCircle2 size={15} className="text-indigo-400" />
                      <span>✓ ĐÃ LIÊN KẾT TÀI KHOẢN DISCORD VĨNH VIỄN</span>
                    </div>
                  ) : isTikTokLinked ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                      <CheckCircle2 size={15} className="text-rose-400" />
                      <span>✓ ĐÃ LIÊN KẾT TÀI KHOẢN TIKTOK LIVE VĨNH VIỄN</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>✓ ĐÃ LIÊN KẾT TÀI KHOẢN GAME VĨNH VIỄN</span>
                    </div>
                  )}

                  {/* Dãy nút liên kết tự xác nhận: ẩn nút nếu nền tảng đó đã được liên kết */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!isDiscordLinked && (
                      <button
                        type="button"
                        onClick={() => handleGenerateLinkOtp('discord')}
                        className="px-3.5 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(88,101,242,0.4)] hover:scale-105 active:scale-95"
                        title="Bấm để lấy mã OTP 6 số liên kết Discord"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 127.14 96.36">
                          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
                        </svg>
                        <span>🎮 Liên Kết Discord (OTP)</span>
                      </button>
                    )}

                    {!isTikTokLinked && (
                      <button
                        type="button"
                        onClick={() => handleGenerateLinkOtp('tiktok')}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.35)] hover:scale-105 active:scale-95"
                        title="Bấm để lấy mã OTP 6 số liên kết TikTok Lives"
                      >
                        <span className="text-sm">🎵</span>
                        <span>Liên Kết TikTok Lives (OTP)</span>
                      </button>
                    )}

                    {isDiscordLinked && isTikTokLinked && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>Đã liên kết đủ 2 nền tảng</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  {/* Thông tin nhân vật */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img
                        src={bossPlayerSummary.avatar_url || currentUser?.avatar_url || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(bossPlayerSummary.user_id)}`}
                        alt="Avatar"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = currentUser?.avatar_url || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(bossPlayerSummary.user_id || 'player')}`;
                        }}
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
                        <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg" title="Điểm Vinh Dự Chiến Trường (PvP)">
                          🏆 {new Intl.NumberFormat('vi-VN').format(bossPlayerSummary.honor_points || 0)} Vinh Dự
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Các Nút hành động: Túi Đồ, Sàn Đấu Giá, Xem Profile & Nút OTP */}
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

                    <button
                      type="button"
                      onClick={() => setShowForgeModal(true)}
                      className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-amber-400/50"
                      title="Mở Xưởng Rèn Long Tộc để chuyển cấp cường hóa giữa 2 trang bị"
                    >
                      <span className="text-base leading-none">🔨</span>
                      <span>Chuyển Cấp Lò Rèn</span>
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
                  /* 2. KHÁCH CHƯA LIÊN KẾT: THÔNG BÁO BẮT BUỘC LIÊN KẾT ĐỂ NẠP DỄ DÀNG & KÍCH HOẠT LÒ RÈN */
                  <div className="bg-gradient-to-br from-[#151D2F] via-[#1A233A] to-[#0B1120] border-2 border-amber-500/60 rounded-2xl p-5 md:p-6 shadow-[0_0_35px_rgba(245,158,11,0.2)] backdrop-blur-md text-center animate-fade-in relative overflow-hidden h-full flex flex-col justify-between">
                    <div>
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
                        <Zap size={28} />
                      </div>

                      <h3 className="text-lg sm:text-xl font-black uppercase text-white mb-2 tracking-tight">
                        ⚠️ BẠN CHƯA LIÊN KẾT TÀI KHOẢN GAME!
                      </h3>
                      <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-4 leading-relaxed">
                        Hãy liên kết tài khoản web với nhân vật game qua <strong className="text-amber-400">mã OTP an toàn</strong> để tự động nạp 1-chạm, đồng thời kích hoạt tính năng <strong className="text-cyan-300">Lò Rèn Long Tộc chuyển cấp</strong> và mở túi đồ trực tiếp trên web!
                      </p>
                    </div>

                    <div>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleGenerateLinkOtp('discord')}
                          disabled={isGeneratingOtp}
                          className="w-full sm:w-auto px-5 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(88,101,242,0.45)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 127.14 96.36">
                            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
                          </svg>
                          <span>🎮 LIÊN KẾT DISCORD</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateLinkOtp('tiktok')}
                          disabled={isGeneratingOtp}
                          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <span className="text-base">🎵</span>
                          <span>LIÊN KẾT TIKTOK LIVES</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowForgeModal(true)}
                          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                          title="Mở Xưởng Rèn Long Tộc chuyển cấp cường hóa"
                        >
                          <span className="text-base">🔨</span>
                          <span>CHUYỂN CẤP LÒ RÈN</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-3">
                        🔒 Chỉ cần xác nhận 1 lần duy nhất bằng mã OTP an toàn.
                      </p>
                    </div>
                  </div>
                )}
          </div>
        </div>

        {/* Ô THAM GIA SERVER DISCORD ĐỂ CHƠI GAME TẠI ĐÂY */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#5865F2]/50 bg-gradient-to-r from-[#171933] via-[#1a1f3d] to-[#12162a] p-5 sm:p-6 mb-8 shadow-[0_0_35px_rgba(88,101,242,0.25)] flex flex-col md:flex-row items-center justify-between gap-5 transition-all hover:border-[#5865F2] hover:shadow-[0_0_45px_rgba(88,101,242,0.35)]">
          <div className="absolute top-0 right-0 w-80 h-32 bg-[#5865F2]/10 blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-4 text-left w-full md:w-auto relative z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#404eed] flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(88,101,242,0.7)] border border-indigo-300/30 animate-pulse">
              <DiscordIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#5865F2]/25 border border-[#5865F2]/50 text-indigo-300">
                  🎮 CỘNG ĐỒNG SĂN BOSS DISCORD 24/7
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> BOT ĐANG HOẠT ĐỘNG
                </span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                Tham Gia Server Discord Để Chơi Game Tại Đây
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Chiến Boss Mộng Thiên Huyễn 24/7, gõ lệnh PK chiến đấu, mở rương nhận trang bị khủng & giao lưu cùng anh em đại hiệp trên Discord!
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

        {/* BANNER ĐẾM NGƯỢC SỰ KIỆN 11.11 X2 */}
        {(() => {
          const isEvent1111 = event1111Now >= EVENT_1111_START_MS && event1111Now < EVENT_1111_END_MS;
          if (!isEvent1111) return null;
          const rem = Math.max(0, EVENT_1111_END_MS - event1111Now);
          const d = Math.floor(rem / (1000 * 60 * 60 * 24));
          const h = Math.floor((rem / (1000 * 60 * 60)) % 24);
          const m = Math.floor((rem / (1000 * 60)) % 60);
          const s = Math.floor((rem / 1000) % 60);
          return (
            <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border-2 border-amber-400/80 p-4 md:p-6 shadow-[0_0_35px_rgba(245,158,11,0.35)]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0 text-2xl shadow-inner">
                    🔥
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-red-500 text-black font-black text-xs uppercase tracking-wider shadow">
                        SIÊU SỰ KIỆN 11.11
                      </span>
                      <span className="text-amber-300 font-extrabold text-xs">00:00 11/11 → 23:59 13/11</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-white mt-0.5">
                      NHÂN ĐÔI TOÀN BỘ TÀI NGUYÊN NẠP GÓI <span className="text-yellow-400 underline decoration-amber-400">X2 GIÁ TRỊ</span>
                    </h3>
                    <p className="text-xs text-amber-200/90 mt-0.5">
                      x2 Xu Game VIP, x2 Rương Hoàng Kim, x2 Rương Boss, x2 Lượt Đánh (Giá nạp và Nhẫn giữ nguyên)!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-400/40 shadow-lg">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold mr-1">
                    <Clock size={16} className="text-amber-400" />
                    <span>HẾT HẠN SAU:</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-center">
                    <div className="bg-slate-900/90 px-2 py-1 rounded border border-amber-400/30">
                      <span className="text-base font-black text-amber-300">{String(d).padStart(2, '0')}</span>
                      <span className="text-[9px] block text-slate-400">NGÀY</span>
                    </div>
                    <span className="text-amber-400 font-bold">:</span>
                    <div className="bg-slate-900/90 px-2 py-1 rounded border border-amber-400/30">
                      <span className="text-base font-black text-amber-300">{String(h).padStart(2, '0')}</span>
                      <span className="text-[9px] block text-slate-400">GIỜ</span>
                    </div>
                    <span className="text-amber-400 font-bold">:</span>
                    <div className="bg-slate-900/90 px-2 py-1 rounded border border-amber-400/30">
                      <span className="text-base font-black text-amber-300">{String(m).padStart(2, '0')}</span>
                      <span className="text-[9px] block text-slate-400">PHÚT</span>
                    </div>
                    <span className="text-amber-400 font-bold">:</span>
                    <div className="bg-slate-900/90 px-2 py-1 rounded border border-amber-400/30">
                      <span className="text-base font-black text-amber-300">{String(s).padStart(2, '0')}</span>
                      <span className="text-[9px] block text-slate-400">GIÂY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* GRID 8 GÓI NẠP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BOSS_GAME_PACKAGES.map((pkg) => {
            const isEvent1111 = event1111Now >= EVENT_1111_START_MS && event1111Now < EVENT_1111_END_MS;
            const hasRing = pkg.items && pkg.items.length > 0;
            const baseBossChests = pkg.bossChests || (pkg.royalChests ? pkg.royalChests * 100 : 0);
            const coinsVal = isEvent1111 ? pkg.coins * EVENT_1111_MULT : pkg.coins;
            const royalVal = isEvent1111 ? pkg.royalChests * EVENT_1111_MULT : pkg.royalChests;
            const bossVal = isEvent1111 ? baseBossChests * EVENT_1111_MULT : baseBossChests;
            const attacksVal = isEvent1111 ? pkg.attacks * EVENT_1111_MULT : pkg.attacks;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl bg-[#151D2F] border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1.5 ${hasRing
                    ? 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]'
                    : 'border-slate-800 hover:border-slate-600 shadow-xl'
                  }`}
              >
                {/* BADGE KHUYẾN MÃI / LOẠI GÓI */}
                <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
                  {isEvent1111 && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-black bg-gradient-to-r from-yellow-300 via-amber-400 to-red-500 shadow-[0_0_12px_rgba(250,204,21,0.7)] animate-pulse font-mono tracking-wider">
                      🔥 x2 11.11
                    </span>
                  )}
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

                        {/* SỐ LƯỢNG x1 NẰM Ở GÓC NGOÀI (GÓI 7 & 8 KHÔNG NHÂN NHẪN) */}
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
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-black text-amber-300 drop-shadow">
                              +{new Intl.NumberFormat('vi-VN').format(coinsVal)} XU GAME
                            </span>
                            {isEvent1111 && (
                              <span className="text-[11px] line-through text-slate-400 font-bold">
                                {new Intl.NumberFormat('vi-VN').format(pkg.coins)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-amber-200 bg-amber-500/30 px-2 py-0.5 rounded-md border border-amber-400/30 whitespace-nowrap">
                        VIP
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-200 font-semibold px-1">
                      <Crown size={15} className="text-yellow-400 shrink-0" />
                      <span>
                        +{royalVal} Rương Hoàng Kim VIP
                        {isEvent1111 && (
                          <span className="text-xs line-through text-slate-400 ml-1.5">({pkg.royalChests})</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-300 font-semibold px-1">
                      <Package size={15} className="text-amber-400 shrink-0" />
                      <span>
                        +{new Intl.NumberFormat('vi-VN').format(bossVal)} Rương Boss (Tặng Kèm)
                        {isEvent1111 && (
                          <span className="text-xs line-through text-slate-400 ml-1.5">({new Intl.NumberFormat('vi-VN').format(baseBossChests)})</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200 font-semibold px-1">
                      <Swords size={15} className="text-rose-400 shrink-0" />
                      <span>
                        +{new Intl.NumberFormat('vi-VN').format(attacksVal)} Lượt Đánh Boss
                        {isEvent1111 && (
                          <span className="text-xs line-through text-slate-400 ml-1.5">({new Intl.NumberFormat('vi-VN').format(pkg.attacks)})</span>
                        )}
                      </span>
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
                    <CheckCircle2 size={13} /> {
                      isDiscordLinked && isTikTokLinked
                        ? 'Đã liên kết Discord & TikTok Live'
                        : isDiscordLinked
                        ? 'Đã liên kết Discord'
                        : isTikTokLinked
                        ? 'Đã liên kết TikTok Live'
                        : 'Đã liên kết vĩnh viễn'
                    }
                  </span>
                </div>
              </div>

              {/* Thông tin gói */}
              {(() => {
                const isEvent1111 = event1111Now >= EVENT_1111_START_MS && event1111Now < EVENT_1111_END_MS;
                const baseBossChests = selectedBossPackage.bossChests || (selectedBossPackage.royalChests ? selectedBossPackage.royalChests * 100 : 0);
                const coinsVal = isEvent1111 ? selectedBossPackage.coins * EVENT_1111_MULT : selectedBossPackage.coins;
                const royalVal = isEvent1111 ? selectedBossPackage.royalChests * EVENT_1111_MULT : selectedBossPackage.royalChests;
                const bossVal = isEvent1111 ? baseBossChests * EVENT_1111_MULT : baseBossChests;
                const attacksVal = isEvent1111 ? selectedBossPackage.attacks * EVENT_1111_MULT : selectedBossPackage.attacks;

                return (
                  <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold text-sm">{selectedBossPackage.name}</span>
                        {isEvent1111 && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-black bg-gradient-to-r from-yellow-300 via-amber-400 to-red-500 shadow-[0_0_12px_rgba(250,204,21,0.7)] animate-pulse font-mono tracking-wider">
                            🔥 x2 11.11
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-400 font-black text-sm">
                        {new Intl.NumberFormat('vi-VN').format(selectedBossPackage.price)}đ
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1.5">
                      <p className="text-amber-300 font-black text-sm pb-1 border-b border-amber-500/20 flex items-center gap-2">
                        <span className="text-base leading-none">🪙</span>
                        <span>+{new Intl.NumberFormat('vi-VN').format(coinsVal)} Xu Game (Tiền Tệ Quý Mua Đồ Shop)</span>
                        {isEvent1111 && (
                          <span className="text-[11px] line-through text-slate-400 font-bold ml-1">
                            {new Intl.NumberFormat('vi-VN').format(selectedBossPackage.coins)}
                          </span>
                        )}
                      </p>
                      <p>
                        • +{royalVal} Rương Hoàng Kim VIP
                        {isEvent1111 && (
                          <span className="text-xs line-through text-slate-400 ml-1.5">({selectedBossPackage.royalChests})</span>
                        )}
                      </p>
                      <p className="text-amber-300 font-bold">
                        • +{new Intl.NumberFormat('vi-VN').format(bossVal)} Rương Boss Chiến Tích (Tặng kèm)
                        {isEvent1111 && (
                          <span className="text-xs line-through text-slate-400 ml-1.5">({new Intl.NumberFormat('vi-VN').format(baseBossChests)})</span>
                        )}
                      </p>
                      <p>
                        • +{new Intl.NumberFormat('vi-VN').format(attacksVal)} Lượt Đánh Boss
                        {isEvent1111 && (
                          <span className="text-xs line-through text-slate-400 ml-1.5">({new Intl.NumberFormat('vi-VN').format(selectedBossPackage.attacks)})</span>
                        )}
                      </p>
                      {selectedBossPackage.items && selectedBossPackage.items.length > 0 && (
                        <p className="text-amber-300 font-bold">• 💥 Tặng kèm: x1 {selectedBossPackage.items[0].name} ({selectedBossPackage.items[0].stars}⭐)</p>
                      )}
                    </div>
                  </div>
                );
              })()}

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

      {/* HELPER TÍNH TOÁN FULL THUỘC TÍNH CHIẾN ĐẤU & SÁT THƯƠNG CHUẨN DISCORD / GAME_CORE */}
      {(() => {
        // Placeholder for inline helper attachment if needed
        return null;
      })()}

      {/* MODAL PROFILE & TRANG BỊ NGƯỜI CHƠI (GIỐNG DASHBOARD ADMIN) */}
      {showBossProfileModal && bossPlayerSummary && (() => {
        const p = bossPlayerSummary;
        const lvl = Number(p.level || 1);
        const exp = Number(p.exp || 0);
        const expNeeded = Math.floor(500 * Math.pow(2, Math.max(0, lvl - 1)));
        const expPct = Math.min(100, Math.max(0, (exp / Math.max(1, expNeeded)) * 100));

        // Tính toán Full Combat Stats bằng công thức chuẩn Discord SSOT
        const st = calculatePlayerFullStats(p);
        const allAttack = st.totalAttack;

        const renderEquipSlot = (item, category, defaultIcon, defaultTitle, slotCmd = '') => {
          if (!item || !item.name) {
            return (
              <div className="bg-[#0F172A]/70 border border-dashed border-slate-700/80 rounded-2xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1 border-b border-white/5 w-full">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">{defaultIcon} {defaultTitle}</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{slotCmd}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-dashed border-slate-600 flex items-center justify-center text-xl shrink-0 text-slate-500">
                    {defaultIcon}
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-bold">{defaultTitle}</div>
                    <div className="text-slate-600 text-[11px] italic">Chưa trang bị</div>
                  </div>
                </div>
              </div>
            );
          }

          const tier = getBossTierStyle(item.tier);
          const plusText = (item.plus && item.plus > 0) ? ` +${item.plus}` : '';
          const isShoes = (category === 'shoes') || String(item.category || '').toLowerCase() === 'shoes' || String(item.name || '').toLowerCase().includes('giày');
          const isHat = (category === 'hat') || String(item.category || '').toLowerCase() === 'hat' || String(item.name || '').toLowerCase().includes('nón') || String(item.name || '').toLowerCase().includes('mũ');
          const isRing = (category === 'ring');
          const isPet = (category === 'pet');
          const isHT = (isShoes || isHat) && (String(item.tier || '').toLowerCase().includes('huyền thoại') || String(item.tier || '').toLowerCase().includes('legendary') || String(item.name || '').toLowerCase().includes('thần tốc') || String(item.name || '').toLowerCase().includes('huyền thoại'));
          const isThuongCo = String(item.tier || '').toLowerCase().includes('thượng cổ') || String(item.name || '').toLowerCase().includes('bá vương') || String(item.name || '').toLowerCase().includes('nữ oa') || String(item.name || '').toLowerCase().includes('bát hoang') || String(item.name || '').toLowerCase().includes('vô cực');

          const cardBorder = isThuongCo ? 'rgba(236, 72, 153, 0.65)' : (isHT ? '#ffd700' : tier.border);

          return (
            <div
              className="rounded-2xl p-3 sm:p-3.5 flex items-start gap-3 sm:gap-3.5 relative transition-all duration-200 cursor-pointer hover:border-cyan-400/70 group"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(20, 28, 48, 0.92))',
                border: `1.5px solid ${cardBorder}`,
                boxShadow: `0 4px 15px rgba(0,0,0,0.4)`
              }}
              onMouseEnter={(e) => showItemTooltip(item, e, category)}
              onMouseMove={updateItemTooltipPos}
              onMouseLeave={hideItemTooltip}
              onClick={(e) => handleItemCardClick(item, e, category)}
            >
              {renderUniversalItemThumb(item, category, { sizeClass: 'w-16 h-16 sm:w-[72px] sm:h-[72px]', imgSizeClass: 'w-12 h-12 sm:w-[54px] sm:h-[54px]', defaultIcon })}

              <div className="flex-1 min-w-0 flex flex-col justify-start">
                <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-white/5 w-full">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">{defaultIcon} {defaultTitle}</span>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">{slotCmd}</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="font-extrabold text-xs sm:text-sm leading-snug" style={{ color: tier.color }} title={item.name}>
                      {item.name}{isRing || isPet ? '' : plusText}
                    </span>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0"
                      style={{ color: tier.color, background: tier.bg, borderColor: tier.border }}
                    >
                      {tier.label}
                    </span>
                    {!isShoes && !isHat && !isPet && (item.stars || 1) > 0 && (
                      <span className="text-[9px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                        {Math.max(1, Math.min(5, Number(item.stars || 1)))}⭐
                      </span>
                    )}
                  </div>
                  {/* Nút Tháo Trang Bị về Túi Đồ nếu đang xem profile của chính mình */}
                  {bossPlayerSummary && String(bossPlayerSummary.user_id).toLowerCase() === String(p.user_id).toLowerCase() && (
                    <button
                      type="button"
                      disabled={isPerformingBagAction}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecuteBagAction('unequip', item, category);
                      }}
                      className="px-2 py-0.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 rounded-lg text-[10.5px] font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0 ml-auto"
                      title={`Tháo ${defaultTitle} cất vào túi đồ`}
                    >
                      {isPerformingBagAction && bagActionLoadingItem === category ? <Loader2 size={10} className="animate-spin" /> : null}
                      <span>Tháo 📤</span>
                    </button>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-[10px]">
                  {category === 'weapon' && (() => {
                    const wStats = getWeaponStats(item);
                    const baseDmg = wStats.baseDmg;
                    const plusVal = Number(item.plus || 0);
                    const plusBonus = Math.round(baseDmg * plusVal * 0.25);
                    return (
                      <>
                        <span className="font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                          {baseDmg.toLocaleString()} DMG
                        </span>
                        {plusVal > 0 && (
                          <span className="font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1.5 py-0.5 rounded">
                            +{plusBonus.toLocaleString()} Cường Hóa
                          </span>
                        )}
                      </>
                    );
                  })()}
                  {category === 'armor' && (() => {
                    const bHp = Number(item.base_hp || (item.tier?.toLowerCase().includes('thượng cổ') ? 450000 : (item.tier?.toLowerCase().includes('cổ đại') ? 180000 : (item.tier?.toLowerCase().includes('tối thượng') ? 75000 : (item.tier?.toLowerCase().includes('thần thoại') ? 30000 : (item.tier?.toLowerCase().includes('epic') ? 12000 : 4500))))));
                    const bDef = Number(item.base_def || (item.tier?.toLowerCase().includes('thượng cổ') ? 45000 : (item.tier?.toLowerCase().includes('cổ đại') ? 18000 : (item.tier?.toLowerCase().includes('tối thượng') ? 7500 : (item.tier?.toLowerCase().includes('thần thoại') ? 3000 : (item.tier?.toLowerCase().includes('epic') ? 1200 : 450))))));
                    const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                    const totHp = Math.round(bHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                    const totDef = Math.round(bDef * (1 + 0.25 * (item.plus || 0)) * sMult);
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
                  {category === 'pants' && (() => {
                    const pStats = getPantsStats(item);
                    const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                    const totHp = Math.round(pStats.baseHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                    const totDef = Math.round(pStats.baseDef * (1 + 0.25 * (item.plus || 0)) * sMult);
                    return (
                      <>
                        <span className="font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                          ❤️ +{totHp.toLocaleString()} HP (+{pStats.hpPercent}%)
                        </span>
                        <span className="font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded">
                          🛡️ +{totDef.toLocaleString()} DEF (+{pStats.defPercent}%)
                        </span>
                      </>
                    );
                  })()}
                  {category === 'necklace' && (() => {
                    const nStats = getNecklaceStats(item);
                    return (
                      <span className="font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded">
                        +{nStats.dmgPercent}% DMG
                      </span>
                    );
                  })()}
                  {category === 'ring' && (() => {
                    const rStats = getRingStats(item);
                    const rStars = Math.max(1, Math.min(5, Number(item.stars || 1)));
                    const starMult = Math.pow(3, rStars - 1);
                    const totRingDmg = Math.round(rStats.baseDmgPercent * starMult);
                    const totRingHp = Math.round((rStats.baseHpPercent || rStats.baseDmgPercent) * starMult);
                    const totRingDef = Math.round((rStats.baseDefPercent || rStats.baseDmgPercent) * starMult);
                    const skPct = rStats.skillPct;
                    return (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-purple-400 bg-purple-400/10 border border-purple-400/30 px-1.5 py-0.5 rounded">
                          +{totRingDmg.toLocaleString()}% DMG
                        </span>
                        <span className="font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                          ❤️ +{totRingHp.toLocaleString()}% HP
                        </span>
                        <span className="font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded">
                          🛡️ +{totRingDef.toLocaleString()}% DEF
                        </span>
                        {skPct ? (
                          <span className="font-bold text-purple-300 bg-purple-500/20 border border-purple-400/40 px-1.5 py-0.5 rounded text-[10px]">
                            ⚡ Rút {skPct}% HP
                          </span>
                        ) : null}
                        {/* Luôn hiển thị thông tin phát động Kỹ Năng */}
                        <span className="font-bold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 rounded text-[10px]">
                          ⚡ {item.skill_level > 0 ? `Kỹ Năng Lv.${item.skill_level} (${getRingSkillProcStr(item)})` : `Tỉ Lệ: ${getRingSkillProcStr(item)}`}
                        </span>
                      </div>
                    );
                  })()}
                  {category === 'pet' && renderPetStatBadges(item)}
                  {category === 'shoes' && (() => {
                    const sTier = (item.tier || '').toLowerCase();
                    const sPlus = Number(item.plus || 0);
                    let baseAgi = Number(item.base_agility || (sTier.includes('huyền thoại') || sTier.includes('legendary') ? 300 : 80));
                    if ((sTier.includes('thường') || (item.name || '').toLowerCase().includes('thường')) && baseAgi < 80) baseAgi = 80;
                    let shoeBonusPct = 0;
                    const subs = item.sub_stats || [];
                    for (const sub of subs) {
                      if (sub && (sub.includes('Nhanh Nhẹn') || sub.includes('Nhanh Nhen') || sub.includes('Agility') || sub.includes('Tốc Độ'))) {
                        const m = sub.match(/(\d+)%/);
                        if (m) shoeBonusPct += parseInt(m[1], 10);
                      }
                    }
                    const enhanceBonusAgi = Math.round(baseAgi * sPlus * 0.25);
                    const baseWithPlus = baseAgi + enhanceBonusAgi;
                    const totAgi = Math.round(baseWithPlus * (1.0 + shoeBonusPct / 100.0));
                    return (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded">
                          🌪️ Cơ Bản: +{baseAgi.toLocaleString()} Tốc Độ
                        </span>
                        {enhanceBonusAgi > 0 && (
                          <span className="font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1.5 py-0.5 rounded">
                            +{enhanceBonusAgi.toLocaleString()} Cường Hóa
                          </span>
                        )}
                        {shoeBonusPct > 0 && (
                          <span className="font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded">
                            Tổng: +{shoeBonusPct}% Tốc Độ
                          </span>
                        )}
                        {totAgi > baseWithPlus && (
                          <span className="font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded" title="Tổng Tốc Độ thực tế đã kích hoạt các dòng phụ">
                            ⚡ Thực Chiến: +{totAgi.toLocaleString()} Tốc
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1.5 mt-1 border-t border-dashed border-yellow-400/25 text-[10px] w-full">
                          <span className="font-extrabold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                            ⚡ Tốc Độ: +{totAgi.toLocaleString()} (+{shoeBonusPct}% + 60% Set)
                          </span>
                          <span className="font-extrabold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.5 rounded">
                            🛡️ Né Đòn: 60.0%
                          </span>
                          <span className="font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            👑 Kháng: 100% (Miễn Nhiễm 👑)
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  {category === 'hat' && (() => {
                    const hPlus = Number(item.plus || 0);
                    const hEnhMult = 1.0 + 0.25 * hPlus;
                    const basePen = Number(item.base_armor_pen_pct || 300);
                    const baseReduc = Number(item.base_dmg_reduction_pct || 300);
                    const baseDefPct = Number(item.base_def_pct || 3000);
                    const totPen = Math.round(basePen * hEnhMult);
                    const totReduc = Math.round(baseReduc * hEnhMult);
                    const totDefPct = Math.round(baseDefPct * hEnhMult);
                    const hSkillLvl = Number(item.skill_level || 0) || ((isHT || Number(item.skill_proc_rate || 0) > 0) ? 1 : 0);
                    const hSkillProc = Number(item.skill_proc_rate || 0) || (isHT ? 0.01 : 0);
                    const hSkillPct = Math.round(hSkillProc * 100);
                    return (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded">
                          🗡️ +{totPen.toLocaleString()}% Xuyên Giáp
                        </span>
                        <span className="font-bold text-teal-400 bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.5 rounded">
                          🔰 +{totReduc.toLocaleString()}% Giảm ST
                        </span>
                        <span className="font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded">
                          🛡️ +{totDefPct.toLocaleString()}% DEF
                        </span>
                        {(hSkillPct > 0 || hSkillLvl > 0) && (
                          <span className="font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px]">
                            🛡️ Miễn Nhiễm: {hSkillPct || 1}% (Lv.{hSkillLvl || 1})
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Sub-stats */}
                {(() => {
                  let itemSubs = [];
                  if (Array.isArray(item.sub_stats)) itemSubs = item.sub_stats;
                  else if (typeof item.sub_stats === 'string' && item.sub_stats.trim()) {
                    try { const pJson = JSON.parse(item.sub_stats); if (Array.isArray(pJson)) itemSubs = pJson; else itemSubs = [item.sub_stats]; } catch { itemSubs = [item.sub_stats]; }
                  }
                  let itemStarSubs = [];
                  if (Array.isArray(item.star_sub_stats)) itemStarSubs = item.star_sub_stats;
                  else if (typeof item.star_sub_stats === 'string' && item.star_sub_stats.trim()) {
                    try { const pJson = JSON.parse(item.star_sub_stats); if (Array.isArray(pJson)) itemStarSubs = pJson; else itemStarSubs = [item.star_sub_stats]; } catch { itemStarSubs = [item.star_sub_stats]; }
                  }
                  const allSubs = Array.from(new Set([
                    ...itemSubs,
                    ...itemStarSubs
                  ].filter(Boolean)));
                  if (allSubs.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {allSubs.map((sub, sIdx) => {
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
                  <div className="relative shrink-0">
                    <img
                      src={p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.user_id)}`}
                      alt="Avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.user_id || 'player')}`;
                      }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-[2.5px] border-yellow-400 shadow-[0_0_16px_rgba(255,215,0,0.7)] object-cover bg-slate-900"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white font-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md border border-blue-400 shadow-[0_2px_8px_rgba(37,99,235,0.6)]">
                      Lv.{lvl}
                    </div>
                  </div>
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
                      {isDiscordLinked && isTikTokLinked ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white shadow-sm">
                          Discord & TikTok Live
                        </span>
                      ) : isDiscordLinked ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#5865F2] text-white shadow-sm">
                          Discord
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-rose-600 to-red-600 text-white">
                          TikTok Live [TT]
                        </span>
                      )}
                      {p.has_x2_rate && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                          👑 x2 TỈ LỆ VIP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {renderPvpRankHeaderBadge(p)}
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
              <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3 flex-1">
                {/* 1. THANH TÀI NGUYÊN (XU, LƯỢT, VINH DỰ) - CHUẨN ĐỒNG BỘ ẢNH 2 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs font-black text-yellow-300 shadow-sm">
                    <span className="text-sm">🪙</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(p.bonus_coins || 0)} Xu</span>
                  </div>
                  <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs font-black text-cyan-300 shadow-sm">
                    <span className="text-sm">⚔️</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(p.bonus_attacks || 0)} Lượt</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs font-black text-amber-400 shadow-sm">
                    <span className="text-sm">🏆</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(p.honor_points || 0)} Vinh Dự</span>
                  </div>
                </div>

                {/* 2. LỰC CHIẾN (CP) RỰC LỬA - CHUẨN ĐỒNG BỘ ẢNH 2 */}
                <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-2 border-orange-500 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-[0_0_20px_rgba(255,100,0,0.25)]">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-pulse">🔥</span>
                    <div>
                      <div className="text-[10.5px] font-black text-amber-400 uppercase tracking-wider">Lực Chiến (CP)</div>
                      <div className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_#ff4500] font-sans">
                        {new Intl.NumberFormat('vi-VN').format(st.displayCp)} CP
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
                      Bảng Xếp Hạng Server
                    </span>
                  </div>
                </div>

                {/* 3. KÍCH HOẠT HIỆU ỨNG SET ĐỒ (NẾU CÓ) */}
                {(() => {
                  const activeSets = getPlayerActiveSets(p);
                  if (!activeSets || activeSets.length === 0) return null;
                  return (
                    <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900/70 border border-amber-500/50 rounded-2xl p-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/30 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">👑</span>
                          <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                            Kích Hoạt Hiệu Ứng Set Đồ ({activeSets.length} Mốc)
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          Bộ 2 • 4 • 6 Món
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {activeSets.map((act, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-2 rounded-xl border bg-black/40 flex items-start gap-2.5"
                            style={{ borderColor: `${act.color}60` }}
                          >
                            <span
                              className="text-[10px] font-black px-2 py-0.5 rounded uppercase shrink-0 mt-0.5"
                              style={{ color: act.color, backgroundColor: `${act.color}20`, border: `1px solid ${act.color}40` }}
                            >
                              Set {act.count} Món
                            </span>
                            <div className="text-[11.5px] leading-snug font-bold text-slate-200">
                              <span style={{ color: act.color }}>{act.name}: </span>
                              <span className="text-amber-200">{act.desc.replace(/^.*?:\s*/, '')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 4. HÀNG 2 CỘT: KINH NGHIỆM (EXP) & SÁT THƯƠNG (ALL DMG) - CHUẨN ẢNH 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Level & EXP Bar */}
                  <div className="bg-[#0B101B]/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Kinh Nghiệm (EXP)
                      </span>
                      <span className="font-bold text-slate-400 font-mono text-[11px]">
                        {exp.toLocaleString()} / {expNeeded.toLocaleString()} ({expPct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_#00e5ff] transition-all duration-500"
                        style={{ width: `${expPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Sát Thương (All DMG) */}
                  <div className="bg-gradient-to-r from-orange-600/20 to-red-600/15 border border-orange-500/60 rounded-xl p-3 flex flex-col justify-center shadow-[0_0_15px_rgba(255,69,0,0.2)]">
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1">
                      ⚔️ Sát Thương (All DMG)
                    </div>
                    <div className="flex items-baseline gap-1.5 font-black">
                      <span className="text-base text-amber-400">⚡</span>
                      <span className="text-xl sm:text-2xl text-white drop-shadow-[0_0_10px_#ff2200]">
                        {new Intl.NumberFormat('vi-VN').format(allAttack)}
                      </span>
                      <span className="text-xs text-amber-400 font-bold">DMG</span>
                    </div>
                  </div>
                </div>

                {/* 5. KHUÔN 8 Ô TRANG BỊ CỐ ĐỊNH CHUẨN ĐỒNG BỘ 100% ẢNH 2 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                      🛡️ Trang Bị & Thần Binh Đang Mặc (8 Ô)
                    </span>
                    <span className="text-[10.5px] text-slate-500 italic hidden sm:inline">
                      Chi tiết sao, cường hóa, nhẫn & thuộc tính phụ
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* HÀNG 1: VŨ KHÍ & ÁO GIÁP */}
                    {renderEquipSlot(p.weapon, 'weapon', '⚔️', 'Vũ Khí', '/dap khi')}
                    {renderEquipSlot(p.armor, 'armor', '🛡️', 'Áo Giáp', '/dap giap')}

                    {/* HÀNG 2: QUẦN CHIẾN & DÂY CHUYỀN */}
                    {renderEquipSlot(p.pants, 'pants', '👖', 'Quần Chiến', '/dap quan')}
                    {renderEquipSlot(p.necklace, 'necklace', '📿', 'Dây Chuyền', '/dap chuyen')}

                    {/* HÀNG 3: NHẪN THẦN BINH & LINH THÚ */}
                    {renderEquipSlot(p.ring, 'ring', '💍', 'Nhẫn Thần Binh', '/dap nhan')}
                    {renderEquipSlot(p.pet, 'pet', '🐾', 'Linh Thú', '/feed')}

                    {/* HÀNG 4: BẢO VẬT ĐÔI GIÀY & BẢO VẬT NÓN */}
                    {renderEquipSlot(p.shoes, 'shoes', '👟', 'Bảo Vật Đôi Giày', '/dap giay')}
                    {renderEquipSlot(p.hat, 'hat', '👑', 'Bảo Vật Nón', '/dap non')}
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

      {/* MODAL STAT CHI TIẾT THUỘC TÍNH CHIẾN ĐẤU (HP, CÔNG, THỦ, CRIT) - CHUẨN DISCORD / TIKTOK LIVE OBS */}
      {showBossStatModal && bossPlayerSummary && (() => {
        const p = bossPlayerSummary;
        const lvl = Number(p.level || 1);
        const st = calculatePlayerFullStats(p);
        const isDead = Boolean(p.is_dead) || st.currentHp <= 0;

        let potionCount = Number(p.potions !== undefined ? p.potions : 0);
        let reviveCount = Number(p.revives !== undefined ? p.revives : 0);
        if (p.inventory && Array.isArray(p.inventory) && (p.potions === undefined || p.revives === undefined)) {
          potionCount = 0;
          reviveCount = 0;
          for (const it of p.inventory) {
            const id = String(it.id || '').toLowerCase();
            const name = String(it.name || '').toLowerCase();
            const cat = String(it.category || '').toLowerCase();
            const qty = Number(it.quantity || 1) || 1;
            if (id === 'item_health_potion' || name.includes('huyết dược') || name.includes('bình máu') || cat === 'potion') {
              potionCount += qty;
            } else if (id === 'item_revive_amulet' || name.includes('phục sinh') || name.includes('hồi sinh') || cat === 'revive') {
              reviveCount += qty;
            }
          }
        }

        return (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setShowBossStatModal(false); }}
          >
            <div
              className="w-full max-w-2xl max-h-[92vh] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col relative text-white animate-zoom-in overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #110e26 0%, #070512 100%)',
                border: '2px solid #00e5ff',
                boxShadow: '0 20px 50px rgba(0, 229, 255, 0.35), inset 0 0 25px rgba(0, 229, 255, 0.18)'
              }}
            >
              {/* HEADER: THÔNG TIN TƯỚNG & LỰC CHIẾN TỔNG (CHUẨN DISCORD) */}
              <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-cyan-500/25 shrink-0 gap-2 flex-wrap">
                {/* LEFT: AVATAR & IDENTITY */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.user_id)}`}
                      alt="Avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.user_id || 'player')}`;
                      }}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border-[2.2px] border-[#00e5ff] shadow-[0_0_16px_rgba(0,229,255,0.7)] object-cover bg-slate-900"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md border border-blue-400 shadow-[0_2px_6px_rgba(0,0,0,0.6)] font-sans">
                      Lv.{lvl}
                    </div>
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-base sm:text-lg text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)] truncate max-w-[170px] sm:max-w-[240px]">
                        {p.nickname}
                      </span>
                      {isDead && (
                        <span className="text-[10px] font-black text-red-400 bg-red-500/20 border border-red-500/60 rounded px-1.5 py-0.5 shrink-0">
                          💀 GỤC NGÃ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-yellow-300 bg-yellow-400/15 border border-yellow-400/50 rounded px-2 py-0.5">
                        {p.title || '⚔️ Chiến Thần'}
                      </span>
                      <span className="text-[10.5px] text-cyan-400/80 font-mono truncate">
                        @{p.user_id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: LỰC CHIẾN CP HERO BOX & ACTIONS (CHUẨN DISCORD) */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* HERO BOX CP */}
                  <div
                    className="rounded-xl px-3 py-1.5 text-right shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22), rgba(236, 72, 153, 0.15))',
                      border: '1.5px solid rgba(192, 132, 252, 0.6)',
                      boxShadow: '0 0 14px rgba(168, 85, 247, 0.25)'
                    }}
                  >
                    <div className="text-[9.5px] font-extrabold text-purple-200 tracking-wider uppercase">
                      👑 LỰC CHIẾN (CP)
                    </div>
                    <div className="text-base sm:text-lg font-black text-fuchsia-300 drop-shadow-[0_0_12px_rgba(240,171,252,0.85)] font-sans whitespace-nowrap mt-0.5">
                      {new Intl.NumberFormat('vi-VN').format(st.displayCp)} <span className="text-xs text-purple-300 font-extrabold">CP</span>
                    </div>
                  </div>

                  {renderPvpRankHeaderBadge(p)}

                  <button
                    type="button"
                    onClick={() => { setShowBossStatModal(false); setShowBossProfileModal(true); }}
                    className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl border border-indigo-400/50 shadow flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 shrink-0"
                    title="Chuyển sang xem Profile & Trang Bị"
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

              {/* SCROLLABLE CONTENT */}
              <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2.5 flex-1">
                {/* 1. SINH MỆNH (HP) & VẬT PHẨM SINH TỒN (CHUẨN DISCORD) */}
                <div
                  className="rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2 shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(153, 27, 27, 0.3))',
                    border: '1.5px solid rgba(239, 68, 68, 0.65)',
                    boxShadow: '0 0 18px rgba(239, 68, 68, 0.25)'
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* HP Label & Pct */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm">❤️</span>
                      <span className="text-xs font-black text-rose-200 tracking-wider uppercase">SINH MỆNH (HP)</span>
                      <span className="text-[11px] font-extrabold text-rose-200 bg-red-500/30 border border-red-500/50 px-2 py-0.5 rounded-md">
                        {st.hpPct.toFixed(1)}%
                      </span>
                    </div>
                    {/* Vật phẩm sinh tồn */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-red-500/25 border border-red-500/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                        <span className="text-xs">🧪</span>
                        <span className="text-[11px] text-rose-300 font-bold">Máu:</span>
                        <span className="text-xs font-black text-white">{potionCount.toLocaleString()} Bình</span>
                      </div>
                      <div className="bg-amber-500/25 border border-amber-500/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-[0_0_8px_rgba(234,179,8,0.2)]">
                        <span className="text-xs">✨</span>
                        <span className="text-[11px] text-yellow-300 font-bold">Hồi Sinh:</span>
                        <span className="text-xs font-black text-white">{reviveCount.toLocaleString()} Bùa</span>
                      </div>
                    </div>
                  </div>

                  {/* HP Large Numbers */}
                  <div className="text-center text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow-[0_0_14px_rgba(239,68,68,0.95)] font-sans">
                    {new Intl.NumberFormat('vi-VN').format(st.currentHp)} <span className="text-sm font-bold text-slate-400">/</span> {new Intl.NumberFormat('vi-VN').format(st.maxHp)}
                  </div>

                  {/* HP Bar */}
                  <div className="w-full h-2.5 bg-black/65 rounded-full overflow-hidden border border-red-500/45 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#ef4444] to-[#f43f5e] rounded-full shadow-[0_0_10px_#ef4444] transition-all duration-300"
                      style={{ width: `${st.hpPct}%` }}
                    />
                  </div>
                </div>

                {/* 2. CÁC KHỐI THUỘC TÍNH CHIẾN ĐẤU CHI TIẾT (CHUẨN DISCORD 8 Ô) */}
                {/* HÀNG 1: CÔNG KÍCH & SÁT THƯƠNG (4 KHỐI) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* 1. TẤN CÔNG */}
                  <div
                    className="rounded-xl p-2.5 flex flex-col justify-between"
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1.5px solid rgba(16, 185, 129, 0.5)',
                      boxShadow: '0 0 12px rgba(16, 185, 129, 0.18)'
                    }}
                  >
                    <div className="text-[10px] font-extrabold text-[#34d399] tracking-wider uppercase flex items-center gap-1">
                      <span>⚔️</span> TẤN CÔNG
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-black text-[#00ffaa] drop-shadow-[0_0_10px_rgba(0,255,170,0.6)] font-sans my-0.5 truncate" title={`${new Intl.NumberFormat('vi-VN').format(st.totalAttack)} DMG`}>
                      {new Intl.NumberFormat('vi-VN').format(st.totalAttack)} DMG
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      Sát thương / đòn
                    </div>
                  </div>

                  {/* 2. XUYÊN GIÁP */}
                  <div
                    className="rounded-xl p-2.5 flex flex-col justify-between"
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1.5px solid rgba(245, 158, 11, 0.5)',
                      boxShadow: '0 0 12px rgba(245, 158, 11, 0.18)'
                    }}
                  >
                    <div className="text-[10px] font-extrabold text-[#fbbf24] tracking-wider uppercase flex items-center gap-1">
                      <span>🏹</span> XUYÊN GIÁP
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-black text-[#fde047] drop-shadow-[0_0_10px_rgba(253,224,71,0.6)] font-sans my-0.5 truncate">
                      {st.armorPenDisplay}%
                    </div>
                    <div className="text-[9.5px] text-[#fef08a] truncate">
                      Đục Giảm ST • Max 70% DEF
                    </div>
                  </div>

                  {/* 3. CHÍ MẠNG */}
                  <div
                    className="rounded-xl p-2.5 flex flex-col justify-between"
                    style={{
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1.5px solid rgba(244, 63, 94, 0.5)',
                      boxShadow: '0 0 12px rgba(244, 63, 94, 0.18)'
                    }}
                  >
                    <div className="text-[10px] font-extrabold text-[#fb7185] tracking-wider uppercase flex items-center gap-1">
                      <span>⚡</span> CHÍ MẠNG
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-black text-[#ff0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.6)] font-sans my-0.5 truncate">
                      {st.rawCritPct}%
                    </div>
                    <div className="text-[9.5px] text-[#fda4af] truncate">
                      Thực: {st.effectiveCritPct}% • Max 95%
                    </div>
                  </div>

                  {/* 4. ST CHÍ MẠNG */}
                  <div
                    className="rounded-xl p-2.5 flex flex-col justify-between"
                    style={{
                      background: 'rgba(168, 85, 247, 0.12)',
                      border: '1.5px solid rgba(168, 85, 247, 0.5)',
                      boxShadow: '0 0 12px rgba(168, 85, 247, 0.18)'
                    }}
                  >
                    <div className="text-[10px] font-extrabold text-[#c084fc] tracking-wider uppercase flex items-center gap-1">
                      <span>💥</span> ST CHÍ MẠNG
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-black text-[#e879f9] drop-shadow-[0_0_10px_rgba(232,121,249,0.6)] font-sans my-0.5 truncate">
                      {st.critTotalPct}%
                    </div>
                    <div className="text-[9.5px] text-[#f0abfc] truncate">
                      Hệ số: x{st.critDamageMultiplier.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* HÀNG 2: PHÒNG THỦ & CƠ ĐỘNG (4 KHỐI ĐỐI XỨNG) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* 5. PHÒNG THỦ */}
                  <div
                    className="rounded-xl p-2.5 flex flex-col justify-between"
                    style={{
                      background: 'rgba(14, 165, 233, 0.12)',
                      border: '1.5px solid rgba(14, 165, 233, 0.5)',
                      boxShadow: '0 0 12px rgba(14, 165, 233, 0.18)'
                    }}
                  >
                    <div className="text-[10px] font-extrabold text-[#38bdf8] tracking-wider uppercase flex items-center gap-1">
                      <span>🛡️</span> PHÒNG THỦ
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-black text-[#38bdf8] drop-shadow-[0_0_10px_rgba(56,189,248,0.6)] font-sans my-0.5 truncate" title={`${new Intl.NumberFormat('vi-VN').format(st.totalDef)} DEF`}>
                      {new Intl.NumberFormat('vi-VN').format(st.totalDef)} DEF
                    </div>
                    <div className="text-[9.5px] text-[#a5f3fc] font-bold truncate">
                      Trừ thẳng sát thương
                    </div>
                  </div>

                  {/* 6. GIẢM ST */}
                  <div
                    className="rounded-xl p-2.5 flex flex-col justify-between"
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1.5px solid rgba(99, 102, 241, 0.5)',
                      boxShadow: '0 0 12px rgba(99, 102, 241, 0.18)'
                    }}
                  >
                    <div className="text-[10px] font-extrabold text-[#818cf8] tracking-wider uppercase flex items-center gap-1">
                      <span>🔰</span> GIẢM ST
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-black text-[#a5b4fc] drop-shadow-[0_0_10px_rgba(165,180,252,0.6)] font-sans my-0.5 truncate">
                      {st.rawGearReducPct}%
                    </div>
                    <div className="text-[9.5px] text-[#c7d2fe] font-bold truncate">
                      Thực: {st.effectiveGearReducPct}% • Max 80%
                    </div>
                  </div>

                  {/* 7. KHÁNG CHÍ MẠNG */}
                  <div
                    className="rounded-xl p-2.5 flex flex-col justify-between"
                    style={{
                      background: 'rgba(236, 72, 153, 0.12)',
                      border: '1.5px solid rgba(236, 72, 153, 0.5)',
                      boxShadow: '0 0 12px rgba(236, 72, 153, 0.18)'
                    }}
                  >
                    <div className="text-[10px] font-extrabold text-[#f472b6] tracking-wider uppercase flex items-center gap-1">
                      <span>🛡️</span> KHÁNG CHÍ MẠNG
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-black text-[#f472b6] drop-shadow-[0_0_10px_rgba(244,114,182,0.6)] font-sans my-0.5 truncate">
                      {st.rawCritResPctDisplay}%
                    </div>
                    <div className="text-[9.5px] text-[#fbcfe8] font-bold truncate">
                      Thực: {st.effectiveCritResPct}% • Max 95%
                    </div>
                  </div>

                  {/* 8. TỐC ĐỘ */}
                  <div
                    className="rounded-xl p-2.5 flex flex-col justify-between"
                    style={{
                      background: 'rgba(6, 182, 212, 0.12)',
                      border: '1.5px solid rgba(6, 182, 212, 0.5)',
                      boxShadow: '0 0 12px rgba(6, 182, 212, 0.18)'
                    }}
                  >
                    <div className="text-[10px] font-extrabold text-[#22d3ee] tracking-wider uppercase flex items-center gap-1">
                      <span>🌪️</span> TỐC ĐỘ
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-black text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.6)] font-sans my-0.5 truncate">
                      {new Intl.NumberFormat('vi-VN').format(st.totalAgility)}
                    </div>
                    <div className="text-[9.5px] text-[#a5f3fc] font-bold truncate">
                      Né đòn: {st.dodgePct}% • Kháng xấu
                    </div>
                  </div>
                </div>

                {/* 3. KÍCH HOẠT SET ĐỒ (SET BONUS) (CHUẨN DISCORD) */}
                {(() => {
                  const activeSets = getPlayerActiveSets(p);
                  return (
                    <div
                      className="rounded-xl p-3 flex flex-col gap-2 shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(168, 85, 247, 0.12))',
                        border: '1.5px solid rgba(255, 215, 0, 0.45)',
                        boxShadow: '0 0 14px rgba(255, 215, 0, 0.15)'
                      }}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/30">
                        <div className="text-[11.5px] font-black text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] uppercase flex items-center gap-1.5">
                          <span>✨</span> KÍCH HOẠT SET ĐỒ (SET BONUS)
                        </div>
                        {activeSets.length > 0 && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                            {activeSets.length} Mốc Kích Hoạt
                          </span>
                        )}
                      </div>
                      {activeSets.length > 0 ? (
                        <div className="space-y-1.5">
                          {activeSets.map((s, sIdx) => {
                            const badgeCol = s.color || '#ffd700';
                            return (
                              <div
                                key={sIdx}
                                className="bg-white/[0.04] rounded-md p-2 flex items-start gap-2.5"
                                style={{ borderLeft: `3px solid ${badgeCol}` }}
                              >
                                <span
                                  className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5"
                                  style={{ color: badgeCol, backgroundColor: `${badgeCol}20`, border: `1px solid ${badgeCol}40` }}
                                >
                                  Set {s.count}
                                </span>
                                <div className="text-[11px] leading-snug">
                                  <div className="font-extrabold" style={{ color: badgeCol }}>{s.name}</div>
                                  <div className="text-[10px] text-slate-300 mt-0.5">{s.desc ? s.desc.replace(/^.*?:\s*/, '') : ''}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-black/30 border border-white/5 rounded-lg p-2.5 text-[11px] text-slate-400 italic">
                          Chưa kích hoạt hiệu ứng Set nào. Mặc từ 2, 4, 6 món cùng hệ để kích hoạt thêm hàng chục % All Thuộc Tính!
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="border-t border-slate-800 pt-3 mt-1 flex justify-between items-center shrink-0 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowBossStatModal(false); setShowBossProfileModal(true); }}
                    className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                  >
                    <Eye size={14} />
                    <span>Xem Profile & 8 Trang Bị</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowBossStatModal(false); setShowBagModal(true); }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/30 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
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

              {/* Cảnh báo rõ ràng nếu tạo mã cho Discord hoặc TikTok */}
              {linkOtpTarget === 'discord' && (
                <div className="p-3.5 rounded-2xl bg-indigo-500/15 border-2 border-indigo-500/60 text-indigo-200 text-xs flex items-start gap-2.5 animate-pulse">
                  <span className="text-base shrink-0">⚠️</span>
                  <div>
                    <strong className="text-white block font-bold mb-0.5">MÃ OTP NÀY DÀNH RIÊNG CHO DISCORD:</strong>
                    <span>Mở Discord và gõ lệnh <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-bold">/link {linkOtpCode}</code> hoặc <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-bold">mlink {linkOtpCode}</code>. <strong className="text-amber-300">Tuyệt đối không nhập trên TikTok Live!</strong></span>
                  </div>
                </div>
              )}
              {linkOtpTarget === 'tiktok' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border-2 border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5 animate-pulse">
                  <span className="text-base shrink-0">🎵</span>
                  <div>
                    <strong className="text-white block font-bold mb-0.5">MÃ OTP NÀY DÀNH CHO TIKTOK LIVE:</strong>
                    <span>Vào xem livestream đang phát và bình luận: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-bold">link {linkOtpCode}</code>.</span>
                  </div>
                </div>
              )}

              {/* 2 Cách xác nhận */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Chọn 1 trong 2 cách sau để xác nhận liên kết:
                </h4>

                {/* Cách 1: Discord */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0B1120] to-[#121936] border-2 border-indigo-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/25 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 text-xs text-slate-300">
                      <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>Cách 1: Gõ lệnh trong Discord</span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded font-mono font-bold">Khuyên Dùng</span>
                      </p>
                      <p className="leading-relaxed">
                        Vào bất kỳ kênh chat Discord của máy chủ (<a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-bold">Tham gia server Discord tại đây ↗</a>), gõ lệnh:
                        <code className="mx-1 px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono font-bold border border-indigo-500/40">
                          /link {linkOtpCode}
                        </code>
                        hoặc <code className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono font-bold">mlink {linkOtpCode}</code>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={linkOtpCountdown <= 0}
                    onClick={() => {
                      if (linkOtpCode && linkOtpCountdown > 0) {
                        navigator.clipboard.writeText(`/link ${linkOtpCode}`);
                        showToast(`Đã sao chép: /link ${linkOtpCode}`, "success");
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Copy size={13} />
                    <span>Sao Chép Lệnh</span>
                  </button>
                </div>

                {/* Cách 2: TikTok Live */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0B1120] to-[#1F111E] border-2 border-rose-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-500 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/25 text-rose-400 border border-rose-500/40 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                      <span className="text-sm">🎵</span>
                    </div>
                    <div className="flex-1 min-w-0 text-xs text-slate-300">
                      <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                        <span>Cách 2: Bình luận trên Live TikTok</span>
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded font-mono font-bold">TikTok Live</span>
                      </p>
                      <p className="leading-relaxed">
                        Vào xem livestream đang phát, gõ bình luận chat:
                        <code className="mx-1 px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono font-bold border border-rose-500/40">
                          link {linkOtpCode}
                        </code>
                        hoặc <code className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono font-bold">lk {linkOtpCode}</code> (hoặc comment 6 số)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={linkOtpCountdown <= 0}
                    onClick={() => {
                      if (linkOtpCode && linkOtpCountdown > 0) {
                        navigator.clipboard.writeText(`link ${linkOtpCode}`);
                        showToast(`Đã sao chép: link ${linkOtpCode}`, "success");
                      }
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Copy size={13} />
                    <span>Sao Chép Lệnh</span>
                  </button>
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
          p.pants?.id,
          p.pet?.id,
          p.ring?.id,
          p.necklace?.id,
          p.shoes?.id
        ].filter(Boolean));

        // Gắn _rawIndex tương ứng với vị trí thực tế trong túi đồ của game_core
        const rawInvWithIndex = rawInv.map((item, originalIdx) => ({
          ...item,
          _rawIndex: originalIdx
        }));

        // Lọc bỏ triệt để trang bị đang sử dụng (chỉ giữ lại đồ chưa mặc trong túi) và sắp xếp theo Tier từ cao tới thấp
        const unequippedInventory = rawInvWithIndex.filter(item => {
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
                    onClick={() => {
                      setShowBagModal(false);
                      setShowForgeModal(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer border border-amber-400/40"
                    title="Mở Lò Rèn Long Tộc chuyển cấp cường hóa"
                  >
                    <span>🔨 Lò Rèn</span>
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
                        { id: 'pants', label: '👖 Quần Chiến' },
                        { id: 'necklace', label: '📿 Dây Chuyền' },
                        { id: 'ring', label: '💍 Nhẫn' },
                        { id: 'shoes', label: '👟 Giày' },
                        { id: 'hat', label: '👑 Nón' },
                        { id: 'pet', label: '🐾 Linh Thú' },
                        { id: 'material', label: '💎 Nguyên Liệu' },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveBagCategory(tab.id);
                            setBagVisibleCount(30);
                          }}
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
                  ) : (() => {
                    const displayedInventory = filteredInventory.slice(0, bagVisibleCount);
                    return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {displayedInventory.map((item, idx) => {
                        const category = getCategoryOfItem(item);
                        const isShoes = (category === 'shoes') || String(item?.category || '').toLowerCase() === 'shoes' || String(item?.name || '').toLowerCase().includes('giày');
                        const isHat = (category === 'hat') || String(item?.category || '').toLowerCase() === 'hat' || String(item?.name || '').toLowerCase().includes('nón') || String(item?.name || '').toLowerCase().includes('mũ');
                        const tier = getBossTierStyle(item.tier);
                        const starsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
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
                              {renderUniversalItemThumb(item, category, { sizeClass: 'w-14 h-14', imgSizeClass: 'w-11 h-11', defaultIcon: '⚔️' })}

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
                                  {!isShoes && !isHat && category !== 'material' && starsCount > 0 && (
                                    <span className="text-[8px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                                      {starsCount}⭐
                                    </span>
                                  )}
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
                                  {category === 'weapon' && (() => {
                                    const wStats = getWeaponStats(item);
                                    const baseDmg = wStats.baseDmg;
                                    const plusVal = Number(item.plus || 0);
                                    return (
                                      <span className="text-emerald-400 block">
                                        ⚡ +{baseDmg.toLocaleString()} DMG {plusVal ? `(+${Math.round(baseDmg * plusVal * 0.25).toLocaleString()})` : ''}
                                      </span>
                                    );
                                  })()}
                                  {category === 'armor' && (() => {
                                    const bHp = Number(item.base_hp || (item.tier?.toLowerCase().includes('thượng cổ') ? 450000 : (item.tier?.toLowerCase().includes('cổ đại') ? 180000 : (item.tier?.toLowerCase().includes('tối thượng') ? 75000 : (item.tier?.toLowerCase().includes('thần thoại') ? 30000 : (item.tier?.toLowerCase().includes('epic') ? 12000 : 4500))))));
                                    const bDef = Number(item.base_def || (item.tier?.toLowerCase().includes('thượng cổ') ? 45000 : (item.tier?.toLowerCase().includes('cổ đại') ? 18000 : (item.tier?.toLowerCase().includes('tối thượng') ? 7500 : (item.tier?.toLowerCase().includes('thần thoại') ? 3000 : (item.tier?.toLowerCase().includes('epic') ? 1200 : 450))))));
                                    const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                                    const totHp = Math.round(bHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                                    const totDef = Math.round(bDef * (1 + 0.25 * (item.plus || 0)) * sMult);
                                    return (
                                      <span className="text-emerald-400 block">
                                        ❤️ +{totHp.toLocaleString()} HP • 🛡️ +{totDef.toLocaleString()} DEF
                                      </span>
                                    );
                                  })()}
                                  {category === 'pants' && (() => {
                                    const pStats = getPantsStats(item);
                                    const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                                    const totHp = Math.round(pStats.baseHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                                    const totDef = Math.round(pStats.baseDef * (1 + 0.25 * (item.plus || 0)) * sMult);
                                    return (
                                      <span className="text-emerald-400 block">
                                        🛡️ +{pStats.defPercent}% DEF • ❤️ +{pStats.hpPercent}% HP (+{totHp.toLocaleString()} HP / +{totDef.toLocaleString()} DEF)
                                      </span>
                                    );
                                  })()}
                                  {category === 'necklace' && (() => {
                                    const nStats = getNecklaceStats(item);
                                    return (
                                      <span className="text-amber-400 block">
                                        📿 +{nStats.dmgPercent}% DMG Toàn Bộ
                                      </span>
                                    );
                                  })()}
                                  {category === 'ring' && (() => {
                                    const rStats = getRingStats(item);
                                    const rStars = Math.max(1, Math.min(5, Number(item.stars || 1)));
                                    const starMult = Math.pow(3, rStars - 1);
                                    const totRingDmg = Math.round(rStats.baseDmgPercent * starMult);
                                    const totRingHp = Math.round((rStats.baseHpPercent || rStats.baseDmgPercent) * starMult);
                                    const totRingDef = Math.round((rStats.baseDefPercent || rStats.baseDmgPercent) * starMult);
                                    const skPct = rStats.skillPct;
                                    return (
                                      <>
                                        <span className="text-purple-400 block font-semibold">
                                          💍 +{totRingDmg.toLocaleString()}% DMG • <span className="text-emerald-400">❤️+{totRingHp.toLocaleString()}% HP</span> • <span className="text-cyan-400">🛡️+{totRingDef.toLocaleString()}% DEF</span> {skPct ? `• ⚡ ${skPct}%` : ''}
                                        </span>
                                        <span className="text-amber-300 block text-[9.5px]">
                                          ⚡ {item.skill_level > 0 ? `Tuyệt Kỹ: Lv.${item.skill_level} (Tỉ lệ: ${getRingSkillProcStr(item)})` : `Tỉ lệ phát động: ${getRingSkillProcStr(item)}`}
                                        </span>
                                      </>
                                    );
                                  })()}
                                  {category === 'pet' && <div className="mt-0.5">{renderPetStatBadges(item, { small: true })}</div>}
                                  {category === 'shoes' && (() => {
                                    const sTier = (item.tier || '').toLowerCase();
                                    const sPlus = Number(item.plus || 0);
                                    let baseAgi = Number(item.base_agility || (sTier.includes('huyền thoại') || sTier.includes('legendary') ? 300 : 80));
                                    const enhanceBonusAgi = Math.round(baseAgi * sPlus * 0.25);
                                    return (
                                      <span className="text-pink-400 block font-semibold">
                                        👟 +{baseAgi.toLocaleString()} Tốc Độ {sPlus > 0 ? `(+${enhanceBonusAgi.toLocaleString()})` : ''}
                                      </span>
                                    );
                                  })()}
                                  {category === 'hat' && (() => {
                                    const hPlus = Number(item.plus || 0);
                                    const hEnhMult = 1.0 + 0.25 * hPlus;
                                    const basePen = Number(item.base_armor_pen_pct || 300);
                                    const baseReduc = Number(item.base_dmg_reduction_pct || 300);
                                    const baseDefPct = Number(item.base_def_pct || 3000);
                                    const totPen = Math.round(basePen * hEnhMult);
                                    const totReduc = Math.round(baseReduc * hEnhMult);
                                    const totDefPct = Math.round(baseDefPct * hEnhMult);
                                    const hSkillLvl = Number(item.skill_level || 0) || (item.tier?.toLowerCase().includes('huyền thoại') ? 1 : 0);
                                    const hSkillProc = Number(item.skill_proc_rate || 0) || (item.tier?.toLowerCase().includes('huyền thoại') ? 0.01 : 0);
                                    const hSkillPct = Math.round(hSkillProc * 100);
                                    return (
                                      <>
                                        <span className="text-rose-400 block font-semibold">
                                          👑 🗡️+{totPen.toLocaleString()}% Xuyên Giáp • 🔰+{totReduc.toLocaleString()}% Giảm ST • 🛡️+{totDefPct.toLocaleString()}% DEF
                                        </span>
                                        {(hSkillPct > 0 || hSkillLvl > 0) && (
                                          <span className="text-amber-300 block text-[9.5px]">
                                            🛡️ Miễn Nhiễm Sát Thương: {hSkillPct || 1}% (Lv.{hSkillLvl || 1})
                                          </span>
                                        )}
                                      </>
                                    );
                                  })()}
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
                                      setSelectedItemToList({ ...item, originalIndex: item._rawIndex !== undefined ? item._rawIndex : idx });
                                      setListingPrice(100);
                                      setListingSellQuantity(Math.min(item.quantity || 1, 1));
                                      setListingPassword('');
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
                                      handleExecuteBagAction('equip', item, item._rawIndex !== undefined ? item._rawIndex : idx);
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
                                      setSelectedItemToList({ ...item, originalIndex: item._rawIndex !== undefined ? item._rawIndex : idx });
                                      setListingPrice(100);
                                      setListingSellQuantity(1);
                                      setListingPassword('');
                                      setShowListItemModal(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-500 hover:to-yellow-500 text-amber-300 hover:text-white border border-amber-500/40 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                                    title="Treo món này lên Sàn Đấu Giá bằng Xu (phí sàn 20%)"
                                  >
                                    <span>🏷️ Treo Đấu Giá</span>
                                  </button>

                                  {(() => {
                                    const itemPlus = parseInt(item.plus || 0);
                                    const itemStars = parseInt(item.stars || 1);
                                    const itemSkill = parseInt(item.skill_level || 0);
                                    const isRing = item.category === 'ring' || (item.name && item.name.toLowerCase().includes('nhẫn'));
                                    const isEnhanced = itemPlus > 0 || (isRing && (itemStars > 1 || itemSkill > 0));
                                    return (
                                      <button
                                        type="button"
                                        disabled={isPerformingBagAction || isEnhanced}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isEnhanced) {
                                            showToast(`Trang bị [${item.name}] đã được cường hóa, không thể phân giải hay xóa!`, "error");
                                            return;
                                          }
                                          handleExecuteBagAction('delete', item, item._rawIndex !== undefined ? item._rawIndex : idx);
                                        }}
                                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                          isEnhanced
                                            ? 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-40'
                                            : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50'
                                        }`}
                                        title={isEnhanced ? `Trang bị đã cường hóa${itemPlus > 0 ? ` (+${itemPlus})` : ''}, được bảo vệ an toàn và không thể xóa` : "Xóa trang bị và nhận lượt đánh boss tương ứng"}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {filteredInventory.length > bagVisibleCount && (
                        <div className="col-span-full py-3 flex flex-col sm:flex-row items-center justify-center gap-2.5 bg-purple-950/20 border border-purple-500/30 rounded-2xl p-3 mt-1">
                          <span className="text-xs text-slate-300">
                            Đang hiển thị <strong>{displayedInventory.length}</strong> / <strong>{filteredInventory.length}</strong> món bậc cao nhất
                          </span>
                          <button
                            type="button"
                            onClick={() => setBagVisibleCount(prev => prev + 30)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>🔽 Xem thêm ({filteredInventory.length - bagVisibleCount} món tiếp theo)</span>
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })()}
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
        const isShoes = (category === 'shoes') || String(item?.category || '').toLowerCase() === 'shoes' || String(item?.name || '').toLowerCase().includes('giày');
        const isHat = (category === 'hat') || String(item?.category || '').toLowerCase() === 'hat' || String(item?.name || '').toLowerCase().includes('nón') || String(item?.name || '').toLowerCase().includes('mũ');
        const tier = getBossTierStyle(item?.tier);
        const numStars = Number(item?.stars);
        const starsCount = Math.max(1, Math.min(5, isNaN(numStars) || numStars < 1 ? 1 : numStars));
        const isStackable = category === 'material' || (item?.quantity && item.quantity > 1);
        const maxQty = item?.quantity || 1;
        const safePrice = Math.max(1, Number(listingPrice) || 0);
        const feeCoins = Math.round(safePrice * 0.20);
        const netReceive = safePrice - feeCoins;

        return (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setShowListItemModal(false); }}
          >
            <div className="bg-gradient-to-br from-[#12192c] via-[#0e1526] to-[#080d1a] border-2 border-amber-500/70 rounded-3xl w-full max-w-md max-h-[90vh] max-h-[92dvh] shadow-[0_0_60px_rgba(245,158,11,0.35)] p-4 sm:p-6 text-white animate-zoom-in relative flex flex-col my-auto overflow-hidden">
              {/* Header (Cố định ở trên) */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 sm:pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-base sm:text-lg text-amber-400 shrink-0">
                    🏷️
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-white tracking-wide">
                      TREO ĐẤU GIÁ VẬT PHẨM
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-amber-300/80 font-medium">
                      Giao dịch bằng Xu • Phí sàn 20% khi khớp lệnh
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowListItemModal(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/80 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Phần nội dung cuộn linh hoạt trên điện thoại */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-0">
                {/* Card xem trước vật phẩm */}
                <div
                  className="rounded-2xl p-2.5 sm:p-3 bg-gradient-to-r from-slate-900 to-[#151D2F] border flex items-center gap-3 shadow-inner cursor-pointer hover:border-amber-400/60 transition-all shrink-0"
                  style={{ borderColor: tier.border }}
                  onMouseEnter={(e) => showItemTooltip(item, e, category)}
                  onMouseMove={updateItemTooltipPos}
                  onMouseLeave={hideItemTooltip}
                  onClick={(e) => handleItemCardClick(item, e, category)}
                >
                  {renderUniversalItemThumb(item, category, { sizeClass: 'w-12 h-12 sm:w-14 sm:h-14', imgSizeClass: 'w-10 h-10 sm:w-11 sm:h-11' })}
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
                      {!isShoes && !isHat && category !== 'material' && starsCount > 0 && (
                        <span className="text-[9px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          {starsCount}⭐
                        </span>
                      )}
                      {isStackable && (
                        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                          Túi có: x{Number(maxQty).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form thiết lập giá & số lượng */}
                <div className="space-y-3">
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
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-black text-sm sm:text-base focus:border-amber-400 focus:outline-none pr-12"
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

                  {/* Mục tạo mật mã khi treo bán */}
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>🔒 Mật mã mua hàng:</span>
                        <span className="text-[10px] font-normal text-slate-400">(Tùy chọn)</span>
                      </label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${listingPassword.trim() ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500'}`}>
                        {listingPassword.trim() ? 'Đã cài pass' : 'Bán công khai'}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={30}
                      value={listingPassword}
                      onChange={(e) => setListingPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-slate-700 focus:border-amber-400 text-white font-medium text-xs placeholder:text-slate-500 focus:outline-none"
                      placeholder="Nhập pass riêng cho người mua (bỏ trống nếu bán tự do)..."
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                      💡 Ai muốn mua vật phẩm này trên website bắt buộc phải <strong>nhập đúng mật mã</strong> mới được mua.
                    </p>
                  </div>

                  {/* Bảng tính chi phí minh bạch */}
                  <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
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
              </div>

              {/* 2 Nút hành động (Cố định ở dưới đáy modal, không bao giờ bị tràn/mất trên điện thoại) */}
              <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-slate-800 shrink-0">
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
                      quantity: listingSellQuantity,
                      password: listingPassword.trim()
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
                  {/* Xu & Điểm Vinh Dự của người chơi */}
                  {bossPlayerSummary && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-1.5 text-xs font-black text-yellow-400">
                        <span>🪙</span>
                        <span>{new Intl.NumberFormat('vi-VN').format(bossPlayerSummary.bonus_coins || 0)} Xu</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-1.5 text-xs font-black text-rose-400" title="Điểm Vinh Dự Chiến Trường (PvP)">
                        <span>🏆</span>
                        <span>{new Intl.NumberFormat('vi-VN').format(bossPlayerSummary.honor_points || 0)} Vinh Dự</span>
                      </div>
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
                        { id: 'pants', label: '👖 Quần Chiến' },
                        { id: 'necklace', label: '📿 Dây Chuyền' },
                        { id: 'ring', label: '💍 Nhẫn' },
                        { id: 'shoes', label: '👟 Giày' },
                        { id: 'hat', label: '👑 Nón' },
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
                          const isShoes = (category === 'shoes') || String(item?.category || '').toLowerCase() === 'shoes' || String(item?.name || '').toLowerCase().includes('giày');
                          const isHat = (category === 'hat') || String(item?.category || '').toLowerCase() === 'hat' || String(item?.name || '').toLowerCase().includes('nón') || String(item?.name || '').toLowerCase().includes('mũ');
                          const tier = getBossTierStyle(item.tier);
                          const starsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
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
                                  {renderUniversalItemThumb(item, category, { sizeClass: 'w-14 h-14', imgSizeClass: 'w-11 h-11' })}

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

                                      {!isShoes && !isHat && category !== 'material' && starsCount > 0 && (
                                        <span className="text-[9px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                          {starsCount}⭐
                                        </span>
                                      )}

                                      {item.skill_level > 0 && (
                                        <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1 rounded">
                                          Lv.{item.skill_level}
                                        </span>
                                      )}

                                      {(listing.has_password || listing.password) && (
                                        <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                          🔒 Có Pass
                                        </span>
                                      )}
                                    </div>

                                    {/* Stats tóm tắt */}
                                    <div className="text-[10px] text-slate-300 font-bold mt-1">
                                      {category === 'weapon' && (() => {
                                        const wStats = getWeaponStats(item);
                                        const plusVal = Number(item.plus || 0);
                                        return (
                                          <span className="text-emerald-400">
                                            ⚡ +{wStats.baseDmg.toLocaleString()} DMG{plusVal > 0 ? ` (+${Math.round(wStats.baseDmg * plusVal * 0.25).toLocaleString()})` : ''}
                                          </span>
                                        );
                                      })()}
                                      {category === 'armor' && (() => {
                                        const aStats = getArmorStats(item);
                                        const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                                        const totHp = Math.round(aStats.baseHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                                        const totDef = Math.round(aStats.baseDef * (1 + 0.25 * (item.plus || 0)) * sMult);
                                        return (
                                          <span className="text-emerald-400">❤️ +{totHp.toLocaleString()} HP • 🛡️ +{totDef.toLocaleString()} DEF</span>
                                        );
                                      })()}
                                      {category === 'pants' && (() => {
                                        const pStats = getPantsStats(item);
                                        const sMult = Math.pow(2, Math.max(0, (item.stars || 1) - 1));
                                        const totHp = Math.round(pStats.baseHp * (1 + 0.25 * (item.plus || 0)) * sMult);
                                        const totDef = Math.round(pStats.baseDef * (1 + 0.25 * (item.plus || 0)) * sMult);
                                        return (
                                          <span className="text-cyan-400">👖 +{totHp.toLocaleString()} HP • 🛡️ +{totDef.toLocaleString()} DEF (+{pStats.hpPercent}% HP/DEF)</span>
                                        );
                                      })()}
                                      {category === 'necklace' && (() => {
                                        const nStats = getNecklaceStats(item);
                                        return <span className="text-amber-400">📿 +{nStats.dmgPercent}% DMG</span>;
                                      })()}
                                      {category === 'ring' && (() => {
                                        const rStats = getRingStats(item);
                                        const rStars = Math.max(1, Math.min(5, Number(item.stars || 1)));
                                        const starMult = Math.pow(3, rStars - 1);
                                        const totRingDmg = Math.round(rStats.baseDmgPercent * starMult);
                                        const totRingHp = Math.round((rStats.baseHpPercent || rStats.baseDmgPercent) * starMult);
                                        const totRingDef = Math.round((rStats.baseDefPercent || rStats.baseDmgPercent) * starMult);
                                        const skPct = rStats.skillPct;
                                        return (
                                          <span className="text-purple-400 font-semibold">
                                            💍 +{totRingDmg.toLocaleString()}% DMG • <span className="text-emerald-400">❤️+{totRingHp}% HP</span> • <span className="text-cyan-400">🛡️+{totRingDef}% DEF</span> {skPct ? `• ⚡${skPct}%` : ''}
                                            {item.skill_level > 0 ? ` • ⚡Lv.${item.skill_level} (${getRingSkillProcStr(item)})` : ''}
                                          </span>
                                        );
                                      })()}
                                      {category === 'pet' && <div className="mt-0.5">{renderPetStatBadges(item, { small: true })}</div>}
                                      {category === 'shoes' && (() => {
                                        const agi = Number(item.agility || item.base_agility || 300);
                                        return <span className="text-pink-400">👟 +{agi.toLocaleString()} Tốc Độ</span>;
                                      })()}
                                      {category === 'hat' && (() => {
                                        const hPlus = Number(item.plus || 0);
                                        const hEnhMult = 1.0 + 0.25 * hPlus;
                                        const basePen = Number(item.base_armor_pen_pct || 300);
                                        const baseReduc = Number(item.base_dmg_reduction_pct || 300);
                                        const baseDefPct = Number(item.base_def_pct || 3000);
                                        const totPen = Math.round(basePen * hEnhMult);
                                        const totReduc = Math.round(baseReduc * hEnhMult);
                                        const totDefPct = Math.round(baseDefPct * hEnhMult);
                                        const hSkillLvl = Number(item.skill_level || 0) || (item.tier?.toLowerCase().includes('huyền thoại') ? 1 : 0);
                                        const hSkillProc = Number(item.skill_proc_rate || 0) || (item.tier?.toLowerCase().includes('huyền thoại') ? 0.01 : 0);
                                        const hSkillPct = Math.round(hSkillProc * 100);
                                        return (
                                          <div className="space-y-0.5">
                                            <span className="text-rose-400 block font-semibold">
                                              👑 🗡️+{totPen.toLocaleString()}% Xuyên • 🔰+{totReduc.toLocaleString()}% Giảm ST • 🛡️+{totDefPct.toLocaleString()}% DEF
                                            </span>
                                            {(hSkillPct > 0 || hSkillLvl > 0) && (
                                              <span className="text-amber-300 block text-[9.5px]">
                                                🛡️ Miễn Nhiễm: {hSkillPct || 1}% (Lv.{hSkillLvl || 1})
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })()}
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
                                      if (listing.has_password || listing.password) {
                                        setBuyingLockedListing(listing);
                                        setBuyPasscodePrompt('');
                                      } else {
                                        handleExecuteAuctionAction('buy_auction', { auction_id: listing.id, listing, price: listing.price });
                                      }
                                    }}
                                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    {isLoadingThis ? <Loader2 size={12} className="animate-spin" /> : ((listing.has_password || listing.password) ? <Lock size={12} /> : <Wallet size={12} />)}
                                    <span>{(listing.has_password || listing.password) ? 'Mua (Có Pass)' : 'Mua Ngay'}</span>
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
                              {renderUniversalItemThumb(item, category, { sizeClass: 'w-12 h-12', imgSizeClass: 'w-10 h-10' })}

                              <div className="min-w-0">
                                <div className="font-black text-xs sm:text-sm text-white truncate">
                                  {item.name}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  <span style={{ color: tier.color }}>{tier.label}</span>
                                  <span>• Mã: #{listing.id.slice(-6)}</span>
                                  <span>• Đăng lúc: {new Date(listing.created_at * 1000).toLocaleTimeString('vi-VN')}</span>
                                  {(listing.has_password || listing.password) && (
                                    <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      🔒 Có Pass
                                    </span>
                                  )}
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
                              {renderUniversalItemThumb(item, category, { sizeClass: 'w-10 h-10', imgSizeClass: 'w-8 h-8' })}
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

      {/* MODAL NHẬP MẬT MÃ MUA HÀNG ĐẤU GIÁ */}
      {buyingLockedListing && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) { setBuyingLockedListing(null); setBuyPasscodePrompt(''); } }}
        >
          <div className="bg-gradient-to-br from-[#12192c] via-[#0e1526] to-[#080d1a] border-2 border-amber-500/70 rounded-3xl w-full max-w-sm shadow-[0_0_60px_rgba(245,158,11,0.4)] p-5 text-white animate-zoom-in relative my-auto">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-base">
                  🔒
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">NHẬP MẬT MÃ MUA HÀNG</h3>
                  <p className="text-[10px] text-amber-300/80">Vật phẩm được bảo vệ bằng mật khẩu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setBuyingLockedListing(null); setBuyPasscodePrompt(''); }}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-700 mb-3.5 space-y-1 text-xs">
              <div className="text-white font-bold truncate">
                📦 {buyingLockedListing.item_name || buyingLockedListing.item?.name}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Người bán: <strong className="text-slate-300">{buyingLockedListing.seller_name}</strong></span>
                <span className="text-amber-300 font-bold">🪙 {Number(buyingLockedListing.price || 0).toLocaleString()} Xu</span>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <label className="block text-xs font-bold text-slate-300">
                Mật mã giao dịch:
              </label>
              <input
                type="text"
                autoFocus
                value={buyPasscodePrompt}
                onChange={(e) => setBuyPasscodePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && buyPasscodePrompt.trim()) {
                    const pass = buyPasscodePrompt.trim();
                    const l = buyingLockedListing;
                    setBuyingLockedListing(null);
                    setBuyPasscodePrompt('');
                    handleExecuteAuctionAction('buy_auction', { auction_id: l.id, listing: l, price: l.price, password: pass });
                  }
                }}
                placeholder="Nhập mật mã do người bán cung cấp..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-black text-sm focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 leading-normal">
                * Vui lòng liên hệ người bán để lấy mật mã mở khóa trước khi mua.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setBuyingLockedListing(null); setBuyPasscodePrompt(''); }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!buyPasscodePrompt.trim() || isPerformingBagAction}
                onClick={() => {
                  const pass = buyPasscodePrompt.trim();
                  const l = buyingLockedListing;
                  setBuyingLockedListing(null);
                  setBuyPasscodePrompt('');
                  handleExecuteAuctionAction('buy_auction', { auction_id: l.id, listing: l, price: l.price, password: pass });
                }}
                className="flex-[2] py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50 cursor-pointer"
              >
                Xác Nhận Mua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN TRANG BỊ CHO LÒ RÈN (SLOT A HOẶC SLOT B) */}
      {showForgeSelectModal && (() => {
        const isSlotA = showForgeSelectModal === 'A';
        const allItems = getAllForgeSelectableItems(showForgeSelectModal);

        const filteredItems = allItems.filter(item => {
          // Lọc theo loại trang bị
          if (forgeFilterCategory !== 'all') {
            const cat = item.category || getCategoryOfItem(item);
            if (cat !== forgeFilterCategory) return false;
          }
          // Lọc theo vị trí (đang mặc hay trong túi)
          if (forgeFilterLocation === 'equipped' && !item._isEquipped) return false;
          if (forgeFilterLocation === 'inventory' && item._isEquipped) return false;
          // Tìm kiếm theo tên
          if (forgeSearchQuery.trim()) {
            const q = forgeSearchQuery.toLowerCase().trim();
            if (!String(item.name || '').toLowerCase().includes(q)) return false;
          }
          return true;
        });

        const categories = [
          { id: 'all', label: 'Tất Cả' },
          { id: 'weapon', label: '⚔️ Vũ Khí' },
          { id: 'armor', label: '🛡️ Áo Giáp' },
          { id: 'pants', label: '👖 Quần' },
          { id: 'shoes', label: '👟 Giày' },
          { id: 'necklace', label: '📿 Dây Chuyền' },
          { id: 'ring', label: '💍 Nhẫn' },
          { id: 'pet', label: '🦊 Linh Thú' }
        ];

        return (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForgeSelectModal(null); }}
          >
            <div className="bg-gradient-to-br from-[#0c1322] via-[#121a2d] to-[#080d18] border-2 border-amber-500/70 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-[0_0_60px_rgba(245,158,11,0.35)] p-4 sm:p-6 flex flex-col relative text-white animate-zoom-in overflow-hidden">
              {/* Header Modal */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-500/20 pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <Flame size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                      {isSlotA ? '🔥 CHỌN MÓN ĐỒ NGUỒN (A)' : '🎯 CHỌN MÓN ĐỒ ĐÍCH (B)'}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                        {isSlotA ? 'Cường Hóa >= +1' : `Cường Hóa < +${selectedForgeItemA?.plus || 'A'}`}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      {isSlotA
                        ? 'Chọn món trang bị đang có Cấp Cường Hóa để chuyển đi (món này sẽ về +0 sau khi rèn)'
                        : 'Chọn món trang bị cần nhận toàn bộ cấp Cường Hóa từ món A'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgeSelectModal(null)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter Controls: Tabs Loại đồ, Vị trí, Tìm kiếm */}
              <div className="space-y-2 mb-3 shrink-0">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForgeFilterCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        forgeFilterCategory === cat.id
                          ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Vị trí & Thanh tìm kiếm */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 bg-[#0a0f1c] p-1 rounded-xl border border-slate-800 shrink-0">
                    {[
                      { id: 'all', label: 'Tất Cả Vị Trí' },
                      { id: 'equipped', label: '🛡️ Đang Mặc' },
                      { id: 'inventory', label: '🎒 Trong Túi' }
                    ].map(loc => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setForgeFilterLocation(loc.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          forgeFilterLocation === loc.id
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={forgeSearchQuery}
                      onChange={(e) => setForgeSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên trang bị..."
                      className="w-full bg-[#0a0f1c] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách trang bị có thể chọn */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin max-h-[50vh]">
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 text-2xl">
                      🔍
                    </div>
                    <p className="text-sm font-bold text-slate-300">Không tìm thấy món trang bị nào phù hợp!</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isSlotA
                        ? 'Cần trang bị có cấp Cường Hóa (+1 trở lên) để đặt vào Đe Nguồn A.'
                        : 'Cần trang bị có Cường Hóa thấp hơn món A để đặt vào Đe Đích B.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {filteredItems.map((item, idx) => {
                      const cat = item.category || getCategoryOfItem(item);
                      const tier = getBossTierStyle(item.tier);
                      const img = getBossItemAsset(item, cat);
                      const starsCount = Math.max(1, Math.min(5, Number(item.stars || 1)));
                      const plusVal = Number(item.plus || 0);

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (isSlotA) {
                              setSelectedForgeItemA(item);
                              if (selectedForgeItemB && Number(selectedForgeItemB.plus || 0) >= plusVal) {
                                setSelectedForgeItemB(null);
                                showToast(`Đã chọn [${item.name} +${plusVal}]. Món B đã được làm mới để chọn món phù hợp!`, "info");
                              } else {
                                showToast(`Đã chọn [${item.name} +${plusVal}] vào Đe Nguồn A!`, "success");
                              }
                            } else {
                              setSelectedForgeItemB(item);
                              showToast(`Đã chọn [${item.name} +${plusVal}] vào Đe Đích B!`, "success");
                            }
                            setShowForgeSelectModal(null);
                          }}
                          className="rounded-2xl p-2.5 bg-gradient-to-b from-[#111827] to-[#0a0f1d] border transition-all duration-200 flex flex-col justify-between hover:border-amber-400/80 hover:scale-[1.02] shadow-lg relative group cursor-pointer"
                          style={{ borderColor: `${tier.color}55` }}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <div
                              className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border relative bg-black/40"
                              style={{ borderColor: tier.color }}
                            >
                              <img src={img} alt={item.name} className="w-full h-full object-cover" />
                              {plusVal > 0 && (
                                <div className="absolute top-0 right-0 bg-amber-500 text-black font-black text-[9px] px-1 rounded-bl">
                                  +{plusVal}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-white truncate" title={item.name}>
                                {item.name}
                              </h4>
                              <div className="text-[10px] text-amber-400 font-bold tracking-widest">
                                {'★'.repeat(starsCount)}
                              </div>
                              <span
                                className="inline-block text-[9px] font-black uppercase px-1.5 py-0.2 rounded mt-0.5"
                                style={{ color: tier.color, backgroundColor: tier.bg }}
                              >
                                {tier.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-[10px]">
                            <span className="text-slate-400 font-medium truncate">
                              {item._isEquipped ? (
                                <span className="text-emerald-400 font-bold">🛡️ {item._locationLabel}</span>
                              ) : (
                                <span className="text-indigo-300">🎒 {item._locationLabel}</span>
                              )}
                            </span>
                            <span className="text-amber-400 font-bold group-hover:underline">
                              Chọn 👉
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-800 shrink-0 text-xs">
                <span className="text-slate-400">
                  Hiển thị <strong className="text-white">{filteredItems.length}</strong> trang bị hợp lệ
                </span>
                <button
                  type="button"
                  onClick={() => setShowForgeSelectModal(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL CHÚC MỪNG CHUYỂN CẤP LÒ RÈN THÀNH CÔNG */}
      {forgeSuccessModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setForgeSuccessModal(null); }}
        >
          <div className="bg-gradient-to-br from-[#161f33] via-[#101726] to-[#0a0f1d] border-2 border-amber-400 rounded-3xl w-full max-w-md shadow-[0_0_80px_rgba(245,158,11,0.5)] p-6 text-white text-center animate-zoom-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Icon đe búa phát sáng */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-2 border-amber-400 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
              🔨
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={14} className="text-emerald-400 animate-spin" />
              <span>CHUYỂN CẤP THÀNH CÔNG!</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 mb-4">
              LONG HỎA DUNG CƯỜNG HÓA
            </h3>

            {/* Thẻ so sánh Before / After */}
            <div className="bg-[#070b14]/90 border border-amber-500/30 rounded-2xl p-4 mb-4 text-left space-y-3">
              {/* Món Đích B (Thành công) */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-cyan-400 bg-black/40">
                    <img
                      src={getBossItemAsset(forgeSuccessModal.itemB, getCategoryOfItem(forgeSuccessModal.itemB))}
                      alt={forgeSuccessModal.itemB.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-cyan-300 font-bold uppercase">Món Đích [B] Nhận Cấp</p>
                    <h4 className="text-xs font-black text-white truncate">{forgeSuccessModal.itemB.name}</h4>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 line-through">+{forgeSuccessModal.itemB.oldPlus}</span>
                  <span className="text-base font-black text-amber-400 ml-2 animate-pulse">
                    ➔ +{forgeSuccessModal.itemB.newPlus}
                  </span>
                </div>
              </div>

              {/* Món Nguồn A (Về 0) */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-amber-400/50 bg-black/40">
                    <img
                      src={getBossItemAsset(forgeSuccessModal.itemA, getCategoryOfItem(forgeSuccessModal.itemA))}
                      alt={forgeSuccessModal.itemA.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-amber-300 font-bold uppercase">Món Nguồn [A] Bảo Toàn</p>
                    <h4 className="text-xs font-black text-slate-300 truncate">{forgeSuccessModal.itemA.name}</h4>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 line-through">+{forgeSuccessModal.itemA.oldPlus}</span>
                  <span className="text-sm font-black text-slate-300 ml-2">➔ +0</span>
                </div>
              </div>
            </div>

            {/* Chi phí */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-5 px-2">
              <span>Chi phí tiêu hao:</span>
              <span className="text-yellow-400 font-black">-100 Xu Nâng Cấp</span>
            </div>

            <button
              type="button"
              onClick={() => setForgeSuccessModal(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Xác Nhận & Tiếp Tục Rèn
            </button>
          </div>
        </div>
      )}

      {/* MODAL XƯỞNG RÈN LONG TỘC (CHUYỂN CẤP CƯỜNG HÓA) */}
      {renderDragonForgeModal()}

      {renderFooter()}
    </div>
  );
  };

  return (
    <>
      {renderBossBody()}
      {renderItemDetailedTooltip()}
    </>
  );
};

export default BossGameScreen;
