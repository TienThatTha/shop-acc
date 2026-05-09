import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
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
    
    // payload cấu trúc từ doithecao thường là: 
    // status, message, request_id, declared_value, value, amount, code, serial, telco, trans_id, callback_sign
    
    const partnerKey = Deno.env.get('PARTNER_KEY')
    
    // 1. Kiểm tra chữ ký (Bảo vệ Giả mạo Callback)
    // Chữ ký của callback_sign sẽ là: md5(partner_key + code + serial)
    const signString = `${partnerKey}${payload.code}${payload.serial}`
    const messageBuffer = new TextEncoder().encode(signString);
    const hashBuffer = await crypto.subtle.digest("MD5", messageBuffer);
    const expectedSign = encodeHex(hashBuffer);

    if (expectedSign !== payload.callback_sign) {
      console.error("Sai chữ ký bảo mật từ Webhook");
      return new Response("Invalid Signature", { status: 403 })
    }

    // 2. Chống Replay Attack
    const requestId = payload.request_id
    const { data: requestRecord, error: reqError } = await supabaseAdmin
      .from('deposit_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (reqError || !requestRecord) {
      return new Response("Request not found", { status: 404 })
    }

    if (requestRecord.status === 'Thành công' || requestRecord.status === 'Thất bại') {
      return new Response("Already processed", { status: 200 })
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
        amount: payload.amount, // Lưu lại mệnh giá thực tế
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

        // Xử lý múi giờ Việt Nam
        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + ' ' + now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        // Ghi lịch sử giao dịch
        await supabaseAdmin.from('transactions').insert([{
          id: `TX_CARD_${Date.now()}`,
          user: user.name || user.phone || 'Khách Vô Danh',
          action: `Nạp thẻ cào (${payload.telco})`,
          amount: addedAmount,
          date: dateStr,
          status: 'Thành công',
          type: 'deposit',
          accDetails: { balanceAfter: newBalance, fundAfter: user.rentFund || 0 }
        }])
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error("Lỗi Webhook thẻ:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
