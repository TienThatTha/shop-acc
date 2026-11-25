import React, { useState, useEffect, useMemo } from 'react';
import {
  QrCode, Search, CheckCircle2, AlertCircle, Copy, Volume2,
  Crown, Sparkles, ShieldCheck, Clock, Link as LinkIcon, RefreshCw, X
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { validateDonateAmount, validateDonateMessage } from '../utils/donateFilter';

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];
const BANK_NAMES = {
  '970416': 'ACB (Ngân hàng Á Châu)',
  '970436': 'Vietcombank',
  '970422': 'MBBank',
  '970415': 'VietinBank',
  '970418': 'BIDV',
  '970407': 'Techcombank',
  '970423': 'TPBank',
  '970432': 'VPBank'
};

const formatVND = (val) => `${new Intl.NumberFormat('vi-VN').format(Number(val) || 0)}đ`;

const fallbackAvatarSvg = (seed) =>
  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed || 'donor')}`;

const DonateLiveScreen = ({
  renderNavbar,
  renderFooter,
  currentUser,
  isTikTokLinked,
  bossPlayerSummary,
  showToast,
  copyToClipboard,
  setCurrentView
}) => {
  // Identity state
  const linkedUid = useMemo(() => {
    const raw = (bossPlayerSummary?.user_id || currentUser?.linked_game_id || '').trim().toLowerCase().replace(/^@/, '');
    if (raw && !raw.startsWith('discord_') && isTikTokLinked) return raw;
    return '';
  }, [bossPlayerSummary?.user_id, currentUser?.linked_game_id, isTikTokLinked]);

  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [guestUid, setGuestUid] = useState('');
  const [guestNickname, setGuestNickname] = useState('');

  // Donation form state
  const [amountInput, setAmountInput] = useState('50000');
  const [messageInput, setMessageInput] = useState('');
  const [isCreatingQr, setIsCreatingQr] = useState(false);
  const [payosData, setPayosData] = useState(null);
  const [payosTimeLeft, setPayosTimeLeft] = useState(600);
  const [donateSuccessData, setDonateSuccessData] = useState(null);

  // Realtime Top 5 & Recent Donations
  const [boardState, setBoardState] = useState({
    season_label: 'TOP DONATE • CHUYỂN KHOẢN',
    top_donators: [],
    recent_donations: []
  });

  // Auto-fill when logged-in & TikTok linked
  useEffect(() => {
    if (!linkedUid) return;
    setSelectedDonor({
      user_id: linkedUid,
      nickname: bossPlayerSummary?.nickname || linkedUid,
      avatar_url: bossPlayerSummary?.avatar_url || fallbackAvatarSvg(linkedUid),
      verified: true
    });
  }, [linkedUid, bossPlayerSummary?.nickname, bossPlayerSummary?.avatar_url]);

  // Load & subscribe to live_bank_donate_state from site_config
  useEffect(() => {
    let active = true;
    const loadState = async () => {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('id', 'live_bank_donate_state')
          .maybeSingle();
        if (active && data?.value) {
          setBoardState({
            season_label: data.value.season_label || 'TOP DONATE • CHUYỂN KHOẢN',
            top_donators: Array.isArray(data.value.top_donators) ? data.value.top_donators.slice(0, 5) : [],
            recent_donations: Array.isArray(data.value.recent_donations) ? data.value.recent_donations.slice(0, 12) : []
          });
        }
      } catch { /* ignore */ }
    };
    loadState();

    const ch = supabase
      .channel('live-bank-donate-board')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_config', filter: 'id=eq.live_bank_donate_state' },
        (payload) => {
          const val = payload?.new?.value;
          if (val && active) {
            setBoardState({
              season_label: val.season_label || 'TOP DONATE • CHUYỂN KHOẢN',
              top_donators: Array.isArray(val.top_donators) ? val.top_donators.slice(0, 5) : [],
              recent_donations: Array.isArray(val.recent_donations) ? val.recent_donations.slice(0, 12) : []
            });
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, []);

  // Countdown + Realtime payment confirmation listener when QR is active
  useEffect(() => {
    if (!payosData?.orderCode) return undefined;
    const orderId = `PAYOS_${payosData.orderCode}`;
    const createdAtMs = Date.now();

    const timer = setInterval(() => {
      const rem = Math.max(0, 600 - Math.floor((Date.now() - createdAtMs) / 1000));
      setPayosTimeLeft(rem);
      if (rem === 0) {
        clearInterval(timer);
        setPayosData(null);
        showToast('Mã QR Donate đã hết hạn (10 phút).', 'error');
      }
    }, 1000);

    const markSuccess = (paidAmt) => {
      setDonateSuccessData({
        amount: paidAmt || payosData.amount,
        nickname: selectedDonor?.nickname || guestNickname || guestUid,
        message: messageInput.trim()
      });
      setPayosData(null);
      setMessageInput('');
      showToast('Donate Live thành công! Lời nhắn đang lên sóng!', 'success');
    };

    const ch = supabase
      .channel(`live-donate-order-${payosData.orderCode}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deposit_requests', filter: `id=eq.${orderId}` },
        (payload) => {
          if (payload?.new?.status === 'Thành công') {
            markSuccess(payload.new.amount);
          }
        }
      )
      .subscribe();

    const poll = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('deposit_requests')
          .select('status, amount')
          .eq('id', orderId)
          .maybeSingle();
        if (data?.status === 'Thành công') {
          markSuccess(data.amount);
        }
      } catch { /* ignore */ }
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [payosData?.orderCode]);

  const handleLookupTikTok = async (e) => {
    if (e) e.preventDefault();
    const raw = searchInput.trim().replace(/^@/, '').toLowerCase();
    if (!raw) {
      showToast('Vui lòng nhập @ID TikTok hoặc Tên hiển thị để tìm!', 'error');
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data: exactRow } = await supabase
        .from('game_players')
        .select('user_id, nickname, avatar_url')
        .eq('user_id', raw)
        .maybeSingle();

      if (exactRow) {
        const found = {
          user_id: exactRow.user_id,
          nickname: exactRow.nickname || exactRow.user_id,
          avatar_url: exactRow.avatar_url || fallbackAvatarSvg(exactRow.user_id),
          verified: false
        };
        setSearchResults([found]);
        setSelectedDonor(found);
        showToast(`Đã tìm thấy: ${found.nickname} (@${found.user_id})`);
        return;
      }

      const { data: fuzzyRows } = await supabase
        .from('game_players')
        .select('user_id, nickname, avatar_url')
        .or(`user_id.ilike.%${raw}%,nickname.ilike.%${raw}%`)
        .order('cp', { ascending: false })
        .limit(5);

      const list = (fuzzyRows || []).map((r) => ({
        user_id: r.user_id,
        nickname: r.nickname || r.user_id,
        avatar_url: r.avatar_url || fallbackAvatarSvg(r.user_id),
        verified: false
      }));
      setSearchResults(list);
      if (list.length === 1) {
        setSelectedDonor(list[0]);
      } else if (list.length === 0) {
        setSelectedDonor(null);
        setGuestUid(raw);
        if (!guestNickname) setGuestNickname(searchInput.trim().replace(/^@/, ''));
      }
    } catch {
      showToast('Không thể tra cứu lúc này, bạn có thể nhập trực tiếp @ID bên dưới.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const parsedAmtInfo = validateDonateAmount(amountInput);
  const parsedMsgInfo = validateDonateMessage(messageInput);
  const isTier2 = parsedAmtInfo.amount > 50000;

  const activeDonorUid = selectedDonor?.user_id || guestUid.trim().replace(/^@/, '').toLowerCase();
  const activeDonorNick = selectedDonor?.nickname || guestNickname.trim() || activeDonorUid;
  const activeDonorAvatar = selectedDonor?.avatar_url || '';

  const handleCreateLiveDonateQr = async (e) => {
    e.preventDefault();
    if (!activeDonorUid) {
      showToast('Vui lòng chọn hoặc nhập @ID TikTok để vinh danh lên bảng!', 'error');
      return;
    }
    if (!parsedAmtInfo.ok) {
      showToast(parsedAmtInfo.error, 'error');
      return;
    }
    if (!parsedMsgInfo.ok) {
      showToast(parsedMsgInfo.error, 'error');
      return;
    }
    if (isCreatingQr) return;

    setIsCreatingQr(true);
    setDonateSuccessData(null);
    try {
      const { data, error } = await supabase.functions.invoke('payos-create-payment', {
        body: {
          purpose: 'live_donate',
          amount: parsedAmtInfo.amount,
          userId: currentUser?.id || 'LIVE_DONATE_GUEST',
          tiktokUid: activeDonorUid,
          nickname: activeDonorNick,
          avatarUrl: activeDonorAvatar,
          donateMessage: parsedMsgInfo.cleaned,
          returnUrl: window.location.origin,
          cancelUrl: window.location.origin
        }
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.checkoutUrl) throw new Error('Không thể khởi tạo mã QR PayOS.');

      setPayosData(data);
      setPayosTimeLeft(600);
      showToast('Đã tạo mã QR Donate! Quét bằng App Ngân hàng hoặc MoMo đều được.', 'success');
    } catch (err) {
      showToast(err?.message || 'Lỗi kết nối PayOS, vui lòng thử lại!', 'error');
    } finally {
      setIsCreatingQr(false);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans pb-24 md:pb-12">
      {renderNavbar()}

      <div className="max-w-[1440px] mx-auto px-4 pt-6 md:pt-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#062920] via-[#0f172a] to-[#1a1205] p-6 md:p-8 mb-6 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-amber-300" />
                <span>Ủng Hộ Trực Tiếp Lên Sóng Live TikTok</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                💎 Donate Chuyển Khoản &amp; Đọc Lời Nhắn Chị Google
              </h1>
              <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                Quét mã <strong className="text-emerald-400">VietQR</strong> bằng mọi App Ngân hàng hoặc <strong className="text-pink-400">Ví MoMo</strong>.
                Xác nhận tự động 1–2 giây, nhảy bảng <strong className="text-amber-300">Top 5 Chuyển Khoản</strong> và đọc lời nhắn ngay trên Live!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 text-xs">
              <div className="bg-[#0B1120]/80 border border-emerald-500/30 rounded-xl px-4 py-2.5">
                <div className="text-emerald-400 font-extrabold">🎵 Mốc ≤ 50.000đ</div>
                <div className="text-slate-300 mt-0.5">Nhạc Spider-Man + Chị Google</div>
              </div>
              <div className="bg-[#0B1120]/80 border border-amber-400/40 rounded-xl px-4 py-2.5">
                <div className="text-amber-300 font-extrabold">👑 Mốc &gt; 50.000đ (SUPER VIP)</div>
                <div className="text-slate-300 mt-0.5">Nhạc Độ Mixi + Pháo hoa + Chị Google</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT + CENTER (7 cols): IDENTITY + FORM + QR */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: TikTok Identity */}
            <div className="bg-[#151D2F] border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-black">1</span>
                  Xác Nhận Tài Khoản TikTok Vinh Danh
                </h2>
                {!linkedUid && currentUser && (
                  <button
                    type="button"
                    onClick={() => setCurrentView('bossgame')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <LinkIcon size={13} /> Liên kết OTP ngay
                  </button>
                )}
              </div>

              {linkedUid && selectedDonor ? (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={selectedDonor.avatar_url || fallbackAvatarSvg(linkedUid)}
                      alt={selectedDonor.nickname}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base truncate">{selectedDonor.nickname}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                          <ShieldCheck size={11} /> Đã liên kết TikTok
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">@{selectedDonor.user_id}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handleLookupTikTok} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Nhập @ID TikTok hoặc Tên trên Live để tìm..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0B1120] border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                    >
                      {isSearching ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                      Tìm Nick
                    </button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {searchResults.map((p) => {
                        const isSel = selectedDonor?.user_id === p.user_id;
                        return (
                          <button
                            key={p.user_id}
                            type="button"
                            onClick={() => setSelectedDonor(p)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                              isSel
                                ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'bg-[#0B1120] border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <img
                              src={p.avatar_url || fallbackAvatarSvg(p.user_id)}
                              onError={(e) => { e.currentTarget.src = fallbackAvatarSvg(p.user_id); }}
                              alt={p.nickname}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-500/50 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-white text-sm truncate">{p.nickname}</div>
                              <div className="text-[11px] text-slate-400 truncate">@{p.user_id}</div>
                            </div>
                            {isSel && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {selectedDonor && (
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <span className="text-emerald-300 font-bold">
                        ✅ Đã chọn: {selectedDonor.nickname} (@{selectedDonor.user_id})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedDonor(null)}
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <X size={13} /> Đổi
                      </button>
                    </div>
                  )}

                  {!selectedDonor && (
                    <div className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 space-y-2.5">
                      <div className="text-xs text-slate-400">
                        {hasSearched && searchResults.length === 0
                          ? 'Chưa thấy nick này trong dữ liệu game Boss? Bạn vẫn có thể nhập @ID TikTok bên dưới để donate ngay (hệ thống tự ghép Avatar thật khi bạn chat trên Live):'
                          : 'Hoặc nhập trực tiếp @ID TikTok & Tên hiển thị (không cần đăng nhập):'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={guestUid}
                          onChange={(e) => setGuestUid(e.target.value)}
                          placeholder="@id_tiktok (VD: nguyenvana)"
                          className="px-3.5 py-2 bg-[#151D2F] border border-slate-700 focus:border-emerald-500 rounded-lg text-sm text-white outline-none"
                        />
                        <input
                          type="text"
                          value={guestNickname}
                          onChange={(e) => setGuestNickname(e.target.value)}
                          placeholder="Tên hiển thị trên bảng..."
                          className="px-3.5 py-2 bg-[#151D2F] border border-slate-700 focus:border-emerald-500 rounded-lg text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Amount + TTS Message OR Active PayOS QR */}
            <div className="bg-[#151D2F] border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
              {donateSuccessData && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-400 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={28} className="text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-black text-emerald-300 text-base">
                        Cảm ơn {donateSuccessData.nickname} đã Donate {formatVND(donateSuccessData.amount)}!
                      </div>
                      <div className="text-xs text-slate-300">
                        Bảng Top 5 Chuyển Khoản đã cập nhật và giọng Chị Google đang phát lên sóng Live.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDonateSuccessData(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {payosData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-2.5 rounded-2xl border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)] w-[220px] h-[220px] flex items-center justify-center">
                      <img
                        src={`https://img.vietqr.io/image/${payosData.bin}-${payosData.accountNumber}-qr_only.png?amount=${payosData.amount}&addInfo=${encodeURIComponent(payosData.description)}&accountName=${encodeURIComponent(payosData.accountName)}`}
                        alt="VietQR Donate Live"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-3 px-4 py-1.5 rounded-full bg-[#0B1120] border border-rose-500/40 text-rose-400 font-black font-mono text-lg flex items-center gap-2">
                      <Clock size={16} />
                      <span>{formatTimer(payosTimeLeft)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <h3 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                      <QrCode size={20} /> Quét Mã QR Chuyển Khoản
                    </h3>
                    <div className="space-y-2 bg-[#0B1120] p-3.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">Ngân hàng:</span>
                        <span className="font-bold text-white text-right">{BANK_NAMES[payosData.bin] || payosData.bin}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">Số TK:</span>
                        <button type="button" onClick={() => copyToClipboard(payosData.accountNumber)} className="font-bold text-emerald-400 flex items-center gap-1.5">
                          {payosData.accountNumber} <Copy size={13} />
                        </button>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">Nội dung CK:</span>
                        <button type="button" onClick={() => copyToClipboard(payosData.description)} className="font-bold text-rose-400 flex items-center gap-1.5">
                          {payosData.description} <Copy size={13} />
                        </button>
                      </div>
                      <div className="flex justify-between gap-2 pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Số tiền:</span>
                        <span className="font-black text-amber-300 text-base">{formatVND(payosData.amount)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-amber-300/90 flex items-start gap-1.5">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span>Dùng App Ngân hàng hoặc Ví MoMo quét mã để chuyển đúng số tiền &amp; nội dung. Giữ nguyên trang này chờ 1–2 giây sau khi chuyển!</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setPayosData(null)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                    >
                      Hủy &amp; Tạo Lệnh Khác
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateLiveDonateQr} className="space-y-4">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-black">2</span>
                    Nhập Số Tiền &amp; Lời Nhắn Đọc Trên Live
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">Chọn nhanh hoặc nhập số tiền (tối thiểu 5.000đ):</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
                      {QUICK_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmountInput(String(amt))}
                          className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                            Number(amountInput) === amt
                              ? 'bg-emerald-600 text-white border-amber-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                              : 'bg-[#0B1120] text-slate-300 border-slate-700 hover:border-emerald-500/50'
                          }`}
                        >
                          {amt >= 1000 ? `${amt / 1000}K` : amt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="Nhập số tiền VNĐ (VD: 50000)"
                      className="w-full px-4 py-3 bg-[#0B1120] border border-emerald-500/40 focus:border-amber-400 rounded-xl text-lg font-black text-amber-300 outline-none"
                    />
                    {!parsedAmtInfo.ok && (
                      <p className="text-xs text-rose-400 font-bold mt-1">{parsedAmtInfo.error}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Volume2 size={14} className="text-emerald-400" /> Lời nhắn đọc bằng giọng Chị Google (tùy chọn):
                      </label>
                      <span className={`text-[11px] font-bold ${messageInput.length > 150 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {messageInput.length} / 150
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={150}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="VD: Chúc anh Tiến live vui vẻ, tối nay phá đảo Boss nha!"
                      className="w-full px-4 py-3 bg-[#0B1120] border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white outline-none resize-none"
                    />
                    {!parsedMsgInfo.ok && (
                      <p className="text-xs text-rose-400 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle size={13} /> {parsedMsgInfo.error}
                      </p>
                    )}
                  </div>

                  {/* Preview Effect Tier */}
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    isTier2
                      ? 'bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border-amber-400/50 text-amber-200'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  }`}>
                    <span className="font-bold">
                      {isTier2
                        ? '👑 Hiệu ứng SUPER VIP: Nhạc Độ Mixi + Pháo hoa đa tầng + Confetti + Chị Google!'
                        : '🎵 Hiệu ứng VIP: Nhạc Spider-Man + Pháo hoa + Giọng Chị Google!'}
                    </span>
                    <span className="font-black shrink-0">{parsedAmtInfo.amount > 0 ? formatVND(parsedAmtInfo.amount) : ''}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingQr || !parsedAmtInfo.ok || !parsedMsgInfo.ok}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:brightness-110 text-white font-black text-base shadow-[0_6px_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCreatingQr ? <RefreshCw size={18} className="animate-spin" /> : <QrCode size={18} />}
                    <span>Tạo Mã QR Donate Ngay</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT (5 cols): REALTIME TOP 5 CHUYỂN KHOẢN + RECENT FEED */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#151D2F] border border-emerald-500/35 rounded-2xl p-5 md:p-6 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
                  <Crown size={20} className="text-amber-400" />
                  <span>{boardState.season_label}</span>
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Realtime
                </span>
              </div>

              {boardState.top_donators.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm bg-[#0B1120] rounded-xl border border-slate-800">
                  Chưa có nhà tài trợ nào trong mùa này. Hãy là người đầu tiên lên Top 1!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {boardState.top_donators.map((d, idx) => (
                    <div
                      key={d.user_key || idx}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                        idx === 0
                          ? 'bg-gradient-to-r from-emerald-950/90 to-amber-950/50 border-amber-400/70 shadow-[0_0_16px_rgba(250,204,21,0.18)]'
                          : idx === 1
                            ? 'bg-teal-950/50 border-teal-400/50'
                            : 'bg-[#0B1120] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-teal-300 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>
                        <img
                          src={d.avatar_url || fallbackAvatarSvg(d.user_key)}
                          onError={(e) => { e.currentTarget.src = fallbackAvatarSvg(d.user_key); }}
                          alt={d.nickname}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-400/60 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-white text-sm truncate">{d.nickname}</div>
                          <div className="text-[11px] text-slate-400 truncate">@{d.user_key}</div>
                        </div>
                      </div>
                      <span className={`font-black text-sm shrink-0 ${idx === 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                        {formatVND(d.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#151D2F] border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
              <h3 className="text-base font-extrabold text-white mb-3.5 flex items-center gap-2">
                <span>💸</span> Vừa Donate Gần Nhất
              </h3>
              {boardState.recent_donations.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">Chưa có giao dịch gần đây.</div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {boardState.recent_donations.map((tx, idx) => (
                    <div key={tx.tx_id || idx} className="p-3 rounded-xl bg-[#0B1120] border border-slate-800/90 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-extrabold text-white truncate">{tx.nickname}</span>
                        <span className="font-black text-emerald-400 shrink-0">+{formatVND(tx.delta)}</span>
                      </div>
                      {tx.message && (
                        <div className="text-xs text-slate-300 italic">“{tx.message}”</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {renderFooter()}
    </div>
  );
};

export default DonateLiveScreen;
