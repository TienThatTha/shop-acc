import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

// Định nghĩa các Headers CORS để cho phép kết nối từ trình duyệt
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // BẮT BUỘC: Xử lý request OPTIONS (Preflight) để trình duyệt không chặn CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let payload;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      payload = Object.fromEntries(url.searchParams.entries());
    } else {
      payload = await req.json()
    }
    
    // Ép kiểu nếu request là GET (dữ liệu bị biến thành chuỗi)
    payload.amount = parseInt(payload.amount || "0");
    payload.status = parseInt(payload.status || "0");
    
    const partnerKey = Deno.env.get('PARTNER_KEY')
    
    // 1. Kiểm tra chữ ký (Bảo vệ Giả mạo Callback)
    const signString = `${partnerKey}${payload.code}${payload.serial}`
    const messageBuffer = new TextEncoder().encode(signString);
    const hashBuffer = await crypto.subtle.digest("MD5", messageBuffer);
    const expectedSign = encodeHex(hashBuffer);

    if (expectedSign !== payload.callback_sign) {
      console.error("Sai chữ ký bảo mật từ Webhook");
      // Bổ sung CORS vào các response lỗi
      return new Response("Invalid Signature", { 
        status: 403,
        headers: corsHeaders 
      })
    }

    // 2. Chống Replay Attack
    const requestId = payload.request_id
    const { data: requestRecord, error: reqError } = await supabaseAdmin
      .from('deposit_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (reqError || !requestRecord) {
      // Bổ sung CORS vào các response lỗi
      return new Response("Request not found", { 
        status: 404,
        headers: corsHeaders 
      })
    }

    if (requestRecord.status === 'Thành công' || requestRecord.status === 'Thất bại') {
      // Bổ sung CORS vào response thành công/đã xử lý
      return new Response("Already processed", { 
        status: 200,
        headers: corsHeaders 
      })
    }

    // 3. Xử lý trạng thái và nạp sai mệnh giá
    let finalStatus = 'Thất bại'
    let addedAmount = 0
    let note = payload.message || ''

    if (payload.status === 1 || payload.status === 2) {
      finalStatus = 'Thành công'
      // payload.amount là Mệnh giá thực. Người dùng nhận 80% (Phí 20%)
      addedAmount = Math.floor(payload.amount * 0.8)
      if (payload.status === 2) {
         note = `(Sai mệnh giá) Nhận thực tế: ${payload.amount}đ. ` + note
      }
    } else {
      finalStatus = 'Thất bại'
    }

    // Cập nhật record lệnh nạp
    await supabaseAdmin
      .from('deposit_requests')
      .update({ 
        status: finalStatus, 
        amount: payload.amount, 
        details: requestRecord.details + ` | Kết quả: ${note}`
      })
      .eq('id', requestId)

    // Nếu thành công -> Cộng tiền
    if (finalStatus === 'Thành công' && addedAmount > 0) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', requestRecord.userId)
        .single()

      if (user) {
        // Đọc config
        const { data: configData } = await supabaseAdmin.from('site_config').select('*').eq('id', 'deposit_bonus').single()
        const minAmount = configData?.value?.minAmount || 20000;
        const spinsPerMinAmount = configData?.value?.bonusSpins || 1;

        const bonusSpins = Math.floor(addedAmount / minAmount) * spinsPerMinAmount
        const newBalance = user.balance + addedAmount
        const newSpins = (user.spins || 0) + bonusSpins

        await supabaseAdmin
          .from('users')
          .update({ balance: newBalance, spins: newSpins })
          .eq('id', user.id)

        // Ghi lịch sử giao dịch
        await supabaseAdmin.from('transactions').insert([{
          id: `TX_CARD_${Date.now()}`,
          user: user.name,
          action: `Nạp thẻ cào (${payload.telco})`,
          amount: addedAmount,
          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
          status: 'Thành công',
          type: 'deposit',
          accDetails: { balanceAfter: newBalance, fundAfter: user.rentFund || 0 }
        }])
      }
    }

    // Response cuối cùng khi chạy mượt mà cũng phải ghép nối với cấu trúc JSON và CORS headers
    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error("Lỗi Webhook thẻ:", error)
    // Response lỗi ở catch block cũng bắt buộc cần CORS headers
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})