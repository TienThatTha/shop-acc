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

function validateLiveDonateMessage(raw: string): { ok: boolean; cleaned: string; error?: string } {
  const cleaned = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return { ok: true, cleaned: '' };
  if (cleaned.length > 150) {
    return { ok: false, cleaned: '', error: 'Lời nhắn tối đa 150 ký tự.' };
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
      donateMessage
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

      const msgCheck = validateLiveDonateMessage(String(donateMessage || ''));
      if (!msgCheck.ok) {
        return new Response(JSON.stringify({ error: msgCheck.error || "Lời nhắn không hợp lệ!" }), { status: 400, headers: corsHeaders });
      }

      const requestData = {
        orderCode: orderCode,
        amount: parsedAmount,
        description: `DNT ${orderCode}`,
        returnUrl: returnUrl || 'https://shoptiengaming.com',
        cancelUrl: cancelUrl || 'https://shoptiengaming.com',
      };

      const paymentLinkRes = await payos.createPaymentLink(requestData);

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
          avatar_url: String(avatarUrl || '').trim(),
          message: msgCheck.cleaned,
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
