import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

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
    const { telco, amount, code, serial, userId } = await req.json()
    
    const partnerId = Deno.env.get('PARTNER_ID')
    const partnerKey = Deno.env.get('PARTNER_KEY')
    
    if (!partnerId || !partnerKey) {
      throw new Error("Chưa cấu hình Partner ID/Key trên hệ thống!")
    }

    const requestId = `CARD_${Date.now()}_${userId}`
    const command = 'charging'

    // Tạo chữ ký: md5(partner_key + partner_id + command + request_id)
    const signString = `${partnerKey}${partnerId}${command}${requestId}`
    const messageBuffer = new TextEncoder().encode(signString);
    const hashBuffer = await crypto.subtle.digest("MD5", messageBuffer);
    const sign = encodeHex(hashBuffer);

    // Lưu vào database trước khi gọi sang gachthe1s
    const { error: dbError } = await supabaseAdmin.from('deposit_requests').insert([{
      id: requestId,
      userId: userId,
      amount: amount,
      status: 'Chờ duyệt',
      type: 'card',
      details: `Nạp thẻ ${telco} - Mã: ${code} - Seri: ${serial}`
    }])

    if (dbError) throw dbError;

    // Call API Doithecao.com
    const response = await fetch('https://doithecao.com/api/card-auto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        telco: telco,
        code: code,
        serial: serial,
        amount: amount,
        request_id: requestId,
        partner_id: partnerId,
        sign: sign,
        command: command
      })
    })

    const result = await response.json()

    // Cập nhật lại status theo API trả về nếu bị lỗi ngay lập tức
    if (result.status === 100 || result.status === 3 || result.status === 4) {
       await supabaseAdmin.from('deposit_requests')
        .update({ status: 'Thất bại', details: `[${result.message}] Nạp thẻ ${telco} - Mã: ${code} - Seri: ${serial}` })
        .eq('id', requestId)
        
        return new Response(JSON.stringify({ success: false, message: result.message }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true, requestId: requestId, message: "Thẻ đã được gửi đi" }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error("Lỗi submit thẻ:", error)
    return new Response(JSON.stringify({ success: false, message: error.message }), { headers: corsHeaders, status: 400 })
  }
})
