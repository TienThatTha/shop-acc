-- ==============================================================================
-- SQL RPC: Mua Vé Quay Vòng Quay (Trừ tiền ví + Cộng lượt quay an toàn & chuẩn xác)
-- ==============================================================================

CREATE OR REPLACE FUNCTION m_buy_spin_tickets(
    p_user_id UUID,
    p_quantity INT,
    p_unit_price INT DEFAULT 20000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_total_cost BIGINT;
    v_new_balance BIGINT;
    v_new_spins BIGINT;
    v_tx_id TEXT;
    v_date_str TEXT;
BEGIN
    IF p_quantity <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Số lượng vé phải lớn hơn 0');
    END IF;

    IF p_unit_price < 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Đơn giá không hợp lệ');
    END IF;

    v_total_cost := (p_quantity::BIGINT) * (p_unit_price::BIGINT);

    -- Khóa hàng user để chống race condition
    SELECT * INTO v_user
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy tài khoản người dùng');
    END IF;

    IF COALESCE(v_user.balance, 0) < v_total_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Số dư ví không đủ để mua vé',
            'required', v_total_cost,
            'current_balance', COALESCE(v_user.balance, 0)
        );
    END IF;

    v_new_balance := COALESCE(v_user.balance, 0) - v_total_cost;
    v_new_spins := COALESCE(v_user.spins, 0) + p_quantity;

    -- Cập nhật số dư & lượt quay
    UPDATE users
    SET balance = v_new_balance,
        spins = v_new_spins
    WHERE id = p_user_id;

    -- Tạo lịch sử giao dịch
    v_tx_id := 'TX_TICKET_' || floor(extract(epoch from now()) * 1000)::text || '_' || substr(md5(random()::text), 1, 4);
    v_date_str := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI:SS');

    INSERT INTO transactions (id, "user", action, amount, date, status, type, "isSpinCost")
    VALUES (
        v_tx_id,
        COALESCE(v_user.name, 'Khách hàng'),
        'Mua ' || p_quantity || ' Vé Quay Vòng Quay (+' || p_quantity || ' lượt quay)',
        v_total_cost,
        v_date_str,
        'Đã hoàn tất',
        'buy_spin_tickets',
        false
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Mua ' || p_quantity || ' vé quay thành công!',
        'new_balance', v_new_balance,
        'new_spins', v_new_spins,
        'quantity', p_quantity,
        'total_cost', v_total_cost
    );
END;
$$;
