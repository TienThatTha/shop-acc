-- =============================================================================
-- THIẾT KẾ VÉ QUAY & CỬA HÀNG BÁN VÉ QUAY VÒNG QUAY MAY MẮN
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào mục SQL Editor trên Supabase Dashboard và bấm RUN
-- =============================================================================

-- 1. Đảm bảo bảng users có cột spins
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spins numeric DEFAULT 0;

-- 2. Đảm bảo bảng site_config tồn tại để lưu cấu hình Vòng Quay & Giá Vé
CREATE TABLE IF NOT EXISTS public.site_config (
    id text PRIMARY KEY,
    value jsonb,
    updated_at timestamptz DEFAULT now()
);

-- Khởi tạo cấu hình mặc định cho Vòng Quay & Giá Vé Quay
INSERT INTO public.site_config (id, value)
VALUES (
    'wheel_config',
    '{"moneyCost": 20000, "spinCost": 1, "ticketPrice": 20000, "ticketSaleEnabled": true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. Tạo hàm RPC Mua Vé Quay an toàn, khóa dòng chống gian lận
CREATE OR REPLACE FUNCTION public.m_buy_spin_tickets(
    p_user_id text,
    p_quantity integer,
    p_unit_price numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user record;
    v_total_cost numeric;
    v_new_balance numeric;
    v_new_spins numeric;
    v_tx_id text;
    v_now text;
BEGIN
    -- 1. Kiểm tra tham số đầu vào
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Số lượng vé mua phải lớn hơn 0!');
    END IF;

    IF p_unit_price <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Giá vé không hợp lệ!');
    END IF;

    v_total_cost := p_quantity * p_unit_price;

    -- 2. Lấy thông tin người dùng và khóa dòng FOR UPDATE
    SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Tài khoản người dùng không tồn tại!');
    END IF;

    -- 3. Kiểm tra số dư ví
    IF COALESCE(v_user.balance, 0) < v_total_cost THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Số dư tài khoản không đủ để mua vé! Vui lòng nạp thêm tiền.'
        );
    END IF;

    -- 4. Trừ tiền ví và cộng lượt quay
    v_new_balance := v_user.balance - v_total_cost;
    v_new_spins := COALESCE(v_user.spins, 0) + p_quantity;

    UPDATE users 
    SET balance = v_new_balance,
        spins = v_new_spins
    WHERE id = p_user_id;

    -- 5. Ghi lịch sử giao dịch
    v_tx_id := 'TX_TICKET_' || floor(extract(epoch from now()) * 1000)::text;
    v_now := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');

    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
    VALUES (
        v_tx_id,
        v_user.name,
        'Mua ' || p_quantity || ' Vé Quay Vòng Quay (+' || p_quantity || ' lượt quay)',
        v_total_cost,
        v_now,
        'Đã hoàn tất',
        'buy_spin_tickets',
        false
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Mua thành công ' || p_quantity || ' vé quay!',
        'new_balance', v_new_balance,
        'new_spins', v_new_spins,
        'quantity', p_quantity,
        'total_cost', v_total_cost
    );
END;
$$;
