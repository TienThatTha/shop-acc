import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  QrCode, CheckCircle2, AlertCircle, Copy, Crown,
  ShieldCheck, Clock, Link as LinkIcon, RefreshCw, X, Heart, Sparkles, Volume2, Square
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { validateDonateAmount, validateDonateMessage } from '../utils/donateFilter';

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];
const VOICE_CATEGORIES = [
  { id: 'all', label: 'Tất cả (48)' },
  { id: 'vn', label: 'Việt Chuẩn (8)' },
  { id: 'gpt', label: 'ChatGPT AI (7)' },
  { id: 'tiktok', label: 'TikTok Hài & Hát (10)' },
  { id: 'fun', label: 'Biến Tấu (5)' },
  { id: 'intl', label: 'Quốc Tế (18)' }
];
const DONATE_VOICES = [
  // 1. Việt Chuẩn (8)
  { id: 'hoaimy', label: 'Hoài Mỹ x1.2', badge: 'Mặc định', category: 'vn', desc: 'Nữ miền Nam x1.2 (Mặc định)', previewUrl: '/tts-previews/hoaimy.mp3' },
  { id: 'namminh', label: 'Nam Minh', badge: 'Nam', category: 'vn', desc: 'Nam trầm ấm rõ chữ', previewUrl: '/tts-previews/namminh.mp3' },
  { id: 'gtts', label: 'Chị Google', badge: 'Google', category: 'vn', desc: 'Kinh điển (+20%)', previewUrl: '/tts-previews/gtts.mp3' },
  { id: 'tt_nu_vn', label: 'Chị Review Phim', badge: 'TikTok VN', category: 'vn', desc: 'Giọng nữ Web TikTok TTS', previewUrl: '/tts-previews/tt_nu_vn.mp3' },
  { id: 'tt_nam_vn', label: 'Anh Review Phim', badge: 'TikTok VN', category: 'vn', desc: 'Giọng nam Web TikTok TTS', previewUrl: '/tts-previews/tt_nam_vn.mp3' },
  { id: 'hoaimy_hd', label: 'Hoài Mỹ HD', badge: 'AI HD', category: 'vn', desc: 'Dragon AI truyền cảm hơn', previewUrl: '/tts-previews/hoaimy_hd.mp3' },
  { id: 'harper_vn', label: 'Ngọc Hân AI', badge: 'Nữ AI', category: 'vn', desc: 'Nữ trẻ trung hiện đại', previewUrl: '/tts-previews/harper_vn.mp3' },
  { id: 'grant_vn', label: 'Minh Khôi AI', badge: 'Nam AI', category: 'vn', desc: 'Nam thanh niên năng động', previewUrl: '/tts-previews/grant_vn.mp3' },
  // 2. ChatGPT / OpenAI Web AI (7)
  { id: 'gpt_nova', label: 'ChatGPT Nova', badge: 'OpenAI', category: 'gpt', desc: 'Nữ trẻ năng động kiểu ChatGPT', previewUrl: '/tts-previews/gpt_nova.mp3' },
  { id: 'gpt_shimmer', label: 'ChatGPT Shimmer', badge: 'OpenAI', category: 'gpt', desc: 'Nữ ấm áp nhẹ nhàng OpenAI', previewUrl: '/tts-previews/gpt_shimmer.mp3' },
  { id: 'gpt_alloy', label: 'ChatGPT Alloy', badge: 'OpenAI', category: 'gpt', desc: 'Cân bằng sắc nét kiểu ChatGPT', previewUrl: '/tts-previews/gpt_alloy.mp3' },
  { id: 'gpt_echo', label: 'ChatGPT Echo', badge: 'OpenAI', category: 'gpt', desc: 'Nam mượt mà trợ lý AI', previewUrl: '/tts-previews/gpt_echo.mp3' },
  { id: 'gpt_onyx', label: 'ChatGPT Onyx', badge: 'OpenAI', category: 'gpt', desc: 'Nam siêu trầm sang trọng', previewUrl: '/tts-previews/gpt_onyx.mp3' },
  { id: 'gpt_fable', label: 'ChatGPT Fable', badge: 'OpenAI', category: 'gpt', desc: 'Kể chuyện biểu cảm AI', previewUrl: '/tts-previews/gpt_fable.mp3' },
  { id: 'gpt_ash', label: 'ChatGPT Ash', badge: 'OpenAI', category: 'gpt', desc: 'Nam cá tính kiểu podcast', previewUrl: '/tts-previews/gpt_ash.mp3' },
  // 3. TikTok Meme & Hát (10)
  { id: 'tt_jessie', label: 'Chị TikTok Mỹ (Jessie)', badge: 'Viral', category: 'tiktok', desc: 'Giọng viral Web TikTok TTS', previewUrl: '/tts-previews/tt_jessie.mp3' },
  { id: 'tt_ghostface', label: 'Ma Mặt Nạ Ghostface', badge: 'Kinh dị', category: 'tiktok', desc: 'Giọng Scream ma mị troll live', previewUrl: '/tts-previews/tt_ghostface.mp3' },
  { id: 'tt_stitch', label: 'Quái Thú Stitch', badge: 'Hoạt hình', category: 'tiktok', desc: 'Stitch hoạt hình nhí nhố', previewUrl: '/tts-previews/tt_stitch.mp3' },
  { id: 'tt_rocket', label: 'Chồn Rocket', badge: 'Hài hước', category: 'tiktok', desc: 'Rocket Dải Ngân Hà cực lầy', previewUrl: '/tts-previews/tt_rocket.mp3' },
  { id: 'tt_c3po', label: 'Robot C-3PO', badge: 'Robot', category: 'tiktok', desc: 'Người máy Star Wars lơ lớ', previewUrl: '/tts-previews/tt_c3po.mp3' },
  { id: 'tt_chewbacca', label: 'Chewbacca Gầm Gừ', badge: 'Lầy lội', category: 'tiktok', desc: 'Quái vật gầm gừ phá phòng live', previewUrl: '/tts-previews/tt_chewbacca.mp3' },
  { id: 'tt_grinch', label: 'Yêu Tinh Grinch', badge: 'Quái dị', category: 'tiktok', desc: 'Tinh quái hợp câu troll', previewUrl: '/tts-previews/tt_grinch.mp3' },
  { id: 'tt_opera', label: 'Hát Opera Alto', badge: 'Hát 🎵', category: 'tiktok', desc: 'Hát lời donate kiểu opera', previewUrl: '/tts-previews/tt_opera.mp3' },
  { id: 'tt_lobby', label: 'Hát Nhạc Nền', badge: 'Hát 🎵', category: 'tiktok', desc: 'Hát lời nhắn trên beat vui', previewUrl: '/tts-previews/tt_lobby.mp3' },
  { id: 'tt_silly_sing', label: 'Hát Tấu Hài', badge: 'Hát 🎵', category: 'tiktok', desc: 'Hát câu donate cực bựa', previewUrl: '/tts-previews/tt_silly_sing.mp3' },
  // 4. Biến Tấu & Anime (5)
  { id: 'be_cute', label: 'Bé Cưng', badge: 'Cute', category: 'fun', desc: 'Nhí nhảnh (+40Hz)', previewUrl: '/tts-previews/be_cute.mp3' },
  { id: 'tram_ngau', label: 'Trầm Bá Đạo', badge: 'Boss', category: 'fun', desc: 'Uy lực (-28Hz)', previewUrl: '/tts-previews/tram_ngau.mp3' },
  { id: 'xiaoyou_loli', label: 'Bé Anime', badge: 'Anime', category: 'fun', desc: 'Em bé anime siêu cưng', previewUrl: '/tts-previews/xiaoyou_loli.mp3' },
  { id: 'rap_nhanh', label: 'Đọc Rap Cấp Tốc', badge: 'Tốc độ', category: 'fun', desc: 'Bắn chữ siêu nhanh (+38%)', previewUrl: '/tts-previews/rap_nhanh.mp3' },
  { id: 'ba_lao', label: 'Kể Chuyện Ma', badge: 'Kinh dị', category: 'fun', desc: 'Siêu chậm (-20%) & trầm (-35Hz)', previewUrl: '/tts-previews/ba_lao.mp3' },
  // 5. Quốc Tế Nói Tiếng Việt (18)
  { id: 'ava_tay', label: 'Chị Tây Mỹ (Ava)', badge: 'Mỹ 🇺🇸', category: 'intl', desc: 'Ava nói Việt đáng yêu', previewUrl: '/tts-previews/ava_tay.mp3' },
  { id: 'andrew_us', label: 'Anh Tây Mỹ (Andrew)', badge: 'Mỹ 🇺🇸', category: 'intl', desc: 'Andrew ấm áp duyên dáng', previewUrl: '/tts-previews/andrew_us.mp3' },
  { id: 'ada_uk', label: 'Quý Cô Anh (Ada)', badge: 'Anh 🇬🇧', category: 'intl', desc: 'Nữ Anh quý tộc sang trọng', previewUrl: '/tts-previews/ada_uk.mp3' },
  { id: 'ryan_uk', label: 'Quý Ông Anh (Ryan)', badge: 'Anh 🇬🇧', category: 'intl', desc: 'Nam Anh lịch lãm chuẩn men', previewUrl: '/tts-previews/ryan_uk.mp3' },
  { id: 'nanami_jp', label: 'Waifu Nhật (Nanami)', badge: 'Nhật 🇯🇵', category: 'intl', desc: 'Nanami ngọt ngào anime', previewUrl: '/tts-previews/nanami_jp.mp3' },
  { id: 'masaru_jp', label: 'Senpai Nhật (Masaru)', badge: 'Nhật 🇯🇵', category: 'intl', desc: 'Masaru trầm ấm cực ngầu', previewUrl: '/tts-previews/masaru_jp.mp3' },
  { id: 'sunhi_kr', label: 'Unnie Hàn Quốc', badge: 'Hàn 🇰🇷', category: 'intl', desc: 'SunHi kiểu K-Drama', previewUrl: '/tts-previews/sunhi_kr.mp3' },
  { id: 'hyunsu_kr', label: 'Oppa Hàn Quốc', badge: 'Hàn 🇰🇷', category: 'intl', desc: 'Hyunsu nhẹ nhàng cuốn hút', previewUrl: '/tts-previews/hyunsu_kr.mp3' },
  { id: 'xiaoxiao_cn', label: 'Tỷ Tỷ Trung Hoa', badge: 'Trung 🇨🇳', category: 'intl', desc: 'Xiaoxiao dịu ngọt êm tai', previewUrl: '/tts-previews/xiaoxiao_cn.mp3' },
  { id: 'yunfan_cn', label: 'Nam Thần Trung Hoa', badge: 'Trung 🇨🇳', category: 'intl', desc: 'Yunfan trầm lãng tử', previewUrl: '/tts-previews/yunfan_cn.mp3' },
  { id: 'hsiaochen_tw', label: 'Em Gái Đài Loan', badge: 'Đài 🇹🇼', category: 'intl', desc: 'HsiaoChen nhỏ nhẹ dễ thương', previewUrl: '/tts-previews/hsiaochen_tw.mp3' },
  { id: 'premwadee_th', label: 'Chị Đẹp Thái Lan', badge: 'Thái 🇹🇭', category: 'intl', desc: 'Premwadee ngân nga duyên', previewUrl: '/tts-previews/premwadee_th.mp3' },
  { id: 'pattara_th', label: 'Anh Trai Thái Lan', badge: 'Thái 🇹🇭', category: 'intl', desc: 'Pattara đọc Việt siêu hài', previewUrl: '/tts-previews/pattara_th.mp3' },
  { id: 'vivienne_fr', label: 'Nàng Thơ Pháp', badge: 'Pháp 🇫🇷', category: 'intl', desc: 'Vivienne sang chảnh Pháp', previewUrl: '/tts-previews/vivienne_fr.mp3' },
  { id: 'remy_fr', label: 'Quý Ông Pháp', badge: 'Pháp 🇫🇷', category: 'intl', desc: 'Remy lãng mạn đầy cảm xúc', previewUrl: '/tts-previews/remy_fr.mp3' },
  { id: 'seraphina_de', label: 'Quý Cô Đức', badge: 'Đức 🇩🇪', category: 'intl', desc: 'Seraphina cá tính sắc sảo', previewUrl: '/tts-previews/seraphina_de.mp3' },
  { id: 'ximena_es', label: 'Cô Nàng Tây Ban Nha', badge: 'TBN 🇪🇸', category: 'intl', desc: 'Ximena sôi nổi cực cuốn', previewUrl: '/tts-previews/ximena_es.mp3' },
  { id: 'arjun_in', label: 'Anh Trai Ấn Độ', badge: 'Ấn Độ 🇮🇳', category: 'intl', desc: 'Arjun đọc Việt siêu giải trí', previewUrl: '/tts-previews/arjun_in.mp3' }
];
const BANK_NAMES = {
  '970416': 'ACB (Ngân hàng Á Châu)',
  '970452': 'KienlongBank (KLB)',
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
  const linkedUid = useMemo(() => {
    const raw = (bossPlayerSummary?.user_id || currentUser?.linked_game_id || '').trim().toLowerCase().replace(/^@/, '');
    if (raw && !raw.startsWith('discord_') && isTikTokLinked) return raw;
    return '';
  }, [bossPlayerSummary?.user_id, currentUser?.linked_game_id, isTikTokLinked]);

  // Single-input TikTok identity state
  const [tiktokInput, setTiktokInput] = useState('');
  const [customNick, setCustomNick] = useState('');
  const [showCustomNick, setShowCustomNick] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);

  // Donate form & PayOS QR state
  const [amountInput, setAmountInput] = useState('50000');
  const [messageInput, setMessageInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('hoaimy');
  const [voiceCategory, setVoiceCategory] = useState('all');
  const [voiceSearch, setVoiceSearch] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const previewAudioRef = useRef(null);
  const [isCreatingQr, setIsCreatingQr] = useState(false);
  const [payosData, setPayosData] = useState(null);
  const [payosTimeLeft, setPayosTimeLeft] = useState(600);
  const [donateSuccessData, setDonateSuccessData] = useState(null);

  // Leaderboard & recent feed state
  const [boardState, setBoardState] = useState({
    season_label: 'Top 5 Ủng Hộ',
    top_donators: [],
    recent_donations: []
  });

  // Cache tìm kiếm @ID để tránh hỏi lặp lại Supabase
  const lookupCacheRef = useRef(new Map());

  // Ref holding latest values for the payment confirmation effect (avoids stale closures & exhaustive-deps warnings)
  const latestConfirmCtxRef = useRef({
    amount: 0,
    nickname: '',
    message: '',
    showToast: null
  });
  latestConfirmCtxRef.current = {
    amount: payosData?.amount || 0,
    nickname: selectedDonor?.nickname || customNick.trim() || tiktokInput.trim().replace(/^@/, '') || 'Bạn',
    message: messageInput.trim(),
    showToast
  };

  // Stop any voice sample playing when leaving the donate page
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, []);

  const handlePreviewVoice = (e, voice) => {
    e.stopPropagation();
    setSelectedVoice(voice.id);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }
    const audio = new Audio(voice.previewUrl);
    previewAudioRef.current = audio;
    setPlayingVoiceId(voice.id);
    audio.onended = () => {
      if (previewAudioRef.current === audio) previewAudioRef.current = null;
      setPlayingVoiceId((cur) => (cur === voice.id ? null : cur));
    };
    audio.onerror = () => {
      if (previewAudioRef.current === audio) previewAudioRef.current = null;
      setPlayingVoiceId(null);
      showToast('Không thể phát file mẫu lúc này.', 'error');
    };
    audio.play().catch(() => {
      setPlayingVoiceId(null);
    });
  };

  // Auto-fill verified identity if user already linked TikTok
  useEffect(() => {
    if (!linkedUid) return;
    setSelectedDonor({
      user_id: linkedUid,
      nickname: bossPlayerSummary?.nickname || linkedUid,
      avatar_url: bossPlayerSummary?.avatar_url || fallbackAvatarSvg(linkedUid),
      verified: true
    });
  }, [linkedUid, bossPlayerSummary?.nickname, bossPlayerSummary?.avatar_url]);

  // Debounced auto-lookup in game_players as donor types their @ID TikTok (tối ưu 1 query + cache RAM)
  useEffect(() => {
    if (linkedUid || selectedDonor) return undefined;
    const raw = tiktokInput.trim().replace(/^@/, '').replace(/[(),]/g, '').toLowerCase();
    if (raw.length < 3) {
      setSuggestions([]);
      setIsLookingUp(false);
      return undefined;
    }

    if (lookupCacheRef.current.has(raw)) {
      setSuggestions(lookupCacheRef.current.get(raw));
      setIsLookingUp(false);
      return undefined;
    }

    let cancelled = false;
    setIsLookingUp(true);
    const timer = setTimeout(async () => {
      try {
        const { data: rows } = await supabase
          .from('game_players')
          .select('user_id, nickname, avatar_url')
          .or(`user_id.ilike.${raw}%,nickname.ilike.%${raw}%`)
          .order('cp', { ascending: false })
          .limit(4);

        if (cancelled) return;
        const mapped = (rows || [])
          .sort((a, b) => (a.user_id === raw ? -1 : b.user_id === raw ? 1 : 0))
          .map((r) => ({
            user_id: r.user_id,
            nickname: r.nickname || r.user_id,
            avatar_url: r.avatar_url || fallbackAvatarSvg(r.user_id)
          }));
        if (lookupCacheRef.current.size >= 50) {
          const oldestKey = lookupCacheRef.current.keys().next().value;
          if (oldestKey !== undefined) lookupCacheRef.current.delete(oldestKey);
        }
        lookupCacheRef.current.set(raw, mapped);
        setSuggestions(mapped);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setIsLookingUp(false);
      }
    }, 550);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tiktokInput, linkedUid, selectedDonor]);

  // Load & subscribe to live_bank_donate_state
  useEffect(() => {
    let active = true;
    const applyState = (val) => {
      if (!val || !active) return;
      setBoardState({
        season_label: val.season_label || 'Top 5 Ủng Hộ',
        top_donators: Array.isArray(val.top_donators) ? val.top_donators.slice(0, 5) : [],
        recent_donations: Array.isArray(val.recent_donations) ? val.recent_donations.slice(0, 10) : []
      });
    };

    const loadState = async () => {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('value')
          .eq('id', 'live_bank_donate_state')
          .maybeSingle();
        if (data?.value) applyState(data.value);
      } catch { /* ignore */ }
    };
    loadState();

    const ch = supabase
      .channel('live-bank-donate-board')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_config', filter: 'id=eq.live_bank_donate_state' },
        (payload) => applyState(payload?.new?.value)
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
        latestConfirmCtxRef.current.showToast?.('Mã QR đã hết hạn (10 phút).', 'error');
      }
    }, 1000);

    const markSuccess = (paidAmt) => {
      const ctx = latestConfirmCtxRef.current;
      setDonateSuccessData({
        amount: paidAmt || ctx.amount,
        nickname: ctx.nickname,
        message: ctx.message
      });
      setPayosData(null);
      setMessageInput('');
      ctx.showToast?.('Cảm ơn bạn đã ủng hộ! Lời nhắn đang hiển thị trên Live.', 'success');
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
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [payosData?.orderCode]);

  const parsedAmtInfo = validateDonateAmount(amountInput);
  const parsedMsgInfo = validateDonateMessage(messageInput);
  const isVipTier = parsedAmtInfo.amount > 50000;
  const filteredVoices = useMemo(() => {
    const q = voiceSearch.trim().toLowerCase();
    return DONATE_VOICES.filter((v) => {
      if (voiceCategory !== 'all' && v.category !== voiceCategory) return false;
      if (!q) return true;
      return `${v.label} ${v.badge} ${v.desc}`.toLowerCase().includes(q);
    });
  }, [voiceCategory, voiceSearch]);
  const selectedVoiceObj = useMemo(
    () => DONATE_VOICES.find((v) => v.id === selectedVoice) || DONATE_VOICES[0],
    [selectedVoice]
  );

  const activeDonorUid = selectedDonor?.user_id || tiktokInput.trim().replace(/^@/, '').toLowerCase();
  const activeDonorNick = selectedDonor?.nickname || customNick.trim() || tiktokInput.trim().replace(/^@/, '') || activeDonorUid;
  const activeDonorAvatar = selectedDonor?.avatar_url || '';

  const handleCreateLiveDonateQr = async (e) => {
    e.preventDefault();
    if (!activeDonorUid) {
      showToast('Vui lòng nhập @ID TikTok của bạn để hiển thị trên bảng vinh danh!', 'error');
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
          ttsVoice: selectedVoice,
          returnUrl: `${window.location.origin}/donate`,
          cancelUrl: `${window.location.origin}/donate`
        }
      });
      if (error) {
        let errMsg = error.message;
        try {
          const errBody = await error.context?.json?.();
          if (errBody?.error) errMsg = errBody.error;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      if (data?.error) throw new Error(data.error);
      if (!data?.checkoutUrl) throw new Error('Không thể khởi tạo mã QR.');

      setPayosData(data);
      setPayosTimeLeft(600);
      showToast('Đã tạo mã QR! Bạn dùng App Ngân hàng hoặc MoMo quét để hoàn tất.', 'success');
    } catch (err) {
      showToast(err?.message || 'Lỗi tạo mã QR, vui lòng thử lại!', 'error');
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

      <div className="max-w-[1180px] mx-auto px-4 pt-6 md:pt-8">
        {/* Compact Donor Header */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-800/80">
          <img
            src="/Tiengaming.png"
            alt="Tiến Gaming"
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-contain bg-[#151D2F] border border-emerald-500/30 p-1.5 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>Ủng Hộ Tiến Gaming</span>
              <Heart size={18} className="text-rose-400 fill-rose-400/80 shrink-0" />
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Quét mã QR bằng App Ngân hàng hoặc Ví MoMo — tên &amp; lời nhắn của bạn sẽ hiển thị trực tiếp trên sóng Live!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT (7 cols): SINGLE CLEAN DONATE CARD */}
          <div className="lg:col-span-7 bg-[#151D2F] border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
            {donateSuccessData && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={26} className="text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-black text-emerald-300 text-sm md:text-base">
                      Cảm ơn {donateSuccessData.nickname} đã ủng hộ {formatVND(donateSuccessData.amount)}!
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Tên và lời nhắn của bạn đang lên sóng Live.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
                <div className="flex flex-col items-center">
                  <div className="bg-white p-2.5 rounded-2xl border-2 border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.22)] w-[216px] h-[216px] flex items-center justify-center">
                    <img
                      src={`https://img.vietqr.io/image/${payosData.bin}-${payosData.accountNumber}-qr_only.png?amount=${payosData.amount}&addInfo=${encodeURIComponent(payosData.description)}&accountName=${encodeURIComponent(payosData.accountName)}`}
                      alt="Mã QR Chuyển Khoản"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-3 px-4 py-1.5 rounded-full bg-[#0B1120] border border-rose-500/40 text-rose-400 font-black font-mono text-base flex items-center gap-2">
                    <Clock size={15} />
                    <span>{formatTimer(payosTimeLeft)}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <h2 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                    <QrCode size={20} /> Quét Mã QR Để Hoàn Tất
                  </h2>
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
                      <span className="text-slate-400">Nội dung:</span>
                      <button type="button" onClick={() => copyToClipboard(payosData.description)} className="font-bold text-rose-400 flex items-center gap-1.5">
                        {payosData.description} <Copy size={13} />
                      </button>
                    </div>
                    <div className="flex justify-between gap-2 pt-1.5 border-t border-slate-800">
                      <span className="text-slate-400">Số tiền:</span>
                      <span className="font-black text-amber-300 text-base">{formatVND(payosData.amount)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Mở App Ngân hàng hoặc Ví MoMo quét mã để chuyển khoản, giữ nguyên màn hình 1–2 giây để xác nhận tự động.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPayosData(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                  >
                    Quay lại chỉnh sửa
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateLiveDonateQr} className="space-y-5">
                {/* 1. Tài khoản TikTok của bạn */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-white">Tài khoản TikTok của bạn</label>
                    {!linkedUid && currentUser && (
                      <button
                        type="button"
                        onClick={() => setCurrentView('bossgame')}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <LinkIcon size={12} /> Liên kết tài khoản
                      </button>
                    )}
                  </div>

                  {selectedDonor ? (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={selectedDonor.avatar_url || fallbackAvatarSvg(selectedDonor.user_id)}
                          onError={(e) => { e.currentTarget.src = fallbackAvatarSvg(selectedDonor.user_id); }}
                          alt={selectedDonor.nickname}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white text-sm truncate">{selectedDonor.nickname}</span>
                            {selectedDonor.verified && <ShieldCheck size={14} className="text-emerald-400 shrink-0" />}
                          </div>
                          <div className="text-xs text-slate-400 truncate">@{selectedDonor.user_id}</div>
                        </div>
                      </div>
                      {!linkedUid && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDonor(null);
                            setSuggestions([]);
                          }}
                          className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-[#0B1120] border border-slate-700 shrink-0"
                        >
                          Đổi
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={tiktokInput}
                          onChange={(e) => setTiktokInput(e.target.value)}
                          placeholder="Nhập @ID TikTok của bạn (VD: nguyenvana)"
                          className="w-full px-4 py-3 bg-[#0B1120] border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white outline-none pr-10"
                        />
                        {isLookingUp && (
                          <RefreshCw size={15} className="animate-spin text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        )}
                      </div>

                      {suggestions.length > 0 && (
                        <div className="bg-[#0B1120] border border-slate-700/80 rounded-xl p-1.5 space-y-1">
                          <div className="px-2.5 py-1 text-[11px] text-slate-400 font-semibold">
                            Bấm để chọn tài khoản của bạn:
                          </div>
                          {suggestions.map((p) => (
                            <button
                              key={p.user_id}
                              type="button"
                              onClick={() => {
                                setSelectedDonor(p);
                                setSuggestions([]);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-emerald-500/15 text-left transition-colors"
                            >
                              <img
                                src={p.avatar_url || fallbackAvatarSvg(p.user_id)}
                                onError={(e) => { e.currentTarget.src = fallbackAvatarSvg(p.user_id); }}
                                alt={p.nickname}
                                className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">{p.nickname}</div>
                                <div className="text-[11px] text-slate-400 truncate">@{p.user_id}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setShowCustomNick((v) => !v)}
                          className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          {showCustomNick ? '− Ẩn tên hiển thị tùy chỉnh' : '+ Tùy chỉnh tên hiển thị (nếu muốn)'}
                        </button>
                      </div>

                      {showCustomNick && (
                        <input
                          type="text"
                          value={customNick}
                          onChange={(e) => setCustomNick(e.target.value)}
                          placeholder="Tên hiển thị trên bảng (bỏ trống sẽ tự lấy tên TikTok)"
                          className="w-full px-4 py-2.5 bg-[#0B1120] border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Số tiền ủng hộ */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Số tiền ủng hộ</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2.5">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountInput(String(amt))}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                          Number(amountInput) === amt
                            ? 'bg-emerald-600 text-white border-amber-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                            : 'bg-[#0B1120] text-slate-300 border-slate-700 hover:border-emerald-500/50'
                        }`}
                      >
                        {amt >= 1000 ? `${amt / 1000}K` : amt}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="5000"
                      step="1000"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      placeholder="Nhập số tiền (tối thiểu 5.000đ)"
                      className="w-full px-4 py-3 pr-14 bg-[#0B1120] border border-emerald-500/40 focus:border-amber-400 rounded-xl text-lg font-black text-amber-300 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                      VNĐ
                    </span>
                  </div>
                  {!parsedAmtInfo.ok ? (
                    <p className="text-xs text-rose-400 font-bold mt-1.5">{parsedAmtInfo.error}</p>
                  ) : isVipTier ? (
                    <p className="text-xs text-amber-300 font-semibold mt-1.5 flex items-center gap-1.5">
                      <Sparkles size={13} className="shrink-0" />
                      <span>Mức VIP — Hiện hiệu ứng pháo hoa nổi bật trên sóng Live</span>
                    </p>
                  ) : null}
                </div>

                {/* 3. Lời nhắn */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-white">Lời nhắn gửi lên Live <span className="text-xs font-normal text-slate-400">(tùy chọn)</span></label>
                    <span className={`text-[11px] font-semibold ${messageInput.length > 150 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {messageInput.length} / 150
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={150}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Gửi lời nhắn tới Tiến Gaming..."
                    className="w-full px-4 py-3 bg-[#0B1120] border border-slate-700 focus:border-emerald-500 rounded-xl text-sm text-white outline-none resize-none"
                  />
                  {!parsedMsgInfo.ok && (
                    <p className="text-xs text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle size={13} /> {parsedMsgInfo.error}
                    </p>
                  )}
                </div>

                {/* 4. Chọn giọng đọc lời nhắn */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-sm font-bold text-white">Giọng đọc lời nhắn trên Live</label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-amber-300 font-bold">
                        Đang chọn: {selectedVoiceObj.label}
                      </span>
                      <span className="text-emerald-400 font-semibold hidden sm:inline">Nghe thử 0s</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {VOICE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setVoiceCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          voiceCategory === cat.id
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                            : 'bg-[#0B1120] text-slate-400 border-slate-700/80 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={voiceSearch}
                    onChange={(e) => setVoiceSearch(e.target.value)}
                    placeholder="Tìm nhanh giọng đọc (VD: Review Phim, ChatGPT, Ghostface, Nhật, Hàn...)"
                    className="w-full px-3 py-2 mb-2 bg-[#0B1120] border border-slate-700/80 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[272px] overflow-y-auto pr-1">
                    {filteredVoices.length === 0 ? (
                      <div className="sm:col-span-2 text-center py-6 text-xs text-slate-400 bg-[#0B1120] rounded-xl border border-slate-800">
                        Không tìm thấy giọng đọc phù hợp với từ khóa “{voiceSearch}”.
                      </div>
                    ) : (
                      filteredVoices.map((v) => {
                      const isSel = selectedVoice === v.id;
                      const isPlay = playingVoiceId === v.id;
                      return (
                        <div
                          key={v.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedVoice(v.id)}
                          onKeyDown={(ev) => {
                            if (ev.key === 'Enter' || ev.key === ' ') {
                              ev.preventDefault();
                              setSelectedVoice(v.id);
                            }
                          }}
                          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSel
                              ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : 'bg-[#0B1120] border-slate-700/80 hover:border-emerald-500/45'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-extrabold truncate ${isSel ? 'text-amber-300' : 'text-white'}`}>
                                {v.label}
                              </span>
                              <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-[10px] font-bold text-slate-300">
                                {v.badge}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">{v.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handlePreviewVoice(e, v)}
                            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-colors ${
                              isPlay
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-600'
                            }`}
                          >
                            {isPlay ? <Square size={11} className="fill-current" /> : <Volume2 size={12} />}
                            <span>{isPlay ? 'Dừng' : 'Nghe thử'}</span>
                          </button>
                        </div>
                      );
                    })
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingQr || !parsedAmtInfo.ok || !parsedMsgInfo.ok}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:brightness-110 text-white font-black text-base shadow-[0_6px_25px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingQr ? <RefreshCw size={18} className="animate-spin" /> : <QrCode size={18} />}
                  <span>
                    {parsedAmtInfo.ok ? `Ủng Hộ ${formatVND(parsedAmtInfo.amount)} • Lấy Mã QR` : 'Lấy Mã QR Ủng Hộ'}
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* RIGHT (5 cols): TOP 5 & RECENT DONATIONS */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#151D2F] border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
              <h2 className="text-base font-black text-amber-300 flex items-center gap-2 mb-3.5">
                <Crown size={18} className="text-amber-400" />
                <span>{boardState.season_label}</span>
              </h2>

              {boardState.top_donators.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-[#0B1120] rounded-xl border border-slate-800">
                  Chưa có lượt ủng hộ nào — hãy mở bát Top 1 nhé!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {boardState.top_donators.map((d, idx) => (
                    <div
                      key={d.user_key || idx}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                        idx === 0
                          ? 'bg-gradient-to-r from-emerald-950/90 to-amber-950/45 border-amber-400/65'
                          : idx === 1
                            ? 'bg-teal-950/45 border-teal-400/45'
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
                          className="w-9 h-9 rounded-full object-cover border border-emerald-400/60 shrink-0"
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

            <div className="bg-[#151D2F] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                <span>💬</span> Ủng Hộ Gần Đây
              </h3>
              {boardState.recent_donations.length === 0 ? (
                <div className="text-center py-5 text-slate-500 text-xs">Chưa có lượt ủng hộ gần đây.</div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {boardState.recent_donations.map((tx, idx) => (
                    <div key={tx.tx_id || idx} className="p-2.5 rounded-xl bg-[#0B1120] border border-slate-800/90 space-y-1">
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
