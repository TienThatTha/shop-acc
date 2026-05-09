import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // ---- BẢO MẬT: XÁC THỰC NGƯỜI DÙNG ----
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Vui lòng đăng nhập!' }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Phiên đăng nhập không hợp lệ!' }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    // ------------------------------------------------

    const { telco, amount, code, serial, userId } = await req.json()
    
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Yêu cầu bị từ chối!' }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    const partnerId = Deno.env.get('PARTNER_ID')
    const partnerKey = Deno.env.get('PARTNER_KEY')
    
    if (!partnerId || !partnerKey) {
      throw new Error("Hệ thống chưa cấu hình Partner ID/Key!")
    }

    // --- CẬP NHẬT: TẠO REQUEST ID CHỈ GỒM CÁC CHỮ SỐ ---
    // Kết hợp 5 số cuối của thời gian hiện tại và 4 số ngẫu nhiên để tạo mã 9 chữ số (Ví dụ: 824519342)
    const timeStr = Date.now().toString().slice(-5);
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const requestId = timeStr + randStr;
    // ----------------------------------------------------

    const command = 'charging'

    // Tạo chữ ký: md5(partner_key + code + serial)
    const signString = `${partnerKey}${code}${serial}`
    const messageBuffer = new TextEncoder().encode(signString);
    const hashBuffer = await crypto.subtle.digest("MD5", messageBuffer);
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sign = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Lấy tên khách hàng để lưu vào deposit_request
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('name, phone')
      .eq('id', userId)
      .single();

    const userName = userProfile?.name || userProfile?.phone || `ID: ${userId}`;

    // Lưu lệnh nạp vào Database
    const { error: dbError } = await supabaseAdmin.from('deposit_requests').insert([{
      id: requestId,
      userId: userId,
      user: userName,
      amount: amount,
      status: 'Chờ duyệt',
      type: 'card',
      details: `Nạp thẻ ${telco} - Mã: ${code} - Seri: ${serial}`
    }])

    if (dbError) throw dbError;

    const DOITHECAO_API_URL = 'https://doithecao.com/chargingws/v2'; 

    const response = await fetch(DOITHECAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        telco: telco,
        code: code,
        serial: serial,
        amount: amount,
        request_id: requestId, // Đã gửi lên một dãy số
        partner_id: partnerId,
        sign: sign,
        command: command
      })
    })

    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Lỗi từ hệ thống đối tác. Trả về không phải JSON:", responseText);
      
      await supabaseAdmin.from('deposit_requests')
        .update({ status: 'Thất bại', details: `[Lỗi API/Bị chặn] Thẻ ${telco} - Mã: ${code} - Seri: ${serial}` })
        .eq('id', requestId);

      return new Response(
        JSON.stringify({ success: false, message: "Hệ thống nạp thẻ tạm thời mất kết nối. Vui lòng thử lại sau!" }), 
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (result.status === 100 || result.status === 3 || result.status === 4 || result.status === 2) {
       await supabaseAdmin.from('deposit_requests')
        .update({ status: 'Thất bại', details: `[${result.message}] Nạp thẻ ${telco} - Mã: ${code} - Seri: ${serial}` })
        .eq('id', requestId)
        
        return new Response(
          JSON.stringify({ success: false, message: result.message }), 
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
    }

    // Thành công gửi thẻ sang đối tác
    return new Response(
      JSON.stringify({ success: true, requestId: requestId, message: "Thẻ đã được gửi đi và đang chờ duyệt" }), 
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Lỗi submit thẻ:", error)
    return new Response(
      JSON.stringify({ success: false, message: error.message }), 
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})