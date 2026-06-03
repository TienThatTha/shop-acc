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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, userId, phone, returnUrl, cancelUrl, bonusAmount, voucherSpins, voucherCode } = await req.json()

    if (!amount || !userId || !phone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders })
    }

    const PayOSClass = (PayOS as any).PayOS || (PayOS as any).default || PayOS;
    const payos = new PayOSClass(
      Deno.env.get('PAYOS_CLIENT_ID') ?? '',
      Deno.env.get('PAYOS_API_KEY') ?? '',
      Deno.env.get('PAYOS_CHECKSUM_KEY') ?? ''
    );
    // Tạo mã đơn hàng duy nhất (chỉ chứa số, tối đa 53 bit nguyên dương)
    // Dùng Date.now() hoặc ngẫu nhiên
    const orderCode = Number(String(Date.now()).slice(-9)); // PayOS yêu cầu orderCode <= 2^53 - 1

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
