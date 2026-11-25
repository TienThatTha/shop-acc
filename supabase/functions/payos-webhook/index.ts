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
      console.log("Không thể đọc JSON từ PayOS", e);
      return new Response(JSON.stringify({ success: true, note: "Ping accepted" }), { headers: corsHeaders, status: 200 })
    }
    console.log("PayOS Webhook Payload:", payload);

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
    
    if (webhookData.code === '00') {
      const orderCode = webhookData.orderCode;
      if (orderCode === 123 || webhookData.description === 'VQRIO123') {
        return new Response(JSON.stringify({ success: true, note: "PayOS confirm-webhook test accepted" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }
      const amount = Number(webhookData.amount) || 0;

      // Tìm thông tin deposit request
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

      // =========================================================================
      // NHÁNH RIÊNG: DONATE LIVE CHUYỂN KHOẢN (KHÔNG CỘNG SỐ DƯ SHOP HAY LƯỢT QUAY)
      // =========================================================================
      if (requestRecord.type === 'live_donate') {
        let meta: any = {};
        try {
          meta = JSON.parse(requestRecord.details || '{}');
        } catch (_e) {
          meta = {};
        }

        const tiktokUid = String(meta.tiktok_uid || requestRecord.user || 'an_danh').trim().replace(/^@/, '').toLowerCase();
        const nickname = String(meta.nickname || tiktokUid).trim();
        const avatarUrl = String(meta.avatar_url || '').trim();
        const message = String(meta.message || '').trim();
        const ttsVoice = amount >= 10000 ? (String(meta.tts_voice || 'tt_nu_vn').trim() || 'tt_nu_vn') : 'tt_nu_vn';
        const createdTs = Number(meta.created_ts) || Date.now();
        const txRef = String(webhookData.transactionReference || orderCode);

        await supabaseAdmin
          .from('deposit_requests')
          .update({
            status: 'Thành công',
            amount: amount,
            details: JSON.stringify({
              ...meta,
              paid_amount: amount,
              transactionReference: txRef,
              paid_at: new Date().toISOString()
            })
          })
          .eq('id', requestRecord.id);

        // Đẩy sự kiện Realtime vào game_orders để PC chạy main.py nhận ngay (<1s)
        const gameOrderId = `BANK_DNT_${orderCode}`;
        const { error: gameOrderErr } = await supabaseAdmin
          .from('game_orders')
          .upsert([{
            id: gameOrderId,
            user_id: tiktokUid,
            nickname: nickname,
            web_user: String(meta.web_user_id || requestRecord.userId || 'guest'),
            package_id: 'live_bank_donate',
            package_name: 'Donate Live Chuyển Khoản',
            price: amount,
            rewards: {
              purpose: 'live_donate',
              order_code: orderCode,
              transaction_ref: txRef,
              message: message,
              tts_voice: ttsVoice,
              avatar_url: avatarUrl,
              web_user_id: String(meta.web_user_id || 'guest'),
              created_ts: createdTs
            },
            status: 'pending',
            notify: true,
            created_at: new Date().toISOString()
          }], { onConflict: 'id' });
        if (gameOrderErr) {
          console.error('Lỗi tạo game_orders live_bank_donate:', gameOrderErr);
        }

        // Cập nhật tức thì bảng Top 5 & lịch sử gần nhất trên site_config (hoạt động 24/7 kể cả khi PC tắt)
        try {
          const { data: cfgRow } = await supabaseAdmin
            .from('site_config')
            .select('value')
            .eq('id', 'live_bank_donate_state')
            .maybeSingle();

          const curState = (cfgRow && typeof cfgRow.value === 'object' && cfgRow.value) ? cfgRow.value : {};
          const totalsMap: Record<string, any> = (curState.totals_map && typeof curState.totals_map === 'object') ? { ...curState.totals_map } : {};
          const prevEntry = totalsMap[tiktokUid] || {};
          const nowTs = Date.now() / 1000;

          totalsMap[tiktokUid] = {
            user_key: tiktokUid,
            nickname: prevEntry.nickname || nickname,
            avatar_url: prevEntry.avatar_url || avatarUrl,
            amount: (Number(prevEntry.amount) || 0) + amount,
            count: (Number(prevEntry.count) || 0) + 1,
            first_donate_time: Number(prevEntry.first_donate_time) || nowTs
          };

          const sortedTop = Object.values(totalsMap)
            .filter((x: any) => Number(x.amount) > 0)
            .sort((a: any, b: any) => (Number(b.amount) - Number(a.amount)) || (Number(a.first_donate_time) - Number(b.first_donate_time)))
            .slice(0, 10)
            .map((x: any, idx: number) => ({ ...x, rank: idx + 1 }));

          const prevRecent = Array.isArray(curState.recent_donations) ? curState.recent_donations : [];
          const nextRecent = [
            {
              tx_id: gameOrderId,
              user_key: tiktokUid,
              nickname: totalsMap[tiktokUid].nickname,
              avatar_url: totalsMap[tiktokUid].avatar_url,
              delta: amount,
              message: message,
              timestamp: nowTs,
              type: 'payos'
            },
            ...prevRecent.filter((r: any) => r.tx_id !== gameOrderId)
          ].slice(0, 20);

          const { error: cfgUpsertErr } = await supabaseAdmin
            .from('site_config')
            .upsert({
              id: 'live_bank_donate_state',
              value: {
                season_label: curState.season_label || 'TOP DONATE • CHUYỂN KHOẢN',
                top_donators: sortedTop,
                recent_donations: nextRecent,
                totals_map: totalsMap,
                updated_at: new Date().toISOString()
              }
            }, { onConflict: 'id' });
          if (cfgUpsertErr) {
            console.error('Lỗi upsert live_bank_donate_state:', cfgUpsertErr);
          }
        } catch (stateErr) {
          console.error('Lỗi cập nhật live_bank_donate_state:', stateErr);
        }

        return new Response(JSON.stringify({ success: true, mode: 'live_donate' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }

      // =========================================================================
      // NHÁNH CŨ: NẠP TIỀN MUA ACC / CHƠI VÒNG QUAY TRÊN SHOP
      // =========================================================================
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', requestRecord.userId)
        .single()

      if (user) {
        let requestBonusAmount = requestRecord.bonusAmount || 0;
        let requestVoucherSpins = requestRecord.voucherSpins || 0;
        const requestVoucherCode = requestRecord.voucherCode || null;

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

        await supabaseAdmin
          .from('deposit_requests')
          .update({ 
            status: 'Thành công',
            details: successDetails
          })
          .eq('id', requestRecord.id)

        const { data: configData } = await supabaseAdmin.from('site_config').select('*').eq('id', 'deposit_bonus').single()
        const minAmount = configData?.value?.minAmount || 20000;
        const spinsPerMinAmount = configData?.value?.bonusSpins || 1;

        const bonusSpins = Math.floor(amount / minAmount) * spinsPerMinAmount + requestVoucherSpins;
        const newBalance = user.balance + amount + requestBonusAmount;
        const newSpins = (user.spins || 0) + bonusSpins;
        
        await supabaseAdmin
          .from('users')
          .update({ balance: newBalance, spins: newSpins })
          .eq('id', user.id)

        const now = new Date();
        const dateStr = now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + ' ' + now.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

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
    return new Response(JSON.stringify({ success: true, error: error.message }), { headers: corsHeaders, status: 200 })
  }
})
