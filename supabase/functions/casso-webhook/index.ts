import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Khởi tạo Supabase Admin Client để có quyền by-pass RLS (ghi thẳng vào DB)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    // 1. Lấy dữ liệu từ Casso bắn về
    const payload = await req.json()
    
    // Casso gửi dữ liệu trong mảng data
    if (!payload.data || payload.data.length === 0) {
      return new Response("No data", { status: 200 })
    }

    const transaction = payload.data[0]
    const description = transaction.description.toUpperCase()
    const amount = transaction.amount

    // 2. Lọc ra Số điện thoại từ nội dung chuyển khoản (Cú pháp: NAP [SĐT])
    // Sử dụng Regex để tìm chuỗi số sau chữ NAP
    const match = description.match(/NAP\s+(\d+)/)
    
    if (match && match[1]) {
      const userPhone = match[1]

      // 3. Tìm User trong hệ thống dựa vào Số điện thoại
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone', userPhone)
        .single()

      if (user && !userError) {
        // 4. Tính toán tiền và Lượt quay thưởng (Dựa vào logic hiện tại của bạn)
        // Lưu ý: Bạn cần cấu hình cứng hoặc query bảng config để lấy minAmount nạp tặng lượt
        const newBalance = user.balance + amount
        
        // 5. Cập nhật Số dư
        await supabaseAdmin
          .from('users')
          .update({ balance: newBalance })
          .eq('id', user.id)

        // 6. Ghi Lịch sử giao dịch (transactions)
        await supabaseAdmin.from('transactions').insert([{
          id: `TX_AUTO_${Date.now()}`,
          user: user.name,
          action: `Nạp tự động qua TPBank`,
          amount: amount,
          date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
          status: 'Thành công',
          type: 'deposit_auto',
          accDetails: { balanceAfter: newBalance, fundAfter: user.rentFund || 0 }
        }])

        // 7. Cập nhật trạng thái lệnh nạp (nếu khách có tạo lệnh chờ)
        // Tìm lệnh chờ duyệt gần nhất của user này
        const { data: pendingReq } = await supabaseAdmin
          .from('deposit_requests')
          .select('*')
          .eq('userId', user.id)
          .eq('status', 'Chờ duyệt')
          .order('id', { ascending: false })
          .limit(1)

        if (pendingReq && pendingReq.length > 0) {
           await supabaseAdmin
            .from('deposit_requests')
            .update({ status: 'Thành công' })
            .eq('id', pendingReq[0].id)
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error) {
    console.error("Lỗi Webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})