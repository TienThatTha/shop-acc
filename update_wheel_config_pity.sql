-- =============================================================================
-- CẬP NHẬT HỆ THỐNG VÒNG QUAY MAY MẮN (VQMM): MỐC NỔ BẢO HIỂM ĐỘNG TỪ ADMIN PANEL
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào SQL Editor trên Supabase Dashboard và bấm RUN
-- =============================================================================

-- 1. Đảm bảo bảng site_config có cấu hình wheel_config
INSERT INTO public.site_config (id, value)
VALUES (
    'wheel_config',
    jsonb_build_object(
        'status', 'active',
        'startTime', '2026-10-15T00:00:00+07:00',
        'endTime', '2026-10-31T23:59:59+07:00',
        'pityTarget', 120,
        'moneyCost', 20000,
        'spinCost', 1,
        'ticketPrice', 20000,
        'ticketSaleEnabled', true
    )
)
ON CONFLICT (id) DO UPDATE
SET value = public.site_config.value || EXCLUDED.value;

-- 2. Cập nhật hàm m_spin_wheel (Quay x1): Tự động đọc mốc nổ bảo hiểm từ site_config
CREATE OR REPLACE FUNCTION public.m_spin_wheel(
    khach_id text,
    p_wheel_type text,
    p_cost numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user record;
    v_total_rate numeric := 0;
    v_rand numeric;
    v_cumulative numeric := 0;
    v_winner record;
    v_new_balance numeric;
    v_new_spins numeric;
    v_new_fund numeric;
    v_tx_id text;
    v_now text;
    v_item_rate numeric;
    v_item record;
    v_shoes_item record;
    v_curr_pity integer := 0;
    v_new_pity integer := 0;
    v_is_pity_trigger boolean := false;
    v_is_shoes boolean := false;
    v_pity_target integer := 120;
    v_w_config jsonb;
BEGIN
    -- 1. Lấy thông tin người dùng và khóa dòng
    SELECT * INTO v_user FROM users WHERE id = khach_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Người dùng không tồn tại!');
    END IF;

    -- 2. Kiểm tra số dư / lượt quay
    IF p_wheel_type = 'money' THEN
        IF v_user.balance < p_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Số dư không đủ để quay!');
        END IF;
        IF p_cost <= 0 THEN
            RETURN jsonb_build_object('success', false, 'message', 'Chi phí quay không hợp lệ!');
        END IF;
    ELSE
        IF COALESCE(v_user.spins, 0) < p_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Bạn không có đủ lượt quay!');
        END IF;
    END IF;

    -- Đọc mức bảo hiểm hiện tại của khách
    v_curr_pity := COALESCE(v_user.shoes_pity, 0);

    -- Đọc mốc bảo hiểm từ cấu hình site_config (Admin thiết lập trên web)
    BEGIN
        SELECT value INTO v_w_config FROM public.site_config WHERE id = 'wheel_config';
        IF v_w_config IS NOT NULL AND (v_w_config->>'pityTarget') IS NOT NULL THEN
            v_pity_target := GREATEST(1, (v_w_config->>'pityTarget')::integer);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_pity_target := 120;
    END;

    -- 3. KIỂM TRA BẢO HIỂM CHO VÒNG QUAY LƯỢT:
    -- Nếu p_wheel_type = 'spin' và người dùng đã tích lũy đủ mốc bảo hiểm không ra giày (v_curr_pity >= v_pity_target)
    -- Thì lần quay tiếp theo CHẮC CHẮN 100% kích hoạt bảo hiểm trúng Giày Huyền Thoại!
    IF p_wheel_type = 'spin' AND v_curr_pity >= v_pity_target THEN
        SELECT * INTO v_shoes_item FROM wheel_items
        WHERE wheel_type = 'spin'
          AND (quantity IS NULL OR quantity > 0)
          AND (
              type = 'game_shoes_legendary'
              OR lower(name) LIKE '%giày huyền thoại%'
              OR lower(name) LIKE '%giày thần tốc%'
          )
        ORDER BY id ASC LIMIT 1;

        IF v_shoes_item IS NOT NULL THEN
            v_winner := v_shoes_item;
            v_is_pity_trigger := true;
            v_is_shoes := true;
        END IF;
    END IF;

    -- Nếu chưa kích hoạt bảo hiểm, quay ngẫu nhiên theo tỉ lệ admin cài đặt
    IF v_winner IS NULL THEN
        SELECT SUM(CAST(REPLACE(REPLACE(rate::text, '%', ''), ',', '.') AS numeric))
        INTO v_total_rate
        FROM wheel_items
        WHERE wheel_type = p_wheel_type
          AND (quantity IS NULL OR quantity > 0);

        IF v_total_rate IS NULL OR v_total_rate <= 0 THEN
            RETURN jsonb_build_object('success', false, 'message', 'Không có phần thưởng nào khả dụng!');
        END IF;

        v_rand := random() * v_total_rate;

        FOR v_item IN
            SELECT * FROM wheel_items
            WHERE wheel_type = p_wheel_type
              AND (quantity IS NULL OR quantity > 0)
            ORDER BY id
        LOOP
            v_item_rate := CAST(REPLACE(REPLACE(v_item.rate::text, '%', ''), ',', '.') AS numeric);
            v_cumulative := v_cumulative + v_item_rate;
            IF v_rand <= v_cumulative THEN
                v_winner := v_item;
                EXIT;
            END IF;
        END LOOP;

        IF v_winner IS NULL THEN
            SELECT * INTO v_winner FROM wheel_items
            WHERE wheel_type = p_wheel_type
              AND (quantity IS NULL OR quantity > 0)
            ORDER BY id DESC LIMIT 1;
        END IF;

        IF v_winner.type = 'game_shoes_legendary'
           OR lower(v_winner.name) LIKE '%giày huyền thoại%'
           OR lower(v_winner.name) LIKE '%giày thần tốc%' THEN
            v_is_shoes := true;
        END IF;
    END IF;

    -- 4. Tính số dư mới
    v_new_balance := v_user.balance;
    v_new_spins := COALESCE(v_user.spins, 0);
    v_new_fund := COALESCE(v_user."rentFund", 0);

    IF p_wheel_type = 'money' THEN
        v_new_balance := v_new_balance - p_cost;
    ELSE
        v_new_spins := v_new_spins - p_cost;
    END IF;

    IF v_winner.type = 'money' THEN
        v_new_balance := v_new_balance + COALESCE(v_winner.value, 0);
    ELSIF v_winner.type = 'spin' THEN
        v_new_spins := v_new_spins + COALESCE(v_winner.value, 0);
    ELSIF v_winner.type = 'fund' THEN
        v_new_fund := v_new_fund + COALESCE(v_winner.value, 0);
    END IF;

    IF v_winner.quantity IS NOT NULL THEN
        UPDATE wheel_items SET quantity = quantity - 1 WHERE id = v_winner.id;
    END IF;

    -- 5. Cập nhật chỉ số Pity:
    IF p_wheel_type = 'spin' THEN
        IF v_is_shoes THEN
            v_new_pity := 0;
        ELSE
            v_new_pity := v_curr_pity + 1;
        END IF;
    ELSE
        v_new_pity := v_curr_pity;
    END IF;

    UPDATE users
    SET balance = v_new_balance,
        spins = v_new_spins,
        "rentFund" = v_new_fund,
        shoes_pity = v_new_pity
    WHERE id = khach_id;

    -- 6. Ghi lịch sử giao dịch
    v_now := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI:SS');
    v_tx_id := 'SPIN_' || floor(extract(epoch from now()) * 1000)::text;

    INSERT INTO transactions (
        id, user_id, action, amount, status, date, type, wheel_type, item_id, item_name, item_value, item_type
    ) VALUES (
        v_tx_id,
        khach_id,
        'Trúng phần thưởng: ' || v_winner.name,
        CASE
            WHEN v_winner.type = 'money' THEN COALESCE(v_winner.value, 0)
            WHEN v_winner.type = 'spin' THEN COALESCE(v_winner.value, 0)
            ELSE 0
        END,
        'success',
        v_now,
        'spin',
        p_wheel_type,
        v_winner.id,
        v_winner.name,
        v_winner.value,
        v_winner.type
    );

    RETURN jsonb_build_object(
        'success', true,
        'item_id', v_winner.id,
        'item_name', v_winner.name,
        'item_type', v_winner.type,
        'item_value', v_winner.value,
        'item_image', v_winner.image,
        'item_color', v_winner.color,
        'new_balance', v_new_balance,
        'new_spins', v_new_spins,
        'new_fund', v_new_fund,
        'shoes_pity', v_new_pity,
        'is_shoes', v_is_shoes,
        'is_pity_trigger', v_is_pity_trigger,
        'pity_target', v_pity_target
    );
END;
$$;
