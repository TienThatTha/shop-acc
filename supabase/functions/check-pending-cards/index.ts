import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async () => {
  try {
    const partnerId = Deno.env.get('PARTNER_ID')
    const partnerKey = Deno.env.get('PARTNER_KEY')

    if (!partnerId || !partnerKey) {
      return new Response("Missing Partner Config", { status: 500 })
    }

    // 1. Tìm các thẻ đang Pending quá 30 phút
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000).toISOString()
    const { data: pendingRequests, error: reqError } = await supabaseAdmin
      .from('deposit_requests')
      .select('*')
      .eq('type', 'card')
      .eq('status', 'Chờ duyệt')
      .lt('created_at', thirtyMinutesAgo)

    if (reqError || !pendingRequests || pendingRequests.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Không có thẻ nào bị treo" }), { headers: { "Content-Type": "application/json" } })
    }

    const command = 'check'
    let checkedCount = 0

    // 2. Lặp qua từng thẻ và kiểm tra với Gachthe1s
    for (const req of pendingRequests) {
      const requestId = req.id
      
      const signString = `${partnerKey}${partnerId}${command}${requestId}`
      const messageBuffer = new TextEncoder().encode(signString);
      const hashBuffer = await crypto.subtle.digest("MD5", messageBuffer);
      const sign = encodeHex(hashBuffer);

      const response = await fetch('https://doithecao.com/api/card-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          partner_id: partnerId,
          sign: sign,
          command: command
        })
      })

      const result = await response.json()

      // Trạng thái thẻ: 1 (Thành công), 2 (Sai mệnh giá), 3 (Lỗi), 99 (Chờ xử lý)
      if (result.status === 1 || result.status === 2 || result.status === 3 || result.status === 100) {
        let finalStatus = 'Thất bại'
        let addedAmount = 0
        let note = result.message || ''

        if (result.status === 1 || result.status === 2) {
          finalStatus = 'Thành công'
          addedAmount = Math.floor(result.amount * 0.8)
          if (result.status === 2) {
            note = `(Sai mệnh giá) Nhận thực tế: ${result.amount}đ. ` + note
          }
        }

        // Cập nhật record lệnh nạp
        await supabaseAdmin
          .from('deposit_requests')
          .update({ 
            status: finalStatus, 
            amount: result.amount || req.amount,
            details: req.details + ` | Kết quả cronjob: ${note}`
          })
          .eq('id', requestId)

        // Cộng tiền
        if (finalStatus === 'Thành công' && addedAmount > 0) {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', req.userId)
            .single()

          if (user) {
            // Đọc config
            const { data: configData } = await supabaseAdmin.from('site_config').select('*').eq('id', 'deposit_bonus').single()
            const minAmount = configData?.value?.minAmount || 20000;
            const spinsPerMinAmount = configData?.value?.bonusSpins || 1;

            const bonusSpins = Math.floor(addedAmount / minAmount) * spinsPerMinAmount
            const newBalance = user.balance + addedAmount
            const newSpins = (user.spins || 0) + bonusSpins

            await supabaseAdmin.from('users').update({ balance: newBalance, spins: newSpins }).eq('id', user.id)

            await supabaseAdmin.from('transactions').insert([{
              id: `TX_CARD_CRON_${Date.now()}`,
              user: user.name,
              action: `Nạp thẻ cào (Quét lỗi treo)`,
              amount: addedAmount,
              date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
              status: 'Thành công',
              type: 'deposit',
              accDetails: { balanceAfter: newBalance, fundAfter: user.rentFund || 0 }
            }])
          }
        }
        checkedCount++
      }
    }

    return new Response(JSON.stringify({ success: true, message: `Đã kiểm tra và xử lý ${checkedCount} thẻ treo` }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error("Lỗi Cronjob thẻ:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
