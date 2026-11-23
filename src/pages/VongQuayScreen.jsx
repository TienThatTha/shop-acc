import React from 'react';
import {
  User, CheckCircle2, Wallet, X, Flame, History, Gift, Sparkles, Ticket, Crown
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { LEGENDARY_SHOES_IMG, getShoesImage } from '../shoesAsset';
import { getWheelNotifyFallback, getRecordTime } from '../utils/shopHelpers';
import { isLegendaryShoes, isGameItem } from '../utils/wheelHelpers';

const VongQuayScreen = ({
  renderNavbar, renderFooter, currentUser, currentUserRef, setCurrentUser, setUsersDb,
  setCurrentView, requireAuth, showToast, playMode, setPlayMode,
  wheelItemsMoneyDb, wheelItemsSpinDb, wheelConfig, wheelCountdown, isWheelEventExpired,
  isSpinning, setIsSpinning, isSpinningRef, rotation, setRotation,
  shoesPity, setShoesPity, giftModalData, setGiftModalData, isGiftOpened, setIsGiftOpened,
  spin10ModalData, setSpin10ModalData, isSpin10Opened, setIsSpin10Opened,
  spinActionType, setSpinActionType, bossPlayerSummary, setBossPlayerSummary,
  setShowLinkOtpModal, transactionsDb, setTransactionsDb, visibleSpinsClient, setVisibleSpinsClient
}) => {
  // CHỈ LẤY NHỮNG QUÀ CÓ SỐ LƯỢNG LỚN HƠN 0 VÀ SẮP XẾP ĐỒNG BỘ TUYỆT ĐỐI THEO ID
  let activeDb = (playMode === 'money' ? wheelItemsMoneyDb : wheelItemsSpinDb)
    .filter(item => item.quantity === undefined || item.quantity > 0)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
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
    activeDb = (playMode === 'money' ? wheelItemsSpinDb : wheelItemsMoneyDb)
      .slice()
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }

  const handleSpin = async () => {
    if (isWheelEventExpired) {
      showToast("Sự kiện Vòng Quay Giày Thần Tốc đã chính thức kết thúc vào 23h59 ngày 16/10!", "error");
      setCurrentView('dashboard');
      return;
    }

    if (!currentUser) {
      showToast("Vui lòng đăng nhập tài khoản để tham gia Vòng Quay!", 'error');
      setCurrentView('login');
      return;
    }

    if (isSpinning) return;
    setIsSpinning(true); // Khóa nút bấm ngay lập tức
    isSpinningRef.current = true;
    setSpinActionType('x1');

    const isUsingMoney = playMode === 'money';
    const requiredCost = isUsingMoney ? wheelConfig.moneyCost : wheelConfig.spinCost;

    // Kiểm tra số lượt quay hoặc số dư trước khi kích hoạt
    if (!isUsingMoney && (currentUser.spins || 0) < requiredCost) {
      setIsSpinning(false);
      isSpinningRef.current = false;
      showToast("Bạn đã hết lượt quay! Cứ mỗi 20.000đ nạp tiền sẽ được tặng 1 lượt quay miễn phí. Nạp ngay để quay tiếp nhé!", "info");
      setCurrentView('naptien');
      return;
    }

    if (isUsingMoney && (currentUser.balance || 0) < requiredCost) {
      setIsSpinning(false);
      isSpinningRef.current = false;
      showToast("Số dư ví không đủ để quay! Vui lòng nạp tiền vào ví.", "error");
      setCurrentView('naptien');
      return;
    }

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
    if (error || !data?.success) {
      setIsSpinning(false);
      isSpinningRef.current = false;
      if (spinAudio) spinAudio.pause();
      return showToast(error?.message || data?.message || "Lỗi vòng quay!", 'error');
    }

    // 2. ĐỌC KẾT QUẢ TỪ SERVER TRẢ VỀ ĐỂ DỰNG HIỆU ỨNG (Animation)
    const isServerShoesWin = Boolean(
      data.is_shoes ||
      data.is_pity_trigger ||
      data.item_id === 'WHEEL_SHOES_LEGENDARY' ||
      (data.item_name && data.item_name.toLowerCase().includes('giày'))
    );

    // Định vị chính xác nan quạt trúng thưởng trên mâm bánh xe (activeDb)
    let winningIndex = -1;
    if (isServerShoesWin) {
      // Chỉ khi SERVER thực sự công nhận trúng Giày (quay trúng tự nhiên hoặc nổ bảo hiểm trên Server)
      winningIndex = activeDb.findIndex(isLegendaryShoes);
    }
    if (winningIndex === -1 && data.item_id) {
      winningIndex = activeDb.findIndex(item => item.id === data.item_id);
    }
    if (winningIndex === -1 && data.item_name) {
      winningIndex = activeDb.findIndex(item => item.name === data.item_name);
    }
    if (winningIndex === -1) {
      winningIndex = 0;
    }

    let winningItem = {
      ...activeDb[winningIndex],
      ...(data.item_name ? { name: data.item_name } : {}),
      ...(data.item_value !== undefined ? { value: data.item_value } : {}),
      ...(data.item_type ? { type: data.item_type } : {})
    };

    // Tính góc quay sao cho kim chỉ đúng vào ô trúng
    const N = activeDb.length;
    const sliceAngle = 360 / N;
    const centerAngle = winningIndex * sliceAngle + (sliceAngle / 2);
    const currentBase = rotation % 360;
    // Giới hạn độ lệch an toàn trong ±8% nan quạt để kim luôn nằm ngay ngắn ở trung tâm ô trúng, không chạm biên giới
    const safeRandomOffset = (Math.random() * 0.16 - 0.08) * sliceAngle;
    const targetRotation = rotation + (360 - currentBase) + 1800 + (360 - centerAngle) + safeRandomOffset;

    // CẬP NHẬT CHỈ SỐ BẢO HIỂM GIÀY HUYỀN THOẠI (PITY) & ĐỒNG BỘ TIỀN NGAY LẬP TỨC
    const wonShoes = isLegendaryShoes(winningItem) || isServerShoesWin;
    let nextPity = Number(shoesPity) || 0;
    if (playMode === 'spin') {
      if (wonShoes) {
        nextPity = 0;
      } else if (data.shoes_pity !== undefined && data.shoes_pity !== null) {
        nextPity = Number(data.shoes_pity);
      } else {
        nextPity = (Number(shoesPity) || 0) + 1;
      }
      setShoesPity(nextPity);
      if (currentUser?.id) {
        try { localStorage.setItem(`shop_shoes_pity_${currentUser.id}`, nextPity.toString()); } catch { /* ignore */ }
        try {
          supabase.from('users').update({ shoes_pity: nextPity }).eq('id', currentUser.id).then(() => {});
        } catch { /* ignore */ }
      }
    }

    // Đồng bộ lại tiền từ Server trả về lên giao diện Web
    const latestMe = currentUserRef.current || currentUser;
    const currentLinked = latestMe?.linked_game_id || localStorage.getItem(`shop_linked_game_id_${latestMe?.id}`);
    const finalPityForUser = (playMode === 'spin' ? nextPity : (latestMe?.shoes_pity ?? currentUser?.shoes_pity ?? 0));
    const updatedUser = {
      ...latestMe,
      balance: data.new_balance,
      spins: data.new_spins,
      rentFund: data.new_fund,
      shoes_pity: finalPityForUser,
      linked_game_id: currentLinked
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
    setUsersDb(prev => prev.map(u => u.id === (latestMe?.id || currentUser?.id) ? updatedUser : u));

    // TỰ ĐỘNG GỬI VẬT PHẨM GAME VÀO SUPABASE GAME_ORDERS NGAY LẬP TỨC
    // (Bảo đảm an toàn tuyệt đối: Không chờ 4s animation, dù khách tắt browser/chuyển tab vẫn nhận đủ quà & thông báo)
    const isGameReward = isGameItem(winningItem) || wonShoes;
    const targetGameUid = currentLinked
      || (currentUser?.name ? currentUser.name.trim() : null)
      || currentUser?.id;

    if (isGameReward && targetGameUid) {
      const orderId = `WO_WHEEL_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      let orderRewards = {};
      let pkgId = `wheel_${winningItem.type || 'reward'}`;
      let pkgName = 'Vòng Quay May Mắn (Gói x1 Lượt)';

      if (wonShoes || winningItem.type === 'game_shoes_legendary') {
        pkgId = 'wheel_shoes_legendary';
        orderRewards = {
          items: [{
            id: `SHOES_LEGENDARY_${Date.now()}`,
            name: 'Giày Thần Tốc',
            category: 'shoes',
            type: 'shoes',
            tier: 'Huyền Thoại',
            base_agility: 300,
            agility: 300,
            stars: 0,
            plus: 0,
            sub_stats: ['⚡ +30% Tốc Độ Đôi Giày'],
            description: 'Giày Huyền Thoại Thần Tốc (+300 Tốc độ) nhận từ Vòng Quay May Mắn (Bảo hiểm 121)'
          }],
          auto_equip: false
        };
        if (bossPlayerSummary) {
          const newShoesObj = {
            id: `SHOES_LEGENDARY_${Date.now()}`,
            name: 'Giày Thần Tốc',
            category: 'shoes',
            type: 'shoes',
            tier: 'Huyền Thoại',
            base_agility: 300,
            agility: 300,
            stars: 0,
            plus: 0,
            sub_stats: ['⚡ +30% Tốc Độ Đôi Giày']
          };
          setBossPlayerSummary(prev => {
            if (!prev) return prev;
            return { ...prev, inventory: [newShoesObj, ...(prev.inventory || [])] };
          });
        }
      } else if (winningItem.type === 'game_essence_stone' || winningItem.name?.toLowerCase().includes('tinh hoa')) {
        pkgId = 'wheel_game_essence_stone';
        orderRewards = {
          items: [{
            id: 'item_essence_stone',
            name: 'Đá Tinh Hoa',
            category: 'material',
            type: 'material',
            tier: 'Thượng Cổ',
            quantity: Number(winningItem.value) || 5,
            image: 'da_tinh_hoa.png',
            desc: 'Đá quý thăng cấp kỹ năng Nhẫn Thần Binh'
          }]
        };
      } else if (winningItem.type === 'game_ring_crystal' || winningItem.name?.toLowerCase().includes('tinh thể')) {
        pkgId = 'wheel_game_ring_crystal';
        orderRewards = {
          items: [{
            id: 'item_ring_crystal',
            name: 'Tinh Thể Cường Hóa',
            category: 'material',
            type: 'material',
            tier: 'Thượng Cổ',
            quantity: Number(winningItem.value) || 10,
            image: 'ring_crystal.png',
            desc: 'Tinh thể cường hóa, nâng sao và đột phá Nhẫn Thần Binh'
          }]
        };
      } else if (winningItem.type === 'game_attacks' || winningItem.name?.toLowerCase().includes('lượt đánh')) {
        pkgId = 'wheel_game_attacks';
        orderRewards = { attacks: Number(winningItem.value) || 5 };
      } else if (winningItem.type === 'game_boss_chests' || winningItem.name?.toLowerCase().includes('hòm boss')) {
        pkgId = 'wheel_game_boss_chests';
        orderRewards = { boss_chests: Number(winningItem.value) || 3 };
      } else if (winningItem.type === 'game_royal_chests' || winningItem.name?.toLowerCase().includes('hoàng kim')) {
        pkgId = 'wheel_game_royal_chests';
        orderRewards = { royal_chests: Number(winningItem.value) || 1 };
      } else if (winningItem.type === 'game_coins' || winningItem.type === 'coins' || winningItem.type === 'xu' || winningItem.name?.toLowerCase().includes('xu')) {
        pkgId = 'wheel_game_coins';
        orderRewards = { coins: Number(winningItem.value) || 20 };
      } else if (winningItem.type?.startsWith('game_')) {
        pkgId = `wheel_${winningItem.type}`;
        orderRewards = {
          items: [{
            id: winningItem.type.replace(/^game_/, 'item_'),
            name: winningItem.name,
            category: 'material',
            quantity: Number(winningItem.value) || 1
          }]
        };
      }

      const shouldNotify = Boolean(
        winningItem.notify_on_win 
        ?? getWheelNotifyFallback(winningItem.id) 
        ?? (wonShoes || winningItem.type === 'game_shoes_legendary')
      );

      supabase.from('game_orders').insert([{
        id: orderId,
        user_id: targetGameUid,
        nickname: currentUser.name,
        web_user: currentUser.id,
        package_id: pkgId,
        package_name: pkgName,
        price: 0,
        notify: shouldNotify,
        rewards: {
          ...orderRewards,
          notify: shouldNotify,
          source_type: 'wheel'
        },
        status: 'pending'
      }]).then(({ error: gErr }) => {
        if (gErr) console.warn("Lỗi đồng bộ game_orders:", gErr);
      }).catch(e => {
        console.warn("Lỗi dispatch game_order:", e);
      });
    }

    setRotation(targetRotation); // Bắt đầu xoay hình ảnh

    // Đợi 4 giây cho hình ảnh xoay xong thì tung Pop-up chúc mừng & âm thanh
    setTimeout(async () => {
      setIsSpinning(false);
      isSpinningRef.current = false;
      if (spinAudio) { spinAudio.pause(); spinAudio.currentTime = 0; }

      const winAudio = document.getElementById('winSound');
      const loseAudio = document.getElementById('loseSound');
      if (winningItem.type !== 'none') {
        if (winAudio) { winAudio.currentTime = 0; winAudio.volume = 0.8; winAudio.play().catch(() => {}); }
      } else {
        if (loseAudio) { loseAudio.currentTime = 0; loseAudio.volume = 0.8; loseAudio.play().catch(() => {}); }
      }

      try {
        // Kéo 2 dòng lịch sử mới nhất (Vé quay & Trúng thưởng) để hiển thị bên phải
        const { data: newTxs } = await supabase.from('transactions').select('*').eq('user', currentUser.name).order('created_at', { ascending: false }).limit(2);
        if (newTxs) {
          setTransactionsDb(prev => {
            const filtered = prev.filter(p => !newTxs.find(n => n.id === p.id));
            return [...newTxs, ...filtered];
          });
        }
      } catch { /* ignore */ }

      // Hiển thị bảng chúc mừng
      setGiftModalData({
        item: winningItem,
        prizeValue: Number(winningItem.value) || 0,
        prizeType: winningItem.type,
        isLost: winningItem.type === 'none',
        isShoes: wonShoes,
        isGameReward: isGameReward,
        isPityWin: Boolean(data?.is_pity_trigger),
        pityCount: nextPity,
        hasLinkedGame: Boolean(currentLinked)
      });
      setIsGiftOpened(true);
    }, 4000);
  };

  // =========================================================================
  // HÀM QUAY X10 (10 LƯỢT LIÊN TIẾP) & SỔ ĐỦ 10 MÓN TRÚNG THƯỞNG
  // =========================================================================
  const handleSpinX10 = async () => {
    if (isWheelEventExpired) {
      showToast("Sự kiện Vòng Quay Giày Thần Tốc đã chính thức kết thúc vào 23h59 ngày 16/10!", "error");
      setCurrentView('dashboard');
      return;
    }

    if (!currentUser) {
      showToast("Vui lòng đăng nhập tài khoản để tham gia Vòng Quay!", 'error');
      setCurrentView('login');
      return;
    }

    if (isSpinning) return;

    const isUsingMoney = playMode === 'money';
    const unitCost = isUsingMoney ? wheelConfig.moneyCost : wheelConfig.spinCost;
    const totalCost = unitCost * 10;

    // Kiểm tra số lượt quay hoặc số dư trước khi kích hoạt x10
    if (!isUsingMoney && (currentUser.spins || 0) < totalCost) {
      setIsSpinning(false);
      isSpinningRef.current = false;
      showToast(`Bạn chưa đủ 10 lượt quay! Hiện có ${currentUser.spins || 0} lượt. Cứ mỗi 20.000đ nạp tiền sẽ được tặng 1 lượt quay miễn phí.`, "info");
      setCurrentView('naptien');
      return;
    }

    if (isUsingMoney && (currentUser.balance || 0) < totalCost) {
      setIsSpinning(false);
      isSpinningRef.current = false;
      showToast(`Số dư ví không đủ 10 lượt quay (${new Intl.NumberFormat('vi-VN').format(totalCost)}đ)! Vui lòng nạp tiền vào ví.`, "error");
      setCurrentView('naptien');
      return;
    }

    setIsSpinning(true);
    isSpinningRef.current = true;
    setSpinActionType('x10');

    // Mở nhạc vòng quay
    const spinAudio = document.getElementById('spinSound');
    if (spinAudio) {
      spinAudio.currentTime = 0; spinAudio.volume = 0.6;
      spinAudio.play().catch(e => console.log("Trình duyệt chặn:", e));
    }

    let itemsResult = [];
    let finalNewBalance = currentUser.balance;
    let finalNewSpins = currentUser.spins;
    let finalNewFund = currentUser.rentFund || 0;
    let finalPity = Number(shoesPity || 0);
    let shoesWonCount = 0;

    try {
      // 1. Thử gọi RPC m_spin_wheel_x10 trên Supabase
      const { data: rpcData, error: rpcErr } = await supabase.rpc('m_spin_wheel_x10', {
        khach_id: currentUser.id,
        p_wheel_type: playMode,
        p_cost: unitCost
      });

      if (!rpcErr && rpcData?.success && Array.isArray(rpcData.items) && rpcData.items.length === 10) {
        itemsResult = rpcData.items.map((it, idx) => {
          const rawItem = activeDb.find(dbIt => dbIt.id === it.id) || it;
          const wonShoes = isLegendaryShoes(rawItem) || it.is_shoes;
          return {
            index: idx + 1,
            id: it.id,
            name: it.name || rawItem.name,
            type: it.type || rawItem.type,
            value: Number(it.value ?? rawItem.value) || 0,
            image: rawItem.image || it.image,
            color: rawItem.color || it.color,
            isShoes: wonShoes,
            isGameReward: isGameItem(rawItem) || wonShoes,
            isPityWin: Boolean(it.is_pity_trigger)
          };
        });
        finalNewBalance = rpcData.new_balance;
        finalNewSpins = rpcData.new_spins;
        finalNewFund = rpcData.new_fund;
        finalPity = rpcData.new_pity;
        shoesWonCount = rpcData.shoes_won_count || 0;
        if (finalPity !== undefined && finalPity !== null) {
          setShoesPity(Number(finalPity));
          const myUid = currentUserRef.current?.id || currentUser?.id;
          if (myUid) {
            try { localStorage.setItem(`shop_shoes_pity_${myUid}`, Number(finalPity).toString()); } catch { /* ignore */ }
          }
        }
      } else {
        // 2. Chế độ Fallback tự động: Xử lý 10 lượt quay tuần tự
        console.warn("Dùng chế độ Fallback x10:", rpcErr?.message);
        let tempPity = Number(shoesPity || 0);
        let simulatedBalance = Number(currentUser.balance || 0);
        let simulatedSpins = Number(currentUser.spins || 0);

        if (isUsingMoney) simulatedBalance -= totalCost;
        else simulatedSpins -= totalCost;

        for (let i = 0; i < 10; i++) {
          let singleWin = null;
          let singlePityWin = false;

          if (playMode === 'spin' && tempPity >= 120) {
            const shoesItem = activeDb.find(isLegendaryShoes);
            if (shoesItem) {
              singleWin = shoesItem;
              singlePityWin = true;
            }
          }

          if (!singleWin) {
            const { data: sData, error: sErr } = await supabase.rpc('m_spin_wheel', {
              khach_id: currentUser.id,
              p_wheel_type: playMode,
              p_cost: unitCost
            });
            if (!sErr && sData?.success) {
              singleWin = activeDb.find(it => it.id === sData.item_id) || activeDb[0];
              simulatedBalance = sData.new_balance;
              simulatedSpins = sData.new_spins;
              finalNewFund = sData.new_fund;
            } else {
              const rand = Math.random() * 100;
              let cum = 0;
              for (const it of activeDb) {
                const rateVal = parseFloat((it.rate || '10%').toString().replace('%', '').replace(',', '.')) || 10;
                cum += rateVal;
                if (rand <= cum) {
                  singleWin = it;
                  break;
                }
              }
              if (!singleWin) singleWin = activeDb[0];
              if (singleWin.type === 'money') simulatedBalance += Number(singleWin.value);
              else if (singleWin.type === 'spin') simulatedSpins += Number(singleWin.value);
            }
          }

          const wonShoes = isLegendaryShoes(singleWin);
          if (playMode === 'spin') {
            if (wonShoes) {
              tempPity = 0;
              shoesWonCount++;
            } else {
              tempPity++;
            }
          }

          itemsResult.push({
            index: i + 1,
            id: singleWin.id,
            name: singleWin.name,
            type: singleWin.type,
            value: Number(singleWin.value) || 0,
            image: singleWin.image,
            color: singleWin.color,
            isShoes: wonShoes,
            isGameReward: isGameItem(singleWin) || wonShoes,
            isPityWin: singlePityWin
          });
        }

        finalNewBalance = simulatedBalance;
        finalNewSpins = simulatedSpins;
        finalPity = tempPity;
        if (finalPity !== undefined && finalPity !== null) {
          setShoesPity(Number(finalPity));
          const myUid = currentUserRef.current?.id || currentUser?.id;
          if (myUid) {
            try { localStorage.setItem(`shop_shoes_pity_${myUid}`, Number(finalPity).toString()); } catch { /* ignore */ }
          }
        }

        if (currentUser?.id) {
          try {
            await supabase.from('users').update({
              balance: finalNewBalance,
              spins: finalNewSpins,
              shoes_pity: finalPity
            }).eq('id', currentUser.id);
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.error("Lỗi thực thi vòng quay x10:", err);
    }

    // Xác định món quà tiêu biểu nhất trong 10 món trúng để kim dừng chính xác vào ô đó
    let targetItemIndex = -1;
    const wonShoesItem = itemsResult.find(it => it.isShoes || String(it.type || '').toLowerCase() === 'game_shoes_legendary' || String(it.name || '').toLowerCase().includes('giày'));
    if (wonShoesItem) {
      targetItemIndex = activeDb.findIndex(isLegendaryShoes);
    } else {
      // Nếu không trúng Giày, chọn món tiêu biểu theo độ ưu tiên
      // ĐẢM BẢO TUYỆT ĐỐI KHÔNG BAO GIỜ DỪNG VÀO Ô GIÀY THẦN TỐC KHI KHÔNG TRÚNG GIÀY!
      const nonShoesItems = itemsResult.filter(it => !isLegendaryShoes(it) && !String(it.name || '').toLowerCase().includes('giày'));
      const priorityOrder = ['game_essence_stone', 'game_ring_crystal', 'game_royal_chests', 'game_boss_chests', 'game_attacks', 'game_coins', 'money', 'spin'];
      let chosenItem = null;
      for (const pType of priorityOrder) {
        chosenItem = nonShoesItems.find(it => String(it.type || '').toLowerCase() === pType || String(it.name || '').toLowerCase().includes(pType));
        if (chosenItem) break;
      }
      if (!chosenItem && nonShoesItems.length > 0) {
        chosenItem = nonShoesItems[0];
      }
      if (chosenItem) {
        targetItemIndex = activeDb.findIndex(it => it.id === chosenItem.id);
        if (targetItemIndex === -1) {
          targetItemIndex = activeDb.findIndex(it => it.name === chosenItem.name);
        }
      }
    }

    // Tránh dừng vào ô giày nếu không trúng giày
    if (!wonShoesItem) {
      const shoesIdx = activeDb.findIndex(isLegendaryShoes);
      if (targetItemIndex === shoesIdx || targetItemIndex === -1) {
        targetItemIndex = activeDb.findIndex((it, idx) => idx !== shoesIdx);
        if (targetItemIndex === -1) targetItemIndex = 0;
      }
    }

    if (targetItemIndex === -1) targetItemIndex = 0;

    // Xoay bánh xe x10 (6 vòng = 2160 độ) và kim dừng chuẩn xác vào nan quạt của món tiêu biểu
    const N = activeDb.length;
    const sliceAngle = 360 / N;
    const centerAngle = targetItemIndex * sliceAngle + (sliceAngle / 2);
    const currentBase = rotation % 360;
    const safeRandomOffset = (Math.random() * 0.16 - 0.08) * sliceAngle;
    const targetRotation = rotation + (360 - currentBase) + 2160 + (360 - centerAngle) + safeRandomOffset;
    // CẬP NHẬT USER VÀ PITY NGAY LẬP TỨC
    const latestMe = currentUserRef.current || currentUser;
    const currentLinked = latestMe?.linked_game_id || localStorage.getItem(`shop_linked_game_id_${latestMe?.id}`);
    const resolvedPity = (finalPity !== undefined && finalPity !== null) ? Number(finalPity) : (latestMe?.shoes_pity ?? currentUser?.shoes_pity ?? 0);
    const updatedUser = {
      ...latestMe,
      balance: finalNewBalance,
      spins: finalNewSpins,
      rentFund: finalNewFund,
      shoes_pity: resolvedPity,
      linked_game_id: currentLinked
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('shop_cached_user', JSON.stringify(updatedUser));
    setUsersDb(prev => prev.map(u => u.id === (latestMe?.id || currentUser?.id) ? updatedUser : u));

    // Cập nhật bảo hiểm Pity
    setShoesPity(resolvedPity);
    const myUid = latestMe?.id || currentUser?.id;
    if (myUid) {
      try {
        localStorage.setItem(`shop_shoes_pity_${myUid}`, resolvedPity.toString());
      } catch { /* ignore */ }
    }

    // TỔNG KẾT VẬT PHẨM TRÚNG TỪ 10 LƯỢT
    let sumAttacks = 0;
    let sumBossChests = 0;
    let sumRoyalChests = 0;
    let sumCoins = 0;
    let sumMoney = 0;
    let sumSpins = 0;
    let sumFund = 0;
    let sumEssenceStones = 0;
    let sumRingCrystals = 0;
    let hasShoes = false;

    itemsResult.forEach(it => {
      const itType = String(it.type || '').toLowerCase();
      const itName = String(it.name || '').toLowerCase();
      if (it.isShoes || itType === 'game_shoes_legendary' || itName.includes('giày')) hasShoes = true;
      else if (itType === 'game_essence_stone' || itName.includes('tinh hoa')) sumEssenceStones += (Number(it.value) || 5);
      else if (itType === 'game_ring_crystal' || itName.includes('tinh thể')) sumRingCrystals += (Number(it.value) || 10);
      else if (itType === 'game_attacks' || itName.includes('lượt đánh')) sumAttacks += (Number(it.value) || 5);
      else if (itType === 'game_boss_chests' || itName.includes('hòm boss')) sumBossChests += (Number(it.value) || 3);
      else if (itType === 'game_royal_chests' || itName.includes('hoàng kim')) sumRoyalChests += (Number(it.value) || 1);
      else if (itType === 'game_coins' || itType === 'coins' || itType === 'xu' || itName.includes('xu')) sumCoins += (Number(it.value) || 20);
      else if (itType === 'money') sumMoney += (Number(it.value) || 0);
      else if (itType === 'spin') sumSpins += (Number(it.value) || 0);
      else if (itType === 'fund') sumFund += (Number(it.value) || 0);
    });

    // TỰ ĐỘNG GỬI VẬT PHẨM GAME VÀO GAME_ORDERS NGAY LẬP TỨC
    // (Không chờ 4s animation để tránh mất đơn nếu tắt trình duyệt)
    const hasAnyGameReward = hasShoes || sumAttacks > 0 || sumBossChests > 0 || sumRoyalChests > 0 || sumCoins > 0 || sumEssenceStones > 0 || sumRingCrystals > 0;
    const targetGameUid = currentLinked
      || (currentUser?.name ? currentUser.name.trim() : null)
      || currentUser?.id;

    if (hasAnyGameReward && targetGameUid) {
      const orderId = `WO_X10_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const orderRewards = {};
      const itemsList = [];

      if (hasShoes) {
        itemsList.push({
          id: `SHOES_LEGENDARY_${Date.now()}`,
          name: 'Giày Thần Tốc',
          category: 'shoes',
          type: 'shoes',
          tier: 'Huyền Thoại',
          base_agility: 300,
          agility: 300,
          stars: 0,
          plus: 0,
          sub_stats: ['⚡ +30% Tốc Độ Đôi Giày'],
          description: 'Giày Huyền Thoại Thần Tốc (+300 Tốc độ) nhận từ Vòng Quay x10'
        });
        orderRewards.auto_equip = false;
        if (bossPlayerSummary) {
          const newShoesObj = {
            id: `SHOES_LEGENDARY_${Date.now()}`,
            name: 'Giày Thần Tốc',
            category: 'shoes',
            type: 'shoes',
            tier: 'Huyền Thoại',
            base_agility: 300,
            agility: 300,
            stars: 0,
            plus: 0,
            sub_stats: ['⚡ +30% Tốc Độ Đôi Giày']
          };
          setBossPlayerSummary(prev => {
            if (!prev) return prev;
            return { ...prev, inventory: [newShoesObj, ...(prev.inventory || [])] };
          });
        }
      }
      if (sumEssenceStones > 0) {
        itemsList.push({
          id: 'item_essence_stone',
          name: 'Đá Tinh Hoa',
          category: 'material',
          type: 'material',
          tier: 'Thượng Cổ',
          quantity: sumEssenceStones,
          image: 'da_tinh_hoa.png',
          desc: 'Đá quý thăng cấp kỹ năng Nhẫn Thần Binh'
        });
      }
      if (sumRingCrystals > 0) {
        itemsList.push({
          id: 'item_ring_crystal',
          name: 'Tinh Thể Cường Hóa',
          category: 'material',
          type: 'material',
          tier: 'Thượng Cổ',
          quantity: sumRingCrystals,
          image: 'ring_crystal.png',
          desc: 'Tinh thể cường hóa, nâng sao và đột phá Nhẫn Thần Binh'
        });
      }
      if (itemsList.length > 0) orderRewards.items = itemsList;
      if (sumAttacks > 0) orderRewards.attacks = sumAttacks;
      if (sumBossChests > 0) orderRewards.boss_chests = sumBossChests;
      if (sumRoyalChests > 0) orderRewards.royal_chests = sumRoyalChests;
      if (sumCoins > 0) orderRewards.coins = sumCoins;

      const shouldNotifyX10 = itemsResult.some(it => {
        const rawItem = activeDb.find(dbIt => dbIt.id === it.id) || it;
        return Boolean(
          rawItem?.notify_on_win 
          ?? getWheelNotifyFallback(rawItem?.id)
          ?? (rawItem?.isShoes || rawItem?.type === 'game_shoes_legendary' || it?.isShoes)
        );
      });

      supabase.from('game_orders').insert([{
        id: orderId,
        user_id: targetGameUid,
        nickname: currentUser.name,
        web_user: currentUser.id,
        package_id: 'wheel_spin_x10',
        package_name: 'Vòng Quay May Mắn (Gói x10 Lượt)',
        price: 0,
        notify: shouldNotifyX10,
        rewards: {
          ...orderRewards,
          notify: shouldNotifyX10,
          source_type: 'wheel'
        },
        status: 'pending'
      }]).then(({ error: gErr }) => {
        if (gErr) console.warn("Lỗi đồng bộ game_orders x10:", gErr);
      }).catch(e => {
        console.warn("Lỗi dispatch game_orders x10:", e);
      });
    }

    setRotation(targetRotation);

    // Đợi 4 giây cho vòng quay quay xong
    setTimeout(async () => {
      setIsSpinning(false);
      isSpinningRef.current = false;
      if (spinAudio) { spinAudio.pause(); spinAudio.currentTime = 0; }

      const winAudio = document.getElementById('winSound');
      if (winAudio) { winAudio.currentTime = 0; winAudio.volume = 0.85; winAudio.play().catch(() => {}); }

      try {
        const { data: newTxs } = await supabase.from('transactions').select('*').eq('user', currentUser.name).order('created_at', { ascending: false }).limit(5);
        if (newTxs) {
          // Nếu có trúng vật phẩm in-game quan trọng trong lượt x10, cập nhật mô tả chi tiết để cộng đồng thấy trên ticker
          const wonPrizesList = [];
          if (hasShoes) wonPrizesList.push('Giày Thần Tốc');
          if (sumEssenceStones > 0) wonPrizesList.push(`${sumEssenceStones} Đá Tinh Hoa`);
          if (sumRingCrystals > 0) wonPrizesList.push(`${sumRingCrystals} Viên Tinh Thể`);
          if (sumBossChests > 0) wonPrizesList.push(`${sumBossChests} Hòm Boss`);
          if (sumRoyalChests > 0) wonPrizesList.push(`${sumRoyalChests} Hòm Hoàng Kim`);
          if (sumAttacks > 0) wonPrizesList.push(`+${sumAttacks} Lượt Boss`);
          if (sumCoins > 0) wonPrizesList.push(`+${sumCoins} Xu`);

          if (wonPrizesList.length > 0) {
            const x10Tx = newTxs.find(t => t.id?.startsWith('SPIN10_') || t.action?.includes('Quay Vòng Quay x10'));
            if (x10Tx) {
              const updatedAction = `Trúng phần thưởng (Quay x10): ${wonPrizesList.join(', ')}`;
              x10Tx.action = updatedAction;
              supabase.from('transactions').update({ action: updatedAction }).eq('id', x10Tx.id).then(() => {});
            }
          }

          setTransactionsDb(prev => {
            const filtered = prev.filter(p => !newTxs.find(n => n.id === p.id));
            return [...newTxs, ...filtered];
          });
        }
      } catch { /* ignore */ }

      // HIỂN THỊ MODAL SỔ ĐỦ 10 MÓN TRÚNG
      setSpin10ModalData({
        items: itemsResult,
        summary: {
          hasShoes,
          shoesWonCount,
          sumAttacks,
          sumBossChests,
          sumRoyalChests,
          sumCoins,
          sumMoney,
          sumSpins,
          sumFund,
          sumEssenceStones,
          sumRingCrystals,
          totalCost,
          finalPity,
          hasLinkedGame: Boolean(currentLinked),
          linkedGameId: currentLinked
        }
      });
      setIsSpin10Opened(true);
    }, 4000);
  };
  // HELPER: Xác định bảng màu & phong cách thị giác Hoàng Kim cho từng loại giải thưởng
  const getPrizeVisual = (w) => {
    const isShoes = isLegendaryShoes(w) || w.type === 'game_shoes_legendary';
    const itType = String(w.type || '').toLowerCase();
    const itName = String(w.name || '').toLowerCase();

    let displayImg = w.image;
    if (displayImg === 'null' || displayImg === 'undefined' || !displayImg) {
      displayImg = null;
    }
    if (isShoes || itType === 'game_shoes_legendary' || itName.includes('giày')) {
      displayImg = getShoesImage(displayImg);
    } else if (!displayImg) {
      if (itType === 'game_boss_chests' || itName.includes('hòm boss')) displayImg = '/game-assets/mystery_box_closed.png';
      else if (itType === 'game_royal_chests' || itName.includes('hoàng kim')) displayImg = '/game-assets/royal_chest.png';
      else if (itType === 'game_essence_stone' || itName.includes('tinh hoa')) displayImg = '/game-assets/da_tinh_hoa.png';
      else if (itType === 'game_ring_crystal' || itName.includes('tinh thể')) displayImg = '/game-assets/ring_crystal.png';
      else if (itType === 'game_coins' || itType === 'coins' || itType === 'xu' || itName.includes('xu')) displayImg = '/game-assets/gold_coin.png';
      else if (itType === 'game_attacks' || itName.includes('lượt đánh') || itName.includes('đánh boss')) displayImg = '/game-assets/weapon_song_dao.png';
    }

    if (isShoes || itName.includes('giày')) {
      return {
        theme: 'legendary',
        fillGrad: 'url(#grad-slice-shoes)',
        stroke: '#fef08a',
        strokeGlow: 'rgba(245, 158, 11, 0.85)',
        glowColor: '#f59e0b',
        tag: 'HUYỀN THOẠI',
        tagBg: 'rgba(245, 158, 11, 0.3)',
        tagBorder: '#f59e0b',
        tagText: '#fde047',
        displayImg,
        shortTitle: 'GIÀY THẦN TỐC',
        valText: '+300 TỐC ĐỘ'
      };
    }
    if (itType === 'game_essence_stone' || itName.includes('tinh hoa')) {
      return {
        theme: 'essence_stone',
        fillGrad: 'url(#grad-slice-royal)',
        stroke: '#c084fc',
        strokeGlow: 'rgba(168, 85, 247, 0.85)',
        glowColor: '#a855f7',
        tag: 'ĐÁ TINH HOA',
        tagBg: 'rgba(168, 85, 247, 0.35)',
        tagBorder: '#a855f7',
        tagText: '#f3e8ff',
        displayImg: displayImg || '/game-assets/da_tinh_hoa.png',
        shortTitle: 'ĐÁ TINH HOA',
        valText: `+${w.value || 5} VIÊN`
      };
    }
    if (itType === 'game_ring_crystal' || itName.includes('tinh thể')) {
      return {
        theme: 'ring_crystal',
        fillGrad: 'url(#grad-slice-shoes)',
        stroke: '#f472b6',
        strokeGlow: 'rgba(236, 72, 153, 0.85)',
        glowColor: '#ec4899',
        tag: 'VIÊN TINH THỂ',
        tagBg: 'rgba(236, 72, 153, 0.35)',
        tagBorder: '#ec4899',
        tagText: '#fce7f3',
        displayImg: displayImg || '/game-assets/ring_crystal.png',
        shortTitle: 'VIÊN TINH THỂ',
        valText: `+${w.value || 10} VIÊN`
      };
    }
    if (itType === 'game_royal_chests' || itName.includes('hoàng kim')) {
      return {
        theme: 'royal',
        fillGrad: 'url(#grad-slice-royal)',
        stroke: '#e879f9',
        strokeGlow: 'rgba(168, 85, 247, 0.85)',
        glowColor: '#a855f7',
        tag: 'RƯƠNG HK',
        tagBg: 'rgba(168, 85, 247, 0.3)',
        tagBorder: '#a855f7',
        tagText: '#f0abfc',
        displayImg,
        shortTitle: 'HÒM HOÀNG KIM',
        valText: `+${w.value || 1} RƯƠNG`
      };
    }
    if (itType === 'game_boss_chests' || itName.includes('hòm boss')) {
      return {
        theme: 'boss',
        fillGrad: 'url(#grad-slice-boss)',
        stroke: '#4ade80',
        strokeGlow: 'rgba(34, 197, 94, 0.85)',
        glowColor: '#22c55e',
        tag: 'HÒM BOSS',
        tagBg: 'rgba(34, 197, 94, 0.3)',
        tagBorder: '#22c55e',
        tagText: '#86efac',
        displayImg,
        shortTitle: 'HÒM BOSS',
        valText: `+${w.value || 3} HÒM`
      };
    }
    if (itType === 'game_attacks' || itName.includes('lượt đánh')) {
      return {
        theme: 'attack',
        fillGrad: 'url(#grad-slice-attack)',
        stroke: '#60a5fa',
        strokeGlow: 'rgba(59, 130, 246, 0.85)',
        glowColor: '#3b82f6',
        tag: 'LƯỢT ĐÁNH',
        tagBg: 'rgba(59, 130, 246, 0.3)',
        tagBorder: '#3b82f6',
        tagText: '#93c5fd',
        displayImg: displayImg || '/game-assets/weapon_song_dao.png',
        shortTitle: 'LƯỢT ĐÁNH BOSS',
        valText: `+${w.value || 5} LƯỢT`
      };
    }
    if (itType === 'game_coins' || itType === 'coins' || itType === 'xu' || itName.includes('xu')) {
      return {
        theme: 'coins',
        fillGrad: 'url(#grad-slice-coins)',
        stroke: '#facc15',
        strokeGlow: 'rgba(234, 179, 8, 0.85)',
        glowColor: '#eab308',
        tag: 'XU GAME',
        tagBg: 'rgba(234, 179, 8, 0.3)',
        tagBorder: '#eab308',
        tagText: '#fef08a',
        displayImg: displayImg || '/game-assets/gold_coin.png',
        shortTitle: 'XU NÂNG CẤP',
        valText: `+${Number(w.value) >= 1000 ? (Number(w.value) / 1000) + 'K' : w.value} XU`
      };
    }
    if (itType === 'none' || itName.includes('may mắn') || itName.includes('trượt')) {
      return {
        theme: 'miss',
        fillGrad: 'url(#grad-slice-miss)',
        stroke: '#64748b',
        strokeGlow: 'rgba(100, 116, 139, 0.5)',
        glowColor: '#64748b',
        tag: 'CHÚC MAY MẮN',
        tagBg: 'rgba(100, 116, 139, 0.25)',
        tagBorder: '#475569',
        tagText: '#94a3b8',
        displayImg: null,
        shortTitle: 'CHÚC MAY MẮN',
        valText: 'LẦN SAU'
      };
    }
    if (itType === 'money') {
      return {
        theme: 'money',
        fillGrad: 'url(#grad-slice-money)',
        stroke: '#34d399',
        strokeGlow: 'rgba(16, 185, 129, 0.85)',
        glowColor: '#10b981',
        tag: 'TIỀN VÍ',
        tagBg: 'rgba(16, 185, 129, 0.3)',
        tagBorder: '#10b981',
        tagText: '#a7f3d0',
        displayImg,
        shortTitle: 'CỘNG TIỀN VÍ',
        valText: `+${Number(w.value) >= 1000 ? (Number(w.value) / 1000) + 'K' : w.value} VNĐ`
      };
    }
    if (itType === 'spin') {
      return {
        theme: 'spin',
        fillGrad: 'url(#grad-slice-spin)',
        stroke: '#f472b6',
        strokeGlow: 'rgba(236, 72, 153, 0.85)',
        glowColor: '#ec4899',
        tag: 'THẺ MAY MẮN',
        tagBg: 'rgba(236, 72, 153, 0.3)',
        tagBorder: '#ec4899',
        tagText: '#fbcfe8',
        displayImg,
        shortTitle: 'THẺ MAY MẮN',
        valText: `+${w.value || 1} LƯỢT`
      };
    }

    // Default fallback
    return {
      theme: 'default',
      fillGrad: w.color || '#1e293b',
      stroke: '#94a3b8',
      strokeGlow: 'rgba(148, 163, 184, 0.5)',
      glowColor: '#64748b',
      tag: 'PHẦN THƯỞNG',
      tagBg: 'rgba(255, 255, 255, 0.1)',
      tagBorder: '#94a3b8',
      tagText: '#e2e8f0',
      displayImg,
      shortTitle: w.name || 'QUÀ TẶNG',
      valText: `${w.rate || ''}`
    };
  };

  // THUẬT TOÁN TÍNH TỌA ĐỘ NAN QUẠT SVG CHO MẶT BÁNH XE
  const N = activeDb.length || 1;
  const sliceAngle = 360 / N;
  const cx = 260;
  const cy = 260;
  const rOuter = 216;

  // LỌC RA NHỮNG NGƯỜI QUAY TRÚNG VẬT PHẨM IN-GAME MỚI NHẤT ĐỂ CHẠY CHỮ
  // (Bỏ qua hoàn toàn các quà tiền mặt VNĐ cũ như Sunnalucy 20k VNĐ và lượt trượt; nếu chưa ai trúng vật phẩm game thì để trống)
  const isGameRewardTx = (t) => {
    if (!t) return false;
    const tType = t.type || '';
    if (tType !== 'spin_win' && !t.id?.startsWith('WO_WHEEL')) return false;

    const act = (t.action || t.package_name || '').trim();
    const actLower = act.toLowerCase();

    // Loại bỏ hoàn toàn kết quả trượt
    if (actLower.includes('chúc may mắn') || actLower.includes('không trúng') || actLower.includes('that bai')) {
      return false;
    }

    // Trước 5h00 sáng 17/10 (giai đoạn test/bí mật): Tuyệt đối không cho phép lộ sự kiện Phù Thủy lên Marquee
    // Từ 5h00 sáng 17/10 trở đi: Tự động cho phép người chơi trúng Nón / Quà hiển thị trên thanh vinh danh bình thường!
    const WIZARD_OPEN_MS = new Date('2026-10-17T05:00:00+07:00').getTime();
    const isBeforeEventOpen = Date.now() < WIZARD_OPEN_MS;
    if (isBeforeEventOpen) {
      if (tType === 'wizard_card_win' || String(t.id || '').toLowerCase().includes('wiz') || actLower.includes('phù thủy') || actLower.includes('nón')) {
        return false;
      }
    }

    // Loại bỏ hoàn toàn tiền mặt / VNĐ cũ (như Sunnalucy vừa nhận 20k VNĐ, 10k VNĐ...)
    if (actLower.includes('vnđ') || actLower.includes('vnd') || actLower.includes('tiền') || actLower.includes('quỹ')) {
      return false;
    }

    // Loại bỏ lượt quay web thông thường (+1 Lượt, +2 Lượt) trừ khi là lượt đánh boss
    if ((actLower.includes('cộng 1 lượt') || actLower.includes('cộng 2 lượt') || actLower.includes('lượt quay')) &&
        !actLower.includes('đánh') && !actLower.includes('boss')) {
      return false;
    }

    // Nhận diện các phần thưởng vật phẩm Game:
    // - Giày Thần Tốc / Giày Huyền Thoại
    // - Đá Tinh Hoa
    // - Viên Tinh Thể / Tinh Thể Cường Hóa
    // - Lượt Đánh Boss
    // - Hòm Boss / Rương Boss
    // - Hòm Hoàng Kim / Rương Hoàng Kim
    // - Xu Nâng Cấp
    // - Hoặc bất kỳ item nào bắt đầu bằng game_
    const isGameItem =
      actLower.includes('giày') ||
      actLower.includes('thần tốc') ||
      actLower.includes('huyền thoại') ||
      actLower.includes('tinh hoa') ||
      actLower.includes('tinh thể') ||
      actLower.includes('boss') ||
      actLower.includes('hoàng kim') ||
      actLower.includes('lượt đánh') ||
      actLower.includes('xu nâng cấp') ||
      actLower.includes('hòm') ||
      actLower.includes('rương') ||
      (t.item_type && String(t.item_type).startsWith('game_'));

    return isGameItem;
  };

  const recentWinners = [...transactionsDb]
    .filter(isGameRewardTx)
    .sort((a, b) => getRecordTime(b) - getRecordTime(a))
    .slice(0, 5);

  // 24 ĐÈN LED CHẠY VIỀN KHUNG HOÀNG GIA
  const numLeds = 24;
  const ledsSvg = Array.from({ length: numLeds }).map((_, idx) => {
    const ang = idx * (360 / numLeds);
    const rad = (ang * Math.PI) / 180;
    const lx = cx + 242 * Math.sin(rad);
    const ly = cy - 242 * Math.cos(rad);
    const isAlt = idx % 2 === 0;

    return (
      <circle
        key={idx}
        cx={lx.toFixed(2)}
        cy={ly.toFixed(2)}
        r="4.5"
        className={isSpinning ? (isAlt ? 'wheel-led-a' : 'wheel-led-b') : ''}
        fill={isAlt ? '#fef08a' : '#f43f5e'}
        stroke="#451a03"
        strokeWidth="1.5"
        style={{
          filter: isAlt
            ? 'drop-shadow(0 0 6px rgba(254, 240, 138, 0.9))'
            : 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.9))'
        }}
      />
    );
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans pb-24 md:pb-12 overflow-hidden relative">
      {renderNavbar()}

      {/* Ambient background glows */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-amber-600/15 via-rose-600/10 to-transparent blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 mt-3 md:mt-8 relative z-10">

        {/* HEADER VÒNG QUAY SIÊU CẤP */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border border-amber-500/30 text-amber-300 text-xs md:text-sm font-extrabold uppercase tracking-widest shadow-lg shadow-amber-500/10 mb-3 animate-pulse">
            <Sparkles size={16} className="text-amber-400" /> Săn Thần Khí &amp; Vật Phẩm Game Độc Quyền
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 md:gap-3">
            <Gift className="text-amber-400 w-7 h-7 sm:w-10 sm:h-10 shrink-0" />
            <span>VÒNG QUAY HOÀNG GIA</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            Tích lũy lượt quay nhận quà in-game trực tiếp và bảo hiểm 121 lần nhận Giày Huyền Thoại Thần Tốc.
          </p>
        </div>

        {/* THANH ĐIỀU KHIỂN & TIẾN TRÌNH BẢO HIỂM TÍCH HỢP TẤT CẢ TRONG 1 (ALL-IN-ONE COMPACT CONSOLE) */}
        <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-[#0f172a]/95 via-[#0c1322]/95 to-[#080d18]/95 border border-amber-500/35 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden mb-6 text-left backdrop-blur-md">
          
          {/* TẦNG 1: THÔNG TIN TÀI KHOẢN & VÉ QUAY (User Hub & Spin Wallet Bar) */}
          <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#070b14]/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Bên trái: Tab Chế độ & ID Game */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Nút chế độ quay */}
              {wheelItemsMoneyDb.length > 0 ? (
                <div className="flex bg-[#030712] p-0.5 rounded-lg border border-slate-800 shrink-0">
                  {wheelItemsSpinDb.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPlayMode('spin')}
                      className={`px-3 py-1 text-xs font-black rounded-md transition-all flex items-center gap-1.5 ${
                        playMode === 'spin'
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Ticket size={13} /> <span>Vòng Quay Lượt</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPlayMode('money')}
                    className={`px-3 py-1 text-xs font-black rounded-md transition-all flex items-center gap-1.5 ${
                      playMode === 'money'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wallet size={13} /> <span>Vòng Quay Tiền</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg text-xs font-black shrink-0">
                  <Ticket size={13} /> <span>Vòng Quay Lượt</span>
                </div>
              )}

              {/* ID Game liên kết & Tài nguyên */}
              {playMode === 'spin' && (
                currentUser?.linked_game_id ? (
                  <div className="flex items-center gap-2 bg-[#030712]/80 border border-slate-800/80 px-2.5 py-1 rounded-lg text-xs">
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      🎮 <span className="font-mono text-white font-black">@{currentUser.linked_game_id}</span>
                    </span>
                    <span className="text-slate-700">|</span>
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      🪙 {new Intl.NumberFormat('vi-VN').format(bossPlayerSummary?.bonus_coins || 0)} <span className="text-[10px] text-slate-400 font-normal">Xu</span>
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) return requireAuth('login');
                      setShowLinkOtpModal(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 text-xs font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>⚠️ Liên kết ID Game</span>
                  </button>
                )
              )}
            </div>

            {/* Bên phải: Cụm Số Vé Hiện Có & Nút Nạp Lượt liền khối */}
            <div className="flex items-center gap-1.5 bg-[#030712] border border-amber-500/35 rounded-xl p-1 shadow-inner shrink-0">
              <div className="flex items-center gap-1.5 px-2 py-0.5">
                <Ticket size={14} className="text-amber-400" />
                <span className="text-xs text-slate-300 font-medium">Lượt:</span>
                <span className="text-amber-400 font-mono font-black text-sm sm:text-base">
                  {currentUser ? (currentUser.spins || 0) : 0}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) return requireAuth('login');
                  setCurrentView('naptien');
                }}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shrink-0 border border-emerald-400/30"
              >
                <Wallet size={12} />
                <span>Nạp Lượt</span>
                <span className="bg-emerald-950/70 text-emerald-200 text-[10px] px-1 py-0.2 rounded font-bold">20k</span>
              </button>
            </div>
          </div>

          {/* TẦNG 2: THẺ TIẾN TRÌNH BẢO HIỂM GIÀY THẦN TỐC (Legendary Shoes Pity Hub) */}
          {playMode === 'spin' && (() => {
            const pityLimit = Number(wheelConfig?.pityTarget) || 120;
            return (
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-500/[0.05] via-rose-500/[0.03] to-transparent">
              
              {/* Header hàng 1: Thông tin Trang Bị (Trái) & Hạn Chót Đếm Ngược (Phải) */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                
                {/* Trái: Icon Giày + Tên + Thuộc tính */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 via-rose-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)] p-1">
                    <img
                      src={LEGENDARY_SHOES_IMG}
                      alt="Giày Thần Tốc"
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-amber-300 text-sm sm:text-base tracking-wide">
                        Bảo Hiểm Giày Thần Tốc
                      </span>
                      <span className="text-[10px] text-amber-300 font-black bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded shadow-sm">
                        +300 Tốc độ
                      </span>
                      <span className="text-[10px] text-rose-300 font-extrabold bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 rounded">
                        Huyền Thoại
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phải: Tiến độ bảo hiểm gọn gàng */}
                <div className="bg-[#030712]/90 border border-slate-800 px-3 py-1 rounded-xl text-xs shrink-0 shadow-inner flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] font-medium">Bảo hiểm:</span>
                  <strong className="font-mono font-black text-amber-400 text-xs sm:text-sm">
                    {shoesPity} <span className="text-slate-500 font-normal text-[11px]">/ {pityLimit}</span>
                  </strong>
                </div>
              </div>

              {/* Box Tiến độ & Thanh Bar Pity (Chuẩn game AAA, nhìn phát hiểu ngay) */}
              <div className="bg-[#040814]/80 border border-slate-800/90 rounded-xl p-3 sm:p-3.5 shadow-inner">
                
                {/* Dòng hiển thị con số rõ ràng */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400 font-medium text-xs">Tiến độ bảo hiểm:</span>
                    <strong className="font-mono font-black text-amber-400 text-sm sm:text-base">
                      {shoesPity} <span className="text-slate-500 font-normal text-xs">/ {pityLimit}</span>
                    </strong>
                  </div>

                  <div className="text-right">
                    {shoesPity >= pityLimit ? (
                      <span className="text-rose-400 font-black text-xs sm:text-sm animate-pulse flex items-center gap-1">
                        🔥 LẦN {pityLimit + 1}: 100% TRÚNG GIÀY!
                      </span>
                    ) : (
                      <span className="text-xs">
                        <span className="text-slate-400 font-medium">Còn </span>
                        <strong className="font-mono font-black text-yellow-300 text-sm">{Math.max(0, pityLimit - shoesPity)}</strong>
                        <span className="text-slate-400 font-medium"> lượt </span>
                        <span className="text-emerald-400 font-bold ml-1 hidden sm:inline">• Lần {pityLimit + 1} chắc chắn trúng</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Thanh Progress Bar đẹp mắt */}
                <div className="w-full h-3 sm:h-3.5 bg-[#02050c] rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 relative ${
                      shoesPity >= pityLimit
                        ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-300 shadow-[0_0_14px_rgba(244,63,94,0.95)] animate-pulse'
                        : 'bg-gradient-to-r from-indigo-500 via-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, Math.round((shoesPity / pityLimit) * 100)))}%` }}
                  ></div>
                </div>

                {/* Dòng mốc 0 lượt và N lượt bên dưới thanh bar */}
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500 font-mono">
                  <span>0 lượt</span>
                  <span>{pityLimit} lượt</span>
                </div>
              </div>

            </div>
            );
          })()}
        </div>

        {/* KHUNG ĐẾM NGƯỢC HẠN CHÓT SỰ KIỆN GIÀY THẦN TỐC (TÁCH RIÊNG BIỆT - TẬN DỤNG HẾT KHÔNG GIAN) */}
        <div className="w-full max-w-2xl mx-auto mb-6 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#0d1424] to-amber-950/40 border border-amber-500/35 shadow-[0_6px_24px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-left">
            
            {/* Trái: Icon + Tiêu đề + Hạn chót + Mô tả */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-inner">
                  ⏳
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-amber-300 whitespace-nowrap">
                      Sự kiện Giày Thần Tốc
                    </span>
                    <span className="bg-rose-500/20 text-rose-300 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full border border-rose-500/40 shrink-0 animate-pulse">
                      {wheelConfig?.endTime ? (
                        `Hạn chót: ${new Date(wheelConfig.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date(wheelConfig.endTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`
                      ) : 'Hạn chót: 23h59 31/10'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5 hidden sm:block">
                    Đếm ngược kết thúc sự kiện mở khóa Giày Thần Tốc
                  </div>
                </div>
              </div>
            </div>

            {/* Phải: 4 ô đếm ngược trải đều, tận dụng trọn vẹn không gian */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 font-mono w-full sm:w-auto shrink-0">
              <span className="text-slate-400 font-sans text-xs font-semibold mr-1 hidden md:inline">Kết thúc sau:</span>
              <div className="bg-[#030712]/90 border border-amber-500/35 rounded-xl px-2.5 sm:px-3 py-1.5 text-center min-w-[46px] sm:min-w-[50px] shadow-sm">
                <div className="text-amber-400 font-black text-sm sm:text-base leading-none">{wheelCountdown.days}</div>
                <div className="text-[8px] sm:text-[9px] text-slate-400 font-sans font-bold uppercase mt-1">Ngày</div>
              </div>
              <span className="text-amber-400/70 font-black text-xs sm:text-sm">:</span>
              <div className="bg-[#030712]/90 border border-amber-500/35 rounded-xl px-2.5 sm:px-3 py-1.5 text-center min-w-[46px] sm:min-w-[50px] shadow-sm">
                <div className="text-amber-400 font-black text-sm sm:text-base leading-none">{wheelCountdown.hours}</div>
                <div className="text-[8px] sm:text-[9px] text-slate-400 font-sans font-bold uppercase mt-1">Giờ</div>
              </div>
              <span className="text-amber-400/70 font-black text-xs sm:text-sm">:</span>
              <div className="bg-[#030712]/90 border border-amber-500/35 rounded-xl px-2.5 sm:px-3 py-1.5 text-center min-w-[46px] sm:min-w-[50px] shadow-sm">
                <div className="text-amber-400 font-black text-sm sm:text-base leading-none">{wheelCountdown.minutes}</div>
                <div className="text-[8px] sm:text-[9px] text-slate-400 font-sans font-bold uppercase mt-1">Phút</div>
              </div>
              <span className="text-amber-400/70 font-black text-xs sm:text-sm">:</span>
              <div className="bg-[#030712]/90 border border-rose-500/50 rounded-xl px-2.5 sm:px-3 py-1.5 text-center min-w-[46px] sm:min-w-[50px] shadow-[0_0_12px_rgba(244,63,94,0.35)]">
                <div className="text-rose-400 font-black text-sm sm:text-base leading-none animate-pulse">{wheelCountdown.seconds}</div>
                <div className="text-[8px] sm:text-[9px] text-rose-300 font-sans font-bold uppercase mt-1">Giây</div>
              </div>
            </div>

          </div>
        </div>

        {/* BỐ CỤC 2 CỘT: TRÁI LÀ VÒNG QUAY & BẢN ĐIỀU KHIỂN - PHẢI LÀ LỊCH SỬ QUAY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-12">

          {/* CỘT TRÁI (8/12 phần): CHỨA VÒNG QUAY HOÀNG KIM & BÀN ĐIỀU KHIỂN */}
          <div className="lg:col-span-8 flex flex-col items-center">

            {/* THANH MARQUEE NGƯỜI TRÚNG VẬT PHẨM GAME MỚI NHẤT (NẾU CHƯA AI TRÚNG THÌ ĐỂ TRỐNG / ẨN ĐI) */}
            {recentWinners.length > 0 && (
              <div className="w-full max-w-xl mx-auto overflow-hidden bg-rose-950/20 border border-rose-500/30 rounded-full py-2 mb-6 relative flex items-center shadow-inner group">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#070b14] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#070b14] to-transparent z-10 pointer-events-none"></div>
                <div className="flex whitespace-nowrap animate-marquee w-max group-hover:pause">
                  {recentWinners.concat(recentWinners).map((tx, idx) => {
                    let cleanPrizeName = (tx.action || tx.package_name || '')
                      .replace(/^Quay Vòng Quay x10 \(10 Lượt\)\s*-\s*/gi, '')
                      .replace(/^Trúng phần thưởng \(Quay x10\):\s*/gi, '')
                      .replace(/^Trúng phần thưởng:\s*/gi, '')
                      .replace(/^Trúng thưởng:\s*/gi, '')
                      .replace(/^Cộng\s+/gi, '')
                      .trim();

                    const lowerPrize = cleanPrizeName.toLowerCase();
                    let prizeEmoji = '✨';
                    if (lowerPrize.includes('giày') || lowerPrize.includes('thần tốc')) prizeEmoji = '👟';
                    else if (lowerPrize.includes('tinh hoa')) prizeEmoji = '💎';
                    else if (lowerPrize.includes('tinh thể')) prizeEmoji = '🔮';
                    else if (lowerPrize.includes('hoàng kim')) prizeEmoji = '👑';
                    else if (lowerPrize.includes('boss') || lowerPrize.includes('hòm') || lowerPrize.includes('rương')) prizeEmoji = '🎁';
                    else if (lowerPrize.includes('lượt đánh')) prizeEmoji = '⚔️';
                    else if (lowerPrize.includes('xu')) prizeEmoji = '🪙';

                    return (
                      <span key={idx} className="text-white text-xs sm:text-sm mx-6 flex items-center gap-2">
                        <span className="text-sm select-none">{prizeEmoji}</span>
                        <span className="text-slate-400">[{tx.date}]</span>
                        <span className="font-bold text-blue-400">{tx.user || tx.nickname || 'Người chơi'}</span> vừa nhận
                        <span className="font-black text-rose-400">{cleanPrizeName}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* KHUNG VÒNG QUAY HOÀNG KIM (SVG LUXURY CASINO ENGINE) */}
            <div className="relative shrink-0 w-[310px] h-[310px] sm:w-[390px] sm:h-[390px] md:w-[460px] md:h-[460px] lg:w-[480px] lg:h-[480px] mx-auto flex items-center justify-center p-2 mb-8">
              {/* Hào quang nền phía sau bánh xe */}
              <div className="absolute inset-0 rounded-full blur-[50px] opacity-70 bg-gradient-to-tr from-amber-500/30 via-rose-500/25 to-blue-500/30 animate-pulse pointer-events-none"></div>

              {/* VÒNG QUAY CHÍNH DẠNG SVG HOÀNG KIM */}
              <svg
                viewBox="0 0 520 520"
                className="w-full h-full select-none overflow-visible filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
              >
                <defs>
                  {/* Radial gradient khung viền mạ vàng Hoàng Kim 3D */}
                  <radialGradient id="rim-gold-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="35%" stopColor="#f59e0b" />
                    <stop offset="70%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                  </radialGradient>

                  {/* Gradient kim chỉ vàng 3D */}
                  <linearGradient id="needle-gold-3d" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#fef08a" />
                    <stop offset="65%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>

                  {/* Lõi ngọc Ruby đỏ */}
                  <radialGradient id="ruby-core" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="35%" stopColor="#ef4444" />
                    <stop offset="75%" stopColor="#991b1b" />
                    <stop offset="100%" stopColor="#450a0a" />
                  </radialGradient>

                  <linearGradient id="core-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#fef08a" />
                    <stop offset="80%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#a16207" />
                  </linearGradient>

                  {/* 1. Giày Huyền Thoại: Vàng Ánh Kim Solar */}
                  <linearGradient id="grad-slice-shoes" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="40%" stopColor="#b45309" />
                    <stop offset="80%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fef08a" />
                  </linearGradient>

                  {/* 2. Rương Hoàng Kim: Tím Huyền Bí Velvet */}
                  <linearGradient id="grad-slice-royal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b0764" />
                    <stop offset="50%" stopColor="#6b21a8" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>

                  {/* 3. Rương Boss: Xanh Lục Bảo Jade */}
                  <linearGradient id="grad-slice-boss" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#064e3b" />
                    <stop offset="50%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>

                  {/* 4. Lượt Đánh: Xanh Lam Điện Cobalt */}
                  <linearGradient id="grad-slice-attack" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="50%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>

                  {/* 5. Xu Nâng Cấp: Hoàng Hổ Phách Citrine */}
                  <linearGradient id="grad-slice-coins" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="50%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>

                  {/* 6. Chúc May Mắn / Trượt: Hắc Thạch Obsidian */}
                  <linearGradient id="grad-slice-miss" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="55%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>

                  {/* 7. Tiền Ví: Ngọc Lục Tiền */}
                  <linearGradient id="grad-slice-money" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#064e3b" />
                    <stop offset="55%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>

                  {/* 8. Thêm Vé Quay: Hồng Thạch Ruby */}
                  <linearGradient id="grad-slice-spin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#831843" />
                    <stop offset="55%" stopColor="#db2777" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>

                {/* VỎ NGOÀI KHUNG BÁNH XE MẠ VÀNG 3D */}
                <circle cx={cx} cy={cy} r="255" fill="#0b1120" stroke="url(#rim-gold-gradient)" strokeWidth="18" />
                <circle cx={cx} cy={cy} r="245" fill="none" stroke="#451a03" strokeWidth="2.5" />
                <circle cx={cx} cy={cy} r="236" fill="none" stroke="#fef08a" strokeWidth="1.5" opacity="0.6" />
                <circle cx={cx} cy={cy} r="226" fill="#070b14" stroke="#78350f" strokeWidth="3" />

                {/* 24 BÓNG ĐÈN LED CHẠY VIỀN CASINO */}
                {ledsSvg}

                {/* BÁNH XE XOAY (ROTOR WHEEL) */}
                <g
                  id="wheel-rotor"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1.0)' : 'none'
                  }}
                >
                  {/* CÁC NAN QUẠT VÀ NỘI DUNG VẬT PHẨM */}
                  {activeDb.map((item, idx) => {
                    const startDeg = idx * sliceAngle;
                    const endDeg = (idx + 1) * sliceAngle;
                    const midDeg = startDeg + sliceAngle / 2;
                    const rad1 = (startDeg * Math.PI) / 180;
                    const rad2 = (endDeg * Math.PI) / 180;

                    const x1 = cx + rOuter * Math.sin(rad1);
                    const y1 = cy - rOuter * Math.cos(rad1);
                    const x2 = cx + rOuter * Math.sin(rad2);
                    const y2 = cy - rOuter * Math.cos(rad2);

                    const pathD = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rOuter} ${rOuter} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
                    const vis = getPrizeVisual(item, idx);

                    return (
                      <g key={item.id || idx}>
                        {/* Nan quạt */}
                        <path
                          d={pathD}
                          fill={vis.fillGrad}
                          stroke="#facc15"
                          strokeWidth="1.2"
                          strokeOpacity="0.35"
                        />

                        {/* Đường viền nan vàng hoàng gia */}
                        <line
                          x1={cx}
                          y1={cy}
                          x2={x1.toFixed(2)}
                          y2={y1.toFixed(2)}
                          stroke="url(#rim-gold-gradient)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          style={{ filter: 'drop-shadow(0 0 2px rgba(250,204,21,0.6))' }}
                        />

                        {/* Nội dung nan quạt: Tên, Ảnh, Giá trị */}
                        <g transform={`rotate(${midDeg} ${cx} ${cy})`}>
                          {/* Tên vật phẩm */}
                          <text
                            x={cx}
                            y={72}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize={N >= 8 ? "10" : "12"}
                            fontWeight="900"
                            style={{
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              letterSpacing: '0.3px',
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.95))'
                            }}
                          >
                            {vis.shortTitle}
                          </text>

                          {/* Ảnh hoặc Icon biểu trưng */}
                          {vis.displayImg ? (
                            <image
                              href={vis.displayImg}
                              xlinkHref={vis.displayImg}
                              x={cx - (N >= 8 ? 20 : 24)}
                              y={86}
                              width={N >= 8 ? 40 : 48}
                              height={N >= 8 ? 40 : 48}
                              style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.85))'
                              }}
                            />
                          ) : (
                            <g transform={`translate(${cx}, 110)`}>
                              <circle cx="0" cy="0" r="16" fill="rgba(0,0,0,0.5)" stroke={vis.stroke} strokeWidth="1" />
                              <text x="0" y="6" textAnchor="middle" fontSize="18">
                                {vis.theme === 'miss' ? '💨' : '🎁'}
                              </text>
                            </g>
                          )}

                          {/* Badge giá trị/phần thưởng */}
                          <g transform={`translate(${cx}, ${N >= 8 ? 146 : 152})`}>
                            <rect
                              x="-36"
                              y="-9"
                              width="72"
                              height="18"
                              rx="9"
                              fill="rgba(11, 17, 32, 0.85)"
                              stroke={vis.stroke}
                              strokeWidth="1.2"
                              style={{ filter: `drop-shadow(0 0 4px ${vis.strokeGlow})` }}
                            />
                            <text
                              x="0"
                              y="3.5"
                              textAnchor="middle"
                              fill={vis.tagText}
                              fontSize={N >= 8 ? "8.5" : "9.5"}
                              fontWeight="900"
                              style={{ letterSpacing: '0.2px' }}
                            >
                              {vis.valText}
                            </text>
                          </g>
                        </g>
                      </g>
                    );
                  })}
                </g>

                {/* TÂM VÒNG QUAY HOÀNG GIA 3D (CỐ ĐỊNH, KHÔNG QUAY) */}
                <g style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.95))' }}>
                  <circle cx={cx} cy={cy} r="48" fill="url(#rim-gold-gradient)" stroke="#78350f" strokeWidth="2.5" />
                  <circle cx={cx} cy={cy} r="41" fill="#0b1120" stroke="#facc15" strokeWidth="1.5" />
                  <circle cx={cx} cy={cy} r="34" fill="url(#ruby-core)" stroke="#fde047" strokeWidth="1.8" />
                  {/* Vương miện hoàng kim ở trung tâm */}
                  <g transform={`translate(${cx - 14}, ${cy - 12})`}>
                    <path
                      d="M4 16L6 6L11 11L14 4L17 11L22 6L24 16H4Z"
                      fill="url(#core-gold)"
                      stroke="#451a03"
                      strokeWidth="1"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(254,240,138,0.9))' }}
                    />
                  </g>
                  <circle cx={cx - 8} cy={cy - 10} r="3.5" fill="#ffffff" opacity="0.6" />
                </g>

                {/* KIM CHỈ VÀNG HOÀNG GIA (POINTER 3D TẠI 12H) */}
                <g
                  className={isSpinning ? 'animate-needle-tick' : ''}
                  style={{
                    transformOrigin: `${cx}px 24px`,
                    filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.95))'
                  }}
                >
                  {/* Thân kim tam giác nhọn 3D */}
                  <polygon
                    points={`${cx},60 ${cx - 18},16 ${cx},22 ${cx + 18},16`}
                    fill="url(#needle-gold-3d)"
                    stroke="#78350f"
                    strokeWidth="2"
                  />
                  {/* Sống lưng kim sáng chói */}
                  <line x1={cx} y1="22" x2={cx} y2="58" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
                  {/* Chốt ngọc Ruby đỏ */}
                  <circle cx={cx} cy="18" r="9" fill="url(#ruby-core)" stroke="#fde047" strokeWidth="2" />
                  <circle cx={cx - 2} cy="15" r="2.5" fill="#ffffff" opacity="0.8" />
                </g>
              </svg>
            </div>

            {/* BÀN PHÍM ĐIỀU KHIỂN QUAY X1 & QUAY X10 SIÊU TỐC */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
              {/* NÚT QUAY X1 */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className={`flex-1 w-full bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 text-white px-5 py-3.5 rounded-2xl font-black text-base shadow-[0_8px_25px_rgba(225,29,72,0.45)] border-t border-rose-300/40 transition-all flex flex-col items-center justify-center leading-tight ${
                  isSpinning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:from-rose-400 hover:to-rose-600 hover:scale-105 active:scale-95'
                }`}
              >
                <span className="flex items-center gap-2 uppercase tracking-wider text-sm sm:text-base">
                  <Sparkles size={18} className="text-yellow-300" />
                  <span>{isSpinning && spinActionType === 'x1' ? 'ĐANG QUAY...' : 'QUAY X1 (1 LẦN)'}</span>
                </span>
                <span className="text-xs text-rose-100 font-bold mt-1 font-mono bg-black/20 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                  {playMode === 'money' ? new Intl.NumberFormat('vi-VN').format(wheelConfig.moneyCost) + 'đ' : (wheelConfig.spinCost || 1) + ' Lượt'}
                </span>
              </button>

              {/* NÚT QUAY X10 - HOÀNG KIM & SỔ ĐỦ 10 MÓN */}
              <button
                type="button"
                onClick={handleSpinX10}
                disabled={isSpinning}
                className={`flex-1 w-full bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl font-black text-base shadow-[0_8px_30px_rgba(245,158,11,0.55)] border-t border-yellow-200/60 transition-all flex flex-col items-center justify-center leading-tight relative overflow-hidden group ${
                  isSpinning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:from-amber-300 hover:to-orange-500 hover:scale-105 active:scale-95'
                }`}
              >
                <span className="absolute -top-1 right-2 bg-rose-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-md animate-pulse">
                  Sổ 10 Món 🔥
                </span>

                <span className="flex items-center gap-2 uppercase tracking-wider text-sm sm:text-base text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <Flame size={20} className="text-yellow-300 animate-bounce" />
                  <span>{isSpinning && spinActionType === 'x10' ? 'ĐANG SỔ 10 MÓN...' : 'QUAY X10 (10 LẦN)'}</span>
                </span>
                <span className="text-xs text-amber-950 font-black mt-1 font-mono bg-yellow-300/80 px-2.5 py-0.5 rounded-full border border-yellow-400">
                  {playMode === 'money'
                    ? new Intl.NumberFormat('vi-VN').format((wheelConfig.moneyCost || 20000) * 10) + 'đ'
                    : (((wheelConfig.spinCost || 1) * 10) + ' Lượt')}
                </span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI (4/12 phần): LỊCH SỬ QUAY HOÀNG GIA */}
          <div className="lg:col-span-4 flex flex-col bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl h-[420px] lg:h-[680px] w-full">
            <div className="p-4 border-b border-slate-800 bg-[#070b14]/90 flex items-center justify-between shrink-0">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <History size={18} className="text-amber-400" /> Lịch Sử Quay Của Bạn
              </h3>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                {transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).length} bản ghi
              </span>
            </div>

            <div
              className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5"
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.target;
                if (scrollTop + clientHeight >= scrollHeight - 10) setVisibleSpinsClient(prev => prev + 5);
              }}
            >
              {transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm p-6">
                  <Gift size={36} className="text-slate-700 mb-2" />
                  <span>Bạn chưa có lượt quay nào.</span>
                  <span className="text-xs text-slate-600 mt-1">Hãy nhấn Quay để nhận các vật phẩm giá trị!</span>
                </div>
              ) : (
                transactionsDb.filter(t => t.type === 'spin_win' && t.user === currentUser?.name).slice(0, visibleSpinsClient).map((tx, idx) => {
                  let displayAction = tx.action;
                  displayAction = displayAction.replace(/Quay vong quay - Khong trung/gi, 'Chúc may mắn lần sau');
                  displayAction = displayAction.replace(/Quay vòng quay - Không trúng/gi, 'Chúc may mắn lần sau');
                  displayAction = displayAction.replace(/Trung phan thuong:/gi, 'Trúng phần thưởng:');
                  displayAction = displayAction.replace(/Trung thuong:/gi, 'Trúng thưởng:');
                  displayAction = displayAction.replace(/Cong /gi, 'Cộng ');
                  displayAction = displayAction.replace(/Luot/gi, 'Lượt');

                  const isWin = displayAction.includes('Trúng');
                  const isShoes = displayAction.toLowerCase().includes('giày');
                  const isRoyal = displayAction.toLowerCase().includes('hoàng kim');
                  const isBoss = displayAction.toLowerCase().includes('hòm boss');
                  const isAttacks = displayAction.toLowerCase().includes('lượt đánh') || displayAction.toLowerCase().includes('lượt boss') || displayAction.toLowerCase().includes('đánh boss');
                  const isCoins = displayAction.toLowerCase().includes('xu') && !displayAction.toLowerCase().includes('chợ xu');
                  const isStone = displayAction.toLowerCase().includes('tinh hoa');
                  const isCrystal = displayAction.toLowerCase().includes('tinh thể');
                  const isSpins = tx.isSpinCost || displayAction.toLowerCase().includes('lượt quay') || displayAction.toLowerCase().includes('vé quay');
                  const isX10 = displayAction.includes('Quay x10');

                  let resultLabel = 'Trượt';
                  let resultColor = 'text-slate-500';
                  let borderClass = 'border-slate-800/80';
                  let iconPrefix = '💨 ';

                  if (isShoes) {
                    resultLabel = '👟 GIÀY HT';
                    resultColor = 'text-amber-400 font-black';
                    borderClass = 'border-amber-500/50 bg-amber-950/20';
                    iconPrefix = '👟 ';
                  } else if (isRoyal) {
                    resultLabel = '👑 HÒM HK';
                    resultColor = 'text-purple-400 font-extrabold';
                    borderClass = 'border-purple-500/40 bg-purple-950/20';
                    iconPrefix = '👑 ';
                  } else if (isBoss) {
                    resultLabel = '📦 HÒM BOSS';
                    resultColor = 'text-emerald-400 font-extrabold';
                    borderClass = 'border-emerald-500/40 bg-emerald-950/20';
                    iconPrefix = '📦 ';
                  } else if (isAttacks) {
                    const amountStr = tx.amount ? new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount)) : '';
                    resultLabel = `⚔️ ${amountStr ? `+${amountStr}` : ''} LƯỢT`;
                    resultColor = 'text-cyan-400 font-bold';
                    borderClass = 'border-cyan-500/40 bg-cyan-950/20';
                    iconPrefix = '⚔️ ';
                  } else if (isCoins) {
                    const amountStr = tx.amount ? new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount)) : '';
                    resultLabel = `🪙 ${amountStr ? `+${amountStr}` : ''} XU`;
                    resultColor = 'text-yellow-400 font-bold';
                    borderClass = 'border-yellow-500/40 bg-yellow-950/20';
                    iconPrefix = '🪙 ';
                  } else if (isStone) {
                    resultLabel = `💎 +${Math.abs(tx.amount || 1)} VIÊN`;
                    resultColor = 'text-purple-400 font-bold';
                    borderClass = 'border-purple-500/40 bg-purple-950/20';
                    iconPrefix = '💎 ';
                  } else if (isCrystal) {
                    resultLabel = `🔮 +${Math.abs(tx.amount || 1)} VIÊN`;
                    resultColor = 'text-pink-400 font-bold';
                    borderClass = 'border-pink-500/40 bg-pink-950/20';
                    iconPrefix = '🔮 ';
                  } else if (isSpins) {
                    resultLabel = `🎟️ +${Math.abs(tx.amount || 1)} Vé`;
                    resultColor = 'text-rose-400 font-bold';
                    borderClass = 'border-rose-500/40 bg-rose-950/20';
                    iconPrefix = '🎟️ ';
                  } else if (isX10) {
                    resultLabel = '🎁 x10 Quà';
                    resultColor = 'text-amber-400 font-bold';
                    borderClass = 'border-amber-500/40 bg-amber-950/20';
                    iconPrefix = '🎁 ';
                  } else if (tx.amount === 0 || !isWin) {
                    resultLabel = 'Trượt';
                    resultColor = 'text-slate-500';
                    iconPrefix = '💨 ';
                  } else {
                    resultLabel = `+${new Intl.NumberFormat('vi-VN').format(Math.abs(tx.amount))}đ`;
                    resultColor = 'text-emerald-400 font-bold';
                    iconPrefix = '🎁 ';
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex justify-between items-center transition-all bg-[#0b1120] hover:border-slate-700 text-left ${borderClass}`}
                    >
                      <div className="flex-1 pr-2">
                        <p className={`font-bold text-xs sm:text-sm line-clamp-1 ${isWin ? (isShoes ? 'text-amber-300' : 'text-white') : 'text-slate-400'}`}>
                          {iconPrefix}
                          {displayAction}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">{tx.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs sm:text-sm ${resultColor}`}>
                          {resultLabel}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* BẢNG GIẢI THƯỞNG HOÀNG GIA (LOOT SHOWCASE DÀN NGANG) */}
        <div className="mt-6 border-t border-slate-800/80 pt-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                <Sparkles size={20} className="text-amber-400" /> Bảng Danh Mục Giải Thưởng ({playMode === 'money' ? 'Vòng Quay Tiền' : 'Vòng Quay Lượt'})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Danh sách các phần thưởng có thể quay trúng kèm tỉ lệ xuất hiện chuẩn.</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full w-max">
              Tổng cộng: <strong className="text-amber-400 font-bold">{activeDb.length} vật phẩm</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {activeDb.map((w, idx) => {
              const isShoes = isLegendaryShoes(w);
              const isGame = isGameItem(w) || isShoes;
              const vis = getPrizeVisual(w, idx);

              return (
                <div
                  key={w.id || idx}
                  className={`border p-3.5 sm:p-4 rounded-2xl text-center transition-all flex flex-col items-center shadow-xl relative group hover:scale-[1.03] ${
                    isShoes
                      ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-900'
                      : vis.theme === 'royal'
                      ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-gradient-to-b from-purple-950/30 to-slate-900'
                      : vis.theme === 'boss'
                      ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/30 to-slate-900'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  {/* Badge phẩm cấp */}
                  {isShoes && (
                    <span className="absolute -top-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white shadow-lg border border-yellow-300">
                      Bảo Hiểm 121
                    </span>
                  )}
                  {isGame && !isShoes && (
                    <span className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-600 text-blue-100 border border-blue-400/40 shadow">
                      Vật Phẩm Game
                    </span>
                  )}

                  {/* Vùng hiển thị Icon/Ảnh lớn */}
                  <div className="relative mb-3 mt-1.5 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-black/40 border border-slate-700/60 shadow-inner group-hover:border-amber-400/50 transition-colors">
                    {vis.displayImg ? (
                      <img
                        src={vis.displayImg}
                        className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                        alt={w.name}
                        onError={(e) => {
                          if (isShoes || w.type === 'game_shoes_legendary') {
                            e.target.src = LEGENDARY_SHOES_IMG;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{vis.theme === 'miss' ? '💨' : '🎁'}</span>
                    )}
                  </div>

                  <p className={`font-black text-xs sm:text-sm line-clamp-1 ${isShoes ? 'text-amber-300' : 'text-white'}`}>
                    {w.name}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold bg-slate-800 text-blue-300 px-2 py-0.5 rounded-full border border-slate-700">
                      Tỉ lệ: {w.rate}
                    </span>
                    <span className="text-[10px] font-bold bg-[#070b14] text-slate-400 px-2 py-0.5 rounded-full border border-slate-800">
                      Còn: {w.quantity ?? 999}
                    </span>
                  </div>
                </div>
              );
            })}
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
              {(() => {
                const isShoesReward = Boolean(
                  giftModalData.isShoes ||
                  isLegendaryShoes(giftModalData.item) ||
                  giftModalData.item?.type === 'game_shoes_legendary' ||
                  giftModalData.item?.name?.toLowerCase().includes('giày')
                );
                const modalImg = isShoesReward
                  ? (getShoesImage(giftModalData.item?.image) || LEGENDARY_SHOES_IMG)
                  : (giftModalData.item?.image || (
                      (giftModalData.prizeType === 'game_coins' || giftModalData.item?.name?.toLowerCase().includes('xu')) ? '/game-assets/gold_coin.png' :
                      (giftModalData.prizeType === 'game_attacks' || giftModalData.item?.name?.toLowerCase().includes('lượt đánh')) ? '/game-assets/weapon_song_dao.png' :
                      (giftModalData.prizeType === 'game_boss_chests' || giftModalData.item?.name?.toLowerCase().includes('hòm boss')) ? '/game-assets/mystery_box_closed.png' :
                      (giftModalData.prizeType === 'game_royal_chests' || giftModalData.item?.name?.toLowerCase().includes('hoàng kim')) ? '/game-assets/royal_chest.png' :
                      (giftModalData.prizeType === 'game_essence_stone' || giftModalData.item?.name?.toLowerCase().includes('tinh hoa')) ? '/game-assets/da_tinh_hoa.png' :
                      (giftModalData.prizeType === 'game_ring_crystal' || giftModalData.item?.name?.toLowerCase().includes('tinh thể')) ? '/game-assets/ring_crystal.png' : null
                    ));
                if (modalImg && !giftModalData.isLost) {
                  return (
                    <img
                      src={isShoesReward ? (getShoesImage(modalImg) || LEGENDARY_SHOES_IMG) : modalImg}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain animate-bounce"
                      alt={giftModalData.item?.name || 'Vật phẩm'}
                      onError={(e) => {
                        if (isShoesReward) {
                          e.target.src = LEGENDARY_SHOES_IMG;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  );
                }
                return (
                  <Gift className={`text-white w-14 h-14 md:w-[60px] md:h-[60px] ${giftModalData.isLost ? 'opacity-50' : 'animate-pulse'}`} />
                );
              })()}
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

              {/* HIỂN THỊ PHẦN THƯỞNG IN-GAME */}
              {(giftModalData.isShoes || isLegendaryShoes(giftModalData.item) || giftModalData.item?.name?.toLowerCase().includes('giày')) && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-center">
                  <p className="text-amber-400 font-black text-lg md:text-xl">👟 +300 TỐC ĐỘ</p>
                  <p className="text-xs text-amber-200/80 mt-1">Giày Huyền Thoại Thần Tốc tăng tốc độ vượt trội trong mọi trận đấu!</p>
                  <p className="text-[11px] text-emerald-400 font-bold mt-1">🛡️ Bảo hiểm vòng quay đã làm mới: 0/120</p>
                </div>
              )}
              {!giftModalData.isShoes && (giftModalData.prizeType === 'game_essence_stone' || giftModalData.item?.name?.toLowerCase().includes('tinh hoa')) && (
                <p className="text-purple-400 font-black text-xl md:text-2xl mt-2">💎 +{giftModalData.prizeValue} Đá Tinh Hoa</p>
              )}
              {!giftModalData.isShoes && (giftModalData.prizeType === 'game_ring_crystal' || giftModalData.item?.name?.toLowerCase().includes('tinh thể')) && (
                <p className="text-pink-400 font-black text-xl md:text-2xl mt-2">🔮 +{giftModalData.prizeValue} Viên Tinh Thể</p>
              )}
              {!giftModalData.isShoes && giftModalData.prizeType === 'game_attacks' && (
                <p className="text-cyan-400 font-black text-xl md:text-2xl mt-2">⚔️ +{giftModalData.prizeValue} Lượt Đánh Boss</p>
              )}
              {!giftModalData.isShoes && giftModalData.prizeType === 'game_boss_chests' && (
                <p className="text-emerald-400 font-black text-xl md:text-2xl mt-2">📦 +{giftModalData.prizeValue} Hòm Boss</p>
              )}
              {!giftModalData.isShoes && giftModalData.prizeType === 'game_royal_chests' && (
                <p className="text-purple-400 font-black text-xl md:text-2xl mt-2">👑 +{giftModalData.prizeValue} Hòm Hoàng Kim</p>
              )}
              {!giftModalData.isShoes && giftModalData.prizeType === 'game_coins' && (
                <p className="text-yellow-400 font-black text-xl md:text-2xl mt-2">🪙 +{new Intl.NumberFormat('vi-VN').format(giftModalData.prizeValue)} Xu Nâng Cấp</p>
              )}

              {/* THÔNG BÁO TÌNH TRẠNG LIÊN KẾT GAME */}
              {giftModalData.isGameReward && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs">
                  {currentUser?.linked_game_id ? (
                    <p className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                      <span>✅ Đã chuyển tự động vào ID Game:</span>
                      <span className="font-mono bg-emerald-950/80 px-2 py-0.5 rounded text-white border border-emerald-500/40">@{currentUser.linked_game_id}</span>
                    </p>
                  ) : (
                    <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl text-amber-300">
                      <p className="font-bold mb-1">⚠️ Bạn chưa liên kết ID Game!</p>
                      <p className="text-[11px] text-slate-300 mb-2">Vui lòng liên kết tài khoản để nhận vật phẩm vào túi đồ nhân vật trong game.</p>
                      <button
                        onClick={() => {
                          setGiftModalData(null);
                          setIsGiftOpened(false);
                          setShowLinkOtpModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"
                      >
                        🔗 Liên Kết ID Game Ngay
                      </button>
                    </div>
                  )}
                </div>
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

      {/* MODAL SỔ ĐỦ 10 MÓN TRÚNG THƯỞNG KHI QUAY X10 */}
      {spin10ModalData && isSpin10Opened && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden p-3 sm:p-4 animate-fade-in">
          {/* Pháo hoa giấy chúc mừng */}
          {spin10ModalData.items.some(it => it.type !== 'none') && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <div key={i} className="absolute text-3xl animate-confetti" style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}>
                  {['🎉', '✨', '🎊', '👟', '👑', '🔥', '💰', '⚔️'][Math.floor(Math.random() * 8)]}
                </div>
              ))}
            </div>
          )}

          {/* Hộp Modal 10 món */}
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border-2 bg-[#0F172A] shadow-[0_0_80px_rgba(245,158,11,0.35)] border-amber-500/60 animate-zoom-in relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#172138] via-[#243354] to-[#172138] p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  <Flame size={24} className="animate-bounce" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase tracking-wide flex items-center gap-2">
                    🎉 KẾT QUẢ QUAY X10 LƯỢT
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold">
                    Sổ đầy đủ 10 phần quà trúng thưởng may mắn của bạn
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSpin10Opened(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body: Cuộn danh sách 10 món + Bảng tổng kết */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-left">
              {/* Banner chúc mừng nếu có Giày Huyền Thoại */}
              {spin10ModalData.summary.hasShoes && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center gap-4 animate-pulse">
                  <img
                    src={LEGENDARY_SHOES_IMG}
                    alt="Giày Thần Tốc"
                    className="w-16 h-16 rounded-xl object-contain border-2 border-amber-400 shadow-lg shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 inline-block mb-1">
                      Cực Phẩm Nổ Hũ
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-amber-300">
                      👟 CHÚC MỪNG BẠN ĐÃ TRÚNG GIÀY THẦN TỐC (HUYỀN THOẠI)!
                    </h4>
                    <p className="text-xs text-amber-100">
                      Cộng <strong>+300 Tốc Độ</strong> tạo Tiên Cơ xuất chiêu đầu tiên trong mọi trận PvP!
                    </p>
                  </div>
                </div>
              )}

              {/* Lưới 10 ô phần thưởng ("Sổ ra đủ 10 món") */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" /> Danh Sách 10 Lượt Quay:
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
                  {spin10ModalData.items.map((it, idx) => {
                    const isShoes = it.isShoes || it.type === 'game_shoes_legendary';
                    const isRoyal = it.type === 'game_royal_chests';
                    const isLost = it.type === 'none';

                    let badgeText = 'Quà Tặng';
                    let badgeColor = 'bg-slate-700 text-slate-300';
                    let cardBorder = 'border-slate-800 bg-[#151D2F]';

                    if (isShoes) {
                      badgeText = '👑 HUYỀN THOẠI';
                      badgeColor = 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black';
                      cardBorder = 'border-amber-400/80 bg-gradient-to-b from-amber-950/40 to-[#151D2F] shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50';
                    } else if (it.type === 'game_essence_stone' || it.name?.toLowerCase().includes('tinh hoa')) {
                      badgeText = '💎 ĐÁ TINH HOA';
                      badgeColor = 'bg-purple-600 text-white font-bold';
                      cardBorder = 'border-purple-500/50 bg-[#151D2F]';
                    } else if (it.type === 'game_ring_crystal' || it.name?.toLowerCase().includes('tinh thể')) {
                      badgeText = '🔮 VIÊN TINH THỂ';
                      badgeColor = 'bg-pink-600 text-white font-bold';
                      cardBorder = 'border-pink-500/50 bg-[#151D2F]';
                    } else if (isRoyal) {
                      badgeText = '👑 HOÀNG KIM';
                      badgeColor = 'bg-purple-500 text-white font-bold';
                      cardBorder = 'border-purple-500/60 bg-gradient-to-b from-purple-950/30 to-[#151D2F] shadow-md';
                    } else if (it.type === 'game_attacks') {
                      badgeText = '⚔️ ĐÁNH BOSS';
                      badgeColor = 'bg-blue-500 text-white font-bold';
                      cardBorder = 'border-blue-500/50 bg-[#151D2F]';
                    } else if (it.type === 'game_boss_chests') {
                      badgeText = '📦 HÒM BOSS';
                      badgeColor = 'bg-emerald-500 text-white font-bold';
                      cardBorder = 'border-emerald-500/50 bg-[#151D2F]';
                    } else if (it.type === 'game_coins') {
                      badgeText = '🪙 XU GAME';
                      badgeColor = 'bg-yellow-500/90 text-slate-950 font-bold';
                      cardBorder = 'border-yellow-500/50 bg-[#151D2F]';
                    } else if (isLost) {
                      badgeText = 'TRƯỢT';
                      badgeColor = 'bg-slate-800 text-slate-500';
                      cardBorder = 'border-slate-800/80 bg-[#111827]/70 opacity-75';
                    }

                    let displayImg = it.image;
                    if (isShoes) {
                      displayImg = getShoesImage(displayImg);
                    } else if (!displayImg) {
                      if (isRoyal) displayImg = '/game-assets/royal_chest.png';
                      else if (it.type === 'game_boss_chests') displayImg = '/game-assets/mystery_box_closed.png';
                      else if (it.type === 'game_essence_stone' || it.name?.toLowerCase().includes('tinh hoa')) displayImg = '/game-assets/da_tinh_hoa.png';
                      else if (it.type === 'game_ring_crystal' || it.name?.toLowerCase().includes('tinh thể')) displayImg = '/game-assets/ring_crystal.png';
                    }

                    return (
                      <div
                        key={`spin10-item-${idx}`}
                        className={`relative rounded-2xl p-3 border transition-all duration-300 flex flex-col justify-between text-center group hover:scale-[1.03] ${cardBorder}`}
                      >
                        {/* Số thứ tự lượt quay #1 -> #10 */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-slate-700/60">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Badge loại quà */}
                        <div className="flex justify-end mb-1">
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>

                        {/* Hình ảnh */}
                        <div className="w-full h-16 sm:h-20 flex items-center justify-center my-1 relative">
                          {displayImg && !isLost ? (
                            <img
                              src={displayImg}
                              alt={it.name}
                              className={`max-h-full max-w-[85%] object-contain drop-shadow-md group-hover:scale-110 transition-transform ${isShoes ? 'animate-bounce' : ''}`}
                              onError={(e) => {
                                if (isShoes) e.target.src = LEGENDARY_SHOES_IMG;
                                else e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Gift className={`w-10 h-10 ${isLost ? 'text-slate-600' : 'text-amber-400'}`} />
                          )}
                        </div>

                        {/* Tên quà */}
                        <div className="mt-1">
                          <h5 className={`text-xs font-black truncate ${isShoes ? 'text-amber-300' : isLost ? 'text-slate-500' : 'text-white'}`}>
                            {it.name}
                          </h5>
                          {isShoes && (
                            <p className="text-[10px] text-amber-400 font-bold mt-0.5">+300 Tốc Độ</p>
                          )}
                          {!isShoes && it.value > 0 && (it.type === 'game_essence_stone' || it.name?.toLowerCase().includes('tinh hoa')) && (
                            <p className="text-[10px] text-purple-400 font-bold mt-0.5">+{it.value} Đá Tinh Hoa</p>
                          )}
                          {!isShoes && it.value > 0 && (it.type === 'game_ring_crystal' || it.name?.toLowerCase().includes('tinh thể')) && (
                            <p className="text-[10px] text-pink-400 font-bold mt-0.5">+{it.value} Tinh Thể</p>
                          )}
                          {!isShoes && it.value > 0 && it.type === 'game_attacks' && (
                            <p className="text-[10px] text-cyan-400 font-bold mt-0.5">+{it.value} Lượt Đánh</p>
                          )}
                          {!isShoes && it.value > 0 && it.type === 'game_boss_chests' && (
                            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">+{it.value} Hòm Boss</p>
                          )}
                          {!isShoes && it.value > 0 && it.type === 'game_royal_chests' && (
                            <p className="text-[10px] text-purple-400 font-bold mt-0.5">+{it.value} Hòm HK</p>
                          )}
                          {!isShoes && it.value > 0 && it.type === 'game_coins' && (
                            <p className="text-[10px] text-yellow-400 font-bold mt-0.5">+{new Intl.NumberFormat('vi-VN').format(it.value)} Xu</p>
                          )}
                          {!isShoes && it.value > 0 && it.type === 'money' && (
                            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">+{new Intl.NumberFormat('vi-VN').format(it.value)}đ</p>
                          )}
                          {!isShoes && it.value > 0 && it.type === 'spin' && (
                            <p className="text-[10px] text-rose-400 font-bold mt-0.5">+{it.value} Lượt</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BẢNG TỔNG KẾT QUÀ & TRẠNG THÁI GIAO HÀNG */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#151D2F] border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Crown size={15} /> Tổng Kết Vật Phẩm Đạt Được (10 Lượt):
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {spin10ModalData.summary.hasShoes && (
                    <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black">
                      👟 Giày Huyền Thoại: <strong>+{spin10ModalData.summary.shoesWonCount}</strong>
                    </div>
                  )}
                  {spin10ModalData.summary.sumEssenceStones > 0 && (
                    <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                      💎 Đá Tinh Hoa: <strong>+{spin10ModalData.summary.sumEssenceStones}</strong>
                    </div>
                  )}
                  {spin10ModalData.summary.sumRingCrystals > 0 && (
                    <div className="p-2.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300 font-bold">
                      🔮 Viên Tinh Thể: <strong>+{spin10ModalData.summary.sumRingCrystals}</strong>
                    </div>
                  )}
                  {spin10ModalData.summary.sumAttacks > 0 && (
                    <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold">
                      ⚔️ Lượt Đánh Boss: <strong>+{spin10ModalData.summary.sumAttacks}</strong>
                    </div>
                  )}
                  {spin10ModalData.summary.sumRoyalChests > 0 && (
                    <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                      👑 Hòm Hoàng Kim: <strong>+{spin10ModalData.summary.sumRoyalChests}</strong>
                    </div>
                  )}
                  {spin10ModalData.summary.sumBossChests > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                      📦 Hòm Boss: <strong>+{spin10ModalData.summary.sumBossChests}</strong>
                    </div>
                  )}
                  {spin10ModalData.summary.sumCoins > 0 && (
                    <div className="p-2.5 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 font-bold">
                      🪙 Xu Game: <strong>+{new Intl.NumberFormat('vi-VN').format(spin10ModalData.summary.sumCoins)}</strong>
                    </div>
                  )}
                  {spin10ModalData.summary.sumMoney > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                      💰 Tiền Ví: <strong>+{new Intl.NumberFormat('vi-VN').format(spin10ModalData.summary.sumMoney)}đ</strong>
                    </div>
                  )}
                  {spin10ModalData.summary.sumSpins > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">
                      🎫 Lượt Quay: <strong>+{spin10ModalData.summary.sumSpins}</strong>
                    </div>
                  )}
                </div>

                {/* Đồng bộ game & Pity */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    {currentUser?.linked_game_id ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Đã chuyển tự động vào ID Game:
                        <strong className="font-mono bg-emerald-950 px-2 py-0.5 rounded text-white border border-emerald-500/40">@{currentUser.linked_game_id}</strong>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        ⚠️ Chưa liên kết ID Game!
                        <button
                          type="button"
                          onClick={() => {
                            setIsSpin10Opened(false);
                            setShowLinkOtpModal(true);
                          }}
                          className="text-amber-300 underline font-bold ml-1 hover:text-white"
                        >
                          Liên kết ngay
                        </button>
                      </span>
                    )}
                  </div>

                  <div className="text-slate-400 font-semibold">
                    🛡️ Bảo hiểm Giày Huyền Thoại: <span className="text-amber-400 font-bold font-mono">{spin10ModalData.summary.finalPity}/120</span>
                    {spin10ModalData.summary.hasShoes && <span className="text-emerald-400 ml-1 font-bold">(Đã Reset 0/120)</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#131A2D] flex flex-col sm:flex-row gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsSpin10Opened(false)}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors sm:w-32"
              >
                Đóng Lại
              </button>
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => {
                  setIsSpin10Opened(false);
                  setTimeout(() => handleSpin(), 200);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black uppercase rounded-xl transition-all shadow-md"
              >
                Quay Tiếp x1
              </button>
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => {
                  setIsSpin10Opened(false);
                  setTimeout(() => handleSpinX10(), 200);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-white text-xs font-black uppercase rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5"
              >
                <Flame size={16} className="text-yellow-300" />
                <span>Quay Tiếp x10 (Sổ 10 Món) 🔥</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {renderFooter()}
    </div>
  );
};

export default VongQuayScreen;
