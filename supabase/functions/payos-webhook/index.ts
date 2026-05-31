import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import PayOS from 'npm:@payos/node@1.0.7'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let payload;
    try {
      payload = await req.json()
    } catch (e) {
      // Không thể parse JSON (có thể là webhook ping hoặc sai định dạng)
      console.log("Không thể đọc JSON từ PayOS", e);
      return new Response(JSON.stringify({ success: true, note: "Ping accepted" }), { headers: corsHeaders, status: 200 })
    }
    console.log("PayOS Webhook Payload:", payload);

    // Trả về 200 OK ngay nếu đây là ping test từ PayOS
    if (payload && payload.code === '00' && payload.data === null) {
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" }, status: 200 })
    }

    const PayOSClass = (PayOS as any).PayOS || (PayOS as any).default || PayOS;
    const payos = new PayOSClass(
      Deno.env.get('PAYOS_CLIENT_ID') ?? '',
      Deno.env.get('PAYOS_API_KEY') ?? '',
      Deno.env.get('PAYOS_CHECKSUM_KEY') ?? ''
    );

    let webhookData;
    try {
      webhookData = payos.verifyPaymentWebhookData(payload);
    } catch (e) {
      console.error("Lỗi xác thực webhook (có thể là test ping):", e);
      return new Response(JSON.stringify({ success: true, note: "Test ping accepted" }), { headers: { "Content-Type": "application/json" }, status: 200 })
    }
    
    if (webhookData.code === '00' || webhookData.code === '00') { // Giao dịch thành công (verifyPaymentWebhookData chỉ trả về data object)
      const orderCode = webhookData.orderCode;
      const amount = webhookData.amount;

      // Tìm thông tin deposit request để lấy userId
      const { data: requestRecord, error: reqError } = await supabaseAdmin
        .from('deposit_requests')
        .select('*')
        .eq('id', `PAYOS_${orderCode}`)
        .single()

      if (reqError || !requestRecord) {
        return new Response("Request not found", { status: 404 })
      }

      if (requestRecord.status === 'Thành công') {
        return new Response("Already processed", { status: 200 })
      }

      // Lấy thông tin user
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', requestRecord.userId)
        .single()

      if (user) {
        let requestBonusAmount = requestRecord.bonusAmount || 0;
        let requestVoucherSpins = requestRecord.voucherSpins || 0;
        const requestVoucherCode = requestRecord.voucherCode || null;

        // [BẢO MẬT NGHIÊM TRỌNG]: Chống thủ thuật "bào" khuyến mãi
        // Khách tạo lệnh 100k áp mã giảm giá 10k, nhưng lại cố tình vào app ngân hàng chuyển khoản đúng 1đ
        // Nếu không check, khách sẽ được cộng 1đ + 10.000đ (tiền thưởng) = 10.001đ.
        if (amount < requestRecord.amount) {
           requestBonusAmount = 0;
           requestVoucherSpins = 0;
        }

        let successDetails = `Thanh toán thành công (Mã GD: ${webhookData.transactionReference})`;
        if (requestVoucherCode) {
          if (amount < requestRecord.amount) {
            successDetails += ` - Đã HỦY Voucher ${requestVoucherCode} do chuyển thiếu tiền!`;
          } else {
            successDetails += ` - Đã áp dụng Voucher: ${requestVoucherCode} (Thưởng +${requestBonusAmount}đ, +${requestVoucherSpins} lượt)`;
          }
        }

        // Cập nhật trạng thái lệnh nạp
        await supabaseAdmin
          .from('deposit_requests')
          .update({ 
            status: 'Thành công',
            details: successDetails
          })
          .eq('id', requestRecord.id)

        // Tính toán thưởng
        const { data: configData } = await supabaseAdmin.from('site_config').select('*').eq('id', 'deposit_bonus').single()
        const minAmount = configData?.value?.minAmount || 20000;
        const spinsPerMinAmount = configData?.value?.bonusSpins || 1;

        const bonusSpins = Math.floor(amount / minAmount) * spinsPerMinAmount + requestVoucherSpins;
        const newBalance = user.balance + amount + requestBonusAmount;
        const newSpins = (user.spins || 0) + bonusSpins;
        
        // Cập nhật Số dư
        await supabaseAdmin
          .from('users')
          .update({ balance: newBalance, spins: newSpins })
          .eq('id', user.id)

        // Xử lý múi giờ Việt Nam
        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + ' ' + now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        // Ghi Lịch sử giao dịch (sử dụng amount âm để hiển thị cộng tiền trên UI)
        let actionStr = `Nạp chuyển khoản tự động`;
        if (requestVoucherCode) {
          actionStr += ` (Mã KM: ${requestVoucherCode} +${requestBonusAmount}đ)`;
        }
        await supabaseAdmin.from('transactions').insert([{
          id: `TX_PAYOS_${Date.now()}`,
          user: user.name || user.phone || 'Khách Vô Danh',
          action: actionStr,
          amount: -Math.abs(amount + requestBonusAmount),
          date: dateStr,
          status: 'Thành công',
          type: 'deposit_auto',
          accDetails: { balanceAfter: newBalance, fundAfter: user.rentFund || 0 }
        }])
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error("Lỗi Webhook PayOS:", error)
    // Luôn trả về 200 để PayOS không báo lỗi 400 trên bảng điều khiển
    return new Response(JSON.stringify({ success: true, error: error.message }), { headers: corsHeaders, status: 200 })
  }
})
