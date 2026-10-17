// -*- coding: utf-8 -*-
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, Gift, Crown, Shield, Zap, Clock, Flame, Check, X, 
  ChevronRight, Info, History, Trophy, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { LEGENDARY_HAT_IMG } from '../hatAsset';

const DEFAULT_WIZARD_ITEMS = [
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
    is_special: true,
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

// Helper phân tích và ánh xạ hình ảnh vật phẩm chuẩn xác cho từng bản ghi lịch sử lật bài
export const getRewardInfo = (actionStr, customReward = null, wizardItemsList = []) => {
  if (customReward && customReward.image) {
    return {
      name: customReward.name || 'Phần thưởng',
      image: customReward.image,
      color: customReward.color || '#a855f7',
      badge: customReward.is_special ? '👑 BẢO VẬT HUYỀN THOẠI' : (customReward.type || 'Vật phẩm'),
      isHat: !!(customReward.is_special || customReward.is_hat || customReward.type === 'game_hat_legendary' || (customReward.name && customReward.name.includes('Nón'))),
      subText: customReward.desc || 'Đã nhận vào túi đồ'
    };
  }

  const act = (actionStr || '').trim();
  const lower = act.toLowerCase();

  // 1. Nón Huyền Thoại (Bảo vật tối thượng)
  if (lower.includes('nón') || lower.includes('mũ') || lower.includes('legendary') || lower.includes('trúng nón')) {
    return {
      name: 'Nón Phù Thủy Huyền Thoại',
      image: LEGENDARY_HAT_IMG,
      color: '#ffd700',
      badge: '👑 BẢO VẬT HUYỀN THOẠI',
      isHat: true,
      subText: act.includes('120') ? 'Nổ Bảo Hiểm 120/120' : 'Bảo Vật Độc Nhất (+450 Phép & +250 Kháng)'
    };
  }

  // 2. Hồng Thạch (Ruby)
  if (lower.includes('hồng thạch') || lower.includes('ruby')) {
    const matchQty = act.match(/(\d+[\.\d]*)\s*hồng thạch/i);
    const qty = matchQty ? matchQty[1] : '500';
    return {
      name: `${qty} Hồng Thạch (Ruby)`,
      image: '/game-assets/gem_ruby.png',
      color: '#f43f5e',
      badge: 'Tiền Tệ Quý',
      isHat: false,
      subText: 'Đã cộng thẳng vào hòm đồ game'
    };
  }

  // 3. Xu Nâng Cấp
  if (lower.includes('xu nâng cấp') || (lower.includes('xu') && !lower.includes('hồng thạch'))) {
    const matchQty = act.match(/(\d+[\.\d]*)\s*xu/i);
    const qty = matchQty ? matchQty[1] : '50.000';
    return {
      name: `${qty} Xu Nâng Cấp`,
      image: '/game-assets/gold_coin.png',
      color: '#eab308',
      badge: 'Tiền Tệ Cường Hóa',
      isHat: false,
      subText: 'Dùng nâng cấp kỹ năng & trang bị'
    };
  }

  // 4. Lượt Đánh Boss
  if (lower.includes('lượt đánh') || lower.includes('đánh boss') || lower.includes('atk')) {
    const matchQty = act.match(/(\d+[\.\d]*)\s*lượt/i);
    const qty = matchQty ? `+${matchQty[1]}` : '+50.000';
    return {
      name: `${qty} Lượt Đánh Boss`,
      image: '/game-assets/item_attack_turn.png',
      color: '#10b981',
      badge: 'Khiêu Chiến Boss',
      isHat: false,
      subText: 'Tăng lượt khiêu chiến Boss Thế Giới'
    };
  }

  // 5. Rương Hoàng Gia VIP / Hòm Hoàng Kim
  if (lower.includes('hoàng gia') || lower.includes('hoàng kim')) {
    return {
      name: act.includes('3') ? '3 Rương Hoàng Gia VIP' : 'Rương Hoàng Gia VIP',
      image: '/game-assets/royal_chest_closed_trans.png',
      color: '#8b5cf6',
      badge: 'Kho Báu Hoàng Gia',
      isHat: false,
      subText: 'Mở ra cơ hội nhận trang bị Thần Thoại'
    };
  }

  // 6. Rương Boss / Rương Chiến Tích Boss
  if (lower.includes('chiến tích') || lower.includes('hòm boss') || lower.includes('rương boss')) {
    return {
      name: act.includes('5') ? '5 Rương Chiến Tích Boss' : (act.includes('3') ? '3 Rương Chiến Tích Boss' : 'Rương Chiến Tích Boss'),
      image: '/game-assets/boss_chest_closed_trans.png',
      color: '#3b82f6',
      badge: 'Rương Boss',
      isHat: false,
      subText: 'Chứa trang bị boss và tinh thể'
    };
  }

  // 7. Thẻ Reroll Siêu Cấp
  if (lower.includes('reroll siêu cấp') || lower.includes('siêu cấp')) {
    return {
      name: 'Thẻ Reroll Siêu Cấp',
      image: '/game-assets/item_the_reroll_sieucap.png',
      color: '#ec4899',
      badge: 'Tẩy Tối Thượng',
      isHat: false,
      subText: 'Đảm bảo ít nhất 2 dòng Cam/Đỏ'
    };
  }

  // 8. Thẻ Đột Phá Giày
  if (lower.includes('đột phá')) {
    return {
      name: 'Thẻ Đột Phá Giày Thần Tốc',
      image: '/game-assets/item_the_dotpha_giay.png',
      color: '#a855f7',
      badge: 'Đột Phá Bậc',
      isHat: false,
      subText: 'Nâng bậc & mở khóa hiệu ứng ẩn'
    };
  }

  // 9. Thẻ Reroll / Thẻ Tẩy Luyện
  if (lower.includes('reroll') || lower.includes('tẩy luyện')) {
    return {
      name: 'Thẻ Tẩy Luyện Thường',
      image: '/game-assets/item_the_reroll.png',
      color: '#06b6d4',
      badge: 'Tẩy Trang Bị',
      isHat: false,
      subText: 'Tẩy lại 1 dòng chỉ số bất kỳ'
    };
  }

  // 10. Tinh Thể Cường Hóa
  if (lower.includes('tinh thể')) {
    return {
      name: 'Tinh Thể Cường Hóa',
      image: '/game-assets/ring_crystal.png',
      color: '#38bdf8',
      badge: 'Nguyên Liệu',
      isHat: false,
      subText: 'Cường hóa trang bị nhẫn & dây chuyền'
    };
  }

  // 11. Đá Tinh Hoa
  if (lower.includes('tinh hoa')) {
    return {
      name: 'Đá Tinh Hoa Ma Thuật',
      image: '/game-assets/da_tinh_hoa.png',
      color: '#c084fc',
      badge: 'Nguyên Liệu Hiếm',
      isHat: false,
      subText: 'Dùng tôi luyện trang bị tối thượng'
    };
  }

  // 12. 5 Thẻ may mắn
  if (lower.includes('thẻ may mắn') || lower.includes('spin ticket')) {
    return {
      name: '5 Thẻ May Mắn (Lượt Chơi)',
      image: '/game-assets/item_spin_ticket_5.png',
      color: '#60a5fa',
      badge: 'Vé May Mắn',
      isHat: false,
      subText: 'Lượt chơi chung Vòng Quay & Lật Thẻ'
    };
  }

  // 13. Bùa Reset Boss
  if (lower.includes('reset boss')) {
    return {
      name: 'Bùa Reset Boss Thế Giới',
      image: '/game-assets/item_reset_boss.png',
      color: '#38bdf8',
      badge: 'Bùa Ma Thuật',
      isHat: false,
      subText: 'Hồi sinh Boss để khiêu chiến tiếp'
    };
  }

  // 14. Lật Thẻ x10
  if (lower.includes('x10') || lower.includes('10 thẻ')) {
    return {
      name: 'Lật Bộ 10 Thẻ Phù Thủy',
      image: '/game-assets/wizard_card_back.png',
      color: '#c084fc',
      badge: 'Bộ 10 Lá Bài',
      isHat: false,
      subText: 'Đã mở trọn vẹn 10 phần quà ma thuật trên bàn'
    };
  }

  // 15. Check matching wizard items
  if (Array.isArray(wizardItemsList)) {
    const matched = wizardItemsList.find(it => it && it.name && lower.includes(it.name.toLowerCase()));
    if (matched) {
      return {
        name: matched.name,
        image: matched.image || '/game-assets/wizard_card_back.png',
        color: matched.color || '#a855f7',
        badge: matched.category || matched.type || 'Vật phẩm',
        isHat: !!(matched.is_special || matched.type === 'game_hat_legendary'),
        subText: matched.desc || 'Phần thưởng sự kiện Phù Thủy'
      };
    }
  }

  return {
    name: act || 'Phần thưởng Phù Thủy',
    image: '/game-assets/wizard_card_back.png',
    color: '#a855f7',
    badge: 'Phù Thủy',
    isHat: false,
    subText: 'Sự Kiện Lật Thẻ Bài'
  };
};

export default function WizardCardFlip(props) {
  const {
    currentUser,
    currentEventNow,
    wizardEventConfig: propConfig,
    config,
    wizardItems: propItems,
    rewards,
    wizardPity: propPity,
    setWizardPity,
    requireAuth: propRequireAuth,
    onRequireAuth,
    showToast,
    setCurrentView = () => {},
    transactionsDb = [],
    setTransactionsDb = () => {},
    onAddTransaction,
    usersDb = [],
    setUsersDb = () => {},
    onUpdateUser,
    onOpenDeposit,
    onOpenHistory
  } = props;

  const wizardPity = Number(propPity !== undefined && propPity !== null ? propPity : (currentUser?.wizard_pity || 0));
  const requireAuth = propRequireAuth || onRequireAuth;
  const wizardEventConfig = propConfig || config || {};
  const wizardItems = useMemo(() => {
    if (Array.isArray(propItems) && propItems.length > 0) return propItems;
    if (Array.isArray(rewards) && rewards.length > 0) return rewards;
    return DEFAULT_WIZARD_ITEMS;
  }, [propItems, rewards]);

  const [isFlipping, setIsFlipping] = useState(false);
  const isFlippingRef = useRef(false);
  const [flipCount, setFlipCount] = useState(1); // 1 or 10
  const [activeTab, setActiveTab] = useState('arena'); // 'arena' | 'rules' | 'history' | 'winners'
  
  const CARD_BACK_IMG = '/wizard_card_back.jpg';

  // 10 Cards Arena State (Bàn Bài 10 Lá Ma Thuật)
  const [tableCards, setTableCards] = useState(() => 
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      isFlipped: false,
      item: null,
      isHat: false,
      isPityTrigger: false
    }))
  );

  // x10 modal state
  const [x10Results, setX10Results] = useState([]);
  const [showX10Modal, setShowX10Modal] = useState(false);

  // Function to reset / reshuffle all 10 cards face-down
  const handleResetTable = () => {
    if (isFlippingRef.current) return;
    playSound('chestOpenSound');
    setTableCards(Array.from({ length: 10 }, (_, i) => ({
      id: i,
      isFlipped: false,
      item: null,
      isHat: false,
      isPityTrigger: false
    })));
    if (typeof showToast === 'function') {
      showToast('Đã xáo và úp lại toàn bộ 10 lá bài ma thuật!', 'success');
    }
  };

  // Sound effects
  const playSound = (soundId) => {
    try {
      const audio = document.getElementById(soundId);
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0.6;
        audio.play().catch(() => {});
      }
    } catch (e) {}
  };

  const pityThreshold = wizardEventConfig?.pity_threshold || wizardEventConfig?.pityTarget || 120;
  const currentSpins = Number(currentUser?.spins || 0);

  // Identify the special grand prize (Nón Huyền Thoại)
  const specialItem = useMemo(() => {
    return (wizardItems || []).find(it => 
      it && (
        it.is_special || 
        it.isLegendary ||
        it.type === 'game_hat_legendary' || 
        it.type === 'hat' ||
        it.id === 'hat_wizard_legendary' ||
        (it.name && it.name.toLowerCase().includes('nón'))
      )
    ) || DEFAULT_WIZARD_ITEMS[0];
  }, [wizardItems]);

  // Recent flip history from transactions
  const personalHistory = useMemo(() => {
    if (!currentUser?.name) return [];
    return (transactionsDb || [])
      .filter(t => {
        if (!t || t.user !== currentUser.name) return false;
        const isWizardTx = t.type === 'wizard_card_win' || (t.action && t.action.includes('Lật Thẻ Phù Thủy'));
        if (!isWizardTx) return false;
        // Loại bỏ triệt để mọi bản ghi test cũ của Admin nếu còn lưu trong local cache trình duyệt
        if (currentUser.role === 'admin' || currentUser.name === 'Admin') {
          if (t.id?.startsWith('WIZ_179213') || t.id?.startsWith('WIZ10') || t.date?.includes('16/10/2026')) {
            return false;
          }
        }
        return true;
      })
      .slice(0, 50);
  }, [transactionsDb, currentUser?.name, currentUser?.role]);

  // Legendary hat winners leaderboard
  const specialWinners = useMemo(() => {
    return (transactionsDb || [])
      .filter(t => {
        if (!t) return false;
        const isHat = (
          t.isHatWin ||
          (t.action && (t.action.includes('Nón Huyền Thoại') || t.action.includes('Mũ Huyền Thoại'))) ||
          (t.reward_name && t.reward_name.includes('Nón Huyền Thoại'))
        );
        if (!isHat) return false;
        // Tuyệt đối không cho phép tài khoản Admin hiển thị trên bảng vinh danh
        if (t.user === 'Admin' || (t.user && t.user.toLowerCase() === 'admin')) {
          return false;
        }
        return true;
      })
      .slice(0, 20);
  }, [transactionsDb]);

  // Execute Card Flip (1 or 10 cards)
  const handleFlip = async (count, targetCardIndex = null) => {
    if (!currentUser) {
      if (typeof requireAuth === 'function') requireAuth('wizard');
      return;
    }

    if (isFlippingRef.current) return;

    if (currentSpins < count) {
      if (typeof showToast === 'function') {
        showToast(`Bạn cần có ít nhất ${count} Thẻ may mắn để lật bài! Vui lòng nạp thêm lượt.`, 'error');
      }
      return;
    }

    // Determine target index for 1 card flip
    let chosenIdx = targetCardIndex;
    if (count === 1) {
      if (chosenIdx === null || chosenIdx === undefined) {
        // Nút ấn mở thẻ random: lấy ngẫu nhiên 1 trong các thẻ đang úp
        const unflippedIndices = tableCards
          .map((c, i) => (!c.isFlipped ? i : null))
          .filter(i => i !== null);

        if (unflippedIndices.length === 0) {
          // Cả 10 thẻ đều đã mở -> reset lại cả 10 thẻ úp mặt rồi chọn ngẫu nhiên 1 thẻ
          setTableCards(Array.from({ length: 10 }, (_, i) => ({
            id: i,
            isFlipped: false,
            item: null,
            isHat: false,
            isPityTrigger: false
          })));
          chosenIdx = Math.floor(Math.random() * 10);
        } else {
          // Chọn ngẫu nhiên trong danh sách thẻ đang úp
          chosenIdx = unflippedIndices[Math.floor(Math.random() * unflippedIndices.length)];
        }
      } else {
        // Bấm trực tiếp vào thẻ
        if (tableCards[chosenIdx]?.isFlipped) {
          if (typeof showToast === 'function') {
            showToast(`Lá bài #${chosenIdx + 1} này đã được lật rồi! Hãy chọn lá bài khác hoặc bấm Xáo Bài.`, 'info');
          }
          return;
        }
      }
    } else {
      // Khi lật 10 thẻ: úp lại toàn bộ các thẻ trước để chuẩn bị hiệu ứng mở mới đồng loạt
      setTableCards(Array.from({ length: 10 }, (_, i) => ({
        id: i,
        isFlipped: false,
        item: null,
        isHat: false,
        isPityTrigger: false
      })));
    }

    isFlippingRef.current = true;
    setIsFlipping(true);
    setFlipCount(count);

    playSound('chestOpenSound');

    try {
      // 1. GIAO MỌI QUYỀN SINH SÁT CHO SERVER (Trừ lượt quay + Check bảo hiểm 120 + Chọn quà)
      let rpcResult = null;
      if (count === 1) {
        const { data, error } = await supabase.rpc('m_flip_wizard_card', {
          khach_id: currentUser.id,
          p_cost: 1
        });
        if (error || !data?.success) {
          setIsFlipping(false);
          isFlippingRef.current = false;
          return showToast(error?.message || data?.message || "Lỗi lật thẻ! Vui lòng thử lại sau.", 'error');
        }
        rpcResult = data;
      } else {
        const { data, error } = await supabase.rpc('m_flip_wizard_card_x10', {
          khach_id: currentUser.id,
          p_cost: 10
        });
        if (error || !data?.success) {
          setIsFlipping(false);
          isFlippingRef.current = false;
          return showToast(error?.message || data?.message || "Lỗi lật 10 thẻ! Vui lòng thử lại sau.", 'error');
        }
        rpcResult = data;
      }

      const finalNewSpins = rpcResult.new_spins;
      const finalPity = rpcResult.new_pity;
      const wonItems = count === 1 ? [rpcResult.item] : (rpcResult.items || []);
      const hadHatWin = count === 1 ? Boolean(rpcResult.is_hat) : ((rpcResult.hat_won_count || 0) > 0);

      // 2. GHI NHẬN LỊCH SỬ GIAO DỊCH LÊN GIAO DIỆN CLIENT
      const nowStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const txId = `WIZ_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const txAction = count === 1 
        ? `Lật Thẻ Phù Thủy: ${wonItems[0]?.name || 'Vật phẩm'}${wonItems[0]?.is_pity_trigger ? ' (Nổ Bảo Hiểm 120/120!)' : ''}`
        : `Lật Thẻ Phù Thủy x10 (10 Thẻ)${hadHatWin ? ' - 🧙 Trúng Nón Huyền Thoại!' : ''}`;

      const newTx = {
        id: txId,
        user: currentUser.name || 'Khách hàng',
        action: txAction,
        amount: -count,
        date: nowStr,
        status: 'Thành công',
        type: 'wizard_card_win',
        isSpinCost: true,
        reward_name: count === 1 ? wonItems[0]?.name : (hadHatWin ? 'Nón Huyền Thoại' : 'Bộ 10 Lá Ma Thuật'),
        reward_image: count === 1 ? wonItems[0]?.image : (hadHatWin ? LEGENDARY_HAT_IMG : '/game-assets/wizard_card_back.png'),
        reward_color: count === 1 ? wonItems[0]?.color : (hadHatWin ? '#ffd700' : '#c084fc'),
        isHatWin: hadHatWin
      };

      if (typeof onAddTransaction === 'function') {
        onAddTransaction(newTx);
      } else if (typeof setTransactionsDb === 'function') {
        setTransactionsDb(prev => [newTx, ...(Array.isArray(prev) ? prev : [])]);
      }

      // 3. TỰ ĐỘNG GỬI VẬT PHẨM VÀO SUPABASE GAME_ORDERS CHO IN-GAME (main.py -> game_core.py)
      const targetGameUid = currentUser.linked_game_id || currentUser.game_id || currentUser.name;
      if (targetGameUid) {
        const orderId = `WO_WIZ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const orderRewards = {
          source_type: 'wizard_card_flip',
          is_wizard: true,
          is_wheel: false,
          is_card_flip: true,
          silent: false,
          notify: hadHatWin,
          notify_discord: hadHatWin,
          items: []
        };

        wonItems.forEach(it => {
          if (!it) return;
          const isThisHat = Boolean(
            it.is_hat ||
            it.type === 'hat' ||
            it.type === 'game_hat_legendary' ||
            it.id === 'hat_wizard_legendary' ||
            (it.name && (it.name.toLowerCase().includes('nón') || it.name.toLowerCase().includes('phù thủy')))
          );
          if (isThisHat) {
            orderRewards.items.push({
              id: 'game_hat_legendary',
              name: 'Nón Huyền Thoại',
              category: 'hat',
              tier: 'Huyền Thoại',
              quantity: 1,
              image: 'hat_huyen_thoai.png'
            });
          } else if (it.type === 'game_attacks' || it.id === 'item_attack_turn') {
            orderRewards.attacks = (orderRewards.attacks || 0) + (Number(it.value) || 50000);
          } else if (it.type === 'game_boss_chests' || it.id === 'CHEST_BOSS_5') {
            orderRewards.boss_chests = (orderRewards.boss_chests || 0) + (Number(it.value) || 5);
          } else if (it.type === 'game_royal_chests' || it.id === 'CHEST_ROYAL_3') {
            orderRewards.royal_chests = (orderRewards.royal_chests || 0) + (Number(it.value) || 3);
          } else if (it.type === 'game_coins' || it.type === 'game_currency' || it.id === 'GAME_COINS') {
            orderRewards.coins = (orderRewards.coins || 0) + (Number(it.value) || 10);
          } else if (it.type === 'game_material' || it.id === 'ITEM_ESSENCE_STONE') {
            orderRewards.items.push({
              id: 'item_essence_stone',
              name: 'Đá Tinh Hoa',
              category: 'material',
              quantity: Number(it.value) || 1,
              image: 'da_tinh_hoa.png'
            });
          } else if (it.type === 'game_material' || it.id === 'ITEM_RING_CRYSTAL') {
            orderRewards.items.push({
              id: 'item_ring_crystal',
              name: 'Tinh Thể Cường Hóa',
              category: 'material',
              quantity: Number(it.value) || 1,
              image: 'ring_crystal.png'
            });
          } else if (it.id === 'item_the_reroll_sieucap') {
            orderRewards.items.push({
              id: 'item_the_reroll_sieucap',
              name: 'Thẻ Reroll Siêu Cấp',
              category: 'consumable',
              quantity: Number(it.value) || 1,
              image: 'item_the_reroll_sieucap.png'
            });
          } else if (it.id === 'item_the_dotpha_giay') {
            orderRewards.items.push({
              id: 'item_the_dotpha_giay',
              name: 'Thẻ Đột Phá',
              category: 'consumable',
              quantity: Number(it.value) || 1,
              image: 'item_the_dotpha_giay.png'
            });
          } else if (it.id === 'item_the_reroll') {
            orderRewards.items.push({
              id: 'item_the_reroll',
              name: 'Thẻ Reroll',
              category: 'consumable',
              quantity: Number(it.value) || 1,
              image: 'item_the_reroll.png'
            });
          } else if (it.id === 'ITEM_RESET_BOSS') {
            orderRewards.items.push({
              id: 'item_reset_boss',
              name: 'Bùa Reset Boss',
              category: 'item_reset_boss',
              quantity: Number(it.value) || 1,
              image: 'item_reset_boss.png'
            });
          }
        });

        try {
          await supabase.from('game_orders').insert([{
            id: orderId,
            user_id: targetGameUid,
            nickname: currentUser.name,
            web_user: currentUser.id,
            package_id: count === 1 ? 'wizard_flip_x1' : 'wizard_flip_x10',
            package_name: count === 1 ? 'Lật Thẻ Bài Phù Thủy (x1)' : 'Lật Thẻ Bài Phù Thủy (x10)',
            price: 0,
            notify: hadHatWin,
            rewards: {
              ...orderRewards,
              notify: hadHatWin,
              notify_discord: hadHatWin,
              silent: false,
              is_hat_win: hadHatWin,
              source_type: 'wizard_card_flip',
              is_wizard: true
            },
            status: 'pending'
          }]);
        } catch (ordErr) {
          console.warn("Lỗi gửi game_orders lật bài:", ordErr);
        }
      }

      // 4. ĐỒNG BỘ TIỀN & PITY LÊN GIAO DIỆN NGƯỜI DÙNG
      if (typeof setWizardPity === 'function') setWizardPity(finalPity);
      try { localStorage.setItem(`shop_wizard_pity_${currentUser.id}`, finalPity.toString()); } catch (e) {}

      const updatedUser = {
        ...currentUser,
        spins: finalNewSpins,
        wizard_pity: finalPity
      };
      if (typeof onUpdateUser === 'function') {
        onUpdateUser(updatedUser);
      } else {
        currentUser.spins = finalNewSpins;
        currentUser.wizard_pity = finalPity;
        try { localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser)); } catch (e) {}
        if (typeof setUsersDb === 'function') {
          setUsersDb(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        }
      }

      // Animate 3D Card Flips on Table
      if (count === 1) {
        setTimeout(() => {
          setIsFlipping(false);
          isFlippingRef.current = false;

          const win = wonItems[0];
          setTableCards(prev => prev.map((c, cIdx) => cIdx === chosenIdx ? {
            ...c,
            isFlipped: true,
            item: win,
            isHat: win.is_hat,
            isPityTrigger: win.is_pity_trigger
          } : c));

          if (win.is_hat || win.is_pity_trigger) {
            playSound('celebrationSound');
            if (typeof showToast === 'function') {
              showToast('🎉 XUẤT SẮC! BẠN ĐÃ LẬT TRÚNG NÓN PHÙ THỦY HUYỀN THOẠI!', 'success');
            }
          } else {
            playSound('winSound');
          }
        }, 500);
      } else {
        // count === 10: Toàn bộ 10 thẻ mở ra ngay trên bàn hiển thị phần quà luôn
        wonItems.forEach((wonItem, idx) => {
          setTimeout(() => {
            setTableCards(prev => prev.map((c, cIdx) => cIdx === idx ? {
              ...c,
              isFlipped: true,
              item: wonItem,
              isHat: wonItem.is_hat,
              isPityTrigger: wonItem.is_pity_trigger
            } : c));
          }, 80 + idx * 50);
        });

        setTimeout(() => {
          setIsFlipping(false);
          isFlippingRef.current = false;
          if (hadHatWin) {
            playSound('celebrationSound');
            if (typeof showToast === 'function') {
              showToast('👑 TUYỆT VỜI! BẠN ĐÃ LẬT TRÚNG NÓN HUYỀN THOẠI TRÊN BÀN BÀI!', 'success');
            }
          } else {
            playSound('winSound');
            if (typeof showToast === 'function') {
              showToast('✨ Đã mở toàn bộ 10 thẻ ma thuật trực tiếp trên bàn!', 'success');
            }
          }
        }, 80 + 10 * 50 + 200);
      }

    } catch (err) {
      setIsFlipping(false);
      isFlippingRef.current = false;
      if (typeof showToast === 'function') {
        showToast("Đã xảy ra lỗi trong quá trình lật thẻ. Số lượt quay của bạn được giữ nguyên!", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0518] text-slate-100 font-sans pb-28 pt-4 px-2 sm:px-4 relative overflow-hidden">
      {/* Background mystical cosmic gradients & arcane runes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-fuchsia-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* HEADER SỰ KIỆN PHÙ THỦY */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs md:text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse">
            <Sparkles size={16} className="text-amber-300" />
            <span>SỰ KIỆN GIỚI HẠN: LẬT THẺ PHÙ THỦY HUYỀN BÍ</span>
            <span className="bg-amber-400 text-purple-950 text-[10px] px-2 py-0.5 rounded-full font-black">HOT</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-300 tracking-tight drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]">
            LẬT THẺ BÀI PHÙ THỦY
          </h1>
          
          <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Hóa thân thành đại pháp sư mở ra kho tàng bảo vật ma thuật. Chạm mốc bảo hiểm <span className="text-amber-300 font-extrabold underline decoration-amber-400 decoration-2">120/120 Thẻ</span> chắc chắn <span className="text-amber-300 font-black">100% NỔ NÓN HUYỀN THOẠI</span>!
          </p>
        </div>

        {/* STATS BAR: THẺ MAY MẮN & THANH BẢO HIỂM 120 LƯỢT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#130b29]/90 border border-purple-500/30 p-4 sm:p-5 rounded-3xl shadow-[0_0_30px_rgba(147,51,234,0.15)] backdrop-blur-md">
          
          {/* Số Thẻ May Mắn hiện có */}
          <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-4 p-3 bg-purple-950/40 border border-purple-500/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/40 shrink-0">
                <Gift size={24} className="text-amber-300 animate-bounce" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Thẻ may mắn của bạn</span>
                <div className="text-2xl font-black text-amber-300 flex items-center gap-1.5">
                  <span>{currentSpins.toLocaleString('vi-VN')}</span>
                  <span className="text-xs text-purple-300 font-normal">thẻ</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (typeof setCurrentView === 'function') setCurrentView('naptien');
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-purple-950 font-black text-xs rounded-xl shadow-md transition-transform hover:scale-105 shrink-0"
            >
              + Nạp Thẻ
            </button>
          </div>

          {/* Thanh Tiến Trình Bảo Hiểm 120/120 */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-2 p-3 bg-purple-950/40 border border-purple-500/20 rounded-2xl">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-1.5 text-purple-200">
                <Shield size={16} className="text-amber-400" />
                Tiến độ nổ Nón Huyền Thoại (Bảo hiểm):
              </span>
              <span className="text-amber-300 font-black tracking-wide text-sm sm:text-base">
                {wizardPity} / {pityThreshold} thẻ
              </span>
            </div>

            <div className="w-full h-4 bg-slate-900/80 rounded-full border border-purple-500/30 overflow-hidden relative p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 transition-all duration-700 relative shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                style={{ width: `${Math.min(100, Math.max(3, (wizardPity / pityThreshold) * 100))}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Lượt 1 - {pityThreshold - 1}: Rơi quà theo tỉ lệ %</span>
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Crown size={12} className="text-amber-400" />
                Lượt {pityThreshold}: Chắc chắn 100% nổ Nón Huyền Thoại!
              </span>
            </div>
          </div>

        </div>

        {/* NAVIGATION TABS BÊN DƯỚI */}
        <div className="flex items-center justify-center gap-2 border-b border-purple-900/40 pb-3">
          {[
            { id: 'arena', label: 'Bàn Bài Ma Thuật', icon: <Sparkles size={16} /> },
            { id: 'rules', label: 'Thể Lệ & Tỉ Lệ', icon: <Info size={16} /> },
            { id: 'history', label: 'Lịch Sử Của Bạn', icon: <History size={16} /> },
            { id: 'winners', label: 'Vinh Danh Nổ Nón', icon: <Trophy size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] border border-purple-400/50'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: BÀN BÀI MA THUẬT (THE ARENA) */}
        {activeTab === 'arena' && (
          <div className="space-y-8">
            
            {/* VÙNG BÀN BÀI TRUNG TÂM (MAGIC CARD TABLE: 10 THẺ SẴN SÀNG) */}
            <div className="relative p-4 sm:p-8 rounded-3xl bg-gradient-to-b from-[#180f33] via-[#120827] to-[#0c051a] border-2 border-purple-500/40 shadow-[0_0_50px_rgba(147,51,234,0.2)] flex flex-col items-center justify-center">
              
              {/* Vòng tròn phép thuật hào quang ma trận */}
              <div className="absolute w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full border border-purple-500/15 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none"></div>
              <div className="absolute w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full border border-fuchsia-500/15 animate-[spin_40s_linear_infinite_reverse] pointer-events-none"></div>

              {/* Thanh điều khiển Bàn Bài: Tiêu đề & Nút Xáo/Úp Bài */}
              <div className="w-full flex items-center justify-between mb-5 z-10 px-1 sm:px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-xs sm:text-sm font-black text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-400" /> Bàn Bài Ma Thuật (10 Lá Phù Thủy Sẵn Sàng)
                  </span>
                </div>
                
                <button
                  onClick={handleResetTable}
                  disabled={isFlipping}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  title="Úp lại toàn bộ 10 thẻ bài"
                >
                  <RefreshCw size={14} className={isFlipping ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">Xáo / Úp Lại Bài</span>
                  <span className="sm:hidden">Úp Lại</span>
                </button>
              </div>

              {/* BỐ CỤC 10 LÁ BÀI MA THUẬT (2 hàng x 5 cột) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 w-full max-w-5xl mb-7 z-10">
                {tableCards.map((card, idx) => {
                  const isCardHat = card.isHat || card.item?.is_hat || card.item?.type === 'game_hat_legendary' || (card.item?.name && card.item?.name.includes('Nón Huyền Thoại'));
                  return (
                    <div 
                      key={card.id}
                      className="perspective-1000 aspect-[2/3] w-full"
                      onClick={() => {
                        if (!isFlipping && !card.isFlipped) {
                          handleFlip(1, idx);
                        }
                      }}
                    >
                      <div 
                        className={`w-full h-full relative rounded-2xl transition-transform duration-700 transform-style-3d cursor-pointer select-none shadow-[0_8px_25px_rgba(0,0,0,0.7)] ${
                          card.isFlipped ? 'rotate-y-180' : 'hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]'
                        }`}
                      >
                        {/* MẶT SAU: ẢNH HALLOWEEN PHÙ THỦY MA MỊ */}
                        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden border-2 border-amber-400/60 hover:border-amber-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] bg-[#120826] group">
                          <img 
                            src={CARD_BACK_IMG} 
                            alt="Mặt sau thẻ bài Halloween Phù Thủy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = '/game-assets/wizard_card_back.jpg'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45 pointer-events-none"></div>
                          
                          {/* Số thứ tự thẻ */}
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-purple-950/85 border border-amber-400/50 text-[10px] font-black text-amber-300 backdrop-blur-sm shadow-md">
                            #{idx + 1}
                          </div>

                          {/* Ký hiệu ma thuật góc trên */}
                          <div className="absolute top-2 right-2 text-amber-300/80 text-xs font-serif">
                            ✦
                          </div>

                          {/* Nhãn hướng dẫn lật */}
                          <div className="absolute bottom-2.5 inset-x-2 text-center pointer-events-none">
                            <span className="text-[10px] sm:text-[11px] font-black text-amber-300 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase block bg-purple-950/80 py-0.5 rounded-lg border border-purple-500/30">
                              LẬT THẺ
                            </span>
                          </div>
                        </div>

                        {/* MẶT TRƯỚC: PHẦN THƯỞNG KHI ĐÃ LẬT */}
                        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 p-2 sm:p-3 flex flex-col items-center justify-between overflow-hidden ${
                          isCardHat
                            ? 'bg-gradient-to-b from-amber-950/95 via-purple-950/95 to-black border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.8)] ring-2 ring-amber-400/70'
                            : 'bg-gradient-to-b from-[#1e113b] via-[#140b2a] to-[#0d071c] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        }`}>
                          {/* Header bên trong thẻ đã lật */}
                          <div className="w-full flex justify-between items-center text-[9px] sm:text-[10px] font-black text-amber-300">
                            <span className="flex items-center gap-1">
                              {isCardHat && <Crown size={12} className="text-amber-400" />}
                              {isCardHat ? 'HUYỀN THOẠI' : `#${idx + 1}`}
                            </span>
                            {card.isPityTrigger ? (
                              <span className="bg-amber-400 text-purple-950 px-1 py-0.2 rounded font-black text-[8px] sm:text-[9px]">
                                120/120
                              </span>
                            ) : (
                              <span className="text-purple-300/80 text-[9px]">ĐÃ MỞ</span>
                            )}
                          </div>

                          {/* Hình ảnh & Tên phần thưởng */}
                          <div className="flex flex-col items-center justify-center my-auto space-y-1.5 w-full">
                            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center p-1.5 relative overflow-hidden ${
                              isCardHat ? 'bg-amber-500/20 border border-amber-400/50' : 'bg-purple-950/60 border border-purple-500/30'
                            }`}>
                              {card.item?.image ? (
                                <img 
                                  src={card.item.image} 
                                  alt={card.item.name}
                                  className={`w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] ${
                                    isCardHat ? 'drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse' : ''
                                  }`}
                                  onError={(e) => { e.target.src = '/game-assets/hat_huyen_thoai.png'; }}
                                />
                              ) : (
                                <span className="text-2xl sm:text-3xl">✨</span>
                              )}
                            </div>

                            <span className={`text-[11px] sm:text-xs font-black text-center line-clamp-2 px-0.5 leading-tight ${
                              isCardHat ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'text-slate-100'
                            }`}>
                              {card.item?.name || 'Phần thưởng'}
                            </span>
                          </div>

                          {/* Huy hiệu trạng thái dưới chân thẻ */}
                          <div className={`w-full text-center py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold ${
                            isCardHat 
                              ? 'bg-amber-500 text-purple-950 font-black shadow-md' 
                              : 'bg-purple-950/70 border border-purple-500/30 text-purple-200'
                          }`}>
                            {isCardHat ? 'BẢO VẬT TỐI THƯỢNG' : 'Đã nhận vào túi'}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* NÚT BẤM LẬT THẺ: 1 DÒNG GỌN ĐẸP & CHUẨN GAMING */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full max-w-2xl px-2 z-10">
                {/* NÚT LẬT 1 THẺ */}
                <button
                  disabled={isFlipping}
                  onClick={() => handleFlip(1)}
                  className={`w-full sm:w-auto sm:flex-1 py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 whitespace-nowrap select-none border ${
                    isFlipping
                      ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/40 shadow-[0_4px_20px_rgba(147,51,234,0.45)] hover:shadow-[0_6px_30px_rgba(147,51,234,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                  }`}
                  title="Lật ngẫu nhiên 1 lá bài đang úp hoặc bấm trực tiếp vào lá bài muốn mở"
                >
                  <Sparkles size={18} className="text-amber-300 shrink-0" />
                  <span className="tracking-wide">LẬT 1 THẺ</span>
                  <span className="text-xs text-amber-300 font-black bg-black/40 px-2.5 py-0.5 rounded-lg border border-purple-400/30 shadow-inner shrink-0">
                    -1 Thẻ
                  </span>
                </button>

                {/* NÚT LẬT 10 THẺ */}
                <button
                  disabled={isFlipping}
                  onClick={() => handleFlip(10)}
                  className={`w-full sm:w-auto sm:flex-1 py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 whitespace-nowrap select-none border ${
                    isFlipping
                      ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white border-amber-300/50 shadow-[0_4px_25px_rgba(245,158,11,0.5)] hover:shadow-[0_6px_35px_rgba(245,158,11,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                  }`}
                  title="Mở toàn bộ 10 thẻ bài trực tiếp trên bàn"
                >
                  <Flame size={18} className="text-amber-200 shrink-0 animate-pulse" />
                  <span className="tracking-wide">LẬT 10 THẺ</span>
                  <span className="text-xs text-amber-200 font-black bg-black/45 px-2.5 py-0.5 rounded-lg border border-amber-400/40 shadow-inner shrink-0">
                    -10 Thẻ
                  </span>
                </button>
              </div>

            </div>

            {/* DANH SÁCH CÁC PHẦN THƯỞNG NỔI BẬT TRONG SỰ KIỆN */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Crown size={20} className="text-amber-400" />
                Kho Phần Thưởng Ma Thuật Có Thể Lật Trúng
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {wizardItems.map((item, idx) => {
                  const isHat = item.is_special || item.type === 'game_hat_legendary' || (item.name && item.name.includes('Nón Huyền Thoại'));
                  return (
                    <div 
                      key={item.id || idx}
                      className={`p-3 rounded-2xl flex flex-col items-center text-center justify-between border transition-all duration-300 hover:-translate-y-1 ${
                        isHat 
                          ? 'bg-gradient-to-b from-amber-950/60 to-purple-950/80 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40' 
                          : 'bg-[#130b29]/80 border-purple-500/20 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-purple-950/40 flex items-center justify-center p-2 mb-2 relative">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className={`w-full h-full object-contain ${isHat ? 'filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : ''}`}
                            onError={(e) => { e.target.src = '/game-assets/mystery_box_closed.png'; }}
                          />
                        ) : (
                          <span className="text-2xl">💨</span>
                        )}
                        {isHat && (
                          <span className="absolute -top-1 -right-1 bg-amber-400 text-purple-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                            TOP 1
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5 w-full">
                        <span className={`text-xs font-bold block truncate ${isHat ? 'text-amber-300' : 'text-slate-200'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-purple-300/80 font-medium block">
                          Tỉ lệ: {item.rate || '10%'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: THỂ LỆ & TỈ LỆ (%) */}
        {activeTab === 'rules' && (
          <div className="bg-[#130b29]/90 border border-purple-500/30 p-6 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-amber-300 flex items-center gap-2">
              <Info size={22} /> Thể Lệ Sự Kiện & Cơ Chế Bảo Hiểm 120 Thẻ
            </h3>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 space-y-2">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Crown size={18} className="text-amber-400" /> 1. Cơ Chế Bảo Hiểm 120 Thẻ (100% Chắc Chắn Ra Nón)
                </h4>
                <p>
                  Mỗi lần lật thẻ không trúng <strong className="text-amber-300">Nón Huyền Thoại</strong>, bộ đếm bảo hiểm cá nhân của bạn sẽ tăng thêm 1 điểm (<strong className="text-purple-300">X / 120</strong>).
                </p>
                <p>
                  Khi đạt mốc <strong className="text-amber-300 font-extrabold">120/120 Thẻ</strong>, hệ thống tự động bỏ qua tính toán ngẫu nhiên và <strong className="text-amber-300 font-extrabold underline">CHẮC CHẮN 100% LẬT RA BẢO VẬT NÓN HUYỀN THOẠI</strong>!
                </p>
                <p>
                  Sau khi nổ Nón Huyền Thoại (dù nổ tự nhiên ở lượt bất kỳ hay nổ qua bảo hiểm), bộ đếm bảo hiểm sẽ tự động reset về <strong className="text-white">0</strong> để bắt đầu chu kỳ bảo hiểm mới.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 space-y-2">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Flame size={18} className="text-rose-400" /> 2. Cơ Chế Lật 10 Thẻ Liên Hoàn
                </h4>
                <p>
                  Khi bấm "Lật 10 Thẻ", hệ thống máy chủ sẽ chạy tuần tự từng thẻ từ 1 đến 10. Nếu mốc 120/120 rơi vào bất kỳ thẻ nào trong 10 thẻ đó, thẻ đó sẽ nổ ngay Nón Huyền Thoại, reset bảo hiểm về 0, và các thẻ tiếp theo sẽ tiếp tục tích lũy từ 1.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 space-y-2">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Gift size={18} className="text-blue-400" /> 3. Đồng Bộ Túi Đồ Discord Bot
                </h4>
                <p>
                  Toàn bộ vật phẩm, lượt đánh, rương và Nón Huyền Thoại trúng từ sự kiện sẽ được tự động cộng thẳng vào túi đồ của người chơi trong hệ thống Game Mộng Thiên Huyễn và Discord Bot ngay lập tức.
                </p>
              </div>
            </div>

            {/* BẢNG TỈ LỆ RƠI CHI TIẾT */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-base">Bảng Tỉ Lệ Rơi Chi Tiết Của Các Phần Thưởng:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-purple-950/80 border-b border-purple-500/30 text-purple-300">
                      <th className="p-3">Phần Thưởng</th>
                      <th className="p-3">Loại Quà</th>
                      <th className="p-3">Tỉ Lệ Rơi (%)</th>
                      <th className="p-3">Bảo Hiểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {wizardItems.map((it, idx) => {
                      const isHat = it.is_special || it.type === 'game_hat_legendary' || (it.name && it.name.includes('Nón Huyền Thoại'));
                      return (
                        <tr key={it.id || idx} className={isHat ? 'bg-amber-950/30 font-bold' : ''}>
                          <td className="p-3 flex items-center gap-2">
                            {it.image ? <img src={it.image} alt={it.name} className="w-6 h-6 object-contain" /> : <span>💨</span>}
                            <span className={isHat ? 'text-amber-300' : 'text-slate-200'}>{it.name}</span>
                          </td>
                          <td className="p-3 text-slate-400">{it.type || 'Vật phẩm'}</td>
                          <td className="p-3 text-purple-300 font-bold">{it.rate || '10%'}</td>
                          <td className="p-3">
                            {isHat ? (
                              <span className="text-amber-400 font-bold">100% tại lượt 120</span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LỊCH SỬ CỦA BẠN */}
        {activeTab === 'history' && (
          <div className="bg-[#130b29]/95 border border-purple-500/40 p-5 sm:p-7 rounded-3xl space-y-5 shadow-[0_0_30px_rgba(147,51,234,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <h3 className="text-xl font-black text-purple-200 flex items-center gap-2.5">
                <History size={24} className="text-purple-400" /> 
                <span>Lịch Sử Lật Thẻ Cá Nhân</span>
              </h3>
              <span className="text-xs text-purple-300 bg-purple-950/70 border border-purple-500/30 px-3 py-1.5 rounded-full font-bold self-start sm:self-auto">
                {personalHistory.length} Lượt lật gần nhất
              </span>
            </div>

            {personalHistory.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  🃏
                </div>
                <h4 className="text-lg font-bold text-slate-200">Chưa có lịch sử lật thẻ</h4>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Bạn chưa có lượt lật thẻ nào trong sự kiện. Hãy bấm chọn thẻ trên bàn hoặc bấm "Lật Thẻ Ngẫu Nhiên" để bắt đầu thử vận may nhận Nón Huyền Thoại!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-purple-900/40 bg-black/20">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-purple-950/90 border-b border-purple-500/30 text-purple-300 font-black uppercase text-[11px] sm:text-xs tracking-wider">
                      <th className="p-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><Clock size={13} className="text-purple-400" /> Thời Gian</span>
                      </th>
                      <th className="p-3.5 min-w-[260px]">
                        <span className="flex items-center gap-1.5"><Gift size={13} className="text-amber-400" /> Phần Thưởng Nhận Được</span>
                      </th>
                      <th className="p-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5"><Zap size={13} className="text-rose-400" /> Chi Phí</span>
                      </th>
                      <th className="p-3.5 whitespace-nowrap text-right">
                        <span className="inline-flex items-center gap-1.5"><Shield size={13} className="text-emerald-400" /> Trạng Thái</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30">
                    {personalHistory.map((t, idx) => {
                      const info = getRewardInfo(t.action, t, wizardItems);
                      return (
                        <tr 
                          key={t.id || idx} 
                          className={`transition-colors duration-150 hover:bg-purple-900/20 ${
                            info.isHat ? 'bg-amber-950/30' : (idx % 2 === 0 ? 'bg-purple-950/15' : 'bg-transparent')
                          }`}
                        >
                          {/* Thời gian */}
                          <td className="p-3.5 text-slate-400 whitespace-nowrap font-medium text-xs">
                            {t.date}
                          </td>

                          {/* Phần thưởng với ảnh trực quan */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {/* Khung ảnh vật phẩm */}
                              <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl p-1.5 shrink-0 flex items-center justify-center transition-all duration-200 ${
                                info.isHat 
                                  ? 'bg-gradient-to-br from-amber-500/30 to-purple-900/60 border-2 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.55)] animate-pulse'
                                  : 'bg-gradient-to-b from-purple-900/40 to-slate-900/60 border border-purple-500/40 shadow-inner'
                              }`}>
                                <img 
                                  src={info.image} 
                                  alt={info.name} 
                                  className="w-full h-full object-contain drop-shadow"
                                  onError={(e) => { e.currentTarget.src = '/game-assets/wizard_card_back.png'; }}
                                />
                                {info.isHat && (
                                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-purple-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                                    👑
                                  </span>
                                )}
                              </div>

                              {/* Tên vật phẩm & thông số chi tiết */}
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-black text-sm sm:text-base ${
                                    info.isHat 
                                      ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                                      : 'text-slate-100'
                                  }`}>
                                    {info.name}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${
                                    info.isHat 
                                      ? 'bg-amber-400/25 text-amber-300 border-amber-400/50 shadow-sm' 
                                      : 'bg-purple-900/50 text-purple-300 border-purple-500/40'
                                  }`}>
                                    {info.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                                  {info.subText}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Chi phí */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-500/40 font-black text-xs sm:text-sm">
                              <span>🎫</span>
                              <span>{t.amount} Thẻ</span>
                            </span>
                          </td>

                          {/* Trạng thái */}
                          <td className="p-3.5 whitespace-nowrap text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 text-xs font-black shadow-sm">
                              <Check size={12} className="stroke-[3]" />
                              <span>{t.status || 'Thành công'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BẢNG VINH DANH NỔ NÓN */}
        {activeTab === 'winners' && (
          <div className="bg-[#130b29]/95 border border-purple-500/40 p-5 sm:p-7 rounded-3xl space-y-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-amber-300 flex items-center gap-2.5">
                  <Trophy size={26} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]" /> 
                  <span>Bảng Vinh Danh Người Trúng Nón Huyền Thoại</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ghi danh những đại pháp sư may mắn nhất server đã lật trúng Bảo Vật Nón Huyền Thoại
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/80 px-3.5 py-1.5 rounded-full border border-purple-500/40 font-bold self-start sm:self-auto shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Cập nhật Realtime</span>
              </span>
            </div>

            {specialWinners.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-400/15 rounded-full blur-xl animate-pulse"></div>
                  <img 
                    src={LEGENDARY_HAT_IMG} 
                    alt="Nón Huyền Thoại" 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
                  />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <h4 className="text-lg sm:text-xl font-black text-amber-200">
                    Chưa có ai nổ Nón Huyền Thoại!
                  </h4>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Hãy tham gia lật thẻ bài phù thủy ngay hôm nay. Tiến độ bảo hiểm <strong className="text-amber-300 font-extrabold">120/120 Thẻ</strong> chắc chắn <strong className="text-amber-300 font-black underline">100% nổ Nón Huyền Thoại</strong> và khắc tên bạn vĩnh viễn trên Bảng Vinh Danh này!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specialWinners.map((win, idx) => (
                  <div 
                    key={win.id || idx} 
                    className="relative rounded-3xl bg-gradient-to-r from-[#1c0c38]/95 via-[#230f45]/90 to-amber-950/50 border-2 border-amber-500/50 hover:border-amber-400 p-4 sm:p-5 shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(245,158,11,0.35)] overflow-hidden group flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    {/* Hào quang nền */}
                    <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/25 transition-colors"></div>

                    {/* Bên trái: Thông tin người chơi & avatar có vương miện */}
                    <div className="flex items-center gap-3.5 z-10 w-full sm:w-auto">
                      <div className="relative shrink-0">
                        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[2px] shadow-lg shadow-amber-500/30">
                          <div className="w-full h-full rounded-2xl bg-[#140b28] flex items-center justify-center overflow-hidden">
                            {win.avatar_url ? (
                              <img src={win.avatar_url} alt={win.user} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl font-black text-amber-300">
                                {win.user ? win.user.charAt(0).toUpperCase() : '🧙'}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="absolute -top-2 -right-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-purple-950 text-[10px] font-black p-1 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                          <Crown size={12} className="fill-purple-950" />
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-amber-200 tracking-wide drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] truncate">
                            {win.user || 'Đại Pháp Sư'}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                            May Mắn Tối Thượng
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock size={12} className="text-purple-400" />
                          <span>{win.date || 'Vừa xong'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bên phải: Hộp trưng bày Nón Huyền Thoại cực kỳ hoành tráng */}
                    <div className="flex items-center gap-3.5 bg-amber-950/40 border border-amber-400/40 rounded-2xl p-2.5 px-3.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform z-10 w-full sm:w-auto justify-end">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md animate-pulse"></div>
                        <img 
                          src={LEGENDARY_HAT_IMG} 
                          alt="Nón Huyền Thoại" 
                          className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,215,0,0.85)] animate-pulse"
                        />
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 text-xs font-black shadow-md uppercase tracking-wider">
                          <Sparkles size={11} className="fill-purple-950" />
                          <span>NÓN HUYỀN THOẠI</span>
                        </div>
                        <p className="text-[11px] text-amber-300/90 font-black mt-1">
                          +450 Phép • +250 Kháng
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>


    </div>
  );
}
