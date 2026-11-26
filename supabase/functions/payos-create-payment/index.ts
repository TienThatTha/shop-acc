import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import PayOS from 'npm:@payos/node@1.0.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const BANNED_TOKENS = new Set([
  'dm', 'dmm', 'vcl', 'vkl', 'vl', 'clmm', 'clm', 'cc', 'lon', 'cac', 'buoi',
  'dit', 'du', 'fuck', 'bitch', 'shit', 'kubet', 'sunwin', 'go88', 'hitclub',
  '789club', 'f8bet', 'jun88', 'hi88', 'shbet', 'new88', 'okvip', 'mb66', '8xbet'
]);

const BANNED_PHRASES = [
  'dit me', 'du ma', 'du me', 'mat day', 'oc cho', 'ngu nguc', 'cho chet',
  'me may', 'bo may', 'nha cai', 'tai xiu', 'ca do', 'ca cuoc', 'no hu',
  'xoc dia', 'ban dam', 'ma tuy', 'hang trang', 'tu tu', 'giet nguoi'
];

function stripAccents(str: string): string {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const DONATE_MSG_BASE_MAX_LEN = 150;
const DONATE_MSG_BONUS_STEP_VND = 10000;
const DONATE_MSG_BONUS_CHARS_PER_STEP = 50;
const DONATE_MSG_HARD_CAP = 10000;

function getDonateMessageMaxLen(amount: number): number {
  const amt = Math.max(0, Math.floor(Number(amount) || 0));
  const steps = Math.floor(amt / DONATE_MSG_BONUS_STEP_VND);
  return Math.min(DONATE_MSG_HARD_CAP, DONATE_MSG_BASE_MAX_LEN + steps * DONATE_MSG_BONUS_CHARS_PER_STEP);
}

function isUsablePublicAvatar(rawUrl: string): boolean {
  const u = String(rawUrl || '').trim();
  if (!u || !/^https?:\/\//i.test(u)) return false;
  if (u.includes('api.dicebear.com') || u.includes('ui-avatars.com')) return false;
  const m = u.match(/[?&]x-expires=(\d+)/);
  if (m) {
    const exp = Number(m[1]);
    if (Number.isFinite(exp) && Date.now() / 1000 >= exp) return false;
  }
  return true;
}

function validateLiveDonateMessage(raw: string, maxLen = DONATE_MSG_BASE_MAX_LEN): { ok: boolean; cleaned: string; error?: string } {
  const cleaned = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return { ok: true, cleaned: '' };
  if (cleaned.length > maxLen) {
    return {
      ok: false,
      cleaned: '',
      error: `Lời nhắn tối đa ${maxLen} ký tự (mặc định 150 + 50 ký tự mỗi 10.000đ).`,
    };
  }
  if (/(https?:\/\/|www\.|t\.me\/|zalo\.me\/|fb\.com\/|\b[a-z0-9-]{2,}\.(com|net|org|vn|io|xyz|club|bet|vip|win|info|top|co|me)\b)/i.test(cleaned)) {
    return { ok: false, cleaned: '', error: 'Lời nhắn không được chứa liên kết website.' };
  }
  if (/(\+?84|0)(?:[\s.\-_]*\d){8,10}\b/.test(cleaned)) {
    return { ok: false, cleaned: '', error: 'Lời nhắn không được chứa số điện thoại.' };
  }
  if (/(.)\1{5,}/i.test(cleaned)) {
    return { ok: false, cleaned: '', error: 'Lời nhắn chứa ký tự lặp spam.' };
  }
  const norm = stripAccents(cleaned).toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (` ${norm} `.includes(phrase)) {
      return { ok: false, cleaned: '', error: 'Lời nhắn chứa từ ngữ không phù hợp trên Live.' };
    }
  }
  const tokens = norm.match(/[a-z0-9]+/g) || [];
  for (const tok of tokens) {
    if (BANNED_TOKENS.has(tok)) {
      return { ok: false, cleaned: '', error: 'Lời nhắn chứa từ ngữ không phù hợp trên Live.' };
    }
  }
  return { ok: true, cleaned };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const {
      purpose,
      amount,
      userId,
      phone,
      returnUrl,
      cancelUrl,
      bonusAmount,
      voucherSpins,
      voucherCode,
      tiktokUid,
      nickname,
      avatarUrl,
      donateMessage,
      ttsVoice
    } = body

    const PayOSClass = (PayOS as any).PayOS || (PayOS as any).default || PayOS;
    const payos = new PayOSClass(
      Deno.env.get('PAYOS_CLIENT_ID') ?? '',
      Deno.env.get('PAYOS_API_KEY') ?? '',
      Deno.env.get('PAYOS_CHECKSUM_KEY') ?? ''
    );
    const orderCode = Number(String(Date.now()).slice(-9));

    if (purpose === 'live_donate') {
      const parsedAmount = Math.floor(Number(amount) || 0);
      const cleanUid = String(tiktokUid || '').trim().replace(/^@/, '').toLowerCase();
      const cleanNick = String(nickname || cleanUid).trim().slice(0, 80) || cleanUid;

      if (!cleanUid) {
        return new Response(JSON.stringify({ error: "Vui lòng nhập hoặc chọn @ID TikTok!" }), { status: 400, headers: corsHeaders });
      }
      if (parsedAmount < 5000) {
        return new Response(JSON.stringify({ error: "Số tiền Donate Live tối thiểu là 5.000đ!" }), { status: 400, headers: corsHeaders });
      }

      const maxMsgLen = getDonateMessageMaxLen(parsedAmount);
      const msgCheck = validateLiveDonateMessage(String(donateMessage || ''), maxMsgLen);
      if (!msgCheck.ok) {
        return new Response(JSON.stringify({ error: msgCheck.error || "Lời nhắn không hợp lệ!" }), { status: 400, headers: corsHeaders });
      }

      let resolvedAvatarUrl = String(avatarUrl || '').trim();
      if (!isUsablePublicAvatar(resolvedAvatarUrl)) {
        resolvedAvatarUrl = '';
        try {
          const { data: gpRow } = await supabaseAdmin
            .from('game_players')
            .select('avatar_url')
            .eq('user_id', cleanUid)
            .maybeSingle();
          const gpAv = String(gpRow?.avatar_url || '').trim();
          if (isUsablePublicAvatar(gpAv)) {
            resolvedAvatarUrl = gpAv;
          }
        } catch (_e) { /* ignore */ }
      }

      const requestData = {
        orderCode: orderCode,
        amount: parsedAmount,
        description: `DNT ${orderCode}`,
        returnUrl: returnUrl || 'https://shoptiengaming.com',
        cancelUrl: cancelUrl || 'https://shoptiengaming.com',
      };

      const paymentLinkRes = await payos.createPaymentLink(requestData);

      const ALLOWED_TTS_VOICES = new Set([
        'hoaimy', 'namminh', 'gtts', 'tt_nu_vn', 'tt_nam_vn', 'hoaimy_hd', 'harper_vn', 'grant_vn',
        'grant_cskh', 'grant_narrator',
        'gpt_nova', 'gpt_shimmer', 'gpt_alloy', 'gpt_echo', 'gpt_onyx', 'gpt_fable', 'gpt_ash',
        'tt_jessie', 'tt_ghostface', 'tt_stitch', 'tt_rocket', 'tt_c3po', 'tt_chewbacca', 'tt_grinch',
        'tt_funny', 'tt_wizard', 'tt_opera', 'tt_lobby', 'tt_silly_sing', 'tt_glorious', 'tt_disney',
        'fx_chipmunk', 'fx_megaphone', 'fx_fan', 'fx_robot', 'fx_god', 'fx_demon',
        'davis_funny', 'nancy_funny', 'nancy_shy', 'loli_angry', 'loli_sad', 'phoebe_sad', 'derek_hype',
        'xiaoxiao_poem', 'chibi_cn', 'be_cute', 'tram_ngau', 'xiaoyou_loli', 'rap_nhanh', 'ba_lao',
        'ava_tay', 'andrew_us', 'ada_uk', 'ryan_uk', 'nanami_jp', 'masaru_jp', 'sunhi_kr', 'hyunsu_kr',
        'xiaoxiao_cn', 'yunfan_cn', 'hsiaochen_tw', 'premwadee_th', 'pattara_th',
        'vivienne_fr', 'remy_fr', 'seraphina_de', 'ximena_es', 'arjun_in',
        'hamed_dubai', 'giuseppe_it', 'ahmet_tr', 'perla_hk', 'thalita_br'
      ]);
      const CUSTOM_VOICE_MIN_AMOUNT = 10000;
      const rawVoice = String(ttsVoice || 'tt_nu_vn').trim().toLowerCase();
      const cleanVoice = (parsedAmount >= CUSTOM_VOICE_MIN_AMOUNT && ALLOWED_TTS_VOICES.has(rawVoice)) ? rawVoice : 'tt_nu_vn';

      await supabaseAdmin.from('deposit_requests').insert([{
        id: `PAYOS_${orderCode}`,
        userId: userId || 'LIVE_DONATE_GUEST',
        user: cleanUid,
        amount: parsedAmount,
        bonusAmount: 0,
        voucherSpins: 0,
        voucherCode: null,
        details: JSON.stringify({
          purpose: 'live_donate',
          tiktok_uid: cleanUid,
          nickname: cleanNick,
          avatar_url: resolvedAvatarUrl,
          message: msgCheck.cleaned,
          tts_voice: cleanVoice,
          web_user_id: userId || 'guest',
          created_ts: Date.now()
        }),
        status: 'Chờ duyệt',
        type: 'live_donate',
        created_at: new Date().toISOString()
      }]);

      return new Response(JSON.stringify({
        success: true,
        ...paymentLinkRes,
        orderCode: orderCode
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    if (!amount || !userId || !phone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders })
    }

    const requestData = {
      orderCode: orderCode,
      amount: amount,
      description: `NAP ${orderCode}`,
      returnUrl: returnUrl || 'http://localhost:5173/profile',
      cancelUrl: cancelUrl || 'http://localhost:5173/profile',
    };

    const paymentLinkRes = await payos.createPaymentLink(requestData);

    // Lưu lại orderCode vào deposit_requests để sau này map lại khi Webhook trả về
    await supabaseAdmin.from('deposit_requests').insert([{
      id: `PAYOS_${orderCode}`,
      userId: userId,
      user: phone, // Tạm dùng phone để nhận diện
      amount: amount,
      bonusAmount: bonusAmount || 0,
      voucherSpins: voucherSpins || 0,
      voucherCode: voucherCode || null,
      details: voucherCode ? `Chờ thanh toán (Voucher: ${voucherCode})` : 'Chờ thanh toán tự động',
      status: 'Chờ duyệt',
      type: 'banking',
      created_at: new Date().toISOString()
    }]);

    return new Response(JSON.stringify({ 
      success: true, 
      ...paymentLinkRes,
      orderCode: orderCode
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error("Lỗi tạo link PayOS:", error)
    return new Response(JSON.stringify({ error: error?.message || error || "Unknown Error" }), { status: 400, headers: corsHeaders })
  }
})
