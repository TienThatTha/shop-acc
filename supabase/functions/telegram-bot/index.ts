import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// BỘ KHÓA BẢO MẬT CORS (Bắt buộc phải có để React có thể gọi được)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. XỬ LÝ TRUY CẬP CORS TỪ TRÌNH DUYỆT WEB
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '';
  const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID') ?? '';

  try {
    const payload = await req.json();

    // =====================================================================
    // TRƯỜNG HỢP 1: TỪ WEBSITE BÁO LÊN (Khách vừa tạo lệnh nạp)
    // =====================================================================
    if (payload.type === 'new_request') {
      const { requestId } = payload;

      // Truy vấn thông tin lệnh nạp
      const { data: reqData } = await supabaseAdmin
        .from('deposit_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (reqData) {
        // Truy vấn SĐT từ bảng Users
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('phone')
            .eq('id', reqData.userId)
            .single();

        const phoneStr = userData?.phone || 'Không rõ';

        const messageText = `🔔 <b>CÓ LỆNH NẠP MỚI</b>\n\n👤 Khách hàng: ${reqData.user}\n📱 SĐT: ${phoneStr}\n💰 Số tiền báo: <b>${reqData.amount.toLocaleString('vi-VN')}đ</b>\n🏦 Ngân hàng: TPBank`;

        const inlineKeyboard = {
          inline_keyboard: [[
            { text: '✅ DUYỆT CỘNG', callback_data: `approve_${requestId}` },
            { text: '❌ TỪ CHỐI', callback_data: `reject_${requestId}` }
          ]]
        };

        // Gửi sang Telegram
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: messageText,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard
          })
        });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    // =====================================================================
    // TRƯỜNG HỢP 2: TỪ TELEGRAM BÁO VỀ (Bạn vừa bấm nút Duyệt/Từ chối)
    // =====================================================================
    if (payload.callback_query) {
      const callbackQuery = payload.callback_query;
      const data = callbackQuery.data; 
      const messageId = callbackQuery.message.message_id;
      
      const [action, requestId] = data.split('_');

      const { data: reqData } = await supabaseAdmin.from('deposit_requests').select('*').eq('id', requestId).single();

      if (reqData && reqData.status === 'Chờ duyệt') {
        if (action === 'approve') {
          // 1. Cập nhật đơn nạp thành Thành Công
          await supabaseAdmin.from('deposit_requests').update({ status: 'Thành công' }).eq('id', requestId);
          
          // 2. Cộng tiền cho User
          const { data: userTarget } = await supabaseAdmin.from('users').select('*').eq('id', reqData.userId).single();
          if (userTarget) {
              const newBalance = userTarget.balance + reqData.amount;
              await supabaseAdmin.from('users').update({ balance: newBalance }).eq('id', userTarget.id);

              // 3. Ghi Lịch sử Giao dịch
              await supabaseAdmin.from('transactions').insert([{
                id: `TX_BOT_${Date.now()}`,
                user: userTarget.name,
                action: `Nạp tiền (Duyệt nhanh qua Telegram)`,
                amount: reqData.amount,
                date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
                status: 'Thành công',
                type: 'deposit_manual',
                accDetails: { balanceAfter: newBalance, fundAfter: userTarget.rentFund || 0 }
              }]);
          }

          // 4. Cập nhật lại tin nhắn Telegram (Xóa nút đi)
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, message_id: messageId, text: `✅ <b>ĐÃ DUYỆT (TỰ ĐỘNG CỘNG TIỀN)</b>\n\nTiền nạp ${reqData.amount.toLocaleString('vi-VN')}đ đã được cộng vào tài khoản khách ${reqData.user}.`, parse_mode: 'HTML' })
          });

        } else if (action === 'reject') {
          // Xử lý nút Từ chối
          await supabaseAdmin.from('deposit_requests').update({ status: 'Từ chối' }).eq('id', requestId);
          
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, message_id: messageId, text: `❌ <b>ĐÃ TỪ CHỐI</b>\n\nLệnh nạp ${reqData.amount.toLocaleString('vi-VN')}đ của khách ${reqData.user} đã bị hủy bỏ.`, parse_mode: 'HTML' })
          });
        }
      } else {
         // Thông báo nếu lỡ bấm 2 lần
         await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: callbackQuery.id, text: "Lệnh này đã được xử lý hoặc không còn tồn tại!", show_alert: true })
          });
      }

      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    return new Response("No valid payload", { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error("Lỗi Bot:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
})